/* ============================================================================
   vues/fenetre-score.js — Écran 4.4 : saisie d'un score, et 4.5 : historique.
   ----------------------------------------------------------------------------
   Même gabarit que la capture 03 :
     - grille haute  = historique des évaluations de ce score pour ce patient,
                       la ligne en cours de saisie en tête et en gras ;
     - courbe        = évolution dans le temps, sous la grille ;
     - zone basse    = le formulaire du score ;
     - encadré droit = le résultat, à l'emplacement exact de l'encadré
                       « Liste des ttt prescrits… ».

   Deux garde-fous cliniques :
     - éligibilité : un bandeau bloquant explique pourquoi le score ne
       s'applique pas et cite l'échelle alternative. Les items restent
       saisissables, le résultat n'est pas présenté comme exploitable ;
     - alerte d'item : bandeau non masquable dès que la condition déclarée dans
       la définition est remplie.

   Clavier : Tab traverse les items, les touches 0-9 cotent l'item focalisé et
   passent au suivant, Ctrl+S enregistre, Entrée déclenche le bouton par défaut,
   Échap ferme.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.vues = window.XMed.vues || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;
  var outils = XMed.outils;
  var moteur = XMed.moteur;

  var EVALUATEUR = 'ANEX Matthieu';

  /**
   * @param {{dossier, definition, episode}} options
   */
  function ouvrir(options) {
    var definition = options.definition;
    var abaque = definition.calcul && definition.calcul.abaque
      ? XMed.donnees.abaque(definition.calcul.abaque) : null;

    var erreurs = moteur.valider(definition, abaque);

    XMed.store.evaluations(options.dossier.id(), definition.id).then(function (evaluations) {
      rendre(options, abaque, erreurs, evaluations);
    });
  }

  function rendre(options, abaque, erreursDefinition, evaluations) {
    var definition = options.definition;
    var dossier = options.dossier;

    var etat = {
      valeurs: {},
      sources: {},
      reponses: {},
      date: outils.versIso(outils.aujourdhui()),
      notes: '',
      evaluations: evaluations,
      evaluationRelue: null,
      lectureSeule: false
    };

    /* --- Pré-remplissage ---------------------------------------------------- */

    var resolutions = moteur.prerempli(definition, dossier);
    Object.keys(resolutions).forEach(function (itemId) {
      var r = resolutions[itemId];
      var item = moteur.itemsParId(definition)[itemId];
      etat.valeurs[itemId] = item && item.decimales !== null && item.decimales !== undefined
        ? outils.arrondir(r.valeur, item.decimales)
        : r.valeur;
      etat.sources[itemId] = {
        auto: true,
        type: r.type,
        libelleSource: r.libelleSource,
        dateSource: r.dateSource,
        valeurSource: r.valeurSource,
        uniteSource: r.uniteSource,
        conversion: r.conversion,
        confiance: r.confiance,
        anormal: r.anormal,
        description: XMed.resolveurs.descriptionSource(r, item ? item.decimales : 2)
      };
    });
    etat.valeurs = moteur.recalculer(definition, etat.valeurs);

    /* --- Fenêtre ------------------------------------------------------------ */

    var fenetre = ui.fenetre({
      titre: definition.acronyme + ' — ' + definition.libelle,
      largeur: 1100
    });

    var zoneHistorique = el('div');
    var zoneCourbe = el('div');
    var detail = el('div', { class: 'xm-detail' });

    fenetre.principal.appendChild(zoneHistorique);
    fenetre.principal.appendChild(zoneCourbe);
    fenetre.principal.appendChild(detail);

    /* --- Éléments reconstruits à chaque rafraîchissement --------------------- */

    var zoneBandeaux = el('div', { class: 'xm-bandeaux' });
    var zoneItems = el('div', { class: 'xm-items' });
    var noeudsMention = {};
    var noeudsValeur = {};
    var champsSaisie = {};

    /* --- Entête du formulaire ----------------------------------------------- */

    var champDate = el('input', {
      class: 'xm-champ xm-champ--date', value: outils.dateFr(etat.date),
      onchange: function (ev) {
        var iso = outils.isoDepuisFr(ev.target.value);
        if (!iso) { ev.target.value = outils.dateFr(etat.date); return; }
        etat.date = iso;
        rafraichir();
      }
    });

    detail.appendChild(el('div', { class: 'xm-ligne xm-entete-score' }, [
      el('span', { class: 'est-gras', texte: definition.acronyme }),
      el('span', { class: 'xm-mention', texte: definition.libelle }),
      el('span', { class: 'xm-espaceur' }),
      el('span', { class: 'xm-libelle', texte: 'Épisode :' }),
      el('span', { class: 'xm-valeur-lecture',
                   texte: options.episode
                     ? options.episode.libelle +
                       (options.episode.cim10 ? ' (' + options.episode.cim10 + ')' : '')
                     : 'aucun — score de dépistage' }),
      el('span', { class: 'xm-libelle', texte: 'Date :' }),
      champDate,
      el('span', { class: 'xm-libelle', texte: 'Évaluateur :' }),
      el('span', { class: 'xm-valeur-lecture', texte: EVALUATEUR })
    ]));

    if (definition.consigne) {
      detail.appendChild(el('div', { class: 'xm-consigne', texte: definition.consigne }));
    }

    detail.appendChild(zoneBandeaux);
    detail.appendChild(zoneItems);
    detail.appendChild(el('div', { class: 'xm-ligne' },
      el('span', { class: 'xm-libelle', texte: 'Notes :' })));

    var champNotes = el('textarea', {
      class: 'xm-zone-notes', rows: '2',
      oninput: function (ev) { etat.notes = ev.target.value; }
    });
    detail.appendChild(champNotes);

    construireItems();

    /* --- Encadré de résultat ------------------------------------------------- */

    var encadreResultat = el('div', { class: 'xm-resultat' });

    /* ========================================================================
       Construction des items
       ======================================================================== */

    function construireItems() {
      ui.vider(zoneItems);
      noeudsMention = {}; noeudsValeur = {}; champsSaisie = {};

      (definition.items || []).forEach(function (item, index) {
        var mention = el('span', { class: 'xm-item__mention' });
        noeudsMention[item.id] = mention;

        var cotation = el('span', { class: 'xm-item__cotation' });
        var focalisable = item.type === 'ordinal' || item.type === 'enumere' ||
                          item.type === 'booleen';

        var ligne = el('div', {
          class: 'xm-item',
          tabindex: focalisable ? '0' : null,
          'data-item': item.id
        }, [
          el('span', { class: 'xm-item__numero', texte: String(item.numero) }),
          el('span', { class: 'xm-item__intitule' }, [
            item.intitule,
            item.aide ? el('span', { class: 'xm-mention', texte: '  ' + item.aide }) : null
          ]),
          mention,
          cotation
        ]);

        if (focalisable) {
          construireModalites(item, cotation, ligne);
          ligne.addEventListener('keydown', function (ev) {
            gererToucheCotation(ev, item, index);
          });
          ligne.addEventListener('focus', function () { ligne.classList.add('a-le-focus'); });
          ligne.addEventListener('blur', function () { ligne.classList.remove('a-le-focus'); });
        } else if (item.type === 'numerique') {
          construireNumerique(item, cotation);
        } else if (item.type === 'calcule') {
          construireCalcule(item, cotation);
        }

        zoneItems.appendChild(ligne);
      });
    }

    function construireModalites(item, conteneur, ligne) {
      var modalites = moteur.modalitesDe(definition, item) || [];
      modalites.forEach(function (m) {
        var entree = el('input', {
          type: 'radio', name: 'it-' + item.id, tabindex: '-1',
          onchange: function () { definirValeur(item, m.valeur, true); }
        });
        champsSaisie[item.id + '::' + String(m.valeur)] = entree;
        conteneur.appendChild(el('label', { class: 'xm-option' }, [
          entree,
          (typeof m.valeur === 'number' ? m.valeur + ' ' : '') + m.libelle
        ]));
      });
      // Clic n'importe où sur la ligne : on focalise, pour enchaîner au clavier.
      ligne.addEventListener('click', function () { ligne.focus(); });
    }

    function construireNumerique(item, conteneur) {
      var champ = el('input', {
        class: 'xm-champ xm-champ--nombre', style: { width: '72px' },
        onchange: function (ev) {
          var n = outils.versNombre(ev.target.value);
          if (n === null) { definirValeur(item, null, true); return; }
          if ((item.min !== null && item.min !== undefined && n < item.min) ||
              (item.max !== null && item.max !== undefined && n > item.max)) {
            // Hors bornes de plausibilité : refusé, jamais corrigé en silence.
            afficherRefus(item, n);
            ev.target.value = formaterValeurItem(item, etat.valeurs[item.id]);
            return;
          }
          definirValeur(item, n, true);
        }
      });
      champsSaisie[item.id] = champ;

      conteneur.appendChild(champ);
      if (item.unite) {
        conteneur.appendChild(el('span', { class: 'xm-libelle', texte: item.unite }));
      }

      // Saisie possible dans une autre unité, avec conversion affichée.
      (item.unitesAcceptees || []).forEach(function (u) {
        var champAutre = el('input', {
          class: 'xm-champ xm-champ--nombre', style: { width: '64px' },
          title: 'Saisie en ' + u.unite + ', convertie en ' + u.vers,
          onchange: function (ev) {
            var n = outils.versNombre(ev.target.value);
            if (n === null) { return; }
            definirValeur(item, outils.arrondir(n * u.facteur, item.decimales || 2), true);
            ev.target.value = '';
          }
        });
        conteneur.appendChild(el('span', { class: 'xm-mention', texte: 'ou' }));
        conteneur.appendChild(champAutre);
        conteneur.appendChild(el('span', { class: 'xm-libelle', texte: u.unite }));
      });

      var detailSource = el('span', { class: 'xm-mention xm-item__source' });
      noeudsValeur[item.id + '::source'] = detailSource;
      conteneur.appendChild(detailSource);
    }

    function construireCalcule(item, conteneur) {
      var affichage = el('span', { class: 'xm-valeur-calculee' });
      noeudsValeur[item.id] = affichage;
      conteneur.appendChild(affichage);
      if (item.unite) {
        conteneur.appendChild(el('span', { class: 'xm-libelle', texte: item.unite }));
      }
      conteneur.appendChild(el('span', { class: 'xm-mention', texte: 'calculé' }));
    }

    function afficherRefus(item, valeur) {
      ui.confirmer('Valeur hors bornes',
        item.intitule + ' : ' + valeur + (item.unite ? ' ' + item.unite : '') +
        ' est hors des bornes de plausibilité (' + item.min + ' à ' + item.max +
        (item.unite ? ' ' + item.unite : '') + '). La valeur n\'a pas été retenue.',
        'Fermer');
    }

    /* --- Cotation au clavier -------------------------------------------------
       Sur un item focalisé, les touches 0-9 cotent et avancent à l'item
       suivant. C'est le geste central : le médecin cote pendant la consultation.
       ------------------------------------------------------------------------ */

    function gererToucheCotation(evenement, item, index) {
      if (evenement.ctrlKey || evenement.altKey || evenement.metaKey) { return; }
      if (!/^[0-9]$/.test(evenement.key)) { return; }

      var modalites = moteur.modalitesDe(definition, item) || [];
      var chiffre = Number(evenement.key);

      var choisie = modalites.filter(function (m) { return m.valeur === chiffre; })[0];
      if (!choisie && chiffre >= 1 && chiffre <= modalites.length) {
        choisie = modalites[chiffre - 1];
      }
      if (!choisie) { return; }

      evenement.preventDefault();
      definirValeur(item, choisie.valeur, true);
      focaliserItem(index + 1);
    }

    function focaliserItem(index) {
      var lignes = zoneItems.querySelectorAll('.xm-item[tabindex]');
      for (var i = index; i < (definition.items || []).length; i++) {
        var cible = zoneItems.querySelector('.xm-item[data-item="' + definition.items[i].id + '"]');
        if (cible && cible.hasAttribute('tabindex')) { cible.focus(); return; }
        var champ = champsSaisie[definition.items[i].id];
        if (champ) { champ.focus(); return; }
      }
      if (lignes.length) { /* dernier item : on reste dessus */ }
    }

    /* --- Modification d'une valeur ------------------------------------------- */

    function definirValeur(item, valeur, manuel) {
      if (etat.lectureSeule) { return; }
      etat.valeurs[item.id] = valeur;

      // Une reprise manuelle fait passer la mention de « Auto » à « Modifié »,
      // et l'origine reste consultable.
      if (manuel && etat.sources[item.id]) { etat.sources[item.id].auto = false; }

      etat.valeurs = moteur.recalculer(definition, etat.valeurs);
      rafraichir();
    }

    /* ========================================================================
       Rafraîchissement
       ======================================================================== */

    function rafraichir() {
      refletValeurs();
      refletMentions();
      var eligibilite = moteur.eligibilite(definition, dossier, etat.reponses);
      refletBandeaux(eligibilite);
      refletResultat(eligibilite);
      refletBoutons();
      refletHistorique();
    }

    function refletValeurs() {
      (definition.items || []).forEach(function (item) {
        var valeur = etat.valeurs[item.id];

        if (item.type === 'calcule') {
          var noeud = noeudsValeur[item.id];
          if (noeud) {
            noeud.textContent = moteur.estVide(valeur)
              ? '—' : formaterValeurItem(item, valeur);
            noeud.className = 'xm-valeur-calculee' +
              (moteur.estVide(valeur) ? ' est-attenue' : '');
          }
          return;
        }

        if (item.type === 'numerique') {
          var champ = champsSaisie[item.id];
          if (champ && document.activeElement !== champ) {
            champ.value = formaterValeurItem(item, valeur);
          }
          var source = etat.sources[item.id];
          if (champ) {
            champ.classList.toggle('est-alerte', !!(source && source.anormal));
          }
          var detailSource = noeudsValeur[item.id + '::source'];
          if (detailSource) {
            detailSource.textContent = source ? resumeSource(source, item) : '';
            detailSource.className = 'xm-mention xm-item__source' +
              (source && source.confiance === 'vetuste' ? ' xm-mention--vetuste' : '') +
              (source && source.anormal ? ' est-alerte' : '');
          }
          return;
        }

        var cle = item.id + '::' + String(valeur);
        var modalites = moteur.modalitesDe(definition, item) || [];
        modalites.forEach(function (m) {
          var entree = champsSaisie[item.id + '::' + String(m.valeur)];
          if (entree) { entree.checked = (item.id + '::' + String(m.valeur)) === cle; }
        });
      });
    }

    function refletMentions() {
      (definition.items || []).forEach(function (item) {
        var noeud = noeudsMention[item.id];
        if (!noeud) { return; }
        var source = etat.sources[item.id];
        ui.vider(noeud);
        noeud.className = 'xm-item__mention';
        if (!source) { return; }

        var libelle = source.auto ? 'Auto' : 'Modifié';
        var etiquette = el('span', {
          class: 'xm-mention ' + (source.auto ? 'xm-mention--auto' : 'xm-mention--modifie'),
          texte: libelle, tabindex: '0'
        });
        ui.infobulle(etiquette, source.description +
          (source.auto ? '' : '\nValeur reprise à la main ; origine conservée.'));
        noeud.appendChild(etiquette);
      });
    }

    function resumeSource(source, item) {
      var morceaux = [];
      if (source.conversion) {
        morceaux.push(outils.nombre(source.valeurSource, 2) + ' ' + source.uniteSource +
                      ' → ' + outils.nombre(source.valeurSource * source.conversion.facteur,
                                            item.decimales || 2) + ' ' + source.conversion.vers);
      }
      if (source.dateSource) { morceaux.push(outils.dateFr(source.dateSource)); }
      if (source.confiance === 'vetuste') {
        morceaux.push('donnée ancienne, ' + outils.anciennete(source.dateSource));
      }
      return morceaux.join(' — ');
    }

    /* --- Bandeaux ------------------------------------------------------------ */

    function refletBandeaux(eligibilite) {
      ui.vider(zoneBandeaux);

      if (erreursDefinition.length) {
        zoneBandeaux.appendChild(ui.bandeau('bloquant', 'Définition incohérente',
          erreursDefinition.join(' ')));
      }

      if (etat.lectureSeule && etat.evaluationRelue) {
        zoneBandeaux.appendChild(ui.bandeau('info', 'Lecture seule',
          'Évaluation du ' + outils.dateFr(etat.evaluationRelue.date) +
          ', enregistrée par ' + (etat.evaluationRelue.evaluateur || '—') + '.',
          [{ libelle: 'Revenir à la saisie en cours', action: quitterLectureSeule }]));
      }

      // Garde-fou 1 : éligibilité.
      eligibilite.bloquantes.forEach(function (b) {
        var texte = b.regle.message;
        if (b.resolution && b.resolution.libelleSource) {
          texte += ' (' + b.resolution.libelleSource + ')';
        }
        if (b.regle.orientation) {
          texte += ' Échelle indiquée : ' + b.regle.orientation.libelle +
                   (b.regle.orientation.disponible ? '' : ' — non implémentée dans cette maquette') + '.';
        }
        texte += ' Les items restent saisissables ; le résultat n\'est pas exploitable.';
        zoneBandeaux.appendChild(ui.bandeau('bloquant', 'Score non applicable', texte));
      });

      eligibilite.avertissements.forEach(function (a) {
        zoneBandeaux.appendChild(ui.bandeau('avertissement', 'Attention', a.regle.message));
      });

      // Questions posées au clinicien : rien n'est déduit à sa place.
      if (eligibilite.questions.length) {
        var questions = el('span');
        eligibilite.questions.forEach(function (q, i) {
          if (i) { questions.appendChild(document.createTextNode('   ')); }
          questions.appendChild(document.createTextNode(q.libelle + ' '));
          [['Oui', true], ['Non', false]].forEach(function (paire) {
            var entree = el('input', {
              type: 'radio', name: 'elig-' + q.regle.id,
              checked: etat.reponses[q.regle.id] === paire[1] ? true : null,
              onchange: function () { etat.reponses[q.regle.id] = paire[1]; rafraichir(); }
            });
            questions.appendChild(el('label', { class: 'xm-option' }, [entree, paire[0]]));
          });
        });
        zoneBandeaux.appendChild(ui.bandeau('info', 'À confirmer', questions));
      }

      // Pré-remplissage.
      var auto = Object.keys(etat.sources).filter(function (id) { return etat.sources[id].auto; });
      if (auto.length) {
        zoneBandeaux.appendChild(ui.bandeau('info', 'Pré-remplissage',
          auto.length + ' item' + (auto.length > 1 ? 's renseignés' : ' renseigné') +
          ' depuis le dossier patient.',
          [
            { libelle: 'Voir les sources', action: montrerSources },
            { libelle: 'Tout déverrouiller', action: toutDeverrouiller }
          ]));
      }

      // Garde-fou 2 : alertes d'item, non masquables.
      moteur.alertes(definition, etat.valeurs).forEach(function (a) {
        zoneBandeaux.appendChild(ui.bandeau(
          a.alerte.severite === 'bloquant' ? 'bloquant' : 'avertissement',
          'Item ' + a.item.numero + ' coté ' + a.valeur,
          a.alerte.message));
      });

      // Ce qui reste à valider diffère d'un score à l'autre : le fichier de
      // définition porte lui-même la raison, plutôt qu'un texte générique faux.
      if (definition.statut !== 'valide') {
        zoneBandeaux.appendChild(ui.bandeau('avertissement', 'Définition à valider',
          definition.noteStatut ||
          'Cette définition de score n\'a pas encore été validée par le médecin.'));
      }
    }

    function montrerSources() {
      var f = ui.fenetre({ titre: 'Sources du pré-remplissage', largeur: 640 });
      var index = moteur.itemsParId(definition);
      var lignes = Object.keys(etat.sources).map(function (id) {
        var s = etat.sources[id];
        return {
          item: index[id] ? index[id].intitule : id,
          etat: s.auto ? 'Auto' : 'Modifié',
          source: s.libelleSource,
          date: s.dateSource
        };
      });
      f.principal.appendChild(ui.grille({
        bandeauGroupe: false, hauteur: '220px', vide: 'Aucune source',
        colonnes: [
          { cle: 'item', libelle: 'Item', largeur: '190px' },
          { cle: 'etat', libelle: 'État', largeur: '70px',
            classe: function (l) { return l.etat === 'Auto' ? 'est-valide' : null; } },
          { cle: 'source', libelle: 'Origine' },
          { cle: 'date', libelle: 'Date', largeur: '82px',
            rendu: function (l) { return outils.dateFr(l.date); } }
        ],
        lignes: lignes
      }).racine);
      ui.blocsBoutons(f.colonneBoutons, [[
        { libelle: 'Fermer', defaut: true, action: function () { ui.detacher(f); } }
      ]]);
    }

    function toutDeverrouiller() {
      Object.keys(etat.sources).forEach(function (id) { etat.sources[id].auto = false; });
      rafraichir();
    }

    /* --- Résultat ------------------------------------------------------------ */

    function refletResultat(eligibilite) {
      ui.vider(encadreResultat);
      encadreResultat.className = 'xm-resultat';

      var resultat = moteur.calculer(definition, etat.valeurs, abaque);
      var etatCompletude = moteur.completude(definition, etat.valeurs);

      // On n'interprète JAMAIS un total partiel. Un questionnaire à moitié coté
      // dont la somme vaut 3 n'est pas une « absence de dépression » : c'est un
      // questionnaire à moitié coté.
      var interpretation = resultat.complet
        ? moteur.interpreter(definition, resultat.valeur, etat.valeurs)
        : null;

      var exploitable = eligibilite.applicable && resultat.complet &&
                        resultat.valeur !== null && !erreursDefinition.length;

      if (resultat.valeur === null || resultat.valeur === undefined) {
        encadreResultat.classList.add('xm-resultat--partiel');
        var titre = resultat.motif === 'abaque incomplet'
          ? 'Abaque non renseigné' : 'Non calculable';
        encadreResultat.appendChild(el('div', {
          class: 'xm-resultat__valeur', style: { fontSize: '18px', lineHeight: '1.3' },
          texte: titre
        }));
        if (resultat.motif && resultat.motif !== 'abaque incomplet') {
          encadreResultat.appendChild(el('div', { class: 'xm-mention', texte: resultat.motif }));
        } else if (resultat.motif === 'abaque incomplet') {
          encadreResultat.appendChild(el('div', { class: 'xm-mention',
            texte: 'La cellule correspondante de ' + definition.calcul.abaque +
                   ' vaut null : aucune valeur n\'a été inventée.' }));
        }
      } else {
        if (!exploitable) { encadreResultat.classList.add('xm-resultat--partiel'); }

        var suffixe = resultat.unite
          ? ' ' + resultat.unite
          : (definition.calcul.max !== undefined ? ' / ' + definition.calcul.max : '');
        encadreResultat.appendChild(el('div', { class: 'xm-resultat__valeur' }, [
          outils.nombre(resultat.valeur, definition.calcul.decimales || 0),
          el('span', { class: 'xm-resultat__max', texte: suffixe })
        ]));

        var jeu = moteur.jeuDeTranches(definition, etat.valeurs);
        if (jeu && jeu.tranches.length) {
          encadreResultat.appendChild(barreInterpretation(jeu.tranches, interpretation));
        }

        var libelleInterpretation;
        if (interpretation) {
          libelleInterpretation = interpretation.libelle;
        } else if (!resultat.complet) {
          libelleInterpretation = 'Saisie en cours';
        } else if (!definition.interpretations) {
          libelleInterpretation = 'Interprétation non renseignée';
        } else {
          libelleInterpretation = 'Interprétation indisponible';
        }
        encadreResultat.appendChild(el('div', {
          class: 'xm-resultat__libelle' +
                 (interpretation ? ' xm-seg-texte--' + interpretation.couleur : ''),
          texte: libelleInterpretation
        }));

        if (interpretation && interpretation.libelleCondition) {
          encadreResultat.appendChild(el('div', { class: 'xm-mention',
            texte: 'seuils : ' + interpretation.libelleCondition }));
        }
      }

      encadreResultat.appendChild(el('div', { class: 'xm-resultat__compteur',
        texte: etatCompletude.renseignes + ' / ' + etatCompletude.requis +
               ' items renseignés' }));

      // L'avis ne répète pas ce que le gros titre dit déjà : quand la valeur est
      // nulle, « Abaque non renseigné » se suffit.
      if (!eligibilite.applicable) {
        encadreResultat.appendChild(el('div', {
          class: 'xm-resultat__avis est-alerte', texte: 'Résultat non exploitable'
        }));
      } else if (resultat.valeur !== null && !resultat.complet) {
        encadreResultat.appendChild(el('div', {
          class: 'xm-resultat__avis est-alerte', texte: 'Résultat partiel'
        }));
      }

      etat.dernierResultat = resultat;
      etat.derniereInterpretation = interpretation;
    }

    function barreInterpretation(tranches, interpretation) {
      var barre = el('div', { class: 'xm-barre-interpretation' });
      tranches.forEach(function (t, i) {
        barre.appendChild(el('span', {
          class: 'xm-barre-interpretation__segment xm-seg--' + (t.couleur || 'neutre'),
          title: t.libelle
        }));
        if (interpretation && interpretation.index === i) {
          barre.appendChild(el('span', {
            class: 'xm-barre-interpretation__curseur',
            style: { left: ((i + 0.5) / tranches.length * 100) + '%' }
          }));
        }
      });
      return barre;
    }

    /* --- Historique et courbe ------------------------------------------------ */

    function refletHistorique() {
      ui.vider(zoneHistorique);
      ui.vider(zoneCourbe);

      var enCours = {
        courante: true,
        date: etat.date,
        resultat: etat.dernierResultat || { valeur: null },
        interpretation: etat.derniereInterpretation,
        evaluateur: EVALUATEUR,
        notes: etat.notes
      };

      var lignes = [enCours].concat(etat.evaluations.map(function (ev) {
        return {
          courante: false, evaluation: ev, date: ev.date,
          resultat: ev.resultat || { valeur: null },
          interpretation: ev.resultat ? { libelle: ev.resultat.interpretation } : null,
          evaluateur: ev.evaluateur, notes: ev.notes
        };
      }));

      var grille = ui.grille({
        hauteur: '132px',
        bandeauGroupe: 'Historique des évaluations de ce score pour ce patient',
        colonnes: [
          { cle: 'date', libelle: 'Date', largeur: '90px',
            classe: function (l) { return l.courante ? 'est-gras' : null; },
            rendu: function (l) {
              return outils.dateFr(l.date) + (l.courante ? '  (en cours)' : '');
            } },
          { cle: 'valeur', libelle: 'Valeur', largeur: '90px', align: 'droite',
            classe: function (l) {
              return (l.resultat.valeur === null ? 'est-attenue ' : '') +
                     (l.courante ? 'est-gras' : '');
            },
            rendu: function (l) {
              if (l.resultat.valeur === null || l.resultat.valeur === undefined) {
                return 'non calculé';
              }
              return outils.nombre(l.resultat.valeur, definition.calcul.decimales || 0) +
                     (l.resultat.unite ? ' ' + l.resultat.unite : '');
            } },
          { cle: 'interpretation', libelle: 'Interprétation',
            classe: function (l) { return l.courante ? 'est-gras' : null; },
            rendu: function (l) {
              return l.interpretation ? (l.interpretation.libelle || '') : '';
            } },
          { cle: 'evaluateur', libelle: 'Évaluateur', largeur: '130px' },
          { cle: 'notes', libelle: 'Notes', largeur: '190px' }
        ],
        lignes: lignes,
        surActivation: function (l) { if (!l.courante) { relire(l.evaluation); } }
      });

      zoneHistorique.appendChild(grille.racine);

      zoneCourbe.appendChild(XMed.vues.courbeHistorique.rendre({
        definition: definition,
        evaluations: etat.evaluations,
        largeur: 860,
        hauteur: 128,
        surPoint: relire
      }));
    }

    function relire(evaluation) {
      if (!evaluation) { return; }
      etat.evaluationRelue = evaluation;
      etat.lectureSeule = true;
      etat.valeurs = JSON.parse(JSON.stringify(evaluation.valeurs || {}));
      etat.sources = JSON.parse(JSON.stringify(evaluation.sources || {}));
      etat.notes = evaluation.notes || '';
      champNotes.value = etat.notes;
      champNotes.readOnly = true;
      zoneItems.classList.add('xm-items--lecture');
      rafraichir();
    }

    function quitterLectureSeule() {
      etat.evaluationRelue = null;
      etat.lectureSeule = false;
      champNotes.readOnly = false;
      zoneItems.classList.remove('xm-items--lecture');
      etat.valeurs = {};
      etat.sources = {};
      Object.keys(resolutions).forEach(function (itemId) {
        etat.valeurs[itemId] = resolutions[itemId].valeur;
        etat.sources[itemId] = { auto: true };
      });
      // On repasse par le pré-remplissage complet pour retrouver les descriptions.
      var nouvelles = moteur.prerempli(definition, dossier);
      etat.sources = {};
      Object.keys(nouvelles).forEach(function (itemId) {
        var r = nouvelles[itemId];
        var item = moteur.itemsParId(definition)[itemId];
        etat.valeurs[itemId] = item && item.decimales !== null && item.decimales !== undefined
          ? outils.arrondir(r.valeur, item.decimales) : r.valeur;
        etat.sources[itemId] = {
          auto: true, type: r.type, libelleSource: r.libelleSource,
          dateSource: r.dateSource, valeurSource: r.valeurSource,
          uniteSource: r.uniteSource, conversion: r.conversion,
          confiance: r.confiance, anormal: r.anormal,
          description: XMed.resolveurs.descriptionSource(r, item ? item.decimales : 2)
        };
      });
      etat.notes = '';
      champNotes.value = '';
      etat.valeurs = moteur.recalculer(definition, etat.valeurs);
      rafraichir();
    }

    /* --- Enregistrement ------------------------------------------------------ */

    function construireEvaluation() {
      var resultat = etat.dernierResultat || { valeur: null };
      var interpretation = etat.derniereInterpretation;
      return {
        id: etat.evaluationRelue ? etat.evaluationRelue.id : null,
        patientId: dossier.id(),
        episodeId: options.episode ? options.episode.id : null,
        scoreId: definition.id,
        versionScore: definition.version,
        date: etat.date,
        evaluateur: EVALUATEUR,
        valeurs: etat.valeurs,
        sources: etat.sources,
        resultat: {
          valeur: resultat.valeur,
          unite: resultat.unite || null,
          motif: resultat.motif || null,
          complet: resultat.complet,
          interpretation: interpretation ? interpretation.libelle : null
        },
        notes: etat.notes
      };
    }

    function enregistrer(puisInserer) {
      if (etat.lectureSeule) {
        ui.confirmer('Lecture seule',
          'Cette évaluation est ouverte en lecture seule. Revenir à la saisie en ' +
          'cours pour enregistrer.', 'Fermer');
        return;
      }
      XMed.store.enregistrer(construireEvaluation()).then(function (enregistree) {
        return XMed.store.evaluations(dossier.id(), definition.id)
          .then(function (liste) {
            etat.evaluations = liste;
            rafraichir();
            if (puisInserer) { montrerObservation(enregistree); }
            else { signaler('Évaluation enregistrée.'); }
          });
      }).catch(function (erreur) {
        ui.confirmer('Enregistrement impossible', erreur.message, 'Fermer');
      });
    }

    function signaler(texte) {
      var bandeau = ui.bandeau('info', 'Enregistré', texte);
      zoneBandeaux.insertBefore(bandeau, zoneBandeaux.firstChild);
      window.setTimeout(function () {
        if (bandeau.parentNode) { bandeau.parentNode.removeChild(bandeau); }
      }, 2500);
    }

    /** Pavé texte prêt à coller dans l'observation du jour. */
    function montrerObservation(evaluation) {
      var texte = moteur.texteObservation(definition, {
        date: evaluation.date,
        evaluateur: evaluation.evaluateur,
        libelleEpisode: options.episode ? options.episode.libelle : null,
        valeurs: etat.valeurs,
        sources: etat.sources,
        resultat: etat.dernierResultat,
        interpretation: etat.derniereInterpretation
      });

      var f = ui.fenetre({ titre: 'Insertion dans l\'observation', largeur: 640 });
      var zone = el('textarea', { class: 'xm-zone-notes', rows: '12',
                                  style: { minHeight: '210px' } }, texte);
      f.principal.appendChild(el('div', { class: 'xm-detail' }, [
        ui.bandeau('info', 'À coller',
          'Texte généré à partir de l\'évaluation enregistrée. Il ne contient aucune ' +
          'conduite à tenir : score, interprétation standardisée, items cotés, sources.'),
        zone
      ]));
      ui.blocsBoutons(f.colonneBoutons, [[
        { libelle: 'Copier', defaut: true, action: function () {
            zone.select();
            try { document.execCommand('copy'); } catch (e) { /* sélection suffit */ }
          } },
        { libelle: 'Fermer', action: function () { ui.detacher(f); } }
      ]]);
      window.setTimeout(function () { zone.select(); }, 0);
    }

    function supprimer() {
      if (!etat.evaluationRelue) { return; }
      ui.confirmer('Supprimer l\'évaluation',
        'Supprimer l\'évaluation du ' + outils.dateFr(etat.evaluationRelue.date) +
        ' ? Cette action est définitive.', 'Supprimer')
        .then(function (ok) {
          if (!ok) { return; }
          return XMed.store.supprimer(etat.evaluationRelue.id).then(function () {
            return XMed.store.evaluations(dossier.id(), definition.id);
          }).then(function (liste) {
            etat.evaluations = liste;
            quitterLectureSeule();
          });
        });
    }

    /* --- Boutons -------------------------------------------------------------- */

    function refletBoutons() {
      ui.blocsBoutons(fenetre.colonneBoutons, [
        [
          { libelle: 'Enregistrer', defaut: true, inactif: etat.lectureSeule,
            action: function () { enregistrer(false); } },
          { libelle: 'Enregistrer et insérer', inactif: etat.lectureSeule,
            titre: 'Enregistrer et produire le pavé texte pour l\'observation',
            action: function () { enregistrer(true); } },
          { libelle: 'Supprimer', inactif: !etat.evaluationRelue, action: supprimer }
        ],
        [
          { libelle: 'Imprimer', action: function () { window.print(); } },
          { libelle: 'Aide', action: montrerAide },
          { libelle: 'Annuler', action: function () { fenetre.fermer(); } }
        ]
      ]);
      fenetre.colonneBoutons.appendChild(encadreResultat);
    }

    function montrerAide() {
      ui.confirmer('Aide — ' + definition.acronyme,
        el('div', {}, [
          el('div', { texte: definition.libelle }),
          el('div', { class: 'xm-mention', style: { marginTop: '6px' },
                      texte: definition.reference || '' }),
          el('div', { class: 'xm-mention', texte: 'Licence : ' + (definition.licence || '—') }),
          el('div', { style: { marginTop: '8px' },
                      texte: 'Clavier : Tab passe d\'un item au suivant, les touches 0 à ' +
                             '9 cotent et avancent, Ctrl+S enregistre, Échap ferme.' })
        ]), 'Fermer');
    }

    /* --- Raccourci d'enregistrement -------------------------------------------- */

    fenetre.boite.addEventListener('keydown', function (evenement) {
      if ((evenement.ctrlKey || evenement.metaKey) && evenement.key.toLowerCase() === 's') {
        evenement.preventDefault();
        enregistrer(false);
      }
    });

    rafraichir();
    window.setTimeout(function () {
      var premier = zoneItems.querySelector('.xm-item[tabindex]');
      if (premier) { premier.focus(); }
    }, 0);
  }

  function formaterValeurItem(item, valeur) {
    if (valeur === null || valeur === undefined || valeur === '') { return ''; }
    if (typeof valeur === 'number') {
      return XMed.outils.nombre(valeur, item.decimales === null ||
                                        item.decimales === undefined ? 2 : item.decimales);
    }
    return String(valeur);
  }

  XMed.vues.fenetreScore = { ouvrir: ouvrir };

})(window.XMed);

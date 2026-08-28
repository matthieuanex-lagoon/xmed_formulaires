/* ============================================================================
   vues/fenetre-catalogue.js — Écran 4.3 : « Scores cliniques ».
   ----------------------------------------------------------------------------
   Même gabarit que la fenêtre Episodes : bandeau, grille, colonne de boutons.

   Trois particularités :
     - un groupe épinglé en tête « Recommandés pour cet épisode » quand la
       fenêtre est ouverte depuis un épisode, avec mention du code CIM-10
       déclencheur — on emploie le regroupement DevExpress, idiome natif ;
     - la loupe du bandeau devient une recherche instantanée (nom, acronyme,
       synonyme, domaine), focalisée au chargement ;
     - les favoris du praticien remontent en tête.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.vues = window.XMed.vues || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;
  var outils = XMed.outils;

  /**
   * @param {{dossier, episode, surScore}} options
   */
  function ouvrir(options) {
    var dossier = options.dossier;

    Promise.all([
      XMed.store.favoris(),
      XMed.store.evaluations(dossier.id())
    ]).then(function (resultats) {
      rendre(options, resultats[0], resultats[1]);
    });
  }

  function rendre(options, favoris, evaluations) {
    var dossier = options.dossier;
    var episode = options.episode || null;

    var fenetre = ui.fenetre({
      titre: 'Scores cliniques' +
             (episode ? ' — ' + episode.libelle : ''),
      largeur: 1056
    });

    var rattachement = episode
      ? XMed.rattachement.pourEpisode(episode, dossier)
      : { parEpisode: [], parFacteurRisque: [], tous: [] };

    var recommandes = {};
    rattachement.tous.forEach(function (r) { recommandes[r.id] = r; });

    var derniers = {};
    evaluations.forEach(function (ev) {
      var courant = derniers[ev.scoreId];
      if (!courant || courant.date < ev.date) { derniers[ev.scoreId] = ev; }
    });

    var etat = { filtre: '', favoris: favoris.slice(), courant: null };

    /* --- Construction des lignes ------------------------------------------ */

    function lignes() {
      var filtre = outils.normaliser(etat.filtre);

      return XMed.donnees.scores().filter(function (definition) {
        if (!filtre) { return true; }
        var champs = [definition.acronyme, definition.libelle, definition.domaine]
          .concat(definition.synonymes || []);
        return champs.some(function (c) { return outils.normaliser(c).indexOf(filtre) >= 0; });
      }).map(function (definition) {
        return {
          definition: definition,
          favori: etat.favoris.indexOf(definition.id) >= 0,
          recommande: recommandes[definition.id] || null,
          derniere: derniers[definition.id] || null
        };
      });
    }

    /** Groupe épinglé en tête, puis le reste du catalogue. */
    function groupes() {
      var toutes = lignes();
      var trier = function (liste) {
        return liste.sort(function (a, b) {
          if (a.favori !== b.favori) { return a.favori ? -1 : 1; }
          var d = a.definition.domaine.localeCompare(b.definition.domaine);
          return d !== 0 ? d : a.definition.acronyme.localeCompare(b.definition.acronyme);
        });
      };

      if (!episode || !rattachement.tous.length) {
        return [{ libelle: 'Tous les scores (' + toutes.length + ')',
                  lignes: trier(toutes) }];
      }

      var dedans = trier(toutes.filter(function (l) { return l.recommande; }));
      var dehors = trier(toutes.filter(function (l) { return !l.recommande; }));

      var motifs = {};
      rattachement.tous.forEach(function (r) { motifs[r.motif] = true; });
      var mention = Object.keys(motifs).join(', ');

      var resultat = [];
      if (dedans.length) {
        resultat.push({
          libelle: 'Recommandés pour cet épisode — ' + mention,
          lignes: dedans
        });
      }
      if (dehors.length) {
        resultat.push({ libelle: 'Autres scores (' + dehors.length + ')', lignes: dehors });
      }
      return resultat;
    }

    /* --- Grille ------------------------------------------------------------ */

    var grille = ui.grille({
      hauteur: '300px',
      vide: 'Aucun score ne correspond à la recherche',
      recherche: {
        placeholder: 'Rechercher un score : nom, acronyme, synonyme, domaine…',
        surSaisie: function (texte) {
          etat.filtre = texte;
          grille.remplir(null, groupes());
        }
      },
      colonnes: [
        { cle: 'favori', libelle: '', largeur: '24px', align: 'centre',
          rendu: function (l) {
            return ui.icone(l.favori ? ui.ICONES.etoile : ui.ICONES.etoileVide, 12);
          } },
        { cle: 'domaine', libelle: 'Domaine', largeur: '124px',
          rendu: function (l) { return l.definition.domaine; } },
        { cle: 'acronyme', libelle: 'Acronyme', largeur: '92px', tri: 'asc',
          rendu: function (l) { return l.definition.acronyme; } },
        { cle: 'libelle', libelle: 'Libellé',
          rendu: function (l) {
            var noeud = el('span', {}, l.definition.libelle);
            if (l.definition.statut !== 'valide') {
              noeud.appendChild(el('span', { class: 'xm-mention',
                                             texte: '  [à valider]' }));
            }
            return noeud;
          } },
        { cle: 'items', libelle: 'Items', largeur: '48px', align: 'droite',
          rendu: function (l) { return l.definition.items.length; } },
        { cle: 'duree', libelle: 'Durée', largeur: '56px', align: 'droite',
          rendu: function (l) {
            return l.definition.dureeEstimeeMin ? l.definition.dureeEstimeeMin + ' mn' : '';
          } },
        { cle: 'auto', libelle: 'Auto', largeur: '44px', align: 'centre',
          classe: function () { return 'est-valide'; },
          rendu: function (l) { return compterResolveurs(l.definition) ? '●' : ''; } },
        { cle: 'dernier', libelle: 'Dernier résultat', largeur: '134px',
          classe: function (l) {
            return (l.derniere && l.derniere.resultat &&
                    l.derniere.resultat.valeur === null) ? 'est-attenue' : null;
          },
          rendu: function (l) { return texteResultat(l.derniere); } },
        { cle: 'date', libelle: 'Date', largeur: '82px',
          rendu: function (l) { return l.derniere ? outils.dateFr(l.derniere.date) : ''; } }
      ],
      groupes: groupes(),
      surSelection: function (l) { etat.courant = l; rendreBoutons(); },
      surActivation: function (l) { ouvrirScore(l); }
    });

    fenetre.principal.appendChild(grille.racine);
    fenetre.principal.appendChild(zoneDetail(etat, rattachement, episode));

    /* --- Boutons ----------------------------------------------------------- */

    function rendreBoutons() {
      ui.blocsBoutons(fenetre.colonneBoutons, [
        [
          { libelle: 'Ouvrir', defaut: true, inactif: !etat.courant,
            action: function () { ouvrirScore(etat.courant); } },
          { libelle: etat.courant && etat.courant.favori ? 'Retirer des favoris' : 'Favori',
            inactif: !etat.courant, action: basculerFavori }
        ],
        [
          { libelle: 'Imprimer', action: nonImplemente },
          { libelle: 'Aide', action: nonImplemente },
          { libelle: 'Annuler', action: function () { fenetre.fermer(); } }
        ]
      ]);
      fenetre.colonneBoutons.appendChild(encadreInfo(etat.courant));
    }

    function basculerFavori() {
      if (!etat.courant) { return; }
      XMed.store.basculerFavori(etat.courant.definition.id).then(function (liste) {
        etat.favoris = liste;
        var idCourant = etat.courant.definition.id;
        grille.remplir(null, groupes());
        // On retrouve la ligne équivalente après reconstruction.
        var toutes = [];
        groupes().forEach(function (g) { toutes = toutes.concat(g.lignes); });
        var meme = toutes.filter(function (l) { return l.definition.id === idCourant; })[0];
        if (meme) { grille.selectionner(meme); }
        rendreBoutons();
      });
    }

    function ouvrirScore(ligne) {
      if (!ligne) { return; }
      var recommande = ligne.recommande;
      if (recommande && !recommande.disponible) {
        ui.confirmer('Score non implémenté',
          ligne.definition.acronyme + ' est déclaré dans le référentiel mais ' +
          'n\'est pas implémenté dans cette maquette.', 'Fermer');
        return;
      }
      options.surScore(ligne.definition, episode);
    }

    function nonImplemente() {
      ui.confirmer('Hors périmètre de la maquette',
        'Action non reproduite dans cette maquette.', 'Fermer');
    }

    // La grille sélectionne sa première ligne sans déclencher le rappel :
    // on reprend l'état avant de rendre les boutons, sinon « Ouvrir » resterait
    // grisé alors qu'une ligne est bien sélectionnée.
    etat.courant = grille.courante();
    rendreBoutons();
    grille.focusRecherche();
  }

  /* --- Zone de détail : ce que fait le score sélectionné -------------------- */

  function zoneDetail(etat, rattachement, episode) {
    var conteneur = el('div', { class: 'xm-detail' });

    if (episode) {
      var motifs = rattachement.tous.map(function (r) {
        return (r.definition ? r.definition.acronyme : r.id) + ' (' + r.motif + ')';
      });
      conteneur.appendChild(ui.bandeau('info', 'Contexte',
        'Ouvert depuis l\'épisode « ' + episode.libelle + ' »' +
        (episode.cim10 ? ', codé ' + episode.cim10 : ', non codé') + '. ' +
        (motifs.length
          ? 'Rattachements : ' + motifs.join(', ') + '.'
          : 'Aucun score rattaché : le catalogue complet est affiché.')));
    } else {
      conteneur.appendChild(ui.bandeau('info', 'Catalogue complet',
        'Ouvert hors épisode : aucun score n\'est mis en avant. ' +
        'Ouvrir le catalogue depuis un épisode épingle les scores recommandés en tête.'));
    }

    return conteneur;
  }

  function encadreInfo(ligne) {
    if (!ligne) {
      return el('div', { class: 'xm-encadre-statique' }, 'Sélectionner un score');
    }
    var d = ligne.definition;
    return el('div', { class: 'xm-encadre-statique', style: { textAlign: 'left' } }, [
      el('div', { class: 'est-gras', texte: d.acronyme }),
      el('div', { class: 'xm-mention', texte: d.reference || '' }),
      el('div', { class: 'xm-mention', style: { marginTop: '6px' },
                  texte: 'Passation : ' + libellePassation(d.typePassation) }),
      el('div', { class: 'xm-mention',
                  texte: compterResolveurs(d) + ' item(s) pré-remplissables' }),
      d.statut !== 'valide'
        ? el('div', { class: 'est-alerte', style: { marginTop: '6px' },
                      texte: 'Définition à valider' })
        : null
    ]);
  }

  function libellePassation(type) {
    if (type === 'auto') { return 'auto-questionnaire'; }
    if (type === 'hetero') { return 'hétéro-évaluation'; }
    if (type === 'calcule') { return 'calculé sur données'; }
    return 'mixte';
  }

  function compterResolveurs(definition) {
    return (definition.items || []).filter(function (i) { return !!i.resolveur; }).length;
  }

  function texteResultat(evaluation) {
    if (!evaluation || !evaluation.resultat) { return ''; }
    var r = evaluation.resultat;
    if (r.valeur === null || r.valeur === undefined) {
      return 'non calculé';
    }
    return String(r.valeur).replace('.', ',') + (r.unite ? ' ' + r.unite : '') +
           (r.interpretation ? ' — ' + r.interpretation : '');
  }

  XMed.vues.fenetreCatalogue = { ouvrir: ouvrir };

})(window.XMed);

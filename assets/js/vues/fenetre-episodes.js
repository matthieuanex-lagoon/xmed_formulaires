/* ============================================================================
   vues/fenetre-episodes.js — Écran 4.2 : « Episodes et suivis en cours ».
   ----------------------------------------------------------------------------
   Réplique du gabarit de la capture 03. DEUX AJOUTS, et rien d'autre ne bouge :

     1. un bloc de boutons inséré APRÈS « Clore épisode » :
          [ Scores…                   ]   toujours actif, ouvre le catalogue
          [ Scores de cet épisode (2) ]   libellé dynamique, MASQUÉ (pas grisé)
                                          quand l'épisode ne porte aucun score
     2. une colonne « Dernier score » après « Dernier contact », pour que
        l'information existe sans ouvrir quoi que ce soit.

   Le rattachement est réévalué à chaque changement de ligne sélectionnée.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.vues = window.XMed.vues || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;
  var outils = XMed.outils;

  /**
   * @param {{dossier, episodeInitial, surCatalogue, surScore}} options
   */
  function ouvrir(options) {
    var dossier = options.dossier;
    var episodes = dossier.episodes();

    // Derniers scores par épisode, chargés avant le rendu pour que la colonne
    // « Dernier score » soit remplie dès l'ouverture.
    chargerDerniersScores(dossier, episodes).then(function (derniers) {
      rendre(options, dossier, episodes, derniers);
    });
  }

  /** @returns {Promise<Object>} episodeId -> { acronyme, valeur, date } | null */
  function chargerDerniersScores(dossier, episodes) {
    return XMed.store.evaluations(dossier.id()).then(function (evaluations) {
      var parEpisode = {};
      evaluations.forEach(function (ev) {
        if (!ev.episodeId) { return; }
        var courant = parEpisode[ev.episodeId];
        if (courant && courant.date >= ev.date) { return; }
        var definition = XMed.donnees.score(ev.scoreId);
        parEpisode[ev.episodeId] = {
          acronyme: definition ? definition.acronyme : ev.scoreId,
          valeur: ev.resultat ? ev.resultat.valeur : null,
          unite: ev.resultat ? ev.resultat.unite : null,
          date: ev.date
        };
      });
      return parEpisode;
    });
  }

  function rendre(options, dossier, episodes, derniers) {
    var fenetre = ui.fenetre({ titre: 'Episodes et suivis en cours', largeur: 1056 });
    var etat = { episode: null, rattachement: null };

    var detail = el('div', { class: 'xm-detail' });

    var grille = ui.grille({
      hauteur: '236px',
      vide: 'Aucun épisode en cours',
      colonnes: [
        { cle: 'acteur', libelle: 'Acteur', largeur: '56px' },
        { cle: 'libelle', libelle: 'Libellé', tri: 'asc' },
        { cle: 'debut', libelle: 'Début', largeur: '82px',
          rendu: function (e) { return outils.dateFr(e.debut); } },
        { cle: 'dernierContact', libelle: 'Dernier contact', largeur: '104px', filtre: true,
          rendu: function (e) { return outils.dateFr(e.dernierContact); } },
        { cle: 'dernierScore', libelle: 'Dernier score', largeur: '150px',
          classe: function (e) {
            var d = derniers[e.id];
            return (d && d.valeur === null) ? 'est-attenue' : null;
          },
          rendu: function (e) { return texteDernierScore(derniers[e.id]); } },
        { cle: 'notes', libelle: 'Notes', largeur: '120px' }
      ],
      lignes: episodes,
      surSelection: function (episode) { selectionner(episode); },
      surActivation: function (episode) {
        // Entrée ou double-clic sur une ligne : ouvre le score s'il n'y en a
        // qu'un, le menu sinon. C'est le geste le plus fréquent.
        activerScores(boutonsIndex.contextuel);
      }
    });

    fenetre.principal.appendChild(grille.racine);
    fenetre.principal.appendChild(detail);

    var boutonsIndex = {};

    function selectionner(episode) {
      etat.episode = episode;
      etat.rattachement = episode
        ? XMed.rattachement.pourEpisode(episode, dossier)
        : { parEpisode: [], parFacteurRisque: [], tous: [] };
      rendreDetail(detail, episode);
      rendreBoutons();
    }

    function rendreBoutons() {
      var libelle = etat.rattachement ? XMed.rattachement.libelleBouton(etat.rattachement) : null;

      boutonsIndex = ui.blocsBoutons(fenetre.colonneBoutons, [
        [
          { libelle: 'Ajouter', defaut: true, action: nonImplemente },
          { libelle: 'Supprimer', action: nonImplemente },
          { libelle: 'Ok', action: function () { fenetre.fermer(); } },
          { libelle: 'Appliquer', inactif: true }
        ],
        [
          { libelle: 'Imprimer', action: nonImplemente },
          { libelle: 'Aide', action: nonImplemente },
          { libelle: 'Annuler', action: function () { fenetre.fermer(); } }
        ],
        [
          { libelle: 'Clore épisode', action: nonImplemente }
        ],
        [
          { libelle: 'Scores…', id: 'catalogue',
            titre: 'Catalogue complet des scores cliniques',
            action: function () { options.surCatalogue(etat.episode); } },
          // MASQUÉ, et non grisé, quand l'épisode ne porte aucun score.
          { libelle: libelle || '', id: 'contextuel', menu: true,
            masque: !libelle,
            titre: 'Scores rattachés à l\'épisode sélectionné',
            action: function (ev) { activerScores(ev.currentTarget); } }
        ]
      ]);

      fenetre.colonneBoutons.appendChild(el('div', { class: 'xm-encadre-statique' },
        ['Liste des ttt', el('br'), 'prescrits durant', el('br'),
         'la période', el('br'), 'de l\'épisode']));
    }

    /**
     * 1 score  -> ouverture directe.
     * 2 et plus -> menu ancré au bouton, avec le dernier résultat de chacun.
     */
    function activerScores(ancre) {
      var r = etat.rattachement;
      if (!r || !r.tous.length) { return; }

      if (r.tous.length === 1) {
        ouvrirScore(r.tous[0]);
        return;
      }

      var elements = [];
      var ajouterEntrees = function (liste) {
        liste.forEach(function (s) {
          elements.push({
            libelle: (s.definition ? s.definition.acronyme : s.id) +
                     (s.disponible ? '' : '  (non implémenté)'),
            detail: '…',
            action: function () { ouvrirScore(s); },
            score: s
          });
        });
      };
      ajouterEntrees(r.parEpisode);
      if (r.parFacteurRisque.length) {
        if (r.parEpisode.length) { elements.push({ separateur: true }); }
        ajouterEntrees(r.parFacteurRisque);
      }
      elements.push({ separateur: true });
      elements.push({
        libelle: 'Tous les scores…',
        action: function () { options.surCatalogue(etat.episode); }
      });

      var boite = ui.menu(ancre || boutonsIndex.contextuel, elements);

      // Le dernier résultat de chaque score est chargé après l'ouverture du
      // menu : il ne doit pas retarder l'affichage.
      elements.forEach(function (e, i) {
        if (!e.score) { return; }
        XMed.store.derniere(dossier.id(), e.score.id).then(function (ev) {
          var cible = boite.querySelectorAll('.xm-menu__item')[indexVisible(elements, i)];
          if (!cible) { return; }
          var detailNoeud = cible.querySelector('.xm-menu__item-detail');
          if (!detailNoeud) { return; }
          detailNoeud.textContent = ev
            ? texteDernierScore({
                valeur: ev.resultat ? ev.resultat.valeur : null,
                unite: ev.resultat ? ev.resultat.unite : null,
                date: ev.date }, true)
            : 'jamais évalué';
        });
      });
    }

    /** Position d'un élément parmi les seuls éléments cliquables du menu. */
    function indexVisible(elements, index) {
      var n = 0;
      for (var i = 0; i < index; i++) { if (!elements[i].separateur) { n++; } }
      return n;
    }

    function ouvrirScore(score) {
      if (!score.disponible || !score.definition) {
        ui.confirmer('Score non implémenté',
          (score.definition ? score.definition.acronyme : score.id) +
          ' est déclaré dans le référentiel mais n\'est pas implémenté dans cette ' +
          'maquette. Il apparaît pour montrer que le rattachement fonctionne.',
          'Fermer');
        return;
      }
      options.surScore(score.definition, etat.episode);
    }

    function nonImplemente() {
      ui.confirmer('Hors périmètre de la maquette',
        'Cette action appartient à la fenêtre XMed existante. La maquette ne ' +
        'reproduit que les points d\'entrée du module Scores cliniques.',
        'Fermer');
    }

    // Sélection initiale : l'épisode d'où l'on vient, sinon la première ligne.
    var depart = options.episodeInitial
      ? episodes.filter(function (e) { return e.id === options.episodeInitial.id; })[0]
      : null;
    grille.selectionner(depart || episodes[0] || null);
    grille.focus();
  }

  /* --- Rendu du détail ------------------------------------------------------ */

  function rendreDetail(conteneur, episode) {
    ui.vider(conteneur);
    if (!episode) { return; }

    var champ = function (valeur, classe) {
      return el('input', { class: 'xm-champ ' + (classe || ''), value: valeur || '',
                           readonly: true });
    };

    conteneur.appendChild(el('div', { class: 'xm-ligne' }, [
      el('span', { class: 'xm-groupe-radio' }, [
        option('radio', 'ref', 'CIM10', true), option('radio', 'ref', 'CISP'),
        option('radio', 'ref', 'AMM'), option('radio', 'ref', 'Tous'),
        option('radio', 'ref', 'DRC')
      ]),
      ui.boutonIcone('Rechercher dans le référentiel', ui.ICONES.loupe, function () {}),
      el('span', { class: 'xm-mention', texte: episode.cim10 ? 'Code : ' + episode.cim10 : 'Non codé' }),
      el('span', { class: 'xm-espaceur' }),
      option('checkbox', null, 'ALD'),
      el('span', { class: 'xm-libelle', texte: 'Date début :' }),
      champ(outils.dateFr(episode.debut), 'xm-champ--date')
    ]));

    conteneur.appendChild(el('div', { class: 'xm-ligne' }, [
      el('span', { class: 'xm-libelle xm-libelle--court', texte: 'Libellé :' }),
      champ(episode.libelle, 'xm-champ--large'),
      el('span', { class: 'xm-espaceur' }),
      el('span', { class: 'xm-libelle', texte: 'Date fin :' }),
      champ('', 'xm-champ--date')
    ]));

    conteneur.appendChild(el('div', { class: 'xm-ligne' }, [
      el('span', { class: 'xm-libelle', texte: 'Survenu à l\'âge de :' }),
      champ('', 'xm-champ--nombre'),
      el('span', { class: 'xm-libelle', texte: 'ans' }),
      el('span', { style: { width: '24px' } }),
      el('span', { class: 'xm-libelle', texte: 'Date début :' }),
      champ(outils.dateFr(episode.debut), 'xm-champ--date'),
      el('span', { class: 'xm-libelle', texte: 'Date fin :' }),
      champ('', 'xm-champ--date'),
      el('span', { class: 'xm-espaceur' }),
      option('checkbox', null, 'A suivre', episode.aSuivre)
    ]));

    conteneur.appendChild(el('div', { class: 'xm-ligne' }, [
      el('div', { class: 'xm-cases-2col' }, [
        option('checkbox', null, 'Immunodépression'),
        option('checkbox', null, 'Chirurgical')
      ]),
      el('span', { class: 'xm-espaceur' }),
      el('div', { class: 'xm-cases-2col' }, [
        option('checkbox', null, 'AT'), option('checkbox', null, 'MP'),
        option('checkbox', null, 'Facteur de risque')
      ])
    ]));

    conteneur.appendChild(el('div', { class: 'xm-ligne' },
      el('span', { class: 'xm-libelle', texte: 'Notes :' })));
    conteneur.appendChild(el('textarea', { class: 'xm-zone-notes', rows: '3',
                                           readonly: true }, episode.notes || ''));
  }

  function option(type, groupe, libelle, coche) {
    return el('label', { class: 'xm-option' }, [
      el('input', { type: type, name: groupe, checked: coche ? true : null, disabled: true }),
      libelle
    ]);
  }

  /* --- Formatage ------------------------------------------------------------ */

  function texteDernierScore(dernier, courtSansAcronyme) {
    if (!dernier) { return ''; }
    var valeur;
    if (dernier.valeur === null || dernier.valeur === undefined) {
      valeur = 'non calculé';
    } else {
      valeur = String(dernier.valeur).replace('.', ',') +
               (dernier.unite ? ' ' + dernier.unite : '');
    }
    var tete = courtSansAcronyme ? '' : (dernier.acronyme ? dernier.acronyme + ' ' : '');
    return tete + valeur + ' — ' + outils.dateFr(dernier.date);
  }

  XMed.vues.fenetreEpisodes = { ouvrir: ouvrir };

})(window.XMed);

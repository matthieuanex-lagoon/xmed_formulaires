/* ============================================================================
   vues/dossier.js — Écran 4.1 : reproduction allégée du dossier patient.
   ----------------------------------------------------------------------------
   Sert de contexte à la démonstration : c'est de là qu'on ouvre la fenêtre
   « Episodes et suivis en cours », et c'est ce dossier que lisent les
   résolveurs pour pré-remplir les items.

   Seuls les cadres utiles au scénario sont reproduits.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.vues = window.XMed.vues || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;
  var outils = XMed.outils;

  var MENUS = ['Fichier', 'Edition', 'Consultations du jour et actions',
               'Historique et Synthèse', 'Modèles et Glossaires', 'Actions', 'Outils',
               'Fenêtres', 'Utilisateurs', 'Statistiques', 'Recherche multi-critères', '?'];

  /**
   * Rend le dossier complet dans un conteneur.
   * @param {Node} racine
   * @param {Object} dossier façade XMed.Dossier
   * @param {Object} contexte { patients, surChangementPatient, derniersScores }
   */
  function rendre(racine, dossier, contexte) {
    ui.vider(racine);
    racine.appendChild(barreTitre(dossier, contexte));
    racine.appendChild(barreMenus());
    racine.appendChild(barreOutils(dossier, contexte));
    racine.appendChild(mosaique(dossier, contexte));
    racine.appendChild(barreEtat());
  }

  /* --- Chrome de l'application --------------------------------------------- */

  function barreTitre(dossier, contexte) {
    var selecteur = el('select', {
      class: 'xm-selecteur-patient',
      title: 'Patient de démonstration',
      onchange: function (ev) { contexte.surChangementPatient(ev.target.value); }
    }, (contexte.patients || []).map(function (p) {
      return el('option', {
        value: p.id,
        selected: p.id === dossier.id() ? true : null
      }, p.identite.civilite + ' ' + p.identite.nom + ' ' + p.identite.prenom +
         ' — ' + outils.age(p.identite.dateNaissance) + ' ans');
    }));

    return el('div', { class: 'xm-app__titre' }, [
      ui.icone(ui.ICONES.xmed),
      el('span', { class: 'xm-app__titre-libelle',
                   texte: 'XMed - [' + dossier.libelleEntete() + ']' }),
      el('span', { class: 'xm-app__demo' }, ['Patient de démonstration :', selecteur])
    ]);
  }

  function barreMenus() {
    return el('div', { class: 'xm-app__menus' }, MENUS.map(function (m) {
      return el('span', { class: 'xm-app__menu', texte: m });
    }));
  }

  function barreOutils(dossier, contexte) {
    var icones = ['copier', 'filtre', 'reseau', 'deplier', 'valide', 'scores',
                  'agrandir', 'patient', 'serveur', 'loupe'];
    var boutons = [];
    // Barre décorative : elle campe le décor, elle n'a pas d'action propre.
    for (var i = 0; i < 22; i++) {
      boutons.push(ui.boutonIcone('', ui.ICONES[icones[i % icones.length]], function () {}));
    }
    boutons.push(el('span', { class: 'xm-app__separateur' }));
    boutons.push(el('button', {
      class: 'xm-bouton xm-bouton--petit',
      type: 'button',
      title: 'Ouvrir le catalogue complet des scores cliniques',
      onclick: function () { contexte.surCatalogue(null); }
    }, 'Scores cliniques…'));
    return el('div', { class: 'xm-app__outils' }, boutons);
  }

  function barreEtat() {
    var horloge = el('span', { texte: outils.heure() });
    window.setInterval(function () { horloge.textContent = outils.heure(); }, 1000);

    return el('div', { class: 'xm-barre-etat' }, [
      el('span', { class: 'xm-barre-etat__cellule' },
         [ui.icone(ui.ICONES.patient, 14), 'ANEX Matthieu (Médical)']),
      el('span', { class: 'xm-barre-etat__cellule' },
         [ui.icone(ui.ICONES.serveur, 14), '192.168.1.253\\XMED']),
      el('span', { class: 'xm-barre-etat__cellule' },
         [ui.icone(ui.ICONES.xmed, 14), 'XMED_DRANEX']),
      el('span', { class: 'xm-barre-etat__cellule' }, [
        el('span', { class: 'xm-voyant' }), el('span', { class: 'xm-voyant' }),
        el('span', { class: 'xm-voyant' })
      ]),
      el('span', { class: 'xm-barre-etat__cellule', texte: 'Post-It' }),
      el('span', { class: 'xm-barre-etat__espaceur' }),
      el('span', { class: 'xm-barre-etat__cellule', texte: outils.dateLongue() }),
      el('span', { class: 'xm-barre-etat__cellule xm-barre-etat__cellule--fin' }, horloge)
    ]);
  }

  /* --- Mosaïque de cadres --------------------------------------------------- */

  function mosaique(dossier, contexte) {
    return el('div', { class: 'xm-app__mosaique' }, [
      el('div', { class: 'xm-app__colonne' }, [
        cadreIdentite(dossier),
        cadreEpisodesFermes(dossier),
        cadreTraitements(dossier)
      ]),
      el('div', { class: 'xm-app__colonne' }, [
        cadreFacteursRisque(dossier),
        cadreEpisodes(dossier, contexte)
      ]),
      el('div', { class: 'xm-app__colonne' }, [
        cadreBiologie(dossier)
      ])
    ]);
  }

  function iconesStandard() {
    return [
      ui.boutonIcone('Copier', ui.ICONES.copier, function () {}),
      ui.boutonIcone('Filtrer', ui.ICONES.filtre, function () {}),
      ui.boutonIcone('Déplier', ui.ICONES.deplier, function () {}),
      ui.boutonIcone('Agrandir', ui.ICONES.agrandir, function () {})
    ];
  }

  function cadreIdentite(dossier) {
    var d = dossier.demographie();
    var c = ui.cadre({
      titre: 'Identité', variante: 'fiche',
      icones: [ui.boutonIcone('Copier', ui.ICONES.copier, function () {}),
               ui.boutonIcone('Validé', ui.ICONES.valide, function () {}),
               ui.boutonIcone('Agrandir', ui.ICONES.agrandir, function () {})]
    });

    var champs = [
      ['Date de naissa...', outils.dateFr(d.dateNaissance)],
      ['Adresse', d.adresse],
      ['Code postal', d.codePostal],
      ['Ville', d.ville],
      ['Tél domicile', d.telDomicile],
      ['GSM', d.gsm],
      ['Mel', d.mel],
      ['Numéro de séc...', d.numeroSecu],
      ['Médecin traitant', d.medecinTraitant],
      ['Profession', d.profession],
      ['Notes publiques', d.notesPubliques]
    ];

    var fiche = el('div', { class: 'xm-fiche' });
    champs.forEach(function (paire) {
      fiche.appendChild(el('span', { class: 'xm-fiche__cle', texte: paire[0] }));
      fiche.appendChild(el('span', { class: 'xm-fiche__valeur', texte: paire[1] || '' }));
    });
    c.corps.appendChild(fiche);
    return c.racine;
  }

  function cadreFacteursRisque(dossier) {
    var c = ui.cadre({ titre: 'Facteurs de risque', icones: iconesStandard(),
                       hauteur: '132px' });
    var g = ui.grille({
      bandeauGroupe: false,
      hauteur: '100%',
      vide: 'Aucun facteur de risque',
      colonnes: [
        { cle: 'debut', libelle: 'Début', largeur: '80px',
          rendu: function (f) { return outils.dateFr(f.debut); } },
        { cle: 'libelle', libelle: 'Libellé', largeur: '190px' },
        { cle: 'notes', libelle: 'Notes', tri: 'asc' }
      ],
      lignes: dossier.facteursRisque()
    });
    c.corps.appendChild(g.racine);
    return c.racine;
  }

  function cadreEpisodesFermes(dossier) {
    var c = ui.cadre({ titre: 'Episodes fermés (ATCD)', icones: iconesStandard(),
                       hauteur: '208px' });
    var g = ui.grille({
      bandeauGroupe: false, hauteur: '100%', vide: 'Aucun antécédent',
      colonnes: [
        { cle: 'debut', libelle: 'Début', largeur: '80px',
          rendu: function (e) { return outils.dateFr(e.debut); } },
        { cle: 'libelle', libelle: 'Episode', tri: 'asc' },
        { cle: 'notes', libelle: 'Notes', largeur: '110px' }
      ],
      lignes: dossier.episodesFermes()
    });
    c.corps.appendChild(g.racine);
    return c.racine;
  }

  /**
   * Cadre « Episodes et suivis en cours ».
   * C'est ici qu'est inséré le point d'entrée du module : une icône 16x16 dans
   * la barre de titre, raccourci vers le catalogue filtré sur l'épisode
   * sélectionné.
   */
  function cadreEpisodes(dossier, contexte) {
    var selection = { episode: null };

    var iconeScores = ui.boutonIcone(
      'Scores cliniques de l\'épisode sélectionné',
      ui.ICONES.scores,
      function () { contexte.surCatalogue(selection.episode); });

    var c = ui.cadre({
      titre: 'Episodes et suivis en cours',
      hauteur: '272px',
      icones: [
        ui.boutonIcone('Copier', ui.ICONES.copier, function () {}),
        ui.boutonIcone('Filtrer', ui.ICONES.filtre, function () {}),
        ui.boutonIcone('Déplier', ui.ICONES.deplier, function () {}),
        iconeScores,
        ui.boutonIcone('Agrandir', ui.ICONES.agrandir,
                       function () { contexte.surFenetreEpisodes(selection.episode); })
      ]
    });

    var g = ui.grille({
      bandeauGroupe: false, hauteur: '100%', vide: 'Aucun épisode en cours',
      colonnes: [
        { cle: 'debut', libelle: 'Début', largeur: '80px',
          rendu: function (e) { return outils.dateFr(e.debut); } },
        { cle: 'suivi', libelle: '.', largeur: '28px', align: 'centre', filtre: true,
          rendu: function (e) {
            return el('input', { type: 'checkbox', disabled: true,
                                 checked: e.aSuivre ? true : null });
          } },
        { cle: 'libelle', libelle: 'Episode', filtre: true },
        { cle: 'notes', libelle: 'Notes', largeur: '90px' }
      ],
      lignes: dossier.episodes(),
      surSelection: function (e) { selection.episode = e; },
      surActivation: function (e) { contexte.surFenetreEpisodes(e); }
    });
    selection.episode = g.courante();

    c.corps.appendChild(g.racine);
    return c.racine;
  }

  function cadreBiologie(dossier) {
    var c = ui.cadre({ titre: 'Eléments de suivi (Biologie)', icones: iconesStandard(),
                       hauteur: '272px' });
    var lignes = dossier.biologie().slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });

    function rouge(l) { return l.anormal ? 'est-alerte' : null; }

    var g = ui.grille({
      bandeauGroupe: false, hauteur: '100%', vide: 'Aucun résultat',
      colonnes: [
        { cle: 'date', libelle: 'Date', largeur: '78px', classe: rouge, tri: 'asc',
          rendu: function (l) { return outils.dateFr(l.date); } },
        { cle: 'libelle', libelle: 'Examen', classe: rouge },
        { cle: 'valeur', libelle: 'Valeur', largeur: '62px', align: 'droite', classe: rouge,
          rendu: function (l) { return formaterValeur(l.valeur); } },
        { cle: 'unite', libelle: 'Unité', largeur: '62px', classe: rouge },
        { cle: 'valeur2', libelle: 'Valeur 2', largeur: '62px', align: 'droite', classe: rouge,
          rendu: function (l) { return formaterValeur(l.valeur2); } },
        { cle: 'unite2', libelle: 'Unité 2', largeur: '62px', classe: rouge }
      ],
      lignes: lignes
    });
    c.corps.appendChild(g.racine);
    return c.racine;
  }

  function formaterValeur(v) {
    if (v === null || v === undefined) { return ''; }
    return String(v).replace('.', ',');
  }

  function cadreTraitements(dossier) {
    var c = ui.cadre({ titre: 'Traitements', icones: iconesStandard(), hauteur: '132px' });
    var g = ui.grille({
      bandeauGroupe: false, hauteur: '100%', vide: 'Aucun traitement en cours',
      colonnes: [
        { cle: 'dernier', libelle: 'Derni...', largeur: '80px', tri: 'asc',
          rendu: function (t) { return outils.dateFr(t.dernier); } },
        { cle: 'libelle', libelle: 'Traitement' },
        { cle: 'periodicite', libelle: 'Péri...', largeur: '56px' }
      ],
      lignes: dossier.traitements()
    });
    c.corps.appendChild(g.racine);
    return c.racine;
  }

  XMed.vues.dossier = { rendre: rendre };

})(window.XMed);

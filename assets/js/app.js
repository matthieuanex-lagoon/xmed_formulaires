/* ============================================================================
   app.js — Amorçage, pile de fenêtres, raccourcis clavier globaux.
   ----------------------------------------------------------------------------
   Chargé en dernier. Ne contient aucune règle métier.

   Clavier, valable partout :
     Échap   ferme la fenêtre du dessus (ou le menu ouvert)
     Entrée  déclenche le bouton par défaut de la fenêtre du dessus
     Ctrl+S  enregistre, quand la fenêtre du dessus sait le faire
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;

  var etat = { dossier: null, racine: null };

  function demarrer(racine) {
    etat.racine = racine;

    XMed.donnees.charger().then(function () {
      var patients = XMed.donnees.patients();
      if (!patients.length) {
        racine.appendChild(ui.bandeau('bloquant', 'Référentiel introuvable',
          XMed.donnees.erreurs().join(' ') ||
          'Aucun patient de démonstration n\'a pu être chargé.'));
        return;
      }
      return XMed.store.amorcer(patients).then(function () {
        ouvrirPatient(patients[0].id);
        installerClavier();
        afficherEtatDuReferentiel();
      });
    }).catch(function (erreur) {
      racine.appendChild(ui.bandeau('bloquant', 'Erreur au chargement',
        String(erreur && erreur.message ? erreur.message : erreur)));
    });
  }

  function ouvrirPatient(patientId) {
    var brut = XMed.donnees.patient(patientId);
    if (!brut) { return; }
    etat.dossier = new XMed.Dossier(brut);

    XMed.vues.dossier.rendre(etat.racine, etat.dossier, {
      patients: XMed.donnees.patients(),
      surChangementPatient: function (id) {
        fermerToutesLesFenetres();
        ouvrirPatient(id);
      },
      surFenetreEpisodes: function (episode) { ouvrirFenetreEpisodes(episode); },
      surCatalogue: function (episode) { ouvrirCatalogue(episode); }
    });
  }

  function ouvrirFenetreEpisodes(episode) {
    XMed.vues.fenetreEpisodes.ouvrir({
      dossier: etat.dossier,
      episodeInitial: episode,
      surCatalogue: function (ep) { ouvrirCatalogue(ep); },
      surScore: function (definition, ep) { ouvrirScore(definition, ep); }
    });
  }

  function ouvrirCatalogue(episode) {
    XMed.vues.fenetreCatalogue.ouvrir({
      dossier: etat.dossier,
      episode: episode,
      surScore: function (definition, ep) { ouvrirScore(definition, ep); }
    });
  }

  function ouvrirScore(definition, episode) {
    XMed.vues.fenetreScore.ouvrir({
      dossier: etat.dossier,
      definition: definition,
      episode: episode
    });
  }

  function fermerToutesLesFenetres() {
    while (ui.pileFenetres.length) {
      ui.detacher(ui.pileFenetres[ui.pileFenetres.length - 1]);
    }
    ui.fermerMenu();
  }

  /* --- Clavier global -------------------------------------------------------- */

  function installerClavier() {
    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape') {
        if (ui.menuOuvert) { ui.fermerMenu(); evenement.preventDefault(); return; }
        var dessus = ui.fenetreDuDessus();
        if (dessus) { dessus.fermer(); evenement.preventDefault(); }
        return;
      }

      if (evenement.key === 'Enter') {
        // Entrée déclenche le bouton par défaut, sauf dans une zone de texte
        // multi-ligne où elle sert à passer à la ligne.
        var actif = document.activeElement;
        if (actif && (actif.tagName === 'TEXTAREA' || actif.classList.contains('xm-menu__item'))) {
          return;
        }
        if (actif && actif.classList.contains('xm-bouton')) { return; }
        var fenetre = ui.fenetreDuDessus();
        if (!fenetre) { return; }
        var defaut = fenetre.boite.querySelector('.xm-bouton--defaut:not(:disabled)');
        if (defaut) { evenement.preventDefault(); defaut.click(); }
      }
    });
  }

  /* --- État du référentiel ---------------------------------------------------
     Mention discrète : elle dit d'où viennent les données, sans encombrer.
     ------------------------------------------------------------------------- */

  function afficherEtatDuReferentiel() {
    var messages = [];

    if (XMed.donnees.origine() === 'embarque') {
      messages.push('Référentiel embarqué' +
        (XMed.donnees.genereLe()
          ? ', généré le ' + XMed.outils.dateFr(XMed.donnees.genereLe().slice(0, 10))
          : '') +
        ' — la démo est ouverte depuis le disque, les fichiers .json ne sont pas lisibles ' +
        'en file://.');
    }
    XMed.donnees.divergences().forEach(function (d) {
      messages.push('Divergence entre le fichier source et la copie embarquée : ' + d);
    });
    XMed.donnees.erreurs().forEach(function (e) { messages.push(e); });

    var pied = el('div', { class: 'xm-pied' }, [
      el('span', { texte: 'Maquette de démonstration — Olaqin / XMed. ' +
                          'Aucune donnée réelle de patient.' }),
      messages.length
        ? el('span', { class: 'xm-mention', texte: '  ·  ' + messages.join('  ·  ') })
        : null,
      el('a', {
        href: '#', class: 'xm-lien',
        onclick: function (ev) {
          ev.preventDefault();
          ui.confirmer('Réinitialiser la démonstration',
            'Effacer les évaluations enregistrées et les favoris, et revenir au ' +
            'jeu de démonstration d\'origine ?', 'Réinitialiser')
            .then(function (ok) {
              if (ok) { XMed.store.reinitialiser().then(function () { location.reload(); }); }
            });
        }
      }, 'Réinitialiser la démonstration')
    ]);

    etat.racine.appendChild(pied);
  }

  XMed.app = { demarrer: demarrer };

})(window.XMed);

/* ============================================================================
   donnees.js — Chargement du référentiel et du jeu de démonstration.
   ----------------------------------------------------------------------------
   Sépare le CHARGEMENT des définitions de leur EXPLOITATION : le moteur ne sait
   pas d'où viennent les scores.

   DEUX ORIGINES POSSIBLES (voir docs/SPECIFICATION.md, section 2)
     1. « fetch »    — la démo est servie en HTTP (GitHub Pages, serveur local).
                       Les vrais fichiers .json sont lus. C'est le mode normal.
     2. « embarqué » — la démo est ouverte en double-clic depuis le disque. Le
                       navigateur refuse fetch() sur file:// : on retombe sur
                       data/referentiel.js, copie générée des mêmes .json.

   Les .json restent la source de vérité. La copie embarquée porte la version de
   chaque fichier source : si les deux sont lisibles et divergent, on le signale
   plutôt que de laisser la démo mentir silencieusement.

   Pour Olaqin : ce double chemin ne concerne que la maquette. En natif, les
   définitions seront lues en base (table SCORE_DEF) ou sur disque.
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  /* Liste explicite des fichiers du référentiel. Ajouter un score = ajouter une
     ligne ici et régénérer data/referentiel.js. Aucun autre code à toucher.   */
  var FICHIERS = {
    scores: [
      'data/scores/score2.json',
      'data/scores/phq9.json',
      'data/scores/hdrs17.json'
    ],
    abaques: [
      'data/scores/score2-abaque-bas-risque.json'
    ],
    mapping: 'data/mapping-cim10.json',
    patients: [
      'data/demo/patient-58-hta.json',
      'data/demo/patient-34-depression.json',
      'data/demo/patient-35-captures.json'
    ]
  };

  var etat = {
    scores: {},       // id -> définition
    abaques: {},       // nom de fichier -> abaque
    mapping: null,
    patients: [],
    origine: null,     // 'fetch' | 'embarque'
    genereLe: null,    // date de génération de la copie embarquée
    divergences: [],
    erreurs: []
  };

  /** Lit un fichier : par le réseau si possible, sinon dans la copie embarquée. */
  function lire(chemin) {
    return fetch(chemin, { cache: 'no-cache' })
      .then(function (reponse) {
        if (!reponse.ok) { throw new Error('HTTP ' + reponse.status); }
        return reponse.json();
      });
  }

  /** Contenu embarqué d'un fichier, ou null s'il n'y est pas. */
  function embarque(chemin) {
    var ref = XMed.referentiel;
    if (!ref || !ref.fichiers) { return null; }
    return Object.prototype.hasOwnProperty.call(ref.fichiers, chemin)
      ? ref.fichiers[chemin] : null;
  }

  /** Tous les chemins déclarés, à plat. */
  function tousLesChemins() {
    return [].concat(FICHIERS.scores, FICHIERS.abaques,
                     [FICHIERS.mapping], FICHIERS.patients);
  }

  function ranger(chemin, contenu) {
    if (FICHIERS.scores.indexOf(chemin) >= 0) {
      etat.scores[contenu.id] = contenu;
    } else if (FICHIERS.abaques.indexOf(chemin) >= 0) {
      etat.abaques[chemin.split('/').pop()] = contenu;
    } else if (chemin === FICHIERS.mapping) {
      etat.mapping = contenu;
    } else {
      etat.patients.push(contenu);
    }
  }

  /**
   * Charge tout le référentiel.
   * Tente le réseau d'abord ; au premier échec, bascule sur la copie embarquée
   * pour l'ensemble — un mélange des deux origines serait ingérable à déboguer.
   */
  function charger() {
    var chemins = tousLesChemins();

    return Promise.all(chemins.map(lire))
      .then(function (contenus) {
        etat.origine = 'fetch';
        contenus.forEach(function (contenu, i) { ranger(chemins[i], contenu); });
        comparerAvecEmbarque(chemins, contenus);
        return etat;
      })
      .catch(function () {
        // file:// ou fichier absent : on repart entièrement de la copie embarquée.
        etat.origine = 'embarque';
        etat.scores = {}; etat.abaques = {}; etat.patients = []; etat.mapping = null;

        var ref = XMed.referentiel;
        if (!ref) {
          etat.erreurs.push(
            'Référentiel introuvable : ni le réseau ni data/referentiel.js. ' +
            'Régénérer la copie embarquée avec outils/generer-referentiel.py.');
          return etat;
        }
        etat.genereLe = ref.genereLe || null;
        chemins.forEach(function (chemin) {
          var contenu = embarque(chemin);
          if (contenu) { ranger(chemin, contenu); }
          else { etat.erreurs.push('Fichier absent de la copie embarquée : ' + chemin); }
        });
        return etat;
      });
  }

  /** Garde-fou anti-dérive entre les .json et la copie embarquée. */
  function comparerAvecEmbarque(chemins, contenus) {
    if (!XMed.referentiel) { return; }
    chemins.forEach(function (chemin, i) {
      var copie = embarque(chemin);
      if (!copie) { return; }
      var vSource = contenus[i] && contenus[i].version;
      var vCopie = copie.version;
      if (vSource && vCopie && vSource !== vCopie) {
        etat.divergences.push(chemin + ' : source ' + vSource + ', copie ' + vCopie);
      }
    });
  }

  /* --- Accès ---------------------------------------------------------------
     Rien ne renvoie de valeur par défaut : un score inconnu vaut null, et
     l'appelant doit s'en apercevoir.                                          */

  XMed.donnees = {
    charger: charger,

    scores: function () {
      return Object.keys(etat.scores).map(function (id) { return etat.scores[id]; });
    },
    score: function (id) { return etat.scores[id] || null; },
    abaque: function (nomFichier) { return etat.abaques[nomFichier] || null; },
    mapping: function () { return etat.mapping; },
    patients: function () { return etat.patients.slice(); },
    patient: function (id) {
      var trouves = etat.patients.filter(function (p) { return p.id === id; });
      return trouves.length ? trouves[0] : null;
    },

    origine: function () { return etat.origine; },
    genereLe: function () { return etat.genereLe; },
    divergences: function () { return etat.divergences.slice(); },
    erreurs: function () { return etat.erreurs.slice(); }
  };

})(window.XMed);

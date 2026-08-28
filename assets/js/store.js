/* ============================================================================
   store.js — Persistance des évaluations et des favoris.
   ----------------------------------------------------------------------------
   Stockage réel : localStorage du navigateur. L'interface est volontairement
   ASYNCHRONE et ne renvoie que des Promise : elle imite un appel serveur, pour
   que la substitution par un accès base XMed soit une simple réécriture du
   corps des fonctions, sans toucher aux vues qui les appellent.

   Modèle de persistance cible côté Olaqin (tables SCORE_EVAL et
   SCORE_EVAL_ITEM) : voir docs/SPECIFICATION.md, section 8.

   Une évaluation enregistrée conserve :
     - la VERSION de la définition utilisée, pour rester relisible telle qu'elle
       a été cotée même si le score évolue ensuite ;
     - l'EPISODE_ID de rattachement, qui doit survivre à la clôture de l'épisode ;
     - l'origine de chaque item pré-rempli (source, date, auto ou modifié).
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var CLE_EVALUATIONS = 'xmed.scores.evaluations.v1';
  var CLE_FAVORIS = 'xmed.scores.favoris.v1';
  var CLE_AMORCE = 'xmed.scores.amorce.v1';

  /* Latence simulée, en millisecondes. Mise à 0 : elle n'apporte rien à la
     démonstration et gênerait la saisie au clavier. Le point est que le code
     appelant est déjà écrit pour attendre.                                    */
  var LATENCE = 0;

  function differer(valeur) {
    if (!LATENCE) { return Promise.resolve(valeur); }
    return new Promise(function (resoudre) {
      setTimeout(function () { resoudre(valeur); }, LATENCE);
    });
  }

  function lireBrut(cle, defaut) {
    try {
      var texte = window.localStorage.getItem(cle);
      return texte ? JSON.parse(texte) : defaut;
    } catch (e) {
      // Navigation privée, stockage plein ou désactivé : la démo continue en
      // mémoire volatile plutôt que de s'arrêter.
      return defaut;
    }
  }

  function ecrireBrut(cle, valeur) {
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* --- Amorçage ------------------------------------------------------------
     Les évaluations de démonstration livrées avec les patients ne sont copiées
     qu'une fois : sinon toute suppression faite pendant une démonstration
     réapparaîtrait au rechargement.                                           */

  function amorcer(patients) {
    if (lireBrut(CLE_AMORCE, false)) { return differer(false); }
    var toutes = [];
    (patients || []).forEach(function (p) {
      (p.evaluationsInitiales || []).forEach(function (ev) {
        var copie = JSON.parse(JSON.stringify(ev));
        copie.patientId = p.id;
        copie.creeLe = copie.creeLe || copie.date;
        copie.sources = copie.sources || {};
        toutes.push(copie);
      });
    });
    ecrireBrut(CLE_EVALUATIONS, toutes);
    ecrireBrut(CLE_AMORCE, true);
    return differer(true);
  }

  /** Remet la démonstration dans son état initial. */
  function reinitialiser() {
    try {
      window.localStorage.removeItem(CLE_EVALUATIONS);
      window.localStorage.removeItem(CLE_FAVORIS);
      window.localStorage.removeItem(CLE_AMORCE);
    } catch (e) { /* rien à faire */ }
    return differer(true);
  }

  /* --- Évaluations --------------------------------------------------------- */

  function toutes() {
    return lireBrut(CLE_EVALUATIONS, []);
  }

  /**
   * Évaluations d'un patient, les plus récentes d'abord.
   * @param {string} patientId
   * @param {string} [scoreId] filtre facultatif
   */
  function evaluations(patientId, scoreId) {
    var liste = toutes().filter(function (ev) {
      return ev.patientId === patientId && (!scoreId || ev.scoreId === scoreId);
    });
    liste.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
    return differer(liste);
  }

  /** Dernière évaluation d'un score pour un patient, ou null. */
  function derniere(patientId, scoreId) {
    return evaluations(patientId, scoreId).then(function (liste) {
      return liste.length ? liste[0] : null;
    });
  }

  /**
   * Enregistre une évaluation : création si elle n'a pas d'identifiant,
   * mise à jour sinon.
   */
  function enregistrer(evaluation) {
    var liste = toutes();
    var copie = JSON.parse(JSON.stringify(evaluation));
    if (!copie.id) {
      copie.id = XMed.outils.identifiant('ev');
      copie.creeLe = new Date().toISOString();
      liste.push(copie);
    } else {
      var remplace = false;
      liste = liste.map(function (ev) {
        if (ev.id === copie.id) { remplace = true; return copie; }
        return ev;
      });
      if (!remplace) { liste.push(copie); }
    }
    var ok = ecrireBrut(CLE_EVALUATIONS, liste);
    if (!ok) {
      return Promise.reject(new Error(
        "Enregistrement impossible : le stockage local du navigateur est " +
        "indisponible ou plein."));
    }
    return differer(copie);
  }

  function supprimer(id) {
    var liste = toutes().filter(function (ev) { return ev.id !== id; });
    ecrireBrut(CLE_EVALUATIONS, liste);
    return differer(true);
  }

  /* --- Favoris par praticien -----------------------------------------------
     Un seul praticien dans la maquette. En natif, la clé porterait aussi
     l'identifiant de l'utilisateur.                                           */

  function favoris() {
    return differer(lireBrut(CLE_FAVORIS, []));
  }

  function basculerFavori(scoreId) {
    var liste = lireBrut(CLE_FAVORIS, []);
    var i = liste.indexOf(scoreId);
    if (i >= 0) { liste.splice(i, 1); } else { liste.push(scoreId); }
    ecrireBrut(CLE_FAVORIS, liste);
    return differer(liste);
  }

  XMed.store = {
    amorcer: amorcer,
    reinitialiser: reinitialiser,
    evaluations: evaluations,
    derniere: derniere,
    enregistrer: enregistrer,
    supprimer: supprimer,
    favoris: favoris,
    basculerFavori: basculerFavori
  };

})(window.XMed);

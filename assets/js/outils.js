/* ============================================================================
   outils.js — Fonctions utilitaires : dates, nombres, chaînes.
   ----------------------------------------------------------------------------
   Aucune dépendance. Chargé en premier.

   Convention de dates dans tout le module :
     - en mémoire et dans les fichiers de données : ISO « AAAA-MM-JJ » ;
     - à l'écran et à la saisie : « JJ/MM/AAAA », comme dans XMed.
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
              'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  var MS_PAR_JOUR = 24 * 60 * 60 * 1000;

  /* --- Dates -------------------------------------------------------------- */

  /** Date du jour, à minuit, pour que les comparaisons de jours soient stables. */
  function aujourdhui() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** « 2026-08-28 » -> objet Date local. Renvoie null si l'entrée est vide. */
  function versDate(iso) {
    if (!iso) { return null; }
    if (iso instanceof Date) { return iso; }
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) { return null; }
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  /** Objet Date -> « 2026-08-28 ». */
  function versIso(date) {
    if (!date) { return null; }
    var m = String(date.getMonth() + 1);
    var j = String(date.getDate());
    return date.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) +
           '-' + (j.length < 2 ? '0' + j : j);
  }

  /** « 2026-08-28 » -> « 28/08/2026 ». Chaîne vide si la date est absente. */
  function dateFr(iso) {
    var d = versDate(iso);
    if (!d) { return ''; }
    var m = String(d.getMonth() + 1);
    var j = String(d.getDate());
    return (j.length < 2 ? '0' + j : j) + '/' +
           (m.length < 2 ? '0' + m : m) + '/' + d.getFullYear();
  }

  /** « 28/08/2026 » -> « 2026-08-28 ». Renvoie null si la saisie est invalide. */
  function isoDepuisFr(texte) {
    var p = String(texte || '').trim().split(/[\/\-.]/);
    if (p.length !== 3) { return null; }
    var j = Number(p[0]), m = Number(p[1]), a = Number(p[2]);
    if (!j || !m || !a || m > 12 || j > 31) { return null; }
    if (a < 100) { a += 2000; }
    var d = new Date(a, m - 1, j);
    // Contrôle de report : le 31/02 deviendrait le 03/03, on le refuse.
    if (d.getDate() !== j || d.getMonth() !== m - 1) { return null; }
    return versIso(d);
  }

  /** « vendredi 28 août 2026 », pour la barre d'état. */
  function dateLongue(date) {
    var d = date || aujourdhui();
    return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] +
           ' ' + d.getFullYear();
  }

  /** « 14:06:36 », pour la barre d'état. */
  function heure(date) {
    var d = date || new Date();
    function dd(n) { return n < 10 ? '0' + n : String(n); }
    return dd(d.getHours()) + ':' + dd(d.getMinutes()) + ':' + dd(d.getSeconds());
  }

  /** Nombre de jours entiers écoulés entre deux dates ISO. */
  function joursEntre(isoDebut, isoFin) {
    var a = versDate(isoDebut), b = versDate(isoFin) || aujourdhui();
    if (!a) { return null; }
    return Math.round((b.getTime() - a.getTime()) / MS_PAR_JOUR);
  }

  /** Âge en années révolues à la date de référence (aujourd'hui par défaut). */
  function age(isoNaissance, isoReference) {
    var n = versDate(isoNaissance);
    if (!n) { return null; }
    var r = versDate(isoReference) || aujourdhui();
    var ans = r.getFullYear() - n.getFullYear();
    var m = r.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && r.getDate() < n.getDate())) { ans -= 1; }
    return ans;
  }

  /** « il y a 3 mois », « il y a 2 ans » — mention de vétusté des sources. */
  function anciennete(iso) {
    var j = joursEntre(iso, null);
    if (j === null) { return ''; }
    if (j < 31) { return 'il y a ' + j + ' jour' + (j > 1 ? 's' : ''); }
    if (j < 365) {
      var mois = Math.round(j / 30.4);
      return 'il y a ' + mois + ' mois';
    }
    var ans = Math.floor(j / 365.25);
    return 'il y a ' + ans + ' an' + (ans > 1 ? 's' : '');
  }

  /* --- Nombres ------------------------------------------------------------ */

  /** Formate avec un nombre fixe de décimales, virgule décimale française. */
  function nombre(valeur, decimales) {
    if (valeur === null || valeur === undefined || valeur === '') { return ''; }
    var n = Number(valeur);
    if (isNaN(n)) { return ''; }
    var d = (decimales === null || decimales === undefined) ? 2 : decimales;
    return n.toFixed(d).replace('.', ',');
  }

  /** Lecture d'une saisie numérique acceptant la virgule décimale. */
  function versNombre(texte) {
    if (texte === null || texte === undefined) { return null; }
    var t = String(texte).trim().replace(',', '.');
    if (t === '') { return null; }
    var n = Number(t);
    return isNaN(n) ? null : n;
  }

  /** Arrondi à n décimales, sans notation exponentielle. */
  function arrondir(valeur, decimales) {
    var f = Math.pow(10, decimales || 0);
    return Math.round(valeur * f) / f;
  }

  /* --- Chaînes ------------------------------------------------------------ */

  /** Minuscules sans accent, pour les comparaisons de libellés et la recherche. */
  function normaliser(texte) {
    return String(texte || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Un code CIM-10 correspond-il à un préfixe ?
   * Le rattachement se fait par préfixe : « F32 » couvre F32.0 à F32.9.
   * La comparaison ignore les points et la casse pour absorber les variantes
   * de saisie (« E78.0 », « E780 », « e78.0 »).
   */
  function codeCommencePar(code, prefixe) {
    if (!code || !prefixe) { return false; }
    var c = String(code).toUpperCase().replace(/\./g, '');
    var p = String(prefixe).toUpperCase().replace(/\./g, '');
    return c.indexOf(p) === 0;
  }

  /** Identifiant unique pour une évaluation enregistrée. */
  function identifiant(prefixe) {
    return (prefixe || 'ev') + '-' + Date.now().toString(36) +
           '-' + Math.floor(Math.random() * 1e6).toString(36);
  }

  XMed.outils = {
    aujourdhui: aujourdhui,
    versDate: versDate,
    versIso: versIso,
    dateFr: dateFr,
    isoDepuisFr: isoDepuisFr,
    dateLongue: dateLongue,
    heure: heure,
    joursEntre: joursEntre,
    age: age,
    anciennete: anciennete,
    nombre: nombre,
    versNombre: versNombre,
    arrondir: arrondir,
    normaliser: normaliser,
    codeCommencePar: codeCommencePar,
    identifiant: identifiant
  };

})(window.XMed);

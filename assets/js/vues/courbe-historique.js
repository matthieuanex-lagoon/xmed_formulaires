/* ============================================================================
   vues/courbe-historique.js — Écran 4.5 : évolution d'un score dans le temps.
   ----------------------------------------------------------------------------
   SVG tracé à la main, aucune librairie. Bandes de fond matérialisant les
   seuils d'interprétation, points cliquables pour recharger une évaluation en
   lecture seule.

   Profondeur affichée : tout l'historique.

   Quand aucune évaluation ne porte de valeur exploitable — c'est le cas de
   SCORE2 tant que l'abaque n'est pas renseigné — la courbe le DIT au lieu de
   dessiner une ligne plate à zéro.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.vues = window.XMed.vues || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;
  var el = ui.el;
  var outils = XMed.outils;

  var NS = 'http://www.w3.org/2000/svg';

  var MARGE = { haut: 8, droite: 10, bas: 20, gauche: 42 };

  function balise(nom, attributs, enfants) {
    var noeud = document.createElementNS(NS, nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      if (attributs[cle] === null || attributs[cle] === undefined) { return; }
      noeud.setAttribute(cle, attributs[cle]);
    });
    (Array.isArray(enfants) ? enfants : [enfants]).forEach(function (e) {
      if (e) { noeud.appendChild(e); }
    });
    return noeud;
  }

  /**
   * @param {{definition, evaluations, largeur, hauteur, surPoint}} options
   *        evaluations : les plus récentes d'abord (ordre du store)
   * @returns {Node}
   */
  function rendre(options) {
    var definition = options.definition;
    var largeur = options.largeur || 640;
    var hauteur = options.hauteur || 132;

    var points = (options.evaluations || [])
      .filter(function (ev) {
        return ev.resultat && ev.resultat.valeur !== null && ev.resultat.valeur !== undefined;
      })
      .map(function (ev) {
        return { date: ev.date, valeur: Number(ev.resultat.valeur), evaluation: ev };
      })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });

    if (points.length === 0) {
      var total = (options.evaluations || []).length;
      return el('div', { class: 'xm-courbe xm-courbe--vide' },
        total === 0
          ? 'Aucune évaluation enregistrée : pas de courbe.'
          : total + ' évaluation' + (total > 1 ? 's' : '') + ' enregistrée' +
            (total > 1 ? 's' : '') + ', aucune valeur exploitable — ' +
            'la courbe reste vide tant que le calcul n\'aboutit pas.');
    }

    /* --- Échelles ---------------------------------------------------------- */

    var tranches = jeuDeTranchesPour(definition, options.evaluations);
    var bornes = bornesVerticales(definition, tranches, points);

    var x0 = MARGE.gauche, x1 = largeur - MARGE.droite;
    var y0 = MARGE.haut, y1 = hauteur - MARGE.bas;

    var tMin = outils.versDate(points[0].date).getTime();
    var tMax = outils.versDate(points[points.length - 1].date).getTime();
    if (tMax === tMin) { tMin -= 86400000; tMax += 86400000; }

    function px(date) {
      var t = outils.versDate(date).getTime();
      return x0 + (x1 - x0) * (t - tMin) / (tMax - tMin);
    }
    function py(valeur) {
      var v = Math.max(bornes.min, Math.min(bornes.max, valeur));
      return y1 - (y1 - y0) * (v - bornes.min) / (bornes.max - bornes.min);
    }

    var enfants = [];

    /* --- Bandes de seuils --------------------------------------------------- */

    (tranches || []).forEach(function (t) {
      var bas = (t.min === null || t.min === undefined) ? bornes.min : t.min;
      var haut = (t.max === null || t.max === undefined) ? bornes.max : t.max;
      if (haut <= bornes.min || bas >= bornes.max) { return; }
      var yHaut = py(Math.min(haut, bornes.max));
      var yBas = py(Math.max(bas, bornes.min));
      enfants.push(balise('rect', {
        x: x0, y: yHaut, width: x1 - x0, height: Math.max(1, yBas - yHaut),
        class: 'xm-courbe__bande xm-courbe__bande--' + (t.couleur || 'neutre')
      }));
    });

    /* --- Axes --------------------------------------------------------------- */

    enfants.push(balise('line', { x1: x0, y1: y0, x2: x0, y2: y1, class: 'xm-courbe__axe' }));
    enfants.push(balise('line', { x1: x0, y1: y1, x2: x1, y2: y1, class: 'xm-courbe__axe' }));

    [bornes.min, bornes.max].forEach(function (v) {
      enfants.push(balise('text', {
        x: x0 - 5, y: py(v) + 3, class: 'xm-courbe__graduation', 'text-anchor': 'end'
      }, document.createTextNode(outils.nombre(v, bornes.decimales))));
    });

    /* --- Ligne et points ----------------------------------------------------- */

    var chemin = points.map(function (p, i) {
      return (i ? 'L' : 'M') + px(p.date).toFixed(1) + ' ' + py(p.valeur).toFixed(1);
    }).join(' ');
    enfants.push(balise('path', { d: chemin, class: 'xm-courbe__ligne' }));

    points.forEach(function (p) {
      var cx = px(p.date), cy = py(p.valeur);
      var cercle = balise('circle', {
        cx: cx, cy: cy, r: 4, class: 'xm-courbe__point',
        tabindex: '0',
        role: 'button'
      }, balise('title', {}, document.createTextNode(
        outils.dateFr(p.date) + ' : ' + outils.nombre(p.valeur, bornes.decimales) +
        (p.evaluation.resultat.unite ? ' ' + p.evaluation.resultat.unite : '') +
        (p.evaluation.resultat.interpretation ? ' — ' + p.evaluation.resultat.interpretation : ''))));

      if (options.surPoint) {
        cercle.addEventListener('click', function () { options.surPoint(p.evaluation); });
        cercle.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault(); options.surPoint(p.evaluation);
          }
        });
      }
      enfants.push(cercle);

      enfants.push(balise('text', {
        x: cx, y: y1 + 13, class: 'xm-courbe__graduation', 'text-anchor': 'middle'
      }, document.createTextNode(outils.dateFr(p.date).slice(3))));
    });

    var svg = balise('svg', {
      class: 'xm-courbe__svg',
      viewBox: '0 0 ' + largeur + ' ' + hauteur,
      preserveAspectRatio: 'none',
      width: '100%', height: hauteur
    }, enfants);

    return el('div', { class: 'xm-courbe' }, [
      svg,
      el('div', { class: 'xm-mention',
                  texte: points.length + ' évaluation' + (points.length > 1 ? 's' : '') +
                         ' — cliquer un point pour la relire en lecture seule' })
    ]);
  }

  /** Jeu de tranches applicable, calé sur l'évaluation la plus récente. */
  function jeuDeTranchesPour(definition, evaluations) {
    var reference = (evaluations || []).filter(function (ev) { return ev.valeurs; })[0];
    var jeu = XMed.moteur.jeuDeTranches(definition, reference ? reference.valeurs : null);
    return jeu ? jeu.tranches : null;
  }

  /** Bornes verticales : celles du score si connues, sinon celles des points. */
  function bornesVerticales(definition, tranches, points) {
    var calcul = definition.calcul || {};
    var decimales = calcul.decimales || 0;

    if (calcul.type === 'somme' || calcul.type === 'pondere') {
      return { min: calcul.min || 0, max: calcul.max, decimales: decimales };
    }

    var valeurs = points.map(function (p) { return p.valeur; });
    var maxTranche = 0;
    (tranches || []).forEach(function (t) {
      if (t.max !== null && t.max !== undefined) { maxTranche = Math.max(maxTranche, t.max); }
    });
    var max = Math.max.apply(null, valeurs.concat([maxTranche || 0]));
    if (!max) { max = 1; }
    return { min: 0, max: Math.ceil(max * 1.15), decimales: decimales };
  }

  XMed.vues.courbeHistorique = { rendre: rendre };

})(window.XMed);

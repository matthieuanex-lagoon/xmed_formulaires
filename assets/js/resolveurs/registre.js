/* ============================================================================
   resolveurs/registre.js — Enregistrement et exécution des résolveurs.
   ----------------------------------------------------------------------------
   Un résolveur traduit la déclaration « resolveur » d'un item en une valeur
   tirée du dossier patient.

   RÈGLES IMPÉRATIVES — elles priment sur toute considération de confort.

   1. AUCUNE VALEUR PAR DÉFAUT, JAMAIS.
      Si la donnée n'est pas trouvée, ou si elle dépasse fraicheurMaxJours,
      l'item reste VIDE. Un item vide est une information exacte ; une valeur
      inventée est une erreur clinique.

   2. VÉTUSTÉ EXPLICITE.
      Une donnée trouvée mais dont l'ancienneté dépasse la moitié de
      fraicheurMaxJours est proposée avec la mention « ancienne » et sa date,
      visibles dans l'info-bulle de l'item.

   3. CONVERSION D'UNITÉS TOUJOURS AFFICHÉE.
      « 2.31 g/l -> 5.97 mmol/l », jamais une conversion silencieuse. La valeur
      source et l'unité source sont conservées dans le résultat.

   4. PLUSIEURS RÉSULTATS : LE PLUS RÉCENT.
      Les autres restent consultables ; c'est au résolveur de type de trier.

   5. RIEN N'EST VERROUILLÉ.
      Une valeur pré-remplie reste modifiable. Une modification manuelle fait
      passer la mention de « Auto » à « Modifié » et conserve l'origine.

   Forme d'un résultat de résolution :
     {
       valeur, unite,                  valeur finale, après conversion
       valeurSource, uniteSource,      telles qu'elles figurent au dossier
       type,                           'biologie', 'demographie', ...
       libelleSource,                  « Cholestérol total — Biolab (HPRIM) »
       dateSource,                     ISO ou null
       confiance,                      'exacte' | 'vetuste'
       anormal,                        valeur hors normes au dossier
       conversion                      { de, vers, facteur } ou null
     }
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.resolveurs = window.XMed.resolveurs || {};

(function (XMed) {
  'use strict';

  var outils = XMed.outils;
  var types = {};

  /** Déclare un résolveur pour un type d'item. */
  function enregistrer(type, fonction) {
    types[type] = fonction;
  }

  /** Types disponibles, pour la documentation et les contrôles de cohérence. */
  function typesConnus() {
    return Object.keys(types);
  }

  /**
   * Résout un item.
   * @param {Object|Array|null} declaration champ « resolveur » de l'item
   * @param {Object} dossier façade XMed.Dossier
   * @returns {Object|null} résultat de résolution, ou null si rien de fiable
   */
  function resoudre(declaration, dossier) {
    if (!declaration) { return null; }

    // Un item peut déclarer plusieurs sources, essayées dans l'ordre.
    var liste = Array.isArray(declaration) ? declaration : [declaration];
    for (var i = 0; i < liste.length; i++) {
      var resultat = executer(liste[i], dossier);
      if (resultat) { return resultat; }
    }
    return null;
  }

  function executer(declaration, dossier) {
    var fonction = types[declaration.type];
    if (!fonction) { return null; }

    var brut = fonction(declaration, dossier);
    if (!brut || brut.valeur === null || brut.valeur === undefined) { return null; }

    // Règle 2 : fraîcheur. Une donnée trop ancienne n'est pas proposée du tout.
    var confiance = 'exacte';
    if (declaration.fraicheurMaxJours && brut.dateSource) {
      var jours = outils.joursEntre(brut.dateSource, null);
      if (jours !== null) {
        if (jours > declaration.fraicheurMaxJours) { return null; }
        if (jours > declaration.fraicheurMaxJours / 2) { confiance = 'vetuste'; }
      }
    }

    // Règle 3 : conversion d'unité, conservée et affichable.
    var valeur = brut.valeur;
    var unite = brut.unite || null;
    var conversion = null;
    var regles = declaration.conversions || null;
    if (regles && unite && Object.prototype.hasOwnProperty.call(regles, unite)) {
      var regle = regles[unite];
      valeur = valeur * regle.facteur;
      conversion = { de: unite, vers: regle.vers, facteur: regle.facteur };
      unite = regle.vers;
    }

    return {
      valeur: valeur,
      unite: unite,
      valeurSource: brut.valeur,
      uniteSource: brut.unite || null,
      type: declaration.type,
      libelleSource: brut.libelleSource || '',
      dateSource: brut.dateSource || null,
      confiance: confiance,
      anormal: !!brut.anormal,
      conversion: conversion
    };
  }

  /**
   * Texte d'info-bulle décrivant l'origine d'une valeur pré-remplie.
   * Il doit permettre au médecin de savoir d'où sort le chiffre sans quitter
   * la fenêtre.
   */
  function descriptionSource(resolution, decimales) {
    if (!resolution) { return ''; }
    var lignes = [];
    var tete = resolution.libelleSource;
    if (resolution.valeurSource !== null && resolution.valeurSource !== undefined
        && resolution.uniteSource) {
      tete += ' ' + outils.nombre(resolution.valeurSource, decimales === 0 ? 0 : 2) +
              ' ' + resolution.uniteSource;
    }
    if (resolution.dateSource) {
      tete += ' — ' + outils.dateFr(resolution.dateSource);
    }
    lignes.push(tete);

    if (resolution.conversion) {
      lignes.push('Converti en ' + outils.nombre(resolution.valeur, decimales) +
                  ' ' + resolution.unite + ' (facteur ' +
                  resolution.conversion.facteur + ').');
    }
    if (resolution.confiance === 'vetuste') {
      lignes.push('Donnée ancienne (' + outils.anciennete(resolution.dateSource) +
                  ') : à confirmer.');
    }
    if (resolution.anormal) {
      lignes.push('Valeur signalée hors normes au dossier.');
    }
    lignes.push('Valeur modifiable.');
    return lignes.join('\n');
  }

  XMed.resolveurs.enregistrer = enregistrer;
  XMed.resolveurs.resoudre = resoudre;
  XMed.resolveurs.typesConnus = typesConnus;
  XMed.resolveurs.descriptionSource = descriptionSource;

})(window.XMed);

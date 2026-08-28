/* ============================================================================
   resolveurs/antecedent.js — Source : cadres « Episodes fermés (ATCD) » et
   « Episodes et suivis en cours », par code CIM-10.
   ----------------------------------------------------------------------------
   Déclaration attendue :
     { "type": "antecedent", "codesCim10": ["E10", "E11"] }

   Sert aujourd'hui aux règles d'exclusion de SCORE2, et servira au futur
   CHA2DS2-VASc, dont la quasi-totalité des items sont des antécédents codés.

   Le rattachement se fait par PRÉFIXE : « I25 » couvre I25.0 à I25.9. Un
   préfixe plus précis reste plus précis : « E78.01 » (hypercholestérolémie
   familiale) ne correspond pas à un épisode codé « E78.0 ».

   POINT IMPORTANT — le résolveur ne renvoie une valeur que s'il TROUVE quelque
   chose. Ne rien trouver ne prouve pas l'absence de la pathologie, seulement
   qu'elle n'est pas codée dans ce dossier. Les bandeaux d'éligibilité le
   rappellent au clinicien.
   ========================================================================== */
(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  XMed.resolveurs.enregistrer('antecedent', function (declaration, dossier) {
    var prefixes = declaration.codesCim10 || [];
    if (!prefixes.length) { return null; }

    var trouves = dossier.antecedents().filter(function (e) {
      return prefixes.some(function (p) { return outils.codeCommencePar(e.cim10, p); });
    });

    if (!trouves.length) { return null; }

    // Le plus récent : c'est celui qui décrit le mieux l'état actuel.
    trouves.sort(function (a, b) { return (b.debut || '').localeCompare(a.debut || ''); });
    var e = trouves[0];

    return {
      valeur: true,
      unite: null,
      dateSource: e.debut || null,
      libelleSource: 'Épisode « ' + e.libelle + ' » (' + (e.cim10 || 'non codé') + ')' +
                     (e.debut ? ' — depuis le ' + outils.dateFr(e.debut) : '') +
                     (e.fin ? ', clos le ' + outils.dateFr(e.fin) : ''),
      anormal: false,
      episode: e
    };
  });

})(window.XMed);

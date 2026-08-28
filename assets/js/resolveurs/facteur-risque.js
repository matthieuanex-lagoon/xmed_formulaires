/* ============================================================================
   resolveurs/facteur-risque.js — Source : cadre « Facteurs de risque ».
   ----------------------------------------------------------------------------
   Déclaration attendue :
     { "type": "facteurRisque",
       "libelles": ["Tabagisme actif", "Tabac"],
       "fraicheurMaxJours": 1825 }

   POINT IMPORTANT — l'absence d'un facteur de risque au dossier ne vaut PAS
   « absent chez le patient ». Le résolveur renvoie donc null (item vide) et non
   « false » lorsqu'il ne trouve rien : c'est au clinicien de cocher
   « Non-fumeur » s'il le constate. Répondre false à sa place reviendrait à
   remplir un facteur de risque cardio-vasculaire sur un silence du dossier.

   XMed n'expose pas de codage normalisé des facteurs de risque : le
   rattachement se fait sur les libellés locaux, comparés sans accent ni casse.
   ========================================================================== */
(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  XMed.resolveurs.enregistrer('facteurRisque', function (declaration, dossier) {
    var attendus = (declaration.libelles || []).map(outils.normaliser);
    if (!attendus.length) { return null; }

    var candidats = dossier.facteursRisque().filter(function (f) {
      if (f.actif === false) { return false; }
      var libelle = outils.normaliser(f.libelle);
      return attendus.some(function (attendu) {
        return libelle === attendu || libelle.indexOf(attendu) >= 0;
      });
    });

    if (!candidats.length) { return null; }

    // Le plus récemment saisi fait foi.
    candidats.sort(function (a, b) {
      return (b.debut || '').localeCompare(a.debut || '');
    });
    var f = candidats[0];

    return {
      valeur: true,
      unite: null,
      dateSource: f.debut || null,
      libelleSource: 'Facteur de risque « ' + f.libelle + ' »' +
                     (f.debut ? ' — saisi le ' + outils.dateFr(f.debut) : '') +
                     (f.notes ? ' (' + f.notes + ')' : ''),
      anormal: false
    };
  });

})(window.XMed);

/* ============================================================================
   resolveurs/traitement.js — Source : cadre « Traitements », par code ATC.
   ----------------------------------------------------------------------------
   Déclaration attendue :
     { "type": "traitement", "code": { "atc": "C09" } }

   Rattachement par PRÉFIXE ATC : « C09 » couvre tous les médicaments agissant
   sur le système rénine-angiotensine, « C09AA05 » ne couvre que le ramipril.
   C'est ce qui permet de coder un item « hypertension traitée » sans lister
   toutes les spécialités.

   Aucun item du périmètre actuel ne s'en sert : le résolveur est écrit et
   enregistré pour que le contrat des cinq familles soit complet et testable.

   Comme les autres : ne rien trouver laisse l'item vide, jamais « non traité ».
   ========================================================================== */
(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  XMed.resolveurs.enregistrer('traitement', function (declaration, dossier) {
    var code = declaration.code || {};
    var atc = code.atc || null;
    var libelles = (code.libellesLocaux || []).map(outils.normaliser);
    if (!atc && !libelles.length) { return null; }

    var trouves = dossier.traitements().filter(function (t) {
      if (atc && t.atc && String(t.atc).toUpperCase().indexOf(atc.toUpperCase()) === 0) {
        return true;
      }
      var libelle = outils.normaliser(t.libelle);
      return libelles.some(function (attendu) { return libelle.indexOf(attendu) >= 0; });
    });

    if (!trouves.length) { return null; }

    trouves.sort(function (a, b) {
      return (b.dernier || '').localeCompare(a.dernier || '');
    });
    var t = trouves[0];

    return {
      valeur: true,
      unite: null,
      dateSource: t.dernier || null,
      libelleSource: 'Traitement « ' + t.libelle + ' » (' + (t.atc || 'sans code ATC') + ')' +
                     (t.dernier ? ' — dernière prescription le ' + outils.dateFr(t.dernier) : ''),
      anormal: false
    };
  });

})(window.XMed);

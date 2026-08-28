/* ============================================================================
   resolveurs/demographie.js — Source : cadre « Identité » du dossier.
   ----------------------------------------------------------------------------
   Déclaration attendue :
     { "type": "demographie", "champ": "age" }
     { "type": "demographie", "champ": "sexe" }

   L'âge est recalculé à la date du jour, il n'est jamais stocké : une
   évaluation ouverte l'an prochain doit repartir de l'âge de l'an prochain.
   Pas de date de source : la donnée est par construction à jour.
   ========================================================================== */
(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  XMed.resolveurs.enregistrer('demographie', function (declaration, dossier) {
    var demo = dossier.demographie();

    if (declaration.champ === 'age') {
      if (demo.age === null || demo.age === undefined) { return null; }
      return {
        valeur: demo.age,
        unite: 'ans',
        dateSource: null,
        libelleSource: 'Identité — né' + (demo.sexe === 'femme' ? 'e' : '') +
                       ' le ' + outils.dateFr(demo.dateNaissance),
        anormal: false
      };
    }

    if (declaration.champ === 'sexe') {
      if (!demo.sexe) { return null; }
      return {
        valeur: demo.sexe,
        unite: null,
        dateSource: null,
        libelleSource: 'Identité — sexe renseigné au dossier',
        anormal: false
      };
    }

    // Champ non géré : on ne devine pas, l'item reste vide.
    return null;
  });

})(window.XMed);

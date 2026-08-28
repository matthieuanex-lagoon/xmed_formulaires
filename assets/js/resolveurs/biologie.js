/* ============================================================================
   resolveurs/biologie.js — Source : cadre « Eléments de suivi (Biologie) ».
   ----------------------------------------------------------------------------
   Structure calquée sur une intégration HPRIM 2.1 : chaque résultat porte un
   code LOINC, un libellé local, une valeur, une unité, une date, et
   éventuellement une seconde valeur avec sa propre unité (la ligne
   « Créatinine 11.9 mg/l — 105.3 µmol/l » des captures, ou « PAS/PAD »).

   Déclaration attendue :
     { "type": "biologie",
       "champ": "valeur",                        "valeur" (défaut) ou "valeur2"
       "code": { "loinc": "2093-3",
                 "libellesLocaux": ["Cholestérol total", "CHOL T"] },
       "fraicheurMaxJours": 1095,
       "conversions": { "g/l": { "vers": "mmol/l", "facteur": 2.586 } } }

   Ordre de recherche :
     1. code LOINC — seul rattachement fiable ;
     2. libellé local, sans accent ni casse — repli quand le LOINC manque, ce
        qui arrive sur les mesures saisies au cabinet (PAS/PAD, poids).

   Plusieurs résultats disponibles : le plus récent est proposé. Les autres
   restent lisibles dans le cadre Biologie du dossier.
   ========================================================================== */
(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  XMed.resolveurs.enregistrer('biologie', function (declaration, dossier) {
    var code = declaration.code || {};
    var loinc = code.loinc || null;
    var libelles = (code.libellesLocaux || []).map(outils.normaliser);
    var champ = declaration.champ === 'valeur2' ? 'valeur2' : 'valeur';

    var lignes = dossier.biologie().filter(function (l) {
      if (l[champ] === null || l[champ] === undefined) { return false; }
      if (loinc && l.loinc === loinc) { return true; }
      var libelle = outils.normaliser(l.libelle);
      return libelles.some(function (attendu) { return libelle === attendu; });
    });

    if (!lignes.length) { return null; }

    // Règle 4 : le plus récent.
    lignes.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var ligne = lignes[0];

    var unite = champ === 'valeur2' ? (ligne.unite2 || null) : (ligne.unite || null);
    var autres = lignes.length - 1;

    return {
      valeur: ligne[champ],
      unite: unite,
      dateSource: ligne.date || null,
      libelleSource: ligne.libelle +
        (ligne.laboratoire ? ' — ' + ligne.laboratoire : '') +
        (autres > 0 ? ' (' + autres + ' résultat' + (autres > 1 ? 's' : '') +
                      ' plus ancien' + (autres > 1 ? 's' : '') + ' au dossier)' : ''),
      anormal: !!ligne.anormal
    };
  });

})(window.XMed);

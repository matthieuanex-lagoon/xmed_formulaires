/* ============================================================================
   rattachement.js — Quels scores proposer, et pourquoi.
   ----------------------------------------------------------------------------
   Deux voies de rattachement, volontairement distinguées :

     'cim10'         le code CIM-10 de l'épisode sélectionné correspond à un
                     préfixe déclaré dans data/mapping-cim10.json ;
     'facteurRisque' un facteur de risque du patient déclenche le score, quel
                     que soit l'épisode ouvert (SCORE2 chez un patient tabagique
                     sans épisode I10).

   POURQUOI LES DISTINGUER — le bouton contextuel s'intitule « Scores de cet
   épisode ». Un score proposé par un facteur de risque du patient n'est PAS un
   score de cet épisode : sur un épisode de lombalgie chez un patient fumeur,
   annoncer SCORE2 comme « score de cet épisode » serait faux. Les deux voies
   sont donc portées séparément jusqu'à l'affichage, qui adapte son libellé.
   C'est un point à arbitrer (point ouvert 10 de la spécification).

   Le rattachement est réévalué à chaque changement de ligne dans la grille.
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  /**
   * Scores rattachés à un épisode, pour un dossier donné.
   *
   * @returns {{parEpisode:Array, parFacteurRisque:Array, tous:Array}}
   *          chaque entrée : { id, pertinence, disponible, origine, motif,
   *                            definition }
   */
  function pourEpisode(episode, dossier) {
    var mapping = XMed.donnees.mapping() || {};
    var parEpisode = [];
    var parFacteurRisque = [];
    var vus = {};

    // Voie 1 : code CIM-10 de l'épisode, par préfixe.
    if (episode && episode.cim10) {
      (mapping.parCim10 || []).forEach(function (entree) {
        if (!outils.codeCommencePar(episode.cim10, entree.prefixe)) { return; }
        (entree.scores || []).forEach(function (s) {
          if (vus[s.id]) { return; }
          vus[s.id] = true;
          parEpisode.push(decrire(s, 'cim10',
            'code ' + episode.cim10 + ' — ' + entree.libelle));
        });
      });
    }

    // Voie 2 : facteurs de risque du patient.
    (mapping.parFacteurRisque || []).forEach(function (entree) {
      var attendus = (entree.libelles || []).map(outils.normaliser);
      var trouve = dossier.facteursRisque().filter(function (f) {
        if (f.actif === false) { return false; }
        var libelle = outils.normaliser(f.libelle);
        return attendus.some(function (a) { return libelle === a || libelle.indexOf(a) >= 0; });
      });
      if (!trouve.length) { return; }
      (entree.scores || []).forEach(function (s) {
        if (vus[s.id]) { return; }
        vus[s.id] = true;
        parFacteurRisque.push(decrire(s, 'facteurRisque',
          'facteur de risque « ' + trouve[0].libelle + ' »'));
      });
    });

    parEpisode.sort(parPertinence);
    parFacteurRisque.sort(parPertinence);

    return {
      parEpisode: parEpisode,
      parFacteurRisque: parFacteurRisque,
      tous: parEpisode.concat(parFacteurRisque)
    };
  }

  function decrire(entree, origine, motif) {
    return {
      id: entree.id,
      pertinence: entree.pertinence || 99,
      disponible: entree.disponible !== false,
      origine: origine,
      motif: motif,
      definition: XMed.donnees.score(entree.id)
    };
  }

  function parPertinence(a, b) { return a.pertinence - b.pertinence; }

  /**
   * Libellé du bouton contextuel.
   * « Scores de cet épisode (2) » quand le rattachement vient du code CIM-10 ;
   * « Scores proposés (1) » quand il ne vient que des facteurs de risque.
   */
  function libelleBouton(rattachement) {
    var total = rattachement.tous.length;
    if (!total) { return null; }
    if (rattachement.parEpisode.length) {
      return 'Scores de cet épisode (' + total + ')';
    }
    return 'Scores proposés (' + total + ')';
  }

  XMed.rattachement = {
    pourEpisode: pourEpisode,
    libelleBouton: libelleBouton
  };

})(window.XMed);

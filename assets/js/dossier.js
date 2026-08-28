/* ============================================================================
   dossier.js — Façade d'accès au dossier patient.
   ----------------------------------------------------------------------------
   POUR OLAQIN : CE FICHIER EST LE CONTRAT.

   C'est le seul point par lequel le module lit le dossier. Les résolveurs ne
   parlent qu'à lui, jamais aux données brutes. Pour brancher le module sur le
   vrai dossier XMed, il suffit de réimplémenter les six méthodes ci-dessous ;
   rien d'autre ne change.

   Ce que XMed doit exposer :

     demographie()     -> { dateNaissance, age, sexe, nom, prenom, civilite, ... }
     facteursRisque()  -> [ { libelle, debut, actif, notes } ]
     episodes()        -> [ { id, libelle, cim10, debut, dernierContact, ... } ]   épisodes en cours
     episodesFermes()  -> [ { id, libelle, cim10, debut, fin, notes } ]            ATCD
     antecedents()     -> episodes() + episodesFermes(), pour les règles portant
                          sur un antécédent codé quel que soit son état
     biologie()        -> [ { loinc, libelle, valeur, unite, valeur2, unite2,
                              date, anormal, laboratoire } ]
     traitements()     -> [ { atc, libelle, dernier, periodicite } ]

   Points durs identifiés, à confirmer côté XMed :
     - la biologie doit remonter le CODE LOINC issu de l'intégration HPRIM, pas
       seulement le libellé local ; sans lui, le rattachement d'un item à un
       examen repose sur des chaînes de caractères et devient fragile ;
     - l'unité et la date de prélèvement sont indispensables : sans elles, ni
       conversion ni contrôle de fraîcheur ;
     - les épisodes doivent remonter leur code CIM-10, y compris après clôture.
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  /**
   * Construit une façade autour d'un dossier de démonstration.
   * @param {Object} brut contenu d'un fichier data/demo/*.json
   */
  function Dossier(brut) {
    if (!(this instanceof Dossier)) { return new Dossier(brut); }
    this.brut = brut || {};
  }

  Dossier.prototype.id = function () { return this.brut.id; };

  Dossier.prototype.demographie = function () {
    var i = this.brut.identite || {};
    return {
      civilite: i.civilite || '',
      nom: i.nom || '',
      prenom: i.prenom || '',
      dateNaissance: i.dateNaissance || null,
      age: outils.age(i.dateNaissance),
      sexe: i.sexe || null,
      adresse: i.adresse || '',
      codePostal: i.codePostal || '',
      ville: i.ville || '',
      telDomicile: i.telDomicile || '',
      gsm: i.gsm || '',
      mel: i.mel || '',
      numeroSecu: i.numeroSecu || '',
      medecinTraitant: i.medecinTraitant || '',
      profession: i.profession || '',
      notesPubliques: i.notesPubliques || '',
      ald: !!i.ald,
      dossier: this.brut.dossier || ''
    };
  };

  /** Libellé d'en-tête de fenêtre, au format XMed. */
  Dossier.prototype.libelleEntete = function () {
    var d = this.demographie();
    var sexe = d.sexe === 'femme' ? 'Féminin' : 'Masculin';
    return d.dossier + ' - ' + d.civilite + ' ' + d.nom + ' ' + d.prenom +
           ' né' + (d.sexe === 'femme' ? 'e' : '') + ' le ' + outils.dateFr(d.dateNaissance) +
           ' (' + d.age + ' ans) ' + sexe + '  (' + (d.ald ? 'ALD' : 'sans ALD') + ')';
  };

  Dossier.prototype.facteursRisque = function () {
    return (this.brut.facteursRisque || []).slice();
  };

  Dossier.prototype.episodes = function () {
    return (this.brut.episodes || []).slice();
  };

  Dossier.prototype.episodesFermes = function () {
    return (this.brut.episodesFermes || []).slice();
  };

  /** Épisodes ouverts et clos réunis : c'est ce que lit le résolveur d'antécédent. */
  Dossier.prototype.antecedents = function () {
    return this.episodes().concat(this.episodesFermes());
  };

  Dossier.prototype.episode = function (id) {
    var trouves = this.episodes().filter(function (e) { return e.id === id; });
    return trouves.length ? trouves[0] : null;
  };

  Dossier.prototype.biologie = function () {
    return (this.brut.biologie || []).slice();
  };

  Dossier.prototype.traitements = function () {
    return (this.brut.traitements || []).slice();
  };

  Dossier.prototype.evaluationsInitiales = function () {
    return (this.brut.evaluationsInitiales || []).slice();
  };

  XMed.Dossier = Dossier;

})(window.XMed);

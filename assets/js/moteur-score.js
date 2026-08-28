/* ============================================================================
   moteur-score.js — Éligibilité, calcul, interprétation, complétude, alertes.
   ----------------------------------------------------------------------------
   POUR OLAQIN : C'EST LE FICHIER À RÉÉCRIRE À L'IDENTIQUE.

   Il ne touche pas au DOM et ne connaît ni localStorage ni le navigateur : il
   est testable sans écran. Il ne contient AUCUN cas particulier nommé
   « SCORE2 » ou « PHQ-9 » — tout ce qui varie d'un score à l'autre vient du
   fichier de définition.

   Deux invariants tiennent partout :
     - le moteur ne lève jamais d'exception métier ; il renvoie un résultat
       explicite portant un motif ;
     - une donnée absente reste absente : rien n'est complété d'office.
   ========================================================================== */
window.XMed = window.XMed || {};

(function (XMed) {
  'use strict';

  var outils = XMed.outils;

  /* ==========================================================================
     Accès à la définition
     ========================================================================== */

  function itemsParId(definition) {
    var index = {};
    (definition.items || []).forEach(function (item) { index[item.id] = item; });
    return index;
  }

  /** Modalités applicables à un item : les siennes écrasent les communes. */
  function modalitesDe(definition, item) {
    if (item.modalites) { return item.modalites; }
    return definition.modalitesCommunes || null;
  }

  /** Modalité de cotation maximale d'un item, pour le contrôle de cohérence. */
  function cotationMax(definition, item) {
    var modalites = modalitesDe(definition, item);
    if (!modalites) { return null; }
    var valeurs = modalites
      .map(function (m) { return m.valeur; })
      .filter(function (v) { return typeof v === 'number'; });
    return valeurs.length ? Math.max.apply(null, valeurs) : null;
  }

  function estVide(valeur) {
    return valeur === null || valeur === undefined || valeur === '';
  }

  /* ==========================================================================
     Validation d'une définition, au chargement
     Mieux vaut refuser une définition incohérente que calculer faux.
     ========================================================================== */

  function valider(definition, abaque) {
    var erreurs = [];
    var items = definition.items || [];
    var index = itemsParId(definition);

    if (items.length !== Object.keys(index).length) {
      erreurs.push('Deux items portent le même identifiant.');
    }

    items.forEach(function (item) {
      if (item.type === 'calcule') {
        if (!item.operation) {
          erreurs.push('Item ' + item.id + ' de type calculé sans opération.');
        } else {
          (item.operation.operandes || []).forEach(function (op) {
            if (typeof op === 'string' && !index[op]) {
              erreurs.push('Item ' + item.id + ' : opérande inconnu « ' + op + ' ».');
            }
          });
        }
      } else if (item.type === 'enumere' || item.type === 'booleen') {
        if (!item.modalites) {
          erreurs.push('Item ' + item.id + ' de type ' + item.type + ' sans modalités.');
        }
      } else if (item.type === 'ordinal') {
        if (!modalitesDe(definition, item)) {
          erreurs.push('Item ' + item.id + ' ordinal sans modalités, ni propres ni communes.');
        }
      }

      if (item.resolveur) {
        var liste = Array.isArray(item.resolveur) ? item.resolveur : [item.resolveur];
        liste.forEach(function (r) {
          if (XMed.resolveurs.typesConnus().indexOf(r.type) < 0) {
            erreurs.push('Item ' + item.id + ' : résolveur de type inconnu « ' + r.type + ' ».');
          }
        });
      }
    });

    var calcul = definition.calcul || {};

    if (calcul.type === 'somme' || calcul.type === 'pondere') {
      var total = 0;
      var incalculable = false;
      items.forEach(function (item) {
        if (item.inclusDansTotal === false) { return; }
        var maxi = cotationMax(definition, item);
        if (maxi === null) { incalculable = true; return; }
        total += maxi * (calcul.type === 'pondere' ? (item.poids || 1) : 1);
      });
      if (!incalculable && calcul.max !== undefined && total !== calcul.max) {
        erreurs.push('Somme des cotations maximales (' + total +
                     ') différente de calcul.max (' + calcul.max + ').');
      }
    }

    if (calcul.type === 'tableau') {
      if (!abaque) {
        erreurs.push('Abaque « ' + calcul.abaque + ' » introuvable.');
      } else {
        var axesDeclares = (calcul.entrees || []).map(function (e) { return e.axe; });
        Object.keys(abaque.axes || {}).forEach(function (axe) {
          if (axesDeclares.indexOf(axe) < 0) {
            erreurs.push('Axe « ' + axe + ' » de l\'abaque sans item d\'entrée.');
          }
        });
        (calcul.entrees || []).forEach(function (e) {
          if (!abaque.axes || !abaque.axes[e.axe]) {
            erreurs.push('Entrée « ' + e.axe + ' » absente des axes de l\'abaque.');
          }
          if (!index[e.item]) {
            erreurs.push('Entrée d\'abaque : item inconnu « ' + e.item + ' ».');
          }
        });
      }
    }

    erreurs = erreurs.concat(validerTranches(definition));
    return erreurs;
  }

  /** Contrôle des tranches d'interprétation : ni chevauchement ni trou. */
  function validerTranches(definition) {
    var erreurs = [];
    var interpretations = definition.interpretations;
    if (!interpretations) { return erreurs; }

    var jeux = Array.isArray(interpretations)
      ? [{ libelle: '', tranches: interpretations }]
      : (interpretations.groupes || []).map(function (g) {
          return { libelle: g.libelleCondition, tranches: g.tranches };
        });

    jeux.forEach(function (jeu) {
      var precedente = null;
      jeu.tranches.forEach(function (t) {
        if (precedente !== null) {
          var finPrecedente = precedente.max;
          if (finPrecedente === null || finPrecedente === undefined) {
            erreurs.push('Tranches' + (jeu.libelle ? ' (' + jeu.libelle + ')' : '') +
                         ' : une tranche sans borne haute est suivie d\'une autre.');
          } else if (precedente.maxExclu) {
            if (t.min !== finPrecedente) {
              erreurs.push('Tranches' + (jeu.libelle ? ' (' + jeu.libelle + ')' : '') +
                           ' : discontinuité entre ' + finPrecedente + ' et ' + t.min + '.');
            }
          } else if (t.min !== finPrecedente + 1) {
            erreurs.push('Tranches' + (jeu.libelle ? ' (' + jeu.libelle + ')' : '') +
                         ' : discontinuité entre ' + finPrecedente + ' et ' + t.min + '.');
          }
        }
        precedente = t;
      });
    });

    return erreurs;
  }

  /* ==========================================================================
     Pré-remplissage depuis le dossier
     ========================================================================== */

  /**
   * Résout tous les items qui déclarent une source.
   * @returns {Object} itemId -> résultat de résolution (voir registre.js)
   */
  function prerempli(definition, dossier) {
    var resultats = {};
    (definition.items || []).forEach(function (item) {
      if (item.type === 'calcule' || !item.resolveur) { return; }
      var resolution = XMed.resolveurs.resoudre(item.resolveur, dossier);
      if (resolution) { resultats[item.id] = resolution; }
    });
    return resultats;
  }

  /* ==========================================================================
     Items calculés
     ========================================================================== */

  /**
   * Recalcule les items de type « calcule ».
   * Si un opérande manque, l'item est remis à null : il ne vaut jamais zéro.
   */
  function recalculer(definition, valeurs) {
    var resultat = {};
    Object.keys(valeurs).forEach(function (cle) { resultat[cle] = valeurs[cle]; });

    (definition.items || []).forEach(function (item) {
      if (item.type !== 'calcule' || !item.operation) { return; }

      var operandes = [];
      var manquant = false;
      (item.operation.operandes || []).forEach(function (op) {
        if (typeof op === 'number') { operandes.push(op); return; }
        var v = resultat[op];
        if (estVide(v) || isNaN(Number(v))) { manquant = true; return; }
        operandes.push(Number(v));
      });

      if (manquant || !operandes.length) { resultat[item.id] = null; return; }

      var valeur = appliquer(item.operation.operateur, operandes);
      if (valeur === null || isNaN(valeur) || !isFinite(valeur)) {
        resultat[item.id] = null;
      } else {
        resultat[item.id] = outils.arrondir(valeur, item.decimales || 0);
      }
    });

    return resultat;
  }

  /** Expressions structurées : aucun eval, aucun analyseur syntaxique. */
  function appliquer(operateur, n) {
    switch (operateur) {
      case 'addition':
        return n.reduce(function (a, b) { return a + b; }, 0);
      case 'soustraction':
        return n.slice(1).reduce(function (a, b) { return a - b; }, n[0]);
      case 'produit':
        return n.reduce(function (a, b) { return a * b; }, 1);
      case 'quotient':
        return n.slice(1).reduce(function (a, b) {
          return b === 0 ? NaN : a / b;
        }, n[0]);
      case 'puissance':
        return Math.pow(n[0], n[1]);
      default:
        return null;
    }
  }

  /* ==========================================================================
     Complétude
     ========================================================================== */

  function completude(definition, valeurs) {
    var requis = [];
    var manquants = [];
    (definition.items || []).forEach(function (item) {
      if (!item.requis) { return; }
      requis.push(item.id);
      if (estVide(valeurs[item.id])) { manquants.push(item.id); }
    });
    return {
      requis: requis.length,
      renseignes: requis.length - manquants.length,
      manquants: manquants,
      complet: manquants.length === 0
    };
  }

  /* ==========================================================================
     Calcul
     ========================================================================== */

  /**
   * @returns {{valeur:?number, unite:?string, complet:boolean, motif:?string}}
   *          valeur null + motif renseigné quand le calcul ne peut pas aboutir.
   */
  function calculer(definition, valeurs, abaque) {
    var calcul = definition.calcul || {};
    var etat = completude(definition, valeurs);

    if (!etat.complet) {
      // Un total partiel reste affichable pour les scores additifs : il informe
      // sans prétendre être le score. Une lecture d'abaque, elle, n'a pas de
      // sens partielle.
      if (calcul.type === 'somme' || calcul.type === 'pondere') {
        return {
          valeur: sommer(definition, valeurs, calcul.type === 'pondere'),
          unite: calcul.unite || null,
          complet: false,
          motif: etat.manquants.length + ' item' +
                 (etat.manquants.length > 1 ? 's requis manquants' : ' requis manquant')
        };
      }
      return {
        valeur: null, unite: calcul.unite || null, complet: false,
        motif: etat.manquants.length + ' item' +
               (etat.manquants.length > 1 ? 's requis manquants' : ' requis manquant')
      };
    }

    if (calcul.type === 'somme' || calcul.type === 'pondere') {
      return {
        valeur: sommer(definition, valeurs, calcul.type === 'pondere'),
        unite: calcul.unite || null,
        complet: true,
        motif: null
      };
    }

    if (calcul.type === 'tableau') {
      var lu = lireAbaque(definition, valeurs, abaque);
      return {
        valeur: lu.valeur,
        unite: calcul.unite || (abaque && abaque.unite) || null,
        complet: true,
        motif: lu.motif
      };
    }

    return { valeur: null, unite: null, complet: false, motif: 'type de calcul inconnu' };
  }

  function sommer(definition, valeurs, pondere) {
    var total = 0;
    (definition.items || []).forEach(function (item) {
      if (item.inclusDansTotal === false) { return; }
      var v = valeurs[item.id];
      if (estVide(v) || typeof v === 'boolean') { return; }
      var n = Number(v);
      if (isNaN(n)) { return; }
      total += n * (pondere ? (item.poids || 1) : 1);
    });
    return total;
  }

  /* --- Lecture d'abaque ---------------------------------------------------- */

  /**
   * Projette chaque item d'entrée sur son axe, puis lit la cellule.
   * Renvoie toujours un motif quand la valeur est null : « abaque incomplet »
   * n'est pas la même chose que « valeur hors des bornes de l'abaque ».
   */
  function lireAbaque(definition, valeurs, abaque) {
    if (!abaque) { return { valeur: null, motif: 'abaque introuvable' }; }

    var entrees = (definition.calcul.entrees || []);
    var cle = {};

    for (var i = 0; i < entrees.length; i++) {
      var entree = entrees[i];
      var axe = (abaque.axes || {})[entree.axe];
      if (!axe) { return { valeur: null, motif: 'axe « ' + entree.axe + ' » absent de l\'abaque' }; }

      var etiquette = etiquettePour(axe, valeurs[entree.item]);
      if (etiquette === null) {
        return {
          valeur: null,
          motif: 'valeur hors des bornes de l\'abaque (' + entree.axe + ')'
        };
      }
      cle[entree.axe] = etiquette;
    }

    var axesCle = Object.keys(cle);
    var cellules = abaque.cellules || [];
    for (var c = 0; c < cellules.length; c++) {
      var cellule = cellules[c];
      var correspond = true;
      for (var a = 0; a < axesCle.length; a++) {
        if (cellule[axesCle[a]] !== cle[axesCle[a]]) { correspond = false; break; }
      }
      if (correspond) {
        if (cellule.valeur === null || cellule.valeur === undefined) {
          return { valeur: null, motif: 'abaque incomplet' };
        }
        return { valeur: cellule.valeur, motif: null };
      }
    }

    return { valeur: null, motif: 'combinaison absente de l\'abaque' };
  }

  /**
   * Étiquette d'axe correspondant à une valeur d'item.
   * - axe catégoriel : une valeur booléenne indexe l'axe (false = première
   *   position, true = seconde) ; une chaîne doit correspondre exactement ;
   * - axe par tranches : on cherche la borne qui contient la valeur.
   * Les étiquettes sont lues dans le fichier d'abaque, jamais reconstruites.
   */
  function etiquettePour(axe, valeur) {
    if (estVide(valeur)) { return null; }
    var etiquettes = axe.etiquettes || [];

    if (axe.type === 'categoriel') {
      if (typeof valeur === 'boolean') {
        return etiquettes.length >= 2 ? etiquettes[valeur ? 1 : 0] : null;
      }
      var index = (axe.valeurs || []).indexOf(String(valeur));
      return index >= 0 ? (etiquettes[index] || String(valeur)) : null;
    }

    if (axe.type === 'tranche') {
      var n = Number(valeur);
      if (isNaN(n)) { return null; }
      var bornes = axe.bornes || [];
      for (var i = 0; i < bornes.length; i++) {
        if (n >= bornes[i][0] && n <= bornes[i][1]) { return etiquettes[i] || null; }
      }
      return null;   // hors abaque : ce n'est pas une erreur, c'est une limite.
    }

    return null;
  }

  /* ==========================================================================
     Interprétation
     ========================================================================== */

  /**
   * @returns {?{libelle:string, couleur:string, index:number, tranches:Array,
   *             libelleCondition:?string}}
   *          null si le score ne porte pas d'interprétation, ou si aucune
   *          tranche ne contient la valeur.
   */
  function interpreter(definition, valeur, valeurs) {
    if (valeur === null || valeur === undefined) { return null; }
    var jeu = jeuDeTranches(definition, valeurs);
    if (!jeu) { return null; }

    for (var i = 0; i < jeu.tranches.length; i++) {
      var t = jeu.tranches[i];
      var apresMin = (t.min === null || t.min === undefined) || valeur >= t.min;
      var avantMax = (t.max === null || t.max === undefined) ||
                     (t.maxExclu ? valeur < t.max : valeur <= t.max);
      if (apresMin && avantMax) {
        return {
          libelle: t.libelle,
          couleur: t.couleur,
          index: i,
          tranches: jeu.tranches,
          libelleCondition: jeu.libelleCondition
        };
      }
    }
    return null;
  }

  /** Jeu de tranches applicable, éventuellement choisi par une condition. */
  function jeuDeTranches(definition, valeurs) {
    var interpretations = definition.interpretations;
    if (!interpretations) { return null; }

    if (Array.isArray(interpretations)) {
      return { tranches: interpretations, libelleCondition: null };
    }

    var selon = interpretations.selon || {};
    var reference = valeurs ? valeurs[selon.item] : null;
    if (estVide(reference)) { return null; }

    var groupes = interpretations.groupes || [];
    for (var i = 0; i < groupes.length; i++) {
      if (conditionRemplie(groupes[i].condition, reference)) {
        return {
          tranches: groupes[i].tranches,
          libelleCondition: groupes[i].libelleCondition
        };
      }
    }
    return null;
  }

  function conditionRemplie(condition, valeur) {
    if (!condition) { return true; }
    if (condition.valeur !== undefined && condition.valeur !== null) {
      return condition.valeur === valeur;
    }
    var n = Number(valeur);
    if (isNaN(n)) { return false; }
    if (condition.min !== undefined && condition.min !== null && n < condition.min) { return false; }
    if (condition.max !== undefined && condition.max !== null && n > condition.max) { return false; }
    return true;
  }

  /* ==========================================================================
     Alertes d'item
     ========================================================================== */

  function alertes(definition, valeurs) {
    var declenchees = [];
    (definition.items || []).forEach(function (item) {
      if (!item.alerte) { return; }
      var v = valeurs[item.id];
      if (estVide(v)) { return; }
      if (comparer(v, item.alerte.operateur, item.alerte.valeur)) {
        declenchees.push({ item: item, alerte: item.alerte, valeur: v });
      }
    });
    return declenchees;
  }

  function comparer(gauche, operateur, droite) {
    switch (operateur) {
      case '>=': return Number(gauche) >= Number(droite);
      case '>':  return Number(gauche) > Number(droite);
      case '<=': return Number(gauche) <= Number(droite);
      case '<':  return Number(gauche) < Number(droite);
      case '==': return gauche === droite;
      case '!=': return gauche !== droite;
      default:   return false;
    }
  }

  /* ==========================================================================
     Éligibilité
     ========================================================================== */

  /**
   * Évalue les règles d'éligibilité sur le dossier.
   *
   * @param {Object} definition
   * @param {Object} dossier
   * @param {Object} reponses réponses aux règles de source « confirmation »,
   *                 sous la forme { idRegle: true|false|undefined }
   * @returns {{applicable:boolean, bloquantes:Array, questions:Array}}
   *
   * Une règle d'inclusion non remplie, ou une règle d'exclusion remplie,
   * déclenche le bandeau. Une question sans réponse n'est PAS un blocage : on
   * la pose, on n'invente pas la réponse.
   */
  function eligibilite(definition, dossier, reponses) {
    var resultat = { applicable: true, bloquantes: [], avertissements: [], questions: [] };
    var regles = (definition.eligibilite && definition.eligibilite.regles) || [];
    reponses = reponses || {};

    regles.forEach(function (regle) {
      var condition = regle.condition || {};

      // Garde « si » : la règle n'est évaluée que si le préalable est rempli.
      // C'est ce qui évite de demander « Grossesse en cours ? » à un homme.
      if (regle.si && !prealableRempli(regle.si, dossier)) { return; }

      if (condition.source === 'confirmation') {
        var reponse = reponses[regle.id];
        resultat.questions.push({
          regle: regle,
          libelle: condition.libelle || regle.message,
          reponse: (reponse === undefined ? null : reponse)
        });
        if (reponse === true) { retenir(resultat, regle, null); }
        return;
      }

      var declenchee = false;
      var resolution = null;

      if (condition.source === 'demographie') {
        var demo = dossier.demographie();
        var valeur = demo[condition.champ];
        var remplie = estVide(valeur)
          ? null
          : comparer(valeur, condition.operateur, condition.valeur);
        // Règle d'inclusion : elle bloque quand elle n'est PAS remplie.
        declenchee = (regle.type === 'inclusion') ? (remplie === false) : (remplie === true);
        resolution = { libelleSource: 'Identité — ' + condition.champ + ' : ' + valeur };
      } else {
        // antecedent, traitement, facteurRisque, biologie : on interroge le
        // résolveur du même nom. Ne rien trouver ne déclenche rien.
        resolution = XMed.resolveurs.resoudre(
          { type: condition.source, codesCim10: condition.codesCim10,
            libelles: condition.libelles, code: condition.code,
            champ: condition.champ },
          dossier);
        var trouve = !!resolution;
        declenchee = (regle.type === 'inclusion') ? !trouve : trouve;
      }

      if (declenchee) { retenir(resultat, regle, resolution); }
    });

    return resultat;
  }

  /**
   * Évalue le préalable « si » d'une règle d'éligibilité.
   * Même grammaire que les conditions, mais son rôle est différent : il ne
   * déclenche rien, il décide si la règle a lieu d'être posée.
   */
  function prealableRempli(prealable, dossier) {
    if (prealable.source === 'demographie') {
      var valeur = dossier.demographie()[prealable.champ];
      if (estVide(valeur)) { return false; }
      return comparer(valeur, prealable.operateur || '==', prealable.valeur);
    }
    return !!XMed.resolveurs.resoudre(
      { type: prealable.source, codesCim10: prealable.codesCim10,
        libelles: prealable.libelles, code: prealable.code },
      dossier);
  }

  function retenir(resultat, regle, resolution) {
    var entree = { regle: regle, resolution: resolution };
    if (regle.severite === 'bloquant') {
      resultat.bloquantes.push(entree);
      resultat.applicable = false;
    } else {
      resultat.avertissements.push(entree);
    }
  }

  /* ==========================================================================
     Texte pour l'observation du jour
     ========================================================================== */

  /**
   * Pavé texte prêt à coller dans l'observation.
   * Il n'énonce aucune conduite à tenir : score, interprétation standardisée,
   * items cotés au-dessus de leur modalité la plus basse, et sources
   * pré-remplies. Rien de plus.
   */
  function texteObservation(definition, contexte) {
    var lignes = [];
    var resultat = contexte.resultat || {};
    var interpretation = contexte.interpretation;

    lignes.push(definition.acronyme + ' — ' + definition.libelle);
    lignes.push('Évalué le ' + outils.dateFr(contexte.date) +
                (contexte.evaluateur ? ' par ' + contexte.evaluateur : '') +
                (contexte.libelleEpisode ? ' — épisode : ' + contexte.libelleEpisode : ''));

    if (resultat.valeur === null || resultat.valeur === undefined) {
      lignes.push('Résultat : non calculable (' + (resultat.motif || 'données insuffisantes') + ').');
    } else {
      var valeurTexte = outils.nombre(resultat.valeur, definition.calcul.decimales || 0);
      if (resultat.unite) {
        valeurTexte += ' ' + resultat.unite;
      } else if (definition.calcul.max !== undefined) {
        valeurTexte += ' / ' + definition.calcul.max;
      }
      lignes.push('Résultat : ' + valeurTexte +
                  (interpretation ? ' — ' + interpretation.libelle : '') +
                  (resultat.complet === false ? ' (partiel)' : ''));
    }

    var cotes = itemsCotes(definition, contexte.valeurs);
    if (cotes.length) {
      lignes.push('Items cotés : ' + cotes.join(' ; ') + '.');
    }

    var declenchees = alertes(definition, contexte.valeurs);
    declenchees.forEach(function (a) { lignes.push('Alerte : ' + a.alerte.message); });

    var sources = contexte.sources || {};
    var auto = Object.keys(sources).filter(function (id) { return sources[id].auto; });
    if (auto.length) {
      var index = itemsParId(definition);
      lignes.push('Renseigné depuis le dossier : ' + auto.map(function (id) {
        var s = sources[id];
        return (index[id] ? index[id].intitule : id) +
               (s.dateSource ? ' (' + outils.dateFr(s.dateSource) + ')' : '');
      }).join(', ') + '.');
    }

    if (definition.statut !== 'valide') {
      lignes.push('[Définition de score non validée — intitulés de travail.]');
    }

    return lignes.join('\n');
  }

  /** Items cotés au-dessus de leur modalité la plus basse, avec leur libellé. */
  function itemsCotes(definition, valeurs) {
    var sortie = [];
    (definition.items || []).forEach(function (item) {
      var v = valeurs[item.id];
      if (estVide(v)) { return; }
      var modalites = modalitesDe(definition, item);
      if (modalites) {
        var minimale = modalites[0] ? modalites[0].valeur : null;
        if (v === minimale) { return; }
        var trouvee = modalites.filter(function (m) { return m.valeur === v; });
        sortie.push(item.intitule + ' : ' + (trouvee.length ? trouvee[0].libelle : v));
      } else if (typeof v === 'number') {
        sortie.push(item.intitule + ' : ' + outils.nombre(v, item.decimales || 0) +
                    (item.unite ? ' ' + item.unite : ''));
      }
    });
    return sortie;
  }

  XMed.moteur = {
    itemsParId: itemsParId,
    modalitesDe: modalitesDe,
    cotationMax: cotationMax,
    estVide: estVide,
    valider: valider,
    prerempli: prerempli,
    recalculer: recalculer,
    completude: completude,
    calculer: calculer,
    interpreter: interpreter,
    jeuDeTranches: jeuDeTranches,
    alertes: alertes,
    eligibilite: eligibilite,
    texteObservation: texteObservation,
    itemsCotes: itemsCotes
  };

})(window.XMed);

/* ============================================================================
   vues/composants.js — Fabriques d'éléments d'interface XMed.
   ----------------------------------------------------------------------------
   Un seul endroit produit les cadres, les fenêtres, les grilles, les colonnes
   de boutons, les menus et les bandeaux. Les vues métier n'écrivent pas de
   HTML : elles assemblent ces composants.

   Aucun alert() ni confirm() natif nulle part : les messages passent par les
   bandeaux et la fenêtre de confirmation d'ici.
   ========================================================================== */
window.XMed = window.XMed || {};
window.XMed.ui = window.XMed.ui || {};

(function (XMed) {
  'use strict';

  var ui = XMed.ui;

  /* ==========================================================================
     Fabrique élémentaire
     ========================================================================== */

  /**
   * el('div', { class: 'x', onclick: fn }, 'texte' | Node | [..])
   * Les attributs commençant par « on » sont posés comme écouteurs.
   */
  function el(balise, attributs, enfants) {
    var noeud = document.createElement(balise);
    if (attributs) {
      Object.keys(attributs).forEach(function (cle) {
        var valeur = attributs[cle];
        if (valeur === null || valeur === undefined || valeur === false) { return; }
        if (cle.indexOf('on') === 0 && typeof valeur === 'function') {
          noeud.addEventListener(cle.slice(2), valeur);
        } else if (cle === 'class') {
          noeud.className = valeur;
        } else if (cle === 'texte') {
          noeud.textContent = valeur;
        } else if (cle === 'html') {
          noeud.innerHTML = valeur;
        } else if (cle === 'style' && typeof valeur === 'object') {
          Object.keys(valeur).forEach(function (p) { noeud.style[p] = valeur[p]; });
        } else if (valeur === true) {
          noeud.setAttribute(cle, '');
        } else {
          noeud.setAttribute(cle, valeur);
        }
      });
    }
    ajouter(noeud, enfants);
    return noeud;
  }

  function ajouter(parent, enfants) {
    if (enfants === null || enfants === undefined) { return parent; }
    if (Array.isArray(enfants)) {
      enfants.forEach(function (e) { ajouter(parent, e); });
      return parent;
    }
    if (enfants instanceof Node) { parent.appendChild(enfants); return parent; }
    parent.appendChild(document.createTextNode(String(enfants)));
    return parent;
  }

  function vider(noeud) {
    while (noeud.firstChild) { noeud.removeChild(noeud.firstChild); }
    return noeud;
  }

  /** Icône SVG 16x16 : le tracé est fourni en balisage, jamais en fichier externe. */
  function icone(balisage, taille) {
    var enveloppe = document.createElement('span');
    enveloppe.innerHTML = '<svg width="' + (taille || 16) + '" height="' + (taille || 16) +
                          '" viewBox="0 0 16 16" aria-hidden="true">' + balisage + '</svg>';
    return enveloppe.firstChild;
  }

  /** Bouton d'icône de barre de titre. */
  function boutonIcone(titre, balisage, action) {
    var b = el('button', { class: 'xm-icone', type: 'button', title: titre, onclick: action });
    b.appendChild(icone(balisage));
    return b;
  }

  /* Jeu d'icônes de la maquette. Ce ne sont pas les icônes XMed : Olaqin
     substituera les siennes.                                                  */
  var ICONES = {
    copier: '<rect x="3" y="2" width="8" height="10" fill="#FFF" stroke="#7A7A7A"/>' +
            '<rect x="5.5" y="4.5" width="8" height="10" fill="#FFF9D0" stroke="#B9902A"/>',
    filtre: '<path d="M2 3h12l-4.6 5.2V13l-2.8-1.6V8.2z" fill="#6FA8DC" stroke="#2B6CA3"/>',
    reseau: '<path d="M8 4v8M8 8H3M8 8h5" stroke="#7A7A7A" fill="none"/>' +
            '<rect x="6" y="1" width="4" height="3" fill="#B7D7F0" stroke="#2B6CA3"/>' +
            '<rect x="1" y="6.5" width="4" height="3" fill="#B7D7F0" stroke="#2B6CA3"/>' +
            '<rect x="11" y="6.5" width="4" height="3" fill="#B7D7F0" stroke="#2B6CA3"/>',
    deplier: '<path d="M8 1.5 11 5H5zM8 14.5 5 11h6z" fill="#2B6CA3"/><path d="M3 8h10" stroke="#7A7A7A"/>',
    agrandir: '<rect x="3.5" y="3.5" width="9" height="9" fill="none" stroke="#4A4A4A"/>',
    valide: '<path d="M3 8.5 6.5 12 13 4" stroke="#008000" stroke-width="2.2" fill="none"/>',
    scores: '<rect x="2" y="1.5" width="12" height="13" fill="#FFF" stroke="#2B6CA3"/>' +
            '<path d="M4.5 5h7M4.5 8h7M4.5 11h4" stroke="#6FA8DC"/>' +
            '<path d="M9.5 12.2 11 13.7 14 10.5" stroke="#008000" stroke-width="1.6" fill="none"/>',
    loupe: '<circle cx="7" cy="7" r="4.5" fill="none" stroke="#5A5A5A"/>' +
           '<path d="M10.4 10.4 14 14" stroke="#5A5A5A"/>',
    xmed: '<path d="M2 3h4l7 10h-4z" fill="#C0392B"/><path d="M10 3h4L7 13H3z" fill="#E74C3C"/>',
    etoile: '<path d="M8 1.8 9.9 5.9l4.4.5-3.3 3 .9 4.4L8 11.6 4.1 13.8l.9-4.4-3.3-3 4.4-.5z" ' +
            'fill="#F4C542" stroke="#B9902A"/>',
    etoileVide: '<path d="M8 1.8 9.9 5.9l4.4.5-3.3 3 .9 4.4L8 11.6 4.1 13.8l.9-4.4-3.3-3 4.4-.5z" ' +
                'fill="none" stroke="#A0A0A0"/>',
    patient: '<circle cx="8" cy="5" r="3" fill="#6FA8DC" stroke="#2B6CA3"/>' +
             '<path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5z" fill="#6FA8DC" stroke="#2B6CA3"/>',
    serveur: '<rect x="2" y="3" width="12" height="8" fill="#DCEEF7" stroke="#2B6CA3"/>' +
             '<path d="M1 13h14" stroke="#2B6CA3"/>'
  };

  /* ==========================================================================
     Cadre du dossier
     ========================================================================== */

  /**
   * @param {{titre:string, icones:Array, variante:?string, hauteur:?string}} options
   * @returns {{racine:Node, corps:Node, barreIcones:Node}}
   */
  function cadre(options) {
    var barreIcones = el('span', { class: 'xm-cadre__icones' });
    (options.icones || []).forEach(function (i) { barreIcones.appendChild(i); });

    var corps = el('div', { class: 'xm-cadre__corps' });
    var racine = el('div', {
      class: 'xm-cadre' + (options.variante ? ' xm-cadre--' + options.variante : ''),
      style: options.hauteur ? { height: options.hauteur } : null
    }, [
      el('div', { class: 'xm-cadre__titre' }, [
        el('span', { class: 'xm-cadre__libelle', texte: options.titre }),
        barreIcones
      ]),
      corps
    ]);

    return { racine: racine, corps: corps, barreIcones: barreIcones };
  }

  /* ==========================================================================
     Fenêtre modale
     ========================================================================== */

  var pileFenetres = [];

  /**
   * @param {{titre:string, largeur:?number, hauteur:?number,
   *          surFermeture:?Function}} options
   * @returns {{racine, principal, colonneBoutons, fermer, definirBoutons}}
   */
  function fenetre(options) {
    var principal = el('div', { class: 'xm-fenetre__principal' });
    var colonneBoutons = el('div', { class: 'xm-colonne-boutons' });

    var titreLibelle = el('span', { class: 'xm-fenetre__titre-libelle', texte: options.titre });

    var boiteFenetre = el('div', {
      class: 'xm-fenetre',
      style: {
        width: (options.largeur || 1056) + 'px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 24px)'
      }
    }, [
      el('div', { class: 'xm-fenetre__titre' }, [
        icone(ICONES.xmed),
        titreLibelle,
        el('span', { class: 'xm-fenetre__systeme' }, [
          boutonSysteme('Réduire', '<path d="M1 5h8" stroke="currentColor"/>', null),
          boutonSysteme('Agrandir',
            '<rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor"/>', null),
          boutonSysteme('Fermer', '<path d="M1 1l8 8M9 1l-8 8" stroke="currentColor"/>',
            function () { instance.fermer(); }, 'xm-bouton-systeme--fermer')
        ])
      ]),
      el('div', { class: 'xm-fenetre__corps' }, [principal, colonneBoutons])
    ]);

    var voile = el('div', { class: 'xm-voile' }, boiteFenetre);

    var instance = {
      racine: voile,
      boite: boiteFenetre,
      principal: principal,
      colonneBoutons: colonneBoutons,
      titre: function (texte) { titreLibelle.textContent = texte; },
      fermer: function () {
        if (options.surFermeture && options.surFermeture() === false) { return; }
        detacher(instance);
      }
    };

    document.body.appendChild(voile);
    pileFenetres.push(instance);

    // Le premier élément focalisable prend le focus : la fenêtre est utilisable
    // au clavier dès son ouverture.
    window.setTimeout(function () {
      var cible = boiteFenetre.querySelector(
        '.xm-champ, .xm-grille-conteneur, .xm-bouton--defaut, .xm-bouton');
      if (cible) { cible.focus(); }
    }, 0);

    return instance;
  }

  function boutonSysteme(titre, balisage, action, classeSup) {
    var b = el('button', {
      class: 'xm-bouton-systeme' + (classeSup ? ' ' + classeSup : ''),
      type: 'button', title: titre, tabindex: '-1',
      onclick: action || function () {}
    });
    b.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10">' + balisage + '</svg>';
    return b;
  }

  function detacher(instance) {
    var i = pileFenetres.indexOf(instance);
    if (i >= 0) { pileFenetres.splice(i, 1); }
    if (instance.racine.parentNode) {
      instance.racine.parentNode.removeChild(instance.racine);
    }
  }

  function fenetreDuDessus() {
    return pileFenetres.length ? pileFenetres[pileFenetres.length - 1] : null;
  }

  /* --- Colonne de boutons --------------------------------------------------- */

  /**
   * blocs : [[ {libelle, defaut, inactif, menu, action, id}, ... ], ... ]
   * Un bloc = un groupe séparé par un espace vertical, comme dans XMed.
   */
  function blocsBoutons(conteneur, blocs) {
    vider(conteneur);
    var index = {};
    (blocs || []).forEach(function (bloc) {
      if (!bloc || !bloc.length) { return; }
      var e = el('div', { class: 'xm-bloc-boutons' });
      bloc.forEach(function (b) {
        if (b.masque) { return; }
        var bouton = el('button', {
          class: 'xm-bouton' + (b.defaut ? ' xm-bouton--defaut' : '') +
                 (b.menu ? ' xm-bouton--menu' : ''),
          type: 'button',
          disabled: !!b.inactif,
          title: b.titre || null,
          onclick: b.action || function () {}
        }, b.libelle);
        if (b.id) { index[b.id] = bouton; }
        e.appendChild(bouton);
      });
      if (e.childNodes.length) { conteneur.appendChild(e); }
    });
    return index;
  }

  /* ==========================================================================
     Grille
     ========================================================================== */

  /**
   * @param {{colonnes:Array, lignes:Array, groupes:?Array, cle:Function,
   *          surSelection:?Function, surActivation:?Function,
   *          bandeauGroupe:?string, hauteur:?string, vide:?string}} options
   *
   * colonnes : { cle, libelle, largeur, align, rendu(ligne)->string|Node,
   *              classe(ligne)->string, tri:boolean, filtre:boolean }
   * groupes  : [{ libelle, lignes }] — regroupement DevExpress ; si absent, on
   *            rend « lignes » à plat.
   */
  function grille(options) {
    var colonnes = options.colonnes || [];
    var conteneur = el('div', {
      class: 'xm-grille-conteneur',
      tabindex: '0',
      style: options.hauteur ? { height: options.hauteur } : null
    });

    var champRecherche = null;
    if (options.bandeauGroupe !== false) {
      var gauche;
      if (options.recherche) {
        // La loupe du bandeau devient un champ de recherche instantanée.
        champRecherche = el('input', {
          class: 'xm-champ xm-bandeau-groupe__recherche',
          type: 'search',
          placeholder: options.recherche.placeholder || 'Rechercher…',
          oninput: function (ev) { options.recherche.surSaisie(ev.target.value); }
        });
        gauche = champRecherche;
      } else {
        gauche = el('span', {
          class: 'xm-bandeau-groupe__consigne',
          texte: options.bandeauGroupe ||
                 'Glisser/déposer ici des entêtes de colonne pour effectuer des regroupements'
        });
      }
      conteneur.appendChild(el('div', { class: 'xm-bandeau-groupe' }, [
        gauche, icone(ICONES.loupe, 14)
      ]));
    }

    var defilement = el('div', { class: 'xm-grille-defilement' });
    var table = el('table', { class: 'xm-grille' });
    var colgroup = el('colgroup');
    colgroup.appendChild(el('col', { style: { width: '18px' } }));
    colonnes.forEach(function (c) {
      colgroup.appendChild(el('col', { style: c.largeur ? { width: c.largeur } : {} }));
    });
    table.appendChild(colgroup);

    var thead = el('thead');
    var ligneEntete = el('tr');
    ligneEntete.appendChild(el('th', { class: 'xm-grille__indicateur' }));
    colonnes.forEach(function (c, i) {
      var contenu = [el('span', { class: 'xm-grille__entete-libelle', texte: c.libelle })];
      if (c.tri) {
        contenu.push(el('i', { class: 'xm-tri xm-tri--' + (c.tri === 'desc' ? 'desc' : 'asc') }));
      }
      if (c.filtre) { contenu.push(el('i', { class: 'xm-filtre' })); }
      var th = el('th', {
        class: c.align === 'droite' ? 'xm-col--nombre' : null,
        onclick: function () { if (options.surTri) { options.surTri(c, i); } }
      }, el('span', { class: 'xm-grille__entete' }, contenu));
      ligneEntete.appendChild(th);
    });
    thead.appendChild(ligneEntete);
    table.appendChild(thead);

    var tbody = el('tbody');
    table.appendChild(tbody);
    defilement.appendChild(table);
    conteneur.appendChild(defilement);

    var etat = { courante: null, lignes: [] };

    function rendreLigne(donnee) {
      var tr = el('tr');
      tr.appendChild(el('td', { class: 'xm-grille__indicateur' }));
      colonnes.forEach(function (c) {
        var contenu = c.rendu ? c.rendu(donnee) : donnee[c.cle];
        var classes = [];
        if (c.align === 'droite') { classes.push('xm-col--nombre'); }
        if (c.align === 'centre') { classes.push('xm-col--centre'); }
        if (c.classe) { var sup = c.classe(donnee); if (sup) { classes.push(sup); } }
        var td = el('td', { class: classes.join(' ') || null });
        if (contenu instanceof Node) { td.appendChild(contenu); }
        else { td.textContent = (contenu === null || contenu === undefined) ? '' : String(contenu); }
        tr.appendChild(td);
      });

      tr.addEventListener('click', function () { selectionner(donnee); });
      tr.addEventListener('dblclick', function () {
        if (options.surActivation) { options.surActivation(donnee); }
      });
      return tr;
    }

    function remplir(lignes, groupes) {
      vider(tbody);
      etat.lignes = [];

      function ajouterLignes(liste) {
        (liste || []).forEach(function (donnee) {
          var tr = rendreLigne(donnee);
          tbody.appendChild(tr);
          etat.lignes.push({ donnee: donnee, tr: tr });
        });
      }

      if (groupes && groupes.length) {
        groupes.forEach(function (groupe) {
          var tr = el('tr', { class: 'xm-grille__groupe' });
          tr.appendChild(el('td', {
            class: 'xm-grille__groupe-cellule',
            colspan: colonnes.length + 1
          }, [
            el('i', { class: 'xm-tri xm-tri--desc' }),
            el('span', { texte: groupe.libelle })
          ]));
          tbody.appendChild(tr);
          ajouterLignes(groupe.lignes);
        });
      } else {
        ajouterLignes(lignes);
      }

      if (!etat.lignes.length && options.vide) {
        var trVide = el('tr');
        trVide.appendChild(el('td', {
          class: 'est-attenue',
          colspan: colonnes.length + 1,
          style: { textAlign: 'center', height: '48px' }
        }, options.vide));
        tbody.appendChild(trVide);
      }
    }

    function selectionner(donnee, silencieux) {
      etat.courante = donnee;
      etat.lignes.forEach(function (l) {
        var actif = l.donnee === donnee;
        l.tr.className = actif ? 'est-courante est-selectionnee' : '';
      });
      if (!silencieux && options.surSelection) { options.surSelection(donnee); }
    }

    function deplacer(pas) {
      if (!etat.lignes.length) { return; }
      var index = etat.lignes.map(function (l) { return l.donnee; }).indexOf(etat.courante);
      var suivant = Math.max(0, Math.min(etat.lignes.length - 1, index + pas));
      selectionner(etat.lignes[suivant].donnee);
      etat.lignes[suivant].tr.scrollIntoView({ block: 'nearest' });
    }

    conteneur.addEventListener('focus', function () { conteneur.classList.add('a-le-focus'); });
    conteneur.addEventListener('blur', function () { conteneur.classList.remove('a-le-focus'); });
    conteneur.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'ArrowDown') { evenement.preventDefault(); deplacer(1); }
      else if (evenement.key === 'ArrowUp') { evenement.preventDefault(); deplacer(-1); }
      else if (evenement.key === 'Enter' && options.surActivation && etat.courante) {
        evenement.preventDefault();
        evenement.stopPropagation();
        options.surActivation(etat.courante);
      }
    });

    remplir(options.lignes, options.groupes);
    if (options.lignes && options.lignes.length) {
      selectionner(options.lignes[0], true);
    } else if (options.groupes && options.groupes.length && options.groupes[0].lignes.length) {
      selectionner(options.groupes[0].lignes[0], true);
    }

    return {
      racine: conteneur,
      remplir: remplir,
      selectionner: selectionner,
      courante: function () { return etat.courante; },
      focus: function () { conteneur.focus(); },
      focusRecherche: function () { if (champRecherche) { champRecherche.focus(); } }
    };
  }

  /* ==========================================================================
     Menu déroulant ancré
     ========================================================================== */

  /**
   * @param {Node} ancre élément sous lequel afficher le menu
   * @param {Array} elements [{libelle, detail, action, separateur}]
   */
  function menu(ancre, elements) {
    fermerMenu();
    var boite = el('div', { class: 'xm-menu' });

    (elements || []).forEach(function (e) {
      if (e.separateur) {
        boite.appendChild(el('div', { class: 'xm-menu__separateur' }));
        return;
      }
      boite.appendChild(el('div', {
        class: 'xm-menu__item',
        tabindex: '0',
        onclick: function () { fermerMenu(); if (e.action) { e.action(); } },
        onkeydown: function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault(); fermerMenu(); if (e.action) { e.action(); }
          }
        }
      }, [
        el('span', { texte: e.libelle }),
        e.detail ? el('span', { class: 'xm-menu__item-detail', texte: e.detail }) : null
      ]));
    });

    var rect = ancre.getBoundingClientRect();
    boite.style.position = 'fixed';
    boite.style.zIndex = '300';
    boite.style.left = Math.round(rect.left) + 'px';
    boite.style.top = Math.round(rect.bottom + 2) + 'px';
    boite.style.minWidth = Math.round(rect.width) + 'px';

    document.body.appendChild(boite);
    ui.menuOuvert = boite;

    // Repositionne si le menu déborde en bas de l'écran.
    var debord = boite.getBoundingClientRect().bottom - window.innerHeight;
    if (debord > 0) { boite.style.top = Math.round(rect.top - boite.offsetHeight - 2) + 'px'; }

    var premier = boite.querySelector('.xm-menu__item');
    if (premier) { premier.focus(); }

    window.setTimeout(function () {
      document.addEventListener('mousedown', fermetureExterne, true);
    }, 0);
    return boite;
  }

  function fermetureExterne(evenement) {
    if (ui.menuOuvert && !ui.menuOuvert.contains(evenement.target)) { fermerMenu(); }
  }

  function fermerMenu() {
    if (ui.menuOuvert && ui.menuOuvert.parentNode) {
      ui.menuOuvert.parentNode.removeChild(ui.menuOuvert);
    }
    ui.menuOuvert = null;
    document.removeEventListener('mousedown', fermetureExterne, true);
  }

  /* ==========================================================================
     Bandeaux et info-bulles
     ========================================================================== */

  /**
   * @param {string} type 'info' | 'avertissement' | 'bloquant'
   * @param {string} titre
   * @param {string|Node} texte
   * @param {Array} actions [{libelle, action}] rendues en liens textuels
   */
  function bandeau(type, titre, texte, actions) {
    var corps = el('span', { class: 'xm-bandeau__texte' });
    if (texte instanceof Node) { corps.appendChild(texte); }
    else { corps.appendChild(document.createTextNode(texte)); }

    (actions || []).forEach(function (a, i) {
      corps.appendChild(document.createTextNode(i === 0 ? ' ' : ' · '));
      corps.appendChild(el('a', {
        href: '#', class: 'xm-lien',
        onclick: function (ev) { ev.preventDefault(); a.action(); }
      }, a.libelle));
    });

    return el('div', { class: 'xm-bandeau xm-bandeau--' + type }, [
      el('span', { class: 'xm-bandeau__titre', texte: titre }),
      corps
    ]);
  }

  /** Info-bulle jaune au survol et au focus clavier. */
  function infobulle(element, texte) {
    if (!texte) { return element; }
    var boite = null;

    function afficher() {
      if (boite) { return; }
      boite = el('div', { class: 'xm-infobulle' });
      texte.split('\n').forEach(function (ligne, i) {
        if (i) { boite.appendChild(el('br')); }
        boite.appendChild(document.createTextNode(ligne));
      });
      document.body.appendChild(boite);
      var rect = element.getBoundingClientRect();
      boite.style.position = 'fixed';
      boite.style.left = Math.round(Math.min(rect.left, window.innerWidth - 340)) + 'px';
      boite.style.top = Math.round(rect.bottom + 3) + 'px';
      var debord = boite.getBoundingClientRect().bottom - window.innerHeight;
      if (debord > 0) { boite.style.top = Math.round(rect.top - boite.offsetHeight - 3) + 'px'; }
    }

    function masquer() {
      if (boite && boite.parentNode) { boite.parentNode.removeChild(boite); }
      boite = null;
    }

    element.addEventListener('mouseenter', afficher);
    element.addEventListener('mouseleave', masquer);
    element.addEventListener('focus', afficher, true);
    element.addEventListener('blur', masquer, true);
    return element;
  }

  /* ==========================================================================
     Confirmation — remplace confirm()
     ========================================================================== */

  function confirmer(titre, message, libelleValider) {
    return new Promise(function (resoudre) {
      var f = fenetre({
        titre: titre, largeur: 420,
        surFermeture: function () { resoudre(false); }
      });
      f.principal.appendChild(el('div', {
        class: 'xm-detail', style: { padding: '10px 6px', lineHeight: '1.5' }
      }, message));
      blocsBoutons(f.colonneBoutons, [[
        { libelle: libelleValider || 'Ok', defaut: true,
          action: function () { detacher(f); resoudre(true); } },
        { libelle: 'Annuler', action: function () { detacher(f); resoudre(false); } }
      ]]);
    });
  }

  ui.el = el;
  ui.ajouter = ajouter;
  ui.vider = vider;
  ui.icone = icone;
  ui.boutonIcone = boutonIcone;
  ui.ICONES = ICONES;
  ui.cadre = cadre;
  ui.fenetre = fenetre;
  ui.detacher = detacher;
  ui.fenetreDuDessus = fenetreDuDessus;
  ui.pileFenetres = pileFenetres;
  ui.blocsBoutons = blocsBoutons;
  ui.grille = grille;
  ui.menu = menu;
  ui.fermerMenu = fermerMenu;
  ui.bandeau = bandeau;
  ui.infobulle = infobulle;
  ui.confirmer = confirmer;

})(window.XMed);

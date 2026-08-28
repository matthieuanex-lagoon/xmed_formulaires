# Module « Scores cliniques » — spécification technique

Destinataire : équipe de développement Olaqin.
Objet : réimplémentation en environnement Windows natif du module démontré par
la maquette web de ce dépôt.

**Statut : étape 3 — SCORE2, PHQ-9 et HDRS-17 implémentés de bout en bout.
Document complet.**

| Section | Contenu |
|---------|---------|
| 1 | Arborescence du dépôt et rôle de chaque module |
| 2 | Contrainte de chargement des données — arbitrée |
| 3 | Schéma d'une définition de score |
| 4 | Exemples de référence : PHQ-9, HDRS-17, SCORE2, abaque |
| 5 | Rattachement CIM-10 |
| 6 | Procédure d'ajout d'un nouveau score |
| 7 | Contrat d'interface des résolveurs — **ce que XMed doit exposer** |
| 8 | Modèle de persistance `SCORE_DEF`, `SCORE_EVAL`, `SCORE_EVAL_ITEM`, `SCORE_CIM10_MAP` |
| 9 | Rattachement à l'épisode de soins et survie à sa clôture |
| 10 | Fiche CHA₂DS₂-VASc, décrite et non implémentée |
| 11 | Ce que XMed devra exposer, en résumé |
| 12 | Points ouverts |

---

## 1. Arborescence

### 1.1 Le dépôt

```
/index.html                             dossier patient simulé, point d'entrée de la démo
/assets/css/tokens.css                  jetons visuels prélevés sur les captures
/assets/css/xmed.css                    composants : cadre, fenêtre, grille, boutons, saisie
/assets/css/application.css             chrome de l'application et pièces du module Scores
/assets/js/app.js                       amorçage, ouverture des fenêtres, raccourcis globaux
/assets/js/store.js                     persistance des évaluations, interface async
/assets/js/donnees.js                   chargement du référentiel et du jeu de démo
/assets/js/dossier.js                   façade d'accès au dossier patient  ← contrat XMed
/assets/js/outils.js                    dates, nombres, chaînes
/assets/js/moteur-score.js              calcul, interprétation, éligibilité, validation
/assets/js/rattachement.js              quels scores proposer, et pourquoi
/assets/js/resolveurs/registre.js       enregistrement et résolution des items
/assets/js/resolveurs/demographie.js
/assets/js/resolveurs/facteur-risque.js
/assets/js/resolveurs/biologie.js
/assets/js/resolveurs/antecedent.js
/assets/js/resolveurs/traitement.js
/assets/js/vues/composants.js           fabriques d'éléments : grille, colonne de boutons, menu…
/assets/js/vues/dossier.js              écran 4.1 — dossier patient
/assets/js/vues/fenetre-episodes.js     écran 4.2 — Episodes et suivis en cours
/assets/js/vues/fenetre-catalogue.js    écran 4.3 — Scores cliniques
/assets/js/vues/fenetre-score.js        écran 4.4 — saisie d'un score
/assets/js/vues/courbe-historique.js    écran 4.5 — courbe SVG native
/data/scores/score2.json
/data/scores/score2-abaque-bas-risque.json
/data/scores/phq9.json
/data/scores/hdrs17.json
/data/mapping-cim10.json
/data/demo/patient-58-hta.json
/data/demo/patient-34-depression.json
/data/demo/patient-35-captures.json
/data/referentiel.js                    GÉNÉRÉ — copie des .json pour l'ouverture hors serveur
/outils/generer-referentiel.py          régénère le fichier ci-dessus
/outils/generer-abaque-vide.py          régénère la grille vide de l'abaque SCORE2
/design/screens/*.png                   captures de référence
/docs/SPECIFICATION.md                  ce document
/docs/schema-score.json                 schéma JSON formel d'une définition de score
/docs/composants.html                   planche de validation de la charte
/README.md
```

### 1.2 Écarts par rapport au cahier des charges

| Ajout | Motif |
|-------|-------|
| `assets/js/dossier.js` | Isole en un seul point tout ce que le module lit du dossier patient. C'est ce fichier qui matérialise le contrat que XMed devra fournir : le remplacer suffit à brancher le module sur le vrai dossier. Les résolveurs ne parlent qu'à lui. |
| `assets/js/donnees.js` | Sépare le *chargement* du référentiel de son *exploitation*. Le moteur ne sait pas d'où viennent les définitions. |
| `data/referentiel.js` + `outils/generer-referentiel.py` | Rend la démo ouvrable en double-clic. Voir la section 2 : option A retenue. |
| `docs/schema-score.json` | Schéma JSON formel (draft-07). Permet à Olaqin de valider automatiquement toute nouvelle définition de score avant intégration. |
| `assets/js/rattachement.js` | Isole la logique « quels scores proposer, et pourquoi ». Distingue le rattachement par code CIM-10 de celui par facteur de risque, ce qui conditionne le libellé du bouton contextuel. Voir point ouvert 10. |
| `assets/js/outils.js` | Dates, nombres, comparaison de codes CIM-10 par préfixe. Aucune règle métier. |

### 1.3 Rôle de chaque module

| Module | Responsabilité | Ne fait pas |
|--------|----------------|-------------|
| `app.js` | Amorçage, pile de fenêtres, raccourcis `Échap` / `Ctrl+S` / `Entrée` | Aucun calcul |
| `donnees.js` | Charge définitions, mapping, jeu de démo ; expose `getScore(id)` | Aucune interprétation |
| `dossier.js` | Expose le dossier du patient courant : démographie, facteurs de risque, ATCD codés, biologie, traitements | Aucune connaissance des scores |
| `resolveurs/*` | Traduisent un `resolveur` déclaré dans un item en une valeur tirée du dossier | Ne décident jamais d'une valeur par défaut |
| `moteur-score.js` | Éligibilité, calcul, interprétation, complétude, alertes | Aucun accès au DOM |
| `store.js` | Lecture / écriture des évaluations, interface `async` | Aucun calcul |
| `vues/*` | Rendu et clavier | Aucun calcul, aucun accès direct au store |

Cette séparation n'est pas un ornement : `moteur-score.js` est le fichier
qu'Olaqin réécrira à l'identique, et il doit pouvoir être testé sans écran.

---

## 2. Contrainte de chargement des données — arbitrée : option A

Le cahier des charges demande trois choses simultanément :

1. un référentiel en fichiers `.json` ;
2. des modules ES (`import` / `export`) ;
3. un fonctionnement en **double-clic depuis le disque**.

**Les points 1 et 2 sont chacun incompatibles avec le point 3.** En `file://`,
l'origine du document est opaque : les navigateurs refusent aussi bien
`fetch('data/…json')` que l'import d'un module ES. Ce n'est pas contournable
côté code, c'est la politique d'origine du navigateur. Aucune de ces trois
exigences n'est négociable de mon fait : il faut choisir.

### Option A — scripts classiques + référentiel embarqué  *(recommandée)*

- Les fichiers JS sont chargés par `<script src>` dans l'ordre, et publient
  leurs symboles dans un unique espace de noms `XMed`. Le découpage en fichiers,
  les commentaires et la lisibilité sont identiques ; seule la syntaxe
  `import`/`export` disparaît — sans conséquence pour une réimplémentation en
  natif.
- Les `.json` restent la **source de vérité**, c'est eux qu'Olaqin reprend.
  `data/referentiel.js` en est une copie générée, chargée quand `fetch` échoue.
- Le chargeur tente `fetch` d'abord : servie en HTTP (GitHub Pages, poste de
  développement), la démo lit les vrais `.json`. Ouverte en double-clic, elle lit
  la copie embarquée et affiche discrètement « référentiel embarqué, généré
  le … ».
- Garde-fou contre la dérive : chaque entrée embarquée porte la `version` de son
  fichier source ; quand les deux sont lisibles, le chargeur compare et signale
  toute divergence.

Coût : un script de 20 lignes à relancer quand une définition change. Ce n'est
pas une étape de compilation — le dépôt livre le fichier généré, rien n'est à
installer pour ouvrir la démo.

### Option B — modules ES + `fetch` des `.json`, servis en HTTP

Strictement conforme aux points 1 et 2, abandonne le double-clic. Il faut alors
soit ouvrir la démo publiée sur GitHub Pages, soit lancer une ligne de commande
sur le poste :

```bash
python -m http.server 8777
```

C'est plus propre techniquement, mais en réunion cela suppose une connexion ou
un terminal.

**Décision du commanditaire (28/08/2026) : option A.** Elle préserve les trois
usages — double-clic, GitHub Pages, et des `.json` intacts pour Olaqin — au prix
d'un fichier généré. L'étape 3 est construite sur cette base.

> Pour Olaqin : ce choix n'a aucune portée sur le produit final. Il ne concerne
> que l'ouverture de la maquette hors serveur. En natif, les définitions seront
> lues en base (`SCORE_DEF`, section 8) ou sur disque, sans passer par le
> navigateur.

---

## 3. Schéma d'une définition de score

Fichier : `data/scores/<id>.json`. Schéma formel :
[`docs/schema-score.json`](schema-score.json).

**Principe directeur : ajouter un score ne doit demander aucune ligne de
JavaScript.** Tout ce qui varie d'un score à l'autre — nombre d'items, modalités,
libellés, mode de calcul, seuils d'interprétation, conditions d'éligibilité,
alertes, sources de pré-remplissage — est porté par le fichier de données. Le
moteur ne contient aucun cas particulier nommé « SCORE2 » ou « PHQ-9 ».

### 3.1 En-tête

```json
{
  "id": "phq9",
  "versionSchema": "1.0.0",
  "version": "1.0.0",
  "statut": "a-valider",
  "acronyme": "PHQ-9",
  "libelle": "Patient Health Questionnaire — 9 items",
  "domaine": "Psychiatrie",
  "synonymes": ["questionnaire dépression"],
  "typePassation": "auto",
  "dureeEstimeeMin": 3,
  "reference": "Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med 2001;16:606-13",
  "licence": "[À VALIDER] conditions de reproduction",
  "consigne": "Au cours des 2 dernières semaines, à quelle fréquence …"
}
```

| Champ | Type | Rôle |
|-------|------|------|
| `id` | chaîne | Identifiant technique, en minuscules, sans accent. Nom du fichier. |
| `versionSchema` | chaîne | Version du **schéma** respecté par le fichier. Permet à Olaqin de faire évoluer le format sans casser l'existant. |
| `version` | chaîne | Version de **cette définition**. Toute évaluation enregistrée conserve la version utilisée : un score recalculé dix ans plus tard doit rester lisible tel qu'il a été coté. |
| `statut` | énuméré | `brouillon` \| `a-valider` \| `valide`. Un score non `valide` s'affiche avec la mention correspondante. C'est le garde-fou contre les intitulés de travail qui prendraient un air officiel. |
| `typePassation` | énuméré | `auto` (le patient répond) \| `hetero` (le clinicien cote) \| `mixte` \| `calcule` (aucune saisie, tout vient du dossier). Détermine la colonne « Auto » du catalogue et le futur mode passation patient. |
| `licence` | chaîne | Conditions de reproduction de l'échelle. Bloquant avant toute diffusion publique du dépôt — voir section 12. |

### 3.2 Modalités

`modalitesCommunes` s'applique à tout item ordinal qui ne déclare pas les
siennes. Un item dont `modalites` n'est pas `null` **écrase** cette liste — c'est
ce qui permet au HDRS-17 de coter certains items de 0 à 4 et d'autres de 0 à 2,
avec des libellés propres à chacun.

```json
"modalitesCommunes": [
  { "valeur": 0, "libelle": "Jamais" },
  { "valeur": 1, "libelle": "Plusieurs jours" },
  { "valeur": 2, "libelle": "Plus d'une semaine" },
  { "valeur": 3, "libelle": "Presque tous les jours" }
]
```

Chaque modalité accepte un `abrege` facultatif, utilisé quand la largeur
disponible ne permet pas d'afficher le libellé entier.

### 3.3 Items — cinq types

Tronc commun de tout item :

```json
{
  "id": "phq9_1",
  "numero": 1,
  "intitule": "[À VALIDER] Intérêt ou plaisir à faire les choses",
  "aide": null,
  "type": "ordinal",
  "requis": true,
  "resolveur": null,
  "alerte": null,
  "inclusDansTotal": true
}
```

| Champ | Rôle |
|-------|------|
| `requis` | Un item requis manquant empêche le résultat d'être présenté comme définitif. Le compteur « 12 / 17 items renseignés » ne compte que ceux-là. |
| `inclusDansTotal` | `false` pour un item qui alimente le calcul sans s'additionner — par exemple le non-HDL de SCORE2, qui sert d'entrée d'abaque. |
| `aide` | Précision affichée sous l'intitulé. Jamais une conduite à tenir. |

**`ordinal`** — cotation par boutons radio horizontaux libellés. Utilise
`modalitesCommunes` ou ses propres `modalites`.

**`enumere`** — même rendu, mais les valeurs ne sont pas ordonnées et ne
s'additionnent pas (`inclusDansTotal` vaut alors `false` ou l'item sert d'entrée
d'abaque). Exemple : le sexe dans SCORE2.

```json
{ "id": "score2_sexe", "numero": 2, "intitule": "Sexe", "type": "enumere",
  "requis": true, "inclusDansTotal": false,
  "modalites": [ { "valeur": "femme", "libelle": "Femme" },
                 { "valeur": "homme", "libelle": "Homme" } ],
  "resolveur": { "type": "demographie", "champ": "sexe" } }
```

**`booleen`** — deux modalités. Les libellés sont surchargeables (« Non-fumeur » /
« Fumeur actif » plutôt que « Non » / « Oui »).

```json
{ "id": "score2_tabac", "numero": 3, "intitule": "Tabagisme actif",
  "type": "booleen", "requis": true, "inclusDansTotal": false,
  "modalites": [ { "valeur": false, "libelle": "Non-fumeur" },
                 { "valeur": true,  "libelle": "Fumeur actif" } ],
  "resolveur": { "type": "facteurRisque", "libelles": ["Tabagisme actif", "Tabac"] } }
```

**`numerique`** — champ de saisie avec unité, bornes de plausibilité et nombre de
décimales. Les bornes ne corrigent rien : une saisie hors bornes est refusée avec
un message, elle n'est jamais silencieusement ramenée dans l'intervalle.

```json
{ "id": "score2_chol_total", "numero": 5, "intitule": "Cholestérol total",
  "type": "numerique", "requis": true, "inclusDansTotal": false,
  "unite": "mmol/l", "decimales": 2, "min": 1.0, "max": 15.0,
  "unitesAcceptees": [
    { "unite": "g/l", "vers": "mmol/l", "facteur": 2.586 }
  ],
  "resolveur": {
    "type": "biologie",
    "code": { "loinc": "2093-3", "libellesLocaux": ["Cholestérol total", "CHOL T"] },
    "fraicheurMaxJours": 1095,
    "conversions": { "g/l": { "vers": "mmol/l", "facteur": 2.586 } }
  } }
```

`unitesAcceptees` gouverne la **saisie** (le clinicien tape 2.31 g/l, le champ
affiche la conversion), `conversions` gouverne la **résolution** depuis la
biologie. La conversion est toujours affichée, jamais silencieuse :
`2.31 g/l → 5.97 mmol/l`.

**`calcule`** — valeur dérivée d'autres items. Non saisissable, recalculée à
chaque frappe.

```json
{ "id": "score2_non_hdl", "numero": 7, "intitule": "Cholestérol non-HDL",
  "type": "calcule", "requis": true, "inclusDansTotal": false,
  "unite": "mmol/l", "decimales": 2,
  "operation": { "operateur": "soustraction",
                 "operandes": ["score2_chol_total", "score2_hdl"] } }
```

L'expression est **structurée**, pas textuelle : pas d'`eval`, pas d'analyseur
syntaxique à écrire, et une transposition immédiate en natif. Opérateurs
acceptés : `addition`, `soustraction`, `produit`, `quotient`, `puissance`. Un
opérande est un `id` d'item ou une constante numérique. Si un opérande manque,
l'item calculé reste vide — il ne vaut jamais zéro par défaut.

### 3.4 Résolveurs

Un item déclare d'où sa valeur *peut* être tirée du dossier. Le détail des cinq
types et leurs signatures arrivent en section 7 (étape 3). Deux règles tiennent
dès maintenant :

- `resolveur` accepte un objet ou un **tableau** d'objets, essayés dans l'ordre —
  utile quand une même donnée existe sous deux formes dans le dossier ;
- une résolution qui n'aboutit pas laisse l'item **vide**. Aucun résolveur ne
  produit de valeur par défaut, jamais.

### 3.5 Calcul

Trois types, tous déclaratifs.

```json
"calcul": { "type": "somme", "min": 0, "max": 27 }
```
Somme des items `inclusDansTotal`. Le `max` sert au dénominateur affiché
(« 18 / 27 ») et à la validation du fichier : le moteur vérifie au chargement que
la somme des modalités maximales vaut bien `max`, et refuse la définition sinon.

```json
"calcul": { "type": "pondere", "min": 0, "max": 9 }
```
Chaque item porte un `poids`. Même contrôle de cohérence au chargement.

```json
"calcul": {
  "type": "tableau",
  "abaque": "score2-abaque-bas-risque.json",
  "unite": "%", "decimales": 1,
  "entrees": [
    { "item": "score2_sexe",    "axe": "sexe"   },
    { "item": "score2_age",     "axe": "age"    },
    { "item": "score2_tabac",   "axe": "tabac"  },
    { "item": "score2_pas",     "axe": "pas"    },
    { "item": "score2_non_hdl", "axe": "nonHdl" }
  ]
}
```
Lecture d'abaque : chaque item d'entrée est projeté sur un axe, et la cellule
correspondante est lue. Voir section 4.3.

Quel que soit le type, le moteur renvoie une structure explicite et ne lève
jamais d'exception métier :

```js
{ valeur: 18, unite: null, complet: true, motif: null }
{ valeur: null, unite: "%", complet: true, motif: "abaque incomplet" }
{ valeur: 12, unite: null, complet: false, motif: "6 items requis manquants" }
```

L'interface affiche « Abaque non renseigné » plutôt que de casser, et un résultat
`complet: false` s'affiche comme **partiel**, jamais comme définitif.

### 3.6 Interprétations

Cas simple — un tableau de tranches. `min` et `max` sont inclusifs ; `maxExclu`
les rend exclusifs quand l'échelle est continue.

```json
"interpretations": [
  { "min": 0,  "max": 4,  "libelle": "Absence de dépression", "couleur": "ok" },
  { "min": 5,  "max": 9,  "libelle": "Dépression légère",     "couleur": "neutre" },
  { "min": 10, "max": 14, "libelle": "Dépression modérée",    "couleur": "alerte" },
  { "min": 15, "max": 19, "libelle": "Dépression modérément sévère", "couleur": "alerte" },
  { "min": 20, "max": 27, "libelle": "Dépression sévère",     "couleur": "danger" }
]
```

Cas conditionnel — les seuils dépendent d'une autre donnée. C'est le cas de
SCORE2, dont l'interprétation dépend de la tranche d'âge. **Aucun cas particulier
n'est codé dans le moteur** : la condition est une donnée.

```json
"interpretations": {
  "selon": { "item": "score2_age" },
  "groupes": [
    { "condition": { "max": 49 }, "libelleCondition": "moins de 50 ans",
      "tranches": [
        { "min": 0,   "max": 2.5,  "maxExclu": true, "libelle": "Risque faible à modéré", "couleur": "ok" },
        { "min": 2.5, "max": 7.5,  "maxExclu": true, "libelle": "Risque élevé",           "couleur": "alerte" },
        { "min": 7.5, "max": null,                   "libelle": "Risque très élevé",      "couleur": "danger" }
      ] },
    { "condition": { "min": 50, "max": 69 }, "libelleCondition": "50 à 69 ans",
      "tranches": [
        { "min": 0,  "max": 5,  "maxExclu": true, "libelle": "Risque faible à modéré", "couleur": "ok" },
        { "min": 5,  "max": 10, "maxExclu": true, "libelle": "Risque élevé",           "couleur": "alerte" },
        { "min": 10, "max": null,                 "libelle": "Risque très élevé",      "couleur": "danger" }
      ] }
  ]
}
```

`couleur` prend `ok`, `neutre`, `alerte` ou `danger` : ce sont des rôles, pas des
couleurs. Leur rendu vient de `tokens.css`.

### 3.7 Éligibilité

`eligibilite` vaut `null` quand le score s'applique sans condition. Sinon, une
liste de règles évaluées sur le dossier à l'ouverture de la fenêtre.

```json
"eligibilite": {
  "regles": [
    { "id": "age-minimum", "type": "inclusion", "severite": "bloquant",
      "condition": { "source": "demographie", "champ": "age", "operateur": ">=", "valeur": 40 },
      "message": "SCORE2 est validé à partir de 40 ans.",
      "orientation": null },

    { "id": "age-maximum", "type": "inclusion", "severite": "bloquant",
      "condition": { "source": "demographie", "champ": "age", "operateur": "<=", "valeur": 69 },
      "message": "Au-delà de 70 ans, SCORE2 n'est plus l'échelle adaptée.",
      "orientation": { "score": "score2-op", "libelle": "SCORE2-OP", "disponible": false } },

    { "id": "exclusion-diabete", "type": "exclusion", "severite": "bloquant",
      "condition": { "source": "antecedent", "codesCim10": ["E10", "E11"] },
      "message": "Diabète codé dans le dossier.",
      "orientation": { "score": "score2-diabetes", "libelle": "SCORE2-Diabetes", "disponible": false } },

    { "id": "exclusion-grossesse", "type": "exclusion", "severite": "bloquant",
      "condition": { "source": "confirmation", "libelle": "Grossesse en cours ?" },
      "message": "Score non validé pendant la grossesse.",
      "orientation": null }
  ]
}
```

Quatre points de conception :

1. **`severite`** vaut `bloquant` — les items restent saisissables, le résultat
   n'est pas présenté comme exploitable — ou `avertissement` : simple mention.
2. **`orientation`** nomme l'échelle alternative. `disponible: false` signifie
   qu'elle n'est pas encore dans le référentiel : le bandeau la cite sans
   proposer de lien mort.
3. **`source: "confirmation"`** est une question posée au clinicien. Le dossier
   XMed ne permet pas de savoir de façon fiable qu'une patiente est enceinte : le
   module le demande plutôt que de deviner. Une déduction silencieuse sur un
   critère d'exclusion serait pire qu'une question.
4. Une exclusion ne se déclenche que sur une donnée **effectivement trouvée** :
   l'absence de code E11 dans le dossier ne prouve pas l'absence de diabète, et le
   bandeau le rappelle.

### 3.8 Alerte d'item

```json
"alerte": {
  "operateur": ">=", "valeur": 1,
  "severite": "avertissement",
  "masquable": false,
  "message": "Idées de mort ou d'auto-agression rapportées : une évaluation du risque suicidaire est indiquée."
}
```

Le message rappelle qu'une évaluation est indiquée. Il ne prescrit aucune
conduite à tenir : ce n'est pas le rôle du module.

---

## 4. Exemples de référence

### 4.1 PHQ-9 — fichier complet

Voir [`data/scores/phq9.json`](../data/scores/phq9.json). Les neuf intitulés sont
des **descripteurs de travail marqués `[À VALIDER]`**, pas la formulation de
l'échelle : leur rédaction définitive et la question de licence relèvent du
médecin. Les seuils d'interprétation sont ceux fournis par le commanditaire.

### 4.2 HDRS-17 — modalités propres à un item

Le HDRS-17 cote une partie de ses items de 0 à 4 et le reste de 0 à 2, avec des
libellés spécifiques à chaque item. Le schéma le porte sans aménagement : le
fichier ne déclare **pas** de `modalitesCommunes` et chaque item apporte les
siennes.

```json
{
  "id": "hdrs17",
  "statut": "a-valider",
  "modalitesCommunes": null,
  "items": [
    { "id": "hdrs_1", "numero": 1, "type": "ordinal", "requis": true,
      "intitule": "[À VALIDER] Humeur dépressive",
      "modalites": [
        { "valeur": 0, "libelle": "[À VALIDER] 0" },
        { "valeur": 1, "libelle": "[À VALIDER] 1" },
        { "valeur": 2, "libelle": "[À VALIDER] 2" },
        { "valeur": 3, "libelle": "[À VALIDER] 3" },
        { "valeur": 4, "libelle": "[À VALIDER] 4" }
      ] },
    { "id": "hdrs_4", "numero": 4, "type": "ordinal", "requis": true,
      "intitule": "[À VALIDER] Insomnie d'endormissement",
      "modalites": [
        { "valeur": 0, "libelle": "[À VALIDER] 0" },
        { "valeur": 1, "libelle": "[À VALIDER] 1" },
        { "valeur": 2, "libelle": "[À VALIDER] 2" }
      ] }
  ],
  "interpretations": null
}
```

`interpretations: null` est assumé : plusieurs jeux de seuils circulent pour le
HDRS-17. Tant que le médecin n'a pas tranché, le module affiche la valeur brute
et la mention « interprétation non renseignée ». Il n'invente pas de seuil.

### 4.3 SCORE2 — le cas complet

SCORE2 mobilise tout le schéma : items `numerique`, `enumere`, `booleen` et
`calcule`, éligibilité à quatre règles, calcul par abaque et interprétation
conditionnelle. Le fichier sera écrit à l'étape 3. Extrait de la partie calcul,
déjà donnée en 3.5 et 3.6.

### 4.4 L'abaque SCORE2

`data/scores/score2-abaque-bas-risque.json`. La France appartient à la région à
**bas risque** ; c'est cette calibration qui est retenue.

```json
{
  "id": "score2-abaque-bas-risque",
  "statut": "À COMPLÉTER — vérification médecin requise",
  "region": "bas risque",
  "reference": "SCORE2 working group and ESC Cardiovascular risk collaboration. Eur Heart J 2021;42:2439-2454",
  "licence": "[À VALIDER] conditions de reproduction de l'abaque ESC",
  "unite": "%",
  "axes": {
    "sexe":   { "type": "categoriel", "valeurs": ["femme", "homme"] },
    "age":    { "type": "tranche", "bornes": [[40,44],[45,49],[50,54],[55,59],[60,64],[65,69]] },
    "tabac":  { "type": "categoriel", "valeurs": ["non-fumeur", "fumeur"] },
    "pas":    { "type": "tranche", "unite": "mmHg", "bornes": [[100,119],[120,139],[140,159],[160,179]] },
    "nonHdl": { "type": "tranche", "unite": "mmol/l", "bornes": [[3.0,3.9],[4.0,4.9],[5.0,5.9],[6.0,6.9]] }
  },
  "cellules": [
    { "sexe": "homme", "age": "55-59", "tabac": "fumeur",
      "pas": "140-159", "nonHdl": "5.0-5.9", "valeur": null, "source": null }
  ]
}
```

- **384 cellules** (2 sexes × 6 tranches d'âge × 2 statuts tabagiques × 4 tranches
  de PAS × 4 tranches de non-HDL), toutes générées à `null`.
- `valeur` reste `null` tant que le médecin n'a pas reporté le chiffre publié ;
  `source` reçoit la référence ligne par ligne. **Aucun pourcentage n'est
  inventé.**
- Une cellule `null` fait renvoyer au moteur
  `{ valeur: null, motif: "abaque incomplet" }` et l'interface affiche « Abaque
  non renseigné ».
- Les bornes d'axes ci-dessus reprennent la structure de l'abaque publié : elles
  sont à **vérifier face au document source** avant de remplir les cellules.
- Cette structure est volontairement verbeuse : elle est relisible ligne à ligne
  face au document ESC, ce qui est précisément l'objet de la démonstration. La
  cible Olaqin sera vraisemblablement le **modèle continu** (Cox recalibré,
  *European Heart Journal* 2021), qui remplacera `calcul.type: "tableau"` par un
  type `"modele"` sans toucher au reste du fichier.
- **Point de licence à trancher avant toute diffusion publique du dépôt** : les
  droits de reproduction de l'abaque ESC ne sont pas établis.

---

## 5. Rattachement CIM-10

`data/mapping-cim10.json`. Rattachement par **préfixe** : `F32` couvre `F32.0` à
`F32.9`. Un code peut pointer vers plusieurs scores, ordonnés par pertinence.

```json
{
  "version": "1.0.0",
  "parCim10": [
    { "prefixe": "I10", "libelle": "Hypertension essentielle",
      "scores": [ { "id": "score2", "pertinence": 1 } ] },
    { "prefixe": "E78", "libelle": "Anomalies du métabolisme des lipoprotéines",
      "scores": [ { "id": "score2", "pertinence": 1 } ] },
    { "prefixe": "F32", "libelle": "Épisode dépressif",
      "scores": [ { "id": "phq9", "pertinence": 1 }, { "id": "hdrs17", "pertinence": 2 } ] },
    { "prefixe": "F33", "libelle": "Trouble dépressif récurrent",
      "scores": [ { "id": "phq9", "pertinence": 1 }, { "id": "hdrs17", "pertinence": 2 } ] },
    { "prefixe": "I48", "libelle": "Fibrillation et flutter auriculaires",
      "scores": [ { "id": "cha2ds2vasc", "pertinence": 1, "disponible": false } ] }
  ],
  "parFacteurRisque": [
    { "libelles": ["Tabagisme actif", "Tabac"],
      "scores": [ { "id": "score2", "pertinence": 2 } ] }
  ],
  "parCisp2": [],
  "parDrc": []
}
```

- `parFacteurRisque` permet à SCORE2 de remonter chez un patient tabagique même
  sans épisode I10 — le déclenchement n'est pas réservé au codage CIM-10.
- `parCisp2` et `parDrc` sont prévus et vides : XMed gère déjà ces référentiels
  (groupe de boutons radio de la capture 03), le module pourra s'y brancher sans
  changer de format.
- `disponible: false` déclare un score connu mais non implémenté : il apparaît au
  catalogue, grisé, plutôt que de disparaître silencieusement.

---

## 6. Ajouter un nouveau score

1. Créer `data/scores/<id>.json` d'après le schéma.
2. Le valider : `docs/schema-score.json` (draft-07).
3. Déclarer les codes CIM-10 déclencheurs dans `data/mapping-cim10.json`.
4. Régénérer `data/referentiel.js` — uniquement si l'option A est retenue.
5. Rien d'autre. Aucun fichier `.js` à modifier, aucune vue à toucher.

Le moteur refuse au chargement une définition incohérente (somme des modalités
maximales différente de `calcul.max`, opérande d'item calculé inexistant, tranches
d'interprétation qui se chevauchent ou laissent un trou, axe d'abaque sans item
d'entrée) et l'annonce plutôt que de calculer faux.

---

## 7. Contrat d'interface des résolveurs

C'est la partie que XMed doit fournir. Tout le reste du module en découle.

### 7.1 Ce que XMed expose

Une seule interface, matérialisée dans la maquette par
[`assets/js/dossier.js`](../assets/js/dossier.js). Les résolveurs ne parlent
qu'à elle, jamais aux données brutes : la remplacer suffit à brancher le module
sur le vrai dossier.

```ts
interface Dossier {
  demographie():     Demographie;
  facteursRisque():  FacteurRisque[];
  episodes():        Episode[];        // épisodes en cours
  episodesFermes():  Episode[];        // ATCD
  antecedents():     Episode[];        // les deux réunis
  biologie():        ResultatBiologique[];
  traitements():     Traitement[];
}

interface Demographie {
  dateNaissance: string;        // AAAA-MM-JJ
  age:           number;        // années révolues, recalculé, jamais stocké
  sexe:          'homme' | 'femme';
}

interface FacteurRisque {
  libelle: string;              // libellé local, pas de codage normalisé
  debut:   string | null;       // date de saisie
  actif:   boolean;
  notes:   string;
}

interface Episode {
  id:             string;
  libelle:        string;
  cim10:          string | null;   // INDISPENSABLE, y compris après clôture
  debut:          string;
  fin:            string | null;   // renseignée = épisode clos
  dernierContact: string | null;
}

interface ResultatBiologique {
  loinc:        string | null;  // code LOINC issu de l'intégration HPRIM
  libelle:      string;         // libellé local, repli quand le LOINC manque
  valeur:       number;
  unite:        string;
  valeur2:      number | null;  // seconde valeur (PAD, seconde unité)
  unite2:       string | null;
  date:         string;         // date de prélèvement — INDISPENSABLE
  anormal:      boolean;        // hors normes selon le laboratoire
  laboratoire:  string;
}

interface Traitement {
  atc:          string | null;  // code ATC
  libelle:      string;
  dernier:      string | null;  // dernière prescription
  periodicite:  string;
}
```

**Trois exigences dures, sans lesquelles le module ne peut pas fonctionner :**

1. **Le code LOINC de la biologie.** Sans lui, le rattachement d'un item à un
   examen repose sur des chaînes de caractères et casse au premier laboratoire
   qui écrit « CHOLESTEROL TOTAL » au lieu de « Cholestérol total ». Les
   libellés locaux sont un repli, pas une solution. À confirmer : le code issu
   de l'intégration HPRIM est-il conservé et accessible en lecture ?
2. **L'unité et la date de chaque résultat.** Sans unité, pas de conversion ;
   sans date, pas de contrôle de fraîcheur. Une valeur seule est inexploitable.
3. **Le code CIM-10 des épisodes, y compris clos.** Les règles d'exclusion de
   SCORE2 et la totalité du futur CHA₂DS₂-VASc reposent dessus.

Deux codes LOINC ont été fournis par le commanditaire et sont fiables :
`2093-3` (cholestérol total) et `2085-9` (cholestérol HDL). Le code `8480-6`
retenu pour la pression artérielle systolique est **à confirmer**.

### 7.2 Signature d'un résolveur

```ts
type Resolveur = (declaration: DeclarationResolveur, dossier: Dossier)
                 => ResultatBrut | null;

interface ResultatBrut {
  valeur:        number | string | boolean;
  unite:         string | null;
  dateSource:    string | null;
  libelleSource: string;        // phrase lisible : « Cholestérol total — Biolab (HPRIM) »
  anormal:       boolean;
}
```

Un résolveur renvoie `null` dès qu'il ne trouve rien de fiable. **Il ne produit
jamais de valeur par défaut.**

### 7.3 Ce que fait le registre, une fois pour toutes

[`resolveurs/registre.js`](../assets/js/resolveurs/registre.js) applique après
chaque résolution, pour que les cinq résolveurs n'aient pas à s'en soucier :

| Traitement | Règle |
|------------|-------|
| Chaîne de repli | `resolveur` peut être un tableau : les sources sont essayées dans l'ordre, la première qui répond gagne |
| Fraîcheur | au-delà de `fraicheurMaxJours`, le résultat est **écarté** et l'item reste vide ; au-delà de la moitié, il est proposé avec `confiance: 'vetuste'` et la mention d'ancienneté apparaît dans l'info-bulle |
| Conversion | appliquée selon `conversions`, avec conservation de `valeurSource` et `uniteSource` : l'affichage montre toujours `2,31 g/l → 5,97 mmol/l` |
| Traçabilité | le résultat porte `libelleSource`, `dateSource`, `confiance`, `anormal`, et la conversion appliquée |

Le résultat enrichi rendu à la vue :

```ts
interface Resolution {
  valeur; unite;
  valeurSource; uniteSource;          // avant conversion
  type;                                // 'biologie', 'demographie', ...
  libelleSource; dateSource;
  confiance: 'exacte' | 'vetuste';
  anormal:   boolean;
  conversion: { de, vers, facteur } | null;
}
```

### 7.4 Les cinq types

| Type | Source XMed | Déclaration | Ce qu'il renvoie |
|------|-------------|-------------|------------------|
| `demographie` | Cadre Identité | `{ champ: 'age' \| 'sexe' }` | l'âge recalculé, ou le sexe |
| `facteurRisque` | Cadre Facteurs de risque | `{ libelles: [...] }` | `true` si trouvé et actif — **jamais `false`** : l'absence au dossier ne prouve pas l'absence chez le patient |
| `biologie` | Cadre Eléments de suivi | `{ code: { loinc, libellesLocaux }, champ: 'valeur' \| 'valeur2' }` | la valeur la plus récente |
| `antecedent` | Episodes ouverts et clos | `{ codesCim10: [...] }` | `true` + l'épisode trouvé, par correspondance de préfixe |
| `traitement` | Cadre Traitements | `{ code: { atc } }` | `true` + le traitement, par préfixe ATC |

---

## 8. Modèle de persistance

Quatre tables. Les noms suivent la convention majuscule + préfixe observée dans
XMed ; **à aligner sur les conventions internes d'Olaqin**, que je ne connais
qu'à travers les captures.

### `SCORE_DEF` — définitions de scores

| Colonne | Type | Contrainte | Rôle |
|---------|------|-----------|------|
| `SCORE_ID` | VARCHAR(32) | **PK** | `score2`, `phq9` |
| `VERSION` | VARCHAR(16) | **PK** | versionnée : une définition modifiée est une nouvelle ligne, jamais une mise à jour |
| `ACRONYME` | VARCHAR(32) | NOT NULL | |
| `LIBELLE` | VARCHAR(255) | NOT NULL | |
| `DOMAINE` | VARCHAR(64) | NOT NULL | regroupement du catalogue |
| `STATUT` | VARCHAR(16) | NOT NULL | `brouillon` / `a-valider` / `valide` |
| `DEFINITION` | CLOB / NVARCHAR(MAX) | NOT NULL | le JSON complet, tel quel |
| `ACTIF` | BOOLEAN | NOT NULL | retrait du catalogue sans suppression |
| `MAJ_LE`, `MAJ_PAR` | DATETIME, VARCHAR | | traçabilité |

Le JSON est stocké **entier**. Éclater les items en colonnes rendrait
l'évolution du schéma coûteuse sans rien apporter : le module ne requête jamais
l'intérieur d'une définition en SQL.

### `SCORE_EVAL` — une évaluation

| Colonne | Type | Contrainte | Rôle |
|---------|------|-----------|------|
| `EVAL_ID` | BIGINT | **PK**, auto | |
| `PATIENT_ID` | BIGINT | **FK**, NOT NULL, indexé | |
| `EPISODE_ID` | BIGINT | **FK**, NULLABLE, indexé | voir section 9 |
| `SCORE_ID` | VARCHAR(32) | **FK** → `SCORE_DEF` | |
| `SCORE_VERSION` | VARCHAR(16) | NOT NULL | version employée au moment de la cotation |
| `DATE_EVAL` | DATE | NOT NULL, indexé | date clinique, modifiable par le praticien |
| `EVALUATEUR_ID` | BIGINT | **FK** utilisateur | |
| `VALEUR` | DECIMAL(10,3) | NULLABLE | **null est une valeur légitime** : abaque incomplet, score non calculable |
| `UNITE` | VARCHAR(16) | NULLABLE | `%` pour SCORE2, null pour un score additif |
| `MOTIF_NON_CALCUL` | VARCHAR(64) | NULLABLE | `abaque incomplet`, `items requis manquants` |
| `COMPLET` | BOOLEAN | NOT NULL | tous les items requis renseignés |
| `INTERPRETATION` | VARCHAR(128) | NULLABLE | libellé du seuil atteint, figé à l'enregistrement |
| `NOTES` | VARCHAR(2000) | | |
| `CREE_LE` | DATETIME | NOT NULL | horodatage technique, distinct de `DATE_EVAL` |

`VALEUR` et `INTERPRETATION` sont **figées** à l'enregistrement. Un score coté
en 2026 doit se relire en 2036 tel qu'il a été coté, même si la définition ou
les seuils ont changé entre-temps. C'est aussi pourquoi `SCORE_VERSION` est
conservée.

### `SCORE_EVAL_ITEM` — la cotation item par item

| Colonne | Type | Contrainte | Rôle |
|---------|------|-----------|------|
| `EVAL_ID` | BIGINT | **PK**, **FK** → `SCORE_EVAL`, ON DELETE CASCADE | |
| `ITEM_ID` | VARCHAR(48) | **PK** | `phq9_1`, `score2_chol_total` |
| `VALEUR_NUM` | DECIMAL(10,3) | NULLABLE | items ordinaux, numériques, calculés |
| `VALEUR_TXT` | VARCHAR(64) | NULLABLE | items énumérés (`homme`) |
| `ORIGINE` | VARCHAR(16) | NOT NULL | `saisie` / `auto` / `modifie` / `calcule` |
| `SOURCE_TYPE` | VARCHAR(16) | NULLABLE | `biologie`, `demographie`, … |
| `SOURCE_LIBELLE` | VARCHAR(255) | NULLABLE | ce qui s'affiche dans l'info-bulle |
| `SOURCE_DATE` | DATE | NULLABLE | date de la donnée d'origine |
| `SOURCE_VALEUR` | DECIMAL(10,3) | NULLABLE | valeur **avant** conversion |
| `SOURCE_UNITE` | VARCHAR(16) | NULLABLE | unité avant conversion |

Sans cette table, on ne saurait plus, six mois après, si le cholestérol coté
venait du laboratoire ou de la main du médecin. C'est une exigence de
traçabilité, pas un confort.

### `SCORE_CIM10_MAP` — rattachement

| Colonne | Type | Contrainte | Rôle |
|---------|------|-----------|------|
| `MAP_ID` | BIGINT | **PK**, auto | |
| `REFERENTIEL` | VARCHAR(8) | NOT NULL | `CIM10`, `CISP2`, `DRC`, `FDR` |
| `PREFIXE` | VARCHAR(16) | NOT NULL, indexé | `F32`, `E78.01` — **préfixe**, pas code exact |
| `LIBELLE` | VARCHAR(128) | | intitulé du préfixe, affiché dans le groupe épinglé |
| `SCORE_ID` | VARCHAR(32) | **FK** → `SCORE_DEF` | |
| `PERTINENCE` | SMALLINT | NOT NULL | 1 = le plus pertinent |
| `ACTIF` | BOOLEAN | NOT NULL | |

Index `(REFERENTIEL, PREFIXE)`. La recherche se fait par préfixe le plus long
d'abord : `E78.01` doit l'emporter sur `E78`.

---

## 9. Rattachement à l'épisode de soins

Une évaluation porte un `EPISODE_ID`, et ce lien doit **survivre à la clôture de
l'épisode**.

- La clôture d'un épisode renseigne sa date de fin ; elle ne supprime rien et
  ne détache rien. Les évaluations restent lisibles depuis l'épisode clos,
  affiché dans le cadre « Episodes fermés (ATCD) ».
- **Pas de suppression en cascade** depuis l'épisode vers les évaluations. Un
  épisode supprimé par erreur ne doit pas emporter l'historique de cotation.
  Si une suppression d'épisode est autorisée, `EPISODE_ID` passe à `NULL` et
  l'évaluation reste rattachée au patient.
- `EPISODE_ID` est **nullable** : une évaluation peut exister hors épisode.
  C'est le cas de dépistage évoqué au point ouvert 9 — SCORE2 lancé depuis le
  cadre Prévention plutôt que depuis un épisode.
- Une même évaluation n'est rattachée qu'à un seul épisode. Un score utile à
  deux épisodes est coté deux fois : les deux cotations ont des dates et des
  contextes distincts, les fusionner ferait perdre l'information.

---

## 10. CHA₂DS₂-VASc — décrit, non implémenté

Ce score n'est **pas** implémenté. Il est décrit ici parce qu'il servira à
valider le résolveur `antecedent` à l'itération suivante : contrairement aux
trois autres, la quasi-totalité de ses items sont des antécédents codés, donc
entièrement résolubles depuis le dossier.

| Caractéristique | Valeur |
|-----------------|--------|
| Domaine | Cardio-vasculaire |
| Usage | Risque thrombo-embolique dans la fibrillation atriale non valvulaire |
| Déclencheur | CIM-10 `I48` — déjà déclaré dans `mapping-cim10.json`, `disponible: false` |
| Calcul | `pondere` : chaque item porte son propre poids |
| Passation | `calcule` — aucune saisie si le dossier est bien codé |
| Référence | [À VALIDER] |
| Licence | [À VALIDER] |

Squelette de déclaration, à compléter par le médecin :

```json
{
  "id": "cha2ds2vasc",
  "statut": "brouillon",
  "typePassation": "calcule",
  "calcul": { "type": "pondere", "min": 0, "max": null },
  "items": [
    { "id": "chadsvasc_insuffisance_cardiaque", "numero": 1,
      "intitule": "[À VALIDER] Insuffisance cardiaque",
      "type": "booleen", "requis": true,
      "modalites": [ { "valeur": false, "libelle": "Non" },
                     { "valeur": true,  "libelle": "Oui" } ],
      "resolveur": { "type": "antecedent", "codesCim10": ["[À VALIDER]"] } }
  ]
}
```

**Les poids de chaque item et les codes CIM-10 de rattachement ne sont pas
renseignés ici : ils sont à reporter depuis la source par le médecin.** C'est la
même règle que pour l'abaque SCORE2 — une valeur plausible mais fausse est pire
qu'une case vide.

Ce que l'implémentation validera :

1. le résolveur `antecedent` sur une dizaine d'items d'affilée, avec des
   préfixes CIM-10 de longueurs différentes ;
2. le calcul `pondere`, écrit mais encore employé par aucun score ;
3. le cas d'un score `typePassation: "calcule"` sans aucune saisie manuelle ;
4. le comportement quand le dossier est mal codé : le score doit rester
   ostensiblement incomplet plutôt que de compter les antécédents absents
   comme des « non ».

Le point 4 est le plus important, et il n'est pas tranché : un antécédent non
codé au dossier n'est pas un antécédent absent. Un CHA₂DS₂-VASc calculé
automatiquement sur un dossier incomplet **sous-estimerait** le risque. La règle
retenue par la maquette — ne rien déduire d'un silence — impose ici que chaque
item non résolu reste vide et bloque le résultat. À confirmer avant
implémentation.

---

## 11. Ce que XMed devra exposer au module

Esquisse, détaillée à l'étape 3. Le module ne lit le dossier qu'à travers ces
cinq familles :

| Famille | Données attendues |
|---------|-------------------|
| Démographie | Date de naissance, sexe |
| Facteurs de risque | Libellé, date de saisie, actif ou non |
| Antécédents | Épisodes ouverts et clos, **codés CIM-10**, avec dates |
| Biologie | Dernières valeurs par **code LOINC**, avec libellé local, unité et date |
| Traitements | Traitements en cours par **code ATC** |

Le point dur est la biologie : le module a besoin du code LOINC, de l'unité et de
la date, pas seulement d'un libellé et d'un nombre. Les captures montrent que
XMed dispose de la structure (colonnes Examen, Valeur, Unité, Valeur 2, Unité 2,
date) ; reste à confirmer que le code LOINC issu de l'intégration HPRIM est
conservé et accessible.

---

## 12. Points ouverts

Ils appellent une décision, pas une proposition technique.

1. ~~**Chargement des données** — option A ou B (section 2).~~ **Tranché le
   28/08/2026 : option A.**
2. **Licences** — PHQ-9, HDRS-17 et abaque SCORE2 de l'ESC. À trancher avant
   toute mise en ligne publique du dépôt.
3. **Libellés d'items** — PHQ-9 et HDRS-17 : les intitulés sont des descripteurs
   de travail marqués `[À VALIDER]`.
4. **Seuils du HDRS-17** — plusieurs conventions coexistent ; laissés à `null`.
5. **Insertion dans l'observation** — automatique à l'enregistrement, ou sur
   action explicite ?
6. **Visibilité entre praticiens** — évaluations partagées par défaut au cabinet,
   ou filtre « mes évaluations » ?
7. **Mode passation patient** — le PHQ-9 est un auto-questionnaire : écran
   simplifié sur tablette en salle d'attente ? À documenter, non implémenté.
8. **Rappel de réévaluation** — PHQ-9 à 4 semaines, SCORE2 à 5 ans. Un champ
   `reevaluation` est prévu dans le schéma mais n'est pas exploité. À articuler
   avec le module Prévention en cours de développement chez Olaqin.
9. **SCORE2 hors épisode** — doit-il remonter comme score de dépistage depuis le
   cadre Prévention, et non depuis les épisodes de soins ?
10. **Bouton contextuel et facteurs de risque** — un score déclenché par un
    facteur de risque du patient n'est pas un « score de cet épisode ». La
    maquette distingue les deux voies et adapte le libellé du bouton
    (« Scores de cet épisode (2) » contre « Scores proposés (1) »). Faut-il
    conserver cette distinction, ou tout fondre sous un seul libellé ?
11. **Fraîcheur de la pression artérielle** — `fraicheurMaxJours` vaut 730 pour
    la PAS et 1095 pour le bilan lipidique. Ces durées sont des propositions,
    pas des recommandations : à arbitrer.
12. **Item non résolu du CHA₂DS₂-VASc** — voir section 10, point 4. Bloquant
    avant son implémentation.

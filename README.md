# Module « Scores cliniques » pour XMed — maquette de démonstration

Spécification exécutable d'une nouvelle fonctionnalité de XMed (Olaqin) :
évaluer, tracer et suivre les scores cliniques rattachés à un épisode de soins.

Cette maquette n'est pas le produit final. Elle sert à faire valider les écrans,
le référentiel de scores et le contrat d'interface avant réimplémentation en
environnement Windows natif par l'équipe Olaqin.

**Maquette de démonstration — aucune donnée réelle de patient.**

---

## État d'avancement

| Étape | Contenu | État |
|-------|---------|------|
| 1 | Analyse des captures, `tokens.css`, planche de composants | **validée** |
| 2 | Arborescence + schéma JSON de définition d'un score | **à valider** |
| 3 | Tranche verticale SCORE2 de bout en bout | à venir |
| 4 | PHQ-9 | à venir |
| 5 | HDRS-17 | à venir |

## Ce qui existe aujourd'hui

```
assets/css/tokens.css      jetons visuels (couleurs, métriques) issus des captures
assets/css/xmed.css        composants : cadre, fenêtre modale, grille, boutons, saisie
docs/composants.html       planche de validation de la charte
docs/SPECIFICATION.md      spécification technique destinée à Olaqin
docs/schema-score.json     schéma JSON formel d'une définition de score (draft-07)
data/scores/phq9.json      première définition de score, conforme au schéma
design/screens/            emplacement des captures de référence (voir plus bas)
```

## Lancer la planche de composants

Double-clic sur `docs/composants.html` — elle n'utilise que du CSS, elle
fonctionne depuis le disque.

Pour servir le dossier en HTTP (nécessaire dès que les données JSON seront
chargées, voir « Limite connue » ci-dessous) :

```bash
python -m http.server 8777
```

puis <http://localhost:8777/docs/composants.html>.

## Captures de référence manquantes

Les quatre captures citées par le cahier des charges ne sont **pas** présentes
dans `design/screens/` : elles ont été collées dans la conversation, pas
déposées sur le disque. Les couleurs de `tokens.css` proviennent donc d'une
lecture visuelle et non d'un prélèvement au pixel. Chaque jeton porte son
statut : `[LU]`, `[ESTIME]`, `[DEDUIT]`. Déposer les fichiers suivants permettra
de reprendre les 46 jetons `[ESTIME]` par prélèvement direct :

```
design/screens/01-dossier-patient-complet.png
design/screens/02-cadre-episodes-dossier.png
design/screens/03-fenetre-episodes-plein-ecran.png
design/screens/04-fenetre-episodes-en-contexte.png
```

## Limite connue — chargement des données en `file://`

Le cahier des charges demande à la fois un référentiel en fichiers `.json`, des
modules ES, et un fonctionnement en double-clic depuis le disque. Les trois sont
incompatibles : en `file://` un navigateur refuse aussi bien `fetch()` que
l'import d'un module ES (politique d'origine).

Deux options ont été posées en section 2 de
[`docs/SPECIFICATION.md`](docs/SPECIFICATION.md). **Option A retenue** : scripts
classiques et `data/referentiel.js` généré depuis les `.json`, qui restent la
source de vérité. Le double-clic et GitHub Pages fonctionnent tous les deux.

## Interdits tenus

- Aucun framework, aucun CDN, aucune dépendance npm.
- Aucune valeur de score, seuil, coefficient ou libellé d'item inventé : ce qui
  n'est pas sourcé est marqué `[À VALIDER]` ou laissé à `null`.
- Aucune conduite à tenir thérapeutique : le module affiche un score et son
  interprétation standardisée, rien de plus.

## Points ouverts

Ils sont tenus à jour dans `docs/SPECIFICATION.md` (à partir de l'étape 2). À ce
stade, ceux qui portent sur la charte figurent en fin de `docs/composants.html`.

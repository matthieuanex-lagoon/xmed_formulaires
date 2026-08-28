# Module « Scores cliniques » pour XMed — maquette de démonstration

Spécification exécutable d'une nouvelle fonctionnalité de XMed (Olaqin) :
évaluer, tracer et suivre les scores cliniques rattachés à un épisode de soins.

Cette maquette n'est pas le produit final. Elle sert à faire valider les écrans,
le référentiel de scores et le contrat d'interface avant réimplémentation en
environnement Windows natif par l'équipe Olaqin.

> **Maquette de démonstration. Aucune donnée réelle de patient : les trois
> dossiers sont fictifs, noms et numéros de sécurité sociale inventés.**

---

## Lancer la démo

**Double-clic sur `index.html`.** Rien à installer.

Ou, pour servir le dossier en HTTP et lire les vrais fichiers `.json` :

```bash
python -m http.server 8777
```

puis <http://localhost:8777/>.

La planche de validation de la charte visuelle est dans
[`docs/composants.html`](docs/composants.html).

## Le parcours de démonstration

Le sélecteur en haut à droite bascule entre trois dossiers, conçus pour être
déroulés dans cet ordre.

**1. Marcel BERTHOMIEU, 58 ans — le cas principal.**
Épisodes I10 et E78.0, tabagisme actif, bilan lipidique récent. Ouvrir le cadre
« Episodes et suivis en cours », puis le bouton **Scores de cet épisode (1)** :
SCORE2 s'ouvre directement, **six items sur sept sont renseignés depuis le
dossier** et le septième — le non-HDL — est calculé. Le cholestérol total
affiche sa conversion `2,31 g/l → 5,97 mmol/l`. Le résultat annonce **« Abaque
non renseigné »** : voir plus bas.

**2. Léa CHAUVEAU, 34 ans — le menu, l'historique, l'alerte.**
Épisode F33.1, rattaché à deux scores. Le bouton devient **Scores de cet épisode
(2)** et ouvre un menu déroulant portant le dernier résultat de chacun. Le PHQ-9
a trois évaluations antérieures : la courbe d'évolution les trace, avec les
bandes de seuils en fond. Coter l'item 9 au-dessus de 0 déclenche un bandeau
d'alerte non masquable.

**3. Bastien TESSIER, 35 ans — les garde-fous.**
Aucun de ses épisodes n'est rattaché à un score : **le bouton contextuel est
masqué, pas grisé**. Il faut passer par « Scores… ». En ouvrant SCORE2 :
un bandeau bloquant explique que l'échelle est validée à partir de 40 ans, et la
pression artérielle de 2023 n'est **pas** reprise — trop ancienne au regard de
`fraicheurMaxJours`. Deux items sur sept seulement sont pré-remplis.

Au clavier : `Tab` passe d'un item au suivant, les touches `0` à `9` cotent et
avancent, `Ctrl+S` enregistre, `Entrée` déclenche le bouton par défaut, `Échap`
ferme. Aucun `alert()` natif nulle part.

## Pourquoi SCORE2 n'affiche pas de pourcentage

C'est **voulu**, et c'est le cœur de la démonstration.

`data/scores/score2-abaque-bas-risque.json` contient les 384 cellules de
l'abaque ESC (2 sexes × 6 tranches d'âge × 2 statuts tabagiques × 4 tranches de
PAS × 4 tranches de non-HDL) — **toutes à `null`**. Aucun pourcentage n'a été
inventé. Le moteur renvoie proprement
`{ valeur: null, motif: "abaque incomplet" }` et l'interface affiche « Abaque
non renseigné » au lieu de bricoler un chiffre.

Remplir une cellule suffit à faire apparaître le résultat pour la combinaison
correspondante : la structure est faite pour être relue ligne à ligne face au
document source, et chaque cellule porte un champ `source` pour la référence du
report.

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | Le document destiné à Olaqin : schéma d'une définition de score, contrat d'interface des résolveurs, modèle de persistance `SCORE_*`, rattachement à l'épisode, fiche CHA₂DS₂-VASc, points ouverts |
| [`docs/schema-score.json`](docs/schema-score.json) | Schéma JSON formel (draft-07) d'une définition de score |
| [`docs/composants.html`](docs/composants.html) | Planche de validation de la charte visuelle |

## Ce qui est simulé, ce qui devra être branché

| Dans la maquette | En production XMed |
|------------------|--------------------|
| `assets/js/dossier.js` lit un JSON de démonstration | Le vrai dossier patient. **C'est le seul fichier à réécrire** : les résolveurs ne parlent qu'à lui |
| `assets/js/store.js` écrit dans `localStorage` | Les tables `SCORE_EVAL` / `SCORE_EVAL_ITEM` (section 8 de la spécification). L'interface est déjà `async` |
| Les définitions sont des `.json` du dépôt | La table `SCORE_DEF`, le JSON stocké tel quel |
| Icônes 16×16 dessinées en SVG | La bibliothèque d'icônes XMed |

## Limites connues

- **L'abaque SCORE2 est vide.** Voir plus haut. Volontaire.
- **Les intitulés d'items du PHQ-9 et du HDRS-17 sont des formulations de
  travail marquées `[À VALIDER]`**, jamais la rédaction officielle des échelles.
  Les libellés de modalités du HDRS-17 ne sont pas rédigés : seule la valeur
  numérique s'affiche.
- **Aucun seuil d'interprétation pour le HDRS-17** : plusieurs conventions
  coexistent, aucune n'est retenue tant que le médecin n'a pas tranché.
- **Les licences ne sont pas établies** — PHQ-9, HDRS-17, abaque ESC. À trancher
  avant toute diffusion large. Le dépôt ne reproduit à ce jour aucun contenu
  protégé : c'est précisément parce que les intitulés sont des formulations de
  travail et que l'abaque est vide.
- **CHA₂DS₂-VASc n'est pas implémenté**, seulement décrit (section 10 de la
  spécification). Il apparaît au catalogue, déclaré indisponible.
- Les quatre captures de référence ne sont pas dans `design/screens/` : les
  couleurs de `tokens.css` viennent d'une lecture visuelle, pas d'un prélèvement
  au pixel. Chaque jeton porte son statut `[LU]` / `[ESTIME]` / `[DEDUIT]`.

## Chargement des données en `file://`

Le cahier des charges demandait des `.json`, des modules ES **et** l'ouverture
en double-clic. Les trois sont incompatibles : en `file://` un navigateur refuse
aussi bien `fetch()` que l'import d'un module ES.

**Option retenue** : scripts classiques, et `data/referentiel.js` — copie
générée des `.json`, qui restent la source de vérité — chargée uniquement quand
`fetch` échoue. Servie en HTTP, la démo lit les vrais fichiers. Le raisonnement
complet est en section 2 de la spécification.

Après toute modification d'une définition, d'un patient ou du mapping :

```bash
python outils/generer-referentiel.py
```

## Interdits tenus

- Aucun framework, aucun CDN, aucune dépendance npm, aucune étape de
  compilation.
- Aucune valeur de score, seuil, coefficient ou libellé d'item inventé : ce qui
  n'est pas sourcé est marqué `[À VALIDER]` ou laissé à `null`.
- Aucune conduite à tenir thérapeutique : le module affiche un score et son
  interprétation standardisée, rien de plus.
- Aucun pré-remplissage silencieux : chaque valeur reprise du dossier porte la
  mention `Auto`, son origine est consultable, et une reprise manuelle la fait
  passer en `Modifié` sans perdre l'origine.
- Rien n'est déduit d'un silence du dossier : un facteur de risque absent n'est
  pas un facteur de risque négatif, et l'item reste vide.

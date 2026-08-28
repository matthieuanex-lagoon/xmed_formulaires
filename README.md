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
| 1 | Analyse des captures, `tokens.css`, planche de composants | **à valider** |
| 2 | Arborescence + schéma JSON de définition d'un score | à venir |
| 3 | Tranche verticale SCORE2 de bout en bout | à venir |
| 4 | PHQ-9 | à venir |
| 5 | HDRS-17 | à venir |

## Ce qui existe aujourd'hui

```
assets/css/tokens.css      jetons visuels (couleurs, métriques) issus des captures
assets/css/xmed.css        composants : cadre, fenêtre modale, grille, boutons, saisie
docs/composants.html       planche de validation de la charte
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
de reprendre les treize jetons `[ESTIME]` par prélèvement direct :

```
design/screens/01-dossier-patient-complet.png
design/screens/02-cadre-episodes-dossier.png
design/screens/03-fenetre-episodes-plein-ecran.png
design/screens/04-fenetre-episodes-en-contexte.png
```

## Limite connue — chargement des données en `file://`

Le cahier des charges demande à la fois un référentiel en fichiers `.json` et un
fonctionnement en double-clic depuis le disque. Les deux sont incompatibles en
l'état : un navigateur refuse `fetch()` sur `file://` (politique d'origine).

Proposition, à valider à l'étape 2 : les `.json` restent la source de vérité —
c'est ce que reprendra Olaqin — et un fichier `data/referentiel.js` généré à
partir d'eux les embarque pour l'usage hors serveur. Le chargeur tente `fetch()`
puis retombe sur le module embarqué. Aucune duplication à la main.

## Interdits tenus

- Aucun framework, aucun CDN, aucune dépendance npm.
- Aucune valeur de score, seuil, coefficient ou libellé d'item inventé : ce qui
  n'est pas sourcé est marqué `[À VALIDER]` ou laissé à `null`.
- Aucune conduite à tenir thérapeutique : le module affiche un score et son
  interprétation standardisée, rien de plus.

## Points ouverts

Ils sont tenus à jour dans `docs/SPECIFICATION.md` (à partir de l'étape 2). À ce
stade, ceux qui portent sur la charte figurent en fin de `docs/composants.html`.

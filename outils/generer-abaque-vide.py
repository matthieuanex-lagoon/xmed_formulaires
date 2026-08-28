#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genere la grille vide de l'abaque SCORE2 (region a bas risque).

Produit data/scores/score2-abaque-bas-risque.json avec TOUTES les cellules a
null : 2 sexes x 6 tranches d'age x 2 statuts tabagiques x 4 tranches de PAS
x 4 tranches de non-HDL = 384 cellules.

Aucun pourcentage n'est genere. Les valeurs doivent etre reportees a la main
depuis le document source de l'ESC, cellule par cellule, avec la reference
correspondante dans le champ "source".

Le script REFUSE d'ecraser un fichier existant, pour ne pas detruire un
remplissage en cours. Utiliser --force en connaissance de cause.

Usage :
    python outils/generer-abaque-vide.py [--force]
"""

import io
import json
import os
import sys

CIBLE = os.path.join("data", "scores", "score2-abaque-bas-risque.json")

# Structure de l'abaque publie. A VERIFIER face au document source avant tout
# remplissage : ce sont les axes qui conditionnent la lecture de chaque ligne.
AXES = {
    "sexe":   {"type": "categoriel", "valeurs": ["femme", "homme"]},
    "age":    {"type": "tranche", "unite": "ans",
               "bornes": [[40, 44], [45, 49], [50, 54], [55, 59], [60, 64], [65, 69]]},
    "tabac":  {"type": "categoriel", "valeurs": ["non-fumeur", "fumeur"]},
    "pas":    {"type": "tranche", "unite": "mmHg",
               "bornes": [[100, 119], [120, 139], [140, 159], [160, 179]]},
    "nonHdl": {"type": "tranche", "unite": "mmol/l",
               "bornes": [[3.0, 3.9], [4.0, 4.9], [5.0, 5.9], [6.0, 6.9]]},
}

# Ordre des axes dans les cellules : il fixe l'ordre de lecture du fichier,
# choisi pour coller au sens de lecture de l'abaque imprime.
ORDRE = ["sexe", "age", "tabac", "pas", "nonHdl"]


def etiquettes(axe):
    """Libelle textuel de chaque position d'un axe, utilise comme cle de cellule."""
    spec = AXES[axe]
    if spec["type"] == "categoriel":
        return list(spec["valeurs"])
    # Un axe dont une seule borne est decimale est formate en entier avec une
    # decimale partout : l'etiquette doit se lire telle quelle face a l'abaque
    # imprime ("5.0-5.9", pas "5-5.9").
    decimal = any(not float(v).is_integer() for b in spec["bornes"] for v in b)
    return ["%s-%s" % (formater(b[0], decimal), formater(b[1], decimal))
            for b in spec["bornes"]]


def formater(nombre, decimal):
    """40 -> '40' sur un axe entier ; 5.0 -> '5.0' sur un axe decimal."""
    return ("%.1f" % nombre) if decimal else str(int(nombre))


def cellules():
    """Produit les 384 cellules, dans l'ordre de ORDRE, toutes a null."""
    resultat = []

    def recursion(profondeur, courante):
        if profondeur == len(ORDRE):
            cellule = dict(courante)
            cellule["valeur"] = None   # AUCUN pourcentage genere.
            cellule["source"] = None   # Reference du report, ligne a ligne.
            resultat.append(cellule)
            return
        axe = ORDRE[profondeur]
        for etiquette in etiquettes(axe):
            courante[axe] = etiquette
            recursion(profondeur + 1, courante)

    recursion(0, {})
    return resultat


def main():
    force = "--force" in sys.argv
    if os.path.exists(CIBLE) and not force:
        print("Refus : %s existe deja. Utiliser --force pour l'ecraser." % CIBLE)
        return 1

    grille = cellules()

    # Les etiquettes sont ecrites dans le fichier plutot que recalculees par le
    # moteur : aucune regle de formatage n'est ainsi dupliquee entre le
    # generateur et le code JavaScript qui lit l'abaque.
    axes = {}
    for nom, spec in AXES.items():
        axes[nom] = dict(spec)
        axes[nom]["etiquettes"] = etiquettes(nom)

    document = {
        "id": "score2-abaque-bas-risque",
        "versionSchema": "1.0.0",
        "version": "1.0.0",
        "statut": "À COMPLÉTER — vérification médecin requise",
        "region": "bas risque",
        "reference": ("SCORE2 working group and ESC Cardiovascular risk collaboration. "
                      "Eur Heart J 2021;42:2439-2454"),
        "licence": "[À VALIDER] conditions de reproduction de l'abaque ESC",
        "unite": "%",
        "note": ("Toutes les cellules sont a null : aucun pourcentage n'a ete invente. "
                 "Reporter les valeurs publiees une a une et renseigner 'source'. "
                 "Tant qu'une cellule vaut null, le moteur renvoie "
                 "{ valeur: null, motif: 'abaque incomplet' } et l'interface affiche "
                 "'Abaque non renseigne'."),
        "axes": axes,
        "ordreAxes": ORDRE,
        "cellules": grille,
    }

    os.makedirs(os.path.dirname(CIBLE), exist_ok=True)
    with io.open(CIBLE, "w", encoding="utf-8", newline="\n") as sortie:
        json.dump(document, sortie, ensure_ascii=False, indent=2)
        sortie.write("\n")

    print("%s ecrit : %d cellules, toutes a null." % (CIBLE, len(grille)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

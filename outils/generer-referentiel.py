#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genere data/referentiel.js a partir des fichiers .json du referentiel.

POURQUOI CE FICHIER EXISTE
Ouverte en double-clic depuis le disque (file://), la maquette ne peut pas lire
ses .json : le navigateur refuse fetch() sur une origine opaque. Le fichier
genere embarque une copie des memes donnees, chargee uniquement dans ce cas.
Servie en HTTP (GitHub Pages, serveur local), la demo lit les vrais .json.

Les .json restent la SOURCE DE VERITE. Ce fichier est un derive : ne jamais
l'editer a la main, relancer ce script.

A relancer apres toute modification d'une definition de score, du mapping ou
d'un patient de demonstration :

    python outils/generer-referentiel.py

La liste FICHIERS doit rester identique a celle de assets/js/donnees.js.
"""

import io
import json
import os
import sys
from datetime import datetime

CIBLE = os.path.join("data", "referentiel.js")

FICHIERS = [
    "data/scores/score2.json",
    "data/scores/phq9.json",
    "data/scores/hdrs17.json",
    "data/scores/score2-abaque-bas-risque.json",
    "data/mapping-cim10.json",
    "data/demo/patient-58-hta.json",
    "data/demo/patient-34-depression.json",
    "data/demo/patient-35-captures.json",
]

ENTETE = """/* ============================================================================
   referentiel.js — FICHIER GENERE, NE PAS EDITER A LA MAIN.
   ----------------------------------------------------------------------------
   Copie des fichiers .json du referentiel, embarquee pour l'ouverture de la
   maquette en double-clic depuis le disque : en file://, le navigateur refuse
   fetch() sur les .json.

   Servie en HTTP, la demo lit les vrais fichiers et ignore ce module. Chaque
   entree porte la version de son fichier source : le chargeur compare et
   signale toute divergence.

   Regenerer avec :  python outils/generer-referentiel.py
   Genere le %s a partir de %d fichiers.
   ========================================================================== */
window.XMed = window.XMed || {};
XMed.referentiel = """


def main():
    manquants = [c for c in FICHIERS if not os.path.exists(c)]
    if manquants:
        print("Fichiers introuvables :")
        for c in manquants:
            print("  - %s" % c)
        return 1

    fichiers = {}
    for chemin in FICHIERS:
        with io.open(chemin, encoding="utf-8") as source:
            fichiers[chemin] = json.load(source)

    document = {
        "genereLe": datetime.now().isoformat(timespec="seconds"),
        "fichiers": fichiers,
    }

    corps = json.dumps(document, ensure_ascii=False, indent=2)

    os.makedirs(os.path.dirname(CIBLE), exist_ok=True)
    with io.open(CIBLE, "w", encoding="utf-8", newline="\n") as sortie:
        sortie.write(ENTETE % (document["genereLe"], len(FICHIERS)))
        sortie.write(corps)
        sortie.write(";\n")

    taille = os.path.getsize(CIBLE)
    print("%s ecrit : %d fichiers, %.1f Ko." % (CIBLE, len(FICHIERS), taille / 1024.0))
    return 0


if __name__ == "__main__":
    sys.exit(main())

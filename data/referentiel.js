/* ============================================================================
   referentiel.js — FICHIER GENERE, NE PAS EDITER A LA MAIN.
   ----------------------------------------------------------------------------
   Copie des fichiers .json du referentiel, embarquee pour l'ouverture de la
   maquette en double-clic depuis le disque : en file://, le navigateur refuse
   fetch() sur les .json.

   Servie en HTTP, la demo lit les vrais fichiers et ignore ce module. Chaque
   entree porte la version de son fichier source : le chargeur compare et
   signale toute divergence.

   Regenerer avec :  python outils/generer-referentiel.py
   Genere le 2026-08-28T16:12:56 a partir de 8 fichiers.
   ========================================================================== */
window.XMed = window.XMed || {};
XMed.referentiel = {
  "genereLe": "2026-08-28T16:12:56",
  "fichiers": {
    "data/scores/score2.json": {
      "id": "score2",
      "versionSchema": "1.0.0",
      "version": "1.0.0",
      "statut": "a-valider",
      "noteStatut": "Les intitulés d'items sont établis. Restent à valider : le remplissage de l'abaque ESC (toutes les cellules sont à null), la vérification des bornes d'axes face au document source, et les conditions de licence de l'abaque.",
      "acronyme": "SCORE2",
      "libelle": "Risque cardio-vasculaire fatal ou non fatal à 10 ans (ESC 2021)",
      "domaine": "Cardio-vasculaire",
      "synonymes": [
        "risque cardiovasculaire",
        "SCORE 2",
        "ESC 2021",
        "risque CV à 10 ans"
      ],
      "typePassation": "calcule",
      "dureeEstimeeMin": 1,
      "reference": "SCORE2 working group and ESC Cardiovascular risk collaboration. Eur Heart J 2021;42:2439-2454",
      "licence": "[À VALIDER] conditions de reproduction de l'abaque ESC",
      "consigne": "Estimation du risque à 10 ans d'événement cardio-vasculaire fatal ou non fatal chez le sujet apparemment sain. Calibration « région à bas risque », à laquelle appartient la France.",
      "eligibilite": {
        "regles": [
          {
            "id": "age-minimum",
            "type": "inclusion",
            "severite": "bloquant",
            "condition": {
              "source": "demographie",
              "champ": "age",
              "operateur": ">=",
              "valeur": 40
            },
            "message": "SCORE2 est validé à partir de 40 ans. En deçà, l'échelle n'est pas applicable.",
            "orientation": null
          },
          {
            "id": "age-maximum",
            "type": "inclusion",
            "severite": "bloquant",
            "condition": {
              "source": "demographie",
              "champ": "age",
              "operateur": "<=",
              "valeur": 69
            },
            "message": "À partir de 70 ans, SCORE2 n'est plus l'échelle adaptée.",
            "orientation": {
              "score": "score2-op",
              "libelle": "SCORE2-OP",
              "disponible": false
            }
          },
          {
            "id": "exclusion-ascvd",
            "type": "exclusion",
            "severite": "bloquant",
            "condition": {
              "source": "antecedent",
              "codesCim10": [
                "I21",
                "I25",
                "I63",
                "I70",
                "I73.9"
              ]
            },
            "message": "Maladie cardio-vasculaire athéroscléreuse établie, codée dans le dossier. SCORE2 s'adresse au sujet apparemment sain.",
            "orientation": {
              "score": null,
              "libelle": "prévention secondaire",
              "disponible": false
            }
          },
          {
            "id": "exclusion-diabete",
            "type": "exclusion",
            "severite": "bloquant",
            "condition": {
              "source": "antecedent",
              "codesCim10": [
                "E10",
                "E11"
              ]
            },
            "message": "Diabète codé dans le dossier.",
            "orientation": {
              "score": "score2-diabetes",
              "libelle": "SCORE2-Diabetes",
              "disponible": false
            }
          },
          {
            "id": "exclusion-irc",
            "type": "exclusion",
            "severite": "bloquant",
            "condition": {
              "source": "antecedent",
              "codesCim10": [
                "N18"
              ]
            },
            "message": "Insuffisance rénale chronique codée dans le dossier.",
            "orientation": null
          },
          {
            "id": "exclusion-hypercholesterolemie-familiale",
            "type": "exclusion",
            "severite": "bloquant",
            "condition": {
              "source": "antecedent",
              "codesCim10": [
                "E78.01"
              ]
            },
            "message": "Hypercholestérolémie familiale codée dans le dossier.",
            "orientation": null
          },
          {
            "id": "exclusion-grossesse",
            "type": "exclusion",
            "severite": "bloquant",
            "si": {
              "source": "demographie",
              "champ": "sexe",
              "operateur": "==",
              "valeur": "femme"
            },
            "condition": {
              "source": "confirmation",
              "libelle": "Grossesse en cours ?"
            },
            "message": "SCORE2 n'est pas validé pendant la grossesse.",
            "orientation": null
          }
        ]
      },
      "modalitesCommunes": null,
      "items": [
        {
          "id": "score2_age",
          "numero": 1,
          "intitule": "Âge",
          "aide": null,
          "type": "numerique",
          "requis": true,
          "inclusDansTotal": false,
          "unite": "ans",
          "decimales": 0,
          "min": 18,
          "max": 120,
          "resolveur": {
            "type": "demographie",
            "champ": "age"
          },
          "alerte": null
        },
        {
          "id": "score2_sexe",
          "numero": 2,
          "intitule": "Sexe",
          "aide": null,
          "type": "enumere",
          "requis": true,
          "inclusDansTotal": false,
          "modalites": [
            {
              "valeur": "femme",
              "libelle": "Femme"
            },
            {
              "valeur": "homme",
              "libelle": "Homme"
            }
          ],
          "resolveur": {
            "type": "demographie",
            "champ": "sexe"
          },
          "alerte": null
        },
        {
          "id": "score2_tabac",
          "numero": 3,
          "intitule": "Tabagisme actif",
          "aide": null,
          "type": "booleen",
          "requis": true,
          "inclusDansTotal": false,
          "modalites": [
            {
              "valeur": false,
              "libelle": "Non-fumeur"
            },
            {
              "valeur": true,
              "libelle": "Fumeur actif"
            }
          ],
          "resolveur": {
            "type": "facteurRisque",
            "libelles": [
              "Tabagisme actif",
              "Tabac",
              "Tabagisme"
            ],
            "fraicheurMaxJours": 1825
          },
          "alerte": null
        },
        {
          "id": "score2_pas",
          "numero": 4,
          "intitule": "Pression artérielle systolique",
          "aide": null,
          "type": "numerique",
          "requis": true,
          "inclusDansTotal": false,
          "unite": "mmHg",
          "decimales": 0,
          "min": 70,
          "max": 260,
          "resolveur": {
            "type": "biologie",
            "champ": "valeur",
            "code": {
              "loinc": "8480-6",
              "libellesLocaux": [
                "PAS/PAD",
                "PAS",
                "Pression artérielle systolique"
              ]
            },
            "fraicheurMaxJours": 730
          },
          "alerte": null
        },
        {
          "id": "score2_chol_total",
          "numero": 5,
          "intitule": "Cholestérol total",
          "aide": null,
          "type": "numerique",
          "requis": true,
          "inclusDansTotal": false,
          "unite": "mmol/l",
          "decimales": 2,
          "min": 1.0,
          "max": 15.0,
          "unitesAcceptees": [
            {
              "unite": "g/l",
              "vers": "mmol/l",
              "facteur": 2.586
            }
          ],
          "resolveur": {
            "type": "biologie",
            "champ": "valeur",
            "code": {
              "loinc": "2093-3",
              "libellesLocaux": [
                "Cholestérol total",
                "CHOL T",
                "Cholesterol total"
              ]
            },
            "fraicheurMaxJours": 1095,
            "conversions": {
              "g/l": {
                "vers": "mmol/l",
                "facteur": 2.586
              }
            }
          },
          "alerte": null
        },
        {
          "id": "score2_hdl",
          "numero": 6,
          "intitule": "Cholestérol HDL",
          "aide": null,
          "type": "numerique",
          "requis": true,
          "inclusDansTotal": false,
          "unite": "mmol/l",
          "decimales": 2,
          "min": 0.2,
          "max": 5.0,
          "unitesAcceptees": [
            {
              "unite": "g/l",
              "vers": "mmol/l",
              "facteur": 2.586
            }
          ],
          "resolveur": {
            "type": "biologie",
            "champ": "valeur",
            "code": {
              "loinc": "2085-9",
              "libellesLocaux": [
                "Cholestérol HDL",
                "HDL",
                "HDL cholestérol"
              ]
            },
            "fraicheurMaxJours": 1095,
            "conversions": {
              "g/l": {
                "vers": "mmol/l",
                "facteur": 2.586
              }
            }
          },
          "alerte": null
        },
        {
          "id": "score2_non_hdl",
          "numero": 7,
          "intitule": "Cholestérol non-HDL",
          "aide": "Calculé : cholestérol total moins cholestérol HDL.",
          "type": "calcule",
          "requis": true,
          "inclusDansTotal": false,
          "unite": "mmol/l",
          "decimales": 2,
          "operation": {
            "operateur": "soustraction",
            "operandes": [
              "score2_chol_total",
              "score2_hdl"
            ]
          },
          "resolveur": null,
          "alerte": null
        }
      ],
      "calcul": {
        "type": "tableau",
        "abaque": "score2-abaque-bas-risque.json",
        "unite": "%",
        "decimales": 1,
        "entrees": [
          {
            "item": "score2_sexe",
            "axe": "sexe"
          },
          {
            "item": "score2_age",
            "axe": "age"
          },
          {
            "item": "score2_tabac",
            "axe": "tabac"
          },
          {
            "item": "score2_pas",
            "axe": "pas"
          },
          {
            "item": "score2_non_hdl",
            "axe": "nonHdl"
          }
        ]
      },
      "interpretations": {
        "selon": {
          "item": "score2_age"
        },
        "groupes": [
          {
            "condition": {
              "max": 49
            },
            "libelleCondition": "moins de 50 ans",
            "tranches": [
              {
                "min": 0,
                "max": 2.5,
                "maxExclu": true,
                "libelle": "Risque faible à modéré",
                "couleur": "ok"
              },
              {
                "min": 2.5,
                "max": 7.5,
                "maxExclu": true,
                "libelle": "Risque élevé",
                "couleur": "alerte"
              },
              {
                "min": 7.5,
                "max": null,
                "libelle": "Risque très élevé",
                "couleur": "danger"
              }
            ]
          },
          {
            "condition": {
              "min": 50,
              "max": 69
            },
            "libelleCondition": "50 à 69 ans",
            "tranches": [
              {
                "min": 0,
                "max": 5,
                "maxExclu": true,
                "libelle": "Risque faible à modéré",
                "couleur": "ok"
              },
              {
                "min": 5,
                "max": 10,
                "maxExclu": true,
                "libelle": "Risque élevé",
                "couleur": "alerte"
              },
              {
                "min": 10,
                "max": null,
                "libelle": "Risque très élevé",
                "couleur": "danger"
              }
            ]
          }
        ]
      },
      "reevaluation": {
        "delaiJours": 1825,
        "libelle": "Réévaluation proposée à 5 ans"
      }
    },
    "data/scores/phq9.json": {
      "id": "phq9",
      "versionSchema": "1.0.0",
      "version": "1.0.0",
      "statut": "a-valider",
      "noteStatut": "Les neuf intitulés d'items sont des formulations de travail marquées [À VALIDER] : la rédaction définitive et les conditions de licence de l'échelle relèvent du médecin. Les seuils d'interprétation ont été fournis par le commanditaire.",
      "acronyme": "PHQ-9",
      "libelle": "Patient Health Questionnaire — 9 items",
      "domaine": "Psychiatrie",
      "synonymes": [
        "questionnaire dépression",
        "questionnaire de santé du patient"
      ],
      "typePassation": "auto",
      "dureeEstimeeMin": 3,
      "reference": "Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med 2001;16:606-13",
      "licence": "[À VALIDER] conditions de reproduction",
      "consigne": "Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné par les problèmes suivants ?",
      "eligibilite": null,
      "modalitesCommunes": [
        {
          "valeur": 0,
          "libelle": "Jamais",
          "abrege": "0"
        },
        {
          "valeur": 1,
          "libelle": "Plusieurs jours",
          "abrege": "1"
        },
        {
          "valeur": 2,
          "libelle": "Plus d'une semaine",
          "abrege": "2"
        },
        {
          "valeur": 3,
          "libelle": "Presque tous les jours",
          "abrege": "3"
        }
      ],
      "items": [
        {
          "id": "phq9_1",
          "numero": 1,
          "intitule": "[À VALIDER] Intérêt ou plaisir à faire les choses",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_2",
          "numero": 2,
          "intitule": "[À VALIDER] Humeur dépressive, tristesse, désespoir",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_3",
          "numero": 3,
          "intitule": "[À VALIDER] Sommeil : difficultés d'endormissement, réveils, ou excès de sommeil",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_4",
          "numero": 4,
          "intitule": "[À VALIDER] Fatigue, manque d'énergie",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_5",
          "numero": 5,
          "intitule": "[À VALIDER] Appétit : perte d'appétit ou prise alimentaire excessive",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_6",
          "numero": 6,
          "intitule": "[À VALIDER] Mauvaise estime de soi, sentiment d'échec ou de culpabilité",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_7",
          "numero": 7,
          "intitule": "[À VALIDER] Difficultés de concentration",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_8",
          "numero": 8,
          "intitule": "[À VALIDER] Ralentissement ou agitation psychomotrice",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "phq9_9",
          "numero": 9,
          "intitule": "[À VALIDER] Idées de mort ou d'auto-agression",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": null,
          "resolveur": null,
          "alerte": {
            "operateur": ">=",
            "valeur": 1,
            "severite": "avertissement",
            "masquable": false,
            "message": "Idées de mort ou d'auto-agression rapportées : une évaluation du risque suicidaire est indiquée."
          }
        }
      ],
      "calcul": {
        "type": "somme",
        "min": 0,
        "max": 27,
        "unite": null,
        "decimales": 0
      },
      "interpretations": [
        {
          "min": 0,
          "max": 4,
          "libelle": "Absence de dépression",
          "couleur": "ok"
        },
        {
          "min": 5,
          "max": 9,
          "libelle": "Dépression légère",
          "couleur": "neutre"
        },
        {
          "min": 10,
          "max": 14,
          "libelle": "Dépression modérée",
          "couleur": "alerte"
        },
        {
          "min": 15,
          "max": 19,
          "libelle": "Dépression modérément sévère",
          "couleur": "alerte"
        },
        {
          "min": 20,
          "max": 27,
          "libelle": "Dépression sévère",
          "couleur": "danger"
        }
      ],
      "reevaluation": null
    },
    "data/scores/hdrs17.json": {
      "id": "hdrs17",
      "versionSchema": "1.0.0",
      "version": "1.0.0",
      "statut": "a-valider",
      "noteStatut": "Les intitulés d'items sont des formulations de travail marquées [À VALIDER] et les libellés de modalités restent à rédiger : seule la valeur numérique est affichée. Aucun seuil d'interprétation n'est retenu, plusieurs conventions coexistant.",
      "acronyme": "HDRS-17",
      "libelle": "Hamilton Depression Rating Scale — 17 items",
      "domaine": "Psychiatrie",
      "synonymes": [
        "Hamilton",
        "HAM-D",
        "échelle de Hamilton"
      ],
      "typePassation": "hetero",
      "dureeEstimeeMin": 15,
      "reference": "Hamilton M. J Neurol Neurosurg Psychiatry 1960;23:56-62",
      "licence": "[À VALIDER] conditions de reproduction",
      "consigne": "Hétéro-évaluation. Coter l'état du patient sur la semaine écoulée.",
      "eligibilite": null,
      "modalitesCommunes": null,
      "items": [
        {
          "id": "hdrs_1",
          "numero": 1,
          "intitule": "[À VALIDER] Humeur dépressive",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_2",
          "numero": 2,
          "intitule": "[À VALIDER] Sentiments de culpabilité",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_3",
          "numero": 3,
          "intitule": "[À VALIDER] Suicide",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": {
            "operateur": ">=",
            "valeur": 1,
            "severite": "avertissement",
            "masquable": false,
            "message": "Item « suicide » coté : une évaluation du risque suicidaire est indiquée."
          }
        },
        {
          "id": "hdrs_4",
          "numero": 4,
          "intitule": "[À VALIDER] Insomnie d'endormissement",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_5",
          "numero": 5,
          "intitule": "[À VALIDER] Insomnie du milieu de nuit",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_6",
          "numero": 6,
          "intitule": "[À VALIDER] Insomnie du matin",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_7",
          "numero": 7,
          "intitule": "[À VALIDER] Travail et activités",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_8",
          "numero": 8,
          "intitule": "[À VALIDER] Ralentissement psychomoteur",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_9",
          "numero": 9,
          "intitule": "[À VALIDER] Agitation",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_10",
          "numero": 10,
          "intitule": "[À VALIDER] Anxiété psychique",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_11",
          "numero": 11,
          "intitule": "[À VALIDER] Anxiété somatique",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_12",
          "numero": 12,
          "intitule": "[À VALIDER] Symptômes somatiques gastro-intestinaux",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_13",
          "numero": 13,
          "intitule": "[À VALIDER] Symptômes somatiques généraux",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_14",
          "numero": 14,
          "intitule": "[À VALIDER] Symptômes génitaux",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_15",
          "numero": 15,
          "intitule": "[À VALIDER] Hypochondrie",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            },
            {
              "valeur": 3,
              "libelle": "3"
            },
            {
              "valeur": 4,
              "libelle": "4"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_16",
          "numero": 16,
          "intitule": "[À VALIDER] Perte de poids",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        },
        {
          "id": "hdrs_17",
          "numero": 17,
          "intitule": "[À VALIDER] Prise de conscience du trouble",
          "aide": null,
          "type": "ordinal",
          "requis": true,
          "inclusDansTotal": true,
          "modalites": [
            {
              "valeur": 0,
              "libelle": "0"
            },
            {
              "valeur": 1,
              "libelle": "1"
            },
            {
              "valeur": 2,
              "libelle": "2"
            }
          ],
          "resolveur": null,
          "alerte": null
        }
      ],
      "calcul": {
        "type": "somme",
        "min": 0,
        "max": 52,
        "unite": null,
        "decimales": 0
      },
      "interpretations": null,
      "reevaluation": null
    },
    "data/scores/score2-abaque-bas-risque.json": {
      "id": "score2-abaque-bas-risque",
      "versionSchema": "1.0.0",
      "version": "1.0.0",
      "statut": "À COMPLÉTER — vérification médecin requise",
      "region": "bas risque",
      "reference": "SCORE2 working group and ESC Cardiovascular risk collaboration. Eur Heart J 2021;42:2439-2454",
      "licence": "[À VALIDER] conditions de reproduction de l'abaque ESC",
      "unite": "%",
      "note": "Toutes les cellules sont a null : aucun pourcentage n'a ete invente. Reporter les valeurs publiees une a une et renseigner 'source'. Tant qu'une cellule vaut null, le moteur renvoie { valeur: null, motif: 'abaque incomplet' } et l'interface affiche 'Abaque non renseigne'.",
      "axes": {
        "sexe": {
          "type": "categoriel",
          "valeurs": [
            "femme",
            "homme"
          ],
          "etiquettes": [
            "femme",
            "homme"
          ]
        },
        "age": {
          "type": "tranche",
          "unite": "ans",
          "bornes": [
            [
              40,
              44
            ],
            [
              45,
              49
            ],
            [
              50,
              54
            ],
            [
              55,
              59
            ],
            [
              60,
              64
            ],
            [
              65,
              69
            ]
          ],
          "etiquettes": [
            "40-44",
            "45-49",
            "50-54",
            "55-59",
            "60-64",
            "65-69"
          ]
        },
        "tabac": {
          "type": "categoriel",
          "valeurs": [
            "non-fumeur",
            "fumeur"
          ],
          "etiquettes": [
            "non-fumeur",
            "fumeur"
          ]
        },
        "pas": {
          "type": "tranche",
          "unite": "mmHg",
          "bornes": [
            [
              100,
              119
            ],
            [
              120,
              139
            ],
            [
              140,
              159
            ],
            [
              160,
              179
            ]
          ],
          "etiquettes": [
            "100-119",
            "120-139",
            "140-159",
            "160-179"
          ]
        },
        "nonHdl": {
          "type": "tranche",
          "unite": "mmol/l",
          "bornes": [
            [
              3.0,
              3.9
            ],
            [
              4.0,
              4.9
            ],
            [
              5.0,
              5.9
            ],
            [
              6.0,
              6.9
            ]
          ],
          "etiquettes": [
            "3.0-3.9",
            "4.0-4.9",
            "5.0-5.9",
            "6.0-6.9"
          ]
        }
      },
      "ordreAxes": [
        "sexe",
        "age",
        "tabac",
        "pas",
        "nonHdl"
      ],
      "cellules": [
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "femme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "40-44",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "45-49",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "50-54",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "55-59",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "60-64",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "non-fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "100-119",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "120-139",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "140-159",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "3.0-3.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "4.0-4.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "5.0-5.9",
          "valeur": null,
          "source": null
        },
        {
          "sexe": "homme",
          "age": "65-69",
          "tabac": "fumeur",
          "pas": "160-179",
          "nonHdl": "6.0-6.9",
          "valeur": null,
          "source": null
        }
      ]
    },
    "data/mapping-cim10.json": {
      "versionSchema": "1.0.0",
      "version": "1.0.0",
      "note": "Rattachement par PRÉFIXE de code : F32 couvre F32.0 à F32.9. Un code peut pointer vers plusieurs scores, ordonnés par pertinence croissante (1 = le plus pertinent). Un score déclaré disponible:false apparaît au catalogue mais ne s'ouvre pas.",
      "parCim10": [
        {
          "prefixe": "I10",
          "libelle": "Hypertension essentielle",
          "scores": [
            {
              "id": "score2",
              "pertinence": 1
            }
          ]
        },
        {
          "prefixe": "E78",
          "libelle": "Anomalies du métabolisme des lipoprotéines",
          "scores": [
            {
              "id": "score2",
              "pertinence": 1
            }
          ]
        },
        {
          "prefixe": "F32",
          "libelle": "Épisode dépressif",
          "scores": [
            {
              "id": "phq9",
              "pertinence": 1
            },
            {
              "id": "hdrs17",
              "pertinence": 2
            }
          ]
        },
        {
          "prefixe": "F33",
          "libelle": "Trouble dépressif récurrent",
          "scores": [
            {
              "id": "phq9",
              "pertinence": 1
            },
            {
              "id": "hdrs17",
              "pertinence": 2
            }
          ]
        },
        {
          "prefixe": "I48",
          "libelle": "Fibrillation et flutter auriculaires",
          "scores": [
            {
              "id": "cha2ds2vasc",
              "pertinence": 1,
              "disponible": false
            }
          ]
        }
      ],
      "parFacteurRisque": [
        {
          "libelles": [
            "Tabagisme actif",
            "Tabac",
            "Tabagisme"
          ],
          "libelle": "Tabagisme actif",
          "scores": [
            {
              "id": "score2",
              "pertinence": 2
            }
          ]
        }
      ],
      "parCisp2": [],
      "parDrc": []
    },
    "data/demo/patient-58-hta.json": {
      "id": "p58hta",
      "dossier": "10428",
      "note": "PATIENT FICTIF. Cas principal de la démonstration : le bouton contextuel est présent sur l'épisode I10, SCORE2 s'ouvre directement, six items sur sept sont renseignés depuis le dossier et le septième est calculé.",
      "identite": {
        "civilite": "Monsieur",
        "nom": "BERTHOMIEU",
        "prenom": "Marcel",
        "dateNaissance": "1968-03-15",
        "sexe": "homme",
        "adresse": "12 rue des Peupliers",
        "codePostal": "44300",
        "ville": "NANTES",
        "telDomicile": "02 40 00 00 00",
        "gsm": "06 00 00 00 00",
        "mel": "",
        "numeroSecu": "1 68 03 44 000 000 00",
        "medecinTraitant": "ANEX Matthieu",
        "profession": "MENUISIER",
        "notesPubliques": "",
        "ald": false
      },
      "facteursRisque": [
        {
          "libelle": "Tabagisme actif",
          "debut": "2024-03-12",
          "notes": "15 paquets-années",
          "actif": true
        },
        {
          "libelle": "Antécédent familial coronarien",
          "debut": "2019-03-12",
          "notes": "père, IDM à 61 ans",
          "actif": true
        }
      ],
      "episodes": [
        {
          "id": "p58-e1",
          "acteur": "MAN",
          "libelle": "Hypertension essentielle",
          "cim10": "I10",
          "debut": "2019-03-12",
          "dernierContact": "2026-08-10",
          "notes": "",
          "aSuivre": true
        },
        {
          "id": "p58-e2",
          "acteur": "MAN",
          "libelle": "Hypercholestérolémie pure",
          "cim10": "E78.0",
          "debut": "2021-06-05",
          "dernierContact": "2026-06-12",
          "notes": "",
          "aSuivre": true
        },
        {
          "id": "p58-e3",
          "acteur": "MAN",
          "libelle": "Lombalgie commune",
          "cim10": "M54.5",
          "debut": "2025-11-03",
          "dernierContact": "2026-02-18",
          "notes": "",
          "aSuivre": false
        }
      ],
      "episodesFermes": [
        {
          "id": "p58-f1",
          "libelle": "Bronchite aiguë",
          "cim10": "J20.9",
          "debut": "2023-01-14",
          "fin": "2023-02-02",
          "notes": ""
        },
        {
          "id": "p58-f2",
          "libelle": "Entorse de la cheville",
          "cim10": "S93.4",
          "debut": "2021-08-07",
          "fin": "2021-09-20",
          "notes": ""
        }
      ],
      "biologie": [
        {
          "loinc": "2093-3",
          "libelle": "Cholestérol total",
          "valeur": 2.31,
          "unite": "g/l",
          "valeur2": null,
          "unite2": null,
          "date": "2026-06-12",
          "anormal": true,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2085-9",
          "libelle": "Cholestérol HDL",
          "valeur": 0.48,
          "unite": "g/l",
          "valeur2": null,
          "unite2": null,
          "date": "2026-06-12",
          "anormal": true,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2571-8",
          "libelle": "Triglycérides",
          "valeur": 1.42,
          "unite": "g/l",
          "valeur2": null,
          "unite2": null,
          "date": "2026-06-12",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "8480-6",
          "libelle": "PAS/PAD",
          "valeur": 152,
          "unite": "mmHg",
          "valeur2": 88,
          "unite2": "mmHg",
          "date": "2026-08-10",
          "anormal": true,
          "laboratoire": "cabinet"
        },
        {
          "loinc": "2160-0",
          "libelle": "Créatinine",
          "valeur": 9.8,
          "unite": "mg/l",
          "valeur2": 86.6,
          "unite2": "µmol/l",
          "date": "2026-06-12",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2345-7",
          "libelle": "Glycémie",
          "valeur": 0.98,
          "unite": "g/l",
          "valeur2": 5.44,
          "unite2": "mmol/l",
          "date": "2026-06-12",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        }
      ],
      "traitements": [
        {
          "atc": "C09AA05",
          "libelle": "RAMIPRIL 5MG CPR",
          "dernier": "2026-08-10",
          "periodicite": "3 mois"
        }
      ],
      "evaluationsInitiales": [
        {
          "id": "p58-ev1",
          "scoreId": "score2",
          "versionScore": "1.0.0",
          "episodeId": "p58-e1",
          "date": "2024-09-10",
          "evaluateur": "ANEX Matthieu",
          "valeurs": {
            "score2_age": 56,
            "score2_sexe": "homme",
            "score2_tabac": true,
            "score2_pas": 148,
            "score2_chol_total": 6.13,
            "score2_hdl": 1.32,
            "score2_non_hdl": 4.81
          },
          "resultat": {
            "valeur": null,
            "unite": "%",
            "motif": "abaque incomplet",
            "interpretation": null
          },
          "notes": "Évaluation de démonstration."
        },
        {
          "id": "p58-ev2",
          "scoreId": "score2",
          "versionScore": "1.0.0",
          "episodeId": "p58-e1",
          "date": "2025-11-20",
          "evaluateur": "ANEX Matthieu",
          "valeurs": {
            "score2_age": 57,
            "score2_sexe": "homme",
            "score2_tabac": true,
            "score2_pas": 155,
            "score2_chol_total": 6.05,
            "score2_hdl": 1.29,
            "score2_non_hdl": 4.76
          },
          "resultat": {
            "valeur": null,
            "unite": "%",
            "motif": "abaque incomplet",
            "interpretation": null
          },
          "notes": ""
        }
      ]
    },
    "data/demo/patient-34-depression.json": {
      "id": "p34dep",
      "dossier": "10711",
      "note": "PATIENT FICTIF. Démontre le menu à choix multiple (PHQ-9 et HDRS-17 rattachés à F33), l'historique, la courbe d'évolution et l'alerte de l'item 9.",
      "identite": {
        "civilite": "Madame",
        "nom": "CHAUVEAU",
        "prenom": "Léa",
        "dateNaissance": "1992-05-20",
        "sexe": "femme",
        "adresse": "4 impasse des Charmilles",
        "codePostal": "44000",
        "ville": "NANTES",
        "telDomicile": "",
        "gsm": "06 00 00 00 00",
        "mel": "",
        "numeroSecu": "2 92 05 44 000 000 00",
        "medecinTraitant": "ANEX Matthieu",
        "profession": "AIDE-SOIGNANTE",
        "notesPubliques": "",
        "ald": false
      },
      "facteursRisque": [],
      "episodes": [
        {
          "id": "p34-e1",
          "acteur": "MAN",
          "libelle": "Trouble dépressif récurrent, épisode moyen",
          "cim10": "F33.1",
          "debut": "2025-09-15",
          "dernierContact": "2026-07-17",
          "notes": "",
          "aSuivre": true
        },
        {
          "id": "p34-e2",
          "acteur": "MAN",
          "libelle": "Migraine sans aura",
          "cim10": "G43.0",
          "debut": "2023-02-11",
          "dernierContact": "2026-01-09",
          "notes": "",
          "aSuivre": false
        }
      ],
      "episodesFermes": [
        {
          "id": "p34-f1",
          "libelle": "Anémie par carence en fer",
          "cim10": "D50.9",
          "debut": "2022-04-05",
          "fin": "2022-10-18",
          "notes": ""
        }
      ],
      "biologie": [
        {
          "loinc": "3016-3",
          "libelle": "TSH",
          "valeur": 2.14,
          "unite": "mUI/l",
          "valeur2": null,
          "unite2": null,
          "date": "2026-04-02",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "718-7",
          "libelle": "Hémoglobine",
          "valeur": 12.8,
          "unite": "g/100ml",
          "valeur2": null,
          "unite2": null,
          "date": "2026-04-02",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "8480-6",
          "libelle": "PAS/PAD",
          "valeur": 118,
          "unite": "mmHg",
          "valeur2": 72,
          "unite2": "mmHg",
          "date": "2026-07-17",
          "anormal": false,
          "laboratoire": "cabinet"
        }
      ],
      "traitements": [
        {
          "atc": "N06AB06",
          "libelle": "SERTRALINE 50MG CPR",
          "dernier": "2026-07-17",
          "periodicite": "3 mois"
        }
      ],
      "evaluationsInitiales": [
        {
          "id": "p34-ev1",
          "scoreId": "phq9",
          "versionScore": "1.0.0",
          "episodeId": "p34-e1",
          "date": "2026-03-06",
          "evaluateur": "ANEX Matthieu",
          "valeurs": {
            "phq9_1": 3,
            "phq9_2": 3,
            "phq9_3": 3,
            "phq9_4": 3,
            "phq9_5": 3,
            "phq9_6": 3,
            "phq9_7": 2,
            "phq9_8": 2,
            "phq9_9": 1
          },
          "resultat": {
            "valeur": 23,
            "unite": null,
            "motif": null,
            "interpretation": "Dépression sévère"
          },
          "notes": "Introduction du traitement."
        },
        {
          "id": "p34-ev2",
          "scoreId": "phq9",
          "versionScore": "1.0.0",
          "episodeId": "p34-e1",
          "date": "2026-05-22",
          "evaluateur": "ANEX Matthieu",
          "valeurs": {
            "phq9_1": 3,
            "phq9_2": 3,
            "phq9_3": 3,
            "phq9_4": 2,
            "phq9_5": 2,
            "phq9_6": 3,
            "phq9_7": 2,
            "phq9_8": 2,
            "phq9_9": 1
          },
          "resultat": {
            "valeur": 21,
            "unite": null,
            "motif": null,
            "interpretation": "Dépression sévère"
          },
          "notes": ""
        },
        {
          "id": "p34-ev3",
          "scoreId": "phq9",
          "versionScore": "1.0.0",
          "episodeId": "p34-e1",
          "date": "2026-07-17",
          "evaluateur": "ANEX Matthieu",
          "valeurs": {
            "phq9_1": 2,
            "phq9_2": 3,
            "phq9_3": 2,
            "phq9_4": 2,
            "phq9_5": 1,
            "phq9_6": 3,
            "phq9_7": 2,
            "phq9_8": 2,
            "phq9_9": 1
          },
          "resultat": {
            "valeur": 18,
            "unite": null,
            "motif": null,
            "interpretation": "Dépression modérément sévère"
          },
          "notes": ""
        }
      ]
    },
    "data/demo/patient-35-captures.json": {
      "id": "p35cap",
      "dossier": "6740",
      "note": "PATIENT FICTIF. Reprise de la STRUCTURE du dossier des captures (mêmes épisodes, même biologie) mais avec une identité entièrement inventée : le dépôt est public, aucune identité figurant sur une capture n'y est reproduite. Démontre l'absence du bouton contextuel sur la dermite, le recours au catalogue complet, le garde-fou d'éligibilité SCORE2 (35 ans, hors bornes) et la règle de fraîcheur (PAS de 2023, trop ancienne pour être reprise).",
      "identite": {
        "civilite": "Monsieur",
        "nom": "TESSIER",
        "prenom": "Bastien",
        "dateNaissance": "1990-10-04",
        "sexe": "homme",
        "adresse": "59 rue de la Fontaine",
        "codePostal": "44000",
        "ville": "NANTES",
        "telDomicile": "02 40 00 00 00",
        "gsm": "06 00 00 00 00",
        "mel": "",
        "numeroSecu": "1 90 10 44 000 000 00",
        "medecinTraitant": "ANEX Matthieu",
        "profession": "",
        "notesPubliques": "NETTOYAGE INDUSTRIEL",
        "ald": false
      },
      "facteursRisque": [],
      "episodes": [
        {
          "id": "p35-e1",
          "acteur": "MAN",
          "libelle": "Non-Classé",
          "cim10": null,
          "debut": "2012-12-14",
          "dernierContact": null,
          "notes": "",
          "aSuivre": false
        },
        {
          "id": "p35-e2",
          "acteur": "MAN",
          "libelle": "Trouble anxieux et dépressif mixte",
          "cim10": "F41.2",
          "debut": "2015-10-30",
          "dernierContact": "2016-07-12",
          "notes": "",
          "aSuivre": false
        },
        {
          "id": "p35-e3",
          "acteur": "MAN",
          "libelle": "Dermite séborrhéique",
          "cim10": "L21.9",
          "debut": "2021-11-08",
          "dernierContact": "2021-11-08",
          "notes": "",
          "aSuivre": false
        },
        {
          "id": "p35-e4",
          "acteur": "MAN",
          "libelle": "Entorse du genou, droit",
          "cim10": "S83.6",
          "debut": "2025-12-30",
          "dernierContact": "2026-08-28",
          "notes": "",
          "aSuivre": true
        }
      ],
      "episodesFermes": [
        {
          "id": "p35-f1",
          "libelle": "Algodystrophie",
          "cim10": "M89.0",
          "debut": "2018-12-14",
          "fin": "2019-06-03",
          "notes": ""
        },
        {
          "id": "p35-f2",
          "libelle": "Contusion du genou",
          "cim10": "S80.0",
          "debut": "2016-11-07",
          "fin": "2016-12-15",
          "notes": ""
        },
        {
          "id": "p35-f3",
          "libelle": "Epitrochléite, coude droit",
          "cim10": "M77.0",
          "debut": "2020-12-21",
          "fin": "2021-03-08",
          "notes": "date aw 21/12"
        },
        {
          "id": "p35-f4",
          "libelle": "Sciatique",
          "cim10": "M54.3",
          "debut": "2025-06-06",
          "fin": "2025-07-28",
          "notes": ""
        },
        {
          "id": "p35-f5",
          "libelle": "Sténose de l'urètre bulbaire",
          "cim10": "N35.9",
          "debut": "2020-06-12",
          "fin": "2020-11-30",
          "notes": "chir chu nantes"
        },
        {
          "id": "p35-f6",
          "libelle": "Tendinite, Poignet, D",
          "cim10": "M65.4",
          "debut": "2023-09-19",
          "fin": "2023-11-02",
          "notes": ""
        },
        {
          "id": "p35-f7",
          "libelle": "Tendinite, Poignet, G",
          "cim10": "M65.4",
          "debut": "2025-10-30",
          "fin": "2025-12-11",
          "notes": ""
        },
        {
          "id": "p35-f8",
          "libelle": "Tendinite, Poignet, G",
          "cim10": "M65.4",
          "debut": "2023-12-07",
          "fin": "2024-01-25",
          "notes": ""
        }
      ],
      "biologie": [
        {
          "loinc": "2823-3",
          "libelle": "Potassium",
          "valeur": 4.7,
          "unite": "mmol/l",
          "valeur2": null,
          "unite2": null,
          "date": "2020-12-01",
          "anormal": true,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "33914-3",
          "libelle": "Clairance créatinine (MDRD)",
          "valeur": 76.3,
          "unite": "ml/mn",
          "valeur2": null,
          "unite2": null,
          "date": "2020-12-01",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2164-2",
          "libelle": "Clairance créatinine (Cockcroft)",
          "valeur": 81.5,
          "unite": "ml/mn",
          "valeur2": null,
          "unite2": null,
          "date": "2020-12-01",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2160-0",
          "libelle": "Créatinine",
          "valeur": 11.9,
          "unite": "mg/l",
          "valeur2": 105.3,
          "unite2": "µmol/l",
          "date": "2020-12-01",
          "anormal": true,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "2345-7",
          "libelle": "Glycémie",
          "valeur": 0.92,
          "unite": "g/l",
          "valeur2": 5.11,
          "unite2": "mmol/l",
          "date": "2020-12-01",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "718-7",
          "libelle": "Hémoglobine",
          "valeur": 15.6,
          "unite": "g/100ml",
          "valeur2": null,
          "unite2": null,
          "date": "2020-12-01",
          "anormal": false,
          "laboratoire": "Biolab (HPRIM)"
        },
        {
          "loinc": "8480-6",
          "libelle": "PAS/PAD",
          "valeur": 110,
          "unite": "mmHg",
          "valeur2": 70,
          "unite2": "mmHg",
          "date": "2023-05-31",
          "anormal": false,
          "laboratoire": "cabinet"
        },
        {
          "loinc": "29463-7",
          "libelle": "Poids",
          "valeur": 52,
          "unite": "kg",
          "valeur2": null,
          "unite2": null,
          "date": "2023-08-03",
          "anormal": false,
          "laboratoire": "cabinet"
        }
      ],
      "traitements": [
        {
          "atc": "D01AC08",
          "libelle": "KETOCONAZOLE 2% ARROW GEL SACHET 8",
          "dernier": "2026-08-28",
          "periodicite": "3 mois"
        },
        {
          "atc": "D07AC01",
          "libelle": "DIPROSONE 0,05% CR TUB 30G",
          "dernier": "2026-08-28",
          "periodicite": "3 mois"
        }
      ],
      "evaluationsInitiales": []
    }
  }
};

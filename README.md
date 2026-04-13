# map-creances-apd

Visualisation interactive des créances APD (Aide Publique au Développement) gérées par le Club de Paris, 2010-2024.

Carte du monde zoomable, slider temporel, bascule FR/EN, données par pays créditeur et débiteur.

## Structure

```
.
├── index.html          # Application (HTML + JS, un seul fichier, zéro build)
├── data.json           # Dataset consolidé, généré — ne pas éditer à la main
├── sources/            # Source de vérité, éditable à la main
│   ├── countries.csv           # iso, name_fr, name_en
│   ├── debtors.csv             # year, iso, apd_eur, napd_eur
│   ├── creditors.csv           # year, iso, nb_accords, statut, premiere_participation
│   └── country_urls.csv        # iso, role, url_fr, url_en
├── downloads/          # Snapshot "dernière année" exposé aux utilisateurs, généré
│   ├── club_de_paris_pays_debiteurs.csv
│   ├── club_de_paris_debtor_countries.csv
│   ├── club_de_paris_pays_crediteurs.csv
│   └── club_de_paris_creditor_countries.csv
├── processing/
│   └── build_data.py           # Transforme sources/*.csv → data.json + downloads/
└── .github/workflows/
    ├── build-data.yml          # Regénère data.json et downloads/ sur modif de sources/
    └── deploy.yml              # Publie sur GitHub Pages
```

## Pipeline de données

Les 4 CSV de `sources/` sont la **seule source de vérité**. `data.json` et `downloads/*.csv` sont des artefacts dérivés.

### Mise à jour des données

1. Éditer les CSV dans `sources/` (Excel, LibreOffice, éditeur texte…).
2. Commit + push sur `main`.
3. Le workflow `build-data.yml` regénère `data.json` automatiquement et le commit.
4. Le workflow `deploy.yml` déploie la nouvelle version sur GitHub Pages.

### Régénérer localement

```bash
python3 processing/build_data.py
```

Aucune dépendance externe — stdlib Python uniquement.

Pour vérifier que `data.json` est à jour sans l'écrire :

```bash
python3 processing/build_data.py --check
```

## Schéma des CSV

### `countries.csv`
Liste de tous les pays présents dans le dataset.

| Colonne | Exemple | Note |
|---|---|---|
| `iso` | `AFG` | ISO 3166-1 alpha-3 |
| `name_fr` | `Afghanistan` | Nom affiché en français |
| `name_en` | `Afghanistan` | Nom affiché en anglais |

### `debtors.csv`
Montants des créances APD / non-APD par pays débiteur et par année.

| Colonne | Exemple | Note |
|---|---|---|
| `year` | `2024` | |
| `iso` | `AFG` | Doit exister dans `countries.csv` |
| `apd_eur` | `111000000.00` | Aide publique au développement, en euros bruts |
| `napd_eur` | `957000000.00` | Non-APD, en euros bruts |

### `creditors.csv`
Informations sur les pays créditeurs membres du Club de Paris.

| Colonne | Exemple | Note |
|---|---|---|
| `year` | `2024` | |
| `iso` | `DEU` | Doit exister dans `countries.csv` |
| `nb_accords` | `380` | Nombre d'accords signés |
| `statut` | `Ad hoc` | `Ad hoc`, `Prospectif`, ou vide (permanent) |
| `premiere_participation` | `1956` | Année de première participation |

### `country_urls.csv`
URLs des fiches pays sur `clubdeparis.org`, FR et EN. Un pays peut apparaître deux fois (un enregistrement par rôle).

| Colonne | Exemple |
|---|---|
| `iso` | `AFG` |
| `role` | `debtor` ou `creditor` |
| `url_fr` | `https://clubdeparis.org/sites/…/afghanistan.html` |
| `url_en` | `https://clubdeparis.org/en/sites/…/afghanistan.html` |

## Fichiers téléchargeables (`downloads/`)

Générés par `build_data.py`, commités dans le repo, exposés sur le site à l'URL `/downloads/*.csv` et depuis l'accordéon d'accessibilité de la carte.

Ce sont des **snapshots de l'année la plus récente** du dataset (une ligne par pays), pensés pour une réutilisation rapide par des non-dev. Chaque fichier porte à la fois le nom FR et le nom EN de chaque pays, et pointe vers la fiche pays `clubdeparis.org` dans la langue adéquate.

| Fichier | Langue | Contenu |
|---|---|---|
| `club_de_paris_pays_debiteurs.csv` | FR | Débiteurs, headers FR, URLs `clubdeparis.org/` |
| `club_de_paris_debtor_countries.csv` | EN | Débiteurs, headers EN, URLs `clubdeparis.org/en/` |
| `club_de_paris_pays_crediteurs.csv` | FR | Créditeurs, headers FR, URLs `clubdeparis.org/` |
| `club_de_paris_creditor_countries.csv` | EN | Créditeurs, headers EN, URLs `clubdeparis.org/en/` |

Pour le dataset complet 2010-2024, consulter directement `sources/debtors.csv` et `sources/creditors.csv` (long format).

## Accessibilité

- **Skip link** (premier tab à l'arrivée sur la page) → ouvre l'accordéon `<details>` en bas, focus le titre.
- L'accordéon contient une description textuelle de la carte et les liens de téléchargement des 4 CSV ci-dessus — permet d'accéder aux données sans utiliser la visualisation graphique.
- i18n FR/EN automatique (param `?lang=en` ou `html[lang]`).

## Tester localement

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

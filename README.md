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

## Cohérence avec le FMI et conventions cartographiques

Le Club de Paris et le FMI (Fonds Monétaire International) travaillent main dans la main sur les restructurations de dette souveraine : par nature, les deux organisations s'alignent sur les mêmes listes de pays.

### Liste des pays — 100 % membres FMI

Le FMI compte **191 pays membres** en 2026 (190 membres UN + Kosovo). Les non-membres notables sont : Cuba, Monaco, Corée du Nord, Taïwan.

Nos 129 pays ont été vérifiés contre la liste FMI : **aucun des 129 pays de `sources/countries.csv` n'est non-membre du FMI**. L'ensemble est un sous-ensemble propre des 191 membres — ce sont les pays ayant eu au moins une ligne créditeur ou débiteur au Club de Paris entre 2010 et 2024.

### Fond cartographique — Natural Earth 110m

La carte rendue dans `index.html` utilise [Natural Earth 1:110m](https://www.naturalearthdata.com/) via le package npm [`world-atlas@2`](https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json) (public domain, politiquement neutre, utilisé par la Banque Mondiale, ONU OCHA et Reuters Graphics).

Quelques conventions diffèrent entre Natural Earth et le [DataMapper du FMI](https://www.imf.org/external/datamapper/) :

| Zone | Natural Earth (nous) | FMI | Impact sur la carte |
|---|---|---|---|
| **Taïwan** | Polygone séparé (TWN) | « Taiwan, Province of China » | TWN n'est pas dans nos 129 ISOs → rendu en *cream « pas de données »*, jamais colorié en créditeur/débiteur |
| **Crimée** | Incluse dans le polygone Ukraine | Exclue des données Ukraine depuis 2014 | ⚠️ **Divergence visible** : UKR est débiteur tous les ans de 2010 à 2024 (9,23 Md€ en 2024), donc la Crimée est colorée en orange avec le reste de l'Ukraine. Le FMI, lui, exclut la Crimée et Sébastopol des données ukrainiennes depuis la crise de 2014. |
| **Sahara occidental** | Polygone séparé (ESH) | Généralement intégré au Maroc | Zone sans données Club de Paris → neutre |
| **Kosovo** | Polygone séparé (XKX) | Membre FMI à part entière | ✅ Aligné |
| **Soudan / Sud-Soudan** | Deux polygones | Deux membres FMI | ✅ Aligné |
| **Somaliland** | Inclus dans Somalie | Inclus dans Somalie | ✅ Aligné |

**En pratique**, les divergences Taïwan et Sahara occidental concernent des zones sans données Club de Paris, donc sans impact visuel. **En revanche, la Crimée est une vraie divergence éditoriale** : elle apparaît colorée comme partie intégrante de l'Ukraine débitrice, alors que les données du Club de Paris (et du FMI) ne la comptabilisent plus depuis 2014. Corriger ce point demanderait soit de modifier le polygone Natural Earth de l'Ukraine, soit de superposer un polygone Crimée stylé « pas de données » — deux options non triviales qui restent à arbitrer.

### Pourquoi pas migrer vers des shapefiles FMI ?

Le FMI ne publie pas de GeoJSON/TopoJSON téléchargeable sous licence ouverte. Le DataMapper utilise ses propres assets non redistribuables. Natural Earth est public domain, stable, versionné et éditorialement défendable — c'est le bon choix pour ce projet.

**Sources de vérification** :
- [FMI — Liste des membres (date d'entrée)](https://www.imf.org/external/np/sec/memdir/memdate.htm)
- [FMI — Member Countries Factsheet (191 membres)](https://www.imf.org/en/About/Factsheets/Sheets/2023/IMF-members-quotas)
- [Natural Earth — 110m Admin 0 Countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/)

## Accessibilité

Audit mené face à la checklist du support [*Cartographie accessible*](https://beta.gouv.fr/) (Pôle Numérique Inclusif, beta.gouv.fr) et aux critères **WCAG 2.1 niveau AA**. Ci-dessous la liste exhaustive de ce qui est en place.

### Contrastes — WCAG 2.1 AA validé

Audit Python interne sur **33 combinaisons** texte/bordure/UI-component : 0 fail. Ratios minimum atteints :

- **Texte normal** (requis ≥ 4.5:1) : minimum 4.76:1 (year-labels inactifs), plupart ≥ 7:1.
- **UI components & graphiques** (requis ≥ 3:1) : minimum 4.62:1 (chevron `⬇`), plupart ≥ 5:1.

Ajustements clés par rapport à un design « orange vif + bleu » naïf :

- **Orange débiteur** : `#f97316` est conservé en **fill des pays sur la carte** (identité visuelle, pas un UI component au sens WCAG), mais tout **texte, bordure ou background actif de bouton** passe à `#c2410c` (ratio 5.18:1 sur fond blanc).
- **Swatch debtor de la légende** : fond `#f97316` avec bordure `#c2410c` pour garantir 3:1 vs bg blanc sans sacrifier l'identité.
- **Bordures grises** de boutons : `#d1d5db` → `#6b7280` (4.83:1).
- **Textes gris** : `#94a3b8` → `#64748b` pour year-labels et `.no-data`, `#64748b` → `#475569` pour légende et summary.

### Double codage couleur + motif

Toggle **« Couleurs / Motifs »** dans la `bottom-bar`, à côté d'un libellé « Légende ». Mode « Motifs » applique :

- **Débiteurs** : rayures diagonales orange sur fond clair (`<pattern>` SVG + CSS `repeating-linear-gradient` pour les swatches).
- **Créditeurs** : pointillés bleus sur fond clair.

Motifs volontairement sparse (couverture ~20 %) pour ne pas écraser la géographie. L'info passe par **couleur ET motif** simultanément : daltoniens et impression N/B restent servis.

### Navigation au clavier

Pattern standard **[roving tabindex](https://www.w3.org/WAI/ARIA/apg/patterns/)** de la WAI-ARIA Authoring Practices Guide :

- **`Tab`** depuis le skip-link → focus arrive sur le **premier pays alphabétique** ayant des données pour l'année courante. Un seul stop Tab pour la carte entière.
- **Flèches `←` `↑` `→` `↓`** → parcours les pays par ordre alphabétique (tri `Intl.Collator` localisé).
- **`Home` / `End`** → premier / dernier pays.
- **`Entrée` ou `Espace`** → sélectionne le pays focusé, ouvre le panel latéral.
- **`Tab` suivant** → sort de la carte vers la recherche, puis les filtres, le toggle, le slider, l'accordéon.

Ordre global de Tab : `skip-link` → premier pays de la carte → recherche → filtres (`Tous / Créanciers / Débiteurs`) → toggle (`Couleurs / Motifs`) → slider année → labels années → accordéon descriptif/téléchargements.

L'ensemble des boutons, inputs et liens utilisent des éléments HTML natifs (pas de `<div role="button">`) : tous accessibles clavier par défaut.

### Focus visible

Les pays focusés reçoivent une **surcouche CSS `:focus-visible`** avec stroke blanc + double `drop-shadow` sombre. Rendu contrasté garanti sur les trois fonds possibles (orange débiteur, bleu créditeur, cream pas-de-donnée).

Tous les boutons ont un `outline: 2px solid #c2410c` ou `#fbbf24` selon le contexte.

### Skip link

Premier élément focusable de la page, visuellement caché (`top: -100px`) jusqu'au focus. Pastille jaune (`#fbbf24` sur `#1a1a2e`, ratio 10.22:1) en haut-gauche au focus. Sa cible est l'accordéon descriptif en bas de page, avec ouverture programmatique du `<details>` et focus sur le summary à l'activation.

### Attributs ARIA

- `<svg role="img" aria-label="Carte mondiale des créances du Club de Paris pour l'année 2024" aria-describedby="map-instructions">` — mis à jour à chaque changement d'année.
- Paragraphe `.sr-only#map-instructions` lu par les lecteurs d'écran : explique `Tab`, flèches, `Entrée`, et renvoie vers le panneau descriptif.
- Région `aria-live="polite"` (`#sr-announce`) qui annonce `« {Pays} sélectionné »` aux lecteurs d'écran quand un pays est choisi.
- `<details>` natif pour l'accordéon (support clavier et ARIA inclus).
- Toggle mode rendu : `role="radiogroup"` + `role="radio"` avec `aria-checked`.
- Bouton fermeture panel : `aria-label` explicite.
- Panel pays : attribut `inert` quand fermé → retiré du tab order, pas de focus fantôme sur le bouton `×` invisible.

### Alternative textuelle — tableaux dans l'accordéon

Le PDF *Cartographie accessible* insiste : une carte interactive doit offrir **une alternative textuelle adjacente** (pas juste un téléchargement externe). L'accordéon `<details>` en bas de page contient, en plus des 4 liens CSV, **2 tableaux HTML** :

- **Pays créditeurs** — colonnes : pays, nb accords, statut, première participation, fiche pays
- **Pays débiteurs** — colonnes : pays, APD, non-APD, total, fiche pays

Régénérés automatiquement à chaque changement d'année. Un **champ de recherche** au-dessus filtre les lignes des deux tableaux en temps réel, insensible à la casse et aux accents (même logique que la recherche sur la carte). Si aucun résultat, une région `aria-live` annonce « aucun pays ne correspond ».

Les tableaux utilisent `<caption>`, `<th scope="col">` et `<th scope="row">` pour une sémantique correcte.

### Header contextuel

Au-dessus de la carte, une bande `<header>` avec :

- **Titre** (`<h1>`) : « Créances APD gérées par le Club de Paris — {année} », mis à jour dynamiquement au changement d'année.
- **Source** : `clubdeparis.org` (texte simple, pas de lien parasite dans le tab order).
- **Date de mise à jour**.

Satisfait les critères cartographiques classiques (titre, source, date) rappelés par le support [*Cartographie accessible*](https://beta.gouv.fr/).

### i18n FR/EN

Bascule automatique via `?lang=en` ou `html[lang]`. Toutes les chaînes a11y (instructions clavier, aria-labels, annonces, titres de tableaux, placeholders) sont traduites dans `TRANSLATIONS.fr` et `TRANSLATIONS.en`.

### Ce qui reste à améliorer (palier 2 potentiel)

- Zoom/pan de la carte non accessibles au clavier (mais le parcours des pays via flèches couvre l'essentiel du cas d'usage « trouver un pays »).
- Pas de mode sombre auto (mais bon contraste garanti en mode clair).
- Alternative tableau ne couvre que l'**année courante** — le dataset complet 2010-2024 reste accessible via le téléchargement CSV long format dans `sources/`.

### Tester l'accessibilité

```bash
python3 -m http.server 8000
# puis : Tab, Shift+Tab, flèches, Entrée, Espace
# simuler en N/B via extension browser (daltonisme)
# vérifier avec NVDA / VoiceOver que l'aria-live annonce bien les sélections
```

## Tester localement

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

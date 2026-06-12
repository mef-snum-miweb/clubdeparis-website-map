# map-creances-apd

Visualisation interactive des créances APD (Aide Publique au Développement) gérées par le Club de Paris, 2010-2024.

Carte du monde zoomable, slider temporel, bascule FR/EN, données par pays créditeur et débiteur.

## Structure

```
.
├── index.html          # Application (HTML + JS, un seul fichier, zéro build)
├── data.json           # Dataset consolidé, généré — ne pas éditer à la main
├── wb_countries.topojson  # Fond cartographique (TopoJSON), généré — voir plus bas
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
| `source_label` | `Afghanistan` | Nom tel qu'apparaissait dans le fichier source d'origine — sert au rapprochement manuel lors des mises à jour. Ignoré par le pipeline. |
| `apd_eur` | `111000000.00` | Aide publique au développement, en euros bruts |
| `napd_eur` | `957000000.00` | Non-APD, en euros bruts |

### `creditors.csv`
Informations sur les pays créditeurs membres du Club de Paris.

| Colonne | Exemple | Note |
|---|---|---|
| `year` | `2024` | |
| `iso` | `DEU` | Doit exister dans `countries.csv` |
| `source_label` | `ALLEMAGNE` | Nom tel qu'apparaissait dans le fichier source d'origine (MAJUSCULES, sans accents) — sert au rapprochement manuel. Ignoré par le pipeline. |
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

Ce sont des **snapshots de l'année la plus récente** du dataset (une ligne par pays), pensés pour une réutilisation rapide par des non-dev. Chaque fichier porte le nom du pays dans **la langue du fichier uniquement** (FR ou EN), et pointe vers la fiche pays `clubdeparis.org` dans la langue adéquate.

| Fichier | Langue | Contenu |
|---|---|---|
| `club_de_paris_pays_debiteurs.csv` | FR | Débiteurs, headers FR, URLs `clubdeparis.org/` |
| `club_de_paris_debtor_countries.csv` | EN | Débiteurs, headers EN, URLs `clubdeparis.org/en/` |
| `club_de_paris_pays_crediteurs.csv` | FR | Créditeurs, headers FR, URLs `clubdeparis.org/` |
| `club_de_paris_creditor_countries.csv` | EN | Créditeurs, headers EN, URLs `clubdeparis.org/en/` |

Colonnes :
- Débiteurs FR : `iso, pays, apd_usd, non_apd_usd, total_usd, type, fiche_pays`
- Débiteurs EN : `iso, country, oda_usd, non_oda_usd, total_usd, type, country_profile`
- Créditeurs FR : `iso, pays, nb_accords, statut, premiere_participation, fiche_pays`
- Créditeurs EN : `iso, country, nb_agreements, status, first_participation, country_profile`

Pour le dataset complet 2010-2024, consulter directement `sources/debtors.csv` et `sources/creditors.csv` (long format).

## Intégration dans une page tierce (Jahia, CMS…)

La carte est un Web Component autonome (`<club-paris-map>`, Shadow DOM) pensé pour être réinséré dans une autre page sans build. Tout ce qui peut devoir être adapté est **regroupé en tête de `index.html`**, dans une zone de configuration commentée. L'intégrateur ne touche normalement qu'à ce bloc.

### Les 3 blocs configurables (tête de `index.html`)

| Bloc | Rôle | À modifier si… |
|---|---|---|
| **(1)** `<script src>` D3 + topojson | Librairies JS (CDN par défaut) | …on veut servir les libs en local (réseau sans CDN) → remplacer les deux URLs par des chemins locaux (`lib/d3.v7.min.js`, etc.). |
| **(2)** `window.CLUB_PARIS_CONFIG` | Chemins des **2 JSON** + **4 CSV** | …les données ne sont pas dans le même dossier que la page hôte → renseigner `basePath` (voir ci-dessous). |
| **(3)** `<style>.club-paris-map-wrapper{…}</style>` | Habillage du conteneur | …on veut une hauteur autre que `100vh`, un autre fond, etc. |

```js
// Bloc (2) — valeurs par défaut
window.CLUB_PARIS_CONFIG = {
  basePath: '',                       // préfixe appliqué à TOUTES les ressources (garder le '/' final)
  data: { json: 'data.json', topojson: 'wb_countries.topojson' },
  csv:  {
    debtorsFr:   'downloads/club_de_paris_pays_debiteurs.csv',
    debtorsEn:   'downloads/club_de_paris_debtor_countries.csv',
    creditorsFr: 'downloads/club_de_paris_pays_crediteurs.csv',
    creditorsEn: 'downloads/club_de_paris_creditor_countries.csv',
  },
};
```

### Comprendre `basePath`

`basePath` est préfixé à chaque chemin de ressource. Les chemins relatifs sont résolus **par rapport au dossier de la page hôte** (pas la racine du domaine).

| `basePath` | Résultat pour `data.json` (page servie en `/maps/page.html`) | Quand l'utiliser |
|---|---|---|
| `''` (défaut) | `/maps/data.json` | Les 6 fichiers sont déposés **à côté de la page** (et `downloads/` juste en dessous). |
| `'/fileadmin/clubdeparis/'` | `/fileadmin/clubdeparis/data.json` | **Cas Jahia courant** : données dans un espace média séparé. Chemin absolu sur le même domaine, robuste quelle que soit l'URL de la page. |
| `'https://cdn.exemple/clubdeparis/'` | `https://cdn.exemple/clubdeparis/data.json` | Hébergement sur un **autre domaine** (FQDN). Penser au CORS, cf. ci-dessous. |

> En clair : `basePath: ''` suffit **si** l'intégrateur peut poser les fichiers dans le dossier de la page. Dès que les données vivent dans un espace média distinct (fréquent en Jahia), `basePath` devient le réglage attendu — ce n'est plus une simple sécurité.

### Mode opératoire

1. **Récupérer les ressources** : `index.html`, `data.json`, `wb_countries.topojson`, et les 4 CSV de `downloads/`.
2. **Déposer les fichiers** sur l'hébergement cible (même dossier que la page, ou espace média).
3. **Régler le bloc (2)** : ajuster `basePath` (ou mettre des URLs complètes par entrée en laissant `basePath: ''`).
4. **Copier dans la page hôte**, dans cet ordre :
   - les `<script src>` des libs — bloc (1) ;
   - le `<script>window.CLUB_PARIS_CONFIG = …</script>` — bloc (2) ;
   - le `<style>.club-paris-map-wrapper{…}</style>` — bloc (3) ;
   - le wrapper `<div class="club-paris-map-wrapper"><club-paris-map></club-paris-map></div>` ;
   - le gros `<script>` du composant (en bas de `index.html`).
5. **Ne PAS copier** le `<style>body{margin:0}</style>` : il est propre à la page de démo autonome (marqué comme tel dans le fichier). Jahia gère ses propres marges.

### Points de vigilance

- **CORS (JSON uniquement)** : `data.json` et `wb_countries.topojson` sont chargés via `fetch()`. Si `basePath` pointe vers un **domaine différent** de la page, le serveur de fichiers doit renvoyer l'en-tête `Access-Control-Allow-Origin`, sinon le navigateur bloque le chargement. Sur le même domaine (chemin relatif ou absolu) : aucun souci.
- **CSV cross-origin** : les 4 CSV sont de simples liens `<a download>`, non soumis au CORS. En revanche, l'attribut `download` peut être ignoré si le CSV est sur un autre domaine (il s'ouvrira dans l'onglet au lieu de se télécharger).
- **Isolation CSS** : aucune règle ne cible `<body>` ; tout le style est encapsulé sous `.club-paris-map-wrapper` et dans le Shadow DOM interne. Rien ne « fuit » dans la page hôte, et la page hôte ne peut pas casser la carte (Shadow DOM).
- **Langue** : le composant choisit FR/EN via l'attribut `<club-paris-map lang="en">`, le paramètre `?lang=en`, ou l'attribut `lang` du `<html>` hôte (dans cet ordre de priorité).

## Fond cartographique et conventions

### Frontières — World Bank Official Boundaries

La carte utilise les [frontières officielles de la Banque Mondiale](https://datacatalog.worldbank.org/search/dataset/0038272/World-Bank-Official-Boundaries).

Source utilisée : la version GeoJSON du dataset *Admin 0* (mise à jour septembre 2025). Le fichier brut (~172 Mo) est converti en TopoJSON simplifié hébergé localement (`wb_countries.topojson`, ~460 Ko) via `processing/build_topojson.py` :

```bash
npm install -g mapshaper          # dépendance externe (CLI)
python3 processing/build_topojson.py
```

Le script :
1. télécharge `World Bank Official Boundaries - Admin 0.geojson` dans `downloads/wb_admin0.geojson` (cache local) ;
2. télécharge Natural Earth 10m land (contour des masses terrestres, sans frontières politiques) dessiné en arrière-plan par le frontend pour donner une couleur "terre" aux zones que la World Bank ne reconnaît pas (Sahara occidental, Taïwan, îles Malouines, Antarctique, Abyei, etc.) ;
3. corrige le double-encodage UTF-8 que la World Bank a laissé sur ~7 noms (ex. *"TÃ¼rkiye"* → *"Türkiye"*, *"CÃ´te d'Ivoire"* → *"Côte d'Ivoire"*) et écrit `downloads/wb_admin0_fixed.geojson` ;
4. lance mapshaper avec deux entrées (countries WB + land NE) pour produire un topojson à deux couches :

```bash
mapshaper \
  -i downloads/wb_admin0_fixed.geojson name=countries \
  -filter-fields ISO_A3,WB_A3,NAM_0,WB_STATUS,SOVEREIGN \
  -sort 'WB_STATUS === "Member State" ? 0 : 1' \
  -dissolve2 ISO_A3 copy-fields=ISO_A3,WB_A3,NAM_0,WB_STATUS,SOVEREIGN \
  -simplify 1% keep-shapes \
  -i downloads/ne_10m_land.geojson name=land \
  -filter-fields featurecla \
  -simplify 1% keep-shapes \
  -o format=topojson combine-layers wb_countries.topojson
```

Le `-sort` priorise les features `Member State` avant les `Territory` partageant le même `ISO_A3`, sinon `dissolve2` aurait copié les attributs d'une enclave (Ceuta, Bonaire, Clipperton…) sur le polygone fusionné.

Le topojson final expose deux couches : `objects.countries` (244 features cliquables avec attributs WB) et `objects.land` (11 multipolygones du contour terrestre Natural Earth, dessiné en fond par le frontend, sans interaction).

Colonnes conservées (layer `countries`) :
- `NAM_0` : nom du pays/territoire en anglais. Pour les territoires/dépendances, le libellé inclut déjà la métropole entre parenthèses (*"Greenland (Den.)"*, *"Puerto Rico (U.S.)"*).
- `ISO_A3` / `WB_A3` : codes pays (Kosovo arrive directement avec `XKX`, plus besoin de remap).
- `WB_STATUS` (`Member State` / `Territory`) et `SOVEREIGN` : conservés pour usages futurs (filtrage, regroupement par métropole).

Les zones que le WB n'inclut pas (Sahara occidental, Taïwan, îles Malouines, Antarctique, frontière Abyei…) n'ont pas de polygone politique cliquable mais reçoivent la couleur "terre" via la couche `land` — la carte est ainsi visuellement complète sans prendre de position politique.

> Le GeoJSON ne contient pas de noms FR. La traduction française vient de `sources/countries.csv` (champ `name_fr`), maintenue manuellement et couvrant les 244 ISO du layer `countries`. Les libellés FR suivent la convention WB (forme longue + suffixe parenthétique traduit : "(Dan.)", "(R.-U.)", "(É.-U.)", "(P.-B.)", "(N.-Z.)", "(Aus.)", "(Fr.)", "(Nor.)", "(Fin.)", "(Esp.)").

### Liste des pays

`sources/countries.csv` couvre les 248 ISO du fond cartographique (un nom FR par polygone affiché). Parmi eux, ~181 ont au moins une ligne dans `creditors.csv` ou `debtors.csv` (pays APD) ; les autres sont des territoires/dépendances visuels uniquement.

**Sources** :
- [Banque Mondiale — Official Boundaries (Data Catalog)](https://datacatalog.worldbank.org/search/dataset/0038272/World-Bank-Official-Boundaries)
- [FMI — Liste des membres](https://www.imf.org/external/np/sec/memdir/memdate.htm)

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

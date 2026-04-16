#!/usr/bin/env python3
"""Build data.json + downloadable CSVs from the 4 CSV sources in /sources.

Usage: python3 processing/build_data.py [--check]
  --check: fail if any generated file differs from its on-disk version
"""
import argparse
import csv
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'sources'
OUT_JSON = ROOT / 'data.json'
DOWNLOADS = ROOT / 'downloads'

STATUS_FR = {None: 'Permanent', 'Ad hoc': 'Ad hoc', 'Prospectif': 'Prospectif'}
STATUS_EN = {None: 'Permanent', 'Ad hoc': 'Ad hoc', 'Prospectif': 'Prospective'}


def load_countries():
    rows = {}
    with (SRC / 'countries.csv').open(encoding='utf-8') as f:
        for r in csv.DictReader(f):
            rows[r['iso']] = {'name_fr': r['name_fr'], 'name_en': r['name_en']}
    return rows


def load_urls():
    by_iso_role = {}
    with (SRC / 'country_urls.csv').open(encoding='utf-8') as f:
        for r in csv.DictReader(f):
            by_iso_role[(r['iso'], r['role'])] = {
                'url_fr': r['url_fr'] or None,
                'url_en': r['url_en'] or None,
            }
    return by_iso_role


def load_debtors():
    rows = []
    with (SRC / 'debtors.csv').open(encoding='utf-8') as f:
        for r in csv.DictReader(f):
            rows.append({
                'year': r['year'],
                'iso': r['iso'],
                'apd': float(r['apd_usd']) if r['apd_usd'] else 0.0,
                'napd': float(r['napd_usd']) if r['napd_usd'] else 0.0,
                'type': r.get('type', 'accord'),
            })
    return rows


def load_creditors():
    rows = []
    with (SRC / 'creditors.csv').open(encoding='utf-8') as f:
        for r in csv.DictReader(f):
            rows.append({
                'year': r['year'],
                'iso': r['iso'],
                'nb_accords': int(r['nb_accords']) if r['nb_accords'] else 0,
                'statut': r['statut'] or None,
                'premiere': int(r['premiere_participation']) if r['premiere_participation'] else None,
            })
    return rows


def _clean(v):
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v


def build():
    countries = load_countries()
    urls = load_urls()
    debtors = load_debtors()
    creditors = load_creditors()

    years = {}
    for row in debtors + creditors:
        year = row['year']
        iso = row['iso']
        if iso not in countries:
            raise SystemExit(f'Unknown ISO in {year}: {iso} (missing from countries.csv)')
        years.setdefault(year, {}).setdefault(iso, {
            'country': countries[iso]['name_fr'],
        })

    for r in debtors:
        entry = years[r['year']][r['iso']]
        url = urls.get((r['iso'], 'debtor'), {}).get('url_fr')
        entry['debtor'] = {
            'apd': _clean(round(r['apd'], 2)),
            'napd': _clean(round(r['napd'], 2)),
            'total': _clean(round(r['apd'] + r['napd'], 2)),
            'type': r['type'],
            'url': url,
        }

    for r in creditors:
        entry = years[r['year']][r['iso']]
        url = urls.get((r['iso'], 'creditor'), {}).get('url_fr')
        entry['creditor'] = {
            'nbAccords': r['nb_accords'],
            'statut': r['statut'],
            'premiereParticipation': r['premiere'],
            'url': url,
        }

    final = {}
    for year in sorted(years):
        countries_year = years[year]
        tot_apd = tot_napd = tot = 0
        n_deb = n_cred = 0
        for entry in countries_year.values():
            if 'debtor' in entry:
                tot_apd += entry['debtor']['apd']
                tot_napd += entry['debtor']['napd']
                tot += entry['debtor']['total']
                n_deb += 1
            if 'creditor' in entry:
                n_cred += 1
        final[year] = {
            'countries': countries_year,
            'totals': {
                'debtorApd': _clean(round(tot_apd, 2)),
                'debtorNapd': _clean(round(tot_napd, 2)),
                'debtorTotal': _clean(round(tot, 2)),
                'debtorCount': n_deb,
                'creditorCount': n_cred,
            },
        }
    return final


def _render_csv(header, rows):
    buf = io.StringIO(newline='')
    w = csv.writer(buf, lineterminator='\n')
    w.writerow(header)
    for r in rows:
        w.writerow(r)
    return buf.getvalue()


def render_downloads():
    """Return {filename: csv_string} for the 4 downloadable files.

    Only the most recent year is exported (snapshot format, one row per country).
    """
    countries = load_countries()
    urls = load_urls()
    debtors = load_debtors()
    creditors = load_creditors()

    latest = max(r['year'] for r in debtors + creditors)
    debtors = sorted((r for r in debtors if r['year'] == latest), key=lambda r: r['iso'])
    creditors = sorted((r for r in creditors if r['year'] == latest), key=lambda r: r['iso'])

    def name(iso, lang):
        c = countries.get(iso, {})
        return c.get(f'name_{lang}', iso)

    def url(iso, role, lang):
        return urls.get((iso, role), {}).get(f'url_{lang}') or ''

    out = {}

    # Debtors FR
    rows = []
    for r in debtors:
        iso = r['iso']
        total = round(r['apd'] + r['napd'], 2)
        rows.append([
            iso, name(iso, 'fr'), name(iso, 'en'),
            f'{r["apd"]:.2f}', f'{r["napd"]:.2f}', f'{total:.2f}',
            r['type'],
            url(iso, 'debtor', 'fr'),
        ])
    out['club_de_paris_pays_debiteurs.csv'] = _render_csv(
        ['iso', 'pays_fr', 'pays_en',
         'apd_usd', 'non_apd_usd', 'total_usd', 'type', 'fiche_pays'],
        rows,
    )

    # Debtors EN
    rows = []
    for r in debtors:
        iso = r['iso']
        total = round(r['apd'] + r['napd'], 2)
        rows.append([
            iso, name(iso, 'en'), name(iso, 'fr'),
            f'{r["apd"]:.2f}', f'{r["napd"]:.2f}', f'{total:.2f}',
            r['type'],
            url(iso, 'debtor', 'en'),
        ])
    out['club_de_paris_debtor_countries.csv'] = _render_csv(
        ['iso', 'country_en', 'country_fr',
         'oda_usd', 'non_oda_usd', 'total_usd', 'type', 'country_profile'],
        rows,
    )

    # Creditors FR
    rows = []
    for r in creditors:
        iso = r['iso']
        rows.append([
            iso, name(iso, 'fr'), name(iso, 'en'),
            r['nb_accords'],
            STATUS_FR.get(r['statut'], r['statut'] or ''),
            r['premiere'] if r['premiere'] is not None else '',
            url(iso, 'creditor', 'fr'),
        ])
    out['club_de_paris_pays_crediteurs.csv'] = _render_csv(
        ['iso', 'pays_fr', 'pays_en',
         'nb_accords', 'statut', 'premiere_participation', 'fiche_pays'],
        rows,
    )

    # Creditors EN
    rows = []
    for r in creditors:
        iso = r['iso']
        rows.append([
            iso, name(iso, 'en'), name(iso, 'fr'),
            r['nb_accords'],
            STATUS_EN.get(r['statut'], r['statut'] or ''),
            r['premiere'] if r['premiere'] is not None else '',
            url(iso, 'creditor', 'en'),
        ])
    out['club_de_paris_creditor_countries.csv'] = _render_csv(
        ['iso', 'country_en', 'country_fr',
         'nb_agreements', 'status', 'first_participation', 'country_profile'],
        rows,
    )

    return out, latest


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true',
                   help='fail if generated files would change on disk')
    args = p.parse_args()

    final = build()
    json_payload = json.dumps(final, ensure_ascii=False, indent=2) + '\n'
    downloads, latest = render_downloads()

    planned = {OUT_JSON: json_payload}
    for fname, content in downloads.items():
        planned[DOWNLOADS / fname] = content

    if args.check:
        stale = []
        for path, expected in planned.items():
            if not path.exists() or path.read_text(encoding='utf-8') != expected:
                stale.append(path.relative_to(ROOT))
        if stale:
            print('error: the following generated files are out of date:', file=sys.stderr)
            for p_ in stale:
                print(f'  - {p_}', file=sys.stderr)
            print('run: python3 processing/build_data.py', file=sys.stderr)
            sys.exit(1)
        print('All generated files are up to date.')
        return

    DOWNLOADS.mkdir(exist_ok=True)
    for path, content in planned.items():
        path.write_text(content, encoding='utf-8')

    n_years = len(final)
    print(f'Wrote {OUT_JSON.relative_to(ROOT)} ({n_years} years)')
    for fname in downloads:
        size = len(downloads[fname].splitlines()) - 1
        print(f'Wrote downloads/{fname} ({size} rows, year {latest})')


if __name__ == '__main__':
    main()

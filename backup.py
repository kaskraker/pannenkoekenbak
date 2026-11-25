"""Backup van alle gegevens in Supabase (mensen, aanduidingen, berichten, hartjes, reacties, bezoeken) plus de foto's.

Gebruik:  python backup.py
Resultaat: een nieuwe map  backup/jjjj-mm-dd_uumm/  met per tabel een .json-bestand en een map fotos/.
De map 'backup' staat in .gitignore: er staan namen en foto's in, dus die horen niet op GitHub.
Alleen lezen: dit script verandert niets in de database.
"""
import json, os, re, sys, hashlib, urllib.request, urllib.error, urllib.parse
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
cfg = open(os.path.join(HERE, 'config.js'), encoding='utf-8').read()
URL = re.search(r'SUPABASE_URL:\s*"([^"]+)"', cfg).group(1).rstrip('/')
KEY = re.search(r'SUPABASE_ANON_KEY:\s*"([^"]+)"', cfg).group(1)
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY}
TABLES = ['people', 'done_streets', 'feed_posts', 'feed_likes', 'feed_comments', 'app_visits', 'app_events']

stamp = datetime.now().strftime('%Y-%m-%d_%H%M')
out = os.path.join(HERE, 'backup', stamp)
os.makedirs(os.path.join(out, 'fotos'), exist_ok=True)

def get(url, headers=None):
    req = urllib.request.Request(url, headers={**H, **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

report, data = {}, {}
for t in TABLES:
    rows, start = [], 0
    try:
        while True:
            body = get(f'{URL}/rest/v1/{t}?select=*', {'Range-Unit': 'items', 'Range': f'{start}-{start + 999}'})
            part = json.loads(body)
            rows += part
            if len(part) < 1000: break
            start += 1000
        data[t] = rows; report[t] = len(rows)
        with open(os.path.join(out, t + '.json'), 'w', encoding='utf-8') as f: json.dump(rows, f, ensure_ascii=False, indent=1)
    except urllib.error.HTTPError as e:
        report[t] = f'overgeslagen ({e.code})'

# foto's: profielfoto's en berichtfoto's die op de server staan
urls = set()
for p in data.get('people', []):
    u = p.get('photo_url')
    if u and u.startswith('http'): urls.add(u)
for p in data.get('feed_posts', []):
    u = p.get('photo_url')
    if not u: continue
    try:
        arr = json.loads(u) if u.startswith('[') else [u]
    except Exception:
        arr = [u]
    for x in arr:
        if isinstance(x, str) and x.startswith('http'): urls.add(x)
saved, failed, index = 0, 0, {}
for u in sorted(urls):
    ext = os.path.splitext(urllib.parse.urlparse(u).path)[1] or '.bin'
    name = hashlib.sha1(u.encode()).hexdigest()[:12] + ext
    try:
        with open(os.path.join(out, 'fotos', name), 'wb') as f: f.write(get(u))
        index[u] = name; saved += 1
    except Exception:
        failed += 1
with open(os.path.join(out, 'fotos', '_index.json'), 'w', encoding='utf-8') as f: json.dump(index, f, indent=1)

report['fotos_bewaard'] = saved; report['fotos_mislukt'] = failed
with open(os.path.join(out, '_overzicht.json'), 'w', encoding='utf-8') as f: json.dump({'gemaakt': stamp, **report}, f, indent=1)
print(out)
for k, v in report.items(): print(f'  {k}: {v}')

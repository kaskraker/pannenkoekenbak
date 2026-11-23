(() => {
const $ = id => document.getElementById(id);
const map = $('map'), feed = $('feed'), profile = $('profile'), q = window.PB_DEMO ? '?demo' + (location.search ? '&' + location.search.slice(1) : '') : location.search, hash = location.hash;
// De zwevende browserbalk van iOS Safari schuift over de onderkant: laat de tabbalk erboven staan (niet nodig als app op het beginscherm)
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (!standalone && matchMedia('(pointer:coarse)').matches) document.documentElement.style.setProperty('--lift', '70px');   // zwevende Safari-balk: pil erboven
function space() {                                                   // ruimte die de pagina's onderaan moeten vrijhouden
  const cs = getComputedStyle(document.documentElement), probe = document.createElement('div'); probe.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden'; document.body.appendChild(probe);
  const safe = probe.offsetHeight; probe.remove(); return Math.round(64 + 12 + safe + (parseFloat(cs.getPropertyValue('--lift')) || 0) + 8);
}
function sendSpace() { const n = space(); for (const f of [map, feed, profile]) try { f.contentWindow.postMessage({ space: n }, location.origin); } catch {} }
addEventListener('resize', sendSpace);
map.src = 'map.html' + q + hash;
feed.src = 'overzicht.html' + (q ? q + '&' : '?') + 'tab=feed';
profile.src = 'profiel.html' + q;
let tab = 'kaart', ready = { map: false, feed: false };
function show(t) {
  select(t);
  if (t === 'ik') profile.contentWindow.postMessage({ refresh: 1 }, location.origin);
  if (t === 'feed' || t === 'rang') feed.contentWindow.postMessage({ tab: t }, location.origin);
}
function select(t) {
  tab = t; document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.t === t)); $('tabs').style.setProperty('--i', ['kaart', 'feed', 'rang', 'ik'].indexOf(t));
  map.classList.toggle('on', t === 'kaart'); feed.classList.toggle('on', t === 'feed' || t === 'rang'); profile.classList.toggle('on', t === 'ik');
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
}
/* Nieuwste versie van de app ophalen: de browser houdt bestanden tot 10 minuten vast, dus eerst elk bestand vers ophalen en dan herladen */
const APP_FILES = ['index.html', 'demo.html', 'shell.js', 'shell.css', 'ptr.js', 'config.js', 'manifest.webmanifest', 'manifest-demo.webmanifest', 'map.html', 'overzicht.html', 'profiel.html', 'data/streets.json', map.getAttribute('src'), feed.getAttribute('src'), profile.getAttribute('src')];
async function updateApp() {
  if (!navigator.onLine) return false;
  try {
    const res = await Promise.all([...new Set(APP_FILES)].map(f => fetch(f.split('#')[0], { cache: 'reload' }).then(r => r.ok).catch(() => false)));
    if (!res.some(Boolean)) return false;
    try { sessionStorage.setItem('pb-tab', tab); } catch {}
    location.reload(); return true;
  } catch { return false; }
}
/* Bij het openen (en als je terugkomt in de app) kijken of er een nieuwere versie online staat; zo ja, automatisch bijwerken */
let lastCheck = 0;
async function checkVersion() {
  if (Date.now() - lastCheck < 30000 || !navigator.onLine) return; lastCheck = Date.now();
  try {
    const v = (await (await fetch('version.txt?' + Date.now(), { cache: 'no-store' })).text()).trim(); if (!/^[0-9]+$/.test(v)) return;
    const old = localStorage.getItem('pb-build'); localStorage.setItem('pb-build', v);
    if (old && old !== v) updateApp();
  } catch {}
}
addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });
checkVersion();
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return; const t = b.dataset.t;
  if (t === tab && t === 'kaart') map.contentWindow.postMessage({ go: 'home' }, location.origin);     // nog eens op Kaart tikken: terug naar het overzicht
  else if (t === tab && (t === 'feed' || t === 'rang')) feed.contentWindow.postMessage({ top: 1 }, location.origin);
  else if (t === tab && t === 'ik') profile.contentWindow.postMessage({ top: 1 }, location.origin);
  else show(t);
  if (navigator.vibrate) navigator.vibrate(8);
});
addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data) return; const m = e.data;
  if (m.ready) { sendSpace(); return; }
  if (m.update) { updateApp().then(ok => { if (!ok) for (const f of [feed, profile]) try { f.contentWindow.postMessage({ updateDone: 1 }, location.origin); } catch {} }); return; }
  if ('lb' in m) { $('tabs').classList.toggle('away', !!m.lb); return; }                 // grote foto open: tabbalk even weg
  if (m.go) { select('kaart'); map.contentWindow.postMessage(m, location.origin); }        // een straat of persoon in de feed aangetikt: toon hem op de kaart
});
select('kaart'); sendSpace();
try { const pt = sessionStorage.getItem('pb-tab'); if (pt && pt !== 'kaart') { sessionStorage.removeItem('pb-tab'); setTimeout(() => show(pt), 300); } } catch {}
})();

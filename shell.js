(() => {
const $ = id => document.getElementById(id);
const map = $('map'), feed = $('feed'), profile = $('profile'), q = window.PB_DEMO ? '?demo' + (location.search ? '&' + location.search.slice(1) : '') : location.search, hash = location.hash;
// Safari zet de pagina al boven zijn eigen balk (de viewport eindigt erboven), dus de tabbalk hoeft niet extra omhoog.
// Mocht een toestel de pagina toch onder de balk laten lopen: test met ?lift=70 achter het adres.
const lift = parseInt(new URLSearchParams(location.search).get('lift'), 10);
if (lift > 0) document.documentElement.style.setProperty('--lift', lift + 'px');
function space() {                                                   // ruimte die de pagina's onderaan moeten vrijhouden
  const cs = getComputedStyle(document.documentElement), probe = document.createElement('div'); probe.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden'; document.body.appendChild(probe);
  const safe = probe.offsetHeight; probe.remove(); return Math.round(64 + 12 + safe + (parseFloat(cs.getPropertyValue('--lift')) || 0) + 8);
}
function sendSpace() { const n = space(); for (const f of [map, feed, profile]) try { f.contentWindow.postMessage({ space: n }, location.origin); } catch {} }
addEventListener('resize', sendSpace);
/* de pagina's krijgen het versienummer mee, zodat de browser nooit een oude kopie van map.html e.d. uit zijn geheugen toont */
const vq = v => v ? (q ? '&' : '?') + 'v=' + v : '';
const startFrames = v => { map.src = 'map.html' + q + vq(v) + hash; feed.src = 'overzicht.html' + (q ? q + '&' : '?') + (v ? 'v=' + v + '&' : '') + 'tab=feed'; profile.src = 'profiel.html' + q + vq(v); };
Promise.race([fetch('version.txt?' + Date.now(), { cache: 'no-store' }).then(r => r.text()).then(t => t.trim()), new Promise(r => setTimeout(() => r(''), 1500))]).catch(() => '').then(v => startFrames(/^[0-9]+$/.test(v) ? v : ''));
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
const APP_FILES = ['index.html', 'demo.html', 'shell.js', 'shell.css', 'ptr.js', 'config.js', 'avatars.js', 'manifest.webmanifest', 'manifest-demo.webmanifest', 'map.html', 'overzicht.html', 'profiel.html', 'data/streets.json', 'data/map.json'];
async function updateApp(v) {
  if (!navigator.onLine) return false;
  try {
    const res = await Promise.all([...new Set([...APP_FILES, map.getAttribute('src'), feed.getAttribute('src'), profile.getAttribute('src')].filter(Boolean))].map(f => fetch(f.split('#')[0], { cache: 'reload' }).then(r => r.ok).catch(() => false)));
    if (!res.some(Boolean)) return false;
    try { sessionStorage.setItem('pb-tab', tab); if (v) localStorage.setItem('pb-build', v); } catch {}
    location.reload(); return true;
  } catch { return false; }
}
/* Bij het openen (en als je terugkomt in de app) kijken of er een nieuwere versie online staat; zo ja, automatisch bijwerken */
let lastCheck = 0;
async function checkVersion(force) {                // één klein bestandje controleren; enkel bij een nieuwe versie alles ophalen en herladen
  if ((!force && Date.now() - lastCheck < 30000) || !navigator.onLine) return false; lastCheck = Date.now();
  try {
    const v = (await (await fetch('version.txt?' + Date.now(), { cache: 'no-store' })).text()).trim(); if (!/^[0-9]+$/.test(v)) return false;
    const old = localStorage.getItem('pb-build');
    if (old && old !== v) return await updateApp(v);
    localStorage.setItem('pb-build', v);
  } catch {}
  return false;
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

/* ---------- rondleiding: toont de echte tabbalk en schakelt zelf tussen de schermen ---------- */
const TOUR = [
  { tab: 'kaart', t: 'De kaart', x: 'Elke straat van Ingelmunster staat hier. Grijs is nog niet gedaan. Een kleur is de persoon die de straat deed.' },
  { tab: 'kaart', target: 'kaart', t: 'Straat aanduiden', x: 'Tik op een straat en kies wie hier langs is geweest. Jij staat al aangeduid. Tik daarna op de knop onderaan.' },
  { tab: 'feed', target: 'feed', t: 'Feed', x: 'Berichten en foto’s van iedereen. Tik op + om zelf iets te delen. Met @ tag je een persoon of een straat.' },
  { tab: 'rang', target: 'rang', t: 'Ranglijst', x: 'Wie deed de meeste kilometers of straten? Tik op een naam voor het profiel.' },
  { tab: 'ik', target: 'ik', t: 'Ik', x: 'Je eigen profiel: foto, functie en je straten. Hier staat ook “Hoe werkt het?” als je de rondleiding nog eens wil zien.' },
  { tab: 'kaart', t: 'Klaar', x: 'Veel plezier met de pannenkoekenverkoop!' },
];
let tourEl = null, tourI = 0;
function tourClose(done) {
  if (!tourEl) return; const el = tourEl; tourEl = null; el.classList.remove('on'); setTimeout(() => el.remove(), 320);
  try { localStorage.setItem('pb-toured', '1'); } catch {}
  if (done) show('kaart');
}
function tourDraw() {
  if (!tourEl) return; const st = TOUR[tourI], last = tourI === TOUR.length - 1, spot = tourEl.querySelector('.tspot'), card = tourEl.querySelector('.tcard');
  show(st.tab);
  const btn = st.target && document.querySelector(`.tab[data-t="${st.target}"]`), tabs = $('tabs').getBoundingClientRect();
  if (btn) { const r = btn.getBoundingClientRect(); Object.assign(spot.style, { left: r.left - 2 + 'px', top: r.top - 2 + 'px', width: r.width + 4 + 'px', height: r.height + 4 + 'px', borderRadius: '30px' }); }
  else Object.assign(spot.style, { left: innerWidth / 2 + 'px', top: innerHeight * .4 + 'px', width: '0px', height: '0px', borderRadius: '30px' });
  card.style.bottom = (innerHeight - tabs.top + 14) + 'px';
  card.innerHTML = `<div class="tdots">${TOUR.map((_, i) => `<i class="${i === tourI ? 'on' : ''}"></i>`).join('')}</div><h2>${st.t}</h2><p>${st.x}</p>
    <div class="tbtns"><button class="tb main" data-n="next">${last ? 'Aan de slag' : 'Volgende'}</button>${last ? '' : '<button class="tb" data-n="skip">Overslaan</button>'}</div>`;
  card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
}
function startTour() {
  if (tourEl) return; tourI = 0;
  tourEl = document.createElement('div'); tourEl.className = 'tour'; tourEl.innerHTML = '<div class="tspot"></div><div class="tcard" role="dialog" aria-live="polite"></div>';
  document.body.appendChild(tourEl);
  tourEl.addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; if (b.dataset.n === 'skip') return tourClose(false); if (tourI >= TOUR.length - 1) return tourClose(true); tourI++; tourDraw(); });
  requestAnimationFrame(() => { tourEl.classList.add('on'); tourDraw(); });
}

/* app installeren: Android/Chrome toont het systeemvenster; iPhone kent dat niet, daar tonen we de twee stappen */
let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
function installHelp() {
  if (tourEl) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const x = ios ? 'Tik onderaan in Safari op Deel, het vierkantje met een pijl omhoog. Scrol dan naar beneden en kies “Zet op beginscherm”.' : 'Open het menu van je browser, de drie puntjes, en kies “App installeren” of “Toevoegen aan startscherm”.';
  tourEl = document.createElement('div'); tourEl.className = 'tour'; tourEl.innerHTML = `<div class="tspot" style="left:50%;top:40%;width:0;height:0"></div><div class="tcard" role="dialog"><h2>Zet de app op je beginscherm</h2><p>${x}</p><div class="tbtns"><button class="tb main" data-n="skip">Oké</button></div></div>`;
  document.body.appendChild(tourEl); tourEl.querySelector('.tcard').style.bottom = (innerHeight - $('tabs').getBoundingClientRect().top + 14) + 'px';
  tourEl.addEventListener('click', e => { if (e.target.closest('[data-n]') || e.target === tourEl) tourClose(false); });
  requestAnimationFrame(() => tourEl.classList.add('on'));
}
addEventListener('resize', () => { if (tourEl) tourDraw(); });
addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data) return; const m = e.data;
  if (m.ready) { sendSpace(); return; }
  if (m.tour) { startTour(); return; }
  if (m.install) { if (deferredInstall) { const d = deferredInstall; deferredInstall = null; d.prompt(); } else installHelp(); return; }
  if (m.update) { checkVersion(true).then(ok => { if (!ok) for (const f of [feed, profile]) try { f.contentWindow.postMessage({ updateDone: 1 }, location.origin); } catch {} }); return; }
  if ('lb' in m) { $('tabs').classList.toggle('away', !!m.lb); return; }                 // grote foto open: tabbalk even weg
  if (m.go) { select('kaart'); map.contentWindow.postMessage(m, location.origin); }        // een straat of persoon in de feed aangetikt: toon hem op de kaart
});
select('kaart'); sendSpace();
try { const pt = sessionStorage.getItem('pb-tab'); if (pt && pt !== 'kaart') { sessionStorage.removeItem('pb-tab'); setTimeout(() => show(pt), 300); } } catch {}
})();

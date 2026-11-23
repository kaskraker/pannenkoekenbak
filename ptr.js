/* Trek-om-te-verversen voor pagina's die gewoon scrollen (feed, ranglijst, profiel).
   De pagina geeft zelf door wat er ververst moet worden: window.__refresh = async () => { ... } */
(() => {
  const TH = 72, MAX = 130, HOLD = 58;
  const css = document.createElement('style');
  css.textContent = `.ptr{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));z-index:60;width:40px;height:40px;margin-left:-20px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#272727;
    background:rgba(252,250,247,.86);-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.6),inset 0 1px 1px rgba(255,255,255,.9),0 0 0 .5px rgba(39,39,39,.1),0 6px 18px rgba(39,39,39,.18);opacity:0;pointer-events:none;transform:translateY(-60px)}
    .ptr svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
    .ptr.ready svg{transform:rotate(180deg)}
    .ptr.spin svg{animation:ptrspin .8s linear infinite;transition:none}
    @keyframes ptrspin{to{transform:rotate(360deg)}}
    .ptr-shift{transition:transform .5s cubic-bezier(.2,.8,.2,1)}`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.className = 'ptr'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>'; document.body.appendChild(el);
  /* vraagt de app-schil om de nieuwste versie op te halen en te herladen; geeft false als dat niet lukte (offline) */
  window.__updateApp = () => window.top === window.self ? Promise.resolve(false) : new Promise(res => {
    const h = e => { if (e.origin === location.origin && e.data && e.data.updateDone) { removeEventListener('message', h); res(false); } };
    addEventListener('message', h); parent.postMessage({ update: 1 }, location.origin); setTimeout(() => { removeEventListener('message', h); res(false); }, 20000);
  });
  const target = () => document.querySelector('.wrap');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let y0 = null, x0 = 0, pull = 0, active = false, busy = false;
  const blocked = () => document.querySelector('dialog[open], #lb.on') || document.activeElement?.matches?.('textarea,input,select');
  function place(p, smooth) {
    pull = p; const w = target();
    el.style.transition = smooth ? 'transform .5s cubic-bezier(.2,.8,.2,1), opacity .3s' : 'none';
    el.style.transform = `translateY(${p - 60 + 14}px)`; el.style.opacity = Math.min(1, p / 36);
    if (w) { w.classList.toggle('ptr-shift', !!smooth); w.style.transform = p ? `translateY(${p * .5}px)` : ''; }
    el.classList.toggle('ready', p >= TH && !busy);
  }
  function release() {
    place(0, true); setTimeout(() => { const w = target(); if (w) { w.classList.remove('ptr-shift'); w.style.transform = ''; } }, 520);
  }
  async function refresh() {
    busy = true; el.classList.remove('ready'); el.classList.add('spin'); place(HOLD, true);
    if (navigator.vibrate) navigator.vibrate(8);
    try { await Promise.all([window.__refresh ? window.__refresh() : Promise.resolve(), new Promise(r => setTimeout(r, 700))]); } catch {}
    el.classList.remove('spin'); busy = false; release();
  }
  addEventListener('touchstart', e => {
    if (busy || e.touches.length !== 1 || scrollY > 0 || blocked()) { y0 = null; return; }
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; active = false;
  }, { passive: true });
  addEventListener('touchmove', e => {
    if (y0 === null || busy) return;
    const dy = e.touches[0].clientY - y0, dx = Math.abs(e.touches[0].clientX - x0);
    if (!active && (dy < 8 || dx > dy)) return;                       // pas starten bij een duidelijke neerwaartse trek
    if (scrollY > 0) { y0 = null; if (active) { active = false; release(); } return; }
    active = true; if (e.cancelable) e.preventDefault();
    place(Math.min(MAX, (dy - 8) * .55), false);
  }, { passive: false });
  const end = () => {
    if (y0 === null && !active) return; y0 = null; if (!active) return; active = false;
    if (pull >= TH && !reduce()) refresh(); else if (pull >= TH) { busy = true; Promise.resolve(window.__refresh && window.__refresh()).finally(() => { busy = false; release(); }); } else release();
  };
  addEventListener('touchend', end, { passive: true }); addEventListener('touchcancel', end, { passive: true });
})();

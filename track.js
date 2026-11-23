/* Anoniem tellen wat er in de app gebeurt: een willekeurig toestelnummer, geen namen. Stil als de tabel er niet is, en niet in de demo. */
(() => {
  const cfg = window.PANNENKOEK_CONFIG || {};
  if (!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) || location.search.includes('demo') || window.PB_DEMO || /demo\.html/.test(location.pathname)) { window.PB_TRACK = () => {}; return; }
  let last = '', lastT = 0;
  window.PB_TRACK = (ev, extra) => {
    try {
      const key = ev + '|' + (extra || ''), now = Date.now(); if (key === last && now - lastT < 2500) return; last = key; lastT = now;
      let dv = localStorage.getItem('pb-device'); if (!dv) { dv = (crypto.randomUUID ? crypto.randomUUID() : 'd' + now + Math.random().toString(36).slice(2)); localStorage.setItem('pb-device', dv); }
      fetch(cfg.SUPABASE_URL + '/rest/v1/app_events', { method: 'POST', keepalive: true, headers: { apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ device: dv, ev, extra: extra || null }) }).catch(() => {});
    } catch {}
  };
})();

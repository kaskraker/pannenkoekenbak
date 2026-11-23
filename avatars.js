/* Illustratie voor mensen zonder profielfoto: een vaste, vrolijke tekening (per persoon altijd dezelfde), geen letters. */
(() => {
  const C = { cream: '#FFF3DC', gold: '#E3A24B', gold2: '#D08F42', brown: '#9A4A12', butter: '#FFE08A', red: '#D6324A', green: '#4E9A4C', blue: '#4C6FD0', yellow: '#F6C945', ink: '#3b3833', white: '#FFFFFF', pan: '#4a4742' };
  const ILL = [
    /* pannenkoekenstapel */ `<ellipse cx="32" cy="46" rx="20" ry="7" fill="${C.gold2}"/><rect x="12" y="38" width="40" height="8" fill="${C.gold2}"/><ellipse cx="32" cy="38" rx="20" ry="7" fill="${C.gold}"/><rect x="12" y="30" width="40" height="8" fill="${C.gold2}"/><ellipse cx="32" cy="30" rx="20" ry="7" fill="${C.gold}"/><rect x="26" y="22" width="12" height="7" rx="2" fill="${C.butter}"/>`,
    /* aardbei */ `<path d="M32 52C20 44 14 34 18 26c3-5 9-5 14-2 5-3 11-3 14 2 4 8-2 18-14 26z" fill="${C.red}"/><path d="M24 22l8-6 8 6-8 3z" fill="${C.green}"/><circle cx="26" cy="32" r="1.5" fill="${C.cream}"/><circle cx="34" cy="30" r="1.5" fill="${C.cream}"/><circle cx="38" cy="38" r="1.5" fill="${C.cream}"/><circle cx="29" cy="40" r="1.5" fill="${C.cream}"/>`,
    /* spiegelei */ `<path d="M14 34c-2-10 8-18 18-16 10-3 20 4 18 14 2 8-6 16-16 14-8 4-22-2-20-12z" fill="${C.white}"/><circle cx="31" cy="33" r="9" fill="${C.yellow}"/><circle cx="28" cy="30" r="2.5" fill="#FFF3B8"/>`,
    /* koekenpan met pannenkoek */ `<circle cx="28" cy="34" r="17" fill="${C.pan}"/><circle cx="28" cy="34" r="13" fill="${C.gold}"/><circle cx="24" cy="30" r="3" fill="${C.gold2}"/><circle cx="32" cy="38" r="2.5" fill="${C.gold2}"/><rect x="43" y="31" width="16" height="6" rx="3" fill="${C.pan}"/>`,
    /* garde */ `<path d="M32 10v18" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M32 28c-14 0-14 26 0 26s14-26 0-26z" fill="none" stroke="${C.gold2}" stroke-width="3"/><path d="M32 28c-6 0-6 26 0 26" fill="none" stroke="${C.gold2}" stroke-width="3"/><path d="M32 28c6 0 6 26 0 26" fill="none" stroke="${C.gold2}" stroke-width="3"/>`,
    /* stroopfles */ `<rect x="22" y="26" width="20" height="28" rx="6" fill="${C.brown}"/><rect x="27" y="14" width="10" height="14" rx="3" fill="${C.gold2}"/><rect x="24" y="36" width="16" height="10" rx="2" fill="${C.cream}"/><path d="M27 14l2-5h6l2 5z" fill="${C.gold}"/>`,
    /* banaan */ `<path d="M14 22c2 18 16 30 36 28-6 4-22 6-32-6-6-8-8-16-4-22z" fill="${C.yellow}"/><path d="M14 22c-2 2-2-2 0-4l4 2z" fill="${C.brown}"/><path d="M50 50c2 0 3-1 2-3z" fill="${C.brown}"/>`,
    /* blauwe bessen */ `<circle cx="24" cy="38" r="11" fill="${C.blue}"/><circle cx="42" cy="34" r="11" fill="#3F5DB8"/><circle cx="33" cy="22" r="9" fill="#5878E0"/><path d="M24 33l-2-3h4zM42 29l-2-3h4zM33 18l-2-3h4z" fill="#1F2F66"/>`,
    /* spatel */ `<rect x="29" y="30" width="6" height="26" rx="3" fill="${C.ink}"/><path d="M20 12h24v22H20z" fill="${C.gold2}" rx="3"/><rect x="20" y="12" width="24" height="22" rx="4" fill="${C.gold2}"/><path d="M26 16v14M32 16v14M38 16v14" stroke="${C.gold}" stroke-width="2.5" stroke-linecap="round"/>`,
  ];
  const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  window.PB_ILL = p => `<svg class="ill" viewBox="0 0 64 64" aria-hidden="true">${ILL[hash(p.id || p.name) % ILL.length]}</svg>`;
  const st = document.createElement('style');
  st.textContent = '.av:has(.ill){background:#F4EFE6!important}.av .ill{display:block;width:100%;height:100%}.ill{pointer-events:none}';
  document.head.appendChild(st);

  /* functie bij je foto: zes manieren (kiezen kan met ?functiekeuze), alles stil, zonder beweging */
  const RS = `
  .rolebox{position:absolute;white-space:nowrap;pointer-events:none;z-index:3;font-family:inherit}
  .rolebox .rl{display:none}
  [data-rs=bel] .rolebox .rs{display:none}[data-rs=bel] .rolebox .rl{display:inline}
  [data-rs=bel] .rolebox{left:76%;bottom:92%;padding:8px 13px;border-radius:18px 18px 18px 5px;background:#fff;color:#272727;font:700 14px/1.2 inherit;box-shadow:0 0 0 .5px rgba(39,39,39,.1),0 6px 16px rgba(39,39,39,.16)}
  [data-rs=bel] .rolebox::after{content:"";position:absolute;left:12px;bottom:-8px;width:12px;height:9px;background:#fff;clip-path:polygon(0 0,100% 0,0 100%)}
  [data-rs=pil] .rolebox{left:50%;bottom:-13px;transform:translateX(-50%);padding:6px 14px;border-radius:99px;background:#272727;color:#fff;font:800 11.5px/1.2 inherit;letter-spacing:.07em;text-transform:uppercase;box-shadow:0 0 0 3px #FAF8F4}
  [data-rs=sticker] .rolebox{right:-26px;bottom:4px;transform:rotate(-6deg);padding:6px 12px;border-radius:7px;background:#FFD84A;color:#272727;font:800 13px/1.2 inherit;box-shadow:0 2px 0 rgba(39,39,39,.25),0 4px 10px rgba(39,39,39,.18)}
  [data-rs=pilr] .rolebox{right:-34px;bottom:6px;padding:6px 13px 6px 24px;border-radius:99px;background:#fff;color:#272727;font:700 13px/1.2 inherit;box-shadow:0 0 0 .5px rgba(39,39,39,.1),0 4px 12px rgba(39,39,39,.16)}
  [data-rs=pilr] .rolebox::before{content:"";position:absolute;left:10px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--c,#272727)}
  [data-rs=tekst] .rolebox,[data-rs=chip] .rolebox{display:none}
  [data-rs=pil] .rolebit,[data-rs=bel] .rolebit,[data-rs=sticker] .rolebit,[data-rs=pilr] .rolebit{display:none}
  [data-rs=tekst] .rolebit{font-size:16px;font-weight:600;color:var(--donker,#272727);margin-top:-8px}
  [data-rs=chip] .rolebit{display:inline-block;padding:5px 14px;border-radius:99px;background:color-mix(in srgb,var(--c,#272727) 14%,transparent);color:var(--c,#272727);font-weight:700;font-size:14px;margin-top:-4px}
  `;
  const rsEl = document.createElement('style'); rsEl.textContent = RS; document.head.appendChild(rsEl);
  const setRS = v => { document.documentElement.dataset.rs = v; };
  try { setRS(localStorage.getItem('pb-rolestyle') || 'pil'); } catch { setRS('pil'); }
  addEventListener('storage', e => { if (e.key === 'pb-rolestyle') setRS(e.newValue || 'pil'); });
  window.PB_SETRS = v => { try { localStorage.setItem('pb-rolestyle', v); } catch {} setRS(v); };
  window.PB_ROLEBOX = (role, color) => role ? `<div class="rolebox" style="--c:${color}"><span class="rl">Ik ben een ${role.toLowerCase().replace(/[<>&"]/g, '')}!</span><span class="rs">${role.replace(/[<>&"]/g, '')}</span></div>` : '';
})();

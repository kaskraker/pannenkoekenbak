/* Illustratie voor mensen zonder profielfoto: een vaste, vrolijke tekening (per persoon altijd dezelfde), geen letters. */
(() => {
  const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  /* getekende koppen (willekeurig maar vast per persoon): huid, haar, kapsel, kleding, achtergrond en soms een bril */
  const SK = ['#F2C7A5', '#E9B48F', '#D99B73', '#C98B63', '#B97A52', '#F7D3B8'], HC = ['#3b2a20', '#C9822E', '#1f1a17', '#6b3b25', '#d9b36a', '#8a5a2b', '#a8501f', '#2a2420'];
  const BG = ['#F1D6C9', '#D5E4EC', '#F3E3B8', '#EBD5DC', '#DDE3C4', '#DCE6F0', '#EAD9C4', '#F6DCCB'], SH = ['#272727', '#005980', '#2F6F5E', '#C94F7C', '#7E8F3A', '#3E8DB0', '#8A5A2B', '#E36A4F', '#1F3A5F', '#E3B23C'], STY = ['short', 'long', 'bun', 'curly', 'side', 'beard'];
  /* mensen zonder foto: een vrolijke getekende figuur (Avataaars, DiceBear; enkel lichte huidtinten), per persoon altijd dezelfde */
  const N_AV = 48;
  window.PB_ILL = p => `<img class="ill" src="assets/avatars/a${String(1 + hash(p.id || p.name) % N_AV).padStart(2, '0')}.svg" alt="" draggable="false">`;
  const st = document.createElement('style');
  st.textContent = '.av:has(.ill){background:#F4EFE6!important;overflow:hidden!important;border-radius:50%!important;display:flex!important;align-items:center;justify-content:center}.av .ill{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}.ill{pointer-events:none}';
  document.head.appendChild(st);

  /* functie bij je foto: zes manieren (kiezen kan met ?functiekeuze), alles stil, zonder beweging */
  const RS = `
  .rolebox{position:absolute;white-space:nowrap;pointer-events:none;z-index:3;font-family:inherit}
  .rolebox .rl{display:none}
  [data-rs=bel] .rolebox .rs{display:none}[data-rs=bel] .rolebox .rl{display:inline}
  [data-rs=bel] .rolebox{left:50%;bottom:calc(100% + 7px);transform:translateX(-50%);opacity:0;transform-origin:50% 100%;padding:8px 14px;border-radius:18px;background:var(--c,#272727);color:var(--t,#fff);font:700 14px/1.2 inherit;white-space:nowrap}
  [data-rs=bel] .rolebox::after{content:"";position:absolute;left:50%;margin-left:-7px;bottom:-7px;width:14px;height:8px;background:var(--c,#272727);clip-path:polygon(0 0,100% 0,50% 100%)}
  [data-rs=pil] .rolebox{left:50%;bottom:-13px;transform:translateX(-50%);padding:6px 14px;border-radius:99px;background:#272727;color:#fff;font:800 11.5px/1.2 inherit;letter-spacing:.07em;text-transform:uppercase;box-shadow:0 0 0 3px #FAF8F4}
  [data-rs=sticker] .rolebox{right:-26px;bottom:4px;transform:rotate(-6deg);padding:6px 12px;border-radius:7px;background:#FFD84A;color:#272727;font:800 13px/1.2 inherit;box-shadow:0 2px 0 rgba(39,39,39,.25),0 4px 10px rgba(39,39,39,.18)}
  [data-rs=pilr] .rolebox{right:-34px;bottom:6px;padding:6px 13px 6px 24px;border-radius:99px;background:#fff;color:#272727;font:700 13px/1.2 inherit;box-shadow:0 0 0 .5px rgba(39,39,39,.1),0 4px 12px rgba(39,39,39,.16)}
  [data-rs=pilr] .rolebox::before{content:"";position:absolute;left:10px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--c,#272727)}
  [data-rs=tekst] .rolebox,[data-rs=chip] .rolebox{display:none}
  @keyframes rolein{0%{opacity:0;transform:translateX(-50%) translateY(10px) scale(.3)}55%{opacity:1;transform:translateX(-50%) translateY(-2px) scale(1.12)}78%{transform:translateX(-50%) scale(.96)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
  @keyframes roleout{from{opacity:1;transform:translateX(-50%) scale(1)}to{opacity:0;transform:translateX(-50%) translateY(6px) scale(.6)}}
  .rolebox.on{animation:rolein .6s cubic-bezier(.2,.8,.2,1) forwards}
  .rolebox.off{animation:roleout .35s ease-in forwards}
  @media(prefers-reduced-motion:reduce){.rolebox.on{animation:none;opacity:1}.rolebox.off{animation:none;opacity:0}}
  [data-rs=pil] .rolebit,[data-rs=bel] .rolebit,[data-rs=sticker] .rolebit,[data-rs=pilr] .rolebit{display:none}
  [data-rs=tekst] .rolebit{font-size:16px;font-weight:600;color:var(--donker,#272727);margin-top:-8px}
  [data-rs=chip] .rolebit{display:inline-block;padding:5px 14px;border-radius:99px;background:color-mix(in srgb,var(--c,#272727) 14%,transparent);color:var(--c,#272727);font-weight:700;font-size:14px;margin-top:-4px}
  `;
  const rsEl = document.createElement('style'); rsEl.textContent = RS; document.head.appendChild(rsEl);
  const setRS = v => { document.documentElement.dataset.rs = v; };
  setRS('bel');                                   // gekozen: ballon boven de foto, in de kleur van de persoon
    window.PB_SETRS = v => { try { localStorage.setItem('pb-rolestyle', v); } catch {} setRS(v); };
  /* de functie verschijnt op het juiste moment (profiel openen, paneel omhoog, op de foto tikken), springt even uit en verdwijnt weer */
  window.PB_ROLEPOP = (root, delay = 450, stay = 4800) => {
    const b = (root || document).querySelector('.rolebox'); if (!b) return;
    (b._t || []).forEach(clearTimeout); b.classList.remove('on', 'off'); void b.offsetWidth;
    b._t = [setTimeout(() => b.classList.add('on'), delay), setTimeout(() => { b.classList.remove('on'); b.classList.add('off'); }, delay + stay)];
  };
  const textOn = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#fff'; const n = parseInt(m[1], 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#272727' : '#fff'; };
  window.PB_ROLEBOX = (role, color) => role ? `<div class="rolebox" style="--c:${color};--t:${textOn(color)}"><span class="rl">Ik ben een ${role.toLowerCase().replace(/[<>&"]/g, '')}!</span><span class="rs">${role.replace(/[<>&"]/g, '')}</span></div>` : '';
})();

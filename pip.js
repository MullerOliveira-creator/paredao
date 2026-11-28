/* Paredão Player — pop-up de verdade (Document Picture-in-Picture)
   Chrome/Edge 116+ no Windows/Mac/Linux: a janelinha fica por cima de outras abas e de outros programas.
   A janelinha mostra o estilo escolhido em Configurações → Modo palco, com os botões embaixo.
   A barra escura em cima (com o endereço do site) é do próprio Chrome e não pode ser tirada.
   Onde não existe (Safari/iPhone, TV Samsung, Echo Show), o modo pop-up continua sendo o holograma dentro da página. */
(function () {
  const DPIP = window.documentPictureInPicture;
  const pmode = () => { try { return localStorage.getItem("pd_pipmode") || "v"; } catch (e) { return "v"; } };
  window.PIPMODE = pmode;
  const PIP = window.PIP = { win: null, ok: !!DPIP };
  const _sv = setView;
  let home = null, nextN = null, mo = null;
  // enquanto o mini player está na janelinha, quem atualiza é ela (upd)
  const _stgU = stgU; stgU = function () { if (stg.classList.contains("inpip")) return; return _stgU(); };

  const css = document.createElement("style");
  css.textContent = `body.pipon #stage.p .fk{display:none}body.pipon #stage.p #pop{display:none!important}
#pipnote{display:none}body.pipon #stage.p #pipnote{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:40vh;text-align:center;opacity:.8;padding:20px}
#pipnote button{font:inherit;padding:8px 16px;border-radius:99px;border:1px solid color-mix(in srgb,var(--a) 60%,transparent);background:color-mix(in srgb,var(--a) 14%,transparent);color:inherit;cursor:pointer}`;
  document.head.appendChild(css);
  const note = document.createElement("div");
  note.id = "pipnote";
  note.innerHTML = `<b>O player está na janelinha flutuante</b><span>Ela fica por cima das outras abas e programas. Pode trocar de aba à vontade.</span><button type="button" id="pipback">Trazer de volta</button>`;
  stage.appendChild(note);
  note.querySelector("#pipback").onclick = () => setView("n");

  // tamanho da janelinha conforme o estilo (largura, altura do mini player; os botões somam 64px)
  const SIZE = { bolha: [260, 260], jukebox: [260, 330], dj: [520, 200], capsula: [380, 150], paredao: [440, 200], vinil: [460, 210], cassete: [430, 250], vfd: [480, 150], ingresso: [460, 210], ilha: [440, 140], aero: [540, 190], holo: [320, 330], holo2: [360, 360], dado: [300, 330], orbita: [340, 340], baralho: [250, 330], letras: [430, 190] };
  const stgName = () => { try { return localStorage.getItem("pd_stage") || "capsula"; } catch (e) { return "capsula"; } };
  const IC = {
    pv: '<svg viewBox="0 0 24 24"><path d="M6 5v14M19 5 9 12l10 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    pp: '<svg viewBox="0 0 24 24"><path class="ply" d="M8 5v14l11-7z" fill="currentColor"/><g class="pau" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></g></svg>',
    nx: '<svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l10 7-10 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    ex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-8 8M10 20H4v-6"/></svg>'
  };
  const PIPCSS = `html,body{margin:0;height:100%;overflow:hidden;background:var(--bg)}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
#pipw{flex:1;display:grid;place-items:center;width:100%;min-height:0}
#stg{position:static!important;display:block!important;cursor:default!important;max-width:none!important;transform-origin:center;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important}
#pipc{display:flex;gap:14px;padding:0 0 12px}
#pipc button{width:42px;height:42px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;color:#fff;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.28),rgba(255,255,255,.05) 60%);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--neon,var(--a)) 70%,#fff),0 0 12px color-mix(in srgb,var(--neon,var(--a)) 45%,transparent)}
#pipc button svg{width:18px;height:18px;filter:drop-shadow(0 0 4px var(--neon,var(--a)))}
#pipc [data-a=pp]{width:50px;height:50px}#pipc [data-a=pp] svg{width:22px;height:22px}
#pipc .pau{display:none}body.on #pipc .pau{display:block}body.on #pipc .ply{display:none}
html.light #pipc button{color:var(--a);background:radial-gradient(circle at 35% 25%,#fff,rgba(255,255,255,.6))}`;

  function syncTheme() {
    const w = PIP.win; if (!w) return;
    const de = w.document.documentElement;
    de.className = document.documentElement.className;
    de.setAttribute("style", document.documentElement.getAttribute("style") || "");
  }
  function fit() {
    const w = PIP.win; if (!w) return;
    stg.style.transform = "none";
    const r = stg.getBoundingClientRect(), W = w.innerWidth - 24, H = w.innerHeight - 84;
    const z = Math.max(.4, Math.min(2, W / (r.width || 1), H / (r.height || 1)));
    stg.style.transform = `scale(${z})`;
  }
  function upd() {
    // o mesmo que o mini player faz na página (capa, nome e artista)
    const k = S.i; if (!T[k]) return;
    const key = k + "_" + pi;
    if (stg._pk !== key) { stg._pk = key; const c = stg.querySelector(".sgc"); if (c) c.style.backgroundImage = `url(${art(k).u})`; const n = stg.querySelector("#sgn"), a = stg.querySelector("#sga"); if (n) n.textContent = T[k][0]; if (a) a.textContent = T[k][1]; }
    stg.classList.toggle("pl", !!S.p);
    if (PIP.win) PIP.win.document.body.classList.toggle("on", !!S.p);
  }

  async function open() {
    const sz = SIZE[stgName()] || SIZE.capsula;
    const w = await DPIP.requestWindow({ width: sz[0] + 40, height: sz[1] + 100 });
    PIP.win = w;
    const d = w.document;
    const base = d.createElement("base"); base.href = location.href; d.head.appendChild(base);
    document.querySelectorAll("style,link[rel=stylesheet]").forEach(n => d.head.appendChild(n.cloneNode(true)));
    const st = d.createElement("style"); st.textContent = PIPCSS; d.head.appendChild(st);
    d.title = "Paredão Player";
    d.body.dataset.s = "pip";
    syncTheme();
    mo = new MutationObserver(syncTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    home = stg.parentNode; nextN = stg.nextSibling;
    stg.style.left = stg.style.top = stg.style.right = stg.style.bottom = "";
    const wrap = d.createElement("div"); wrap.id = "pipw"; d.body.appendChild(wrap);
    wrap.appendChild(stg); stg.classList.add("inpip", "on");
    const ctl = d.createElement("div"); ctl.id = "pipc";
    ctl.innerHTML = ["pv", "pp", "nx", "ex"].map(a => `<button type="button" data-a="${a}" title="${{ pv: "Anterior", pp: "Tocar/pausar", nx: "Próxima", ex: "Voltar ao app" }[a]}">${IC[a]}</button>`).join("");
    d.body.appendChild(ctl);
    document.body.classList.add("pipon");
    upd(); requestAnimationFrame(fit); setTimeout(fit, 300);
    w.addEventListener("resize", fit);
    // os estilos da janelinha carregam depois: medir de novo até estabilizar (antes ficava com zoom gigante)
    d.querySelectorAll("link[rel=stylesheet]").forEach(l => l.addEventListener("load", () => setTimeout(fit, 30)));
    const fitT = setInterval(() => { if (PIP.win !== w || w.closed) return clearInterval(fitT); fit(); }, 700);
    // botões da janelinha usam o mesmo tratador de cliques da página
    d.body.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      if (b.dataset.a === "ex") { w.close(); try { window.focus(); } catch (er) {} return; }
      const px = document.createElement("button"); px.dataset.a = b.dataset.a; px.hidden = true;
      document.body.appendChild(px); px.click(); px.remove(); upd();
    }, true);
    d.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); const px = document.createElement("button"); px.dataset.a = "pp"; px.hidden = true; document.body.appendChild(px); px.click(); px.remove(); } });
    // aba escondida: o navegador freia a animação da página; a janelinha continua desenhando
    let lastSt = stgName();
    (function loop() {
      if (PIP.win !== w) return;
      if (document.hidden) { try { frame(performance.now()); } catch (e) {} }
      try { upd(); } catch (e) {}
      const n = stgName(); if (n !== lastSt) { lastSt = n; setTimeout(fit, 50); }
      w.requestAnimationFrame(loop);
    })();
    w.addEventListener("pagehide", () => {
      if (mo) mo.disconnect(); mo = null;
      stg.classList.remove("inpip"); stg.style.transform = "";
      if (home) home.insertBefore(stg, nextN && nextN.parentNode === home ? nextN : null);
      stg._k = null;
      document.body.classList.remove("pipon");
      PIP.win = null;
      if (view === "p") _sv("n");
    });
  }

  setView = function (v) {
    _sv(v);
    if (!DPIP) return;
    if (v === "p" && pmode() === "v" && document.pictureInPictureEnabled) return; // fica com o pop-up em vídeo (sem barra)
    if (v === "p" && !PIP.win) open().catch(e => { console.warn("pip", e); say("O navegador não abriu a janelinha; usando o pop-up dentro da página."); });
    else if (v !== "p" && PIP.win) PIP.win.close();
  };
  addEventListener("pagehide", () => { if (PIP.win) PIP.win.close(); });
})();

/* Paredão Player — pop-up no Android (e onde só existe picture-in-picture de vídeo)
   O mini player é desenhado num canvas, vira um "vídeo" e esse vídeo vai para a janelinha flutuante do sistema.
   Tocar/pausar/voltar/avançar aparecem como botões nativos da janelinha (Media Session). */
(function () {
  if (!document.pictureInPictureEnabled) return;
  const useV = () => !window.documentPictureInPicture || (window.PIPMODE && PIPMODE() === "v");
  let W = 640, H = 360; const SC = 1.5;
  const DIMS = { dado: [480, 480], orbita: [480, 480], baralho: [400, 540] }; // estes ficam quadrados / em pé // desenha em 960x540 para ficar nítido se a janelinha crescer
  const cv = document.createElement("canvas"); cv.width = W * SC; cv.height = H * SC;
  const x = cv.getContext("2d");
  const vd = document.createElement("video");
  vd.muted = true; vd.playsInline = true; vd.setAttribute("playsinline", "");
  vd.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1";
  document.body.appendChild(vd);
  const VP = window.VPIP = { on: false, ready: false, cv, draw: () => draw() };
  let img = null, imgU = "", tick = null;

  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const tap = a => { const b = document.createElement("button"); b.dataset.a = a; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); };
  const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function fit(t, max) { if (x.measureText(t).width <= max) return t; while (t.length > 1 && x.measureText(t + "…").width > max) t = t.slice(0, -1); return t + "…"; }
  function cover(k) {
    let u = ""; try { u = art(k).u || ""; } catch (e) {}
    if (u && u !== imgU) { imgU = u; const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { if (imgU === u) img = im; }; im.onerror = () => { if (imgU === u) img = null; }; im.src = u; img = null; }
    return img;
  }

  // estilo escolhido no modo palco (os que ainda não têm versão Android usam o cartão)
  const stg = () => { try { return localStorage.getItem("pd_stage") || "capsula"; } catch (e) { return "capsula"; } };
  let ang = 0, last = performance.now(), flapK = -1, flapT = 0;
  function pal() {
    const lt = document.documentElement.classList.contains("light");
    return { lt, bg: css("--bg") || "#0a0f1e", ne: (lt ? css("--a") : css("--neon")) || css("--a") || "#1fd3f2", ink: lt ? "#10202a" : "#ffffff" };
  }
  function prog(c, X, Y, w, sm) {
    const d = (typeof D !== "undefined" ? D : 0) || 0, p = d ? Math.min(1, S.t / d) : 0;
    x.fillStyle = c.lt ? "rgba(16,32,42,.14)" : "rgba(255,255,255,.16)"; rr(X, Y, w, 8, 4); x.fill();
    const pc = window.coverColor ? coverColor(S.i) : c.ne;
    x.save(); x.shadowColor = pc; x.shadowBlur = 12; x.fillStyle = pc; rr(X, Y, Math.max(8, w * p), 8, 4); x.fill(); x.restore();
    if (sm) return;
    x.fillStyle = c.ink; x.globalAlpha = .7; x.font = '400 17px "Chakra Petch",sans-serif';
    x.fillText(mmss(S.t), X, Y + 32); const e = mmss(d); x.fillText(e, X + w - x.measureText(e).width, Y + 32); x.globalAlpha = 1;
  }
  function frameBg(c, glow) {
    x.fillStyle = c.bg; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(140, 60, 10, 140, 60, 520); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (glow !== false) { x.save(); x.shadowColor = c.ne; x.shadowBlur = 18; x.strokeStyle = c.ne; x.lineWidth = 3; rr(8, 8, W - 16, H - 16, 26); x.stroke(); x.restore(); }
  }
  function texts(c, t, tx, ty, tw, big) {
    x.fillStyle = c.ne; x.font = '600 17px "Chakra Petch",sans-serif'; x.fillText(S.p ? "TOCANDO AGORA" : "PAUSADO", tx, ty);
    x.fillStyle = c.ink; x.font = `700 ${big || 36}px "Chakra Petch",sans-serif`; x.fillText(fit(t[0], tw), tx, ty + 48);
    x.globalAlpha = .72; x.font = '400 24px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", tw), tx, ty + 84); x.globalAlpha = 1;
  }
  function coverAt(k, X, Y, s, r, c) {
    x.save(); rr(X, Y, s, s, r); x.clip(); const im = cover(k);
    if (im) x.drawImage(im, X, Y, s, s); else { x.fillStyle = c.ne; x.globalAlpha = .25; x.fillRect(X, Y, s, s); }
    x.restore();
  }
  const beat = (tm, i) => S.p ? .5 + .5 * Math.abs(Math.sin(tm * (2.1 + i * .37) + i * 1.7) * Math.cos(tm * (1.3 + i * .23) + i)) : .08;

  const DRAW = {
    card(c, k, t) {
      frameBg(c); coverAt(k, 40, 64, 232, 18, c);
      x.save(); x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.5; rr(40, 64, 232, 232, 18); x.stroke(); x.restore();
      texts(c, t, 306, 92, 294); prog(c, 306, 248, 294);
    },
    paredao(c, k, t, tm) {
      frameBg(c);
      // duas caixas de som com o cone pulsando
      [[92, -1], [W - 92, 1]].forEach(([cx], i) => {
        const b = beat(tm, i) * 7;
        x.fillStyle = c.lt ? "#1d2a33" : "#05080d"; rr(cx - 70, 34, 140, 292, 20); x.fill();
        x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 2; rr(cx - 70, 34, 140, 292, 20); x.stroke();
        [[110, 26], [236, 52 + b]].forEach(([cy, r]) => {
          const g = x.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, "#3a4650"); g.addColorStop(.6, "#11181f"); g.addColorStop(1, "#000");
          x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
          x.save(); x.shadowColor = c.ne; x.shadowBlur = 14; x.strokeStyle = c.ne; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r + 4, 0, 6.283); x.stroke(); x.restore();
          x.fillStyle = "#22303a"; x.beginPath(); x.arc(cx, cy, r * .28, 0, 6.283); x.fill();
        });
      });
      coverAt(k, W / 2 - 80, 36, 160, 16, c);
      x.textAlign = "center";
      x.fillStyle = c.ink; x.font = '700 28px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], 260), W / 2, 238);
      x.globalAlpha = .72; x.font = '400 20px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", 260), W / 2, 266); x.globalAlpha = 1;
      x.textAlign = "left"; prog(c, W / 2 - 130, 290, 260, true);
    },
    vinil(c, k, t, tm) {
      frameBg(c);
      // base do toca-discos
      x.save(); x.shadowColor = "rgba(0,0,0,.5)"; x.shadowBlur = 20; x.fillStyle = c.lt ? "#26323b" : "#151b22"; rr(30, 40, 290, 280, 20); x.fill(); x.restore();
      x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 2; rr(30, 40, 290, 280, 20); x.stroke();
      const cx = 160, cy = 180, R = 118;
      x.fillStyle = "#0b0d10"; x.beginPath(); x.arc(cx, cy, R + 6, 0, 6.283); x.fill();
      x.save(); x.translate(cx, cy); x.rotate(ang);
      x.fillStyle = "#111"; x.beginPath(); x.arc(0, 0, R, 0, 6.283); x.fill();
      for (let r = 46; r < R; r += 4) { x.strokeStyle = r % 12 ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.1)"; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.stroke(); }
      x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, R - 20, -.6, -.2); x.stroke();
      x.beginPath(); x.arc(0, 0, 42, 0, 6.283); x.clip(); const im = cover(k);
      if (im) x.drawImage(im, -42, -42, 84, 84); else { x.fillStyle = c.ne; x.fillRect(-42, -42, 84, 84); }
      x.restore();
      x.fillStyle = "#ddd"; x.beginPath(); x.arc(cx, cy, 4, 0, 6.283); x.fill();
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 10; x.strokeStyle = c.ne; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R + 6, 0, 6.283); x.stroke(); x.restore();
      // braço
      const aa = S.p ? .42 : .15;
      x.save(); x.translate(292, 68); x.rotate(aa);
      x.fillStyle = "#cfd6dc"; x.beginPath(); x.arc(0, 0, 12, 0, 6.283); x.fill();
      x.strokeStyle = "#cfd6dc"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(0, 0); x.lineTo(-6, 150); x.stroke();
      x.fillStyle = "#9aa4ac"; rr(-16, 146, 20, 26, 4); x.fill(); x.restore();
      texts(c, t, 350, 96, 250, 32); prog(c, 350, 248, 250);
    },
    cassete(c, k, t, tm) {
      frameBg(c, false);
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 22; x.fillStyle = "#1a1d22"; rr(18, 20, W - 36, H - 40, 22); x.fill(); x.restore();
      x.strokeStyle = "rgba(255,255,255,.16)"; x.lineWidth = 2; rr(18, 20, W - 36, H - 40, 22); x.stroke();
      [[40, 42], [W - 40, 42], [40, H - 42], [W - 40, H - 42]].forEach(([a, b]) => { x.fillStyle = "#3b424a"; x.beginPath(); x.arc(a, b, 7, 0, 6.283); x.fill(); x.strokeStyle = "#11151a"; x.lineWidth = 2; x.beginPath(); x.moveTo(a - 4, b); x.lineTo(a + 4, b); x.stroke(); });
      // etiqueta
      const g = x.createLinearGradient(66, 0, W - 66, 0); g.addColorStop(0, c.ne); g.addColorStop(.28, "#f3ead8"); g.addColorStop(1, "#f6eedd");
      x.fillStyle = g; rr(66, 46, W - 132, 110, 12); x.fill();
      x.fillStyle = "#1b2228"; x.font = '700 32px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], W - 172), 88, 94);
      x.globalAlpha = .75; x.font = '400 22px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", W - 172), 88, 128); x.globalAlpha = 1;
      // janela com os carretéis
      x.fillStyle = "#07090b"; rr(146, 182, W - 292, 98, 49); x.fill();
      x.strokeStyle = "rgba(255,255,255,.2)"; rr(146, 182, W - 292, 98, 49); x.stroke();
      const d = (typeof D !== "undefined" ? D : 0) || 1, p = Math.min(1, S.t / d);
      [[212, 1 - p], [W - 212, p]].forEach(([cx, f]) => {
        const r = 24 + f * 18; x.fillStyle = "#5a3b22"; x.beginPath(); x.arc(cx, 231, r, 0, 6.283); x.fill();
        x.save(); x.translate(cx, 231); x.rotate(ang * 1.6);
        x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(0, 0, 21, 0, 6.283); x.fill();
        x.fillStyle = "#8a8f94"; for (let i = 0; i < 6; i++) { x.rotate(1.047); rr(-3, 6, 6, 13, 2); x.fill(); }
        x.fillStyle = "#222"; x.beginPath(); x.arc(0, 0, 6, 0, 6.283); x.fill(); x.restore();
      });
      x.fillStyle = c.ne; x.font = '600 15px "Chakra Petch",sans-serif'; x.fillText(S.p ? "▶ PLAY" : "❚❚ PAUSE", 62, 304); const tt = mmss(S.t) + " / " + mmss(d); x.fillText(tt, W - 62 - x.measureText(tt).width, 304);
    },
    vfd(c, k, t, tm) {
      x.fillStyle = "#020405"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 2; rr(10, 10, W - 20, H - 20, 18); x.stroke();
      const n = c.lt ? c.ne : c.ne;
      x.save(); x.shadowColor = n; x.shadowBlur = 10; x.strokeStyle = n; x.lineWidth = 2.5; rr(34, 34, 64, 40, 4); x.stroke();
      x.fillStyle = n; x.font = '700 26px "Chakra Petch",monospace'; x.fillText("FM", 46, 64);
      x.font = '600 20px "Chakra Petch",monospace'; const tt = mmss(S.t); x.fillText(tt, W - 40 - x.measureText(tt).width, 62);
      // letreiro correndo
      x.font = '700 64px "Chakra Petch",monospace'; const s = (t[0] + "  •  " + (t[1] || "") + "  •  "), sw = x.measureText(s).width;
      const off = S.p ? (tm * 90) % sw : 0;
      x.beginPath(); x.rect(34, 96, W - 68, 92); x.clip();
      x.shadowBlur = 18; x.fillText(s + s, 34 - off, 168); x.restore();
      // espectro
      const nb = 16, bw = (W - 68) / nb;
      for (let i = 0; i < nb; i++) { const v = beat(tm * 1.6, i), seg = Math.max(1, Math.round(v * 8));
        for (let j = 0; j < 8; j++) { x.fillStyle = n; x.globalAlpha = j < seg ? 1 : .1; if (j < seg) { x.shadowColor = n; x.shadowBlur = 6; } else x.shadowBlur = 0; x.fillRect(34 + i * bw + 3, 312 - j * 13, bw - 6, 8); } }
      x.globalAlpha = 1; x.shadowBlur = 0;
    },
    aero(c, k, t, tm) {
      x.fillStyle = "#0c0f13"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 2; rr(10, 10, W - 20, H - 20, 16); x.stroke();
      const amber = "#f5c518";
      x.fillStyle = amber; x.font = '700 18px "Chakra Petch",sans-serif'; x.fillText("DESTINO", 34, 50);
      const sx = "STATUS"; x.fillText(sx, W - 34 - x.measureText(sx).width, 50);
      if (k !== flapK) { flapK = k; flapT = tm; }
      const roll = tm - flapT;
      const up = s => String(s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const row = (s, Y, n, cw, fs, ofs) => {
        const ch = (up(s) + " ".repeat(n)).slice(0, n);
        for (let i = 0; i < n; i++) {
          const X = 34 + i * (cw + 4); x.fillStyle = "#1c2128"; rr(X, Y, cw, cw * 1.35, 4); x.fill();
          x.fillStyle = "#000"; x.fillRect(X, Y + cw * .675 - 1, cw, 2);
          let L = ch[i]; if (roll < .6 + i * .05 + ofs) L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor((tm * 20 + i * 7) % 36)];
          x.fillStyle = "#f2f2f2"; x.font = `700 ${fs}px "Chakra Petch",monospace`; x.textAlign = "center"; x.fillText(L, X + cw / 2, Y + cw * 1.05); x.textAlign = "left";
        }
      };
      row(t[0], 70, 15, 31, 30, 0); row(t[1], 136, 15, 31, 30, .3);
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 12; x.fillStyle = c.ne; x.font = '700 22px "Chakra Petch",sans-serif';
      const st = S.p ? "TOCANDO" : "PAUSADO"; x.fillText(st, W - 34 - x.measureText(st).width, 216); x.restore();
      x.fillStyle = amber; x.font = '700 18px "Chakra Petch",sans-serif'; x.fillText("PORTÃO", 34, 216);
      x.fillStyle = "#f2f2f2"; x.font = '700 24px "Chakra Petch",monospace'; x.fillText("PAREDÃO", 34, 246);
      prog(c, 34, 278, W - 68);
    }
  };
  DRAW.dj = function (c, k, t, tm) {
    x.fillStyle = "#121418"; x.fillRect(0, 0, W, H);
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 16; x.strokeStyle = c.ne; x.lineWidth = 2; rr(10, 10, W - 20, H - 20, 22); x.stroke(); x.restore();
    [[118, 1, 1.0], [W - 118, 0, .7]].forEach(([cx, cov, sp]) => {
      x.fillStyle = "#1c1f24"; rr(cx - 98, 34, 196, 292, 18); x.fill();
      const cy = 160, R = 82;
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 12; x.strokeStyle = c.ne; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R + 6, 0, 6.283); x.stroke(); x.restore();
      x.save(); x.translate(cx, cy); x.rotate(ang * sp);
      x.fillStyle = "#0d0d10"; x.beginPath(); x.arc(0, 0, R, 0, 6.283); x.fill();
      for (let r = 34; r < R; r += 4) { x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.stroke(); }
      x.fillStyle = "rgba(255,255,255,.8)"; x.fillRect(-2, -R + 4, 4, 16);
      x.beginPath(); x.arc(0, 0, 30, 0, 6.283); x.clip();
      const im = cov ? cover(k) : null; if (im) x.drawImage(im, -30, -30, 60, 60); else { x.fillStyle = c.ne; x.fillRect(-30, -30, 60, 60); }
      x.restore();
      [-28, 0, 28].forEach(d => { const g = x.createRadialGradient(cx + d - 3, 290 - 3, 1, cx + d, 290, 10); g.addColorStop(0, "#d6dbe2"); g.addColorStop(1, "#4d535b"); x.fillStyle = g; x.beginPath(); x.arc(cx + d, 290, 10, 0, 6.283); x.fill(); });
    });
    const tx = 236, tw = W - 472;
    x.fillStyle = "#fff"; x.font = '700 26px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], tw), tx, 82);
    x.fillStyle = "#aeb6c0"; x.font = '400 18px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", tw), tx, 108);
    const nb = 10, bw = tw / nb;
    for (let i = 0; i < nb; i++) { const v = beat(tm * 1.4, i), h = 10 + v * 66; const g = x.createLinearGradient(0, 210, 0, 144); g.addColorStop(0, c.ne); g.addColorStop(.6, c.ne); g.addColorStop(.8, "#ffd24a"); g.addColorStop(1, "#ff4d4d"); x.fillStyle = g; rr(tx + i * bw + 2, 210 - h, bw - 4, h, 3); x.fill(); }
    x.fillStyle = "#07080a"; rr(tx, 232, tw, 10, 5); x.fill();
    const fx = tx + tw * (.3 + .3 * (Math.sin(tm * .5) * .5 + .5)); x.save(); x.shadowColor = c.ne; x.shadowBlur = 10; x.fillStyle = "#e9ecef"; rr(fx - 11, 222, 22, 30, 4); x.fill(); x.restore();
    prog(c, tx, 270, tw);
  };
  DRAW.jukebox = function (c, k, t, tm) {
    x.fillStyle = "#0c0806"; x.fillRect(0, 0, W, H);
    // gabinete em arco
    const bx = 180, bw = 280, top = 12, bot = H - 12;
    const arc = () => { x.beginPath(); x.moveTo(bx, bot); x.lineTo(bx, top + 140); x.arc(bx + bw / 2, top + 140, bw / 2, Math.PI, 0); x.lineTo(bx + bw, bot); x.closePath(); };
    const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, "#4a2e18"); g.addColorStop(1, "#140b05");
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 24; arc(); x.fillStyle = g; x.fill(); x.restore();
    arc(); x.lineWidth = 5; x.strokeStyle = c.ne; x.stroke();
    // tubos de bolhas
    [[bx + 18, ["#ff4fb4", "#ffb23f", c.ne]], [bx + bw - 38, [c.ne, "#7a6bff", "#ff4fb4"]]].forEach(([tx, cols]) => {
      const gg = x.createLinearGradient(0, 90, 0, 200); cols.forEach((cc, i) => gg.addColorStop(i / 2, cc));
      x.fillStyle = gg; rr(tx, 90, 20, 110, 10); x.fill();
      x.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 4; i++) { const y = 192 - ((tm * 40 + i * 26) % 100); x.beginPath(); x.arc(tx + 10, y, 3, 0, 6.283); x.fill(); }
    });
    // janela com o disco
    const wx = bx + 52, ww = bw - 104;
    x.save(); x.beginPath(); x.moveTo(wx, 200); x.lineTo(wx, 130); x.arc(wx + ww / 2, 130, ww / 2, Math.PI, 0); x.lineTo(wx + ww, 200); x.closePath();
    const wg = x.createRadialGradient(W / 2, 90, 10, W / 2, 120, 160); wg.addColorStop(0, "#27313c"); wg.addColorStop(1, "#0b0f14"); x.fillStyle = wg; x.fill(); x.clip();
    x.translate(W / 2, 160); x.scale(1, .45); x.rotate(ang * 2);
    x.fillStyle = "#0d0d10"; x.beginPath(); x.arc(0, 0, 80, 0, 6.283); x.fill();
    for (let r = 32; r < 80; r += 4) { x.strokeStyle = "rgba(255,255,255,.06)"; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.stroke(); }
    x.beginPath(); x.arc(0, 0, 28, 0, 6.283); x.clip(); const im = cover(k); if (im) x.drawImage(im, -28, -28, 56, 56); else { x.fillStyle = c.ne; x.fillRect(-28, -28, 56, 56); }
    x.restore();
    // etiqueta
    x.fillStyle = "#efe3c8"; rr(bx + 30, 214, bw - 60, 56, 6); x.fill();
    x.textAlign = "center"; x.fillStyle = "#2a1a0d"; x.font = '700 22px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], bw - 80), W / 2, 240);
    x.fillStyle = "#6b4a2a"; x.font = '400 16px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", bw - 80), W / 2, 261); x.textAlign = "left";
    // botões de seleção piscando
    for (let i = 0; i < 10; i++) { const on = S.p && ((Math.floor(tm * 2) + i * 3) % 7 < 2); x.fillStyle = on ? c.ne : "#3b2a1a"; rr(bx + 30 + i * ((bw - 60) / 10), 282, (bw - 60) / 10 - 4, 10, 2); x.fill(); }
    prog(c, bx + 30, 304, bw - 60, true);
    // laterais: tempo
    x.fillStyle = "#cdb48c"; x.font = '600 18px "Chakra Petch",sans-serif'; x.fillText(mmss(S.t), 30, H / 2);
    const d = (typeof D !== "undefined" ? D : 0) || 0, e = mmss(d); x.fillText(e, W - 30 - x.measureText(e).width, H / 2);
    x.fillStyle = c.ne; x.font = '700 15px "Chakra Petch",sans-serif'; x.fillText(S.p ? "TOCANDO" : "PAUSADO", 30, H / 2 + 26);
  };
  // #12 Bolha de sabão: fundo com luzes difusas e grade, bolha iridescente com a capa por dentro
  DRAW.bolha = function (c, k, t, tm) {
    x.fillStyle = "#1a1230"; x.fillRect(0, 0, W, H);
    [[150, 110, "#e0628a"], [520, 70, "#ffd36b"], [200, 300, "#7a5cff"], [490, 290, "#6fd0ee"]].forEach(([bx, by, col]) => {
      const g = x.createRadialGradient(bx, by, 4, bx, by, 220); g.addColorStop(0, col + "cc"); g.addColorStop(1, col + "00"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    });
    x.strokeStyle = "rgba(255,255,255,.07)"; x.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += 40) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
    for (let gy = 0; gy <= H; gy += 40) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
    const R = 150, cx = W / 2, cy = H / 2 + Math.sin(tm * 1.05) * 6;
    { const w = Math.sin(tm * 1.7) * .018, w2 = Math.sin(tm * 2.3 + 1) * .01; x.translate(cx, cy); x.scale(1 + w + w2, 1 - w + w2 * .5); x.translate(-cx, -cy); } // a bolha treme e respira
    const im = cover(k);
    // interior um pouco mais escuro (como a bolha de verdade sobre o fundo)
    const tint = x.createRadialGradient(cx, cy, 0, cx, cy, R); tint.addColorStop(0, "rgba(25,12,45,.42)"); tint.addColorStop(.85, "rgba(25,12,45,.2)"); tint.addColorStop(1, "rgba(25,12,45,0)");
    x.fillStyle = tint; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
    // capa difusa lá dentro (desenhada maior que o recorte, para o desfoque não escurecer a borda)
    if (im) { x.save(); x.beginPath(); x.arc(cx, cy, R * .58, 0, 6.283); x.clip(); x.globalAlpha = .32; try { x.filter = "blur(4px)"; } catch (e) {} x.drawImage(im, cx - R * .7, cy - R * .7, R * 1.4, R * 1.4); x.filter = "none"; x.restore(); }
    // filme de sabão girando: um anel de cores só perto da borda
    if (x.createConicGradient) {
      const cg = x.createConicGradient(tm * (S.p ? 1.2 : .7), cx, cy);
      ["rgba(255,122,182,.5)", "rgba(255,211,107,.45)", "rgba(157,255,176,.42)", "rgba(127,214,255,.45)", "rgba(167,139,255,.5)", "rgba(255,122,182,.5)"].forEach((col, i) => cg.addColorStop(i / 5, col));
      x.save(); x.globalCompositeOperation = "screen"; x.strokeStyle = cg;
      for (let i = 0; i < 16; i++) { const r = .7 + i * .019; x.globalAlpha = Math.pow(i / 15, 2.2) * .9; x.lineWidth = R * .021; x.beginPath(); x.arc(cx, cy, R * r, 0, 6.283); x.stroke(); }
      x.restore();
    }
    // borda brilhante
    const rim = x.createRadialGradient(cx, cy, R * .58, cx, cy, R); rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(.8, "rgba(255,255,255,.04)"); rim.addColorStop(.95, "rgba(255,255,255,.14)"); rim.addColorStop(1, "rgba(255,255,255,.4)");
    x.fillStyle = rim; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
    // reflexo
    x.save(); x.translate(cx - R * .41, cy - R * .62); x.rotate(-.36); x.scale(1, .62);
    const hl = x.createRadialGradient(0, 0, 0, 0, 0, 34); hl.addColorStop(0, "rgba(255,255,255,.95)"); hl.addColorStop(.6, "rgba(255,255,255,.8)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = hl; x.beginPath(); x.arc(0, 0, 34, 0, 6.283); x.fill(); x.restore();
    // textos
    x.textAlign = "center"; x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 6;
    x.fillStyle = "#fff"; x.font = '700 26px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], R * 1.45), cx, cy - R * .02);
    x.fillStyle = "rgba(255,255,255,.82)"; x.font = '400 18px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", R * 1.45), cx, cy + R * .2);
    x.shadowBlur = 0; x.textAlign = "left";
    // progresso fininho embaixo da bolha
    const d = (typeof D !== "undefined" ? D : 0) || 0, pr = d ? Math.min(1, S.t / d) : 0;
    x.fillStyle = "rgba(255,255,255,.15)"; rr(cx - 90, cy + R - 30, 180, 4, 2); x.fill();
    x.fillStyle = "rgba(255,255,255,.85)"; rr(cx - 90, cy + R - 30, Math.max(4, 180 * pr), 4, 2); x.fill();
  };
  /* ===== rodada 11: janelinha do sistema para os novos estilos ===== */
  const TBG = c => { if (window.PD_TBG) { const v = PD_TBG(c); if (v) return v; } let on = true; try { on = localStorage.getItem("pd_stgtr") !== "0"; } catch (e) {} return on ? "#020406" : c.bg; };
  const IMC = {};
  function coverK(k) {
    let u = ""; try { u = art(k).u || ""; } catch (e) {} if (!u) return null;
    let o = IMC[u]; if (!o) { o = IMC[u] = { im: null }; const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => o.im = im; im.src = u; }
    return o.im;
  }
  const P2 = {};
  const icon = (a, cx, cy, s, col) => {
    let key = a === "pp" ? (S.p ? "pau" : "ply") : a;
    if (!P2[key]) { let d = (window.PD_IC || {})[a] || ""; if (a === "pp") d = S.p ? '<rect x="6.4" y="5" width="3.9" height="14" rx="1.1"/><rect x="13.7" y="5" width="3.9" height="14" rx="1.1"/>' : '<path d="M8.6 5.3v13.4L19 12z"/>';
      const ps = []; d.replace(/<(path|rect|circle)([^>]*)\/>/g, (m, tg, at) => { const g = n => { const r = new RegExp(n + '="([^"]*)"').exec(at); return r ? r[1] : null; }; const p = new Path2D(); const ln = /class="(ln|hl)"/.test(at);
        if (tg === "path") p.addPath(new Path2D(g("d"))); else if (tg === "rect") { p.rect(+g("x"), +g("y"), +g("width"), +g("height")); } else p.arc(+g("cx"), +g("cy"), +g("r"), 0, 6.283);
        ps.push({ p, ln, hl: /class="hl"/.test(at) }); });
      P2[key] = ps; }
    x.save(); x.translate(cx - s / 2, cy - s / 2); x.scale(s / 24, s / 24);
    P2[key].forEach(o => { if (o.ln) { x.strokeStyle = col; x.lineWidth = 2.1; x.lineCap = x.lineJoin = "round"; x.stroke(o.p); if (o.hl && typeof FAV !== "undefined" && FAV.has(S.i)) { x.fillStyle = col; x.fill(o.p); } } else { x.fillStyle = col; x.fill(o.p); } });
    x.restore();
  };
  function sphere(cx, cy, r, a, c, big) {
    const g = x.createRadialGradient(cx, cy - r * .5, r * .1, cx, cy, r); g.addColorStop(0, "#62666e"); g.addColorStop(.65, "#2c2f35"); g.addColorStop(1, "#1b1d21");
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
    x.lineWidth = big ? 3.5 : 1.2; x.strokeStyle = big ? c.ne : "rgba(255,255,255,.3)";
    if (big) { x.save(); x.shadowColor = c.ne; x.shadowBlur = 16; x.stroke(); x.restore(); } else x.stroke();
    icon(a, cx, cy, r * .85, "#fff");
  }
  const pr01 = () => { const d = (typeof D !== "undefined" ? D : 0) || 0; return d ? Math.min(1, S.t / d) : 0; };
  // troca de faixa: direção (⟳10 / próxima = esquerda, ⟲10 / anterior = direita) e o instante, para animar
  const CH = { k: null, t: -9, dir: "l", from: null };
  function chg(tm) {
    if (CH.k === null) CH.k = S.i;
    if (S.i !== CH.k) { CH.from = CH.k; CH.dir = window.PD_DIR_P || ((CH.from != null && S.i === stepI(CH.from, -1)) ? "r" : "l"); window.PD_DIR_P = ""; CH.k = S.i; CH.t = tm; }
    return Math.min(1, (tm - CH.t) / .65);
  }
  const ease = t => 1 - Math.pow(1 - t, 3);
  function wrap(t, maxW, sizes, fam) {
    for (const fs of sizes) { x.font = `800 ${fs}px ${fam}`; const ws = String(t).split(" "), L = []; let cur = "";
      for (const w of ws) { const tt = cur ? cur + " " + w : w; if (x.measureText(tt).width <= maxW) cur = tt; else { if (cur) L.push(cur); cur = w; } } if (cur) L.push(cur);
      if (L.length <= 2 && L.every(l => x.measureText(l).width <= maxW)) return { fs, L }; }
    const fs = sizes[sizes.length - 1]; x.font = `800 ${fs}px ${fam}`; return { fs, L: [fit(t, maxW)] };
  }
  function ellArc(cx, cy, rx, ry, rot, a0, a1) { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, a0, a1); }
  // Holograma Hora do Show
  DRAW.holo2 = function (c, k, t, tm) {
    const p = chg(tm);
    x.fillStyle = TBG(c); x.fillRect(0, 0, W, H);
    const cx = W / 2;
    // feixe
    const g = x.createLinearGradient(0, 250, 0, 30); g.addColorStop(0, c.ne + "77"); g.addColorStop(.7, c.ne + "18"); g.addColorStop(1, c.ne + "00");
    x.fillStyle = g; x.beginPath(); x.moveTo(cx - 34, 262); x.lineTo(cx + 34, 262); x.lineTo(cx + 190, 26); x.lineTo(cx - 190, 26); x.closePath(); x.fill();
    // anel: metade de trás
    const ry = 50 + Math.sin(tm * .8) * 4, rot = -.17, cyR = 118, off = tm * (S.p ? 90 : 40);
    x.save(); x.setLineDash([150, 46, 90, 30]); x.lineDashOffset = -off; x.lineWidth = 5; x.strokeStyle = c.ne; x.shadowColor = c.ne; x.shadowBlur = 14;
    ellArc(cx, cyR, 236, ry, rot, Math.PI, Math.PI * 2); x.stroke(); x.restore();
    // título extrudado
    const fam = '"Exo 2",sans-serif'; const wr = wrap(t[0], 430, [70, 62, 54, 46, 40, 34], fam);
    const gl = p < 1 ? (1 - p) : 0, jx = gl ? (Math.random() - .5) * 18 * gl : 0;
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    const lh = wr.fs * .96, y0 = 128 - (wr.L.length - 1) * lh / 2 + wr.fs * .32 + Math.sin(tm * .9) * 3;
    wr.L.forEach((l, i) => {
      const y = y0 + i * lh;
      const sh = ["#2a3137", "#3b444b", "#4e5860", "#636e77", "#7b868f", "#96a1aa", "#b4bec6"];
      sh.forEach((col, j) => { const d = (7 - j) * wr.fs * .028; x.fillStyle = col; x.fillText(l, cx + d + jx, y + d); });
      if (gl) { x.globalAlpha = .6 * gl; x.fillStyle = "#ff3df0"; x.fillText(l, cx - 6 + jx, y); x.fillStyle = c.ne; x.fillText(l, cx + 6 + jx, y); x.globalAlpha = 1; }
      const fg = x.createLinearGradient(cx - 220 + ((tm * 120) % 440), 0, cx + 220 + ((tm * 120) % 440), 0); fg.addColorStop(0, "#ffffff"); fg.addColorStop(.4, "#ffffff"); fg.addColorStop(.5, "#c9f4ff"); fg.addColorStop(.6, "#ffffff");
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 16; x.fillStyle = fg; x.fillText(l, cx + jx, y); x.restore();
    });
    // linhas de varredura do holograma
    x.fillStyle = "rgba(0,0,0,.22)"; for (let yy = 30; yy < 230; yy += 3) x.fillRect(cx - 240, yy, 480, 1);
    x.fillStyle = "rgba(235,242,245,.85)"; x.font = '400 21px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", 380), cx, y0 + (wr.L.length - 1) * lh + 40);
    // anel: metade da frente
    x.save(); x.setLineDash([150, 46, 90, 30]); x.lineDashOffset = -off; x.lineWidth = 5; x.strokeStyle = c.ne; x.shadowColor = c.ne; x.shadowBlur = 14;
    ellArc(cx, cyR, 236, ry, rot, 0, Math.PI); x.stroke(); x.restore();
    x.textAlign = "left";
    // disco com o progresso no contorno
    x.fillStyle = "#0b0e11"; ellArc(cx, 318, 140, 26, 0, 0, 6.283); x.fill();
    x.lineWidth = 3; x.strokeStyle = "rgba(255,255,255,.14)"; x.stroke();
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 12; x.strokeStyle = c.ne; ellArc(cx, 318, 140, 26, 0, Math.PI / 2, Math.PI / 2 + 6.283 * Math.max(.005, pr01())); x.stroke(); x.restore();
    // cápsula de controles
    const pg = x.createLinearGradient(0, 252, 0, 316); pg.addColorStop(0, "#2a2d33"); pg.addColorStop(1, "#0d0f12");
    x.fillStyle = pg; rr(cx - 128, 250, 256, 68, 34); x.fill(); x.lineWidth = 1.5; x.strokeStyle = "rgba(255,255,255,.25)"; x.stroke();
    { const d = (typeof D !== "undefined" ? D : 0) || 0; x.textAlign = "center"; x.fillStyle = "#fff"; x.font = '600 24px "Chakra Petch",sans-serif'; x.save(); x.shadowColor = c.ne; x.shadowBlur = 10; x.fillText(mmss(S.t) + "  /  " + mmss(d), cx, 293); x.restore(); x.textAlign = "left"; }
  };
  // Dado de controles (cubo de verdade, projetado em 3D)
  let dRy = -90, dRyT = 0;
  DRAW.dado = function (c, k, t, tm) {
    const p = chg(tm);
    if (p < 1 && CH.t === tm) {} // noop
    if (CH.t > dRyT) { dRyT = CH.t; dRy += CH.dir === "l" ? -90 : 90; }
    x.fillStyle = TBG(c); x.fillRect(0, 0, W, H);
    const cx = W / 2, cy = 205;
    // base luminosa com o progresso
    const bg = x.createRadialGradient(cx, 418, 10, cx, 418, 170); bg.addColorStop(0, c.ne + "40"); bg.addColorStop(1, c.ne + "00"); x.fillStyle = bg; x.fillRect(0, 300, W, H - 300);
    x.lineWidth = 3; x.strokeStyle = "rgba(255,255,255,.14)"; ellArc(cx, 418, 130, 30, 0, 0, 6.283); x.stroke();
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 16; x.strokeStyle = c.ne; x.lineWidth = 3.5; ellArc(cx, 418, 130, 30, 0, Math.PI / 2, Math.PI / 2 + 6.283 * Math.max(.005, pr01())); x.stroke(); x.restore();
    // rotação: rola 90° na troca de faixa (com pulinho)
    const e = ease(p), hop = p < 1 ? Math.sin(p * Math.PI) * 46 : 0;
    const prevRy = dRy + (CH.dir === "l" ? 90 : -90);
    const ay = ((p < 1 ? prevRy + (dRy - prevRy) * (e + Math.sin(p * Math.PI) * .08) : dRy) - 45 + Math.sin(tm * .9) * 5) * Math.PI / 180, ax = 26 * Math.PI / 180;
    const s = 118, oy = cy - hop + Math.sin(tm * 1.05) * 6;
    const P = (X, Y, Z) => { let x1 = X * Math.cos(ay) + Z * Math.sin(ay), z1 = -X * Math.sin(ay) + Z * Math.cos(ay); let y1 = Y * Math.cos(ax) - z1 * Math.sin(ax), z2 = Y * Math.sin(ax) + z1 * Math.cos(ax); return [cx + x1 * s, oy + y1 * s, z2]; };
    // faces: [origem, eixo u, eixo v, ação]  (unidade = metade da aresta)
    const F = [
      [[-1, -1, 1], [2, 0, 0], [0, 2, 0], "pp"], [[1, -1, 1], [0, 0, -2], [0, 2, 0], "nx"], [[1, -1, -1], [-2, 0, 0], [0, 2, 0], "fv"], [[-1, -1, -1], [0, 0, 2], [0, 2, 0], "pv"],
      [[-1, -1, 1], [2, 0, 0], [0, 0, -2], "top"], [[-1, 1, 1], [2, 0, 0], [0, 0, -2], "sh"]];
    const fs = F.map(f => { const o = P(...f[0]), u = P(f[0][0] + f[1][0], f[0][1] + f[1][1], f[0][2] + f[1][2]), v = P(f[0][0] + f[2][0], f[0][1] + f[2][1], f[0][2] + f[2][2]);
      const cr = (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]); return { o, u, v, a: f[3], vis: f[3] === "top" ? true : f[3] === "sh" ? false : cr < 0, z: (o[2] + u[2] + v[2]) / 3 }; }).filter(f => f.vis).sort((a, b) => a.z - b.z);
    fs.forEach(f => {
      const A = (f.u[0] - f.o[0]) / 100, Bb = (f.u[1] - f.o[1]) / 100, C = (f.v[0] - f.o[0]) / 100, Dd = (f.v[1] - f.o[1]) / 100;
      x.save(); x.setTransform(SC * A, SC * Bb, SC * C, SC * Dd, SC * f.o[0], SC * f.o[1]);
      const fg = x.createRadialGradient(50, 45, 5, 50, 50, 75); fg.addColorStop(0, "#30343a"); fg.addColorStop(1, "#131518");
      x.fillStyle = fg; rr(2, 2, 96, 96, 14); x.fill(); x.lineWidth = 5; x.strokeStyle = "#d6dce1"; x.stroke();
      if (f.a === "top") { x.save(); rr(7, 7, 86, 86, 10); x.clip(); const im = cover(k); if (im) x.drawImage(im, 7, 7, 86, 86); else { x.fillStyle = c.ne; x.globalAlpha = .3; x.fillRect(7, 7, 86, 86); } x.restore();
        x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(7, 74, 86, 19); x.fillStyle = "#fff"; x.font = '700 8px "Chakra Petch",sans-serif'; x.fillText(fit(String(t[0]).toUpperCase(), 76), 12, 87); }
      else {
        x.fillStyle = "#cfd5da"; [[12, 12], [88, 12], [12, 88], [88, 88]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.2, 0, 6.283); x.fill(); });
        x.save(); x.shadowColor = c.ne; x.shadowBlur = 14; x.strokeStyle = c.ne; x.lineWidth = 3.4; x.beginPath(); x.arc(50, 50, 29, 0, 6.283); x.stroke(); x.restore();
        icon(f.a, 50, 50, 26, c.ne);
      }
      x.restore();
    });
    x.setTransform(SC, 0, 0, SC, 0, 0);
    x.fillStyle = "rgba(235,242,245,.6)"; x.font = '400 15px "Chakra Petch",sans-serif'; x.textAlign = "center"; x.fillText("⟲10 / ⟳10 rolam o dado", cx, H - 16); x.textAlign = "left";
  };
  // Órbita de controles
  DRAW.orbita = function (c, k, t, tm) {
    const p = chg(tm);
    x.fillStyle = TBG(c); x.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, sp = p < 1 ? (1 - ease(p)) * 6 : 0;
    x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, 190, 0, 6.283); x.stroke();
    [[200, 130, tm * .25 + sp], [180, 150, -tm * .17 - sp]].forEach(([a, b, r]) => { x.strokeStyle = "rgba(255,255,255,.1)"; ellArc(cx, cy, a, b, r, 0, 6.283); x.stroke(); });
    x.strokeStyle = "rgba(255,255,255,.16)"; x.beginPath(); x.moveTo(cx, 86); x.lineTo(cx, H - 86); x.moveTo(86, cy); x.lineTo(W - 86, cy); x.stroke();
    const fv = typeof FAV !== "undefined" && FAV.has(S.i), sh = (() => { try { return localStorage.getItem("pd_sh") === "1"; } catch (e) { return false; } })();
    [[cx, 52, "mo"], [52, cy, "ls"], [W - 52, cy, "fv", fv], [cx, H - 52, "sh", sh]].forEach(([a, b, ic, on]) => {
      x.save(); x.shadowColor = c.ne; x.shadowBlur = on ? 22 : 12; x.fillStyle = "#121518"; x.beginPath(); x.arc(a, b, 36, 0, 6.283); x.fill(); x.restore();
      x.lineWidth = on ? 3 : 1.4; x.strokeStyle = on ? c.ne : "rgba(255,255,255,.24)"; x.stroke(); icon(ic, a, b, 28, c.ne);
    });
    const cg = x.createRadialGradient(cx, cy - 90, 10, cx, cy, 140); cg.addColorStop(0, "#2c3035"); cg.addColorStop(.7, "#141619"); cg.addColorStop(1, "#0e1012");
    x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, 138, 0, 6.283); x.fill(); x.lineWidth = 1.6; x.strokeStyle = "rgba(255,255,255,.3)"; x.stroke();
    // capa redonda girando
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 22; x.fillStyle = "#000"; x.beginPath(); x.arc(cx, cy - 68, 44, 0, 6.283); x.fill(); x.restore();
    x.save(); x.translate(cx, cy - 68); x.rotate(S.p ? tm * .8 : 0); x.beginPath(); x.arc(0, 0, 42, 0, 6.283); x.clip(); const im = cover(k); if (im) x.drawImage(im, -42, -42, 84, 84); x.restore();
    x.textAlign = "center"; x.fillStyle = "#eef3f5"; x.font = '700 19px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], 210), cx, cy - 2);
    const n = 22, pr = pr01();
    for (let i = 0; i < n; i++) { const h = 6 + 18 * (S.p ? beat(tm, i) : .25), bx = cx - 92 + i * (184 / (n - 1)); x.fillStyle = i < Math.round(pr * n) ? c.ne : "rgba(255,255,255,.28)"; rr(bx - 2.5, cy + 24 - h / 2, 5, h, 2.5); x.fill(); }
    const d = (typeof D !== "undefined" ? D : 0) || 0; x.fillStyle = "rgba(235,242,245,.85)"; x.font = '500 18px ui-monospace,Menlo,monospace'; x.fillText(mmss(S.t) + " / " + mmss(d), cx, cy + 74);
    x.textAlign = "left";
  };
  // Baralho de capas: ⟲10 e ⟳10 trocam a carta
  function card(c, k, cx, cy, w, h, rot, alpha, full) {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.globalAlpha = alpha;
    x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 24; x.shadowOffsetY = 12; x.fillStyle = "#1d2025"; rr(-w / 2, -h / 2, w, h, 22); x.fill(); x.shadowColor = "transparent";
    x.save(); rr(-w / 2, -h / 2, w, h, 22); x.clip(); const im = coverK(k); const ch = full ? h * .56 : h;
    if (im) x.drawImage(im, -w / 2, -h / 2, w, ch); else { x.fillStyle = c.ne; x.globalAlpha *= .3; x.fillRect(-w / 2, -h / 2, w, ch); x.globalAlpha = alpha; }
    if (full) { const fg = x.createLinearGradient(0, -h / 2 + ch * .7, 0, -h / 2 + ch); fg.addColorStop(0, "rgba(29,32,37,0)"); fg.addColorStop(1, "#1d2025"); x.fillStyle = fg; x.fillRect(-w / 2, -h / 2 + ch * .7, w, ch * .3 + 1); }
    else { x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(-w / 2, -h / 2, w, h); }
    x.restore();
    x.lineWidth = 1.5; x.strokeStyle = "rgba(255,255,255,.2)"; rr(-w / 2, -h / 2, w, h, 22); x.stroke();
    if (full) {
      const tt = T[k] || ["", ""], X0 = -w / 2 + 18, y = -h / 2 + ch + 6;
      x.fillStyle = "#fff"; x.font = '700 22px "Chakra Petch",sans-serif'; x.fillText(fit(tt[0], w - 36), X0, y + 18);
      x.fillStyle = "rgba(255,255,255,.7)"; x.font = '400 16px "Chakra Petch",sans-serif'; x.fillText(fit(tt[1] || "", w - 36), X0, y + 42);
      const pr = k === S.i ? pr01() : 1; x.fillStyle = "rgba(255,255,255,.16)"; rr(X0, y + 56, w - 36, 5, 2.5); x.fill();
      x.save(); x.shadowColor = c.ne; x.shadowBlur = 8; x.fillStyle = c.ne; rr(X0, y + 56, Math.max(5, (w - 36) * pr), 5, 2.5); x.fill(); x.restore();
      x.fillStyle = "rgba(10,12,15,.5)"; x.beginPath(); x.arc(w / 2 - 30, -h / 2 + 30, 18, 0, 6.283); x.fill(); icon("fv", w / 2 - 30, -h / 2 + 30, 20, c.ne);
      if (k === S.i) { const d = (typeof D !== "undefined" ? D : 0) || 0; x.fillStyle = "rgba(255,255,255,.75)"; x.font = '500 17px "Chakra Petch",sans-serif'; x.fillText(mmss(S.t), X0, y + 86); const e2 = mmss(d); x.fillText(e2, w / 2 - 18 - x.measureText(e2).width, y + 86); }
    }
    x.restore();
  }
  DRAW.baralho = function (c, k, t, tm) {
    const p = chg(tm), e = ease(p);
    x.fillStyle = TBG(c); x.fillRect(0, 0, W, H);
    const cx = W / 2, cy = 250, w = 270, h = 340;
    const n1 = (S.ql && S.ql[0] != null) ? S.ql[0] : stepI(k, 1), n2 = (S.ql && S.ql[1] != null) ? S.ql[1] : stepI(n1, 1);
    card(c, n2, cx + 18, cy + 10, w, h, .12, 1, false);
    card(c, n1, cx - 14, cy + 4, w, h, -.1, 1, false);
    // a nova carta sobe de trás
    if (p < 1) { const s = .94 + .06 * e; x.save(); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); card(c, k, cx - 14 * (1 - e), cy + 4 * (1 - e), w, h, -.1 * (1 - e), 1, true); x.restore(); }
    else card(c, k, cx, cy, w, h, 0, 1, true);
    // a carta antiga voa para o lado
    if (p < 1 && CH.from != null) { const sg = CH.dir === "l" ? -1 : 1; card(c, CH.from, cx + sg * e * 360, cy - e * 40, w, h, sg * e * .55, 1 - e * .9, true); }
    x.fillStyle = "rgba(235,242,245,.6)"; x.font = '400 16px "Chakra Petch",sans-serif'; x.textAlign = "center"; x.fillText("⟲10 / ⟳10 trocam a carta", cx, H - 22); x.textAlign = "left";
  };
  // Letras dançantes
  DRAW.letras = function (c, k, t, tm) {
    const p = chg(tm);
    x.fillStyle = "#0b0d10"; x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "rgba(255,255,255,.06)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // nome do artista enorme, só contorno, correndo no fundo
    x.font = '800 150px "Exo 2",sans-serif'; const bgT = (t[1] || "Paredão") + "   ", bw = x.measureText(bgT).width || 1, ox = -((tm * 40) % bw);
    x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 2; for (let X = ox; X < W; X += bw) x.strokeText(bgT, X, 200);
    const wr = wrap(t[0], 560, [78, 68, 58, 50, 42], '"Exo 2",sans-serif');
    let li = 0; const lh = wr.fs * 1.02, y0 = 170 - (wr.L.length - 1) * lh;
    let wi = 0;
    wr.L.forEach((l, r) => {
      let X = 40; const y = y0 + r * lh;
      [...l].forEach(ch => {
        if (ch === " ") { wi++; X += wr.fs * .28; return; }
        const i = li++, cw = x.measureText(ch).width;
        const ent = Math.max(0, Math.min(1, (p * .65 * 60 / 35 - i * .035) / .5)), dy0 = (1 - ease(ent)) * -40;
        const ph = ((tm / 2.4 + i * .046) % 1), jump = S.p && ph > .62 && ph < .9 ? Math.sin((ph - .62) / .28 * Math.PI) : 0;
        x.save(); x.translate(X + cw / 2, y + dy0 - jump * wr.fs * .2); x.rotate(-jump * .14 + (1 - ent) * -.4); x.globalAlpha = .2 + .8 * ent;
        const col = wi % 2 ? "#e3e8ec" : c.ne;
        x.fillStyle = wi % 2 ? "#7d8a94" : "rgba(0,0,0,.45)"; x.fillText(ch, -cw / 2, 5);
        x.save(); if (!(wi % 2)) { x.shadowColor = c.ne; x.shadowBlur = 14; } x.fillStyle = col; x.fillText(ch, -cw / 2, 0); x.restore();
        x.restore(); X += cw;
      });
      wi++;
    });
    x.fillStyle = "rgba(235,242,245,.82)"; x.font = '400 24px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", 420), 40, 286);
    for (let i = 0; i < 5; i++) { const hh = 8 + 30 * beat(tm, i); x.save(); x.shadowColor = c.ne; x.shadowBlur = 8; x.fillStyle = c.ne; rr(W - 120 + i * 14, 292 - hh, 8, hh, 3); x.fill(); x.restore(); }
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 10; x.fillStyle = c.ne; x.fillRect(0, H - 5, W * pr01(), 5); x.restore();
  };
  DRAW.toca = DRAW.vinil;
  // rodada 16: outros arquivos podem acrescentar estilos ao vídeo flutuante
  Object.assign(VP, { DRAW, DIMS, x, rr, fit, coverK, pal, TBG, pr01, mmss, SC });
  function draw() {
    const dm = DIMS[stg()] || [640, 360];
    if (dm[0] !== W || dm[1] !== H) { W = dm[0]; H = dm[1]; cv.width = W * SC; cv.height = H * SC; }
    x.setTransform(SC, 0, 0, SC, 0, 0);
    const now = performance.now(), dt = Math.min(.2, (now - last) / 1000); last = now;
    if (S.p) ang += dt * 3.5;
    const c = pal(), k = S.i, t = T[k] || ["Paredão Player", "", ""], f = DRAW[stg()] || DRAW.card;
    x.save(); try { f(c, k, t, now / 1000); } catch (e) { x.restore(); x.save(); DRAW.card(c, k, t, now / 1000); } x.restore();
  }

  function meta() {
    if (!("mediaSession" in navigator)) return;
    const t = T[S.i]; if (!t) return;
    const key = t[0] + "|" + t[1] + "|" + imgU;
    if (meta.k === key) return; meta.k = key;
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: t[0], artist: t[1], album: t[2] || "", artwork: imgU ? [{ src: imgU, sizes: "512x512" }] : [] }); } catch (e) {}
  }
  if ("mediaSession" in navigator) {
    const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) {} };
    h("play", () => { if (!S.p) tap("pp"); });
    h("pause", () => { if (S.p) tap("pp"); });
    h("previoustrack", () => tap("pv"));
    h("nexttrack", () => tap("nx"));
    // ⟲10 / ⟳10 da janelinha (iPhone mostra esses no lugar de anterior/próxima): trocam de música com a animação do estilo
    h("seekbackward", () => { window.PD_DIR_P = "r"; window.PD_DIR = "r"; S.t = 0; tap("pv"); });
    h("seekforward", () => { window.PD_DIR_P = "l"; window.PD_DIR = "l"; tap("nx"); });
    h("previoustrack", () => { window.PD_DIR_P = "r"; window.PD_DIR = "r"; tap("pv"); });
    h("nexttrack", () => { window.PD_DIR_P = "l"; window.PD_DIR = "l"; tap("nx"); });
  }

  let prepT = 0;
  function loop() {
    if (!VP.on && performance.now() - prepT > 4000) return; // só desenha enquanto a janelinha está aberta
    if (document.hidden && typeof frame === "function") { try { frame(performance.now()); } catch (e) {} }
    try { draw(); meta(); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = S.p ? "playing" : "paused"; } catch (e) {}
  }
  // prepara o "vídeo" no primeiro toque (o navegador exige um gesto)
  function prep() {
    if (!useV()) return;
    prepT = performance.now();
    if (VP.ready) return; VP.ready = true;
    draw();
    try { vd.srcObject = cv.captureStream(15); } catch (e) { VP.ready = false; return; }
    vd.play().catch(() => { VP.ready = false; });
    if (!tick) tick = setInterval(loop, 66);
  }
  document.addEventListener("pointerdown", prep, { capture: true, passive: true });

  vd.addEventListener("enterpictureinpicture", () => { VP.on = true; });
  vd.addEventListener("leavepictureinpicture", () => { VP.on = false; if (view === "p") setView("n"); });

  const _sv = setView;
  setView = function (v) {
    _sv(v);
    if (!useV()) return;
    if (v === "p" && !document.pictureInPictureElement) {
      prep(); loop();
      const go = () => vd.requestPictureInPicture().catch(e => { console.warn("vpip", e); say("O celular não abriu a janelinha; usando o pop-up dentro da página."); });
      if (vd.readyState >= 1) go(); else vd.addEventListener("loadedmetadata", go, { once: true });
    } else if (v !== "p" && document.pictureInPictureElement === vd) document.exitPictureInPicture().catch(() => {});
  };
})();

/* escolha do pop-up nas configurações (só aparece onde existem os dois tipos) */
(function () {
  if (!window.documentPictureInPicture || !document.pictureInPictureEnabled) return;
  const add = () => {
    const ref = document.getElementById("cfgstg"); if (!ref || document.getElementById("cfgpip")) return;
    const b = document.createElement("div"); b.id = "cfgpip";
    const draw = () => { const m = PIPMODE(); b.innerHTML = '<div class="tlab">Pop-up</div><div class="pipseg"><button type="button" data-pm="v" class="' + (m === "v" ? "on" : "") + '">Sem barra<small>como vídeo · botões do sistema</small></button><button type="button" data-pm="w" class="' + (m === "w" ? "on" : "") + '">Com botões<small>janela com a barra do Chrome</small></button></div>'; };
    draw();
    b.addEventListener("click", e => { const t = e.target.closest("[data-pm]"); if (!t) return; e.stopPropagation(); try { localStorage.setItem("pd_pipmode", t.dataset.pm); } catch (er) {} draw(); });
    ref.parentNode.insertBefore(b, ref.nextSibling);
  };
  add(); setTimeout(add, 1500);
})();

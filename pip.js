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
  const SIZE = { capsula: [380, 150], paredao: [440, 200], vinil: [460, 210], cassete: [430, 250], vfd: [480, 150], ingresso: [460, 210], ilha: [440, 140], aero: [540, 190], holo: [320, 330] };
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
    const z = Math.max(.4, Math.min(3, W / (r.width || 1), H / (r.height || 1)));
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
  const W = 640, H = 360, SC = 1.5; // desenha em 960x540 para ficar nítido se a janelinha crescer
  const cv = document.createElement("canvas"); cv.width = W * SC; cv.height = H * SC;
  const x = cv.getContext("2d");
  const vd = document.createElement("video");
  vd.muted = true; vd.playsInline = true; vd.setAttribute("playsinline", "");
  vd.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1";
  document.body.appendChild(vd);
  const VP = window.VPIP = { on: false, ready: false };
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
  DRAW.toca = DRAW.vinil;
  function draw() {
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

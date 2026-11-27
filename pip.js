/* Paredão Player — pop-up de verdade (Document Picture-in-Picture)
   Chrome/Edge 116+ no Windows/Mac/Linux: a janelinha fica por cima de outras abas e de outros programas.
   Onde não existe (Safari/iPhone, TV Samsung, Echo Show), o modo pop-up continua sendo o holograma dentro da página. */
(function () {
  const DPIP = window.documentPictureInPicture;
  const PIP = window.PIP = { win: null, ok: !!DPIP };
  const _sv = setView;
  let home = null, next = null, mo = null;

  const css = document.createElement("style");
  css.textContent = `body.pipon #stage.p .fk{display:none}
#pipnote{display:none}body.pipon #stage.p #pipnote{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:40vh;text-align:center;opacity:.8;padding:20px}
#pipnote button{font:inherit;padding:8px 16px;border-radius:99px;border:1px solid color-mix(in srgb,var(--a) 60%,transparent);background:color-mix(in srgb,var(--a) 14%,transparent);color:inherit;cursor:pointer}`;
  document.head.appendChild(css);
  const note = document.createElement("div");
  note.id = "pipnote";
  note.innerHTML = `<b>O player está na janelinha flutuante</b><span>Ela fica por cima das outras abas e programas. Pode trocar de aba à vontade.</span><button type="button" id="pipback">Trazer de volta</button>`;
  stage.appendChild(note);
  note.querySelector("#pipback").onclick = () => setView("n");

  const PIPCSS = `html,body{margin:0;height:100%;overflow:hidden;background:var(--bg)}
body{display:flex;align-items:center;justify-content:center}
#pop{display:block!important;position:static!important;zoom:1!important;width:100%!important;max-width:none;animation:none!important;--cs:min(60vw,46vh);left:auto!important;top:auto!important}
#pop .hg,#pop .cone{display:none}`;

  function syncTheme() {
    const w = PIP.win; if (!w) return;
    const de = w.document.documentElement;
    de.className = document.documentElement.className;
    de.setAttribute("style", document.documentElement.getAttribute("style") || "");
  }

  async function open() {
    const w = await DPIP.requestWindow({ width: 340, height: 480 });
    PIP.win = w;
    const d = w.document;
    const base = d.createElement("base"); base.href = location.href; d.head.appendChild(base);
    document.querySelectorAll("style,link[rel=stylesheet]").forEach(n => d.head.appendChild(n.cloneNode(true)));
    const st = d.createElement("style"); st.textContent = PIPCSS; d.head.appendChild(st);
    d.title = "Paredão Player";
    d.body.className = "p"; d.body.dataset.s = "pl";
    syncTheme();
    mo = new MutationObserver(syncTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    home = pop.parentNode; next = pop.nextSibling;
    pop.style.left = pop.style.top = ""; pop.style.right = "";
    d.body.appendChild(pop);
    document.body.classList.add("pipon");
    // botões da janelinha usam o mesmo tratador de cliques da página
    d.body.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      e.preventDefault();
      const px = document.createElement("button"); px.dataset.a = b.dataset.a; px.hidden = true;
      document.body.appendChild(px); px.click(); px.remove();
    });
    d.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); const px = document.createElement("button"); px.dataset.a = "pp"; px.hidden = true; document.body.appendChild(px); px.click(); px.remove(); } });
    // aba escondida: o navegador freia a animação da página; a janelinha continua desenhando
    (function loop() {
      if (PIP.win !== w) return;
      if (document.hidden) { try { frame(performance.now()); } catch (e) {} }
      w.requestAnimationFrame(loop);
    })();
    w.addEventListener("pagehide", () => {
      if (mo) mo.disconnect(); mo = null;
      if (home) home.insertBefore(pop, next && next.parentNode === home ? next : null);
      document.body.classList.remove("pipon");
      PIP.win = null;
      if (view === "p") _sv("n");
    });
  }

  setView = function (v) {
    _sv(v);
    if (!DPIP) return;
    if (v === "p" && !PIP.win) open().catch(e => { console.warn("pip", e); say("O navegador não abriu a janelinha; usando o pop-up dentro da página."); });
    else if (v !== "p" && PIP.win) PIP.win.close();
  };
  addEventListener("pagehide", () => { if (PIP.win) PIP.win.close(); });
})();

/* Paredão Player — pop-up no Android (e onde só existe picture-in-picture de vídeo)
   O mini player é desenhado num canvas, vira um "vídeo" e esse vídeo vai para a janelinha flutuante do sistema.
   Tocar/pausar/voltar/avançar aparecem como botões nativos da janelinha (Media Session). */
(function () {
  if (window.documentPictureInPicture || !document.pictureInPictureEnabled) return;
  const W = 640, H = 360;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
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

  function draw() {
    const k = S.i, t = T[k] || ["Paredão Player", "", ""];
    const bg = css("--bg") || "#0a0f1e", lt = document.documentElement.classList.contains("light"), ne = (lt ? css("--a") : css("--neon")) || css("--a") || "#1fd3f2", ink = lt ? "#10202a" : "#ffffff";
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(140, 60, 10, 140, 60, 520); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // contorno neon
    x.save(); x.shadowColor = ne; x.shadowBlur = 18; x.strokeStyle = ne; x.lineWidth = 3; rr(8, 8, W - 16, H - 16, 26); x.stroke(); x.restore();
    // capa
    const cs = 232, cx = 40, cy = (H - cs) / 2;
    x.save(); rr(cx, cy, cs, cs, 18); x.clip();
    const im = cover(k);
    if (im) x.drawImage(im, cx, cy, cs, cs); else { x.fillStyle = ne; x.globalAlpha = .25; x.fillRect(cx, cy, cs, cs); }
    x.restore();
    x.save(); x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.5; rr(cx, cy, cs, cs, 18); x.stroke(); x.restore();
    // textos
    const tx = cx + cs + 34, tw = W - tx - 40;
    x.fillStyle = ne; x.font = '600 17px "Chakra Petch",sans-serif'; x.fillText(S.p ? "TOCANDO AGORA" : "PAUSADO", tx, 92);
    x.fillStyle = ink; x.font = '700 36px "Chakra Petch",sans-serif'; x.fillText(fit(t[0], tw), tx, 140);
    x.globalAlpha = .72; x.font = '400 24px "Chakra Petch",sans-serif'; x.fillText(fit(t[1] || "", tw), tx, 176); x.globalAlpha = 1;
    // progresso
    const d = (typeof D !== "undefined" ? D : 0) || 0, p = d ? Math.min(1, S.t / d) : 0, by = 248;
    x.fillStyle = lt ? "rgba(16,32,42,.14)" : "rgba(255,255,255,.16)"; rr(tx, by, tw, 8, 4); x.fill();
    x.save(); x.shadowColor = ne; x.shadowBlur = 12; x.fillStyle = ne; rr(tx, by, Math.max(8, tw * p), 8, 4); x.fill(); x.restore();
    x.fillStyle = ink; x.globalAlpha = .7; x.font = '400 17px "Chakra Petch",sans-serif';
    x.fillText(mmss(S.t), tx, by + 34); const e = mmss(d); x.fillText(e, tx + tw - x.measureText(e).width, by + 34); x.globalAlpha = 1;
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

  function loop() {
    if (document.hidden && typeof frame === "function") { try { frame(performance.now()); } catch (e) {} }
    try { draw(); meta(); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = S.p ? "playing" : "paused"; } catch (e) {}
  }
  // prepara o "vídeo" no primeiro toque (o navegador exige um gesto)
  function prep() {
    if (VP.ready) return; VP.ready = true;
    draw();
    try { vd.srcObject = cv.captureStream(15); } catch (e) { VP.ready = false; return; }
    vd.play().catch(() => { VP.ready = false; });
    if (!tick) tick = setInterval(loop, 250);
  }
  document.addEventListener("pointerdown", prep, { capture: true, passive: true });

  vd.addEventListener("enterpictureinpicture", () => { VP.on = true; });
  vd.addEventListener("leavepictureinpicture", () => { VP.on = false; if (view === "p") setView("n"); });

  const _sv = setView;
  setView = function (v) {
    _sv(v);
    if (v === "p" && !document.pictureInPictureElement) {
      prep(); loop();
      const go = () => vd.requestPictureInPicture().catch(e => { console.warn("vpip", e); say("O celular não abriu a janelinha; usando o pop-up dentro da página."); });
      if (vd.readyState >= 1) go(); else vd.addEventListener("loadedmetadata", go, { once: true });
    } else if (v !== "p" && document.pictureInPictureElement === vd) document.exitPictureInPicture().catch(() => {});
  };
})();

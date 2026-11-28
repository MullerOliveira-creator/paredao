/* Paredão Player — rodada 17: correções que você achou ouvindo música
   1. Ponteiro do tempo: volta o contorno da primeira versão (bolinha de luz constante, rastro e faíscas),
      desenhado a cada quadro, contínuo em volta do cubo e começando no mesmo lugar de antes (meio de baixo).
   2. Limites: o mini player não sai da tela; a janelinha flutuante tem tamanho mínimo e não amontoa.
   3. Echo Show e telas de toque: os botões nunca ficam "mortos" (o modo sem-mouse travava os toques). */

/* ---------- 1. ponteiro do tempo em volta do cubo ---------- */
(function () {
  const vw = document.getElementById("vw"); if (!vw) return;
  const cv = document.createElement("canvas"); cv.id = "rgc"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const x = cv.getContext("2d");
  let RP = [], DB = [], lk = -1, HV = -1, dg = 0, last = performance.now(), box = null, key = "";
  const col = () => { try { return window.coverColor ? coverColor(S.i) : TC[S.i % TC.length]; } catch (e) { return "#1fd3f2"; } };
  const on = () => document.body.dataset.s === "pl" && (typeof view === "undefined" || view !== "p");
  // contorno arredondado que começa no meio de baixo e corre para a esquerda (como na primeira versão)
  function pts(x0, y0, x1, y1, r) {
    const cx = (x0 + x1) / 2, Q = [], ln = (ax, ay, bx, by) => { for (let i = 0; i < 30; i++) { const t = i / 30; Q.push([ax + (bx - ax) * t, ay + (by - ay) * t]); } }, ar = (X, Y, a) => { for (let i = 0; i < 12; i++) { const b = a + i / 12 * 1.5708; Q.push([X + r * Math.cos(b), Y + r * Math.sin(b)]); } };
    ln(cx, y1, x0 + r, y1); ar(x0 + r, y1 - r, 1.5708); ln(x0, y1 - r, x0, y0 + r); ar(x0 + r, y0 + r, 3.1416); ln(x0 + r, y0, x1 - r, y0); ar(x1 - r, y0 + r, 4.7124); ln(x1, y0 + r, x1, y1 - r); ar(x1 - r, y1 - r, 0); ln(x1 - r, y1, cx, y1);
    const cum = [0]; for (let i = 1; i <= Q.length; i++) { const a = Q[i - 1], b = Q[i % Q.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const M = 600, R = [], TT = cum[Q.length]; let j = 0;
    for (let k = 0; k < M; k++) { const d = k / M * TT; while (cum[j + 1] < d) j++; const a = Q[j], b = Q[(j + 1) % Q.length], u = (d - cum[j]) / (cum[j + 1] - cum[j] || 1); R.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
    return R;
  }
  // onde fica o contorno: em volta da face da frente parada (ou do holograma, quando ele existir)
  window.PD_RING = null; // outra rodada pode mandar o retângulo: () => DOMRect
  function target() {
    if (window.PD_RING) { const r = PD_RING(); if (r) return r; }
    const fs = [...document.querySelectorAll("#cu > .f")]; let fr = 0; try { fr = front(); } catch (e) {}
    const f = fs[fr]; if (!f) return null;
    const r = f.getBoundingClientRect(); if (!r.width) return null;
    return { left: r.left - 12, top: r.top - 12, right: r.right + 12, bottom: r.bottom + 12 };
  }
  function spark(h, s, A) { const g = Math.random() * 6.283, v = (6 + Math.random() * 16) * s; DB.push({ x: h[0], y: h[1], vx: Math.cos(g) * v, vy: Math.sin(g) * v, l: 1, c: Math.random() < .5 ? A : "#ffffff" }); }
  function draw() {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!on()) { if (cv._v) { x.clearRect(0, 0, cv.width, cv.height); cv._v = 0; } box = null; return; }
    const W = innerWidth, H = innerHeight, z = devicePixelRatio || 1;
    if (cv._W !== W || cv._H !== H || cv._z !== z) { cv._W = W; cv._H = H; cv._z = z; cv.width = Math.round(W * z); cv.height = Math.round(H * z); key = ""; }
    cv._v = 1;
    const t = target(); if (!t) return;
    // segue a face com suavidade (no giro do cubo o contorno não pula)
    const flip = typeof flipping !== "undefined" && flipping;
    if (!box) box = Object.assign({}, t); else if (!flip) for (const k of ["left", "top", "right", "bottom"]) box[k] += (t[k] - box[k]) * Math.min(1, dt * 9);
    const nk = [box.left, box.top, box.right, box.bottom].map(v => Math.round(v * 2)).join(",");
    if (nk !== key) { key = nk; const rad = Math.min(26, (box.right - box.left) / 6); RP = pts(box.left, box.top, box.right, box.bottom, rad); }
    const d = (typeof D !== "undefined" && D) || 1, M = RP.length, n = Math.max(0, Math.min(M - 1, Math.floor(S.t / d * M))), A = col();
    x.setTransform(z, 0, 0, z, 0, 0); x.clearRect(0, 0, W, H); x.lineCap = x.lineJoin = "round";
    x.strokeStyle = A + "30"; x.lineWidth = 3; x.beginPath(); RP.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke();
    x.strokeStyle = A; x.lineWidth = 3; x.shadowColor = A; x.shadowBlur = 7; x.beginPath(); for (let i = 0; i <= n; i++) i ? x.lineTo(RP[i][0], RP[i][1]) : x.moveTo(RP[0][0], RP[0][1]); x.stroke();
    const h = RP[n]; x.fillStyle = "#fff"; x.beginPath(); x.arc(h[0], h[1], 3.5, 0, 6.283); x.fill(); x.shadowBlur = 0;
    const k = S.i; if (k !== lk) { if (lk >= 0) for (let j = 0; j < 20; j++) spark(h, 2.6, A); lk = k; }
    if (S.p && Math.random() < .5) for (let j = 0; j < 2; j++) spark(h, 1.6, A);
    DB = DB.filter(p => p.l > 0); x.shadowColor = A; x.shadowBlur = 6;
    for (const p of DB) { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt * 1.6; x.globalAlpha = Math.max(0, p.l) * .95; x.fillStyle = p.c; x.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8); }
    x.shadowBlur = 0; x.globalAlpha = 1;
    if (HV >= 0 && RP[HV]) {
      const q = RP[HV], cx = (box.left + box.right) / 2, cy = (box.top + box.bottom) / 2, dx = q[0] - cx, dy = q[1] - cy, dd = Math.hypot(dx, dy) || 1, bx = q[0] + dx / dd * 28, by = q[1] + dy / dd * 28, s = (typeof tm === "function" ? tm(HV / M * d) : "");
      x.fillStyle = A; x.beginPath(); x.arc(q[0], q[1], 6, 0, 6.283); x.fill();
      x.font = "700 12px system-ui"; const tw = x.measureText(s).width + 14; x.fillStyle = "#000c"; x.fillRect(bx - tw / 2, by - 11, tw, 22); x.strokeStyle = A; x.lineWidth = 1; x.strokeRect(bx - tw / 2, by - 11, tw, 22); x.fillStyle = "#fff"; x.textAlign = "center"; x.fillText(s, bx, by + 4); x.textAlign = "left";
    }
  }
  (function loop() { try { draw(); } catch (e) {} requestAnimationFrame(loop); })();
  // arrastar a bolinha pelo contorno (como na primeira versão)
  function hit(e, any) { let b = 1e9, bi = -1; RP.forEach((p, i) => { const q = (p[0] - e.clientX) ** 2 + (p[1] - e.clientY) ** 2; if (q < b) { b = q; bi = i; } }); return any || b < 900 ? bi : -1; }
  const DUR = () => (typeof D !== "undefined" && D) || 1;
  document.addEventListener("pointerdown", e => { if (!on() || e.target.closest("button,input,a,.dm,#ctx,#cfg,.ctl")) return; const i = hit(e); if (i < 0) return; dg = 1; HV = i; S.t = i / RP.length * DUR(); e.stopImmediatePropagation(); e.preventDefault(); }, true);
  document.addEventListener("pointermove", e => { if (!on() || e.pointerType === "touch" && !dg) return; const i = hit(e, dg); HV = i; if (dg && i >= 0) { S.t = i / RP.length * DUR(); e.stopImmediatePropagation(); } }, true);
  const up = e => { if (dg) { if (window.SPOT && SPOT.on && SPOT.seek) SPOT.seek(S.t); dg = 0; e.stopImmediatePropagation(); } };
  document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
})();

/* ---------- 2a. o mini player não sai da tela (nem o desenho que passa da caixa) ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg) return;
  const M = 8;
  function keep() {
    if (!stg.classList.contains("on") || stg.classList.contains("inpip")) return;
    const r = stg.getBoundingClientRect(); if (!r.width) return;
    let L = r.left, T = r.top, R = r.right, B = r.bottom;
    stg.querySelectorAll(".sgx > *, .sgx > * > *").forEach(e => { const q = e.getBoundingClientRect(); if (!q.width) return; L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom); });
    let dx = 0, dy = 0;
    if (R - L > innerWidth - 2 * M) dx = M - L; else if (L < M) dx = M - L; else if (R > innerWidth - M) dx = innerWidth - M - R;
    if (B - T > innerHeight - 2 * M) dy = M - T; else if (T < M) dy = M - T; else if (B > innerHeight - M) dy = innerHeight - M - B;
    if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
    stg.style.right = stg.style.bottom = "auto";
    stg.style.left = (r.left + dx).toFixed(1) + "px"; stg.style.top = (r.top + dy).toFixed(1) + "px";
  }
  let dn = false;
  stg.addEventListener("pointerdown", () => { dn = true; }, true);
  addEventListener("pointerup", () => { if (dn) { dn = false; requestAnimationFrame(keep); setTimeout(keep, 450); } }, true);
  addEventListener("resize", () => setTimeout(keep, 120));
  addEventListener("orientationchange", () => setTimeout(keep, 400));
  setInterval(() => { if (!dn) keep(); }, 800);
})();

/* ---------- 2b. janelinha flutuante (Chrome/Edge): tamanho mínimo e nada amontoado ---------- */
(function () {
  const DP = window.documentPictureInPicture; if (!DP) return;
  const MINW = 240, MINH = 200;
  const stg = document.getElementById("stg");
  function fit2(w) {
    if (!stg || !stg.classList.contains("inpip")) return;
    const d = w.document, c = d.getElementById("pipc");
    const small = w.innerWidth < 300 || w.innerHeight < 260, tiny = w.innerWidth < MINW || w.innerHeight < MINH;
    d.body.classList.toggle("pipsm", small); d.body.classList.toggle("pipxs", tiny);
    const ch = c && getComputedStyle(c).display !== "none" ? c.offsetHeight + 16 : 0;
    stg.style.transform = "none";
    const r = stg.getBoundingClientRect(), W = w.innerWidth - 20, H = w.innerHeight - ch - 20;
    const z = Math.max(.2, Math.min(2, W / (r.width || 1), H / (r.height || 1)));
    stg.style.transform = `scale(${z})`;
  }
  function hook(w) {
    const st = w.document.createElement("style");
    st.textContent = `body.pipsm #pipc{gap:8px;padding:6px 10px!important}body.pipsm #pipc button{width:34px!important;height:34px!important}body.pipsm #pipc [data-a=pp]{width:40px!important;height:40px!important}body.pipsm #pipc [data-a=ex]{display:none}
body.pipxs #pipc{display:none!important}body.pipxs::after{content:"aumente a janelinha";position:fixed;left:0;right:0;bottom:6px;text-align:center;font:600 11px system-ui;color:rgba(255,255,255,.55)}
#pipw{overflow:hidden}`;
    w.document.head.appendChild(st);
    let raf = 0; const go = () => { cancelAnimationFrame(raf); raf = w.requestAnimationFrame(() => fit2(w)); };
    w.addEventListener("resize", () => {
      go();
      // o usuário encolheu demais: tenta voltar ao mínimo (o Chrome só deixa se houve toque na janelinha)
      if (w.innerWidth < MINW || w.innerHeight < MINH) try { w.resizeTo(Math.max(w.outerWidth, MINW + 20), Math.max(w.outerHeight, MINH + 40)); } catch (e) {}
    });
    // o mini player antigo mede de novo a cada 700 ms; logo depois, corrigimos com a altura real dos botões
    const t = setInterval(() => { if (w.closed) return clearInterval(t); fit2(w); }, 350);
    go();
  }
  const _rw = DP.requestWindow.bind(DP);
  DP.requestWindow = async function (o) {
    o = Object.assign({}, o); o.width = Math.max(o.width || 0, MINW + 20); o.height = Math.max(o.height || 0, MINH + 40);
    const w = await _rw(o);
    setTimeout(() => hook(w), 0);
    return w;
  };
})();

/* ---------- 3. telas de toque (Echo Show, iPhone, TV): os botões sempre respondem ---------- */
(function () {
  let touch = false;
  const wake = e => { if (e.pointerType && e.pointerType === "mouse") return; touch = true; document.body.classList.remove("nohover"); };
  document.addEventListener("pointerdown", wake, true);
  document.addEventListener("touchstart", wake, { capture: true, passive: true });
  // num aparelho de toque o "sem mouse" nunca liga (era ele que deixava os botões sem resposta)
  new MutationObserver(() => { if (touch && document.body.classList.contains("nohover")) document.body.classList.remove("nohover"); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const s = document.createElement("style");
  s.textContent = "@media (hover:none),(pointer:coarse){body.nohover #stage button,body.nohover .gbtn,body.nohover #wait button{pointer-events:auto!important}}";
  document.head.appendChild(s);
})();

/* ---------- 4. volume no atalho flutuante (janelinha do Chrome/Edge e app de Windows) ----------
   botão do alto-falante (toque = mudo) + barra com a porcentagem; a rodinha do mouse em cima do mini player também muda o volume */
(function () {
  const vi = document.getElementById("vi"); if (!vi) return;
  const get = () => +vi.value || 0;
  const set = v => { v = Math.max(0, Math.min(100, Math.round(v))); vi.value = v; vi.dispatchEvent(new Event("input", { bubbles: true })); vi.dispatchEvent(new Event("change", { bubbles: true })); };
  const mute = () => { const b = document.createElement("button"); b.dataset.a = "m"; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); };
  const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="w1" d="M15.5 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path class="w2" d="M18 6.8a7.4 7.4 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path class="mx" d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  const CSS = `.pvol{display:flex;align-items:center;gap:8px;padding:0 4px 0 2px}
.pvol input{-webkit-appearance:none;appearance:none;width:86px;height:6px;border-radius:4px;outline:0;cursor:pointer;background:linear-gradient(90deg,var(--neon,var(--a,#1fd3f2)) var(--v,50%),rgba(255,255,255,.18) var(--v,50%))}
.pvol input::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 0 8px var(--neon,var(--a,#1fd3f2))}
.pvol b{font:700 12px system-ui,sans-serif;min-width:34px;color:#fff;opacity:.85}
.pvol .mx{display:none}.pvol.mu .mx{display:block}.pvol.mu .w1,.pvol.mu .w2{display:none}.pvol.lo .w2{display:none}
body.pipsm .pvol input,body.pipsm .pvol b{display:none}`;
  function build(doc, host) {
    const st = doc.createElement("style"); st.textContent = CSS; doc.head.appendChild(st);
    const g = doc.createElement("span"); g.className = "pvol";
    g.innerHTML = `<button type="button" data-v="m" title="Volume (toque = mudo)">${SPK}</button><input type="range" min="0" max="100" aria-label="Volume"><b></b>`;
    host.appendChild(g);
    const r = g.querySelector("input"), b = g.querySelector("b");
    let lastMu = null;
    const upd = () => { const v = get(), mu = !!document.querySelector("#stage .vo.mu,#stage [data-a=m].on") || v === 0; if (doc.activeElement !== r) r.value = v; r.style.setProperty("--v", v + "%"); b.textContent = v + "%"; g.classList.toggle("mu", mu); g.classList.toggle("lo", v < 40); };
    r.addEventListener("input", e => { e.stopPropagation(); set(+r.value); upd(); });
    g.querySelector("[data-v=m]").addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); mute(); setTimeout(upd, 60); }, true);
    // não deixa o clique da barra virar "tocar/pausar" ou arrastar a janela
    ["pointerdown", "click"].forEach(t => g.addEventListener(t, e => e.stopPropagation()));
    upd(); return upd;
  }
  const wheel = e => { e.preventDefault(); set(get() + (e.deltaY < 0 ? 5 : -5)); };

  // janelinha do Chrome/Edge
  const DP = window.documentPictureInPicture;
  if (DP) {
    const _rw = DP.requestWindow.bind(DP);
    DP.requestWindow = async function (o) {
      o = Object.assign({}, o); o.width = Math.max(o.width || 0, 400);
      const w = await _rw(o);
      setTimeout(() => {
        const c = w.document.getElementById("pipc"); if (!c) return;
        const upd = build(w.document, c);
        const t = setInterval(() => { if (w.closed) return clearInterval(t); upd(); }, 400);
        w.addEventListener("wheel", wheel, { passive: false });
      }, 0);
      return w;
    };
  }
  // app de Windows (barrinha de cima do mini player)
  const tick = () => {
    const bar = document.getElementById("dtb"); if (!bar || bar.querySelector(".pvol")) return;
    const upd = build(document, bar); setInterval(upd, 400);
    const stg = document.getElementById("stg"); stg && stg.addEventListener("wheel", wheel, { passive: false });
  };
  tick(); setTimeout(tick, 1500);
})();

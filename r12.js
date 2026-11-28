/* Paredão Player — rodada 12
   barra de tempo em volta do play · cubo para em lados diferentes e congela quando você segura ·
   opacidade do vidro do cubo · número da fila · botões sem anel branco depois de clicar · menu do modo palco mais claro */
(function () {
  const $ = s => document.querySelector(s);
  const LSg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const LSs = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  /* ---------- 1. a "jornada do tempo" vai para um anel em volta do play ---------- */
  const rg = $("#rg"), tr = $("#stage .tr"), pp = tr && tr.querySelector("[data-a=pp]");
  const PAD = 46; // espaço para o ponto brilhante, as faíscas e a etiqueta do tempo
  if (rg && tr && pp && typeof ringPts === "function") {
    tr.classList.add("rgon"); tr.appendChild(rg);
    ringPts = function (w) {
      const R = w / 2 - PAD, c = w / 2, Q = [];
      for (let i = 0; i < 168; i++) { const a = -Math.PI / 2 + i / 168 * Math.PI * 2; Q.push([c + R * Math.cos(a), c + R * Math.sin(a)]); }
      return Q;
    };
    const place = () => {
      if (!pp.offsetWidth) return;
      let ox = 0, oy = 0, e = pp; while (e && e !== tr) { ox += e.offsetLeft; oy += e.offsetTop; e = e.offsetParent; if (e && e !== tr && !tr.contains(e)) { ox -= tr.offsetLeft; oy -= tr.offsetTop; break; } }
      const S = Math.round(pp.offsetWidth + 14 + PAD * 2);
      Object.assign(rg.style, { left: (ox + pp.offsetWidth / 2 - S / 2) + "px", top: (oy + pp.offsetHeight / 2 - S / 2) + "px", width: S + "px", height: S + "px" });
      if (rg._s !== S) { rg._s = S; rg._w = 0; }
    };
    place(); addEventListener("resize", place); setInterval(place, 800);
    // arrastar no anel = escolher o ponto da música
    const geo = e => { const r = rg.getBoundingClientRect(), k = rg.clientWidth / r.width, X = (e.clientX - r.left) * k - rg.clientWidth / 2, Y = (e.clientY - r.top) * k - rg.clientWidth / 2;
      const R = rg.clientWidth / 2 - PAD, d = Math.hypot(X, Y); let a = Math.atan2(Y, X) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
      return { near: Math.abs(d - R) < 13, i: Math.min(167, Math.floor(a / (Math.PI * 2) * 168)) }; };
    let sk = 0;
    tr.addEventListener("pointerdown", e => { const g = geo(e); if (!g.near) return; sk = 1; dg = 1; HV = g.i; S.t = g.i / 168 * D; try { tr.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); e.stopPropagation(); }, true);
    tr.addEventListener("pointermove", e => { const g = geo(e); if (sk) { HV = g.i; S.t = g.i / 168 * D; } else HV = g.near ? g.i : -1; });
    const up = () => { if (!sk) return; sk = 0; dg = 0; tr._sk = 1; setTimeout(() => tr._sk = 0, 80); if (window.SPOT && SPOT.on) SPOT.seek(S.t); };
    tr.addEventListener("pointerup", up); tr.addEventListener("pointercancel", up);
    tr.addEventListener("pointerleave", () => { if (!sk) HV = -1; });
    tr.addEventListener("click", e => { if (tr._sk) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  /* ---------- 2. cubo: para virado para a esquerda ou para a direita, e congela quando você segura ---------- */
  const cu = $("#cu"), vw = $("#vw");
  if (cu && window.goFace) {
    const _go = goFace;
    window.goFace = function (f, ax, ay) {
      _go(f, ax, ay);
      cu.style.setProperty("--sd", Math.random() < .5 ? -1 : 1);
      cu.style.setProperty("--tl", (18 + Math.random() * 10).toFixed(1) + "deg");
    };
    cu.style.setProperty("--sd", 1);
  }
  if (vw) {
    let ht = 0;
    vw.addEventListener("pointerdown", e => { if (e.target.closest("button,input,a")) return; clearTimeout(ht); ht = setTimeout(() => document.body.classList.add("cuhold"), 180); });
    const rel = () => { clearTimeout(ht); document.body.classList.remove("cuhold"); };
    ["pointerup", "pointercancel"].forEach(ev => addEventListener(ev, rel));
  }

  /* ---------- 3. opacidade do vidro do cubo ---------- */
  const setCop = v => document.documentElement.style.setProperty("--cop", v);
  setCop(LSg("pd_cop", ".55"));

  /* ---------- 4. número da fila: só o que você pôs, na cor do tema ---------- */
  const mine = new Set();
  const hook = () => {
    if (!window.SPOT || !SPOT.addReal || SPOT.addReal._r12) return;
    const _a = SPOT.addReal; SPOT.addReal = function (k) { try { const m = window.SP && SP[k]; if (m && m.uri) mine.add(m.uri); } catch (e) {} return _a.apply(this, arguments); }; SPOT.addReal._r12 = 1;
  };
  hook(); setTimeout(hook, 2000);
  setInterval(() => {
    const em = $("#em"); if (!em) return;
    let n = S.ql.length;
    if (window.SPOT && SPOT.on && SPOT.realQ) n = S.ql.filter(k => { const m = window.SP && SP[k]; return m && mine.has(m.uri); }).length;
    const t = n > 99 ? "99+" : String(n); if (em.textContent !== t) em.textContent = t;
    em.classList.toggle("z", !n);
  }, 500);

  /* ---------- 5. botão clicado não fica com anel branco (aparecia ao apertar F11) ---------- */
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("button"); if (b && e.detail) setTimeout(() => { if (document.activeElement === b) b.blur(); }, 0); }, true);

  /* ---------- 6. menu do modo palco: tudo num bloco só, com explicação ---------- */
  function menu() {
    const st = $("#cfgstg"); if (!st) return;
    const lab = st.querySelector(".tlab");
    if (lab && !lab._r12) { lab._r12 = 1; }
    if (!$("#cfgpalh")) {
      const h = document.createElement("div"); h.id = "cfgpalh";
      h.innerHTML = '<b>Modo palco</b><span>É o mini player que fica flutuando quando você sai da tela do player. Aqui você escolhe o desenho dele, se ele tem fundo e como fica a janelinha por cima de outros programas.</span>';
      st.parentNode.insertBefore(h, st);
    }
    // ordem: estilo → fundo na página → janelinha → vidro do cubo
    const tr_ = $("#cfgtr"), pip = $("#cfgpip");
    if (tr_ && tr_.previousElementSibling !== st) st.parentNode.insertBefore(tr_, st.nextSibling);
    if (pip && tr_ && pip.previousElementSibling !== tr_) tr_.parentNode.insertBefore(pip, tr_.nextSibling);
    const t1 = tr_ && tr_.querySelector(".tlab"); if (t1 && !t1._r) { t1._r = 1; t1.innerHTML = "<b>2.</b> Fundo do mini player na página"; }
    const t2 = pip && pip.querySelector(".tlab"); if (t2) t2.innerHTML = "<b>3.</b> Janelinha por cima de outros programas <small>(botão pop-up)</small>";
    if (pip && !pip._r12) {
      pip._r12 = 1;
      const fix = () => { const a = pip.querySelector("[data-pm=v]"), b = pip.querySelector("[data-pm=w]");
        if (a && !a._r) { a._r = 1; a.innerHTML = 'Vídeo<small>sem barra · os controles são os do sistema</small>'; }
        if (b && !b._r) { b._r = 1; b.innerHTML = 'Janela do Chrome<small>com a barra do Chrome · controles do Paredão</small>'; }
        const t = pip.querySelector(".tlab"); if (t && !/Janelinha/.test(t.textContent)) t.innerHTML = "<b>3.</b> Janelinha por cima de outros programas <small>(botão pop-up)</small>"; };
      fix(); new MutationObserver(fix).observe(pip, { childList: true, subtree: true });
    }
    const sl = st.querySelector(".tlab"); if (sl && !/^1\./.test(sl.textContent)) sl.innerHTML = sl.innerHTML.replace(/^Modo palco \(mini player\) · /, "<b>1.</b> Estilo · ");
    if (!$("#cfgcop")) {
      const c = document.createElement("div"); c.id = "cfgcop";
      c.innerHTML = '<div class="tlab"><b>4.</b> Vidro do cubo do player</div><div class="cops"><small>transparente</small><input id="copr" type="range" min="0" max="100" step="5" aria-label="Opacidade do vidro do cubo"><small>opaco</small></div>';
      const after = pip || tr_ || st; after.parentNode.insertBefore(c, after.nextSibling);
      const r = c.querySelector("input"); r.value = Math.round(+LSg("pd_cop", ".55") * 100);
      r.addEventListener("input", () => { const v = (r.value / 100).toFixed(2); LSs("pd_cop", v); setCop(v); });
    }
  }
  menu(); setInterval(menu, 1500);
  // a etiqueta "1." some quando o nome do estilo é redesenhado: observar o bloco
  const st = $("#cfgstg"); if (st) new MutationObserver(() => { const sl = st.querySelector(".tlab"); if (sl && /^Modo palco/.test(sl.textContent)) sl.innerHTML = sl.innerHTML.replace(/^Modo palco \(mini player\) · /, "<b>1.</b> Estilo · "); }).observe(st, { childList: true });

  /* ---------- 7. número do volume em cima da bolinha que se arrasta ---------- */
  const vi = $("#vi"), vpc = $("#vpc");
  if (vi && vpc) {
    const pos = () => { if (!vi.offsetWidth) return; const th = 20, f = Math.max(0, Math.min(1, vi.value / 100));
      vpc.style.left = (vi.offsetLeft + th / 2 + f * (vi.offsetWidth - th)) + "px"; };
    vi.addEventListener("input", pos); setInterval(pos, 300); pos();
  }
  /* ---------- 8. letra grande: quanto menor a frase, maior a letra ---------- */
  const big = $("#bigly");
  if (big) {
    const sz = () => { const h = big.querySelector("h2"); if (!h) return; const n = h.textContent.trim().length;
      const v = n <= 18 ? [15, 26] : n <= 28 ? [13, 22] : n <= 40 ? [10.8, 18.5] : n <= 60 ? [9, 15] : [7.4, 12]; // letra larga, quase de ponta a ponta
      big.style.setProperty("--lw", v[0] + "vw"); big.style.setProperty("--lh", v[1] + "vh"); };
    new MutationObserver(sz).observe(big, { childList: true, subtree: true, characterData: true }); sz();
  }
})();

/* Paredão · rodada 7: modo leve automático e cubo que acompanha o dedo/mouse */
(function () {
  const de = document.documentElement, ua = navigator.userAgent;
  /* ---------- modo leve: TV, Echo Show e aparelhos fracos ---------- */
  const weak = /Tizen|SMART-TV|SmartTV|Web0S|WebOS|HbbTV|BRAVIA|AFT[A-Z]|CrKey|Silk|Echo/i.test(ua) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 3);
  let lite = weak; try { const v = localStorage.getItem("pd_lite"); if (v === "1") lite = true; if (v === "0") lite = false; } catch (e) {}
  de.classList.toggle("lite", !!lite);
  window.LITE = { on: () => de.classList.contains("lite"), set: v => { de.classList.toggle("lite", !!v); try { localStorage.setItem("pd_lite", v ? "1" : "0"); } catch (e) {} } };

  /* ---------- arrastar o cubo: gira junto com o dedo e encaixa ao soltar ---------- */
  // tira os gestos antigos (giravam só ao soltar e às vezes giravam duas vezes)
  const st = document.getElementById("st"), rst = document.getElementById("rst");
  if (st) { st.onpointerdown = null; st.onpointerup = null; }
  if (rst) { rst.onpointerup = null; }

  function scrollable(t, dy) {
    const el = t && t.closest && t.closest(".xf,#ql,#kf,.f .ls");
    if (!el || el.scrollHeight <= el.clientHeight + 2) return null;
    return el;
  }
  function dragger(area, opts) {
    let g = null;
    area.addEventListener("pointerdown", e => {
      if (e.button || opts.busy()) return;
      if (e.target.closest("button,input,a,[data-a],.wnav,#rgo,.ac")) return;
      g = { x: e.clientX, y: e.clientY, ax: 0, lx: e.clientX, ly: e.clientY, t: performance.now(), v: 0, axis: 0, id: e.pointerId, sc: scrollable(e.target), moved: 0 };
    });
    area.addEventListener("pointermove", e => {
      if (!g || e.pointerId !== g.id) return;
      const dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (!g.axis) {
        if (Math.hypot(dx, dy) < 9) return;
        g.axis = Math.abs(dx) > Math.abs(dy) ? "y" : "x";
        // arrasto vertical numa face com rolagem: rola a face em vez de girar (até chegar na ponta)
        if (g.axis === "x" && g.sc) { const el = g.sc, down = dy < 0; const can = down ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0; if (can) g.axis = "s"; }
        try { area.setPointerCapture(e.pointerId); } catch (er) {}
        if (g.axis !== "s") opts.start();
      }
      g.moved = 1;
      const now = performance.now();
      if (g.axis === "s") { g.sc.scrollTop -= e.clientY - g.ly; }
      else {
        const sz = opts.size() || 300, sens = 90 / (sz * .75);
        const d = g.axis === "y" ? dx : -dy;
        g.ax = Math.max(-100, Math.min(100, d * sens));
        g.v = ((g.axis === "y" ? e.clientX - g.lx : -(e.clientY - g.ly)) * sens) / Math.max(1, now - g.t) * 1000;
        opts.move(g.axis, g.ax);
      }
      g.lx = e.clientX; g.ly = e.clientY; g.t = now;
      e.preventDefault();
    });
    const end = e => {
      if (!g || (e && e.pointerId !== g.id)) return;
      const r = g; g = null;
      if (!r.axis || r.axis === "s") { if (r.moved) swallow(); return; }
      swallow();
      const go = Math.abs(r.ax) > 28 || (Math.abs(r.v) > 260 && Math.abs(r.ax) > 8);
      const dir = go ? (Math.abs(r.ax) > 8 ? Math.sign(r.ax) : Math.sign(r.v)) : 0;
      opts.end(r.axis, dir);
    };
    area.addEventListener("pointerup", end);
    area.addEventListener("pointercancel", e => { if (g && g.axis && g.axis !== "s") { g = null; opts.end("y", 0); } else g = null; });
  }
  // depois de arrastar, o clique que vem junto não deve abrir nada
  function swallow() {
    const h = e => { e.stopPropagation(); e.preventDefault(); };
    document.addEventListener("click", h, { capture: true, once: true });
    setTimeout(() => document.removeEventListener("click", h, { capture: true }), 60);
  }
  const rot = (axis, a) => axis === "y" ? new DOMMatrix().rotate(0, a, 0) : new DOMMatrix().rotate(a, 0, 0);

  // cubo do player
  const vw = document.getElementById("vw"), cu = document.getElementById("cu");
  if (vw && cu) {
    let base = "";
    dragger(vw, {
      busy: () => (typeof dg !== "undefined" && dg) || (typeof flipping !== "undefined" && flipping) || view === "p",
      size: () => cu.getBoundingClientRect().width,
      start: () => { cu.getAnimations().forEach(a => a.cancel()); base = M.toString(); cu.style.transition = "none"; },
      move: (axis, a) => { cu.style.transform = rot(axis, a).multiply(M).toString(); },
      end: (axis, dir) => {
        cu.style.transition = "";
        if (dir) { if (axis === "y") turn(0, dir * 90); else turn(dir * 90, 0); }
        else { const cur = cu.style.transform; cu.animate([{ transform: cur }, { transform: M.toString() }], { duration: 260, easing: "cubic-bezier(.3,1.3,.5,1)" }); cu.style.transform = M.toString(); }
      }
    });
  }
  // cubo da tela de espera
  const rcu = document.getElementById("rcu");
  if (rst && rcu) {
    dragger(rst, {
      busy: () => (typeof rolling !== "undefined" && rolling),
      size: () => rcu.getBoundingClientRect().width,
      start: () => { rcu.style.transition = "none"; if (typeof rLast !== "undefined") rLast = Date.now(); },
      move: (axis, a) => { rcu.style.transform = rot(axis, a).multiply(RM).toString(); },
      end: (axis, dir) => {
        rcu.offsetWidth; rcu.style.transition = "";
        try { rLast = Date.now(); } catch (e) {}
        if (dir) { if (axis === "y") rTurn(0, dir * 90); else rTurn(dir * 90, 0); }
        else rcu.style.transform = RM.toString();
      }
    });
  }
})();

/* ---------- Hora do Show: a bolinha que corre na elipse vai para uma camada própria ----------
   (antes ela fazia o navegador redesenhar o logo inteiro, com o brilho, a cada quadro) */
(function () {
  document.querySelectorAll("svg.hs").forEach(h => {
    const an = h.querySelector("animateMotion,animate,animateTransform"); if (!an) return;
    const g = an.parentElement;
    const w = document.createElement("span"); w.className = "hsw";
    h.parentNode.insertBefore(w, h); w.appendChild(h);
    const o = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    o.setAttribute("viewBox", h.getAttribute("viewBox")); o.setAttribute("class", "hsdot"); o.setAttribute("aria-hidden", "true");
    o.appendChild(g); w.appendChild(o);
  });
})();

/* ---------- faixa de dispositivos: quantos cabem lado a lado (até 6) ---------- */
(function () {
  const dm = document.getElementById("dm"); if (!dm) return;
  function cols() {
    const n = dm.querySelectorAll(":scope>div").length || 1;
    const k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--k")) || 1;
    const z = parseFloat(getComputedStyle(dm).zoom) || 1;
    const avail = innerWidth / (k * z) - 48, fit = Math.max(2, Math.floor((avail + 8) / 132));
    dm.style.setProperty("--dc", Math.min(n, 6, fit));
    document.body.classList.toggle("dmon", dm.classList.contains("on"));
  }
  new MutationObserver(cols).observe(dm, { childList: true, attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", cols); cols();
})();

/* ---------- rodada 8: dado D1 no shuffle e Salvar com disquete (S2) ---------- */
(function () {
  // D2 · dois dados rolando (mesmo degradê da casinha)
  const dots = (pts, r) => pts.map(([x, y]) => `<circle class="p" cx="${x}" cy="${y}" r="${r}"/>`).join("");
  const D1 = '<svg class="d2" viewBox="0 0 100 100" aria-hidden="true">' +
    '<g transform="rotate(-14 36 58)"><rect x="12" y="34" width="46" height="46" rx="11" fill="url(#r5g)"/>' + dots([[24, 46], [46, 46], [35, 57], [24, 68], [46, 68]], 4.6) + '</g>' +
    '<g transform="rotate(16 70 36)"><rect class="b" x="50" y="14" width="40" height="40" rx="10" fill="url(#r5g)"/>' + dots([[60, 24], [70, 34], [80, 44]], 4.2) + '</g></svg>';
  const sh = document.getElementById("shuf"); if (sh) sh.innerHTML = D1;
  const S2 = '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="url(#r5g)" fill-rule="evenodd" d="M16 10h56l14 14v62a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4zM30 12v24h38V12zM56 16h7v16h-7zM24 54v32h52V54z"/><path d="M36 70l9 9 19-19" fill="none" stroke="url(#r5g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function save() {
    const b = document.getElementById("cfgok"); if (!b || b.classList.contains("svd")) return;
    b.classList.add("svd"); b.innerHTML = S2; b.title = "Salvar"; b.setAttribute("aria-label", "Salvar");
    b.addEventListener("click", () => { b.classList.add("ok"); setTimeout(() => b.classList.remove("ok"), 900); });
  }
  save(); setTimeout(save, 1200);
  // se algum código antigo devolver o texto ao botão, volta o disquete
  const b = document.getElementById("cfgok");
  if (b) new MutationObserver(() => { if (!b.querySelector("svg")) { b.classList.remove("svd"); save(); } }).observe(b, { childList: true, characterData: true, subtree: true });
})();

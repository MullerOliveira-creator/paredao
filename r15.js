/* Paredão Player — rodada 15: cores simples
   Duas bolas de cor (Fundo e Neon), cada uma abre o seletor de cor do aparelho, e uma barra só de brilho do neon.
   Embaixo, combinações prontas para um toque. */
(function () {
  const pal = document.getElementById("cfgpal"); if (!pal || !window.THEME) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";");
  const T0 = () => THEME.get();
  const cur = () => { const t = T0(); const o = { bg: typeof t.bgx === "string" ? t.bgx : THEME.BGS[t.m][t.bg][1], ne: typeof t.ne === "string" ? t.ne : THEME.NEONS[t.ne][1] }; return o; };
  const PRE = [["#06121a", "#1fd3f2"], ["#0b100d", "#3dff7a"], ["#120a1c", "#ff4fd8"], ["#0d0d10", "#ffb23f"], ["#eef3f6", "#0a8fb0"], ["#f4efe8", "#d1495b"]];
  let raf = 0, pend = {};
  const set = o => { Object.assign(pend, o); cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const x = pend; pend = {}; THEME.set(x); }); };
  window.drawTheme = function () {
    const c = cur(), t = T0(), nb = Math.round((t.nb || 0) * 100);
    // já montado: só atualiza as cores no lugar. Recriar as bolas fecha o seletor de cor do iPhone no meio da escolha.
    if (pal.querySelector(".c15")) {
      pal.querySelectorAll(".cball input").forEach(i => { const v = i.dataset.k === "bg" ? c.bg : c.ne; i.nextElementSibling.style.background = v; if (document.activeElement !== i && i.value.toLowerCase() !== v.toLowerCase()) try { i.value = v; } catch (e) {} });
      const r = pal.querySelector("#nbr"); if (r && document.activeElement !== r && !r.dataset.drag) r.value = nb;
      return;
    }
    pal.className = "cfg15";
    pal.innerHTML =
      `<div class="c15">` +
      `<label class="cball"><input type="color" data-k="bg" value="${esc(c.bg)}" aria-label="Cor do fundo"><i style="background:${esc(c.bg)}"></i><b>Fundo</b><small>a cor de trás</small></label>` +
      `<label class="cball"><input type="color" data-k="ne" value="${esc(THEME.NEONS[t.ne] ? THEME.NEONS[t.ne][1] : t.ne)}" aria-label="Cor do neon"><i style="background:${esc(c.ne)}"></i><b>Neon</b><small>brilhos, bordas e destaques</small></label>` +
      `</div><div class="tlab">Brilho do neon</div><div class="c15b"><small>mais escuro</small><input type="range" id="nbr" min="-40" max="40" step="1" value="${nb}" aria-label="Brilho do neon"><small>mais claro</small></div>` +
      `<div class="tlab">Combinações prontas</div><div class="c15p">` + PRE.map(([b, n], j) => `<button type="button" data-pr="${j}" title="Fundo ${b} · Neon ${n}" style="--b:${b};--n:${n}"><i></i></button>`).join("") + `</div>`;
    const h = pal.previousElementSibling; if (h && h.tagName === "H4") h.textContent = "Cores";
  };
  // enquanto o dedo arrasta a barra de brilho, ninguém mexe no valor dela (no iPhone a barra não fica "focada")
  pal.addEventListener("pointerdown", e => { if (e.target.id === "nbr") e.target.dataset.drag = 1; }, true);
  pal.addEventListener("touchstart", e => { if (e.target.id === "nbr") e.target.dataset.drag = 1; }, { capture: true, passive: true });
  const undrag = () => { const r = pal.querySelector("#nbr"); if (r) setTimeout(() => delete r.dataset.drag, 400); };
  ["pointerup", "pointercancel", "touchend", "touchcancel", "change"].forEach(t => document.addEventListener(t, undrag, true));
  pal.addEventListener("input", e => {
    const el = e.target; e.stopPropagation();
    if (el.dataset.k === "bg") { el.nextElementSibling.style.background = el.value; set({ bgx: el.value }); }
    else if (el.dataset.k === "ne") { el.nextElementSibling.style.background = el.value; set({ ne: el.value }); }
    else if (el.id === "nbr") set({ nb: +el.value / 100 });
  }, true);
  pal.addEventListener("click", e => {
    const b = e.target.closest("[data-pr]"); if (!b) return; e.stopImmediatePropagation(); e.preventDefault();
    const [bg, ne] = PRE[+b.dataset.pr]; THEME.set({ bgx: bg, ne, nb: 0 });
  }, true);
  // enquanto o seletor de cor está aberto, tocar fora não fecha as Configurações
  let picking = 0;
  pal.addEventListener("click", e => { if (e.target.closest(".cball input")) picking = Date.now(); }, true);
  pal.addEventListener("change", () => { picking = Date.now(); }, true);
  document.addEventListener("pointerdown", e => { if (picking && Date.now() - picking < 60000 && !e.target.closest("#cfgb")) { const p = document.querySelector("#cfg .cfgp"); if (p && !p.contains(e.target)) { e.stopImmediatePropagation(); picking = 0; } } }, true);
  const w = document.getElementById("cwh"); if (w) w.style.display = "none";
  setTimeout(() => { const w2 = document.getElementById("cwh"); if (w2) w2.style.display = "none"; }, 1500);
  drawTheme();
})();

/* barras: a parte cheia acompanha o valor (igual ao volume) */
(function () {
  const fill = el => { const mn = +el.min || 0, mx = +el.max || 100, v = ((+el.value - mn) / (mx - mn)) * 100; el.style.setProperty("--v", (isFinite(v) ? v : 50).toFixed(1) + "%"); };
  document.addEventListener("input", e => { if (e.target.type === "range" && e.target.id !== "vi") fill(e.target); }, true);
  setInterval(() => document.querySelectorAll('input[type=range]:not(#vi)').forEach(fill), 700);
})();

/* engrenagem abre e fecha as Configurações (clicar fora e no × também fecham) */
(function () {
  const cfg = document.getElementById("cfg"); if (!cfg) return;
  document.addEventListener("click", e => {
    if (!e.target.closest || !e.target.closest("#cfgb")) return;
    if (cfg.classList.contains("on")) { e.stopImmediatePropagation(); e.preventDefault(); cfg.classList.remove("on"); }
  }, true);
})();

/* tela de espera: a música de uma face só troca quando essa face está escondida.
   Antes, a face que já aparecia de lado trocava de música bem na hora em que virava para a frente. */
(function () {
  if (typeof feedFace !== "function" || typeof FN === "undefined") return;
  const inner = feedFace; let tmr = 0, mine = false;
  const hidden = () => FN.map((n, j) => RM.transformPoint(new DOMPoint(n[0], n[1], n[2], 0)).z < -.3 ? j : -1).filter(j => j >= 0);
  feedFace = function (f) {
    if (mine) return inner(f);
    // chamada no meio do giro: não mexe na face que está chegando; depois que o giro termina, renova só as escondidas
    clearTimeout(tmr);
    tmr = setTimeout(() => { mine = true; try { hidden().forEach(j => inner(j)); } finally { mine = false; } }, 1100);
  };
})();

/* barra de tempo no contorno do cubo: a borda de todas as faces vai se enchendo com a música,
   então de qualquer lado que o cubo vire, a aresta mostra quanto já tocou */
(function () {
  const faces = [...document.querySelectorAll("#cu > .f")]; if (!faces.length) return;
  const NS = "http://www.w3.org/2000/svg";
  const rects = faces.map(f => {
    const s = document.createElementNS(NS, "svg"); s.setAttribute("class", "edgep"); s.setAttribute("aria-hidden", "true");
    const bg = document.createElementNS(NS, "rect"); bg.setAttribute("class", "eb"); bg.setAttribute("pathLength", "100");
    const r = document.createElementNS(NS, "rect"); r.setAttribute("class", "ef"); r.setAttribute("pathLength", "100");
    const hd = document.createElementNS(NS, "rect"); hd.setAttribute("class", "eh"); hd.setAttribute("pathLength", "100");
    const tr = [];
    for (let i = 1; i <= 7; i++) { const t = document.createElementNS(NS, "rect"); t.setAttribute("class", "et"); t.setAttribute("pathLength", "100"); t.style.setProperty("--i", i); tr.push(t); }
    s.appendChild(bg); s.appendChild(r); tr.slice().reverse().forEach(t => s.appendChild(t)); s.appendChild(hd); f.appendChild(s); return [r, hd, tr];
  });
  let q0 = 12.5; // onde a barra começa: no meio da aresta de cima
  // tamanho do contorno em pixels (o navegador não aceita o retângulo em %)
  let sz = "", last = -1;
  const geo = () => {
    const w = faces[0].offsetWidth, h = faces[0].offsetHeight, k = w + "x" + h; if (!w || k === sz) return; sz = k;
    const rad = Math.max(4, parseFloat(getComputedStyle(faces[0]).borderTopLeftRadius) || w * .06) - 2;
    faces.forEach(f => f.querySelectorAll(".edgep rect").forEach(r => { r.setAttribute("x", 2); r.setAttribute("y", 2); r.setAttribute("width", f.offsetWidth - 4); r.setAttribute("height", f.offsetHeight - 4); r.setAttribute("rx", rad); }));
    faces.forEach(f => { const s = f.querySelector(".edgep"); s.setAttribute("viewBox", `0 0 ${f.offsetWidth} ${f.offsetHeight}`); });
    q0 = (w / 2 - rad) / (2 * (w + h) - 8 * rad + 2 * Math.PI * rad) * 100; last = -1;
  };
  geo(); addEventListener("resize", () => setTimeout(geo, 200)); setInterval(geo, 1500);
  // a barra corre só na face que está de frente (numa aresta dividida por duas faces, não aparecem duas barras)
  setInterval(() => { let fr = 0; try { fr = typeof front === "function" ? front() : 0; } catch (e) {} faces.forEach((f, i) => f.classList.toggle("efon", i === fr)); }, 200);
  setInterval(() => {
    const d = (typeof D !== "undefined" ? D : 0) || 0, p = d ? Math.max(0, Math.min(1, S.t / d)) * 100 : 0;
    if (Math.abs(p - last) < .05) return; last = p;
    const v = p.toFixed(2) + " " + (100 - p + .01).toFixed(2), off = (-q0).toFixed(2);
    const hp = p, hv = ".01 99.99", ho = (-(q0 + hp)).toFixed(2);
    rects.forEach(([r, hd, tr]) => {
      r.style.strokeDasharray = v; r.style.strokeDashoffset = off; hd.style.strokeDasharray = hv; hd.style.strokeDashoffset = ho;
      // rastro de partículas atrás da bolinha
      tr.forEach((t, i) => { const q = p - (i + 1) * .55; t.style.strokeDasharray = ".01 99.99"; t.style.strokeDashoffset = (-(q0 + q)).toFixed(2); t.style.visibility = q > 0 ? "visible" : "hidden"; });
    });
  }, 150);
})();

/* cubo do player: um gesto = uma face. A rolagem do touchpad continua mandando sinais depois que você solta
   (inércia), e isso fazia o cubo pular 2 ou 3 faces. Agora só o começo do gesto gira. */
(function () {
  const vw = document.getElementById("vw"); if (!vw) return;
  let lastW = 0, turned = false;
  vw.addEventListener("wheel", e => {
    const now = Date.now();
    if (now - lastW > 450) turned = false; // pausa de quase meio segundo = gesto novo
    lastW = now;
    const sc = e.target.closest && e.target.closest(".xf,#ql,.f .ls,#kf");
    if (sc && sc.scrollHeight > sc.clientHeight + 2 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) return; // rolando o texto da face
    if (turned) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    if (Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY)) >= 12) turned = true;
  }, { capture: true, passive: false });
})();

/* player: anterior / play / próxima descem para a linha de baixo, no meio, alinhados com os outros botões.
   Assim o cubo e a letra ganham espaço e a seta de baixo do cubo não encosta mais no play. */
(function () {
  const tr = document.querySelector("#stage .tr"), cb = document.querySelector("#stage .cb"); if (!tr || !cb) return;
  const place = () => {
    const on = document.body.dataset.s === "pl" && innerWidth >= 701;
    document.body.classList.toggle("trlow", on);
    tr.style.translate = "";
    if (!on) return;
    const btn = [...cb.querySelectorAll("button")].find(b => b.offsetHeight && !b.closest(".dm")); if (!btn) return;
    const a = tr.getBoundingClientRect(), b = btn.getBoundingClientRect(); if (!a.height) return;
    const k = a.height / (tr.offsetHeight || a.height); // escala da tela (zoom)
    const dx = (innerWidth / 2 - (a.left + a.width / 2)) / k, dy = ((b.top + b.height / 2) - (a.top + a.height / 2)) / k;
    tr.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px";
  };
  addEventListener("resize", place); setInterval(place, 600); place();
})();


/* sem contorno de seleção depois de usar o mouse ou o dedo (barras, bolinhas, botões);
   e ao apertar uma tecla (F11 para tela cheia, por ex.) nenhum botão "acende" sozinho até o mouse mexer de novo */
(function () {
  document.addEventListener("pointerup", e => {
    const el = e.target.closest && e.target.closest("button,input[type=range],input[type=checkbox],[tabindex],a");
    if (!el) return; setTimeout(() => { if (document.activeElement === el) el.blur(); }, 0);
  }, true);
  document.addEventListener("change", e => { if (e.target.type === "range") e.target.blur(); }, true);
  document.addEventListener("keydown", e => { if (!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""))) document.body.classList.add("nohover"); }, true);
  let mx = -1, my = -1;
  document.addEventListener("mousemove", e => { if (Math.abs(e.clientX - mx) + Math.abs(e.clientY - my) > 3) { mx = e.clientX; my = e.clientY; document.body.classList.remove("nohover"); } }, true);
})();

/* tela de espera: "Hora do Show" menor, cubo no meio da altura da tela e Podcasts na mesma linha de Playlists e Fila */
(function () {
  const rst = document.getElementById("rst"), pod = document.getElementById("rpod");
  const place = () => {
    const on = document.body.dataset.s === "wait" && innerWidth >= 701;
    document.body.classList.toggle("wlay", on);
    const ws = document.getElementById("ws"), hs = document.querySelector("#wait .hs");
    if (rst) rst.style.translate = ""; if (pod) pod.style.translate = ""; if (ws) ws.style.translate = "";
    if (!on) return;
    // o logo encolheu: o subtítulo sobe junto, sem deixar buraco
    if (ws && hs) { const k = ws.getBoundingClientRect().height / (ws.offsetHeight || 1) || 1; ws.style.translate = "0 " + (-(hs.getBoundingClientRect().height / .72) * .28 / k).toFixed(1) + "px"; }
    const ref = document.getElementById("qbtn") || document.getElementById("plbtn");
    if (pod && ref && ref.offsetHeight) { const a = pod.getBoundingClientRect(), b = ref.getBoundingClientRect(), k = a.height / (pod.offsetHeight || a.height); pod.style.translate = "0 " + (((b.top + b.height / 2) - (a.top + a.height / 2)) / k).toFixed(1) + "px"; }
    if (rst) {
      const r = rst.getBoundingClientRect(); if (!r.height) return;
      let dy = innerHeight / 2 - (r.top + r.height / 2);
      // não sobe por cima do título "Músicas para você"
      const sub = document.getElementById("ws");
      if (sub && sub.offsetHeight) dy = Math.max(dy, sub.getBoundingClientRect().bottom + 10 - r.top);
      const kr = r.height / (rst.offsetHeight || r.height) || 1, kt = (rst.style.transform, 1);
      rst.style.translate = "0 " + dy.toFixed(1) + "px";
    }
  };
  addEventListener("resize", place); setInterval(place, 700); place();
})();

/* Hora do Show no topo do player; na espera fica a foto e o nome de quem entrou, com "Músicas para você" */
(function () {
  const h = document.querySelector("#wait .hsw"); if (!h) return;
  const d = document.createElement("div"); d.id = "plhs"; d.setAttribute("aria-hidden", "true");
  d.appendChild(h.cloneNode(true)); document.body.appendChild(d);
  const ws = document.getElementById("ws"); if (!ws) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";");
  let done = "";
  const fill = () => {
    const me = window.SPOT && SPOT.me; if (!me) return;
    const nm = (me.display_name || "").trim(), img = me.images && me.images.length ? (me.images[0].url || "") : "";
    const k = nm + "|" + img; if (k === done) return; done = k;
    ws.classList.add("grt");
    ws.innerHTML = (img ? `<i class="av" style="background-image:url('${esc(img)}')"></i>` : `<i class="av noimg">${esc((nm[0] || "?").toUpperCase())}</i>`) +
      `<span class="tx">${nm ? `<small>Olá, ${esc(nm)}!</small>` : ""}<b>Músicas para você</b></span>`;
  };
  fill(); setInterval(fill, 2000);
})();

/* no PC o Hora do Show fica na linha de baixo, no vão entre o botão de avançar e o do mini player */
(function () {
  const d = document.getElementById("plhs"); if (!d) return;
  const vis = b => b && b.offsetParent && b.getBoundingClientRect().width > 0;
  const place = () => {
    if (innerWidth <= 700 || document.body.dataset.s !== "pl") { d.classList.remove("low"); d.style.cssText = ""; return; }
    const nx = [...document.querySelectorAll("#stage .tr button")].filter(vis).pop();
    const pp = [...document.querySelectorAll("#stage .cbr button")].filter(vis)[0];
    if (!nx || !pp) return;
    const a = nx.getBoundingClientRect(), b = pp.getBoundingClientRect(), gap = b.left - a.right;
    if (gap < 160) { d.classList.remove("low"); d.style.cssText = ""; return; }
    const w = Math.min(330, gap - 48), cy = (a.top + a.bottom) / 2;
    d.classList.add("low");
    d.style.cssText = `left:${(a.right + b.left) / 2}px;top:${cy - w * 150 / 712 / 2}px;width:${w}px`;
  };
  setInterval(place, 600); addEventListener("resize", place); place();
})();

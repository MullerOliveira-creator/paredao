/* Paredão · rodada 5: escala por tela, ícones de vidro, fila própria, playlists, letra grande, faces novas */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const noYear = s => String(s || "").replace(/\s*·\s*\d{4}\b/g, "").replace(/^\d{4}$/, "").trim();
  const sp = () => window.SPOT && SPOT.on;
  const SVG = {
    gear: '<svg viewBox="0 0 100 100"><defs><linearGradient id="r5g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--if1,#fff)"/><stop offset=".55" stop-color="var(--if2,#e9f2f6)"/><stop offset="1" stop-color="var(--if3,#b9c7cf)"/></linearGradient></defs><path fill="url(#r5g)" fill-rule="evenodd" d="M43 6h14l2 11a34 34 0 0 1 8 3.3l9.3-6.3 9.9 9.9-6.3 9.3A34 34 0 0 1 83 41l11 2v14l-11 2a34 34 0 0 1-3.3 8l6.3 9.3-9.9 9.9-9.3-6.3A34 34 0 0 1 59 83l-2 11H43l-2-11a34 34 0 0 1-8-3.3l-9.3 6.3-9.9-9.9 6.3-9.3A34 34 0 0 1 17 59L6 57V43l11-2a34 34 0 0 1 3.3-8L14 23.7l9.9-9.9 9.3 6.3A34 34 0 0 1 41 17zM50 31a19 19 0 1 0 0 38 19 19 0 1 0 0-38zM50 39a11 11 0 1 1 0 22 11 11 0 1 1 0-22z"/></svg>',
    home: '<svg viewBox="0 0 100 100"><path fill="none" stroke="url(#r5g)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M12 47 50 13l38 34"/><path fill="url(#r5g)" fill-rule="evenodd" d="M50 28 78 52v34H22V52zM42 86V64a8 8 0 0 1 16 0v22z"/></svg>',
    list: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h12"/></svg>',
    pls: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h13M3 12h13M3 18h9"/><circle cx="18" cy="17" r="3"/><path d="M21 17V7l-3 1"/></svg>',
    spk: '<svg class="sp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><circle cx="12" cy="14" r="4"/><circle cx="12" cy="6.5" r="1"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7"/></svg>',
    tv: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    dice: '<svg viewBox="0 0 100 100"><defs><linearGradient id="r5dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient></defs><g class="dk"><path d="M50 9 87 30v41L50 92 13 71V30z" fill="url(#r5dg)"/><path d="M50 9 87 30 50 51 13 30z" fill="#fff" fill-opacity=".1"/><path d="M50 9 87 30v41L50 92 13 71V30zM13 30l37 21 37-21M50 51v41" fill="none" stroke="var(--dkl,#fff)" stroke-width="3.6" stroke-linejoin="round"/></g><g class="dp"><ellipse cx="50" cy="30" rx="6" ry="3.6"/><ellipse cx="31.5" cy="61" rx="3.6" ry="5.2" transform="rotate(-30 31.5 61)"/><ellipse cx="60" cy="56" rx="3.6" ry="5.2" transform="rotate(30 60 56)"/><ellipse cx="77" cy="66" rx="3.6" ry="5.2" transform="rotate(30 77 66)"/><ellipse cx="60" cy="76" rx="3.6" ry="5.2" transform="rotate(30 60 76)"/><ellipse cx="77" cy="46" rx="3.6" ry="5.2" transform="rotate(30 77 46)"/></g></svg>',
    lounge: '<svg viewBox="0 0 100 100" class="wi"><path id="wip" transform="translate(2.6 .2)" fill="url(#r5g)" d="M6 46.5a3.5 3.5 0 0 1 7 0V57.5a3.5 3.5 0 0 1-7 0ZM16 39.5a3.5 3.5 0 0 1 7 0V64.5a3.5 3.5 0 0 1-7 0ZM26 31.5a3.5 3.5 0 0 1 7 0V72.5a3.5 3.5 0 0 1-7 0ZM36 38.5a3.5 3.5 0 0 1 7 0V65.5a3.5 3.5 0 0 1-7 0ZM46 44.5a3.5 3.5 0 0 1 7 0V59.5a3.5 3.5 0 0 1-7 0ZM51.95 81.87A13 10-22 1 1 76.05 72.13A13 10-22 1 1 51.95 81.87ZM70.5 75V12H77C79 22.5 91 26.5 88.5 45.5C85.5 37 81 34.5 77 33.5V75Z"/></svg>',
    orb: '<svg viewBox="30 30 732 172"><g class="ek" fill="var(--dkl,#fff)" stroke="var(--dkl,#fff)" stroke-width="16" stroke-linejoin="round"><path d="M 88,99 C 64,111 49,127 48,141 C 46,164 99,178 171,180 C 271,185 384,166 476,151 C 383,168 269,188 171,184 C 98,182 44,168 46,141 C 47,126 65,110 88,99 Z"/><path d="M 383,79 C 454,60 524,49 580,48 C 665,42 727,55 739,82 C 746,98 734,116 713,130 C 686,150 616,174 510,187 C 616,171 684,149 712,129 C 733,113 743,98 737,83 C 726,59 665,48 580,52 C 524,52 454,63 383,79 Z"/></g><circle class="ed" cx="480" cy="150" r="18"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'
  };

  /* ---------- 1. escala por tela e tipo de aparelho ---------- */
  const ua = navigator.userAgent, de = document.documentElement;
  const isTV = /Tizen|SMART-TV|SmartTV|Web0S|WebOS|HbbTV|BRAVIA|AFT[A-Z]|CrKey/i.test(ua);
  const isEcho = /Silk|KFMAWI|AEO[A-Z]{2}|Echo/i.test(ua);
  function scale() {
    const w = innerWidth, h = innerHeight, coarse = matchMedia("(pointer:coarse)").matches;
    let k = Math.min(w / 1280, h / 760);
    k = Math.max(w < 700 ? .78 : .9, Math.min(2.4, k));
    if (de.classList.contains("tv")) k *= 1.15;
    de.style.setProperty("--k", k.toFixed(3));
    de.classList.toggle("dev-tv", isTV || (w >= 1800 && !coarse && h >= 1000 && isTV));
    de.classList.toggle("dev-echo", isEcho);
    de.classList.toggle("dev-phone", w < 700);
  }
  addEventListener("resize", scale); scale();
  if (isTV) de.classList.add("dev-tv");

  /* tela cheia: começa grande e pede tela cheia no primeiro toque */
  let fsAsked = false;
  try { fsAsked = sessionStorage.getItem("pd_fsno") === "1"; } catch (e) {}
  const goFS = () => { if (!document.fullscreenElement && de.requestFullscreen) de.requestFullscreen({ navigationUI: "hide" }).catch(() => {}); };
  document.addEventListener("pointerdown", e => {
    if (fsAsked || e.target.closest("#cfg,input")) return;
    fsAsked = true; goFS();
  }, { capture: true, once: false });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-a=f],[data-a=tvx]"); if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (b.dataset.a === "tvx") { tvOn(!de.classList.contains("tv")); return; }
    if (document.fullscreenElement) { try { sessionStorage.setItem("pd_fsno", "1"); } catch (x) {} fsAsked = true; document.exitFullscreen().catch(() => {}); }
    else goFS();
  }, true);
  function tvOn(on) { tv = on; de.classList.toggle("tv", on); scale(); if (on) goFS(); say(on ? "Modo TV ligado" : "Modo TV desligado"); }
  window.setTV = tvOn;

  /* ---------- 2. tema: fundo (claro/escuro) + cor neon ---------- */
  const BGS = {
    c: [["Gelo", "#eff6fd"], ["Branco", "#fbfbfd"], ["Céu", "#cdebf8"], ["Névoa", "#e7ebee"], ["Azul névoa", "#d0d9e2"], ["Lavanda cinza", "#c0bfcf"],
        ["Azul água", "#c9dfe5"], ["Areia rosada", "#eae2dd"], ["Rosé", "#e5d6ce"], ["Pêssego areia", "#dec3b3"], ["Marfim", "#f8f2ef"], ["Linho", "#eae1d5"],
        ["Champagne", "#f4e0c5"], ["Bege", "#ece2d6"], ["Marfim claro", "#eeeee1"], ["Ardósia", "#8391a3"]],
    e: [["Paredão", "#071a26"], ["Meia-noite", "#0b1030"], ["Grafite", "#121e22"], ["Petróleo", "#04323f"], ["Noite roxa", "#1a0633"], ["Vinho", "#3e1518"],
        ["Bordô", "#2a0507"], ["Rubro", "#1e0000"], ["Café", "#2a2218"], ["Cacau", "#403428"], ["Mata", "#151a15"], ["Oliva", "#2c2f24"],
        ["Ferrugem", "#3a1608"], ["Azul profundo", "#0a2a40"], ["Ameixa", "#2a1430"], ["Preto", "#08080a"]]
  };
  const NEONS = [["Ciano Paredão", "#1fd3f2"], ["Ciano", "#00e1ff"], ["Turquesa", "#00f0c8"], ["Verde-água", "#00f59b"], ["Verde", "#2bff5a"], ["Lima", "#c8f000"],
    ["Amarelo", "#ffd000"], ["Laranja", "#ff8a00"], ["Coral", "#ff5a50"], ["Vermelho", "#ff1a3c"], ["Pink", "#ff1f8f"], ["Rosa", "#ff4fb4"],
    ["Magenta", "#ff00d4"], ["Violeta", "#c81fff"], ["Roxo", "#9b2bff"], ["Lilás", "#7a6bff"], ["Azul", "#1e8cff"], ["Azul elétrico", "#2448ff"], ["Gelo neon", "#5ffcff"], ["Branco neon", "#f4f8ff"]];
  const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const lum = h => { const x = parseInt(h.slice(1), 16); return (.299 * (x >> 16) + .587 * (x >> 8 & 255) + .114 * (x & 255)) / 255; };
  let TH = { m: "e", bg: 0, ne: 0 };
  try { const t = JSON.parse(localStorage.getItem("pd_theme") || "null"); if (t && BGS[t.m] && BGS[t.m][t.bg] && NEONS[t.ne]) TH = t; } catch (e) {}
  window.THEME = { BGS, NEONS, get: () => TH, set: (t) => applyTheme(Object.assign({}, TH, t)) };
  function themeObj(t) {
    const bg = BGS[t.m][t.bg][1], neon = NEONS[t.ne][1], light = t.m === "c";
    // no fundo claro o neon escurece um pouco para ler bem; o brilho continua no tom puro
    const a = light ? mix(neon, "#000000", lum(neon) > .7 ? .45 : .22) : neon;
    const ink = light ? mix(bg, "#0b1218", .88) : mix(neon, "#ffffff", .9);
    return { n: BGS[t.m][t.bg][0] + " + " + NEONS[t.ne][0], bg, a, b: mix(a, bg, .55), c: ink, neon, light };
  }
  const _setP = setP;
  function applyTheme(t) {
    TH = t; try { localStorage.setItem("pd_theme", JSON.stringify(t)); } catch (e) {}
    const o = themeObj(t); P.splice(0, P.length, o); _setP(0);
    de.classList.toggle("light", o.light);
    de.style.setProperty("--neon", o.neon); de.style.setProperty("--ink", o.c);
    const p = o, light = o.light;
    const top = light ? mix(p.a, "#000000", .1) : mix(p.neon, "#ffffff", .7), mid = light ? p.a : mix(p.neon, "#ffffff", .35), bot = light ? mix(p.a, "#000000", .3) : mix(p.neon, "#ffffff", .6);
    const st = (id, cols) => { const g = document.getElementById(id); if (g) [...g.querySelectorAll("stop")].forEach((s, j) => s.setAttribute("stop-color", cols[Math.min(j, cols.length - 1)])); };
    st("hsg", [top, mid, p.a, bot]); st("hsv", [light ? mix(p.a, "#fff", .5) : "#ffffff", mid, p.neon, bot]); st("hsd", ["#ffffff", mix(p.neon, "#fff", .7), mid, p.neon]);
    $$(".hs [stroke='#c8f8ff'],.hs g[stroke]").forEach(g => g.setAttribute("stroke", light ? mix(p.a, "#000", .2) : mix(p.neon, "#fff", .7)));
    de.style.setProperty("--if1", light ? mix(p.a, "#fff", .25) : "#ffffff");
    de.style.setProperty("--if2", light ? p.a : "#e9f2f6");
    de.style.setProperty("--if3", light ? mix(p.a, "#000", .35) : "#b9c7cf");
    if (window.drawTheme) drawTheme();
  }
  setP = function () { applyTheme(TH); };
  applyTheme(TH);

  /* ---------- 3. engrenagem e casinha ---------- */
  const cfgb = $("#cfgb");
  if (cfgb) { cfgb.className = "gbtn"; cfgb.innerHTML = SVG.gear; cfgb.title = "Configurações"; }
  const homeb = document.createElement("button");
  homeb.id = "homeb"; homeb.className = "gbtn"; homeb.type = "button"; homeb.title = "Início"; homeb.setAttribute("aria-label", "Início"); homeb.innerHTML = SVG.home;
  homeb.onclick = () => { setView("n"); closePanels(); scr("home"); };
  document.body.appendChild(homeb);
  const waitb = document.createElement("button");
  waitb.id = "waitb"; waitb.className = "gbtn"; waitb.type = "button"; waitb.title = "Hora do Show (tela de espera)"; waitb.setAttribute("aria-label", "Tela de espera"); waitb.innerHTML = SVG.lounge;
  waitb.onclick = () => { setView("n"); closePanels(); started = started || 0; openWait(""); };
  document.body.appendChild(waitb);
  const shuf = $("#shuf"); if (shuf) { shuf.classList.add("gbtn"); shuf.innerHTML = SVG.dice; shuf.title = "Novas sugestões (embaralhar)"; }

  /* configurações: vidro, canto direito, arrastável, só "Salvar" e × */
  const cfg = $("#cfg");
  if (cfg) {
    cfg.classList.add("cfgw");
    const p = cfg.querySelector(".cfgp");
    if (p) {
      p.insertAdjacentHTML("afterbegin", '<div class="grip"></div><button type="button" id="cfgx" aria-label="Fechar">×</button>');
      $("#cfgx").onclick = () => cfg.classList.remove("on");
      const pal = $("#cfgpal");
      window.drawTheme = function () {
        const t = TH, nm = themeObj(t).n;
        pal.innerHTML = `<div class="tseg"><button type="button" data-tm="c" class="${t.m === "c" ? "on" : ""}">Claro</button><button type="button" data-tm="e" class="${t.m === "e" ? "on" : ""}">Escuro</button></div>` +
          `<div class="tlab">Fundo · <b>${esc(BGS[t.m][t.bg][0])}</b></div><div class="tgrid">` + BGS[t.m].map((b, j) => `<button type="button" class="tbg${j === t.bg ? " on" : ""}" data-tb="${j}" title="${esc(b[0])}" aria-label="Fundo ${esc(b[0])}"><i style="background:${b[1]}"></i></button>`).join("") + "</div>" +
          `<div class="tlab">Cor neon · <b>${esc(NEONS[t.ne][0])}</b></div><div class="tgrid">` + NEONS.map((n, j) => `<button type="button" class="tne${j === t.ne ? " on" : ""}" data-tn="${j}" title="${esc(n[0])}" aria-label="Neon ${esc(n[0])}"><i style="background:${n[1]};--g:${n[1]}"></i></button>`).join("") + "</div>";
        const h = pal.previousElementSibling; if (h && h.tagName === "H4") h.textContent = "Cores e fundo";
      };
      pal.addEventListener("click", e => {
        const m = e.target.closest("[data-tm]"), b = e.target.closest("[data-tb]"), n = e.target.closest("[data-tn]");
        if (!m && !b && !n) return; e.stopImmediatePropagation();
        if (m && m.dataset.tm !== TH.m) applyTheme({ m: m.dataset.tm, bg: 0, ne: TH.ne });
        if (b) applyTheme(Object.assign({}, TH, { bg: +b.dataset.tb }));
        if (n) applyTheme(Object.assign({}, TH, { ne: +n.dataset.tn }));
      }, true);
      drawTheme();
      // botões: só Salvar (+ Desconectar quando conectado)
      $$("#cfg button").forEach(b => {
        const t = b.textContent.trim();
        if (/^Fechar$/i.test(t)) b.style.display = "none";
        if (/Salvar e conectar/i.test(t)) b.textContent = "Salvar";
        if (/^Desconectar$/i.test(t) && !sp()) b.style.display = "none";
      });
      // arrastar pelo título
      let dg = null;
      p.addEventListener("pointerdown", e => {
        if (!e.target.closest("h3,.grip")) return;
        const r = p.getBoundingClientRect(); dg = { x: e.clientX - r.left, y: e.clientY - r.top }; p.setPointerCapture(e.pointerId);
      });
      p.addEventListener("pointermove", e => {
        if (!dg) return; const z = parseFloat(getComputedStyle(de).getPropertyValue("--k")) || 1;
        p.style.left = Math.max(0, (e.clientX - dg.x)) / z + "px"; p.style.top = Math.max(0, (e.clientY - dg.y)) / z + "px"; p.style.right = "auto";
      });
      p.addEventListener("pointerup", () => dg = null);
      // clicar fora fecha
      document.addEventListener("pointerdown", e => { if (cfg.classList.contains("on") && !p.contains(e.target) && !e.target.closest("#cfgb")) cfg.classList.remove("on"); });
    }
  }

  /* ---------- 4. fila própria (Paredão) ---------- */
  // S.ql = fila que a pessoa montou. AUTO = o que vem depois, sem repetir o que tocou há pouco.
  const HIST = [];
  window.PQ = { hist: HIST };
  function autoList(n) {
    const cur = S.i, used = new Set([cur, ...S.ql, ...HIST.slice(-30)]);
    const pool = REC.filter(i => !used.has(i) && kind(i) === kind(cur)).concat(T.map((t, i) => i).filter(i => !used.has(i) && kind(i) === kind(cur) && !REC.includes(i)));
    return pool.slice(0, n);
  }
  PQ.auto = autoList;
  let lastI = -1;
  setInterval(() => { if (S.i !== lastI) { if (lastI >= 0) HIST.push(lastI); if (HIST.length > 60) HIST.shift(); lastI = S.i; } }, 500);
  // próxima música: primeiro a fila, depois o automático
  const _next = next;
  next = function () {
    if (sp()) return _next();
    if (S.ql.length) { S.i = S.ql.shift(); } else { const a = autoList(1); S.i = a.length ? a[0] : stepI(S.i, 1); }
    S.t = 0; say("Tocando: " + T[S.i][0]);
  };
  function addQ(k) { if (k == null) return; S.ql.push(k); qChanged(); say("Na fila: " + T[k][0]); }
  function qChanged() { const em = $("#em"); if (em) em.textContent = S.ql.length; renderQ(); if (sp() && SPOT.qDirty) SPOT.qDirty(); }
  PQ.add = addQ; PQ.changed = qChanged;
  // botão da fila no player só consulta (vira a face Próximas)
  const qb = $("#stage [data-a=q]");
  if (qb) { qb.dataset.a = "qv"; qb.title = "Ver a fila"; qb.querySelector("svg").outerHTML = SVG.list; }
  // menu de contexto "Adicionar à fila" usa a fila própria
  const ctxEl = $("#ctx");
  ctxEl && ctxEl.addEventListener("click", e => {
    const b = e.target.closest("[data-c=q]"); if (!b) return;
    e.stopImmediatePropagation(); addQ(REC[rFront()]); ctxEl.classList.remove("on");
  }, true);

  /* ---------- 5. barra de baixo do player: grupos com espaços iguais ---------- */
  const cb = $("#stage .cb");
  if (cb) {
    const L = document.createElement("div"), R = document.createElement("div"); L.className = "cbl"; R.className = "cbr";
    const pick = s => cb.querySelector(s);
    [pick("#fvb"), pick("[data-a=qv]"), pick("[data-a=d]"), pick(".vo")].forEach(x => x && L.appendChild(x));
    [pick("[data-a=p]"), pick("[data-a=f]")].forEach(x => x && R.appendChild(x));
    cb.appendChild(L); cb.appendChild(R);
    const ft = document.createElement("div"); ft.id = "ftoast"; L.appendChild(ft);
  }
  // botões novos recebem o mesmo vidro
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-a=qv]"); if (!b) return;
    e.stopImmediatePropagation(); show(2); renderQ();
  }, true);
  // aviso de favoritos em cima do coração
  const _say = say;
  say = function (m) {
    if (/favoritos/i.test(m) && document.body.dataset.s === "pl") { const t = $("#ftoast"); if (t) { t.textContent = m; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1800); return; } }
    _say(m);
  };

  /* ---------- 6. letra grande, saindo do cubo ---------- */
  const big = document.createElement("div"); big.id = "bigly"; big.className = "kf";
  $("#vw").appendChild(big);
  $("#vw").appendChild($("#tl"));
  const _K2 = K2;
  K2 = function (r) { _K2(r); if (r === kf) { _K2(big); } };
  // a face da letra fica plana enquanto a letra grande aparece por cima
  setInterval(() => {
    const on = document.body.dataset.s === "pl" && view !== "p" && front() === 1 && !flipping;
    document.body.classList.toggle("bigon", on);
  }, 200);

  /* ---------- 7. girar o cubo com rolagem e deslizar ---------- */
  let wl = 0;
  const canScroll = (t, dy) => { const el = t && t.closest && t.closest(".xf,#ql,.f .ls,#kf"); if (!el || el.scrollHeight <= el.clientHeight + 2) return false; return dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0; };
  const wheel = (fn) => e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && canScroll(e.target, e.deltaY)) return; const now = Date.now(); if (now - wl < 650) { e.preventDefault(); return; } const dx = e.deltaX, dy = e.deltaY; if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return; wl = now; e.preventDefault(); fn(dx, dy); };
  $("#vw").addEventListener("wheel", wheel((dx, dy) => { if (Math.abs(dx) > Math.abs(dy)) turn(0, dx > 0 ? -90 : 90); else turn(dy > 0 ? -90 : 90, 0); }), { passive: false });
  $("#rst").addEventListener("wheel", wheel((dx, dy) => { rLast = Date.now(); if (Math.abs(dx) > Math.abs(dy)) rTurn(0, dx > 0 ? -90 : 90); else rTurn(0, dy > 0 ? -90 : 90); }), { passive: false });
  // (o arrasto do cubo agora fica no r7.js, acompanhando o dedo)

  /* ---------- 8. faces do cubo ---------- */
  $$("#cu .tg").forEach(tg => { tg.innerHTML = '<i class="tc"></i><div class="tx"><b class="tn"></b><i class="sub"></i></div>'; });
  const heads = $$("#cu .f > h4");
  heads.forEach(h => {
    const t = h.textContent.trim();
    if (t === "Próximas") { h.className = "fh"; h.innerHTML = SVG.list.replace('class="ic"', '') + "Próximas"; }
    else if (t === "Som" || t === "Detalhes" || t === "Playlist") { h.remove(); }
  });
  const card = (k, opts) => `<div class="ti" data-t="${k}"${opts && opts.q != null ? ` data-qi="${opts.q}"` : ""}><i class="c" style="background-image:url(${art(k).u})"></i><div class="t"><b>${esc(T[k][0])}</b><span>${esc(T[k][1])}</span></div>${opts && opts.q != null ? `<span class="ac"><button type="button" data-qm="-1" title="Subir">↑</button><button type="button" data-qm="1" title="Descer">↓</button><button type="button" data-qx title="Tirar da fila">×</button></span>` : ""}</div>`;
  function upNextHTML() {
    const q = S.ql.map((k, j) => card(k, { q: j })).join("");
    const a = autoList(10).map(k => card(k)).join("");
    return (q ? q : "") + (a ? `<div class="em" style="padding:8px 6px 4px">${q ? "Depois, no automático" : "Fila vazia · tocando no automático"}</div>` + a : "");
  }
  let lastCover = "";
  function r5UI() {
    const k = S.i; if (k == null || !T[k]) return;
    const u = art(k).u; if (u !== lastCover) { lastCover = u; $$("#cu .tg .tc").forEach(e => e.style.backgroundImage = `url(${u})`); }
    const sub = esc(T[k][1]) + (noYear(T[k][2]) && !/^Podcast$/.test(noYear(T[k][2])) ? " · " + esc(noYear(T[k][2])) : "");
    $$("#cu .tg .sub").forEach(e => { if (e._h !== sub) { e._h = sub; e.innerHTML = sub; } });
    $$("#cu .al").forEach(e => { const t = noYear(e.textContent); if (t !== e.textContent) e.textContent = t; });
    // Próximas
    const ql = $("#ql"), h = "q" + S.i + "|" + S.ql.join(",") + "|" + HIST.length;
    if (ql && (ql._h2 !== h || !ql.querySelector(".ti,.em"))) { ql._h2 = h; ql.innerHTML = upNextHTML(); ql._h = ql._h; }
    window.R6faces && R6faces();
  }
  const DEMOV = [10, 35, 60, 25];
  const _UI = UI;
  UI = function () { _UI(); try { r5UI(); } catch (e) { console.warn("r5UI", e); } };
  // clique nos cartões da fila
  document.addEventListener("click", e => {
    const qx = e.target.closest("[data-qx]"), qm = e.target.closest("[data-qm]");
    if (qx || qm) {
      e.stopImmediatePropagation(); const j = +e.target.closest("[data-qi]").dataset.qi;
      if (qx) S.ql.splice(j, 1);
      else { const d = +qm.dataset.qm, t = j + d; if (t >= 0 && t < S.ql.length) [S.ql[j], S.ql[t]] = [S.ql[t], S.ql[j]]; }
      qChanged(); return;
    }
    const ti = e.target.closest(".ti[data-t]"); if (!ti || e.target.closest("#plpan")) return;
    e.stopImmediatePropagation();
    const k = +ti.dataset.t, qi = ti.dataset.qi;
    if (qi != null) S.ql.splice(+qi, 1);
    closePanels(); playK(k); qChanged();
  }, true);

  /* ---------- 9. tela de espera: botões Fila e Playlists ---------- */
  const wait = $("#wait");
  wait.insertAdjacentHTML("beforeend",
    `<button id="plbtn" class="xp wq" type="button">${SVG.pls}<span>Playlists</span></button>` +
    `<button id="qbtn" class="xp wq" type="button">${SVG.list}<span>Fila</span><em class="bd" id="qbd">0</em></button>` +
    `<div id="qpan" class="lp" role="dialog" aria-label="Fila"><h5>${SVG.list}Fila<small id="qnow"></small></h5><div class="ls" id="qls"></div></div>` +
    `<div id="plpan" class="lp" role="dialog" aria-label="Playlists"><h5>${SVG.pls}Playlists</h5><input id="plq" type="search" placeholder="Buscar playlists…" autocomplete="off"><div class="ls" id="pls"></div></div>`);
  function renderQ() {
    const bd = $("#qbd"); if (bd) bd.textContent = S.ql.length;
    const ls = $("#qls"); if (!ls) return;
    $("#qnow").textContent = started && T[S.i] ? "Tocando: " + T[S.i][0] : "";
    ls.innerHTML = upNextHTML() || '<div class="em">A fila está vazia. Segure numa música do cubo e escolha "Adicionar à fila".</div>';
  }
  function closePanels() { $$(".lp.on").forEach(p => p.classList.remove("on")); }
  $("#qbtn").onclick = e => { e.stopPropagation(); const on = !$("#qpan").classList.contains("on"); closePanels(); if (on) { renderQ(); $("#qpan").classList.add("on"); } };
  $("#plbtn").onclick = e => { e.stopPropagation(); const on = !$("#plpan").classList.contains("on"); closePanels(); if (on) { $("#plpan").classList.add("on"); loadPl(""); setTimeout(() => $("#plq").focus(), 60); } };
  document.addEventListener("pointerdown", e => { if (!e.target.closest(".lp,.wq,#ctx")) closePanels(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closePanels(); });
  setInterval(() => { const bd = $("#qbd"); if (bd && +bd.textContent !== S.ql.length) renderQ(); }, 700);

  /* playlists: as suas + busca no Spotify; toca a playlist inteira */
  let plT = 0;
  $("#plq").addEventListener("input", e => { clearTimeout(plT); plT = setTimeout(() => loadPl(e.target.value.trim()), 400); });
  const DEMOPL = [["Funk do Paredão", "Paredão"], ["Synthwave Noturno", "Paredão"], ["Treino Pesado", "Paredão"], ["Estrada e Grave", "Paredão"], ["Pop Brasil Hoje", "Paredão"], ["Eletrônica pra Dirigir", "Paredão"]];
  async function loadPl(q) {
    const ls = $("#pls"); ls.innerHTML = '<div class="em">Carregando…</div>';
    if (!sp()) {
      const f = DEMOPL.filter(p => !q || p[0].toLowerCase().includes(q.toLowerCase()));
      ls.innerHTML = f.map((p, j) => `<div class="ti" data-pd="${j}"><i class="c" style="background-image:url(${art(j * 3).u})"></i><div class="t"><b>${esc(p[0])}</b><span>de ${esc(p[1])} · demonstração</span></div></div>`).join("") || '<div class="em">Nada encontrado.</div>';
      return;
    }
    try {
      const out = [];
      if (!q) { const r = await SPOT.api("GET", "/me/playlists", null, { limit: 20 }); (r.items || []).filter(Boolean).forEach(p => out.push({ p, mine: true })); }
      else { const r = await SPOT.api("GET", "/search", null, { q, type: "playlist", limit: 10 }); ((r.playlists && r.playlists.items) || []).filter(Boolean).forEach(p => out.push({ p })); }
      ls.innerHTML = out.map(({ p, mine }) => { const img = (p.images && p.images[0] && p.images[0].url) || ""; return `<div class="ti" data-pu="${esc(p.uri)}" data-pn="${esc(p.name)}"><i class="c" style="background-image:url('${esc(img)}')"></i><div class="t"><b>${esc(p.name)}</b><span>${mine ? "sua playlist" : "de " + esc((p.owner && p.owner.display_name) || "Spotify")}</span></div></div>`; }).join("") || '<div class="em">' + (q ? "Nada encontrado." : "Você ainda não tem playlists. Busque acima.") + "</div>";
    } catch (e) { ls.innerHTML = `<div class="em">Não deu para carregar agora (${esc(e.message || e)}).</div>`; }
  }
  $("#pls").addEventListener("click", e => {
    const d = e.target.closest("[data-pu],[data-pd]"); if (!d) return;
    closePanels();
    if (d.dataset.pu && sp()) { SPOT.playContext(d.dataset.pu); say("Tocando a playlist " + d.dataset.pn); scr("pl"); started = 1; return; }
    // demonstração: monta uma sequência e toca
    const j = +d.dataset.pd, L = T.map((t, i) => i).filter(i => !kind(i)).sort(() => Math.random() - .5).slice(0, 8);
    S.ql = L.slice(1); qChanged(); playK(L[0]); say("Playlist: " + DEMOPL[j][0]);
  });

  /* ---------- 10. "Mais do artista" mostra só o artista ---------- */
  window.ARTM = null;
  const _feed = feedFace;
  feedFace = function (f) {
    if (!ARTM) return _feed(f);
    const el = rcu.children[f]; if (!el) return;
    const k = ARTM.pool.find(i => !REC.includes(i)); if (k == null) return;
    ARTM.pool.push(ARTM.pool.splice(ARTM.pool.indexOf(k), 1)[0]);
    REC[f] = k; el.dataset.k = k; el.style.backgroundImage = `url(${art(k).u})`;
    el.querySelector("em").textContent = "Mais de " + ARTM.name; el.querySelector("b").textContent = T[k][0]; el.querySelector("span").textContent = T[k][1];
  };
  const clearArt = () => { ARTM = null; };
  ["#shuf", "#rpod", "#rexit"].forEach(s => $(s) && $(s).addEventListener("click", clearArt, true));
  const _openWait = openWait; openWait = function (q) { clearArt(); return _openWait(q); };
  const _radio = radio; radio = function (k) { clearArt(); return _radio(k); };
  // modo demonstração: "Mais do artista" usa o catálogo local
  ctxEl && ctxEl.addEventListener("click", e => {
    const b = e.target.closest("[data-c=art]"); if (!b || sp()) return;
    e.stopImmediatePropagation(); ctxEl.classList.remove("on");
    const k = REC[rFront()], a = T[k][1], L = T.map((t, i) => i).filter(i => T[i][1] === a);
    if (L.length < 2) { say("Só tem essa de " + a + " por aqui"); return; }
    ARTM = { name: a, pool: L.slice() }; if (RAD) killRad(); roll(L.slice(0, 6)); $("#ws").textContent = "Mais de " + a;
  }, true);

  /* ---------- 11. menu de dispositivos (demonstração) ---------- */
  const DICO = {
    pc: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    tv: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M7 21h10"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
    spk: '<rect x="5" y="2" width="14" height="20" rx="2.5"/><circle cx="12" cy="14" r="4"/><circle cx="12" cy="6.5" r="1"/>',
    head: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
    show: '<rect x="3" y="3" width="18" height="12" rx="2"/><path d="M6 21h12l-2-6H8z"/>'
  };
  function dkind(d) {
    const t = (d.t || "").toLowerCase(), n = (d.n || "").toLowerCase();
    if (/navegador|dispositivo|computer|notebook|pc|mac/.test(t + " " + n)) return ["pc", d.self ? "Tocando aqui" : "Computador"];
    if (/echo show|show 15|show 8|show 10/.test(n)) return ["show", "Alto-falante com tela"];
    if (/phone|iphone|celular|smartphone|z flip|z fold|flip/.test(t + " " + n)) return ["phone", "Celular"];
    if (/tv|oled|tizen|smart|chromecast/.test(t + " " + n)) return ["tv", "Smart TV"];
    if (/fone|head|buds|airpods/.test(n)) return ["head", "Fone"];
    return ["spk", "Alto-falante"];
  }
  window.R5dev = function (list, active) {
    const a = list[active] || list[0];
    const cards = list.map((d, j) => {
      const [ic, sub] = dkind(d), on = j === active, v = d.v == null ? null : d.v, ok = d.ok !== false;
      return `<div data-j="${j}" class="${on ? "on" : ""}" role="button" tabindex="0" aria-label="Tocar em ${esc(d.n)}"><span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${DICO[ic]}</svg></span><span class="dp">${ok && v != null ? v + "%" : "—"}</span><b>${esc(d.n)}</b><small>${on ? '<span class="w"><i></i><i></i><i></i></span>' : ""}${esc(on ? (d.self ? "Tocando aqui" : "Tocando agora") : sub)}</small></div>`;
    }).join("");
    const v = a ? (a.v == null ? 10 : a.v) : 10, ok = a && a.ok !== false;
    return cards + `<p>Tocar em…</p>` +
      (a ? `<section><span>Volume</span><input type="range" min="0" max="100" value="${v}" data-dv="${esc(a.id || "demo" + active)}" style="--v:${v}%" ${ok ? "" : "disabled"} aria-label="Volume de ${esc(a.n)}"><output>${ok ? v + "%" : "—"}</output></section>` : "");
  };
  function demoDevs() { if (sp()) return; dm.innerHTML = R5dev(DV.map((n, j) => ({ n, self: j === 0, v: j === S.dev ? Math.round(vol() * 100) : DEMOV[j] })), S.dev); }
  demoDevs();
  document.addEventListener("pointerdown", e => { if (e.target.closest("[data-a=d]") && !dm.classList.contains("on")) demoDevs(); }, true);
  dm.addEventListener("input", e => {
    const r = e.target.closest("input[data-dv]"); if (!r) return;
    r.style.setProperty("--v", r.value + "%"); const o = r.parentNode.querySelector("output"); if (o) o.textContent = r.value + "%";
    const card = dm.querySelector("#dm>div.on .dp"); if (card) card.textContent = r.value + "%";
    if (!sp()) { const j = S.dev; DEMOV[j] = +r.value; S.v = r.value / 100; S.m = 0; }
  });
  dm.addEventListener("click", e => { if (e.target.closest("input")) e.stopPropagation(); }, true);
  // o ponto da seleção: o menu original acrescenta " ●"; tiramos
  const _ud = window.ud;

  /* ---------- 12. mini player sempre que sair do player com música ---------- */
  // (stgU original já cuida; garantimos "started" quando há música vinda do Spotify)
  setInterval(() => { if (sp() && S.p && !started) started = 1; }, 1000);

  /* ---------- 13. ano fora das capas da espera e da busca ---------- */
  new MutationObserver(() => { $$("#res button small, #res .al, .rf span").forEach(s => { const t = noYear(s.textContent); if (t !== s.textContent) s.textContent = t; }); }).observe(document.body, { subtree: true, childList: true });

  scale();
})();

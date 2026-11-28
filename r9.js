/* Paredão · rodada 9: diagnóstico das requisições, roda de cores livre, pop-up de vídeo sem holograma por trás */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const LSg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };

  /* ---------- diagnóstico do Spotify (Configurações) ---------- */
  const NOME = { "GET /me/player": "ver o que está tocando", "GET /me/player/devices": "ver aparelhos", "GET /me/player/queue": "ver a fila", "POST /me/player/queue": "pôr na fila",
    "PUT /me/player/play": "tocar", "PUT /me/player/pause": "pausar", "POST /me/player/next": "próxima", "POST /me/player/previous": "anterior", "PUT /me/player/volume": "volume",
    "PUT /me/player/seek": "pular trecho", "PUT /me/player": "trocar aparelho", "GET /search": "busca", "GET /me/library/contains": "conferir favoritos", "GET /me/top/tracks": "seu top", "GET /artists/:id/top-tracks": "mais do artista" };
  function report() {
    const L = (window.SPOT && SPOT.log) || [], now = Date.now();
    const n = ms => L.filter(r => now - r.t < ms).length;
    const day = LSg("pd_req", {}) || {}, by = Object.entries(day.by || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const t0 = L.length ? L[0].t : now, mins = Math.max(1, (now - t0) / 60000);
    return { m1: n(60e3), m10: n(600e3), h: Math.round(n(3600e3) * 60 / Math.min(60, mins)), day: day.n || 0, e: day.e || 0, by, pause: window.SPOT && SPOT.pauseUntil > now ? Math.ceil((SPOT.pauseUntil - now) / 1000) : 0 };
  }
  let draw = function (box) {
    const r = report();
    box.innerHTML = `<div class="tlab">Diagnóstico do Spotify <small>(neste aparelho)</small></div>
      <div class="dgn"><div><b>${r.m1}</b><span>no último minuto</span></div><div><b>${r.m10}</b><span>em 10 min</span></div><div><b>≈${r.h}</b><span>por hora, neste ritmo</span></div><div><b>${r.day}</b><span>hoje${r.e ? ` · <em>${r.e} recusadas</em>` : ""}</span></div></div>
      ${r.pause ? `<p class="dgw">O Spotify pediu pausa: volta em ${r.pause} s.</p>` : ""}
      ${r.by.length ? `<ul class="dgl">${r.by.map(([k, v]) => `<li><span>${esc(NOME[k] || k)}</span><b>${v}</b></li>`).join("")}</ul>` : '<p class="dgw">Nenhuma consulta ainda hoje.</p>'}
      <button type="button" id="dgcp">Copiar relatório</button>`;
    box.querySelector("#dgcp").onclick = e => {
      e.stopPropagation();
      const txt = `Paredão · diagnóstico ${new Date().toLocaleString("pt-BR")}\naparelho: ${navigator.userAgent}\nmin: ${r.m1} · 10min: ${r.m10} · hora≈${r.h} · hoje: ${r.day} (recusadas ${r.e})\n` + r.by.map(([k, v]) => `${v}\t${k}`).join("\n");
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => say("Relatório copiado"), () => say("Não deu para copiar aqui"));
    };
  }
  function mount() {
    const ref = $("#cfgpip") || $("#cfgstg"); if (!ref || $("#cfgdg")) return;
    const box = document.createElement("div"); box.id = "cfgdg"; ref.parentNode.insertBefore(box, ref.nextSibling);
    draw(box); setInterval(() => { if ($("#cfg") && $("#cfg").classList.contains("on")) draw(box); }, 2000);
  }
  mount(); setTimeout(mount, 1800);

  /* ---------- alerta de uso: avisa antes de estourar a cota do Spotify ---------- */
  // O Spotify não publica o limite. Usamos um teto escolhido (padrão 2.000 por dia neste aparelho)
  // e, se a cota já estourou alguma vez, o número daquele dia vira a referência.
  const ALV = ["", "Uso alto", "Uso muito alto", "Spotify pediu pausa"];
  let lastLv = 0, saidDay = {};
  function ceiling() {
    const own = +LSg("pd_alim", 0), c = LSg("pd_ceil", null);
    return own || (c && c.n ? Math.max(300, Math.round(c.n * .9)) : 2000);
  }
  function level() {
    const r = report(), lim = ceiling();
    if (r.pause) return { lv: 3, r, lim };
    const p = r.day / lim;
    return { lv: p >= .9 || r.h > lim / 4 ? 2 : p >= .7 || r.h > lim / 8 ? 1 : 0, r, lim };
  }
  function bar() {
    let b = $("#usoal"); if (!b) { b = document.createElement("div"); b.id = "usoal"; b.innerHTML = '<span></span><button type="button" aria-label="Fechar aviso">×</button>'; document.body.appendChild(b); b.querySelector("button").onclick = () => b.classList.remove("on"); }
    return b;
  }
  function checkUso() {
    if (!(window.SPOT && SPOT.on)) return;
    const { lv, r, lim } = level(), d = new Date().toISOString().slice(0, 10), cfgb = $("#cfgb");
    SPOT.eco = lv >= 2;
    if (cfgb) cfgb.dataset.uso = lv;
    const msg = lv === 3 ? `O Spotify pediu pausa (cota da conta). O Paredão volta sozinho em ${r.pause} s.`
      : lv === 2 ? `Uso muito alto: ${r.day} consultas hoje (teto ${lim}). Modo econômico ligado: consultas mais espaçadas.`
      : lv === 1 ? `Uso alto: ${r.day} de ${lim} consultas hoje neste aparelho. Feche o Paredão nos aparelhos que não está olhando.` : "";
    const b = bar(); b.dataset.lv = lv; b.querySelector("span").textContent = msg;
    // aviso na tela desligado (o alerta vai para fora do app); fica só o modo econômico automático
    if (window.PD_USO_BANNER && lv && (lv > lastLv || lv === 3) && saidDay[d + lv] !== 1) { saidDay[d + lv] = 1; b.classList.add("on"); }
    if (window.PD_USO_HOOK) try { PD_USO_HOOK(lv, r, lim); } catch (e) {}
    if (!lv) b.classList.remove("on");
    lastLv = lv;
  }
  setInterval(checkUso, 15000); setTimeout(checkUso, 4000);
  // campo do teto no painel de diagnóstico
  function limField(box) {
    if (box.querySelector("#alim")) return;
    const w = document.createElement("label"); w.className = "dglim";
    w.innerHTML = `Avisar quando passar de <input id="alim" type="number" min="200" step="100" inputmode="numeric"> consultas por dia <small>(${LSg("pd_ceil", null) ? "a cota já estourou com " + LSg("pd_ceil", {}).n + "; o padrão usa 90% disso" : "padrão 2.000"})</small>`;
    box.appendChild(w); const i = w.querySelector("input"); i.value = ceiling();
    i.addEventListener("click", e => e.stopPropagation());
    i.addEventListener("change", () => { try { localStorage.setItem("pd_alim", JSON.stringify(Math.max(200, +i.value || 2000))); } catch (e) {} checkUso(); });
  }
  const _draw = draw; draw = function (box) { _draw(box); const { lv, lim } = level(); box.dataset.lv = lv; limField(box); const h = box.querySelector(".tlab"); if (h) h.insertAdjacentHTML("beforeend", lv ? ` <em class="dgb l${lv}">${ALV[lv]}</em>` : ""); };

  /* ---------- roda de cores: qualquer neon ---------- */
  function hsl2hex(h, s, l) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join(""); }
  function wheel() {
    const host = $("#cfgpal"); if (!host || $("#cwh")) return;
    const w = document.createElement("div"); w.id = "cwh";
    w.innerHTML = `<div class="tlab">Ou escolha na roda de cores</div><div class="cwr"><div class="cww" role="slider" aria-label="Roda de cores"><i class="cwk"></i></div><div class="cwt"><div class="cwp"></div><label>Brilho<input type="range" id="cwl" min="35" max="80" value="56"></label><small>Toque ou arraste na roda. A cor vira o neon do app.</small></div></div>`;
    host.parentNode.insertBefore(w, host.nextSibling);
    const ww = w.querySelector(".cww"), knob = w.querySelector(".cwk"), lv = w.querySelector("#cwl"), pv = w.querySelector(".cwp");
    let cur = LSg("pd_neonc", null) || { h: 190, s: 90 }, dragging = false, raf = 0;
    const place = () => { const a = (cur.h - 90) * Math.PI / 180, r = cur.s / 100 * 50; knob.style.left = 50 + Math.cos(a) * r + "%"; knob.style.top = 50 + Math.sin(a) * r + "%"; const c = hsl2hex(cur.h, cur.s, +lv.value); knob.style.background = c; pv.style.background = c; return c; };
    const apply = () => { const c = place(); try { localStorage.setItem("pd_neonc", JSON.stringify(Object.assign(cur, { l: +lv.value, c }))); } catch (e) {} cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setNeon(c)); };
    const pick = e => { const r = ww.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); cur.h = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360; cur.s = Math.min(100, Math.hypot(x, y) / (r.width / 2) * 100); apply(); };
    ww.addEventListener("pointerdown", e => { e.stopPropagation(); dragging = true; ww.setPointerCapture(e.pointerId); pick(e); });
    ww.addEventListener("pointermove", e => { if (dragging) pick(e); });
    ww.addEventListener("pointerup", () => dragging = false);
    lv.addEventListener("input", apply);
    if (cur.l) lv.value = cur.l; place();
  }
  // a cor livre entra no tema como o neon (vale para vidro, brilho, barras e Hora do Show)
  function setNeon(c) { if (window.THEME) THEME.set({ ne: c }); }
  wheel(); setTimeout(wheel, 1500);

  /* ---------- pop-up em vídeo (iPhone/Android/computador sem barra): a página volta ao normal ---------- */
  const vd = document.querySelector("video");
  if (vd) {
    vd.addEventListener("enterpictureinpicture", () => { if (view === "p") { document.body.classList.add("vpipon"); } });
    vd.addEventListener("leavepictureinpicture", () => document.body.classList.remove("vpipon"));
  }
})();

/* ---------- aviso de uso no celular (app ntfy, grátis, sem conta) ---------- */
(function () {
  const $ = s => document.querySelector(s);
  const LSg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const LSs = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const ua = navigator.userAgent;
  const aparelho = () => /Silk|Echo|AEO/i.test(ua) ? "Echo Show" : /Tizen|SMART-TV|Web0S|WebOS|BRAVIA/i.test(ua) ? "TV" : /iPhone/i.test(ua) ? "iPhone" : /iPad/i.test(ua) ? "iPad" : /Android/i.test(ua) ? "Android" : "Computador";
  function send(title, msg, prio, tags) {
    const t = LSg("pd_ntfy", ""); if (!t) return Promise.resolve(false);
    const q = new URLSearchParams({ title, priority: String(prio || 3), tags: tags || "headphones" });
    return fetch("https://ntfy.sh/" + encodeURIComponent(t) + "?" + q, { method: "POST", body: msg }).then(r => r.ok).catch(() => false);
  }
  window.PD_NTFY = send;
  const sent = LSg("pd_ntfy_sent", {});
  window.PD_USO_HOOK = function (lv, r, lim) {
    if (!lv) return;
    const d = new Date().toISOString().slice(0, 10), key = d + ":" + lv + (lv === 3 ? ":" + Math.floor(Date.now() / 36e5) : "");
    if (sent[key]) return; sent[key] = 1;
    Object.keys(sent).forEach(k => { if (!k.startsWith(d)) delete sent[k]; }); LSs("pd_ntfy_sent", sent);
    const top = r.by && r.by[0] ? `\nMais usado: ${r.by[0][0]} (${r.by[0][1]})` : "";
    if (lv === 3) send("Paredão: cota do Spotify estourou", `No ${aparelho()} o Spotify pediu pausa. Hoje: ${r.day} consultas neste aparelho. O app espera e tenta sozinho.${top}`, 5, "rotating_light");
    else if (lv === 2) send("Paredão: uso muito alto", `${aparelho()}: ${r.day} de ${lim} consultas hoje (≈${r.h}/hora). Modo econômico ligado.${top}`, 4, "warning");
    else send("Paredão: uso alto", `${aparelho()}: ${r.day} de ${lim} consultas hoje (≈${r.h}/hora).${top}`, 3, "chart_with_upwards_trend");
  };
  function mount() {
    const ref = $("#cfgdg"); if (!ref || $("#cfgnt")) return;
    const w = document.createElement("div"); w.id = "cfgnt";
    w.innerHTML = `<div class="tlab">Aviso de uso no celular <small>(app ntfy)</small></div>
      <label>Nome do canal<input id="ntt" type="text" autocomplete="off" spellcheck="false" placeholder="ex.: paredao-mike-7k2q"></label>
      <div class="ntb"><button type="button" id="ntg">Sugerir nome</button><button type="button" id="ntx">Enviar teste</button></div>
      <small>Use o mesmo nome em todos os aparelhos e assine esse canal no app ntfy do celular.</small>`;
    ref.parentNode.insertBefore(w, ref.nextSibling);
    const i = w.querySelector("#ntt"); i.value = LSg("pd_ntfy", "");
    w.addEventListener("click", e => e.stopPropagation());
    i.addEventListener("change", () => LSs("pd_ntfy", i.value.trim().replace(/[^\w-]/g, "")));
    w.querySelector("#ntg").onclick = () => { i.value = "paredao-" + Math.random().toString(36).slice(2, 10); LSs("pd_ntfy", i.value); };
    w.querySelector("#ntx").onclick = () => { LSs("pd_ntfy", i.value.trim().replace(/[^\w-]/g, "")); send("Paredão: teste", `Aviso de uso ligado no ${aparelho()}.`, 3, "white_check_mark").then(ok => say(ok ? "Aviso de teste enviado" : "Não deu para enviar: confira o nome do canal")); };
  }
  mount(); setTimeout(mount, 2200);
})();

/* ---------- rodada 10: as 6 faces em ordem fixa, sem voltar sozinho ---------- */
(function () {
  if (typeof turn !== "function" || typeof setM !== "function") return;
  // ordem das faces: 1 Letra · 2 Capa · 3 Próximas · 4 Sua história · 5 Sobre o artista · 6 O que a letra quer dizer
  const ORDER = [1, 0, 2, 4, 5, 3];
  const NAME = { 1: "Letra", 0: "Capa", 2: "Próximas", 4: "Sua história", 5: "Sobre o artista", 3: "O que a letra quer dizer" };
  const FM = { 0: () => new DOMMatrix(), 1: () => new DOMMatrix().rotate(0, -90, 0), 2: () => new DOMMatrix().rotate(0, -180, 0), 3: () => new DOMMatrix().rotate(0, -270, 0), 4: () => new DOMMatrix().rotate(-90, 0, 0), 5: () => new DOMMatrix().rotate(90, 0, 0) };
  const cu = document.getElementById("cu");
  // confere a matriz de cada face (de cima e de baixo dependem da orientação do cubo)
  const check = f => { const m = FM[f](); const n = [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, -1, 0], [0, 1, 0]][f]; return m.transformPoint(new DOMPoint(n[0], n[1], n[2], 0)).z > .5; };
  [4, 5].forEach(f => { if (!check(f)) { const a = FM[f]; FM[f] = () => a().inverse(); } });
  window.goFace = function (f, ax, ay) {
    const o0 = cu.style.transform || M.toString();
    setM(FM[f]());
    const end = cu.style.transform;
    cu.getAnimations().forEach(a => { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); });
    // giro no sentido do gesto, com um pequeno desvio a cada vez
    const mid = new DOMMatrix(o0).preMultiplySelf ? new DOMMatrix().rotate(ax * .55, ay * .55, (Math.random() - .5) * 10).multiply(new DOMMatrix(o0)) : new DOMMatrix(o0);
    cu.animate([{ transform: o0 }, { transform: mid.toString(), offset: .42 }, { transform: end }], { duration: 1400, easing: "cubic-bezier(.4,.05,.25,1)" });
    clearTimeout(bt); // não volta sozinho para a letra
  };
  const _turn = turn;
  turn = function (x, y) {
    if (view === "p" || (typeof flipping !== "undefined" && flipping)) return _turn(x, y);
    const f = front(); let i = ORDER.indexOf(f); if (i < 0) i = 0;
    const dir = (y < 0 || x > 0) ? 1 : -1; // arrastar para a esquerda/para cima = próxima
    goFace(ORDER[(i + dir + 6) % 6], x, y);
  };
  // sem volta automática para a letra depois de 7 s
  const _setM = setM;
  setM = function (m) { _setM(m); clearTimeout(bt); };
  // marcador 1..6
  const vw = document.getElementById("vw");
  if (vw) {
    const d = document.createElement("div"); d.id = "fdots"; vw.appendChild(d); let last = -1;
    setInterval(() => { const f = front(); if (f === last) return; last = f; const i = ORDER.indexOf(f); d.innerHTML = ORDER.map((_, j) => `<i class="${j === i ? "on" : ""}"></i>`).join("") + `<b>${NAME[f] || ""}</b>`; }, 250);
  }
  // letra: cada linha nova entra vindo de dentro da tela
  const big = document.getElementById("bigly");
  if (big) new MutationObserver(() => { const h = big.querySelector("h2"); if (!h || h._t === h.textContent) return; h._t = h.textContent; h.classList.remove("in"); void h.offsetWidth; h.classList.add("in"); }).observe(big, { childList: true, subtree: true, characterData: true });
})();

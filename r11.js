/* Paredão Player — rodada 11: mini players do modo palco
   #h2 Holograma Hora do Show · Dado de controles · #88 Órbita de controles · Baralho de capas · Letras dançantes
   Fundo transparente (só o objeto flutua na tela). Os botões de dentro funcionam de verdade. */
(function () {
  const stg = document.getElementById("stg"); if (!stg || !window.STAGE || !STAGE.tpl) return;
  const sx = stg.querySelector(".sgx");
  const LAB = { pv: "Anterior", pp: "Tocar ou pausar", nx: "Próxima", fv: "Favoritar", sh: "Aleatório", ls: "Próximas músicas", mo: "Abrir o player" };
  const IC = {
    pv: '<path d="M6 5h2.3v14H6zM19 5.6v12.8L9.2 12z"/>',
    nx: '<path d="M15.7 5H18v14h-2.3zM5 5.6v12.8L14.8 12z"/>',
    pp: '<g class="pau"><rect x="6.4" y="5" width="3.9" height="14" rx="1.1"/><rect x="13.7" y="5" width="3.9" height="14" rx="1.1"/></g><path class="ply" d="M8.6 5.3v13.4L19 12z"/>',
    fv: '<path class="hl" d="M12 20.2s-7.6-4.6-7.6-10.3A4.2 4.2 0 0 1 12 7.5a4.2 4.2 0 0 1 7.6 2.4c0 5.7-7.6 10.3-7.6 10.3z"/>',
    sh: '<path class="ln" d="M3.5 7h3.6c4.6 0 5.6 10 10.2 10h3.2M3.5 17h3.6c1.6 0 2.7-1.2 3.6-2.9M13.3 9.9C14.2 8.2 15.3 7 17 7h3.4M18 4.4 20.6 7 18 9.6M18 14.4l2.6 2.6-2.6 2.6"/>',
    ls: '<path class="ln" d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10"/><circle cx="5" cy="6.5" r="1.4"/><circle cx="5" cy="12" r="1.4"/><circle cx="5" cy="17.5" r="1.4"/>',
    mo: '<circle cx="5.5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.5" cy="12" r="1.9"/>'
  };
  window.PD_IC = IC;
  const svg = a => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[a]}</svg>`;
  const B = (a, c) => `<button type="button" class="sab ${c || ""}" data-sa="${a}" aria-label="${LAB[a]}" title="${LAB[a]}">${svg(a)}</button>`;
  const T_ = '<b data-f="t"></b>', A_ = '<small data-f="a"></small>';

  /* ---------- modelos ---------- */
  Object.assign(STAGE.tpl, {
    holo2: `<div class="h2w"><div class="h2s"><div class="h2r"><i></i></div><div class="h2t"><b class="h2e" data-f="t"></b><b class="h2f" data-f="t" aria-hidden="true"></b></div>${A_}</div><div class="h2beam"></div><div class="h2pill">${B("pv")}${B("pp", "big")}${B("nx")}</div><div class="h2base"><i></i></div></div>`,
    dado: `<div class="dd"><div class="dpad"><i></i></div><div class="dfl"><div class="dcu">${["pp", "nx", "fv", "pv"].map((a, i) => `<div class="df f${i}">${B(a, "dfi")}</div>`).join("")}<div class="df ft"><i data-f="c"></i><span class="dtl" data-f="t"></span></div><div class="df fb">${B("sh", "dfi")}</div></div></div></div>`,
    orbita: `<div class="orb"><i class="oo o1"></i><i class="oo o2"></i><i class="oo o3"></i><i class="ocn"></i>${B("mo", "os t")}${B("ls", "os l")}${B("fv", "os r")}${B("sh", "os b")}<div class="oc"><i class="ocv" data-f="c"></i><b class="ot" data-f="t"></b><div class="ow">${"<i></i>".repeat(20)}</div><span class="otm" data-f="tm"></span><div class="octl">${B("pv")}${B("pp", "big")}${B("nx")}</div></div></div>`,
    baralho: `<div class="bar"><div class="bc b2"><i class="bcv" data-f="c2"></i></div><div class="bc b1"><i class="bcv" data-f="c1"></i></div><div class="bc bf"><i class="bcv" data-f="c"></i>${B("fv", "bh")}<div class="bci">${T_}${A_}<div class="bpr"><i></i></div><div class="bct">${B("pv")}${B("pp", "big")}${B("nx")}</div></div></div></div><div class="barh">arraste a carta para trocar</div>`,
    letras: `<div class="lt"><div class="ltbg"><span data-f="a"></span><span data-f="a"></span></div><div class="ltt" data-f="tk"></div><div class="ltr">${A_}${B("pp", "big")}</div></div>`
  });
  STAGE.list.push(["holo2", "Holograma Hora do Show"], ["dado", "Dado de controles"], ["orbita", "Órbita de controles"], ["baralho", "Baralho de capas"], ["letras", "Letras dançantes"]);
  if (STAGE.v0 && STAGE.tpl[STAGE.v0] && STAGE.list.some(s => s[0] === STAGE.v0) && STAGE.cur() !== STAGE.v0) STAGE.set(STAGE.v0);

  /* ---------- ações dos botões ---------- */
  const tap = a => { const b = document.createElement("button"); b.dataset.a = a; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); };
  let SH = false; try { SH = localStorage.getItem("pd_sh") === "1"; } catch (e) {}
  function setSh(v) {
    SH = v; try { localStorage.setItem("pd_sh", v ? "1" : "0"); } catch (e) {}
    if (window.SPOT && SPOT.on && SPOT.shuffle) SPOT.shuffle(v);
    window.say && say(v ? "Aleatório ligado" : "Aleatório desligado");
  }
  // aleatório também no modo demonstração
  const _next = window.next;
  if (typeof _next === "function") window.next = next = function () {
    if (SH && !(window.SPOT && SPOT.on) && !S.ql.length && T.length > 2) {
      let j = S.i, n = 0; do { j = Math.floor(Math.random() * T.length); } while ((j === S.i || (typeof kind === "function" && kind(j) !== kind(S.i))) && n++ < 60);
      if (j !== S.i) { S.i = j; S.t = 0; window.say && say("Tocando: " + T[S.i][0]); return; }
    }
    return _next.apply(this, arguments);
  };
  window.PD_DIR = "";
  function act(a) {
    if (a === "pp") return tap("pp");
    if (a === "nx") { window.PD_DIR = window.PD_DIR_P = "l"; return tap("nx"); }
    if (a === "pv") { window.PD_DIR = window.PD_DIR_P = "r"; S.t = 0; return tap("pv"); } // no baralho, voltar é sempre a carta anterior
    if (a === "fv") { const f = document.querySelector("#fm [data-f]"); f && f.click(); return; }
    if (a === "sh") return setSh(!SH);
    if (a === "mo") return window.scr && scr("pl");
    if (a === "ls") { window.scr && scr("pl"); setTimeout(() => { window.goFace ? goFace(2, 0, -1) : (window.show && show(2)); }, 450); }
  }
  window.PD_ACT = act;
  ["pointerdown", "pointerup"].forEach(ev => stg.addEventListener(ev, e => { if (e.target.closest(".sab")) e.stopPropagation(); }, true));
  stg.addEventListener("click", e => { const b = e.target.closest(".sab"); if (!b) return; e.stopPropagation(); e.preventDefault(); act(b.dataset.sa); }, true);

  /* ---------- baralho: arrastar a carta da frente ---------- */
  let cd = null;
  stg.addEventListener("pointerdown", e => {
    if (stg.dataset.st !== "baralho" || e.target.closest(".sab")) return;
    const f = e.target.closest(".bf"); if (!f) return;
    e.stopPropagation(); cd = { x: e.clientX, y: e.clientY, f, dx: 0 };
    try { f.setPointerCapture(e.pointerId); } catch (er) {}
    f.style.transition = "none";
  }, true);
  stg.addEventListener("pointermove", e => {
    if (!cd) return; e.stopPropagation();
    cd.dx = e.clientX - cd.x; const dy = (e.clientY - cd.y) * .25;
    cd.f.style.transform = `translate(${cd.dx}px,${dy}px) rotate(${cd.dx * .06}deg)`;
  }, true);
  const endDrag = e => {
    if (!cd) return; e.stopPropagation();
    const { f, dx } = cd; cd = null;
    f.style.transition = "";
    if (Math.abs(dx) > 60) { f.style.setProperty("--dx", dx + "px"); flyFrom = dx; f.style.transform = ""; act(dx < 0 ? "nx" : "pv"); }
    else { f.style.transform = ""; if (Math.abs(dx) < 6) window.scr && scr("pl"); }
  };
  stg.addEventListener("pointerup", endDrag, true);
  stg.addEventListener("pointercancel", endDrag, true);
  let flyFrom = 0;

  /* ---------- atualização: progresso, tempo, capas de trás, letras, troca de faixa ---------- */
  const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const cov = k => { try { return art(k).u || ""; } catch (e) { return ""; } };
  const nextK = (k, n) => { let j = k; for (let i = 0; i < n; i++) j = (S.ql && S.ql[i] != null) ? S.ql[i] : stepI(j, 1); return j; };
  let lastI = null, root = null, tkKey = "", ry = 0, cKey = "";
  const NEW = ["holo2", "dado", "orbita", "baralho", "letras"];
  function letters(t) {
    let w = 0, i = 0;
    return String(t).split(/(\s+)/).map(p => {
      if (/^\s+$/.test(p)) { w++; return '<span class="sp"> </span>'; }
      return `<span class="w w${w % 2}">` + [...p].map(c => `<i style="--i:${i++}">${c.replace(/[&<>"]/g, m => "&#" + m.charCodeAt(0) + ";")}</i>`).join("") + "</span>";
    }).join("");
  }
  function change(st, from, to) {
    let dir = window.PD_DIR; window.PD_DIR = "";
    if (!dir) dir = (from != null && to === stepI(from, -1)) ? "r" : "l";
    const R = sx.firstElementChild; if (!R) return;
    if (st === "dado") { ry += dir === "l" ? -90 : 90; R.querySelector(".dcu").style.setProperty("--ry", ry + "deg"); R.classList.remove("hop"); void R.offsetWidth; R.classList.add("hop"); }
    else if (st === "baralho" && from != null) {
      const f = R.querySelector(".bf"); if (!f) return;
      const g = f.cloneNode(true); g.classList.remove("bf"); g.classList.add("bg", dir === "l" ? "gl" : "gr");
      g.style.setProperty("--dx", (flyFrom || 0) + "px"); g.style.transform = ""; flyFrom = 0;
      const t = T[from] || ["", ""]; g.querySelector("[data-f=t]").textContent = t[0]; g.querySelector("[data-f=a]").textContent = t[1];
      g.querySelector("[data-f=c]").style.backgroundImage = `url(${cov(from)})`;
      g.querySelectorAll("button").forEach(b => b.remove());
      R.appendChild(g); setTimeout(() => g.remove(), 700);
      f.classList.remove("rise"); void f.offsetWidth; f.classList.add("rise");
    } else { R.classList.remove("chg"); void R.offsetWidth; R.classList.add("chg"); }
  }
  function tick() {
    const st = stg.dataset.st; if (!NEW.includes(st)) { lastI = S.i; return; }
    if (!(stg.classList.contains("on") || stg.classList.contains("inpip") || stg.classList.contains("prev"))) { lastI = S.i; return; }
    const R = sx.firstElementChild;
    if (R !== root) { root = R; tkKey = ""; cKey = ""; ry = 0; lastI = S.i; }
    if (!R) return;
    const k = S.i, d = (typeof D !== "undefined" ? D : 0) || 0, pr = d ? Math.min(1, S.t / d) : 0;
    stg.style.setProperty("--pr", pr.toFixed(4));
    stg.classList.toggle("pl", !!S.p);
    stg.classList.toggle("fv", typeof FAV !== "undefined" && FAV.has(k));
    stg.classList.toggle("sh", SH);
    R.querySelectorAll("[data-f=tm]").forEach(e => e.textContent = mmss(S.t) + " / " + mmss(d));
    const n = R.querySelectorAll(".ow i"); n.forEach((e, i) => e.classList.toggle("on", i < Math.round(pr * n.length)));
    if (k !== lastI) { const f = lastI; lastI = k; change(st, f, k); }
    if (st === "baralho") {
      const ck = k + "|" + (S.ql || []).join(","); if (ck !== cKey) { cKey = ck; const a = nextK(k, 1), b = S.ql && S.ql.length > 1 ? S.ql[1] : stepI(a, 1);
        const c1 = R.querySelector("[data-f=c1]"), c2 = R.querySelector("[data-f=c2]"); c1 && (c1.style.backgroundImage = `url(${cov(a)})`); c2 && (c2.style.backgroundImage = `url(${cov(b)})`); }
    }
    if (st === "letras" || st === "holo2") {
      const t = (T[k] || ["Paredão Player"])[0];
      if (t !== tkKey) {
        tkKey = t;
        const el = R.querySelector("[data-f=tk]"); if (el) el.innerHTML = letters(t);
        const n = t.length, fs = st === "holo2" ? (n <= 10 ? 3.6 : n <= 16 ? 3.1 : n <= 24 ? 2.5 : 2) : (n <= 12 ? 2.4 : n <= 20 ? 1.9 : 1.5);
        R.style.setProperty("--fs", fs + "em");
      }
    }
  }
  setInterval(tick, 200);
  const mo = new MutationObserver(() => { root = null; tick(); });
  mo.observe(sx, { childList: true });
})();

/* ---------- Configurações → Modo palco → Fundo transparente (ligado / desligado) ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg) return;
  const on = () => { try { return localStorage.getItem("pd_stgtr") !== "0"; } catch (e) { return true; } };
  const apply = () => {
    stg.classList.toggle("opq", !on());
    const w = window.PIP && PIP.win; if (w && w.document && w.document.body) w.document.body.style.background = on() ? "#000" : "";
  };
  const add = () => {
    const ref = document.getElementById("cfgpip") || document.getElementById("cfgstg"); if (!ref || document.getElementById("cfgtr")) return;
    const b = document.createElement("div"); b.id = "cfgtr";
    const draw = () => { const v = on(); b.innerHTML = '<div class="tlab">Modo palco · fundo transparente</div><div class="pipseg"><button type="button" data-tr="1" class="' + (v ? "on" : "") + '">Ligado<small>só o mini player flutua por cima da tela</small></button><button type="button" data-tr="0" class="' + (v ? "" : "on") + '">Desligado<small>mini player dentro de um painel de vidro</small></button></div>'; };
    draw();
    b.addEventListener("click", e => { const t = e.target.closest("[data-tr]"); if (!t) return; e.stopPropagation(); try { localStorage.setItem("pd_stgtr", t.dataset.tr); } catch (er) {} draw(); apply(); stg.classList.add("prev"); clearTimeout(b._t); b._t = setTimeout(() => stg.classList.remove("prev"), 2500); });
    ref.parentNode.insertBefore(b, ref.nextSibling);
  };
  apply(); add(); setTimeout(add, 1600); setInterval(apply, 1000);
})();

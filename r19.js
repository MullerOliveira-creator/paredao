/* Paredão Player — rodada 19
   1. Letra em tela cheia: quando o cubo vira para a letra, ele vira a lente de um projetor e a face se abre cobrindo a tela
      (entre os ícones de cima e os controles de baixo), em qualquer orientação. O contorno é o tempo da música.
      Fundo escolhido nas Configurações: Holograma, Capa embaçada, Cubo translúcido ou Cubo sólido.
   2. Configurações do Modo palco com nomes mais simples e divertidos.
   3. Fumaça do cavalo na cor nova assim que a cor muda. */
(function () {
  if (document.getElementById("holo")) return;
  const h = document.createElement("div"); h.id = "holo"; h.setAttribute("aria-hidden", "true");
  h.innerHTML = '<i class="hscan"></i><i class="hgrain"></i><i class="hc tl"></i><i class="hc tr"></i><i class="hc bl"></i><i class="hc br"></i>';
  const pj = document.createElement("div"); pj.id = "hproj"; pj.innerHTML = '<i class="beam"></i><i class="lens"></i>';
  document.body.appendChild(h); document.body.appendChild(pj);
  // retângulo da projeção: a tela toda, sem a barra de cima e sem os botões de baixo, em qualquer orientação
  function rect() {
    const W = innerWidth, H = innerHeight, port = H > W;
    // encaixa entre o que está em cima (ícones, Hora do Show, marcador de faces) e os controles de baixo
    let top = 16, bot = H - 16, sideL = port ? 12 : Math.max(18, W * .03), sideR = sideL;
    const vis = e => { const r = e.getBoundingClientRect(); return r.width && r.height && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).display !== "none" ? r : null; };
    // em cima: só o que fica no meio da largura (marcador de faces, Hora do Show)
    document.querySelectorAll(".gbtn,#pn,.hsw,#fdots").forEach(e => { const r = vis(e); if (!r) return; const cx = (r.left + r.right) / 2; if (r.bottom < H * .4 && cx > W * .2 && cx < W * .8 && r.bottom > top) top = r.bottom; });
    document.querySelectorAll("#stage .tr,#stage .cb,#stage .ctl").forEach(e => { const r = vis(e); if (r && r.top > H * .45 && r.top < bot) bot = r.top; });
    // botões nas laterais que descem até a altura do painel: o painel desvia deles
    document.querySelectorAll(".gbtn").forEach(e => { const r = vis(e); if (!r || r.bottom <= top + 10 || r.top > bot) return; if (r.right < W * .3) sideL = Math.max(sideL, r.right + 10); else if (r.left > W * .7) sideR = Math.max(sideR, W - r.left + 10); });
    return { left: sideL, top: top + 10, right: W - sideR, bottom: bot - (port ? 16 : 12) };
  }
  function place() {
    const r = rect();
    Object.assign(h.style, { left: r.left + "px", top: r.top + "px", width: (r.right - r.left) + "px", height: (r.bottom - r.top) + "px" });
    Object.assign(pj.style, { left: (r.left + r.right) / 2 + "px", top: r.bottom + "px" });
    const b = document.getElementById("bigly");
    if (b && document.body.classList.contains("holo")) Object.assign(b.style, { position: "fixed", left: (r.left + r.right) / 2 + "px", top: (r.top + r.bottom) / 2 + "px", width: (r.right - r.left - 40) + "px", transform: "translate(-50%,-50%)" });
    if (b && document.body.classList.contains("holo")) { const ph = (r.bottom - r.top) * .9, bh = b.offsetHeight || 1; const k = Math.min(1, ph / bh); b.style.transform = `translate(-50%,-50%) scale(${k.toFixed(3)})`; }
  }
  let was = false;
  setInterval(() => {
    let f = -1; try { f = front(); } catch (e) {}
    const on = document.body.dataset.s === "pl" && f === 1 && (typeof view === "undefined" || view !== "p");
    document.body.classList.toggle("holo", on);
    if (on !== was) { was = on; const b = document.getElementById("bigly"); if (b && !on) b.removeAttribute("style"); }
    place();
    if (on) { let u = ""; try { u = art(S.i).u || ""; } catch (e) {} if (h._u !== u) { h._u = u; h.style.setProperty("--hcov", u ? `url("${u}")` : "none"); } }
  }, 120);
  // fundo da letra: cubo opaco, cubo translúcido, capa embaçada ou holograma
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
  window.HL = v => { document.body.dataset.hl = v; LS("pd_hl", v); document.querySelectorAll("[data-hl19]").forEach(b => b.classList.toggle("on", b.dataset.hl19 === v)); };
  HL(LS("pd_hl") || "holo");
  window.PD_RING = () => document.body.classList.contains("holo") ? (() => { const r = rect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; })() : null;
  addEventListener("resize", place);
})();

/* ---------- 2. Configurações: nomes simples e divertidos ---------- */
(function () {
  const $ = s => document.querySelector(s);
  const H = (id, html) => { const box = $("#" + id); if (!box) return; let h = box.querySelector(":scope>.tl19"); if (!h) { h = document.createElement("div"); h.className = "tlab tl19"; box.insertBefore(h, box.firstChild); } if (h.innerHTML !== html) h.innerHTML = html; };
  const BT = (sel, t, s) => { const b = $(sel); if (!b) return; const html = `${t}<small>${s}</small>`; if (b.innerHTML !== html) b.innerHTML = html; };
  const esc = s => String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";");
  function run() {
    const intro = $("#cfgpalh");
    if (intro) { const h = '<b>🎤 Modo palco</b><span>Saiu do player? A música não para: um mini player sobe ao palco e fica com você em qualquer tela.</span>'; if (intro.innerHTML !== h) intro.innerHTML = h; }
    let nm = ""; try { const c = STAGE.cur(); const it = STAGE.list.find(s => s[0] === c); nm = it ? it[1] : ""; } catch (e) {}
    H("cfgstg", `<b>1.</b> Quem sobe ao palco · <b>${esc(nm)}</b>`);
    H("cfgtr", "<b>2.</b> Como ele aparece na tela");
    BT('#cfgtr [data-tr16="1"]', "Solto", "flutua sozinho, sem nada atrás");
    BT('#cfgtr [data-tr16="f"]', "Fosco", "com um vidro jateado atrás");
    BT('#cfgtr [data-tr16="0"]', "Na vitrine", "dentro de uma caixa de vidro");
    H("cfgpip", "<b>3.</b> Janelinha fora do Paredão <small>(botão pop-up, por cima de outros apps)</small>");
    BT("#cfgpip [data-pm=v]", "Vídeo", "leve; usa os controles do sistema (iPhone)");
    BT("#cfgpip [data-pm=w]", "Janela", "com os botões e o volume do Paredão (Chrome e Edge)");
    H("cfgcop", "<b>4.</b> Cubo do player");
    const cs = document.querySelectorAll("#cfgcop .cops small"); if (cs.length === 2) { if (cs[0].textContent !== "mais vidro") cs[0].textContent = "mais vidro"; if (cs[1].textContent !== "mais sólido") cs[1].textContent = "mais sólido"; }
    // 5. fundo da letra em tela cheia
    const cop = $("#cfgcop");
    if (cop && !$("#cfghl")) {
      const b = document.createElement("div"); b.id = "cfghl";
      const O = [["holo", "Holograma", "projeção na cor do tema"], ["capa", "Capa embaçada", "a capa da música, desfocada"], ["cubo-tr", "Cubo de vidro", "o vidro do cubo, ampliado"], ["cubo-op", "Cubo sólido", "o cubo fechado, ampliado"]];
      b.innerHTML = '<div class="tlab tl19"><b>5.</b> Fundo da letra em tela cheia</div><div class="pipseg hl4">' + O.map(([k, t, s]) => `<button type="button" data-hl19="${k}">${t}<small>${s}</small></button>`).join("") + "</div>";
      cop.parentNode.insertBefore(b, cop.nextSibling);
      b.addEventListener("click", e => { const x = e.target.closest("[data-hl19]"); if (!x) return; e.stopPropagation(); HL(x.dataset.hl19); });
      HL(document.body.dataset.hl || "holo");
    }
  }
  run(); setInterval(run, 400);
})();

/* Paredão Player — rodada 18: o que você viu usando no dia a dia (TV, Windows e Echo)
   1. Barrinha do mini player (Windows) só aparece com o mouse em cima; menor e mais perto, como a do Corel.
   2. Modo não perturbe: o mini player vira só as barrinhas do som, do tamanho de um ícone da barra de tarefas.
   3. Holograma: botões finos que aparecem ao passar o mouse/tocar; base do projetor em 3D.
   4. Holograma Hora do Show: botões menores; o holograma brilha.
   5. Dado mais calmo (giro mais lento).
   6. Trocar o estilo nas Configurações não acende o mini player atrás.
   7. Botão "Próximas" do mini player abre o player na fila (no Windows também).
   8. Aumentar e diminuir no Windows em passos pequenos (mais fluido).
   9. Voltar: no começo da música volta para a anterior; depois de 3 s volta ao começo (sem pular de volta para o meio).
  10. Letra em aparelhos que só acompanham (Echo, TV): confere a troca de música mais rápido. */

/* ---------- 1 e 8: barrinha do Windows ---------- */
(function () {
  const de = document.documentElement;
  const desk = () => de.classList.contains("desk") || de.classList.contains("deskfull");
  const stg = document.getElementById("stg");
  let bar = null, hideT = 0, over = false;
  const show = () => { if (!bar) return; bar.classList.add("vis"); clearTimeout(hideT); };
  const hideSoon = () => { clearTimeout(hideT); hideT = setTimeout(() => { if (!over && bar) bar.classList.remove("vis"); }, 1200); };
  function near(x, y) {
    const pad = 28; const rs = [stg && stg.getBoundingClientRect(), bar && bar.getBoundingClientRect()].filter(r => r && r.width);
    return rs.some(r => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad);
  }
  addEventListener("mousemove", e => { if (!desk() || de.classList.contains("deskfull")) return; over = near(e.clientX, e.clientY); over ? show() : hideSoon(); }, true);
  addEventListener("mouseleave", () => { over = false; hideSoon(); });
  document.addEventListener("mouseout", e => { if (!e.relatedTarget) { over = false; hideSoon(); } });
  // aumentar/diminuir: 5 passos pequenos em vez de um salto
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("#dtb [data-d=mn],#dtb [data-d=pl]"); if (!b || !window.paredaoDesk || !paredaoDesk.zoom) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const s = b.dataset.d === "pl" ? .02 : -.02;
    for (let i = 0; i < 5; i++) setTimeout(() => { try { paredaoDesk.zoom(s); } catch (er) {} }, i * 28);
  }, true);
  const t = setInterval(() => { bar = document.getElementById("dtb"); if (bar) { clearInterval(t); hideSoon(); } }, 300);
})();

/* ---------- 2: não perturbe ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg) return;
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
  const DND = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.6 12h8.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const eq = document.createElement("button"); eq.type = "button"; eq.id = "dndq"; eq.title = "Não perturbe ligado · toque para voltar"; eq.setAttribute("aria-label", "Sair do não perturbe");
  eq.innerHTML = "<i></i><i></i><i></i><i></i><i></i>"; stg.appendChild(eq);
  const set = v => { stg.classList.toggle("dnd", v); LS("pd_dnd", v ? "1" : "0"); document.querySelectorAll("[data-dnd]").forEach(b => b.classList.toggle("on", v)); };
  ["pointerdown", "pointerup"].forEach(t => eq.addEventListener(t, e => e.stopPropagation(), true));
  eq.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); set(false); });
  // barrinhas do som (sobem e descem no ritmo; paradas quando pausado)
  const bars = [...eq.children];
  (function loop() {
    if (stg.classList.contains("dnd")) { const t = performance.now() / 1000; bars.forEach((b, i) => { const v = S.p ? .25 + .75 * Math.abs(Math.sin(t * (3.1 + i * .7) + i * 1.3) * Math.cos(t * (1.7 + i * .45) + i)) : .18; b.style.transform = `scaleY(${v.toFixed(3)})`; }); }
    requestAnimationFrame(loop);
  })();
  // botão no Windows (barrinha) e no próprio mini player da página (canto)
  const addBar = () => {
    const bar = document.getElementById("dtb"); if (!bar || bar.querySelector("[data-dnd]")) return;
    const b = document.createElement("button"); b.type = "button"; b.dataset.dnd = "1"; b.title = "Não perturbe: deixa só as barrinhas do som"; b.innerHTML = DND;
    const x = bar.querySelector("[data-d=x]"); bar.insertBefore(b, x || null);
    b.addEventListener("click", e => { e.stopPropagation(); set(!stg.classList.contains("dnd")); });
  };
  const addStg = () => {
    if (stg.querySelector(".dndb")) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "dndb"; b.dataset.dnd = "1"; b.title = "Não perturbe"; b.setAttribute("aria-label", "Não perturbe"); b.innerHTML = DND; stg.appendChild(b);
    ["pointerdown", "pointerup"].forEach(t => b.addEventListener(t, e => e.stopPropagation(), true));
    b.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); set(true); });
  };
  addBar(); addStg(); setTimeout(addBar, 1500); setTimeout(addBar, 4000);
  if (LS("pd_dnd") === "1") set(true);
  window.PD_DND = set;
})();

/* ---------- 3: Holograma com botões finos ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg || !window.STAGE) return;
  const IC = window.PD_IC || {};
  const B = a => `<button type="button" class="sab hb" data-sa="${a}" aria-label="${{ pv: "Anterior", pp: "Tocar ou pausar", nx: "Próxima" }[a]}"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[a] || ""}</svg></button>`;
  STAGE.tpl.holo = `<div class="hol"><div class="beam"></div><i data-f="c"></i><div class="ptx"><b data-f="t"></b><small data-f="a"></small></div><div class="hctl">${B("pv")}${B("pp")}${B("nx")}</div><div class="base"><i class="r1"></i><i class="r2"></i><i class="r3"></i></div></div>`;
  if (STAGE.cur() === "holo") { const l = stg.style.left, t = stg.style.top; STAGE.set("holo"); stg.style.left = l; stg.style.top = t; }
  // os botões .sab já têm ação (rodada 11); aqui só o estado de tocando
  setInterval(() => stg.classList.toggle("pl", !!S.p), 300);
})();

/* ---------- 6: trocar estilo não acende o mini player atrás ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg) return;
  new MutationObserver(() => { if (stg.classList.contains("prev") && !stg.classList.contains("on")) stg.classList.remove("prev"); }).observe(stg, { attributes: true, attributeFilter: ["class"] });
})();

/* ---------- 7: "Próximas" no mini player abre o player na fila (no Windows, abre o player completo) ---------- */
(function () {
  const stg = document.getElementById("stg"); if (!stg) return;
  stg.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".sab[data-sa=ls]"); if (!b) return;
    const de = document.documentElement; if (!de.classList.contains("desk")) return; // na página a rodada 11 já resolve
    e.stopImmediatePropagation(); e.preventDefault();
    const cf = document.querySelector("#dtb [data-d=cf]"); if (cf) cf.click();
    setTimeout(() => { try { goFace(2, 0, -1); } catch (er) {} }, 700);
  }, true);
})();

/* ---------- 9 e 10: voltar e sincronia da letra ---------- */
(function () {
  if (typeof prev === "function") {
    const _p = prev;
    window.prev = prev = function () {
      // depois de 3 s: volta ao começo e segura a próxima conferência com o Spotify,
      // senão a resposta antiga chegava depois e jogava o tempo de volta para o meio da música
      if (window.SPOT && SPOT.on && S.t > 3) { SPOT.pauseUntil = Date.now() + 1800; SPOT.kickAt = Date.now() + 1900; }
      return _p.apply(this, arguments);
    };
  }
  // aparelho que só acompanha (a música toca em outro): com a letra na tela, confere a cada 5 s
  setInterval(() => {
    const SP = window.SPOT; if (!SP || !SP.on || !S.p || SP.eco || document.hidden) return;
    if (SP.curName === "Este navegador") return; // aqui o próprio player avisa na hora
    if (!(window.PD_LYRICS_ON && PD_LYRICS_ON())) return;
    if (SP.kickAt || Date.now() < (SP.pauseUntil || 0)) return;
    if (Date.now() - (SP.lastSync || 0) > 5000) SP.kickAt = Date.now();
  }, 1000);
})();

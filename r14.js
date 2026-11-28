/* Paredão Player — rodada 14: motor de tempo
   1. Um relógio só: o tempo da música é calculado a partir do último ponto conferido com o Spotify
      (posição + quanto tempo passou), em vez de ir somando pedacinhos. Não acumula erro, nem quando a aba fica em segundo plano.
   2. A letra avisa o motor quando está na tela, e aí o tempo é conferido com o Spotify a cada 12 s.
   3. Programa de Windows: o mini player não pode mais ser escondido por outras partes do código. */
(function () {
  /* ---------- 1. relógio ---------- */
  const A = { pos: S.t || 0, at: performance.now(), i: S.i, p: S.p };
  let last = S.t || 0;
  function tick() {
    const now = performance.now();
    // alguém mudou o tempo de propósito (Spotify respondeu, pulo na barra, troca de música, pausa)? Vira o novo ponto de partida.
    if (S.i !== A.i || S.p !== A.p || Math.abs(S.t - last) > .35) { A.pos = S.t; A.at = now; A.i = S.i; A.p = S.p; }
    if (S.p) {
      const d = (typeof D !== "undefined" && D) ? D : Infinity;
      S.t = Math.min(d, A.pos + (now - A.at) / 1000);
    } else { A.pos = S.t; A.at = now; }
    last = S.t;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  // segundo plano: o navegador pausa a animação; ao voltar, o tempo continua certo porque é calculado, não somado
  window.PD_CLOCK = A;

  /* ---------- 2. a letra está na tela? ---------- */
  window.PD_LYRICS_ON = () => {
    if (document.hidden) return false;
    if (document.body.classList.contains("bigon")) return true; // face da letra no player
    const dl = document.getElementById("dly"); if (dl && dl.offsetParent && dl.textContent.trim()) return true; // programa de Windows
    return false;
  };

  /* ---------- 3. programa de Windows: hierarquia ---------- */
  if (!document.documentElement.classList.contains("desk") && !/ParedaoDesk\//.test(navigator.userAgent)) return;
  const stg = document.getElementById("stg"); if (!stg) return;
  const isFull = () => document.documentElement.classList.contains("deskfull");
  // só o programa decide o que aparece: no modo mini, a tela é sempre "desk" e o mini player sempre visível
  const keep = () => {
    if (isFull()) return;
    if (document.body.dataset.s !== "desk") document.body.dataset.s = "desk";
    try { started = 1; } catch (e) {}
    if (!stg.classList.contains("on")) stg.classList.add("on");
    if (getComputedStyle(stg).display === "none") stg.style.setProperty("display", "block", "important");
  };
  if (typeof stgU === "function") { const _u = stgU; stgU = function () { const r = _u.apply(this, arguments); keep(); return r; }; }
  new MutationObserver(keep).observe(document.body, { attributes: true, attributeFilter: ["data-s"] });
  new MutationObserver(keep).observe(stg, { attributes: true, attributeFilter: ["class", "style"] });
  setInterval(keep, 500);
})();

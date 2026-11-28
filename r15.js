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
    if (pal.contains(document.activeElement) && document.activeElement.type === "range") return; // não redesenha enquanto arrasta
    const c = cur(), t = T0(), nb = Math.round((t.nb || 0) * 100);
    pal.className = "cfg15";
    pal.innerHTML =
      `<div class="c15">` +
      `<label class="cball"><input type="color" data-k="bg" value="${esc(c.bg)}" aria-label="Cor do fundo"><i style="background:${esc(c.bg)}"></i><b>Fundo</b><small>a cor de trás</small></label>` +
      `<label class="cball"><input type="color" data-k="ne" value="${esc(THEME.NEONS[t.ne] ? THEME.NEONS[t.ne][1] : t.ne)}" aria-label="Cor do neon"><i style="background:${esc(c.ne)}"></i><b>Neon</b><small>brilhos, bordas e destaques</small></label>` +
      `</div><div class="tlab">Brilho do neon</div><div class="c15b"><small>mais escuro</small><input type="range" id="nbr" min="-40" max="40" step="5" value="${nb}" aria-label="Brilho do neon"><small>mais claro</small></div>` +
      `<div class="tlab">Combinações prontas</div><div class="c15p">` + PRE.map(([b, n], j) => `<button type="button" data-pr="${j}" title="Fundo ${b} · Neon ${n}" style="--b:${b};--n:${n}"><i></i></button>`).join("") + `</div>`;
    const h = pal.previousElementSibling; if (h && h.tagName === "H4") h.textContent = "Cores";
  };
  pal.addEventListener("input", e => {
    const el = e.target; e.stopPropagation();
    if (el.dataset.k === "bg") { el.nextElementSibling.style.background = el.value; set({ bgx: el.value }); }
    else if (el.dataset.k === "ne") { el.nextElementSibling.style.background = el.value; set({ ne: el.value }); }
    else if (el.id === "nbr") set({ nb: +el.value / 100 });
  }, true);
  pal.addEventListener("change", () => setTimeout(() => drawTheme(), 50), true);
  pal.addEventListener("click", e => {
    const b = e.target.closest("[data-pr]"); if (!b) return; e.stopImmediatePropagation(); e.preventDefault();
    const [bg, ne] = PRE[+b.dataset.pr]; THEME.set({ bgx: bg, ne, nb: 0 });
  }, true);
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

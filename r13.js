/* Paredão Player — rodada 13: modo "Paredão para Windows"
   Quando a página abre dentro do programa de Windows (Electron), só o mini player do modo palco aparece,
   sem fundo, solto na área de trabalho. Barrinha em cima: arrastar · diminuir · aumentar · configurações · fechar.
   No navegador comum nada disso acontece. */
(function () {
  const D_ = window.paredaoDesk; if (!D_ && !/ParedaoDesk\//.test(navigator.userAgent)) return;
  const de = document.documentElement, stg = document.getElementById("stg"); if (!stg) return;
  let full = false;
  de.classList.add("desk");
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const bar = document.createElement("div"); bar.id = "dtb";
  bar.innerHTML =
    `<span class="dh" title="Arraste para mover">${icon('<circle cx="8" cy="6" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>')}</span>` +
    `<button type="button" data-d="mn" title="Diminuir">${icon('<path d="M5 12h14" class="s"/>')}</button>` +
    `<button type="button" data-d="pl" title="Aumentar">${icon('<path d="M5 12h14M12 5v14" class="s"/>')}</button>` +
    `<button type="button" data-d="cf" title="Abrir o player completo (login, estilos)">${icon('<path class="s" d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM19 12l2-1-1-3-2.2.2-1.3-1.3L16.7 4.7l-3-1-1 2h-1.4l-1-2-3 1 .2 2.2L6.2 8.2 4 8l-1 3 2 1v1.4l-2 1 1 3 2.2-.2 1.3 1.3-.2 2.2 3 1 1-2h1.4l1 2 3-1-.2-2.2 1.3-1.3 2.2.2 1-3-2-1z"/>')}</button>` +
    `<button type="button" data-d="x" title="Fechar">${icon('<path d="M6 6l12 12M18 6 6 18" class="s"/>')}</button>`;
  document.body.appendChild(bar);
  const send = (c, v) => { try { D_ && D_[c] && D_[c](v); } catch (e) {} };
  bar.addEventListener("click", e => {
    const b = e.target.closest("[data-d]"); if (!b) return; e.stopPropagation();
    const d = b.dataset.d;
    if (d === "mn") send("zoom", -.1); else if (d === "pl") send("zoom", .1); else if (d === "x") send("close");
    else if (d === "cf") setFull(!full);
  });
  // começa direto no mini player (sem tela de espera)
  const goMini = () => { try { started = 1; } catch (e) {} document.body.dataset.s = "desk"; try { stgU(); } catch (e) {} };
  const _scr = scr;
  scr = function (n) { if (!full && n === "pl") return; return _scr(n); }; // clicar no mini player não abre o player aqui
  function setFull(v) {
    full = v; de.classList.toggle("desk", !v); de.classList.toggle("deskfull", v);
    bar.querySelector("[data-d=cf]").title = v ? "Voltar ao mini player" : "Abrir o player completo (login, estilos)";
    send("full", v);
    if (v) { try { _scr("pl"); } catch (e) {} } else goMini();
    fitLater();
  }
  setTimeout(goMini, 300); setTimeout(goMini, 1500);
  // a janela acompanha o tamanho do mini player
  let lastFit = "";
  function fit() {
    if (full) return;
    const r = stg.getBoundingClientRect(); if (!r.width) return;
    const w = Math.ceil(r.width + 70), h = Math.ceil(r.height + 110), k = w + "x" + h;
    if (k !== lastFit) { lastFit = k; send("fit", { w, h }); }
  }
  const fitLater = () => setTimeout(fit, 400);
  setInterval(fit, 1000);
  // cliques "atravessam" as partes transparentes da janela
  let thru = null;
  addEventListener("mousemove", e => {
    if (full) { if (thru !== false) { thru = false; send("mouse", false); } return; }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const hit = !!(el && el.closest && el.closest("#stg,#dtb"));
    const t = !hit; if (t !== thru) { thru = t; send("mouse", t); }
  });
  addEventListener("mouseleave", () => { if (!full) { thru = true; send("mouse", true); } });
})();

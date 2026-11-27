/* Paredão Player — pop-up de verdade (Document Picture-in-Picture)
   Chrome/Edge 116+ no Windows/Mac/Linux: a janelinha fica por cima de outras abas e de outros programas.
   Onde não existe (Safari/iPhone, TV Samsung, Echo Show), o modo pop-up continua sendo o holograma dentro da página. */
(function () {
  const DPIP = window.documentPictureInPicture;
  const PIP = window.PIP = { win: null, ok: !!DPIP };
  const _sv = setView;
  let home = null, next = null, mo = null;

  const css = document.createElement("style");
  css.textContent = `body.pipon #stage.p .fk{display:none}
#pipnote{display:none}body.pipon #stage.p #pipnote{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:40vh;text-align:center;opacity:.8;padding:20px}
#pipnote button{font:inherit;padding:8px 16px;border-radius:99px;border:1px solid color-mix(in srgb,var(--a) 60%,transparent);background:color-mix(in srgb,var(--a) 14%,transparent);color:inherit;cursor:pointer}`;
  document.head.appendChild(css);
  const note = document.createElement("div");
  note.id = "pipnote";
  note.innerHTML = `<b>O player está na janelinha flutuante</b><span>Ela fica por cima das outras abas e programas. Pode trocar de aba à vontade.</span><button type="button" id="pipback">Trazer de volta</button>`;
  stage.appendChild(note);
  note.querySelector("#pipback").onclick = () => setView("n");

  const PIPCSS = `html,body{margin:0;height:100%;overflow:hidden;background:var(--bg)}
body{display:flex;align-items:center;justify-content:center}
#pop{display:block!important;position:static!important;zoom:1!important;width:100%!important;max-width:none;animation:none!important;--cs:min(60vw,46vh);left:auto!important;top:auto!important}
#pop .hg,#pop .cone{display:none}`;

  function syncTheme() {
    const w = PIP.win; if (!w) return;
    const de = w.document.documentElement;
    de.className = document.documentElement.className;
    de.setAttribute("style", document.documentElement.getAttribute("style") || "");
  }

  async function open() {
    const w = await DPIP.requestWindow({ width: 340, height: 480 });
    PIP.win = w;
    const d = w.document;
    const base = d.createElement("base"); base.href = location.href; d.head.appendChild(base);
    document.querySelectorAll("style,link[rel=stylesheet]").forEach(n => d.head.appendChild(n.cloneNode(true)));
    const st = d.createElement("style"); st.textContent = PIPCSS; d.head.appendChild(st);
    d.title = "Paredão Player";
    d.body.className = "p"; d.body.dataset.s = "pl";
    syncTheme();
    mo = new MutationObserver(syncTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    home = pop.parentNode; next = pop.nextSibling;
    pop.style.left = pop.style.top = ""; pop.style.right = "";
    d.body.appendChild(pop);
    document.body.classList.add("pipon");
    // botões da janelinha usam o mesmo tratador de cliques da página
    d.body.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      e.preventDefault();
      const px = document.createElement("button"); px.dataset.a = b.dataset.a; px.hidden = true;
      document.body.appendChild(px); px.click(); px.remove();
    });
    d.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); const px = document.createElement("button"); px.dataset.a = "pp"; px.hidden = true; document.body.appendChild(px); px.click(); px.remove(); } });
    // aba escondida: o navegador freia a animação da página; a janelinha continua desenhando
    (function loop() {
      if (PIP.win !== w) return;
      if (document.hidden) { try { frame(performance.now()); } catch (e) {} }
      w.requestAnimationFrame(loop);
    })();
    w.addEventListener("pagehide", () => {
      if (mo) mo.disconnect(); mo = null;
      if (home) home.insertBefore(pop, next && next.parentNode === home ? next : null);
      document.body.classList.remove("pipon");
      PIP.win = null;
      if (view === "p") _sv("n");
    });
  }

  setView = function (v) {
    _sv(v);
    if (!DPIP) return;
    if (v === "p" && !PIP.win) open().catch(e => { console.warn("pip", e); say("O navegador não abriu a janelinha; usando o pop-up dentro da página."); });
    else if (v !== "p" && PIP.win) PIP.win.close();
  };
  addEventListener("pagehide", () => { if (PIP.win) PIP.win.close(); });
})();

/* Paredão Player · integração com o Spotify
   Login PKCE (só Client ID), Web Playback SDK, Web API (Dev Mode 2026),
   letras sincronizadas via LRCLIB e Rádio via Last.fm. */
(() => {
  "use strict";
  const LS = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const REDIRECT = location.origin + location.pathname;
  const SCOPES = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify user-top-read user-read-recently-played user-read-playback-position";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const SP = [];                       // metadados do Spotify por índice de T
  const SPOT = { on: false, sdkOk: false, dev: null, target: null, devs: [], player: null, lfm: LS.get("pd_lfm") || "" };
  SPOT.SP = SP;
  window.SPOT = SPOT;
  let tok = {};
  try { tok = JSON.parse(LS.get("pd_tok") || "{}") || {}; } catch (e) { tok = {}; }

  /* ---------- interface de configuração ---------- */
  const glass = "background:linear-gradient(180deg,#10364a,#061a28 62%,#082030);box-shadow:inset 0 0 0 1.5px rgba(160,235,250,.8),0 0 22px rgba(31,211,242,.35),0 14px 30px rgba(0,0,0,.6)";
  document.head.insertAdjacentHTML("beforeend", `<style>
#cfgb{position:fixed;top:12px;right:12px;width:42px;height:42px;margin:0;padding:0;border:0;border-radius:12px;background:none;box-shadow:none;color:#e8fdff;z-index:7;display:grid;place-items:center}
#cfgb:hover{background:none;box-shadow:none;transform:scale(1.1)}#cfgb:before{display:none}#cfgb svg{width:24px;height:24px}
body:not([data-s=home]):not([data-s=pl]) #cfgb{display:none}#pal,#pn{display:none!important}
.cfgp h4{margin:18px 0 6px;font:italic 800 16px Saira,'Exo 2',sans-serif;opacity:.9}
.cfgsw{display:flex;flex-wrap:wrap;gap:8px}.cfgsw button{width:34px;height:34px;margin:0;padding:0;border:0;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.35)}
.cfgsw button.on{box-shadow:0 0 0 2px #fff,0 0 12px var(--a)}.cfgsw button:hover{transform:scale(1.08)}.cfgsw button:before,.cfgsw button:after{display:none}
#cfgpn{font-size:13px;opacity:.8;margin-top:6px}
.cfgp{max-height:calc(100vh - 32px);overflow:auto}
html.light .cfgp{color:#0c2533;background:linear-gradient(180deg,var(--g1),var(--g2) 62%,var(--g3))}html.light .cfgp input{background:#fff;color:#0c2533}
html.light #cfgb{color:#0c2533}
#cfg{position:fixed;inset:0;z-index:120;display:none;place-items:center;background:rgba(2,10,16,.6);backdrop-filter:blur(4px);padding:16px}#cfg.on{display:grid}
.cfgp{width:min(520px,100%);border-radius:22px;padding:22px 22px 18px;text-align:left;${glass}}
.cfgp h3{margin:0 0 4px;font:italic 800 24px Saira,'Exo 2',sans-serif}.cfgp label{display:block;margin:14px 0 0;font:600 14px 'Exo 2',sans-serif}
.cfgp input{display:block;width:100%;box-sizing:border-box;margin-top:6px;height:44px;padding:0 14px;border-radius:12px;border:0;background:rgba(2,14,22,.8);color:#fff;font:16px 'Exo 2',sans-serif;box-shadow:inset 0 0 0 1.2px rgba(160,235,250,.5)}
.cfgp input:focus{outline:2px solid #1fd3f2}
.cfgs{font-size:13px;opacity:.8;margin:10px 0 0;line-height:1.5}.cfgs code{display:inline-block;padding:2px 8px;border-radius:6px;background:rgba(2,14,22,.8);color:#9ff0ff;word-break:break-all}
.cfgbt{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.cfgbt button,.cfgs button{width:auto;height:40px;margin:0;padding:0 16px;border-radius:20px;border:0;color:#e8fdff;font:700 14px 'Exo 2',sans-serif;background:rgba(10,40,55,.7);box-shadow:inset 0 0 0 1.2px rgba(160,235,250,.6)}
.cfgs button{height:30px;padding:0 12px;font-size:12px;margin-left:6px}
.cfgbt button:hover,.cfgs button:hover{background:rgba(20,70,90,.85);box-shadow:inset 0 0 0 1.4px #fff,0 0 14px rgba(31,211,242,.5);transform:none}
.cfgbt button:before,.cfgs button:before,.cfgbt button:after,.cfgs button:after{display:none}
#cfgok{background:#1fd3f2;color:#001}#cfgok:hover{background:#6fe6ff}
#cfgst{min-height:1.5em;color:#9ff0ff}
</style>`);
  document.body.insertAdjacentHTML("beforeend", `
<button id="cfgb" type="button" title="Configurações" aria-label="Configurações"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/><circle cx="12" cy="12" r="6.6"/></svg></button>
<div id="cfg" role="dialog" aria-modal="true" aria-labelledby="cfgt"><div class="cfgp">
<h3 id="cfgt">Configurações</h3>
<h4>Cores e fundo</h4><div class="cfgsw" id="cfgpal"></div><div id="cfgpn"></div>
<h4>Spotify</h4>
<p class="cfgs">Cole o <b>Client ID</b> do seu app no Spotify for Developers. O Client Secret não é usado e o login acontece no próprio site do Spotify.</p>
<label>Client ID<input id="cfgid" autocomplete="off" spellcheck="false" placeholder="ex.: 3a1b…"></label>
<p class="cfgs">No painel do app, em <i>Redirect URIs</i>, cadastre exatamente:<br><code id="cfgru"></code><button type="button" id="cfgcp">Copiar</button></p>
<label>Chave da API do Last.fm <span style="opacity:.7">(opcional, deixa a Rádio bem melhor)</span><input id="cfglf" autocomplete="off" spellcheck="false" placeholder="ex.: 9f2c…"></label>
<div class="cfgbt"><button type="button" id="cfgok">Salvar e conectar</button><button type="button" id="cfgout">Desconectar</button><button type="button" id="cfgx">Fechar</button></div>
<p class="cfgs" id="cfgst"></p>
</div></div>`);
  const $s = id => document.getElementById(id);
  const cid = () => LS.get("pd_cid") || (window.PD_CONFIG && PD_CONFIG.clientId) || "";
  $s("cfgru").textContent = REDIRECT;
  const status = t => { const n = $s("spst"); if (n) n.textContent = t; };
  const drawPal = () => { if (window.drawTheme) drawTheme(); };
  $s("cfgpal").addEventListener("click", e => { const b = e.target.closest("[data-pj]"); if (b) { setP(+b.dataset.pj); drawPal(); } });
  const openCfg = () => { drawPal(); $s("cfgid").value = cid() || ""; $s("cfglf").value = SPOT.lfm; $s("cfg").classList.add("on"); };
  const closeCfg = () => $s("cfg").classList.remove("on");
  $s("cfgb").onclick = openCfg;
  $s("cfgx").onclick = closeCfg;
  $s("cfg").addEventListener("click", e => { if (e.target.id === "cfg") closeCfg(); });
  $s("cfgcp").onclick = () => { navigator.clipboard && navigator.clipboard.writeText(REDIRECT).then(() => { $s("cfgst").textContent = "Redirect URI copiado."; }, () => {}); };
  $s("cfgok").onclick = () => {
    const id = $s("cfgid").value.trim(), lf = $s("cfglf").value.trim();
    LS.set("pd_lfm", lf); SPOT.lfm = lf;
    if (!/^[0-9a-f]{32}$/i.test(id)) { $s("cfgst").textContent = "O Client ID tem 32 caracteres (letras de a a f e números)."; return; }
    LS.set("pd_cid", id); login();
  };
  $s("cfgout").onclick = () => { logout(); $s("cfgst").textContent = "Desconectado. O player voltou ao modo demonstração."; };

  /* ---------- login PKCE ---------- */
  const rnd = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  async function login() {
    const id = cid();
    if (!id) { openCfg(); return; }
    if (!window.isSecureContext || !crypto.subtle) { $s("cfgst").textContent = "Abra o Paredão em http://127.0.0.1:8888 ou num endereço https para o login funcionar."; return; }
    const v = b64u(rnd(64)), st = b64u(rnd(16));
    LS.set("pd_ver", v); LS.set("pd_state", st);
    const ch = b64u(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)));
    const u = new URL("https://accounts.spotify.com/authorize");
    u.search = new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, code_challenge_method: "S256", code_challenge: ch, state: st });
    location.href = u.toString();
  }
  function logout() {
    LS.del("pd_tok"); tok = {};
    try { SPOT.player && SPOT.player.disconnect(); } catch (e) {}
    location.href = REDIRECT;
  }
  async function tokenReq(body) {
    const r = await fetch("https://accounts.spotify.com/api/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.error || "Falha no token");
    tok = { a: j.access_token, r: j.refresh_token || tok.r, e: Date.now() + (j.expires_in - 60) * 1000 };
    LS.set("pd_tok", JSON.stringify(tok));
    return tok;
  }
  async function handleRedirect() {
    const p = new URLSearchParams(location.search);
    if (p.get("error")) { history.replaceState(null, "", REDIRECT); status("O Spotify recusou o login: " + p.get("error")); return; }
    const c = p.get("code");
    if (!c) return;
    history.replaceState(null, "", REDIRECT);
    if (p.get("state") !== LS.get("pd_state")) { status("Login cancelado por segurança. Tente de novo."); return; }
    await tokenReq({ grant_type: "authorization_code", code: c, redirect_uri: REDIRECT, client_id: cid(), code_verifier: LS.get("pd_ver") });
  }
  let refreshing = null;
  async function access() {
    if (!tok.a) return null;
    if (Date.now() > tok.e) {
      refreshing = refreshing || tokenReq({ grant_type: "refresh_token", refresh_token: tok.r, client_id: cid() }).finally(() => { refreshing = null; });
      try { await refreshing; } catch (e) { LS.del("pd_tok"); tok = {}; status("Sessão expirada. Conecte de novo pela engrenagem."); return null; }
    }
    return tok.a;
  }
  async function api(method, path, body, q) {
    const a = await access();
    if (!a) throw new Error("Sem login");
    const url = "https://api.spotify.com/v1" + path + (q ? "?" + new URLSearchParams(q) : "");
    if (Date.now() < SPOT.pauseUntil) throw Object.assign(new Error("O Spotify pediu uma pausa; tente daqui a pouco"), { status: 429 });
    const rec = { t: Date.now(), m: method, p: path.replace(/\/[A-Za-z0-9]{12,}/g, "/:id"), s: 0 };
    SPOT.log.push(rec); if (SPOT.log.length > 3000) SPOT.log.splice(0, 1000);
    if (method !== "GET" && /^\/me\/player/.test(path)) SPOT.kick && SPOT.kick();
    const r = await fetch(url, { method, headers: Object.assign({ Authorization: "Bearer " + a }, body ? { "Content-Type": "application/json" } : {}), body: body ? JSON.stringify(body) : undefined });
    rec.s = r.status; try { SPOT.day(rec); } catch (e) {}
    if (r.status === 429) {
      // sem tentar de novo em cadeia: todo o app espera
      let quota = false; try { quota = /QUOTA/.test(await r.clone().text()); } catch (e) {}
      const w = +(r.headers.get("Retry-After") || 0);
      SPOT.pauseUntil = Date.now() + Math.max(w || 0, quota ? 120 : 8) * 1000;
      if (quota) { try { const d = LS.get("pd_req") || {}; LS.set("pd_ceil", { d: d.d, n: d.n || 0, t: Date.now() }); } catch (e) {} }
      if (quota && !SPOT.quotaSaid) { SPOT.quotaSaid = 1; say("O Spotify limitou o uso por enquanto. O Paredão vai esperar e tentar de novo sozinho."); }
      throw Object.assign(new Error("O Spotify pediu uma pausa"), { status: 429 });
    }
    if (r.status === 204 || r.status === 202) return null;
    const t = await r.text();
    let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
    if (!r.ok) { const m = (j && j.error && (j.error.message || j.error)) || ("HTTP " + r.status); throw Object.assign(new Error(m), { status: r.status }); }
    return j;
  }
  SPOT.api = api; SPOT.pauseUntil = 0;
  // contagem do dia (fica salva no aparelho, para o diagnóstico)
  SPOT.log = [];
  SPOT.day = rec => {
    const d = new Date().toISOString().slice(0, 10); let o = LS.get("pd_req") || {};
    if (o.d !== d) o = { d, n: 0, e: 0, by: {} };
    o.n++; if (rec.s === 429) o.e++; const k = rec.m + " " + rec.p; o.by[k] = (o.by[k] || 0) + 1;
    LS.set("pd_req", o);
  };
  // qualquer comando da pessoa pede uma conferência rápida logo depois
  SPOT.kick = () => { SPOT.kickAt = Date.now() + 1200; };
  let lastAct = Date.now();
  ["pointerdown", "keydown"].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true, capture: true }));
  SPOT.idle = () => Date.now() - lastAct > 10 * 60e3;

  /* ---------- catálogo ---------- */
  const DEF = "#1fd3f2";
  function tint(i) {
    const m = SP[i]; if (!m || !m.img) return;
    const im = new Image(); im.crossOrigin = "anonymous";
    im.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = c.height = 24;
        const x = c.getContext("2d"); x.drawImage(im, 0, 0, 24, 24);
        // cor principal da capa: a faixa de matiz que mais aparece (pesada pela saturação)
        const d = x.getImageData(0, 0, 24, 24).data, bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
        for (let p = 0; p < d.length; p += 4) {
          const r = d[p], g = d[p + 1], b = d[p + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
          if (mx < 60 || s < .22) continue;
          let h = 0; const c = mx - mn;
          if (c) h = mx === r ? ((g - b) / c + 6) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4;
          const B = bins[Math.floor(h * 2) % 12], w = s * s * (mx / 255);
          B.w += w; B.r += r * w; B.g += g * w; B.b += b * w;
        }
        const top = bins.reduce((a, c) => c.w > a.w ? c : a, { w: 0 });
        if (top.w > 1.2) {
          let rgb = [top.r / top.w, top.g / top.w, top.b / top.w];
          const mx = Math.max(...rgb); if (mx < 200) rgb = rgb.map(v => v * 200 / mx);   // garante brilho para o anel
          TC[i] = "#" + rgb.map(v => Math.min(255, Math.round(v)).toString(16).padStart(2, "0")).join("");
        }
      } catch (e) {}
    };
    im.src = m.img;
  }
  const idFromUri = u => (u || "").split(":")[2] || null;
  function addItem(it, extra) {
    if (!it || !it.uri || it.is_local) return -1;
    const ex = SP.findIndex(m => m.uri === it.uri); if (ex >= 0) return ex;
    const ep = it.type === "episode";
    const show = it.show || (extra && extra.show) || null;
    const alb = it.album || (extra && extra.album) || null;
    const arts = it.artists || [];
    const artist = ep ? (show ? show.name : "Podcast") : arts.map(a => a.name).join(", ") || "Artista";
    const date = ep ? (it.release_date || "") : (alb && alb.release_date) || "";
    const yearTxt = date ? " · " + date.slice(0, 4) : "";
    const imgs = (ep ? (it.images && it.images.length ? it.images : show && show.images) : alb && alb.images) || [];
    const img = (imgs.slice().sort((a, b) => (b.width || b.size || 0) - (a.width || a.size || 0))[0] || {}).url || "";
    T.push([it.name || "Sem título", artist, ep ? "Podcast" + yearTxt : ((alb && alb.name) || "Single") + yearTxt]);
    TC.push(DEF); GEN.push("");
    SP.push({ uri: it.uri, id: it.id || idFromUri(it.uri), dur: (it.duration_ms || 0) / 1000, img, artist: ep ? artist : (arts[0] && arts[0].name) || artist, artistId: arts[0] ? (arts[0].id || idFromUri(arts[0].uri)) : null });
    const i = T.length - 1; tint(i); return i;
  }
  function resetCatalog() {
    T.length = 0; TC.length = 0; GEN.length = 0; SP.length = 0;
    for (const k in ART) delete ART[k];
    FAV.clear(); S.ql = []; S.i = 0; S.t = 0; S.p = 0; ci = "";
    const em = document.getElementById("em"); if (em) em.textContent = "0";
  }
  async function loadCatalog() {
    const keep = T.map((t, i) => i);
    const demo = { T: T.slice(), TC: TC.slice(), GEN: GEN.slice() };
    resetCatalog();
    const rs = await Promise.allSettled([
      api("GET", "/me/top/tracks", null, { limit: 30, time_range: "short_term" }),
      api("GET", "/me/player/recently-played", null, { limit: 30 }),
      api("GET", "/me/tracks", null, { limit: 30 })
    ]);
    if (rs[0].value) rs[0].value.items.forEach(t => addItem(t));
    if (rs[1].value) rs[1].value.items.forEach(x => addItem(x.track));
    if (rs[2].value) rs[2].value.items.forEach(x => addItem(x.track));
    if (T.filter((t, i) => !kind(i)).length < 6) {
      for (const q of ["funk", "eletrônica brasil", "pop brasil"]) {
        try { const r = await api("GET", "/search", null, { q, type: "track", limit: 10 }); r.tracks.items.forEach(t => addItem(t)); } catch (e) {}
      }
    }
    try {
      const sh = await api("GET", "/me/shows", null, { limit: 10 });
      for (const s of (sh.items || []).slice(0, 10)) {
        try { const ep = await api("GET", "/shows/" + s.show.id + "/episodes", null, { limit: 1 }); (ep.items || []).forEach(e => addItem(e, { show: s.show })); } catch (e) {}
      }
    } catch (e) {}
    if (T.filter((t, i) => kind(i)).length < 6) {
      try {
        const sr = await api("GET", "/search", null, { q: "podcast brasil", type: "show", limit: 8 });
        for (const s of ((sr && sr.shows && sr.shows.items) || []).filter(Boolean)) {
          if (T.filter((t, i) => kind(i)).length >= 8) break;
          try { const ep = await api("GET", "/shows/" + s.id + "/episodes", null, { limit: 1 }); (ep.items || []).filter(Boolean).forEach(e => addItem(e, { show: s })); } catch (e) {}
        }
      } catch (e) {}
    }
    if (!T.length) { T.push(...demo.T); TC.push(...demo.TC); GEN.push(...demo.GEN); return false; }
    checkLikes(T.map((t, i) => i));
    return true;
  }
  async function checkLikes(list) {
    for (let p = 0; p < list.length; p += 40) {
      const part = list.slice(p, p + 40).filter(i => SP[i]);
      if (!part.length) continue;
      try {
        const r = await api("GET", "/me/library/contains", null, { uris: part.map(i => SP[i].uri).join(",") });
        (r || []).forEach((v, j) => { if (v) FAV.add(part[j]); else FAV.delete(part[j]); });
        const b = document.getElementById("fvb"); if (b) b._f = null;
      } catch (e) { return; }
    }
  }

  /* ---------- capas, busca ---------- */
  const _art = art;
  art = function (i) { const m = SP[i]; return m && m.img ? { u: m.img } : _art(i); };
  const _match = match;
  let lastQ = "", lastRes = [], reent = false, sTimer = 0;
  match = function (q) { if (!SPOT.on) return _match(q); return q.trim() === lastQ ? lastRes.slice() : _match(q); };
  const sqEl = document.getElementById("sq");
  sqEl.addEventListener("input", () => {
    if (reent || !SPOT.on) return;
    clearTimeout(sTimer);
    const q = sqEl.value.trim(); if (q.length < 2) return;
    sTimer = setTimeout(async () => {
      try {
        const [a, b] = await Promise.all([
          api("GET", "/search", null, { q, type: "track,episode", limit: 10 }),
          api("GET", "/search", null, { q, type: "track", limit: 10, offset: 10 }).catch(() => null)
        ]);
        const L = [];
        [a && a.tracks && a.tracks.items, b && b.tracks && b.tracks.items, a && a.episodes && a.episodes.items].forEach(arr => (arr || []).forEach(t => { const i = addItem(t); if (i >= 0 && !L.includes(i)) L.push(i); }));
        if (sqEl.value.trim() !== q) return;
        lastQ = q; lastRes = L;
        reent = true; sqEl.dispatchEvent(new Event("input")); reent = false;
      } catch (e) { say("Busca: " + e.message); }
    }, 320);
  });

  /* ---------- reprodução ---------- */
  const tgt = () => { const d = SPOT.target || SPOT.dev; return d ? { device_id: d } : null; };
  const sdkActive = () => SPOT.sdkOk && SPOT.player && (!SPOT.target || SPOT.target === SPOT.dev);
  const fail = e => {
    if (e && e.status === 404) say("Nenhum aparelho ativo: abra o Spotify em algum aparelho ou escolha um em Dispositivos.");
    else if (e && e.status === 403) say("O Spotify bloqueou esta ação (precisa de Premium ou o app não tem acesso).");
    else say("Spotify: " + (e && e.message || e));
  };
  const volSet = new Set();
  const curDev = () => SPOT.devs.find(d => d.id === (SPOT.target || SPOT.dev)) || null;
  async function firstVolume() {
    const id = SPOT.target || SPOT.dev; if (!id || volSet.has(id)) return;
    volSet.add(id);
    const d = curDev(); if (d && d.supports_volume === false) return;
    S.v = .1; S.m = 0; SPOT.vt = Date.now();
    if (id === SPOT.dev && SPOT.player) SPOT.player.setVolume(.1).catch(() => {});
    else api("PUT", "/me/player/volume", null, { volume_percent: 10, device_id: id }).catch(() => {});
  }
  SPOT.play = (k, rest) => {
    const uris = [k].concat(rest || []).map(i => SP[i] && SP[i].uri).filter(Boolean).slice(0, 50);
    if (!uris.length) return;
    api("PUT", "/me/player/play", { uris }, tgt()).then(firstVolume).catch(fail);
  };
  SPOT.setPlay = on => {
    if (sdkActive()) { (on ? SPOT.player.resume() : SPOT.player.pause()).catch(() => {}); return; }
    api("PUT", on ? "/me/player/play" : "/me/player/pause", null, tgt()).catch(fail);
  };
  SPOT.shuffle = on => { api("PUT", "/me/player/shuffle", null, Object.assign({ state: !!on }, tgt() || {})).catch(fail); };
  SPOT.seek = t => {
    const ms = Math.max(0, Math.round(t * 1000));
    if (sdkActive()) { SPOT.player.seek(ms).catch(() => {}); return; }
    api("PUT", "/me/player/seek", null, Object.assign({ position_ms: ms }, tgt() || {})).catch(fail);
  };
  let vTimer = 0, noVolSaid = 0;
  SPOT.vol = v => {
    clearTimeout(vTimer); SPOT.vt = Date.now();
    const d = curDev();
    if (d && d.supports_volume === false && !sdkActive()) { if (Date.now() - noVolSaid > 8000) { noVolSaid = Date.now(); say(d.name + " não aceita controle de volume pelo Spotify. Use o volume do próprio aparelho."); } return; }
    vTimer = setTimeout(() => {
      if (sdkActive()) { SPOT.player.setVolume(Math.max(0, Math.min(1, v))).catch(() => {}); return; }
      api("PUT", "/me/player/volume", null, Object.assign({ volume_percent: Math.round(v * 100) }, tgt() || {})).catch(fail);
      const d = curDev(); if (d) d.volume_percent = Math.round(v * 100);
    }, 150);
  };
  SPOT.queue = k => { window.PQ ? PQ.add(k) : S.ql.push(k); };
  SPOT.qDirty = () => {};
  // fila real do Spotify: aparece igual no celular, na TV e aqui
  let qT = 0, qBusy = false;
  SPOT.fetchQueue = (delay) => {
    clearTimeout(qT);
    qT = setTimeout(async () => {
      if (!SPOT.on || qBusy || Date.now() < SPOT.pauseUntil) return; qBusy = true;
      try {
        const r = await api("GET", "/me/player/queue");
        if (r && Array.isArray(r.queue)) {
          const cur = r.currently_playing ? addItem(r.currently_playing) : S.i;
          const seen = new Set([cur]);
          S.ql = r.queue.map(t => addItem(t)).filter(k => k >= 0 && !seen.has(k) && seen.add(k)).slice(0, 20);
          SPOT.realQ = true; document.body.classList.add("spq");
          window.PQ && PQ.changed && PQ.changed();
        }
      } catch (e) {} finally { qBusy = false; }
    }, delay || 0);
  };
  SPOT.addReal = k => {
    const m = SP[k]; if (!m || !m.uri) return false;
    if (!S.ql.includes(k)) S.ql.push(k);
    window.PQ && PQ.changed && PQ.changed();
    api("POST", "/me/player/queue", null, Object.assign({ uri: m.uri }, tgt() || {})).then(() => SPOT.fetchQueue(800)).catch(fail);
    return true;
  };
  SPOT.playContext = uri => { api("PUT", "/me/player/play", { context_uri: uri }, tgt()).then(firstVolume).catch(fail); };
  SPOT.like = (k, on) => { const m = SP[k]; if (!m) return; api(on ? "PUT" : "DELETE", "/me/library", null, { uris: m.uri }).catch(fail); };
  SPOT.transfer = j => {
    const d = SPOT.devs[j]; if (!d) return;
    SPOT.target = d.id;
    api("PUT", "/me/player", { device_ids: [d.id], play: !!S.p }).then(() => { firstVolume(); status(statusTxt()); }).catch(fail);
  };
  SPOT.autoNext = () => {};          // o Spotify já avança sozinho no fim da faixa
  const _next = next, _prev = prev, _playK = playK;
  next = function () { if (!SPOT.on) return _next(); if (sdkActive()) SPOT.player.nextTrack().catch(() => {}); else api("POST", "/me/player/next", null, tgt()).catch(fail); };
  prev = function () {
    if (!SPOT.on) return _prev();
    if (S.t > 3) { S.t = 0; SPOT.seek(0); return; }
    if (sdkActive()) SPOT.player.previousTrack().catch(() => {}); else api("POST", "/me/player/previous", null, tgt()).catch(fail);
  };
  playK = function (k) {
    _playK(k);
    if (!SPOT.on) return;
    S.ql = S.ql.filter(x => x !== k);
    // o que está na fila do Spotify continua lá; aqui vão só as sugestões depois dela
    const rest = (window.PQ ? PQ.auto(20) : []).filter(x => x !== k && !S.ql.includes(x)).slice(0, 25);
    SPOT.dirty = false;
    SPOT.play(k, rest);
  };

  function setState(i, pos, dur, playing, nexts) {
    if (i < 0) return;
    if (i !== S.i) {
      const prevI = S.i; S.i = i; lyrics(i);
      // a fila do Paredão manda: se o Spotify foi para outra música, corrige
      // a fila de verdade é a do Spotify (a mesma do celular): nada de trocar a música sozinho
      if (S.ql.length && S.ql[0] === i) S.ql.shift();
      SPOT.dirty = false;
      window.PQ && PQ.changed && PQ.changed();
      SPOT.fetchQueue(900);
      SPOT.kickAt = Date.now() + 3500; // uma conferência logo no começo da música, para a letra entrar no tempo
    }
    if (flipping !== 1) S.t = Math.min(pos, dur || pos);
    if (dur) D = dur;
    S.p = playing ? 1 : 0;
    started = 1;
    media(i, playing);
  }
  function applySDK(st) {
    const tr = st.track_window && st.track_window.current_track; if (!tr) return;
    const i = addItem(tr);
    const nx = (st.track_window.next_tracks || []).map(t => addItem(t));
    setState(i, st.position / 1000, st.duration / 1000, !st.paused, nx);
  }
  function loadSDK() {
    if (document.getElementById("spsdk")) return;
    window.onSpotifyWebPlaybackSDKReady = () => {
      const p = new Spotify.Player({ name: "Paredão Player", getOAuthToken: cb => access().then(t => t && cb(t)), volume: .1 });
      addEventListener("pagehide", () => { try { p.disconnect(); } catch (e) {} });
      p.addListener("ready", ({ device_id }) => { SPOT.dev = device_id; SPOT.sdkOk = true; refreshDevices(); status(statusTxt()); });
      p.addListener("not_ready", () => { SPOT.sdkOk = false; status(statusTxt()); });
      p.addListener("initialization_error", () => { SPOT.sdkOk = false; status(statusTxt()); });
      p.addListener("authentication_error", () => say("O Spotify recusou o token. Conecte de novo pela engrenagem."));
      p.addListener("account_error", () => say("Tocar no navegador exige Spotify Premium completo."));
      p.addListener("autoplay_failed", () => say("Toque no play uma vez para liberar o som neste navegador."));
      p.addListener("player_state_changed", st => { if (st) applySDK(st); });
      p.connect(); SPOT.player = p;
    };
    const s = document.createElement("script"); s.id = "spsdk"; s.src = "https://sdk.scdn.co/spotify-player.js"; document.head.appendChild(s);
    // em celulares o navegador exige um toque para liberar áudio
    document.addEventListener("pointerdown", () => { try { SPOT.player && SPOT.player.activateElement(); } catch (e) {} }, { once: true });
  }
  let polling = false, lastApiPoll = 0;
  async function poll() {
    if (!SPOT.on || document.hidden || polling) return;
    polling = true;
    try {
      const fresh = Date.now() - (SPOT.vt || 0) > 3000;
      if (sdkActive()) {
        const st = await SPOT.player.getCurrentState();
        if (st) {
          applySDK(st); SPOT.curName = "Este navegador";
          if (fresh) { const v = await SPOT.player.getVolume().catch(() => null); if (v != null && !S.m) S.v = Math.round(v * 100) / 100; }
          status(statusTxt()); return;
        }
      }
      // aparelho remoto: o progresso anda sozinho na tela; o Spotify só é consultado
      // quando a música deve acabar, logo depois de um comando, ou de tempos em tempos
      const now = Date.now(), gap = now - lastApiPoll, left = (D - S.t) * 1000;
      let every = (S.p ? (SPOT.idle() ? 60000 : 25000) : (SPOT.idle() ? 120000 : 45000)) * (SPOT.eco ? 2 : 1);
      // letra na tela: confere o tempo com o Spotify com mais frequência (fica no tempo certo)
      if (S.p && !SPOT.eco && window.PD_LYRICS_ON && PD_LYRICS_ON()) every = Math.min(every, 12000);
      const due = gap >= every || (SPOT.kickAt && now >= SPOT.kickAt) || (S.p && D > 0 && left < 400 && gap > 3000);
      if (!due || now < SPOT.pauseUntil) return;
      SPOT.kickAt = 0;
      lastApiPoll = Date.now();
      const t0 = Date.now();
      const r = await api("GET", "/me/player");
      const lat = (Date.now() - t0) / 2000; // metade da ida e volta = atraso da resposta
      if (r && r.item) {
        const i = addItem(r.item);
        if (r.device && r.device.id !== SPOT.target) SPOT.target = r.device.id;
        SPOT.curName = r.device ? (r.device.id === SPOT.dev ? "Este navegador" : r.device.name) : null;
        if (fresh && r.device && r.device.volume_percent != null && !S.m && r.device.supports_volume !== false) S.v = r.device.volume_percent / 100;
        setState(i, (r.progress_ms || 0) / 1000 + (r.is_playing ? lat : 0), (r.item.duration_ms || 0) / 1000, r.is_playing);
        SPOT.lastSync = Date.now();
      } else SPOT.curName = null;
      status(statusTxt());
    } catch (e) {} finally { polling = false; }
  }
  async function refreshDevices() {
    try {
      const r = await api("GET", "/me/player/devices");
      // esconde sessões antigas do próprio Paredão (abas recarregadas)
      SPOT.devs = ((r && r.devices) || []).filter(d => d.id === SPOT.dev || d.is_active || d.name !== "Paredão Player");
      if (!SPOT.devs.length || dm.classList.contains("on")) return;
      DV.splice(0, DV.length, ...SPOT.devs.map(d => d.id === SPOT.dev ? "Este navegador" : d.name));
      const a = SPOT.devs.findIndex(d => d.is_active); S.dev = a >= 0 ? a : Math.max(0, SPOT.devs.findIndex(d => d.id === SPOT.dev));
      if (window.R5dev) dm.innerHTML = R5dev(SPOT.devs.map((d, j) => ({ n: DV[j], id: d.id, t: d.type, self: d.id === SPOT.dev, v: d.volume_percent, ok: d.supports_volume !== false })), a >= 0 ? a : S.dev);
      ud(); dm.querySelectorAll(".dv").forEach((x, j) => x.classList.toggle("on", j === a));
    } catch (e) {}
  }
  document.addEventListener("pointerdown", e => { if (SPOT.on && e.target.closest("[data-a=d]") && !dm.classList.contains("on")) refreshDevices(); });
  dm.addEventListener("click", e => { if (e.target.matches("input[data-dv]")) e.stopPropagation(); });
  let dvT = 0;
  dm.addEventListener("input", e => {
    const r = e.target.closest("input[data-dv]"); if (!r) return;
    r.style.setProperty("--v", r.value + "%");
    clearTimeout(dvT); const id = r.dataset.dv, v = +r.value;
    dvT = setTimeout(() => {
      if (id === SPOT.dev && SPOT.player) SPOT.player.setVolume(v / 100).catch(() => {});
      else api("PUT", "/me/player/volume", null, { volume_percent: v, device_id: id }).catch(fail);
      if (id === (SPOT.target || SPOT.dev)) { S.v = v / 100; SPOT.vt = Date.now(); }
      const d = SPOT.devs.find(x => x.id === id); if (d) d.volume_percent = v;
    }, 150);
  });

  /* ---------- Media Session (teclas de mídia, tela de bloqueio) ---------- */
  function media(i, playing) {
    if (!("mediaSession" in navigator)) return;
    try {
      if (media._i !== i) {
        media._i = i;
        navigator.mediaSession.metadata = new MediaMetadata({ title: T[i][0], artist: T[i][1], album: T[i][2], artwork: SP[i] && SP[i].img ? [{ src: SP[i].img, sizes: "300x300" }] : [] });
      }
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    } catch (e) {}
  }
  if ("mediaSession" in navigator) {
    const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) {} };
    h("play", () => { S.p = 1; SPOT.on && SPOT.setPlay(true); });
    h("pause", () => { S.p = 0; SPOT.on && SPOT.setPlay(false); });
    h("nexttrack", () => next());
    h("previoustrack", () => prev());
  }

  /* ---------- letras sincronizadas (LRCLIB) ---------- */
  const LYR = {};
  function parseLRC(txt) {
    const out = [];
    txt.split("\n").forEach(l => {
      const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
      if (m && m[3].trim()) out.push({ t: +m[1] * 60 + +m[2], s: m[3].trim() });
    });
    return out.length ? out : null;
  }
  async function lyrics(i) {
    const m = SP[i]; if (!m || kind(i) || LYR[m.uri] !== undefined) return;
    LYR[m.uri] = null;
    try {
      let j = null;
      const r = await fetch("https://lrclib.net/api/get?" + new URLSearchParams({ track_name: T[i][0], artist_name: m.artist, duration: Math.round(m.dur) }));
      if (r.ok) j = await r.json();
      if (!j || !j.syncedLyrics) {
        const r2 = await fetch("https://lrclib.net/api/search?" + new URLSearchParams({ track_name: T[i][0], artist_name: m.artist }));
        const a = r2.ok ? await r2.json() : [];
        j = a.find(x => x.syncedLyrics) || a.find(x => x.plainLyrics) || j;
      }
      LYR[m.uri] = j && j.syncedLyrics ? { sync: parseLRC(j.syncedLyrics) } : j && j.plainLyrics ? { plain: j.plainLyrics.split("\n").filter(Boolean) } : false;
    } catch (e) { LYR[m.uri] = false; }
  }
  const _K2 = K2;
  K2 = function (r) {
    const m = SP[S.i];
    if (!SPOT.on || !m) return _K2(r);
    const L = LYR[m.uri];
    if (L === undefined) lyrics(S.i);
    if (!L || !L.sync) {
      const key = "n" + S.i + (L ? "p" : L === false ? "x" : "w");
      if (r._k !== key) {
        r._k = key; r._p = -1;
        r.innerHTML = L && L.plain
          ? `<p>${esc(L.plain[0])}</p><h2>${esc(L.plain[1] || "")}</h2><p>${esc(L.plain[2] || "")}</p>`
          : `<p>${kind(S.i) ? "Podcast" : L === false ? "Letra indisponível" : "Buscando a letra…"}</p><h2>${esc(T[S.i][0])}</h2><p>${esc(T[S.i][1])}</p>`;
      }
      return;
    }
    const ln = L.sync; let k = -1;
    for (let j = 0; j < ln.length; j++) { if (ln[j].t <= S.t + .15) k = j; else break; }
    const key = S.i + "_" + k;
    if (r._k !== key) {
      r._k = key; r._p = -1;
      const cur = k >= 0 ? ln[k].s : "♪";
      r.innerHTML = `<p>${esc(k > 0 ? ln[k - 1].s : "")}</p><h2>${cur.split(" ").map(w => `<span>${esc(w)}</span>`).join(" ")}</h2><p>${esc(ln[k + 1] ? ln[k + 1].s : "")}</p>`;
    }
    if (k < 0) return;
    const t0 = ln[k].t, t1 = ln[k + 1] ? ln[k + 1].t : t0 + 4, f = Math.max(0, Math.min(1, (S.t - t0) / Math.max(.5, t1 - t0)));
    const sp = r.querySelectorAll("span"), n = sp.length, p = Math.floor(Math.min(n, f * 1.2 * n));
    if (p !== r._p) { r._p = p; sp.forEach((v, j) => v.className = j < p ? "d" : j == p ? "a" : ""); }
  };

  /* ---------- Rádio (Last.fm + Spotify) e Mais do artista ---------- */
  const RADC = {};
  async function prepRadio(k) {
    if (RADC[k]) return;
    const m = SP[k]; if (!m) return;
    GEN[k] = "seed" + k;
    const L = [];
    const push = i => { if (i >= 0 && i !== k && !L.includes(i)) L.push(i); };
    if (SPOT.lfm && !kind(k)) {
      try {
        const r = await fetch("https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams({ method: "track.getsimilar", artist: m.artist, track: T[k][0], api_key: SPOT.lfm, format: "json", limit: 30, autocorrect: 1 }));
        const j = await r.json();
        const sims = ((j.similartracks && j.similartracks.track) || []).slice(0, 18);
        for (const s of sims) {
          if (L.length >= 16) break;
          try { const res = await api("GET", "/search", null, { q: `track:${s.name} artist:${s.artist.name}`, type: "track", limit: 1 }); push(addItem(res.tracks.items[0])); } catch (e) {}
        }
      } catch (e) {}
    }
    if (L.length < 6) {
      const y = yr(k);
      const qs = kind(k) ? [T[k][1]] : [`artist:"${m.artist}"`, y ? `year:${+y - 2}-${+y + 2}` : null].filter(Boolean);
      for (const q of qs) {
        try { const res = await api("GET", "/search", null, { q, type: kind(k) ? "episode" : "track", limit: 10 }); ((res.tracks || res.episodes || {}).items || []).forEach(t => push(addItem(t))); } catch (e) {}
      }
    }
    for (const i of T.map((t, i) => i)) { if (L.length >= 6) break; if (kind(i) === kind(k)) push(i); }
    RADC[k] = L;
  }
  const _radList = radList;
  radList = function (k, n = 6) { return SPOT.on && RADC[k] ? RADC[k].slice(0, n) : _radList(k, n); };
  const _radio = radio;
  radio = async function (k) {
    if (!SPOT.on) return _radio(k);
    if (rolling) return;
    say(SPOT.lfm ? "Montando a rádio com o Last.fm…" : "Montando a rádio…");
    await prepRadio(k);
    _radio(k);
  };
  SPOT.moreArtist = async k => {
    const m = SP[k]; if (!m) return;
    say("Buscando mais de " + m.artist + "…");
    const L = [k];
    try {
      if (m.artistId && !kind(k)) {
        for (const off of [0, 10]) {
          const r = await api("GET", "/search", null, { q: 'artist:"' + m.artist + '"', type: "track", limit: 10, offset: off });
          ((r.tracks && r.tracks.items) || []).filter(t => t && (t.artists || []).some(a => a.id === m.artistId)).forEach(t => { const i = addItem(t); if (i >= 0 && !L.includes(i)) L.push(i); });
          if (L.length >= 10) break;
        }
        // também o que já está no catálogo
        T.forEach((t, i) => { if (SP[i] && SP[i].artistId === m.artistId && !L.includes(i)) L.push(i); });
      } else {
        const res = await api("GET", "/search", null, { q: m.artist, type: "episode", limit: 10 });
        ((res.episodes || {}).items || []).forEach(t => { const i = addItem(t); if (i >= 0 && !L.includes(i)) L.push(i); });
      }
    } catch (e) { fail(e); }
    for (let i = L.length - 1; i > 1; i--) { const j = 1 + (Math.random() * i | 0); [L[i], L[j]] = [L[j], L[i]]; }
    if (RAD) killRad();
    if (L.length < 2) { say("Não achei outras de " + m.artist + " agora"); return; }
    window.ARTM = { name: m.artist, pool: L.slice() };
    roll(L.slice(0, 6));
    $("#ws").textContent = "Mais de " + m.artist;
  };

  /* ---------- status e início ---------- */
  function statusTxt() {
    const who = SPOT.me ? (SPOT.me.display_name || "você") : "você";
    if (SPOT.curName) return `Conectado como ${who} · ${S.p ? "tocando" : "pausado"} em: ${SPOT.curName}`;
    return `Conectado como ${who} · escolha onde tocar em Dispositivos, no player`;
  }
  (async () => {
    status("Modo demonstração · toque na engrenagem, no canto, para conectar o Spotify");
    try { await handleRedirect(); } catch (e) { status("Falha no login: " + e.message); }
    if (!tok.a) return;
    try {
      SPOT.me = await api("GET", "/me");
      SPOT.on = true;
      $s("cfgb").classList.add("ok");
      status("Carregando a sua música…");
      const ok = await loadCatalog();
      if (!ok) say("Não encontrei músicas na sua conta; segue o catálogo de exemplo.");
      status(statusTxt());
      loadSDK(); refreshDevices(); poll();
      setInterval(poll, 1000);
      setInterval(() => { if (!document.hidden && !SPOT.idle()) refreshDevices(); }, 300000);
      if (document.body.dataset.s === "wait") openWait("");
    } catch (e) {
      status("Não consegui falar com o Spotify: " + e.message + ". Confira o Client ID e se a sua conta está em User Management.");
    }
  })();
})();

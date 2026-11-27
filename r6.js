/* Paredão · rodada 6: faces novas do cubo (Sua história, Sobre o artista, O que a letra quer dizer) */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const sp = () => window.SPOT && SPOT.on;
  const LSg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const LSs = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    hist: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    art: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
    ly: ico('<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>')
  };
  // faces: 3 = esquerda (letra explicada), 4 = cima (sua história), 5 = baixo (sobre o artista)
  const faces = [...document.querySelectorAll("#cu > .f")];
  function mk(i, title, icon) {
    const f = faces[i]; if (!f) return null;
    [...f.children].forEach(c => { if (!c.classList.contains("tg")) c.style.display = "none"; });
    const h = document.createElement("h4"); h.className = "fh"; h.innerHTML = icon + esc(title); f.appendChild(h);
    const x = document.createElement("div"); x.className = "xf"; f.appendChild(x); return x;
  }
  const XL = mk(3, "O que a letra quer dizer", I.ly), XH = mk(4, "Sua história com esta música", I.hist), XA = mk(5, "Sobre o artista", I.art);

  /* ---------- Sua história: Last.fm (se tiver usuário) + Spotify (top/recentes) + contagem do próprio aparelho ---------- */
  const keyOf = k => (T[k] ? (T[k][0] + "|" + T[k][1]).toLowerCase() : "");
  const WK = ts => Math.floor((ts / 864e5 + 3) / 7); // semana (começa na segunda)
  let H = LSg("pd_hist2", {}), lastK = -1, counted = -1;
  setInterval(() => {
    const k = S.i; if (k == null || !T[k]) return;
    if (k !== lastK) { lastK = k; counted = -1; }
    // conta depois de 20 s tocando (para não contar quem só pulou)
    if (S.p && S.t > 20 && counted !== k) {
      counted = k; const key = keyOf(k), now = Date.now(), r = H[key] || { n: 0, f: now };
      r.n++; r.l = now; r.f = r.f || now;
      r.h = r.h || Array(24).fill(0); r.h[new Date(now).getHours()]++;
      r.w = r.w || []; const w = WK(now); if (r.w[r.w.length - 1] !== w) { r.w.push(w); if (r.w.length > 120) r.w.shift(); }
      H[key] = r; HC[key] = null; XH._h = "";
      const ks = Object.keys(H); if (ks.length > 2000) ks.sort((a, b) => (H[a].l || 0) - (H[b].l || 0)).slice(0, 300).forEach(x => delete H[x]);
      LSs("pd_hist2", H);
    }
  }, 1000);
  const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const hm = d => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  function streak(weeks) {
    const ws = [...new Set(weeks)].sort((a, b) => b - a); if (!ws.length) return 0;
    let n = 1; for (let i = 1; i < ws.length && ws[i] === ws[i - 1] - 1; i++) n++; return n;
  }
  // top do Spotify (4 semanas / 6 meses), guardado por 30 min
  let TOP = { t: 0, s: [], m: [] }, topBusy = false;
  async function loadTop() {
    if (!sp() || topBusy || Date.now() - TOP.t < 18e5) return;
    topBusy = true;
    try {
      const [a, b] = await Promise.all(["short_term", "medium_term"].map(r => SPOT.api("GET", "/me/top/tracks", null, { time_range: r, limit: 50 }).catch(() => null)));
      TOP = { t: Date.now(), s: a && a.items ? a.items.map(x => x.uri) : [], m: b && b.items ? b.items.map(x => x.uri) : [] };
      XH._h = "";
    } finally { topBusy = false; }
  }
  // Last.fm: quantas vezes, curtida e todos os horários (até 1000 scrobbles)
  const HC = {};
  const lfmUser = () => LSg("pd_lfmu", "");
  async function lfmHist(k) {
    const key = keyOf(k); if (HC[key]) return HC[key];
    const o = HC[key] = { loading: true };
    const api = SPOT && SPOT.lfm, user = lfmUser(), m = (SPOT.SP && SPOT.SP[k]) || {};
    const q = x => fetch("https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams(Object.assign({ api_key: api, format: "json", autocorrect: 1, artist: m.artist || T[k][1], track: T[k][0] }, x))).then(r => r.json());
    try {
      const gi = await q({ method: "track.getInfo", username: user });
      if (gi && gi.track) { o.n = +gi.track.userplaycount || 0; o.loved = gi.track.userloved === "1"; }
      let ts = [];
      const p1 = await q({ method: "user.getTrackScrobbles", user, limit: 200, page: 1 });
      const pick = j => { const t = j && j.trackscrobbles && j.trackscrobbles.track; (Array.isArray(t) ? t : t ? [t] : []).forEach(x => { if (x.date && x.date.uts) ts.push(+x.date.uts * 1000); }); };
      pick(p1);
      const pages = +(p1 && p1.trackscrobbles && p1.trackscrobbles["@attr"] && p1.trackscrobbles["@attr"].totalPages) || 1;
      const more = []; for (let i = 2; i <= Math.min(pages, 4); i++) more.push(i);
      if (pages > 4) more.push(pages); // a última página traz a primeira vez
      (await Promise.all(more.map(pg => q({ method: "user.getTrackScrobbles", user, limit: 200, page: pg }).catch(() => null)))).forEach(pick);
      if (ts.length) { o.first = Math.min(...ts); o.h = Array(24).fill(0); ts.forEach(t => o.h[new Date(t).getHours()]++); o.weeks = ts.map(WK); if (!o.n) o.n = ts.length; }
      o.src = "Last.fm";
    } catch (e) { o.err = 1; }
    o.loading = false; XH._h = ""; return o;
  }
  function histData(k) {
    const key = keyOf(k), loc = H[key], m = (SPOT && SPOT.SP && SPOT.SP[k]) || {};
    let d = { n: 0, first: 0, h: null, weeks: [], loved: false, src: "" };
    if (loc) d = { n: loc.n, first: loc.f, h: loc.h || null, weeks: loc.w || [], src: "seu Paredão" };
    if (sp() && SPOT.lfm && lfmUser()) {
      const o = HC[key]; if (!o) lfmHist(k);
      else if (!o.loading && !o.err && o.n != null && o.n >= d.n) d = { n: o.n, first: o.first || d.first, h: o.h || d.h, weeks: o.weeks || d.weeks, loved: o.loved, src: "Last.fm" };
      else if (o && o.loading) d.loading = true;
    }
    if (sp()) { loadTop(); d.rs = TOP.s.indexOf(m.uri) + 1; d.rm = TOP.m.indexOf(m.uri) + 1; }
    if (window.PD_HIST_DEMO && !sp()) d = window.PD_HIST_DEMO;
    return d;
  }
  function renderHist() {
    const k = S.i; if (k == null || !T[k]) return;
    const d = histData(k), fav = FAV.has(k) || d.loved;
    const h = "h" + k + JSON.stringify([d.n, d.first, d.rs, d.rm, d.loading, fav, d.h && d.h.join()]);
    if (XH._h === h) return; XH._h = h;
    const sub = '<div class="hsub">O que o Spotify sozinho não mostra: quantas vezes, desde quando e em que hora do dia você ouve.</div>';
    if (!d.n) {
      XH.innerHTML = sub + `<div class="hst"><div><b>${d.loading ? "…" : "Primeira vez"}</b><span>${d.loading ? "buscando seu histórico" : "que essa toca por aqui. A partir de agora eu conto cada vez que ela tocar."}</span></div></div>` + chips(d, fav);
      return;
    }
    const f = d.first ? new Date(d.first) : null, st = streak(d.weeks || []);
    const mx = d.h ? Math.max(1, ...d.h) : 1;
    XH.innerHTML = sub + `<div class="hst">
        <div><b>${d.n}</b><span>${d.n === 1 ? "vez que você ouviu" : "vezes que você ouviu"}</span></div>
        ${f ? `<div><b>${f.getDate()} ${MES[f.getMonth()]}${f.getFullYear() !== new Date().getFullYear() ? " <small>" + f.getFullYear() + "</small>" : ""}</b><span>primeira vez, às ${hm(f)}</span></div>` : ""}
        ${st ? `<div><b>${st}</b><span>${st === 1 ? "semana ouvindo" : "semanas seguidas ouvindo"}</span></div>` : ""}
      </div>
      ${d.h ? `<div class="hhl">Em que hora do dia você ouve</div><div class="hbars">${d.h.map((v, i) => `<i style="--v:${(v / mx).toFixed(2)}" title="${i}h: ${v}×"></i>`).join("")}</div><div class="hax"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>` : ""}
      ${chips(d, fav)}<div class="xsrc">${d.src === "Last.fm" ? "Contagem do Last.fm" : "Contado pelo seu Paredão"}${d.rs || d.rm ? " · ranking do Spotify" : ""}</div>`;
  }
  function chips(d, fav) {
    const c = [];
    if (d.rs) c.push(`<span><b>#${d.rs}</b> no seu top das últimas 4 semanas</span>`);
    if (d.rm) c.push(`<span><b>#${d.rm}</b> nos últimos 6 meses</span>`);
    if (fav) c.push(`<span><b>♥</b> nos favoritos</span>`);
    return c.length ? `<div class="hch">${c.join("")}</div>` : "";
  }

  /* ---------- Sobre o artista: Last.fm (bio) + Wikidata (origem) + Spotify (lançamentos) ---------- */
  const AC = {};
  async function artistInfo(name, k) {
    if (AC[name]) return AC[name];
    const o = AC[name] = { name, bio: "", origin: "", since: "", members: [], rel: [], img: "", loading: true };
    const jobs = [];
    const lfm = window.SPOT && SPOT.lfm;
    if (lfm) jobs.push(fetch("https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams({ method: "artist.getinfo", artist: name, api_key: lfm, format: "json", lang: "pt", autocorrect: 1 })).then(r => r.json()).then(j => {
      const b = j && j.artist && j.artist.bio && (j.artist.bio.summary || "");
      o.bio = String(b).replace(/<a [^>]*>.*?<\/a>\.?/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      o.tags = ((j.artist && j.artist.tags && j.artist.tags.tag) || []).slice(0, 3).map(t => t.name);
    }).catch(() => {}));
    jobs.push((async () => {
      const w = await fetch("https://www.wikidata.org/w/api.php?" + new URLSearchParams({ action: "wbsearchentities", search: name, language: "pt", uselang: "pt", type: "item", limit: 5, format: "json", origin: "*" })).then(r => r.json());
      const hit = (w.search || []).find(x => /cantor|cantora|banda|grupo|músic|rapper|DJ|singer|band|musician|duo|produtor/i.test(x.description || "")) || null;
      if (!hit) return;
      const e = await fetch("https://www.wikidata.org/w/api.php?" + new URLSearchParams({ action: "wbgetentities", ids: hit.id, props: "claims", format: "json", origin: "*" })).then(r => r.json());
      const c = e.entities[hit.id].claims || {};
      const val = p => (c[p] || []).map(x => x.mainsnak && x.mainsnak.datavalue && x.mainsnak.datavalue.value).filter(Boolean);
      const ids = [...val("P495"), ...val("P740"), ...val("P19"), ...val("P27"), ...val("P527")].map(v => v.id).filter(Boolean).slice(0, 12);
      const t = val("P571")[0] || val("P569")[0]; if (t && t.time) o.since = t.time.slice(1, 5);
      o.isBand = !!val("P571").length;
      if (ids.length) {
        const L = await fetch("https://www.wikidata.org/w/api.php?" + new URLSearchParams({ action: "wbgetentities", ids: [...new Set(ids)].join("|"), props: "labels", languages: "pt|en", format: "json", origin: "*" })).then(r => r.json());
        const lab = id => { const x = L.entities[id]; return x && x.labels && ((x.labels.pt || x.labels.en || {}).value); };
        const place = [...val("P740"), ...val("P19")].map(v => lab(v.id)).filter(Boolean)[0], country = [...val("P495"), ...val("P27")].map(v => lab(v.id)).filter(Boolean)[0];
        o.origin = [place, country].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(", ");
        o.members = val("P527").map(v => lab(v.id)).filter(Boolean).slice(0, 5);
      }
    })().catch(() => {}));
    const m = window.SPOT && SPOT.SP && SPOT.SP[k];
    if (sp() && m && m.artistId) jobs.push(SPOT.api("GET", "/artists/" + m.artistId + "/albums", null, { include_groups: "album,single", limit: 20 }).then(r => {
      const seen = new Set();
      o.rel = (r.items || []).filter(Boolean).map(a => ({ y: (a.release_date || "").slice(0, 4), n: a.name, t: a.album_type })).filter(a => a.y && !seen.has(a.n) && seen.add(a.n)).sort((a, b) => b.y - a.y).slice(0, 8);
    }).catch(() => {}));
    await Promise.all(jobs); o.loading = false; return o;
  }
  let curArt = "";
  function renderArtist() {
    const k = S.i, name = String(T[k] ? T[k][1] : "").split(",")[0].trim();
    if (!name) return;
    const o = AC[name];
    const h = "a" + name + (o ? (o.loading ? "L" : "D") : "N");
    if (XA._h === h) return; XA._h = h;
    if (!o) { XA.innerHTML = `<div class="xk">Buscando ${esc(name)}…</div>`; if (curArt !== name) { curArt = name; artistInfo(name, k).then(() => { XA._h = ""; }); } return; }
    if (o.loading) { XA.innerHTML = `<div class="xk">Buscando ${esc(name)}…</div>`; return; }
    const facts = [o.origin && `<div class="xrow"><span>Origem</span><b>${esc(o.origin)}</b></div>`, o.since && `<div class="xrow"><span>${o.isBand ? "Desde" : "Nasceu em"}</span><b>${esc(o.since)}</b></div>`, o.members.length && `<div class="xrow"><span>Integrantes</span><b>${esc(o.members.join(", "))}</b></div>`].filter(Boolean).join("");
    const bio = o.bio ? `<p class="xbio">${esc(o.bio.length > 360 ? o.bio.slice(0, 357).replace(/\s\S*$/, "") + "…" : o.bio)}</p>` : "";
    const rel = o.rel.length ? `<div class="xtl">${o.rel.map(r => `<div><b>${esc(r.y)}</b><span>${esc(r.n)}</span></div>`).join("")}</div>` : "";
    const none = !facts && !bio && !rel;
    XA.innerHTML = `<div class="xname">${esc(name)}</div>${o.tags && o.tags.length ? `<div class="xch">${o.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}${facts}${bio}${rel}` +
      (none ? `<div class="xk">${window.SPOT && SPOT.lfm ? "Não achei informações sobre esse artista agora." : "Coloque a chave do Last.fm nas configurações para ver a biografia."}</div>` : "") +
      `<div class="xsrc">Fontes: Last.fm, Wikidata${o.rel.length ? ", Spotify" : ""}</div>`;
  }

  /* ---------- O que a letra quer dizer: Genius ---------- */
  const GC = {};
  const gkey = () => LSg("pd_genius", "") || "";
  async function genius(title, artist) {
    const id = (title + "|" + artist).toLowerCase(); if (GC[id]) return GC[id];
    const o = GC[id] = { loading: true, items: [], url: "", err: "" };
    const tk = gkey(); if (!tk) { o.loading = false; o.err = "key"; return o; }
    const G = (p, q) => fetch("https://api.genius.com" + p + "?" + new URLSearchParams(Object.assign({ access_token: tk }, q || {}))).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
    try {
      const s = await G("/search", { q: title.replace(/\s*[-(].*$/, "") + " " + artist.split(",")[0] });
      const hits = ((s.response && s.response.hits) || []).map(h => h.result).filter(Boolean);
      const norm = x => String(x).toLowerCase().normalize("NFD").replace(/[^\w]/g, "");
      const song = hits.find(h => norm(h.primary_artist && h.primary_artist.name).includes(norm(artist.split(",")[0]).slice(0, 6))) || null;
      if (!song) { o.err = "nosong"; }
      else {
        o.url = song.url;
        const r = await G("/referents", { song_id: song.id, text_format: "plain", per_page: 8 });
        o.items = ((r.response && r.response.referents) || []).map(x => ({ frag: x.fragment, body: ((x.annotations && x.annotations[0] && x.annotations[0].body && x.annotations[0].body.plain) || "").trim() })).filter(x => x.body && x.frag).slice(0, 4);
        if (!o.items.length) o.err = "noann";
      }
    } catch (e) { o.err = /Failed to fetch|NetworkError|TypeError/.test(String(e)) ? "cors" : "http"; }
    o.loading = false; return o;
  }
  function renderLyr() {
    const k = S.i; if (!T[k]) return;
    const title = T[k][0], artist = T[k][1], id = (title + "|" + artist).toLowerCase(), o = GC[id];
    const h = "l" + id + (o ? (o.loading ? "L" : "D" + o.err) : "N") + !!gkey();
    if (XL._h === h) return; XL._h = h;
    if (!o) { XL.innerHTML = '<div class="xk">Procurando anotações…</div>'; genius(title, artist).then(() => { XL._h = ""; }); return; }
    if (o.loading) { XL.innerHTML = '<div class="xk">Procurando anotações…</div>'; return; }
    const msg = { key: "Coloque a chave do Genius nas configurações (engrenagem) para ver o que a comunidade diz sobre os versos.", nosong: "Não achei essa música no Genius.", noann: "Ainda sem anotações da comunidade para essa música.", cors: "O Genius não deixou o navegador consultar direto. Dá para resolver com um intermediário; me avise.", http: "O Genius não respondeu agora. Tento de novo na próxima música." }[o.err];
    if (msg) { XL.innerHTML = `<div class="xk">${esc(msg)}</div>`; return; }
    XL.innerHTML = o.items.map(x => `<div class="xan"><q>${esc(x.frag.length > 90 ? x.frag.slice(0, 88) + "…" : x.frag)}</q><p>${esc(x.body.length > 230 ? x.body.slice(0, 228).replace(/\s\S*$/, "") + "…" : x.body)}</p></div>`).join("") + '<div class="xsrc">Anotações da comunidade · via Genius</div>';
  }

  // só busca quando a face está à vista (economiza consultas)
  window.R6faces = function () {
    const f = typeof front === "function" ? front() : -1;
    try { renderHist(); } catch (e) {}
    if (f === 5) try { renderArtist(); } catch (e) {}
    if (f === 3) try { renderLyr(); } catch (e) {}
  };

  /* ---------- campo da chave do Genius nas configurações ---------- */
  const lf = document.getElementById("cfglf");
  if (lf) {
    const lab = lf.closest("label") || lf.parentNode;
    const w = document.createElement("label");
    w.innerHTML = 'Chave do Genius <span style="opacity:.7">(opcional, para "O que a letra quer dizer")</span><input id="cfggn" type="password" autocomplete="off" spellcheck="false" placeholder="cole aqui o token do Genius">';
    lab.parentNode.insertBefore(w, lab.nextSibling);
    const wu = document.createElement("label");
    wu.innerHTML = 'Seu usuário do Last.fm <span style="opacity:.7">(opcional, para "Sua história" contar desde sempre)</span><input id="cfglu" type="text" autocomplete="off" spellcheck="false" placeholder="ex.: mullermike">';
    lab.parentNode.insertBefore(wu, lab.nextSibling);
    const lu = document.getElementById("cfglu"); lu.value = LSg("pd_lfmu", "");
    lu.addEventListener("change", () => { LSs("pd_lfmu", lu.value.trim()); for (const k in HC) delete HC[k]; XH._h = ""; });
    const gi = document.getElementById("cfggn");
    gi.value = gkey();
    gi.addEventListener("change", () => { LSs("pd_genius", gi.value.trim()); for (const k in GC) delete GC[k]; XL._h = ""; });
    document.getElementById("cfgb") && document.getElementById("cfgb").addEventListener("click", () => { gi.value = gkey(); });
  }
})();

/* ---------- Modo palco: estilos de mini player escolhíveis ---------- */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const stg = $("#stg"); if (!stg) return;
  const ST = [
    ["capsula", "Cápsula de vidro"], ["paredao", "Paredão"], ["vinil", "Toca-discos"], ["cassete", "Fita cassete"],
    ["vfd", "Display de som automotivo"], ["ingresso", "Ingresso de show"], ["ilha", "Ilha dinâmica"], ["aero", "Painel de aeroporto"], ["holo", "Holograma"]
  ];
  let cur = "capsula"; try { const v = localStorage.getItem("pd_stage"); if (ST.some(x => x[0] === v)) cur = v; } catch (e) {}
  const x = document.createElement("div"); x.className = "sgx"; stg.appendChild(x);
  const T_ = '<b data-f="t"></b>', A_ = '<small data-f="a"></small>', C_ = '<i data-f="c"></i>';
  const tpl = {
    capsula: "",
    paredao: `<div class="pw"><span class="cone"></span>${C_}<span class="cone"></span></div><div class="ptx">${T_}${A_}</div>`,
    vinil: `<div class="deck"><div class="plat"><div class="disc">${C_}</div></div><span class="arm"></span></div><div class="ptx">${T_}${A_}</div>`,
    cassete: `<div class="tape"><div class="lab">${T_}${A_}</div><div class="win"><span class="reel"></span><span class="reel"></span></div></div>`,
    vfd: `<div class="vfdp"><div class="vrow"><span class="vtag">FM</span><div class="vmar"><span data-f="ta"></span></div></div><div class="vbars">${"<i></i>".repeat(16)}</div></div>`,
    ingresso: `<div class="tk"><div class="tkm"><small class="tkh">PAREDÃO · HORA DO SHOW</small>${T_}${A_}<div class="tkb"></div></div><div class="tks"><span>ADMIT</span><b>ONE</b></div></div>`,
    ilha: `<div class="isl">${C_}<div class="ptx">${T_}${A_}</div><span class="iw">${"<i></i>".repeat(5)}</span></div>`,
    aero: `<div class="flap"><div class="fh"><span>DESTINO</span><span>STATUS</span></div><div class="fr"><span data-f="tf" class="fl"></span><span class="st">TOCANDO</span></div><div class="fr sm"><span data-f="af" class="fl"></span></div></div>`,
    holo: `<div class="hol"><div class="beam"></div>${C_}<div class="ptx">${T_}${A_}</div><div class="base"></div></div>`
  };
  const flap = (s, n) => [...(String(s).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + " ".repeat(n)).slice(0, n)].map(c => `<i>${c === " " ? "&nbsp;" : esc(c)}</i>`).join("");
  let key = "";
  function fill(force) {
    const k = S.i; if (k == null || !T[k]) return;
    const h = cur + "|" + k + "|" + pi; if (!force && h === key) return; key = h;
    const t = T[k][0], a = T[k][1], u = art(k).u;
    x.querySelectorAll('[data-f="t"]').forEach(e => e.textContent = t);
    x.querySelectorAll('[data-f="a"]').forEach(e => e.textContent = a);
    x.querySelectorAll('[data-f="c"]').forEach(e => e.style.backgroundImage = `url(${u})`);
    x.querySelectorAll('[data-f="ta"]').forEach(e => e.textContent = (t + "  •  " + a + "  •  ").repeat(2));
    x.querySelectorAll('[data-f="tf"]').forEach(e => e.innerHTML = flap(t, 16));
    x.querySelectorAll('[data-f="af"]').forEach(e => e.innerHTML = flap(a, 16));
    const bc = x.querySelector(".tkb"); if (bc) bc.innerHTML = [...(t + a)].slice(0, 26).map(c => `<i style="width:${1 + c.charCodeAt(0) % 3}px"></i>`).join("");
  }
  function setStage(v) {
    cur = v; try { localStorage.setItem("pd_stage", v); } catch (e) {}
    stg.dataset.st = v; x.innerHTML = tpl[v] || ""; key = ""; fill(true);
    stg.style.left = stg.style.top = ""; stg.style.right = stg.style.bottom = "";
    drawPick();
  }
  setInterval(() => { if (stg.classList.contains("on") || stg.classList.contains("inpip")) fill(); }, 400);
  /* escolha nas configurações */
  const pal = document.getElementById("cfgpal"); let box = null;
  function drawPick() {
    if (!box) return;
    box.innerHTML = '<div class="tlab">Modo palco (mini player) · <b>' + esc(ST.find(s => s[0] === cur)[1]) + "</b></div><div class=\"stgrid\">" + ST.map(s => `<button type="button" data-stg="${s[0]}" class="${s[0] === cur ? "on" : ""}"><span class="sti sti-${s[0]}"></span>${esc(s[1])}</button>`).join("") + "</div>";
  }
  if (pal) {
    box = document.createElement("div"); box.id = "cfgstg"; pal.parentNode.insertBefore(box, pal.nextSibling);
    box.addEventListener("click", e => { const b = e.target.closest("[data-stg]"); if (!b) return; e.stopPropagation(); setStage(b.dataset.stg); stg.classList.add("prev"); clearTimeout(box._t); box._t = setTimeout(() => stg.classList.remove("prev"), 2500); });
  }
  setStage(cur);
  window.STAGE = { set: setStage, list: ST };
})();

/* ---------- Cor da barra de progresso = cor principal da capa (demonstração e Spotify) ---------- */
(function () {
  const CC = {}, busy = {};
  function dominant(im) {
    const c = document.createElement("canvas"); c.width = c.height = 32;
    const x = c.getContext("2d"); x.drawImage(im, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data, bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
    for (let p = 0; p < d.length; p += 4) {
      const r = d[p], g = d[p + 1], b = d[p + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
      if (mx < 50 || s < .2) continue;
      let h = 0; const ch = mx - mn;
      if (ch) h = mx === r ? ((g - b) / ch + 6) % 6 : mx === g ? (b - r) / ch + 2 : (r - g) / ch + 4;
      const B = bins[Math.floor(h * 2) % 12], w = s * s * (mx / 255);
      B.w += w; B.r += r * w; B.g += g * w; B.b += b * w;
    }
    const top = bins.reduce((a, c) => c.w > a.w ? c : a, { w: 0 });
    if (top.w < .8) return null; // capa sem cor (preto e branco): fica a cor do tema
    let rgb = [top.r / top.w, top.g / top.w, top.b / top.w];
    const mx = Math.max(...rgb); if (mx < 210) rgb = rgb.map(v => v * 210 / mx); // brilho suficiente para o neon
    return "#" + rgb.map(v => Math.min(255, Math.round(v)).toString(16).padStart(2, "0")).join("");
  }
  const themeC = () => getComputedStyle(document.documentElement).getPropertyValue("--neon").trim() || getComputedStyle(document.documentElement).getPropertyValue("--a").trim() || "#1fd3f2";
  window.coverColor = function (k) {
    let u = ""; try { u = art(k).u || ""; } catch (e) {}
    if (!u) return themeC();
    if (u in CC) return CC[u] || themeC();
    if (!busy[u]) {
      busy[u] = 1;
      const im = new Image(); im.crossOrigin = "anonymous";
      im.onload = () => { try { CC[u] = dominant(im); } catch (e) { CC[u] = null; } };
      im.onerror = () => { CC[u] = null; };
      im.src = u;
    }
    return (TC[k] && /^#[0-9a-f]{6}$/i.test(TC[k])) ? TC[k] : themeC();
  };
  // o anel de progresso lê TC[S.i % TC.length]; troca só durante o desenho, sem mexer nas capas
  const _dr = drawRing;
  drawRing = function (dt) {
    if (!TC.length) return _dr(dt);
    const j = S.i % TC.length, old = TC[j];
    TC[j] = coverColor(S.i);
    try { return _dr(dt); } finally { TC[j] = old; }
  };
})();

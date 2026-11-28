/* Paredão Player — rodada 16: os favoritos do Laboratório de Mini Players no Modo palco
   Aquário, Poeira estelar, Ferrofluido, Vidro líquido, Acelerador, Buraco negro, Sistema solar da fila,
   Rádio valvulado, Polaroid, Radar, Capa em ASCII, Terminal, Console 8 bits, Monitor cardíaco, Post-it e Aba magnética.
   O código de cada estilo é o mesmo do Laboratório; esta ponte entrega a ele a música, o tempo e os botões do Paredão.
   Funcionam na página, na janelinha flutuante (Chrome/Edge) e no vídeo flutuante (iPhone/Safari). */
(function () {
  const stg = document.getElementById("stg"); if (!stg || !window.STAGE || !STAGE.tpl) return;
  const sx = stg.querySelector(".sgx");

  /* fontes dos estilos (terminal, console, post-it, polaroid) */
  if (!document.getElementById("r16f")) {
    const f = document.createElement("link"); f.id = "r16f"; f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Caveat:wght@600&family=Silkscreen&display=swap";
    document.head.appendChild(f);
  }

  /* ---------- ajudantes do Laboratório ---------- */
  const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
  const noise = x => (Math.sin(x * 1.31) + Math.sin(x * 2.73 + 1.1) * .5 + Math.sin(x * 5.17 + 2.3) * .25) / 1.75;
  const fmt = s => { s = Math.max(0, s | 0); return (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0"); };
  const toHex = c => { const z = document.createElement("canvas").getContext("2d"); z.fillStyle = "#000"; z.fillStyle = c || "#1fd3f2"; const v = z.fillStyle; return /^#/.test(v) ? v : "#1fd3f2"; };
  const hexA = (h, a) => { h = toHex(h); const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const mix = (h, t, k) => { h = toHex(h); t = toHex(t); const a = parseInt(h.slice(1), 16), b = parseInt(t.slice(1), 16); const c = s => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k); return "#" + [16, 8, 0].map(s => c(s).toString(16).padStart(2, "0")).join(""); };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4.5v15l10-7.5zM17 4h3v16h-3z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 4.5v15L9 12zM4 4h3v16H4z"/></svg>'
  };
  const ctl = (cls = "") => `<div class="ctl ${cls}"><button class="b" data-act="prev" aria-label="Anterior"></button><button class="b" data-act="toggle" aria-label="Tocar ou pausar"><span data-f="pp"></span></button><button class="b" data-act="next" aria-label="Próxima"></button></div>`;
  const ppb = (cls = "b") => `<button class="${cls}" data-act="toggle" aria-label="Tocar ou pausar"><span data-f="pp"></span></button>`;
  const nxb = (cls = "b") => `<button class="${cls}" data-act="next" aria-label="Próxima"></button>`;
  const TT = '<div class="ti" data-f="title"></div><div class="ar" data-f="artist"></div>';
  function cvs(parent, w, h, cls = "") { const c = document.createElement("canvas"); const r = 2; c.width = w * r; c.height = h * r; c.style.width = w + "px"; c.style.height = h + "px"; if (cls) c.className = cls; parent.appendChild(c); const g = c.getContext("2d"); g.scale(r, r); return { c, g, w, h }; }
  function el(parent, html) { parent.insertAdjacentHTML("beforeend", html); return parent.lastElementChild; }

  /* ---------- estado que o Laboratório lê (L), alimentado pelo Paredão (S) ---------- */
  const L = { i: 0, t: 0, playing: false, bass: 0, mid: 0, high: 0, beat: 0, beatN: 0, lastBeat: -9, spec: new Float32Array(32), time: 0, beatK: -1 };
  const D_ = () => (typeof D !== "undefined" && D) || 200;
  const nextK = (k, n) => { let j = k; for (let i = 0; i < n; i++) j = (S.ql && S.ql[i] != null) ? S.ql[i] : stepI(j, 1); return j; };
  const TRC = {};
  function track(k) {
    const t = T[k] || ["Paredão Player", "", ""];
    let u = ""; try { u = art(k).u || ""; } catch (e) {}
    const id = k + "|" + u;
    let o = TRC[id]; if (o) return o;
    const base = toHex(window.coverColor ? coverColor(k) : "#1fd3f2");
    o = TRC[id] = { k, title: t[0], artist: t[1], bpm: 120, get dur() { return D_(); }, pal: [base, "#eef6f8", mix(base, "#000000", .82), mix(base, "#ffffff", .25)], url: u, real: false };
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, o.pal[2]); gr.addColorStop(1, o.pal[0]); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    o.cv = c;
    if (u) { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { try { g.drawImage(im, 0, 0, 256, 256); c.getContext("2d").getImageData(0, 0, 1, 1); o.ok = 1; if (inst && inst.k === k) hook("onTrack"); } catch (e) { g.fillStyle = gr; g.fillRect(0, 0, 256, 256); } }; im.src = u; }
    return o;
  }
  const tr = () => track(S.i);
  const dur = () => D_();
  // a fila: TRACKS[n] = n-ésima música a partir da atual (o Sistema solar lê assim)
  const TRACKS = new Proxy({}, { get(_, p) { if (p === "length") return 1000; const n = +p; return isNaN(n) ? undefined : track(nextK(S.i, n)); } });

  /* ---------- os estilos ---------- */
  const C = [];
  (function (S) {
    const def = o => C.push(o);
def({id:'aquario',name:'Aquário de bolso',fam:'mat',bg:'bright',
pitch:'Cápsula de vidro com água que sobe conforme a música avança. Arraste rápido e a água balança de verdade.',
wow:'"Eu sacudi o player e a água derramou pro lado!"',tech:['Canvas 2D','mola amortecida','velocidade do arrasto'],
css:`.aq{width:280px;height:96px;border-radius:48px;position:relative;overflow:hidden;background:#ffffff14;border:1px solid #ffffff66;box-shadow:inset 0 2px 0 #fff8,inset 0 -8px 24px #fff2,0 18px 40px #0005;backdrop-filter:blur(6px)}
.aq canvas{position:absolute;inset:0}.aq .in{position:absolute;inset:0;display:flex;align-items:center;gap:12px;padding:0 14px 0 14px;color:#fff;text-shadow:0 1px 6px #0007}
.aq .cv{width:60px;height:60px;border-radius:50%;flex:none;border:2px solid #fff8}.aq .t{flex:1}.aq .hl{position:absolute;left:24px;right:24px;top:6px;height:18px;border-radius:20px;background:linear-gradient(#fff9,#fff0);pointer-events:none}`,
build(b){b.innerHTML=`<div class="aq"></div>`;const box=b.firstChild,K=cvs(box,280,96);
 el(box,`<div class="in"><div class="cv" data-cover></div><div class="t">${TT}</div>${ppb()}</div>`);el(box,'<div class="hl"></div>');
 let th=0,tv=0,sl=0,sv=0;const bub=[];
 return{onBeat(){if(S.bass>.35)for(let k=0;k<3;k++)bub.push({x:rnd(20,260),y:96,r:rnd(1.5,4),v:rnd(.4,1.1)})},
 tick(dt,i){const{g,w,h}=K;g.clearRect(0,0,w,h);const p=S.t/dur(),lvl=h-(14+p*70);
  tv+=(-i.vx*.035-th)*.12;tv*=.9;th+=tv;th=clamp(th,-.5,.5);sv+=(i.vy*.6-sl)*.1;sv*=.9;sl+=sv;
  const pal=tr().pal;g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=6)g.lineTo(x,lvl+sl*.6+Math.tan(th)*(x-w/2)+Math.sin(x/22+S.time*3)*(1.5+S.bass*4));g.lineTo(w,h);g.closePath();
  const gr=g.createLinearGradient(0,lvl-30,0,h);gr.addColorStop(0,hexA(pal[0],.85));gr.addColorStop(1,hexA(pal[3],.95));g.fillStyle=gr;g.fill();
  g.fillStyle='#fff8';for(let k=bub.length-1;k>=0;k--){const o=bub[k];o.y-=o.v;o.x+=Math.sin(o.y/6)*.3;if(o.y<lvl){bub.splice(k,1);continue}g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill()}}}}});
def({id:'poeira',name:'Poeira estelar',fam:'mat',bg:'void',
pitch:'A capa é feita de 900 grãos de poeira. Pausou, ela se desfaz no ar; deu play, os grãos voltam ao lugar.',
wow:'"O pause mais bonito que já vi."',tech:['Canvas 2D','amostragem de pixels','interpolação'],
css:`.po{width:200px;display:flex;flex-direction:column;align-items:center;gap:10px;color:#eee;text-align:center}.po .t{width:200px}`,
build(b){b.innerHTML='<div class="po"></div>';const box=b.firstChild,K=cvs(box,180,180);el(box,`<div class="t">${TT}</div>`);el(box,ctl());
 let P=[];const mk=()=>{const o=document.createElement('canvas');o.width=o.height=30;const og=o.getContext('2d');og.drawImage(tr().cv,0,0,30,30);const d=og.getImageData(0,0,30,30).data;
  const old=P;P=[];for(let y=0;y<30;y++)for(let x=0;x<30;x++){const j=(y*30+x)*4,q=old[y*30+x];P.push({hx:15+x*5,hy:15+y*5,x:q?q.x:rnd(180),y:q?q.y:rnd(180),vx:rnd(-1,1),vy:rnd(-1,1),c:`rgb(${d[j]},${d[j+1]},${d[j+2]})`})}};
 mk();let f=1;return{onTrack(){P.forEach(o=>{o.x+=rnd(-60,60);o.y+=rnd(-60,60)});mk()},tick(){const{g}=K;g.clearRect(0,0,180,180);f=lerp(f,S.playing?1:0,.04);
  for(const o of P){if(f>.5){o.x=lerp(o.x,o.hx+rnd(-1,1)*S.beat*2,.08*f);o.y=lerp(o.y,o.hy,.08*f)}else{o.vx+=rnd(-.1,.1);o.vy+=rnd(-.1,.1)-.01;o.vx*=.98;o.vy*=.98;o.x+=o.vx;o.y+=o.vy}g.fillStyle=o.c;g.fillRect(o.x-2,o.y-2,4.2,4.2)}}}}});
def({id:'ferro',name:'Ferrofluido',fam:'mat',bg:'paper',
pitch:'Líquido magnético preto e brilhante. Os espinhos crescem no grave e se inclinam na direção do seu cursor, como um ímã.',
wow:'"O espinho veio atrás do meu mouse!"',tech:['Canvas 2D','curvas quadráticas','campo do cursor'],
css:`.fe{display:flex;flex-direction:column;align-items:center;color:#121212;width:220px;text-align:center;gap:4px}`,
build(b){b.innerHTML='<div class="fe"></div>';const box=b.firstChild,K=cvs(box,210,190);el(box,`<div style="width:200px">${TT}</div>`);el(box,ctl('dark'));
 return{tick(dt,i){const{g}=K;g.clearRect(0,0,210,190);const cx=105,cy=98,N=26,R=44+S.bass*6;const ma=Math.atan2(i.my,i.mx),mh=i.hover?Math.hypot(i.mx,i.my):0;
  const P=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];g.beginPath();g.moveTo(...P(0,R));
  for(let k=0;k<N;k++){const a=k/N*TAU,s=TAU/N;let h=(6+S.bass*34+S.beat*10)*(.55+.45*noise(k*3.1+S.time*2));h*=1+Math.max(0,Math.cos(a+s/2-ma))*mh*1.4;
   g.quadraticCurveTo(...P(a+s*.3,R+h*.12),...P(a+s/2,R+h));g.quadraticCurveTo(...P(a+s*.7,R+h*.12),...P(a+s,R))}
  g.closePath();const gr=g.createRadialGradient(cx-16,cy-18,4,cx,cy,R+30);gr.addColorStop(0,'#5b6168');gr.addColorStop(.25,'#16181b');gr.addColorStop(1,'#000');g.fillStyle=gr;g.fill();
  g.fillStyle='#ffffffcc';g.beginPath();g.ellipse(cx-14,cy-18,10,5,-.6,0,TAU);g.fill();g.fillStyle='#ffffff44';g.beginPath();g.ellipse(cx+16,cy+14,14,4,.5,0,TAU);g.fill()}}}});
def({id:'liquidglass',name:'Vidro líquido',fam:'luz',bg:'bright',
pitch:'Pílula de vidro espesso que refrata o que está atrás, com um reflexo especular que acompanha a sua luz (o cursor).',
wow:'"Isso é mais bonito que o do meu celular."',tech:['backdrop-filter','reflexo especular','aberração cromática'],
css:`.lglass{width:320px;height:80px;border-radius:40px;position:relative;display:flex;align-items:center;gap:12px;padding:0 12px;color:#fff;background:#ffffff12;backdrop-filter:blur(16px) saturate(190%) brightness(1.08);-webkit-backdrop-filter:blur(16px) saturate(190%);border:1px solid #ffffff70;box-shadow:inset 0 1.5px 0 #ffffffc0,inset 0 -1px 0 #ffffff40,inset 3px 0 6px #ff3c8a2a,inset -3px 0 6px #2ad7ff33,0 22px 44px #0006;overflow:hidden}
.lglass::before{content:"";position:absolute;inset:0;background:radial-gradient(160px 70px at var(--mx,30%) var(--my,0%),#ffffff55,#fff0 70%);pointer-events:none}
.lglass .cv{width:56px;height:56px;border-radius:28px;flex:none;box-shadow:0 4px 14px #0004}.lglass .t{flex:1;text-shadow:0 1px 5px #0004}.lglass .w{display:flex;gap:3px;align-items:center;height:30px}.lglass .w i{width:3px;border-radius:3px;background:#fff;display:block}`,
build(b){b.innerHTML=`<div class="lglass"><div class="cv" data-cover></div><div class="t">${TT}</div><div class="w">${'<i></i>'.repeat(5)}</div>${ppb()}${nxb()}</div>`;const o=b.firstChild,w=[...o.querySelectorAll('.w i')];
 return{tick(dt,i){o.style.setProperty('--mx',(50+i.mx*50)+'%');o.style.setProperty('--my',(i.hover?50+i.my*50:-20)+'%');w.forEach((e,k)=>e.style.height=(4+S.spec[k*5+1]*26)+'px')}}}});
def({id:'acelerador',name:'Acelerador de partículas',fam:'cos',bg:'void',
pitch:'Um anel como o do LHC com feixes girando em sentidos opostos. Em cada batida, eles colidem no detector e explodem em rastros.',
wow:'"Cada batida é uma colisão. Nerd e lindo."',tech:['Canvas 2D','rastro por persistência','partículas com curvatura'],
css:`.ac{width:240px;height:240px;position:relative;color:#dff}.ac canvas{position:absolute;inset:0;border-radius:50%}.ac .in{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120px;text-align:center;font-size:13px}.ac .b{margin-top:6px}`,
build(b){b.innerHTML='<div class="ac"></div>';const box=b.firstChild,K=cvs(box,240,240);el(box,`<div class="in">${TT}${ppb()}</div>`);
 const A=Array.from({length:36},(_,k)=>({a:k/36*TAU,d:k%2?1:-1}));const T=[];
 return{onBeat(){for(let k=0;k<26;k++){const a=rnd(TAU),s=rnd(1.5,4.5);T.push({x:120,y:28,vx:Math.cos(a)*s,vy:Math.sin(a)*s,c:rnd(-.08,.08),l:1,col:Math.random()<.5?'#22d3ee':'#ff4f8b'})}},
 tick(){const{g}=K;g.fillStyle='rgba(3,4,5,.24)';g.fillRect(0,0,240,240);g.strokeStyle='#1d2b33';g.lineWidth=12;g.beginPath();g.arc(120,120,92,0,TAU);g.stroke();
  g.strokeStyle='#2c3e48';g.lineWidth=1;for(let k=0;k<24;k++){const a=k/24*TAU;g.beginPath();g.moveTo(120+Math.cos(a)*84,120+Math.sin(a)*84);g.lineTo(120+Math.cos(a)*100,120+Math.sin(a)*100);g.stroke()}
  const sp=S.playing?.035+S.bass*.03:.004;A.forEach(o=>{o.a+=sp*o.d;g.fillStyle=o.d>0?'#22d3ee':'#ff4f8b';g.beginPath();g.arc(120+Math.cos(o.a)*92,120+Math.sin(o.a)*92,2,0,TAU);g.fill()});
  g.fillStyle=`rgba(255,255,255,${.3+S.beat*.7})`;g.beginPath();g.arc(120,28,5+S.beat*6,0,TAU);g.fill();
  for(let k=T.length-1;k>=0;k--){const o=T[k];const c=Math.cos(o.c),s=Math.sin(o.c);[o.vx,o.vy]=[o.vx*c-o.vy*s,o.vx*s+o.vy*c];o.x+=o.vx;o.y+=o.vy;o.l-=.02;if(o.l<=0){T.splice(k,1);continue}g.fillStyle=o.col;g.globalAlpha=o.l;g.fillRect(o.x,o.y,2,2)}g.globalAlpha=1}}}});
def({id:'buraconegro',name:'Buraco negro',fam:'cos',bg:'void',
pitch:'Disco de acreção girando em volta de um horizonte de eventos, com a luz curvada por cima, como em Interstellar. O grave acelera a matéria.',
wow:'"Cinematográfico. Coloquei em tela cheia."',tech:['Canvas 2D','ordenação frente e fundo','blend lighter'],
css:`.bh{width:270px;color:#ffe9cf;text-align:center}.bh .t{display:flex;align-items:center;gap:10px;text-align:left;margin-top:2px}.bh .t>div{flex:1}`,
build(b){b.innerHTML='<div class="bh"></div>';const box=b.firstChild,K=cvs(box,270,170);el(box,`<div class="t"><div>${TT}</div>${ppb()}</div>`);
 const P=Array.from({length:520},()=>({a:rnd(TAU),r:rnd(34,120),s:rnd(.6,1.2)}));const col=r=>r<55?'255,245,220':r<80?'255,190,110':'255,120,60';
 return{tick(){const{g}=K;g.clearRect(0,0,270,170);const cx=135,cy=88,sp=(S.playing?.6:.15)+S.bass*1.2;g.globalCompositeOperation='lighter';
  const draw=front=>{for(const o of P){o.a+=sp*.02*o.s*(60/o.r);o.r-=.04*sp;if(o.r<32){o.r=rnd(90,120);o.a=rnd(TAU)}const y=Math.sin(o.a)*o.r*.28;if((y>0)!==front)continue;g.fillStyle=`rgba(${col(o.r)},${.5})`;g.fillRect(cx+Math.cos(o.a)*o.r,cy+y,1.6,1.6)}};
  draw(false);g.globalCompositeOperation='source-over';
  g.strokeStyle='rgba(255,210,150,.55)';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy-2,40,36,0,Math.PI*1.08,Math.PI*1.92);g.stroke();
  g.fillStyle='#000';g.beginPath();g.arc(cx,cy,28,0,TAU);g.fill();g.strokeStyle=`rgba(255,230,190,${.6+S.beat*.4})`;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,29.5,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';draw(true);g.globalCompositeOperation='source-over'}}}});
def({id:'solar',name:'Sistema solar da fila',fam:'cos',bg:'void',
pitch:'A música atual é o sol; as próximas da fila orbitam como planetas. Clique em um planeta para pular direto para ele.',
wow:'"A fila de músicas nunca foi tão divertida."',tech:['DOM + trigonometria','órbitas com perspectiva','fila clicável'],
css:`.so{width:280px;height:240px;position:relative;color:#fff}.so .sun{position:absolute;left:110px;top:78px;width:60px;height:60px;border-radius:50%;box-shadow:0 0 30px var(--a),0 0 70px var(--a)}
.so .orb{position:absolute;left:50%;top:108px;border:1px solid #ffffff22;border-radius:50%;transform:translate(-50%,-50%)}.so .pl{position:absolute;border-radius:50%;border:0;padding:0;cursor:pointer;background-size:cover;box-shadow:0 0 0 2px #ffffff33}
.so .pl:hover{box-shadow:0 0 0 2px #fff}.so .t{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px}.so .t>div{flex:1}`,
build(b){b.innerHTML=`<div class="so" data-pal><div class="orb" style="width:120px;height:48px"></div><div class="orb" style="width:190px;height:78px"></div><div class="orb" style="width:260px;height:108px"></div><div class="sun cv" data-cover></div><div class="ps"></div><div class="t"><div>${TT}</div>${ppb()}</div></div>`;
 const ps=b.querySelector('.ps');let Pl=[];const mk=()=>{ps.innerHTML='';Pl=[1,2,3].map((k,n)=>{const j=(S.i+k)%TRACKS.length,t=TRACKS[j],s=[30,26,22][n];const e=el(ps,`<button class="pl" data-act="jump" data-i="${j}" aria-label="Tocar ${t.title}" title="${t.title}" style="width:${s}px;height:${s}px;background-image:url(${t.url})"></button>`);return{e,s,R:[60,95,130][n],r2:[24,39,54][n],sp:[.9,.6,.4][n],ph:n*2}})};mk();
 return{onTrack:mk,tick(){const z=[];Pl.forEach(o=>{const a=S.time*o.sp+o.ph,x=140+Math.cos(a)*o.R,y=108+Math.sin(a)*o.r2;o.e.style.left=(x-o.s/2)+'px';o.e.style.top=(y-o.s/2)+'px';o.e.style.zIndex=Math.sin(a)>0?3:0;o.e.style.transform=`scale(${.8+.25*(Math.sin(a)+1)/2})`})}}}});
def({id:'valvulado',name:'Rádio valvulado',fam:'obj',bg:'wall',
pitch:'Caixa de madeira com dois mostradores VU de ponteiro e um dial que avança como sintonia conforme a música passa.',
wow:'"O ponteiro balançando é muito satisfatório."',tech:['SVG','balística de ponteiro','texturas em CSS'],
css:`.va{width:290px;border-radius:14px;padding:12px;background:repeating-linear-gradient(92deg,#5a3520 0 6px,#6b412a 6px 9px,#4e2e1b 9px 14px);box-shadow:inset 0 0 0 3px #2b170c,0 18px 34px #000a;color:#2a1a0e}
.va .row{display:flex;gap:10px}.va .vu{flex:1;height:70px;border-radius:6px;background:radial-gradient(ellipse at 50% 120%,#fff6d8,#f1dfae);box-shadow:inset 0 0 12px #9b7a3c,0 0 0 3px #2b170c;position:relative;overflow:hidden}.va .vu svg{position:absolute;inset:0}
.va .dl{margin-top:10px;height:44px;border-radius:6px;background:#f5e7bf;box-shadow:inset 0 0 14px #b8913f,0 0 0 3px #2b170c;position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 10px;font-size:12px;gap:8px}
.va .dl .ptr{position:absolute;top:4px;bottom:4px;width:2px;background:#c2261a;box-shadow:0 0 6px #ff3b30}.va .dl .ti{max-width:180px}.va .b{background:radial-gradient(circle at 35% 30%,#f3d48a,#a77a2a);color:#2a1a0e}`,
build(b){const vu=n=>`<div class="vu"><svg viewBox="0 0 130 70" aria-hidden="true"><path d="M20 58 A55 55 0 0 1 110 58" fill="none" stroke="#5a4320" stroke-width="1"/><path d="M92 26 A55 55 0 0 1 110 58" fill="none" stroke="#c2261a" stroke-width="3"/>${Array.from({length:11},(_,k)=>{const a=-2.3+k*.16;return `<line x1="${65+Math.cos(a)*48}" y1="${70+Math.sin(a)*48}" x2="${65+Math.cos(a)*56}" y2="${70+Math.sin(a)*56}" stroke="#5a4320"/>`}).join('')}<text x="65" y="52" text-anchor="middle" font-size="9" fill="#5a4320" font-family="Inter">VU ${n}</text><line class="nd" x1="65" y1="70" x2="65" y2="14" stroke="#111" stroke-width="1.6"/></svg></div>`;
 b.innerHTML=`<div class="va"><div class="row">${vu('L')}${vu('R')}</div><div class="dl"><div class="ptr"></div><div class="ti" data-f="title"></div>${ppb()}</div></div>`;
 const nd=[...b.querySelectorAll('.nd')],ptr=b.querySelector('.ptr');const v=[0,0];
 return{tick(){[S.bass*1.1,S.high*1.4+S.mid*.4].forEach((t,k)=>{v[k]=lerp(v[k],clamp(t,0,1),t>v[k]?.35:.06);nd[k].setAttribute('transform',`rotate(${-48+v[k]*96} 65 70)`)});ptr.style.left=(10+S.t/dur()*250)+'px'}}}});
def({id:'polaroid',name:'Polaroid revelando',fam:'obj',bg:'wood',
pitch:'A capa aparece como foto instantânea que vai se revelando durante a música. Sacudir acelera a revelação.',
wow:'"Eu sacudi! Igual na vida real."',tech:['CSS filter dinâmico','fonte manuscrita','energia do arrasto'],
css:`.polar{width:196px;padding:12px 12px 14px;background:#f7f5f0;box-shadow:0 18px 30px #000a;transform:rotate(-3deg);color:#222}.polar .ph{width:172px;height:172px;position:relative;overflow:hidden;background:#2a2014}.polar .cv{position:absolute;inset:0}
.polar .cp{font:600 24px/1 Caveat,cursive;margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:6px}.polar .cp span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.polar .b{width:30px;height:30px;background:#0001;color:#222}.polar .nt{position:absolute;left:8px;bottom:8px;font:600 16px Caveat,cursive;color:#fff;opacity:0;transition:opacity .4s}`,
build(b){b.innerHTML=`<div class="polar"><div class="ph"><div class="cv" data-cover></div><div class="nt">não precisa sacudir</div></div><div class="cp"><span data-f="title"></span>${ppb()}</div></div>`;
 const cv=b.querySelector('.cv'),nt=b.querySelector('.nt');let boost=0,d=0;return{onTrack(){boost=0},tick(dt,i){const sh=Math.hypot(i.vx,i.vy);if(i.dragging&&sh>6)boost=Math.min(1,boost+.01);nt.style.opacity=i.dragging&&sh>6?1:0;
  d=lerp(d,clamp(S.t/dur()*3+boost,0,1),.05);cv.style.filter=`brightness(${.25+.75*d}) sepia(${1-d}) blur(${(1-d)*5}px) saturate(${d*1.1})`}}}});
def({id:'radar',name:'Radar',fam:'cos',bg:'void',
pitch:'Uma varredura de radar dá uma volta a cada compasso e cada batida aparece como um alvo detectado.',
wow:'"Tô caçando batidas."',tech:['Canvas 2D','varredura com gradiente','persistência'],
css:`.ra{display:flex;gap:12px;align-items:center;width:310px;color:#8dffb0;font-family:JetBrains Mono,monospace;font-size:12px}.ra .t{flex:1}.ra .ti{font-size:13px}.ra .b{background:#0f2a18;color:#8dffb0;border:1px solid #2c7a47}`,
build(b){b.innerHTML='<div class="ra"></div>';const box=b.firstChild,K=cvs(box,170,170);el(box,`<div class="t">ALVO<div class="ti" data-f="title"></div><div class="ar" data-f="artist"></div><div style="margin:6px 0" data-f="time"></div>${ppb()}</div>`);const B=[];
 return{onBeat(){B.push({a:rnd(TAU),r:rnd(20,75),l:1})},tick(){const{g}=K,per=60/tr().bpm*4,sw=(S.t%per)/per*TAU-Math.PI/2;g.fillStyle='#04110a';g.beginPath();g.arc(85,85,84,0,TAU);g.fill();
  g.strokeStyle='#1d5c35';g.lineWidth=1;[28,56,82].forEach(r=>{g.beginPath();g.arc(85,85,r,0,TAU);g.stroke()});g.beginPath();g.moveTo(1,85);g.lineTo(169,85);g.moveTo(85,1);g.lineTo(85,169);g.stroke();
  for(let k=0;k<30;k++){g.fillStyle=`rgba(60,255,130,${.22*(1-k/30)})`;g.beginPath();g.moveTo(85,85);g.arc(85,85,82,sw-k*.03-.03,sw-k*.03);g.fill()}
  g.strokeStyle='#5dff9a';g.lineWidth=2;g.beginPath();g.moveTo(85,85);g.lineTo(85+Math.cos(sw)*82,85+Math.sin(sw)*82);g.stroke();
  for(let k=B.length-1;k>=0;k--){const o=B[k];o.l-=.006;if(o.l<=0){B.splice(k,1);continue}g.fillStyle=`rgba(140,255,180,${o.l})`;g.beginPath();g.arc(85+Math.cos(o.a)*o.r,85+Math.sin(o.a)*o.r,3,0,TAU);g.fill()}}}}});
def({id:'ascii',name:'Capa em ASCII',fam:'ond',bg:'void',
pitch:'A capa é redesenhada em caracteres de texto que piscam e trocam no ritmo, como arte de terminal antigo.',
wow:'"Os nerds do escritório piraram."',tech:['amostragem de brilho','<pre> monoespaçado','glitch por batida'],
css:`.as{width:260px;color:var(--a)}.as pre{margin:0;font:8px/8px JetBrains Mono,monospace;letter-spacing:.5px;text-shadow:0 0 6px var(--a)}.as .t{display:flex;gap:10px;align-items:center;margin-top:8px;font-family:JetBrains Mono,monospace;font-size:12px;color:#ddd}.as .t>div{flex:1}`,
build(b){b.innerHTML=`<div class="as" data-pal><pre></pre><div class="t"><div>${TT}</div>${ppb()}</div></div>`;const pre=b.querySelector('pre');const CH=' .:-=+*#%@';let M=[],acc=0;
 const mk=()=>{const o=document.createElement('canvas');o.width=42;o.height=20;const og=o.getContext('2d');og.drawImage(tr().cv,0,0,42,20);const d=og.getImageData(0,0,42,20).data;M=[];for(let k=0;k<840;k++)M.push((d[k*4]*.3+d[k*4+1]*.59+d[k*4+2]*.11)/255)};mk();
 return{onTrack:mk,tick(dt){acc+=dt;if(acc<.08)return;acc=0;let s='';for(let y=0;y<20;y++){for(let x=0;x<42;x++){let v=M[y*42+x];if(Math.random()<S.beat*.08)v=Math.random();s+=CH[Math.min(9,v*10|0)]}s+='\n'}pre.textContent=s}}}});
def({id:'terminal',name:'Terminal',fam:'ond',bg:'wall',
pitch:'Para quem vive no terminal: o player é uma janela de linha de comando com barra de progresso em texto e cursor piscando.',
wow:'"Finalmente um player para devs."',tech:['DOM texto','efeito de digitação','comandos clicáveis'],
css:`.te{width:300px;border-radius:10px;overflow:hidden;background:#0d1117;box-shadow:0 18px 36px #000a;font:12px/1.6 JetBrains Mono,monospace;color:#c9d1d9}.te .bar{background:#161b22;padding:7px 10px;display:flex;gap:6px;align-items:center}.te .bar i{width:10px;height:10px;border-radius:50%;display:block}
.te .bd{padding:10px 12px;min-height:118px;white-space:pre-wrap}.te .g{color:#7ee787}.te .c{color:#79c0ff}.te .k{display:inline-block;width:7px;height:13px;background:#c9d1d9;vertical-align:middle;animation:tk 1s steps(2) infinite}@keyframes tk{50%{opacity:0}}
.te button{background:none;border:0;padding:0;color:#d2a8ff;cursor:pointer;font:inherit;text-decoration:underline}`,
build(b){b.innerHTML=`<div class="te"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span style="margin-left:8px;opacity:.6">paredao — zsh</span></div><div class="bd"><span class="g"></span><span class="rs"><span class="c"></span> <span class="tm"></span>\n  <span class="eq"></span>  <span class="stt"></span>\n<button data-act="toggle">[espaço] <span class="pl"></span></button>  <button data-act="next">[n] próxima</button> <span class="k"></span></span></div></div>`;
 const q=s=>b.querySelector(s),G=q('.g'),RS=q('.rs'),Cc=q('.c'),TM=q('.tm'),EQ=q('.eq'),ST=q('.stt'),PL=q('.pl');let typed=0,full='',acc=0;
 const head=()=>{const t=tr();full=`$ paredao now\n▶ ${t.title}\n  ${t.artist}\n`;typed=0};head();
 return{onTrack:head,tick(dt){acc+=dt;if(typed<full.length&&acc>.03){typed++;acc=0;G.textContent=full.slice(0,typed)}RS.style.display=typed>=full.length?'':'none';const n=Math.round(S.t/dur()*20);const bars='▁▂▃▄▅▆▇';
  Cc.textContent=`[${'#'.repeat(n)}${'-'.repeat(20-n)}]`;TM.textContent=`${fmt(S.t)}/${fmt(dur())}`;EQ.textContent=Array.from({length:8},(_,k)=>bars[Math.min(6,S.spec[k*3]*7|0)]).join('');ST.textContent=S.playing?'tocando':'pausado';PL.textContent=S.playing?'pausar':'tocar'}}}});
def({id:'gameboy',name:'Console 8 bits',fam:'ond',bg:'wall',
pitch:'Um portátil de 8 bits com tela verde de 4 tons, capa pixelada e botões A e B que de fato tocam e pulam a música.',
wow:'"Nostalgia pura. Os botões funcionam!"',tech:['Canvas pixelado','paleta de 4 cores','image-rendering'],
css:`.gm{width:196px;padding:14px 14px 18px;border-radius:12px 12px 40px 12px;background:linear-gradient(#cfcfc8,#b9b9b1);box-shadow:0 18px 32px #000a,inset 0 2px 0 #fff8;color:#2b2a5a}.gm .sc{background:#5a5d6b;padding:12px 16px;border-radius:8px 8px 22px 8px}
.gm canvas{image-rendering:pixelated;width:136px;height:102px;display:block;margin:0 auto}.gm .lg{font:12px Silkscreen,monospace;margin:8px 4px}.gm .ct{display:flex;justify-content:space-between;align-items:center;padding:4px 8px}
.gm .dp{width:46px;height:46px;background:linear-gradient(#2a2a2a,#2a2a2a) center/14px 46px no-repeat,linear-gradient(#2a2a2a,#2a2a2a) center/46px 14px no-repeat}.gm .ab{display:flex;gap:8px;transform:rotate(-24deg)}.gm .ab .b{background:#9a2257;color:#fff;width:34px;height:34px;font:12px Silkscreen,monospace}`,
build(b){b.innerHTML=`<div class="gm"><div class="sc"></div><div class="lg">PAREDÃO BOY</div><div class="ct"><div class="dp" aria-hidden="true"></div><div class="ab"><button class="b" data-act="next" aria-label="Próxima (B)">B</button><button class="b" data-act="toggle" aria-label="Tocar ou pausar (A)">A</button></div></div></div>`;
 const sc=b.querySelector('.sc'),c=document.createElement('canvas');c.width=80;c.height=60;sc.appendChild(c);const g=c.getContext('2d');const P=['#0f380f','#306230','#8bac0f','#9bbc0f'];let pix=null,off=0;
 const mk=()=>{const o=document.createElement('canvas');o.width=o.height=28;const og=o.getContext('2d');og.drawImage(tr().cv,0,0,28,28);const d=og.getImageData(0,0,28,28).data;pix=[];for(let k=0;k<784;k++)pix.push(Math.min(3,((d[k*4]*.3+d[k*4+1]*.59+d[k*4+2]*.11)/255*4)|0))};mk();
 return{onTrack:mk,tick(dt){g.fillStyle=P[3];g.fillRect(0,0,80,60);for(let k=0;k<784;k++){g.fillStyle=P[3-pix[k]];g.fillRect(4+(k%28),4+(k/28|0),1,1)}
  for(let k=0;k<10;k++){const h=Math.round(S.spec[k*3]*20);g.fillStyle=P[0];g.fillRect(38+k*4,32-h,3,h)}
  off=(off+dt*14)%200;g.fillStyle=P[0];g.font='8px Silkscreen, monospace';g.save();g.beginPath();g.rect(0,40,80,20);g.clip();const s=tr().title.toUpperCase()+'   ';g.fillText(s,80-off,52);g.restore();g.fillRect(4,57,72*S.t/dur(),2)}}}});
def({id:'ecg',name:'Monitor cardíaco',fam:'ond',bg:'void',
pitch:'A música como sinal vital: cada batida desenha um pico de eletrocardiograma e o BPM aparece grande, como num monitor de UTI.',
wow:'"O coração da música, literalmente."',tech:['Canvas 2D','forma PQRST','BPM em destaque'],
css:`.ek{width:290px;border-radius:12px;padding:10px;background:#050807;box-shadow:inset 0 0 0 2px #1b2a22;color:#4dff88;font-family:JetBrains Mono,monospace}.ek .tp{display:flex;justify-content:space-between;align-items:flex-end}.ek .n{font:700 34px/1 JetBrains Mono,monospace}.ek .ht{color:#ff4d6d;display:inline-block}
.ek .t{display:flex;gap:10px;align-items:center;font-size:12px;color:#b8ffd0;margin-top:6px}.ek .t>div{flex:1}.ek .b{background:#0f2a18;color:#4dff88}`,
build(b){b.innerHTML=`<div class="ek"><div class="tp"><div><span class="ht">♥</span> BPM</div><div class="n"></div></div></div>`;const box=b.firstChild,K=cvs(box,270,80);el(box,`<div class="t"><div>${TT}</div>${ppb()}</div>`);const n=b.querySelector('.n'),ht=b.querySelector('.ht');const Y=new Float32Array(270);let x=0;
 const pq=t=>t<.04?Math.sin(t/.04*Math.PI)*.12:t<.08?0:t<.1?-.15:t<.13?1:t<.16?-.3:t<.26?0:t<.36?Math.sin((t-.26)/.1*Math.PI)*.2:0;
 return{tick(dt){const t=S.time-S.lastBeat;for(let k=0;k<2;k++){x=(x+1)%270;Y[x]=S.playing?pq(t)+(Math.random()-.5)*.03:0}const{g}=K;g.fillStyle='#050807';g.fillRect(0,0,270,80);
  g.strokeStyle='#123322';for(let k=0;k<270;k+=18){g.beginPath();g.moveTo(k,0);g.lineTo(k,80);g.stroke()}g.strokeStyle='#4dff88';g.lineWidth=1.6;g.shadowColor='#4dff88';g.shadowBlur=8;g.beginPath();
  for(let k=0;k<270;k++){const i2=(x+1+k)%270;const y=56-Y[i2]*48;k?g.lineTo(k,y):g.moveTo(k,y)}g.stroke();g.shadowBlur=0;n.textContent=tr().real?'—':tr().bpm;ht.style.transform=`scale(${1+S.beat*.5})`}}}});
def({id:'post',name:'Post-it',fam:'org',bg:'paper',
pitch:'Um bilhete adesivo colado na tela com o nome da música escrito à mão. A ponta descola quando você passa o mouse.',
wow:'"Simples e charmoso. Parece bilhete de alguém."',tech:['fonte manuscrita','canto que descola','SVG rabisco'],
css:`.postit{width:190px;height:180px;position:relative;transform:rotate(-2deg)}.postit .n{position:absolute;inset:0;background:linear-gradient(170deg,#fff27a,#ffe14d);box-shadow:0 10px 18px #0003;padding:20px 16px;color:#2a2410;clip-path:polygon(0 0,100% 0,100% calc(100% - var(--c)),calc(100% - var(--c)) 100%,0 100%)}
.postit .tp{position:absolute;left:55px;top:-10px;width:80px;height:24px;background:#ffffff99;transform:rotate(3deg);box-shadow:0 1px 3px #0002;z-index:2}.postit .ti{font:600 30px/1 Caveat,cursive;white-space:normal}.postit .ar{font:600 20px Caveat,cursive}
.postit .cn{position:absolute;right:0;bottom:0;width:var(--c);height:var(--c);background:linear-gradient(315deg,#0000 50%,#e8c936 50%,#fff4a6);box-shadow:-2px -2px 4px #0002}.postit .b{position:absolute;left:14px;bottom:14px;background:#2a241014;color:#2a2410}.postit svg{position:absolute;left:14px;top:110px}`,
build(b){b.innerHTML=`<div class="postit"><div class="tp"></div><div class="n"><div class="ti" data-f="title"></div><div class="ar" data-f="artist"></div></div><svg width="160" height="20" viewBox="0 0 160 20" aria-hidden="true"><path class="sc" d="M2 10 Q 12 2, 22 10 T 42 10 T 62 10 T 82 10 T 102 10 T 122 10 T 142 10 T 158 10" fill="none" stroke="#d24" stroke-width="2.5" stroke-linecap="round"/></svg><div class="cn"></div>${ppb()}</div>`;
 const o=b.firstChild,sc=b.querySelector('.sc');const L=sc.getTotalLength();sc.style.strokeDasharray=L;let c=14;
 return{tick(dt,i){c=lerp(c,i.hover?14+(i.mx+1)*12+(i.my+1)*8:14,.1);o.style.setProperty('--c',c+'px');sc.style.strokeDashoffset=L*(1-S.t/dur());o.style.transform=`rotate(${-2+S.beat*.8}deg)`}}}});
def({id:'ima',name:'Aba magnética',fam:'fut',bg:'wall',
pitch:'Um player que se gruda nas bordas da tela como ímã. Solte perto da lateral e ele vira uma aba fininha que não atrapalha nada.',
wow:'"Some quando eu não preciso e aparece quando quero."',tech:['snap às bordas','morph de layout','física de encaixe'],
css:`.im{border-radius:20px;background:#15191e;color:#fff;box-shadow:0 14px 30px #0009,inset 0 0 0 1px #ffffff1f;display:flex;align-items:center;gap:10px;padding:10px;width:230px;height:66px;transition:width .4s cubic-bezier(.34,1.4,.64,1),height .4s cubic-bezier(.34,1.4,.64,1),border-radius .4s}
.im .cv{width:46px;height:46px;border-radius:12px;flex:none;transition:all .4s}.im .t{flex:1;transition:opacity .2s}.im .vt{display:none;writing-mode:vertical-rl;font-size:12px;white-space:nowrap;overflow:hidden;max-height:70px;opacity:.8}
.im.dk{width:52px;height:180px;flex-direction:column;padding:8px 6px;border-radius:26px}.im.dk .t{display:none}.im.dk .vt{display:block}.im.dk .cv{width:38px;height:38px;border-radius:50%}.im .hn{position:absolute;top:-26px;left:0;font-size:12px;color:#ffffff99;white-space:nowrap}.im.dk .hn{display:none}`,
build(b){b.innerHTML=`<div class="im"><span class="hn">arraste até uma borda</span><div class="cv" data-cover></div><div class="t">${TT}</div><div class="vt" data-f="title"></div>${ppb()}</div>`;const o=b.firstChild;let side=0;
 return{onGrab(){if(side){side=0;o.classList.remove('dk')}},onDrop(i){const B=i.bounds();i.measure();if(i.x<40){side=-1}else if(i.x+i.w>B.w-40){side=1}if(side){o.classList.add('dk');i.vx=i.vy=0}},
 tick(dt,i){if(side&&!i.dragging){const B=i.bounds();i.measure();const tx=side<0?6:B.w-i.w-6;i.x=lerp(i.x,tx,.25);i.y=clamp(i.y,6,Math.max(6,B.h-i.hh-6));i.place()}}}}});
  })(L);
  const NAME = { aquario: "Aquário de bolso", poeira: "Poeira estelar", ferro: "Ferrofluido", liquidglass: "Vidro líquido", acelerador: "Acelerador de partículas", buraconegro: "Buraco negro", solar: "Sistema solar da fila", valvulado: "Rádio valvulado", polaroid: "Polaroid revelando", radar: "Radar", ascii: "Capa em ASCII", terminal: "Terminal", gameboy: "Console 8 bits", ecg: "Monitor cardíaco", post: "Post-it", ima: "Aba magnética" };
  const BY = {}; C.forEach(c => BY["lb_" + c.id] = c);

  /* CSS de cada estilo, preso dentro do mini player para não vazar no resto do site */
  function scope(css, pre) {
    let out = "", i = 0;
    while (i < css.length) {
      const at = css.indexOf("@", i), br = css.indexOf("{", i);
      if (br < 0) break;
      if (at >= 0 && at < br && /^@keyframes/.test(css.slice(at))) { let d = 0, j = br; for (; j < css.length; j++) { if (css[j] === "{") d++; else if (css[j] === "}" && --d === 0) break; } out += css.slice(at, j + 1); i = j + 1; continue; }
      const end = css.indexOf("}", br);
      const sel = css.slice(i, br).trim();
      out += sel.split(",").map(s => pre + " " + s.trim()).join(",") + css.slice(br, end + 1);
      i = end + 1;
    }
    return out;
  }
  const st = document.createElement("style"); st.id = "r16css";
  st.textContent = `
#stg[data-st^="lb_"]{padding:0!important;background:none!important;box-shadow:none!important;border:0!important;overflow:visible;max-width:none!important}
#stg[data-st^="lb_"] .sgi{display:none!important}
#stg[data-st^="lb_"] .sgx{display:block!important;backdrop-filter:none!important}
#stg.opq[data-st^="lb_"]{padding:16px!important;border-radius:26px!important;background:linear-gradient(180deg,var(--g1,#10364a),var(--g2,#061a28) 62%,var(--g3,#082030))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 18px 40px rgba(0,0,0,.45)!important}
.lbx{position:relative;font-family:Inter,"Exo 2",system-ui,sans-serif;font-size:14px;line-height:1.3;color:#fff;text-align:left;--a:var(--neon,#1fd3f2)}
.lbx *{box-sizing:border-box;min-width:0}
.lbx .cv{background-size:cover;background-position:center;background-color:#222}
.lbx .b{all:unset;width:36px;height:36px;border-radius:50%;background:#ffffff1c;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none;transition:transform .15s,background .2s}
.lbx .b svg{width:16px;height:16px;pointer-events:none;display:block}
.lbx .b:hover{background:#ffffff33;transform:scale(1.06)}.lbx .b:active{transform:scale(.94)}
.lbx [data-f=pp]{display:grid;place-items:center}
.lbx .ti{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lbx .ar{opacity:.72;font-size:.86em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lbx .ctl{display:flex;gap:6px;align-items:center}.lbx .ctl.dark .b{background:#0000000f;color:#111}
.lbx canvas{display:block}
/* legíveis sobre qualquer fundo (o Laboratório tinha fundos próprios) */
#stg:not(.opq) .lbx .po,#stg:not(.opq) .lbx .fe,#stg:not(.opq) .lbx .bh,#stg:not(.opq) .lbx .so,#stg:not(.opq) .lbx .ac,#stg:not(.opq) .lbx .as .t,#stg:not(.opq) .lbx .ra{text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 12px rgba(0,0,0,.6)}
.lbx .fe{color:#eef3f6}.lbx .fe .ctl.dark .b{background:#ffffff1c;color:#fff}
html.light .lbx .fe{color:#121212}html.light .lbx .fe .ctl.dark .b{background:#0000000f;color:#111}
` + C.map(c => scope(c.css || "", ".lbx")).join("\n") + `
/* ícones na escolha do estilo */
.sti-lb_aquario{border-radius:1em!important;background:linear-gradient(transparent 45%,#22d3ee 45%)!important;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.6)}
.sti-lb_poeira{background:radial-gradient(circle,#fff 0 1px,transparent 1.5px) 0 0/.3em .3em,#1b1030!important}
.sti-lb_ferro{border-radius:50%!important;background:radial-gradient(circle at 35% 30%,#6b7178,#16181b 40%,#000)!important;box-shadow:0 0 0 2px #000}
.sti-lb_liquidglass{border-radius:1em!important;background:linear-gradient(90deg,#ff3c8a33,#ffffff40,#2ad7ff33)!important;box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px #ffffff70}
.sti-lb_acelerador{border-radius:50%!important;background:radial-gradient(circle,transparent 52%,#22d3ee 54% 60%,transparent 62%),radial-gradient(circle at 50% 8%,#fff 0 10%,transparent 12%),#030405!important}
.sti-lb_buraconegro{border-radius:50%!important;background:radial-gradient(circle,#000 0 30%,#ffd28a 33%,#ff7a3c 45%,transparent 62%)!important}
.sti-lb_solar{border-radius:50%!important;background:radial-gradient(circle,var(--neon,var(--a)) 0 22%,transparent 24%),radial-gradient(circle at 88% 50%,#ffd36b 0 9%,transparent 10%),radial-gradient(circle,transparent 52%,rgba(255,255,255,.3) 54%,transparent 56%),#05070d!important}
.sti-lb_valvulado{border-radius:.25em!important;background:radial-gradient(ellipse at 30% 60%,#f1dfae 0 22%,transparent 24%),radial-gradient(ellipse at 70% 60%,#f1dfae 0 22%,transparent 24%),repeating-linear-gradient(92deg,#5a3520 0 3px,#6b412a 3px 5px)!important}
.sti-lb_polaroid{border-radius:.1em!important;background:linear-gradient(#5c4a35,#2a2014) center 30%/76% 62% no-repeat,#f7f5f0!important;transform:rotate(-4deg)}
.sti-lb_radar{border-radius:50%!important;background:conic-gradient(from 0deg,rgba(60,255,130,.6),transparent 25%),radial-gradient(circle,transparent 60%,#1d5c35 62%,transparent 64%),#04110a!important}
.sti-lb_ascii{background:repeating-linear-gradient(0deg,var(--neon,var(--a)) 0 1px,transparent 1px 3px),#05080a!important;opacity:.85}
.sti-lb_terminal{border-radius:.2em!important;background:linear-gradient(#161b22 0 22%,#0d1117 22%)!important;box-shadow:inset .25em -.2em 0 -.12em #7ee787}
.sti-lb_gameboy{border-radius:.2em .2em .55em .2em!important;background:linear-gradient(#8bac0f,#8bac0f) center 28%/70% 42% no-repeat,#c4c4bc!important}
.sti-lb_ecg{background:linear-gradient(135deg,transparent 46%,#4dff88 46% 54%,transparent 54%) 0 0/50% 100%,#050807!important}
.sti-lb_post{border-radius:0!important;background:linear-gradient(170deg,#fff27a,#ffe14d)!important;transform:rotate(-4deg)}
.sti-lb_ima{border-radius:.9em!important;width:.7em!important;background:#15191e!important;box-shadow:inset 0 0 0 1px #ffffff33,0 0 6px var(--neon,var(--a))}`;
  document.head.appendChild(st);

  /* ---------- registra no Modo palco ---------- */
  C.forEach(c => { STAGE.tpl["lb_" + c.id] = `<div class="lbx" data-lab="${c.id}"><div class="mbox" data-pal></div></div>`; STAGE.list.push(["lb_" + c.id, NAME[c.id] || c.name]); });
  if (STAGE.v0 && STAGE.tpl[STAGE.v0] && STAGE.cur() !== STAGE.v0) STAGE.set(STAGE.v0);

  /* ---------- instância viva (uma de cada vez: o mini player do Modo palco) ---------- */
  let inst = null;
  function hook(n) { if (!inst || !inst.h || !inst.h[n]) return; try { inst.h[n](inst); } catch (e) { console.warn("r16", inst.c.id, n, e); inst.h[n] = null; } }
  function paint() {
    if (!inst) return; const b = inst.box, t = tr();
    b.querySelectorAll("[data-f=title]").forEach(e => e.textContent = t.title);
    b.querySelectorAll("[data-f=artist]").forEach(e => e.textContent = t.artist);
    b.querySelectorAll("[data-cover]").forEach(e => e.style.backgroundImage = t.url ? `url("${t.url}")` : `url(${t.cv.toDataURL("image/jpeg", .8)})`);
    b.querySelectorAll("[data-pal]").forEach(e => { const p = t.pal; e.style.setProperty("--a", p[0]); e.style.setProperty("--b", p[1]); e.style.setProperty("--d", p[2]); e.style.setProperty("--e", p[3]); });
    paintPP();
  }
  function paintPP() {
    if (!inst) return; const b = inst.box;
    b.querySelectorAll("[data-f=pp]").forEach(e => { const v = L.playing ? "pause" : "play"; if (e._v !== v) { e._v = v; e.innerHTML = ICON[v]; } });
    b.querySelectorAll("[data-act=prev]:empty").forEach(e => e.innerHTML = ICON.prev);
    b.querySelectorAll("[data-act=next]:empty").forEach(e => e.innerHTML = ICON.next);
  }
  function build() {
    const id = stg.dataset.st, c = BY[id], box = sx.querySelector(".lbx .mbox");
    if (inst && inst.box === box) return;
    if (inst && inst.h && inst.h.destroy) try { inst.h.destroy(); } catch (e) {}
    inst = null; if (!c || !box) return;
    const I = inst = {
      c, box, k: S.i, x: 0, y: 0, vx: 0, vy: 0, mx: 0, my: 0, tmx: 0, tmy: 0, hover: false, dragging: false, vis: true,
      bounds() { return { w: innerWidth, h: innerHeight }; },
      measure() { const r = stg.getBoundingClientRect(); this.w = r.width; this.hh = r.height; },
      place() { if (stg.classList.contains("inpip")) return; stg.style.right = stg.style.bottom = "auto"; stg.style.left = this.x.toFixed(1) + "px"; stg.style.top = this.y.toFixed(1) + "px"; },
      center() {}
    };
    try { I.h = c.build(box, I) || {}; } catch (e) { console.warn("r16 build", c.id, e); I.h = {}; }
    paint();
  }
  new MutationObserver(build).observe(sx, { childList: true, subtree: true });

  /* ponteiro: brilho que segue o mouse, arraste com velocidade (o aquário balança, a polaroid revela) */
  let down = false, lr = null;
  stg.addEventListener("pointermove", e => { if (!inst) return; const r = stg.getBoundingClientRect(); inst.tmx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); inst.tmy = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1); inst.hover = true; });
  stg.addEventListener("pointerleave", () => { if (inst && !down) { inst.hover = false; inst.tmx = inst.tmy = 0; } });
  stg.addEventListener("pointerdown", e => {
    if (!inst) return;
    if (e.target.closest(".lbx [data-act],.lbx button,.lbx input")) { e.stopPropagation(); return; }
    down = true; inst.dragging = true; lr = null; hook("onGrab");
  }, true);
  const up = e => { if (!inst) return; if (e && e.target && e.target.closest && e.target.closest(".lbx [data-act],.lbx button")) e.stopPropagation(); if (!down) return; down = false; inst.dragging = false; const r = stg.getBoundingClientRect(); inst.x = r.left; inst.y = r.top; inst.measure(); hook("onDrop"); };
  stg.addEventListener("pointerup", up, true); stg.addEventListener("pointercancel", up, true);

  /* botões de dentro dos estilos = botões de verdade do Paredão */
  const tap = a => { const b = document.createElement("button"); b.dataset.a = a; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); };
  stg.addEventListener("click", e => {
    const b = e.target.closest(".lbx [data-act]"); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    const a = b.dataset.act;
    if (a === "toggle") tap("pp");
    else if (a === "next") tap("nx");
    else if (a === "prev") tap("pv");
    else if (a === "jump") { const n = +b.dataset.i || 1; for (let i = 0; i < n; i++) setTimeout(() => tap("nx"), i * 260); }
  }, true);

  /* ---------- relógio: espectro e batidas no BPM (o Spotify não entrega o áudio, então o pulso é sintetizado) ---------- */
  let last = performance.now(), lastK = null;
  function step() {
    const now = performance.now(), dt = Math.min(.1, (now - last) / 1000); if (now - last < 14) return; last = now;
    const show = stg.classList.contains("on") || stg.classList.contains("inpip") || stg.classList.contains("prev") || (window.VPIP && VPIP.on);
    if (!inst || !show) return;
    L.time += dt; L.t = S.t || 0; L.playing = !!S.p;
    if (S.i !== lastK) { lastK = S.i; inst.k = S.i; L.beatK = -1; paint(); hook("onTrack"); }
    const sp = L.spec;
    if (L.playing) {
      const per = 60 / tr().bpm, ph = (L.t % per) / per, k = Math.floor(L.t / per);
      if (k !== L.beatK) { L.beatK = k; L.lastBeat = L.time - ph * per; L.beatN++; hook("onBeat"); }
      const env = Math.exp(-ph * 5), snare = (k % 2 === 1) ? Math.exp(-ph * 9) : 0;
      for (let b = 0; b < 32; b++) { const f = b / 31, nn = noise(L.t * (1.3 + f * 5) + b * 1.7); sp[b] = clamp((1 - f) * (1 - f) * .7 * env + (.18 + .3 * (1 - f)) * (.55 + .45 * nn) + f * .35 * snare, 0, 1); }
    } else for (let b = 0; b < 32; b++) sp[b] *= .9;
    let B = 0, M = 0, H = 0; for (let b = 0; b < 4; b++) B += sp[b]; for (let b = 4; b < 18; b++) M += sp[b]; for (let b = 18; b < 32; b++) H += sp[b];
    L.bass = lerp(L.bass, B / 4, .4); L.mid = lerp(L.mid, M / 14, .4); L.high = lerp(L.high, H / 14, .4);
    L.beat = L.playing ? Math.exp(-(L.time - L.lastBeat) * 7) : L.beat * .9;
    // velocidade do arraste (a partir da posição do mini player)
    const r = stg.getBoundingClientRect();
    if (lr) { inst.vx = lerp(inst.vx, (r.left - lr.left), .5); inst.vy = lerp(inst.vy, (r.top - lr.top), .5); } lr = { left: r.left, top: r.top };
    if (!down) { inst.x = r.left; inst.y = r.top; }
    inst.w = r.width; inst.hh = r.height;
    inst.mx = lerp(inst.mx, inst.tmx, .12); inst.my = lerp(inst.my, inst.tmy, .12);
    paintPP();
    if (inst.h && inst.h.tick) try { inst.h.tick(dt, inst); } catch (e) { console.warn("r16 tick", inst.c.id, e); inst.h.tick = null; }
  }
  (function raf() { step(); requestAnimationFrame(raf); })();
  setInterval(step, 40); // aba escondida (janelinha aberta): o navegador freia o requestAnimationFrame

  /* ---------- janelinha flutuante: tamanho certo para cada estilo ---------- */
  const DP = window.documentPictureInPicture;
  if (DP && DP.requestWindow) {
    const _rw = DP.requestWindow.bind(DP);
    DP.requestWindow = function (o) {
      if (inst && /^lb_/.test(stg.dataset.st || "")) { const r = inst.box.getBoundingClientRect(); if (r.width > 40) o = Object.assign({}, o, { width: Math.round(r.width + 60), height: Math.round(r.height + 120) }); }
      return _rw(o);
    };
  }

  /* ---------- vídeo flutuante (iPhone/Safari): cada estilo desenhado no canvas ---------- */
  const VP = window.VPIP; if (!VP || !VP.DRAW) return;
  const { x, rr, fit } = VP;
  const W = 640, H = 360;
  C.forEach(c => VP.DIMS["lb_" + c.id] = [W, H]);
  ["acelerador", "buraconegro", "radar", "poeira", "ferro", "solar", "polaroid", "post", "gameboy"].forEach(id => VP.DIMS["lb_" + id] = [480, 480]);
  const ink = "#fff";
  function bgV(c) { x.fillStyle = VP.TBG(c); x.fillRect(0, 0, 640, 640); }
  function txt(t, X, Y, w, col, sz, fam) { x.fillStyle = col || ink; x.font = `700 ${sz || 30}px ${fam || '"Chakra Petch",sans-serif'}`; x.fillText(fit(t, w), X, Y); }
  function info(c, X, Y, w, col, fam) {
    const t = T[S.i] || ["", ""];
    txt(t[0], X, Y, w, col, 32, fam);
    x.globalAlpha = .72; txt(t[1] || "", X, Y + 36, w, col, 22, fam); x.globalAlpha = 1;
    const p = VP.pr01(); x.fillStyle = "rgba(255,255,255,.16)"; rr(X, Y + 58, w, 6, 3); x.fill();
    x.save(); x.shadowColor = c.ne; x.shadowBlur = 10; x.fillStyle = c.ne; rr(X, Y + 58, Math.max(6, w * p), 6, 3); x.fill(); x.restore();
    x.globalAlpha = .7; x.fillStyle = col || ink; x.font = '400 18px "Chakra Petch",sans-serif'; x.fillText(VP.mmss(S.t) + " / " + VP.mmss(D_()), X, Y + 92); x.globalAlpha = 1;
  }
  const canv = () => inst ? [...inst.box.querySelectorAll("canvas")] : [];
  // estilos com canvas próprio: o desenho do Laboratório vai direto para o vídeo
  function viaCanvas(id, side) {
    return function (c) {
      const sq = (VP.DIMS["lb_" + id] || [W, H])[1] > 400;
      bgV(c); const cs = canv(); const k = cs[0];
      if (sq) {
        if (k) { const s = Math.min(380 / k.width, 330 / k.height); const w = k.width * s, h = k.height * s; x.drawImage(k, (480 - w) / 2, 24 + (330 - h) / 2, w, h); }
        const t = T[S.i] || ["", ""]; x.textAlign = "center"; txt(t[0], 240, 400, 420, side, 30); x.globalAlpha = .7; txt(t[1] || "", 240, 432, 420, side, 20); x.globalAlpha = 1; x.textAlign = "left";
        const p = VP.pr01(); x.fillStyle = "rgba(255,255,255,.15)"; rr(60, 450, 360, 5, 2.5); x.fill(); x.fillStyle = c.ne; rr(60, 450, Math.max(5, 360 * p), 5, 2.5); x.fill();
      } else {
        if (k) { const s = Math.min(300 / k.width, 300 / k.height); const w = k.width * s, h = k.height * s; x.drawImage(k, 30 + (300 - w) / 2, 30 + (300 - h) / 2, w, h); }
        info(c, 350, 150, 260, side);
      }
    };
  }
  const D2 = VP.DRAW;
  ["poeira", "ferro", "acelerador", "buraconegro", "radar"].forEach(id => D2["lb_" + id] = viaCanvas(id));
  D2.lb_ecg = function (c) {
    bgV(c); x.fillStyle = "#050807"; rr(20, 20, 600, 320, 22); x.fill(); x.strokeStyle = "#1b2a22"; x.lineWidth = 3; x.stroke();
    x.fillStyle = "#ff4d6d"; x.font = '700 40px "JetBrains Mono",monospace'; x.fillText("♥", 50, 82); x.fillStyle = "#4dff88"; x.font = '600 22px "JetBrains Mono",monospace'; x.fillText("BPM", 92, 78);
    x.font = '700 64px "JetBrains Mono",monospace'; x.textAlign = "right"; x.fillText(String(tr().bpm), 590, 92); x.textAlign = "left";
    const k = canv()[0]; if (k) x.drawImage(k, 40, 106, 560, 150);
    const t = T[S.i] || ["", ""]; x.fillStyle = "#b8ffd0"; x.font = '600 24px "JetBrains Mono",monospace'; x.fillText(fit(t[0], 540), 50, 296); x.globalAlpha = .7; x.font = '400 18px "JetBrains Mono",monospace'; x.fillText(fit(t[1] || "", 540), 50, 322); x.globalAlpha = 1;
  };
  D2.lb_aquario = function (c) {
    bgV(c); const k = canv()[0];
    x.save(); rr(30, 100, 580, 170, 85); x.clip(); x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(30, 100, 580, 170); if (k) x.drawImage(k, 30, 100, 580, 170); x.restore();
    x.save(); x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 2; rr(30, 100, 580, 170, 85); x.stroke(); x.restore();
    x.save(); x.beginPath(); x.arc(118, 185, 58, 0, TAU); x.clip(); const im = VP.coverK(S.i); if (im) x.drawImage(im, 60, 127, 116, 116); x.restore();
    const t = T[S.i] || ["", ""]; x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 8; txt(t[0], 200, 180, 380, "#fff", 32); x.globalAlpha = .8; txt(t[1] || "", 200, 214, 380, "#fff", 22); x.globalAlpha = 1; x.shadowBlur = 0;
    const p = VP.pr01(); x.fillStyle = c.ne; rr(80, 300, 480 * p + 4, 5, 2.5); x.fill();
  };
  D2.lb_gameboy = function (c) {
    bgV(c); x.fillStyle = "#c4c4bc"; rr(70, 20, 340, 440, 22); x.fill(); x.fillStyle = "#5a5d6b"; rr(100, 48, 280, 220, 14); x.fill();
    const k = canv()[0]; if (k) { x.imageSmoothingEnabled = false; x.drawImage(k, 128, 64, 224, 168); x.imageSmoothingEnabled = true; }
    x.fillStyle = "#2b2a5a"; x.font = '400 20px Silkscreen,monospace'; x.fillText("PAREDÃO BOY", 110, 300);
    x.fillStyle = "#2a2a2a"; x.fillRect(110, 350, 60, 20); x.fillRect(130, 330, 20, 60);
    [[330, 340, "A"], [280, 370, "B"]].forEach(([a, b, l]) => { x.fillStyle = "#9a2257"; x.beginPath(); x.arc(a, b, 24, 0, TAU); x.fill(); x.fillStyle = "#fff"; x.font = '400 16px Silkscreen,monospace'; x.fillText(l, a - 6, b + 6); });
  };
  D2.lb_ascii = function (c) {
    bgV(c); const pre = inst && inst.box.querySelector("pre");
    x.save(); x.fillStyle = c.ne; x.shadowColor = c.ne; x.shadowBlur = 8; x.font = '13px "JetBrains Mono",monospace';
    (pre ? pre.textContent : "").split("\n").forEach((l, i) => x.fillText(l, 36, 40 + i * 13.5)); x.restore();
    info(c, 380, 140, 230, "#ddd", '"JetBrains Mono",monospace');
  };
  D2.lb_terminal = function (c) {
    bgV(c); x.fillStyle = "#0d1117"; rr(30, 30, 580, 300, 16); x.fill(); x.fillStyle = "#161b22"; rr(30, 30, 580, 40, 16); x.fill(); x.fillRect(30, 54, 580, 16);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((cc, i) => { x.fillStyle = cc; x.beginPath(); x.arc(56 + i * 22, 50, 7, 0, TAU); x.fill(); });
    x.fillStyle = "rgba(201,209,217,.6)"; x.font = '400 16px "JetBrains Mono",monospace'; x.fillText("paredao — zsh", 130, 56);
    const bd = inst && inst.box.querySelector(".bd"); const lines = bd ? bd.innerText.split("\n") : [];
    x.font = '400 21px "JetBrains Mono",monospace';
    lines.slice(0, 8).forEach((l, i) => { x.fillStyle = i < 3 ? "#7ee787" : i === 3 ? "#79c0ff" : i >= 5 ? "#d2a8ff" : "#c9d1d9"; x.fillText(fit(l, 540), 54, 108 + i * 30); });
    if ((performance.now() / 500 | 0) % 2) { x.fillStyle = "#c9d1d9"; x.fillRect(54 + 8, 108 + Math.min(7, lines.length) * 30 - 18, 11, 22); }
  };
  D2.lb_polaroid = function (c) {
    bgV(c); x.save(); x.translate(240, 240); x.rotate(-.05); x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 30; x.shadowOffsetY = 14; x.fillStyle = "#f7f5f0"; x.fillRect(-170, -205, 340, 410); x.shadowColor = "transparent";
    const d = clamp(S.t / D_() * 3, 0, 1); const im = VP.coverK(S.i);
    x.filter = `brightness(${.25 + .75 * d}) sepia(${1 - d}) blur(${(1 - d) * 6}px) saturate(${d * 1.1})`; if (im) x.drawImage(im, -150, -185, 300, 300); else { x.fillStyle = "#2a2014"; x.fillRect(-150, -185, 300, 300); } x.filter = "none";
    x.fillStyle = "#222"; x.font = '600 40px Caveat,cursive'; x.fillText(fit((T[S.i] || [""])[0], 290), -145, 168); x.restore();
  };
  D2.lb_post = function (c) {
    bgV(c); x.save(); x.translate(240, 250); x.rotate(-.035 + L.beat * .014);
    x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 24; x.shadowOffsetY = 10; const g = x.createLinearGradient(-170, -170, 170, 170); g.addColorStop(0, "#fff27a"); g.addColorStop(1, "#ffe14d"); x.fillStyle = g; x.fillRect(-170, -170, 340, 340); x.shadowColor = "transparent";
    x.fillStyle = "rgba(255,255,255,.6)"; x.save(); x.rotate(.05); x.fillRect(-70, -190, 140, 40); x.restore();
    const t = T[S.i] || ["", ""]; x.fillStyle = "#2a2410"; x.font = '600 54px Caveat,cursive'; x.fillText(fit(t[0], 300), -145, -90); x.font = '600 36px Caveat,cursive'; x.fillText(fit(t[1] || "", 300), -145, -40);
    const p = VP.pr01(); x.strokeStyle = "#d24"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); for (let i = 0; i <= 60 * p; i++) { const X = -145 + i * 5, Y = 40 + Math.sin(i * .7) * 9; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); x.restore();
  };
  D2.lb_valvulado = function (c) {
    bgV(c); const g = x.createLinearGradient(0, 0, 640, 0); for (let i = 0; i < 12; i++) { g.addColorStop(i / 12, i % 2 ? "#6b412a" : "#4e2e1b"); } x.fillStyle = g; rr(30, 30, 580, 300, 24); x.fill();
    const vu = (cx, v, n) => { x.fillStyle = "#f1dfae"; rr(cx - 125, 60, 250, 140, 10); x.fill(); x.strokeStyle = "#5a4320"; x.lineWidth = 2; x.beginPath(); x.arc(cx, 200, 110, Math.PI * 1.18, Math.PI * 1.82); x.stroke(); x.strokeStyle = "#c2261a"; x.lineWidth = 5; x.beginPath(); x.arc(cx, 200, 110, Math.PI * 1.65, Math.PI * 1.82); x.stroke(); const a = -Math.PI / 2 + (-48 + v * 96) * Math.PI / 180; x.strokeStyle = "#111"; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, 200); x.lineTo(cx + Math.cos(a) * 118, 200 + Math.sin(a) * 118); x.stroke(); x.fillStyle = "#5a4320"; x.font = '600 16px Inter,sans-serif'; x.fillText("VU " + n, cx - 18, 186); };
    vu(175, clamp(L.bass * 1.1, 0, 1), "L"); vu(465, clamp(L.high * 1.4 + L.mid * .4, 0, 1), "R");
    x.fillStyle = "#f5e7bf"; rr(50, 224, 540, 80, 10); x.fill(); x.fillStyle = "#2a1a0e"; x.font = '600 26px Inter,sans-serif'; x.fillText(fit((T[S.i] || [""])[0], 480), 74, 274);
    x.fillStyle = "#c2261a"; x.fillRect(60 + VP.pr01() * 520, 230, 4, 68);
  };
  D2.lb_solar = function (c) {
    bgV(c); const cx = 240, cy = 210; [[120, 48], [180, 74], [230, 96]].forEach(([a, b]) => { x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy, a, b, 0, 0, TAU); x.stroke(); });
    const tm = L.time, P = [[120, 48, .9, 0, 46], [180, 74, .6, 2, 40], [230, 96, .4, 4, 34]].map(([R, r2, sp, ph, s], n) => { const a = tm * sp + ph; return { X: cx + Math.cos(a) * R, Y: cy + Math.sin(a) * r2, s: s * (.8 + .25 * (Math.sin(a) + 1) / 2), z: Math.sin(a), k: nextK(S.i, n + 1) }; });
    const disk = (X, Y, s, k, glow) => { x.save(); if (glow) { x.shadowColor = c.ne; x.shadowBlur = 50; } x.beginPath(); x.arc(X, Y, s / 2, 0, TAU); x.fillStyle = "#222"; x.fill(); x.shadowBlur = 0; x.clip(); const im = VP.coverK(k); if (im) x.drawImage(im, X - s / 2, Y - s / 2, s, s); x.restore(); };
    P.filter(p => p.z <= 0).forEach(p => disk(p.X, p.Y, p.s, p.k)); disk(cx, cy, 104, S.i, true); P.filter(p => p.z > 0).forEach(p => disk(p.X, p.Y, p.s, p.k));
    const t = T[S.i] || ["", ""]; x.textAlign = "center"; txt(t[0], 240, 395, 420, "#fff", 30); x.globalAlpha = .7; txt(t[1] || "", 240, 428, 420, "#fff", 20); x.globalAlpha = 1; x.textAlign = "left";
  };
  D2.lb_liquidglass = function (c) {
    bgV(c); const im = VP.coverK(S.i);
    if (im) { x.save(); x.filter = "blur(28px) saturate(1.6)"; x.globalAlpha = .55; x.drawImage(im, 40, -40, 560, 440); x.restore(); }
    x.save(); x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = "rgba(255,255,255,.14)"; rr(30, 110, 580, 140, 70); x.fill(); x.restore();
    x.strokeStyle = "rgba(255,255,255,.6)"; x.lineWidth = 1.5; rr(30, 110, 580, 140, 70); x.stroke();
    const hl = x.createLinearGradient(0, 112, 0, 160); hl.addColorStop(0, "rgba(255,255,255,.55)"); hl.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = hl; rr(70, 114, 500, 40, 20); x.fill();
    x.save(); rr(52, 132, 96, 96, 48); x.clip(); if (im) x.drawImage(im, 52, 132, 96, 96); x.restore();
    const t = T[S.i] || ["", ""]; txt(t[0], 170, 178, 300, "#fff", 30); x.globalAlpha = .8; txt(t[1] || "", 170, 210, 300, "#fff", 20); x.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const h = 6 + L.spec[i * 5 + 1] * 50; x.fillStyle = "#fff"; rr(500 + i * 14, 180 - h / 2, 6, h, 3); x.fill(); }
  };
  D2.lb_ima = function (c) {
    bgV(c); x.save(); x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 30; x.fillStyle = "#15191e"; rr(40, 120, 560, 120, 36); x.fill(); x.restore();
    x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1.5; rr(40, 120, 560, 120, 36); x.stroke();
    x.save(); rr(60, 140, 80, 80, 20); x.clip(); const im = VP.coverK(S.i); if (im) x.drawImage(im, 60, 140, 80, 80); x.restore();
    const t = T[S.i] || ["", ""]; txt(t[0], 160, 182, 400, "#fff", 30); x.globalAlpha = .7; txt(t[1] || "", 160, 214, 400, "#fff", 20); x.globalAlpha = 1;
    x.fillStyle = c.ne; x.fillRect(60, 254, 520 * VP.pr01(), 4);
  };
})();

/* ---------- rodada 16: pop-ups em vidro elevado (inclinação 3D, avisos, favoritos) ---------- */
(function () {
  const CARD = ".dm>div,#ctx button,#cfg .c15 .cball,#cfg .stgrid button,#cfg .pipseg button,#cfg .c16p button";
  let lastC = null;
  document.addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    const c = e.target.closest && e.target.closest(CARD);
    if (lastC && lastC !== c) { lastC.style.removeProperty("--rx"); lastC.style.removeProperty("--ry"); }
    lastC = c; if (!c) return;
    const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    c.style.setProperty("--ry", ((px - .5) * 14).toFixed(2) + "deg");
    c.style.setProperty("--rx", ((.5 - py) * 12).toFixed(2) + "deg");
    c.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    c.style.setProperty("--my", (py * 100).toFixed(1) + "%");
  }, { passive: true });

  /* avisos com selo: ✓ confirma, ♪ música, × removido */
  if (typeof say === "function") {
    const _say = say, tt = document.getElementById("tt");
    const esc = s => String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";");
    const ico = m => /remov|tirad|desligad|saiu/i.test(m) ? "×" : /^tocando|próxima|anterior/i.test(m) ? "♪" : /não |erro|falh/i.test(m) ? "!" : "✓";
    window.say = say = function (m) {
      _say(m);
      const ft = document.getElementById("ftoast"), el = ft && ft.classList.contains("on") && ft.textContent === String(m) ? ft : tt;
      if (el) el.innerHTML = `<span class="tk">${ico(String(m))}</span><span>${esc(m)}</span>`;
    };
  }
  /* menu de favoritos sabe se a música já está lá */
  setInterval(() => { const fm = document.getElementById("fm"); if (fm && typeof FAV !== "undefined") fm.classList.toggle("fv", FAV.has(S.i)); }, 500);
})();

/* ---------- Configurações: filtro de Fundo (Escuro / Claro) com paletas feitas para cada um ---------- */
(function () {
  const pal = document.getElementById("cfgpal"); if (!pal || !window.THEME) return;
  const P = {
    d: [["Paredão", "#071a26", "#1fd3f2"], ["Meia-noite", "#0b1030", "#5b8cff"], ["Rubi", "#1c0609", "#ff4d5a"], ["Synthwave", "#1a0633", "#ff3fd8"], ["Aurora", "#06201b", "#3dffa8"], ["Âmbar", "#22140a", "#ffb347"], ["Oceano calmo", "#123447", "#7fe0d4"], ["Ameixa", "#2a1430", "#ff8fc8"], ["Grafite neon", "#17191d", "#c6ff3d"], ["Terracota", "#3a1d14", "#ffa36c"], ["Violeta", "#0c0720", "#b388ff"], ["Ouro", "#0e0e10", "#d4af37"]],
    // claros: destaques mais fundos (sem neon), para o vidro e a estrelinha da lupa continuarem aparecendo
    c: [["Areia", "#e9dcc6", "#b4531f"], ["Marfim e verde bebê", "#f3eedf", "#25845e"], ["Azul bebê", "#dcebf7", "#1f6fb8"], ["Lavanda", "#e6e0f4", "#7044c9"], ["Pêssego", "#f6dfd2", "#c23d50"], ["Sálvia", "#d9e4d6", "#3f7a4c"], ["Gelo", "#e8f3f7", "#0a7ea0"], ["Névoa rosa", "#f6e9ef", "#b02a68"]]
  };
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
  const mode = () => LS("pd_palm") || (document.documentElement.classList.contains("light") ? "c" : "d");
  const curBg = () => { const t = THEME.get(); return String(typeof t.bgx === "string" ? t.bgx : "").toLowerCase(); };
  const curNe = () => { const t = THEME.get(); return String(typeof t.ne === "string" ? t.ne : "").toLowerCase(); };
  function draw() {
    const p15 = pal.querySelector(".c15p"); if (!p15) return;
    let box = pal.querySelector(".c16"); const m = mode();
    if (!box) {
      box = document.createElement("div"); box.className = "c16";
      p15.parentNode.insertBefore(box, p15.nextSibling);
      const lab = p15.previousElementSibling; if (lab && lab.classList.contains("tlab")) lab.textContent = "Fundo";
    }
    const h = m + curBg() + curNe(); if (box._h === h) return; box._h = h;
    box.innerHTML = `<div class="c16f" role="tablist"><button type="button" data-pm="d" class="${m === "d" ? "on" : ""}">Escuro<small>${P.d.length}</small></button><button type="button" data-pm="c" class="${m === "c" ? "on" : ""}">Claro<small>${P.c.length}</small></button></div>` +
      `<div class="c16p">` + P[m].map(([n, b, ne], j) => `<button type="button" data-vz="${m}${j}" class="${curBg() === b && curNe() === ne ? "on" : ""}" style="--b:${b};--n:${ne}" title="${n}"><i></i>${n}</button>`).join("") + `</div>`;
  }
  pal.addEventListener("click", e => {
    const f = e.target.closest("[data-pm]"); if (f && pal.contains(f) && f.closest(".c16f")) { e.stopImmediatePropagation(); e.preventDefault(); LS("pd_palm", f.dataset.pm); draw(); return; }
    const b = e.target.closest("[data-vz]"); if (!b) return; e.stopImmediatePropagation(); e.preventDefault();
    const m = b.dataset.vz[0], j = +b.dataset.vz.slice(1), [, bg, ne] = P[m][j];
    THEME.set({ bgx: bg, ne, nb: 0 }); setTimeout(draw, 60);
  }, true);
  if (typeof drawTheme === "function") { const _d = drawTheme; window.drawTheme = drawTheme = function () { const r = _d.apply(this, arguments); try { draw(); } catch (e) {} return r; }; }
  draw(); setInterval(draw, 1200);
})();

/* ---------- Configurações → Modo palco: 33 estilos separados por coleção ---------- */
(function () {
  const box = document.getElementById("cfgstg"); if (!box || !window.STAGE) return;
  const R11 = ["holo2", "dado", "orbita", "baralho", "letras"];
  const grp = id => /^lb_/.test(id) ? "lab" : R11.includes(id) ? "3d" : "cls";
  const G = [["all", "Todos"], ["cls", "Clássicos"], ["3d", "Em 3D"], ["lab", "Laboratório"]];
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
  let busy = false;
  function apply() {
    const grid = box.querySelector(".stgrid"); if (!grid || busy) return; busy = true;
    const g = LS("pd_stgg") || grp(STAGE.cur());
    let f = box.querySelector(".stgf");
    if (!f) { f = document.createElement("div"); f.className = "stgf"; grid.parentNode.insertBefore(f, grid); }
    const n = k => k === "all" ? STAGE.list.length : STAGE.list.filter(s => grp(s[0]) === k).length;
    const h = G.map(([k, t]) => `<button type="button" data-sg="${k}" class="${k === g ? "on" : ""}">${t}<small>${n(k)}</small></button>`).join("");
    if (f._h !== h) { f._h = h; f.innerHTML = h; }
    grid.querySelectorAll("[data-stg]").forEach(b => { b.hidden = !(g === "all" || grp(b.dataset.stg) === g); });
    busy = false;
  }
  box.addEventListener("click", e => { const b = e.target.closest("[data-sg]"); if (!b) return; e.stopPropagation(); LS("pd_stgg", b.dataset.sg); apply(); }, true);
  new MutationObserver(() => { if (!busy) apply(); }).observe(box, { childList: true, subtree: true });
  // a grade é montada antes dos estilos novos entrarem: redesenha uma vez com todos (sem mexer na posição do mini player)
  const l = stg.style.left, t = stg.style.top, r = stg.style.right, b = stg.style.bottom;
  STAGE.set(STAGE.cur()); stg.style.left = l; stg.style.top = t; stg.style.right = r; stg.style.bottom = b;
  apply();
})();

const LFS=window.KFZ.LF,QSS=window.KFZ.QS;const KEY='kfz-lerntrainer-v1';
const S=Object.assign({teil:1,lf:LFS[0].n,res:{},stats:{answered:0,correct:0,sims:[]},quiz:null},JSON.parse(localStorage.getItem(KEY)||'{}'));
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inTeil=l=>S.teil===1?l<=8:l>=9;const ids=lf=>QSS.map((q,i)=>i).filter(i=>QSS[i].lf===lf);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function start(mode){let o=mode==='lf'?ids(S.lf):mode==='sim'?shuffle(QSS.map((q,i)=>i).filter(i=>inTeil(QSS[i].lf))).slice(0,30):Object.keys(S.res).map(Number).filter(i=>S.res[i]===false&&inTeil(QSS[i].lf));
S.quiz={mode,o,pos:0,pick:null,r:0,n:0,perm:shuffle([0,1,2,3])};save();render()}
function answer(k){const z=S.quiz;if(z.pick!==null)return;const qi=z.o[z.pos];k=z.perm[k];const ok=k===QSS[qi].a;z.pick=k;z.n++;if(ok)z.r++;S.res[qi]=ok;S.stats.answered++;if(ok)S.stats.correct++;save();render()}
function next(){const z=S.quiz;z.pos++;z.pick=null;z.perm=shuffle([0,1,2,3]);if(z.pos>=z.o.length&&z.mode==='sim')S.stats.sims.push({d:new Date().toISOString().slice(0,10),r:z.r,n:z.n});save();render()}
function reset(){if(confirm('Gesamten Fortschritt wirklich löschen?')){localStorage.removeItem(KEY);location.reload()}}
let HOME=true;
function goHome(){HOME=true;render();scrollTo(0,0)}
function pickTeil(t){if(S.teil!==t){S.teil=t;S.lf=t===1?1:9;S.quiz=null}HOME=false;save();render();scrollTo(0,0)}
function home(){const info=t=>{const a=QSS.map((q,i)=>i).filter(i=>t===1?QSS[i].lf<=8:QSS[i].lf>=9),r=a.filter(i=>S.res[i]===true).length,w=a.filter(i=>S.res[i]===false).length,p=Math.round(r/a.length*100);return {n:a.length,r,w,p}};
const card=(t,title,sub)=>{const x=info(t);return `<button class="big" onclick="pickTeil(${t})"><span class="bt">${title}</span><span class="mu">${sub}</span><span>${x.n} Fragen · ${x.r} richtig · ${x.w} falsch offen</span><span class="bar"><i style="width:${x.p}%"></i></span><span class="mu">${x.p} % geschafft</span></button>`};
document.getElementById('app').innerHTML=`<div class="card"><h2>Welchen Teil möchtest du lernen?</h2><p class="mu">Dein Fortschritt wird automatisch auf diesem Gerät gespeichert.</p>${card(1,'Teil 1: LF 1–8','Teil 1 der Gesellenprüfung (Zwischenprüfung): erste 18 Monate')}${card(2,'Teil 2: LF 9–14','3. und 4. Ausbildungsjahr, Schwerpunkt Pkw')}</div>`}
function render(){if(HOME)return home();const c=LFS.find(l=>l.n===S.lf)||LFS[0],z=S.quiz,wrong=Object.keys(S.res).filter(i=>S.res[i]===false&&inTeil(QSS[i].lf)).length;let h='';
h+=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px"><b>Teil ${S.teil}: ${S.teil===1?'LF 1–8':'LF 9–14'}</b><button onclick="goHome()">Teil wechseln</button></div><h2>Lernfeld wählen</h2><div class="row">${LFS.filter(l=>inTeil(l.n)).map(l=>`<button class="${l.n===S.lf?'on':''}" onclick="S.lf=${l.n};save();render()">LF ${l.n}</button>`).join('')}</div></div>`;
h+=`<div class="card"><h2>LF ${c.n}: ${esc(c.t)}</h2><h3>Von null erklärt</h3>${c.intro.map(p=>`<p>${esc(p)}</p>`).join('')}
<h3>Grundbegriffe</h3><table>${c.terms.map(t=>`<tr><td>${esc(t[0])}</td><td>${esc(t[1])}</td></tr>`).join('')}</table>
<h3>Merkpunkte</h3><ul>${c.merk.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>
<h3>Formeln</h3><table>${c.formeln.map(t=>`<tr><td>${esc(t[0])}</td><td>${esc(t[1])}</td></tr>`).join('')}</table>
<h3>Typische Prüfungsthemen</h3><p>${esc(c.themen)}</p></div>`;
h+=`<div class="card" id="quiz"><h2>Quiz</h2><div class="row"><button class="pri" onclick="start('lf')">Quiz LF ${c.n}</button><button onclick="start('sim')">Prüfungssimulation Teil ${S.teil} (30)</button><button ${wrong?'':'disabled'} onclick="start('wrong')">Falsche wiederholen (${wrong})</button></div>`;
if(z&&z.o.length){const done=z.pos>=z.o.length;h+=`<div class="stats"><div><b>${z.r} / ${z.n}</b><span class="mu">richtig</span></div><div><b>${Math.min(z.pos+1,z.o.length)} / ${z.o.length}</b><span class="mu">Frage</span></div><div><b>${z.n?Math.round(z.r/z.n*100)+' %':'–'}</b><span class="mu">Quote</span></div></div>`;
if(!done){const q=QSS[z.o[z.pos]];if(!z.perm||z.perm.length!==q.o.length){z.perm=shuffle(q.o.map((_,i)=>i));save()}const P=z.perm;h+=`<div class="mu">LF ${q.lf}</div><p><b>${esc(q.q)}</b></p>${P.map((oi,k)=>`<button class="opt ${z.pick!==null?(oi===q.a?'ok':oi===z.pick?'no':''):''}" onclick="answer(${k})">${'ABCD'[k]}) ${esc(q.o[oi])}</button>`).join('')}`;
if(z.pick!==null)h+=`<div class="fb"><b style="color:var(--${z.pick===q.a?'ok':'no'})">${z.pick===q.a?'Richtig!':'Falsch – richtig ist '+'ABCD'[P.indexOf(q.a)]}</b><div>${esc(q.e)}</div></div><div class="row" style="margin-top:8px"><button class="pri" onclick="next()">Weiter</button></div>`}
else h+=`<p>Runde beendet: ${z.r} von ${z.n} richtig.</p>`}
h+=`</div><div class="card"><h2>Fortschritt pro Lernfeld</h2>${LFS.map(l=>{const a=ids(l.n),r=a.filter(i=>S.res[i]===true).length,p=Math.round(r/a.length*100);return `<div style="margin:8px 0"><div class="row" style="justify-content:space-between"><span>LF ${l.n}</span><span class="mu">${r} / ${a.length} richtig</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('')}
<h3>Statistik</h3><p>Beantwortet gesamt: ${S.stats.answered}, davon richtig: ${S.stats.correct}${S.stats.answered?` (${Math.round(S.stats.correct/S.stats.answered*100)} %)`:''}</p>
${S.stats.sims.length?`<p>Prüfungssimulationen: ${S.stats.sims.slice(-5).map(s=>`${s.d}: ${s.r}/${s.n}`).join(' · ')}</p>`:''}
<p class="mu">Fortschritt wird automatisch auf diesem Gerät gespeichert.</p><button onclick="reset()">Fortschritt zurücksetzen</button></div>`;
document.getElementById('app').innerHTML=h}
render();

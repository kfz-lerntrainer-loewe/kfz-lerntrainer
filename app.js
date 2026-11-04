// SPEICHER-REGELN: siehe README-SPEICHER.md. KEY nie ändern. Fortschritt hängt an q.id (stabil, nur anhängen).
const LFS=window.KFZ.LF,QSS=window.KFZ.QS;const KEY='kfz-lerntrainer-v1';const SCHEMA=2;
const BYID={};QSS.forEach(q=>BYID[q.id]=q);
function defaults(){return {schema:SCHEMA,teil:1,lf:LFS[0].n,res:{},stats:{answered:0,correct:0,sims:[]},quiz:null}}
function migrate(d){d=Object.assign(defaults(),d||{});
 // Schema 1 (ohne Feld schema): res/quiz.o nutzten den Array-Index; Index == q.id für alle bis dahin vorhandenen Fragen -> 1:1 übernehmen.
 if(!d.schema||d.schema<2){d.schema=2}
 d.stats=Object.assign({answered:0,correct:0,sims:[]},d.stats||{});
 if(d.quiz){d.quiz.o=(d.quiz.o||[]).filter(id=>BYID[id]);if(d.quiz.pos>d.quiz.o.length)d.quiz.pos=d.quiz.o.length}
 return d}
let S=migrate(JSON.parse(localStorage.getItem(KEY)||'null'));
// Redundanz: IndexedDB-Kopie
function idb(fn){return new Promise(res=>{try{const r=indexedDB.open('kfz-lerntrainer',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{try{fn(r.result,res)}catch(e){res(null)}};r.onerror=()=>res(null)}catch(e){res(null)}})}
const idbPut=v=>idb((db,res)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,KEY);t.oncomplete=()=>res(true);t.onerror=()=>res(false)});
const idbGet=()=>idb((db,res)=>{const g=db.transaction('kv').objectStore('kv').get(KEY);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)});
const save=()=>{const j=JSON.stringify(S);try{localStorage.setItem(KEY,j)}catch(e){}idbPut(j)};
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
function exportStand(){const j=JSON.stringify(Object.assign({app:'kfz-lerntrainer',exported:new Date().toISOString()},S));const name='kfz-lerntrainer-stand-'+new Date().toISOString().slice(0,10)+'.json';
 try{const f=new File([j],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Kfz Lerntrainer Stand'}).catch(()=>{});}else{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();a.remove()}}catch(e){}
 const ta=document.getElementById('bk');if(ta){ta.value=j;ta.style.display='block'}}
function importText(t){try{const d=JSON.parse(t);if(!d||typeof d.res!=='object')throw 0;delete d.app;delete d.exported;S=migrate(d);save();alert('Stand wiederhergestellt.');render()}catch(e){alert('Datei ungültig – Stand nicht geändert.')}}
function importFile(inp){const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>importText(r.result);r.readAsText(f)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inTeil=l=>S.teil===1?l<=8:l>=9;const ids=lf=>QSS.filter(q=>q.lf===lf).map(q=>q.id);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function start(mode){let o=mode==='lf'?ids(S.lf):mode==='sim'?shuffle(QSS.filter(q=>inTeil(q.lf)).map(q=>q.id)).slice(0,30):Object.keys(S.res).map(Number).filter(i=>S.res[i]===false&&BYID[i]&&inTeil(BYID[i].lf));
S.quiz={mode,o,pos:0,pick:null,r:0,n:0,perm:shuffle([0,1,2,3])};save();render()}
function answer(k){const z=S.quiz;if(z.pick!==null)return;const qi=z.o[z.pos];k=z.perm[k];const ok=k===BYID[qi].a;z.pick=k;z.n++;if(ok)z.r++;S.res[qi]=ok;S.stats.answered++;if(ok)S.stats.correct++;save();render()}
function next(){const z=S.quiz;z.pos++;z.pick=null;z.perm=shuffle([0,1,2,3]);if(z.pos>=z.o.length&&z.mode==='sim')S.stats.sims.push({d:new Date().toISOString().slice(0,10),r:z.r,n:z.n});save();render()}
function reset(){if(confirm('Gesamten Fortschritt wirklich löschen? Tipp: vorher "Stand sichern".')){S=defaults();save();HOME=true;render()}}
let HOME=true;
function goHome(){HOME=true;render();scrollTo(0,0)}
function pickTeil(t){if(S.teil!==t){S.teil=t;S.lf=t===1?1:9;S.quiz=null}HOME=false;save();render();scrollTo(0,0)}
function home(){const info=t=>{const a=QSS.filter(q=>t===1?q.lf<=8:q.lf>=9).map(q=>q.id),r=a.filter(i=>S.res[i]===true).length,w=a.filter(i=>S.res[i]===false).length,p=Math.round(r/a.length*100);return {n:a.length,r,w,p}};
const card=(t,title,sub)=>{const x=info(t);return `<button class="big" onclick="pickTeil(${t})"><span class="bt">${title}</span><span class="mu">${sub}</span><span>${x.n} Fragen · ${x.r} richtig · ${x.w} falsch offen</span><span class="bar"><i style="width:${x.p}%"></i></span><span class="mu">${x.p} % geschafft</span></button>`};
document.getElementById('app').innerHTML=`<div class="card"><h2>Welchen Teil möchtest du lernen?</h2><p class="mu">Dein Fortschritt wird automatisch auf diesem Gerät gespeichert.</p>${card(1,'Teil 1: LF 1–8','Teil 1 der Gesellenprüfung (Zwischenprüfung): erste 18 Monate')}${card(2,'Teil 2: LF 9–14','3. und 4. Ausbildungsjahr, Schwerpunkt Pkw')}<div class="row"><button onclick="exportStand()">Stand sichern</button><button onclick="document.getElementById('imp0').click()">Stand wiederherstellen</button><input id="imp0" type="file" accept=".json,application/json,text/plain" style="display:none" onchange="importFile(this)"></div><textarea id="bk" readonly style="display:none;width:100%;height:80px;margin-top:8px" onclick="this.select()"></textarea></div>`}
function render(){if(HOME)return home();const c=LFS.find(l=>l.n===S.lf)||LFS[0],z=S.quiz,wrong=Object.keys(S.res).filter(i=>S.res[i]===false&&BYID[i]&&inTeil(BYID[i].lf)).length;let h='';
h+=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px"><b>Teil ${S.teil}: ${S.teil===1?'LF 1–8':'LF 9–14'}</b><button onclick="goHome()">Teil wechseln</button></div><h2>Lernfeld wählen</h2><div class="row">${LFS.filter(l=>inTeil(l.n)).map(l=>`<button class="${l.n===S.lf?'on':''}" onclick="S.lf=${l.n};save();render()">LF ${l.n}</button>`).join('')}</div></div>`;
h+=`<div class="card"><h2>LF ${c.n}: ${esc(c.t)}</h2><h3>Von null erklärt</h3>${c.intro.map(p=>`<p>${esc(p)}</p>`).join('')}
<h3>Grundbegriffe</h3><table>${c.terms.map(t=>`<tr><td>${esc(t[0])}</td><td>${esc(t[1])}</td></tr>`).join('')}</table>
<h3>Merkpunkte</h3><ul>${c.merk.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>
<h3>Formeln</h3><table>${c.formeln.map(t=>`<tr><td>${esc(t[0])}</td><td>${esc(t[1])}</td></tr>`).join('')}</table>
<h3>Typische Prüfungsthemen</h3><p>${esc(c.themen)}</p></div>`;
h+=`<div class="card" id="quiz"><h2>Quiz</h2><div class="row"><button class="pri" onclick="start('lf')">Quiz LF ${c.n}</button><button onclick="start('sim')">Prüfungssimulation Teil ${S.teil} (30)</button><button ${wrong?'':'disabled'} onclick="start('wrong')">Falsche wiederholen (${wrong})</button></div>`;
if(z&&z.o.length){const done=z.pos>=z.o.length;h+=`<div class="stats"><div><b>${z.r} / ${z.n}</b><span class="mu">richtig</span></div><div><b>${Math.min(z.pos+1,z.o.length)} / ${z.o.length}</b><span class="mu">Frage</span></div><div><b>${z.n?Math.round(z.r/z.n*100)+' %':'–'}</b><span class="mu">Quote</span></div></div>`;
if(!done){const q=BYID[z.o[z.pos]];if(!z.perm||z.perm.length!==q.o.length){z.perm=shuffle(q.o.map((_,i)=>i));save()}const P=z.perm;h+=`<div class="mu">LF ${q.lf}</div><p><b>${esc(q.q)}</b></p>${P.map((oi,k)=>`<button class="opt ${z.pick!==null?(oi===q.a?'ok':oi===z.pick?'no':''):''}" onclick="answer(${k})">${'ABCD'[k]}) ${esc(q.o[oi])}</button>`).join('')}`;
if(z.pick!==null)h+=`<div class="fb"><b style="color:var(--${z.pick===q.a?'ok':'no'})">${z.pick===q.a?'Richtig!':'Falsch – richtig ist '+'ABCD'[P.indexOf(q.a)]}</b><div>${esc(q.e)}</div></div><div class="row" style="margin-top:8px"><button class="pri" onclick="next()">Weiter</button></div>`}
else h+=`<p>Runde beendet: ${z.r} von ${z.n} richtig.</p>`}
h+=`</div><div class="card"><h2>Fortschritt pro Lernfeld</h2>${LFS.map(l=>{const a=ids(l.n),r=a.filter(i=>S.res[i]===true).length,p=Math.round(r/a.length*100);return `<div style="margin:8px 0"><div class="row" style="justify-content:space-between"><span>LF ${l.n}</span><span class="mu">${r} / ${a.length} richtig</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('')}
<h3>Statistik</h3><p>Beantwortet gesamt: ${S.stats.answered}, davon richtig: ${S.stats.correct}${S.stats.answered?` (${Math.round(S.stats.correct/S.stats.answered*100)} %)`:''}</p>
${S.stats.sims.length?`<p>Prüfungssimulationen: ${S.stats.sims.slice(-5).map(s=>`${s.d}: ${s.r}/${s.n}`).join(' · ')}</p>`:''}
<p class="mu">Fortschritt wird automatisch auf diesem Gerät gespeichert.</p><h3>Backup</h3><p class="mu">Sicherheitsnetz, z. B. vor Gerätewechsel oder falls iOS Daten löscht.</p><div class="row"><button onclick="exportStand()">Stand sichern</button><button onclick="document.getElementById('imp').click()">Stand wiederherstellen</button><input id="imp" type="file" accept=".json,application/json,text/plain" style="display:none" onchange="importFile(this)"></div><textarea id="bk" readonly style="display:none;width:100%;height:80px;margin-top:8px" onclick="this.select()"></textarea><details style="margin-top:8px"><summary class="mu">Backup-Text einfügen</summary><textarea id="paste" style="width:100%;height:80px"></textarea><button onclick="importText(document.getElementById('paste').value)">Aus Text wiederherstellen</button></details><h3>Zurücksetzen</h3><button onclick="reset()">Fortschritt zurücksetzen</button></div>`;
document.getElementById('app').innerHTML=h}
(async()=>{if(!localStorage.getItem(KEY)){const j=await idbGet();if(j){try{S=migrate(JSON.parse(j));localStorage.setItem(KEY,j)}catch(e){}}}save();render()})();
render();

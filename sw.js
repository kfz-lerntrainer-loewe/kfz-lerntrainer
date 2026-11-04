// Löscht bei Updates NUR eigene App-Datei-Caches (kfz-v*), niemals localStorage/IndexedDB.
const C='kfz-v6',F=['./','index.html','app.js','data.js','data2.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('kfz-v')&&x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Netz zuerst (Updates kommen sofort an), offline aus dem Cache.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.url.endsWith('.apk'))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});

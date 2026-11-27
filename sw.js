/* Suor & Glória: guarda o app no aparelho para abrir sem internet */
const CACHE='suor-gloria-v31';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);
  /* Página: tenta a rede primeiro (para receber atualizações), cai no cache sem internet */
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
  /* Fontes e arquivos: cache primeiro */
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res})));
  }
});
/* Lembrete de água: tocar abre o app; o botão "+ copo" registra direto */
self.addEventListener('notificationclick',e=>{
  const n=e.notification,ml=e.action==='copo'?((n.data&&n.data.agua)||250):0;n.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    const c=cs[0];
    if(c){if(ml)c.postMessage({agua:ml});return c.focus()}
    return self.clients.openWindow(ml?'./?agua='+ml+'#inicio':'./#inicio');
  }));
});

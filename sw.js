const CACHE="remates-pwa-v8";
const FILES=["./","./index.html","./styles.css","./app.js","./market-values.json","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const url=new URL(e.request.url);
 const isAppShell=url.origin===location.origin && (url.pathname.endsWith("/") || /\.(html|js|css|json)$/.test(url.pathname));
 if(isAppShell){
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
   if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
   return r;
  }).catch(()=>caches.match(e.request).then(cached=>cached||caches.match("./index.html"))));
 }else{
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
   const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;
  }).catch(()=>caches.match("./index.html"))));
 }
});

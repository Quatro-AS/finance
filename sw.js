// Service worker: cachea la app para uso offline
var CACHE = "finanzas-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(ev){
  ev.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Estrategia: red primero para el HTML (para traer actualizaciones), caché de respaldo
self.addEventListener("fetch", function(ev){
  if(ev.request.method !== "GET") return;
  ev.respondWith(
    fetch(ev.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE).then(function(c){ c.put(ev.request, copy); });
      return resp;
    }).catch(function(){
      return caches.match(ev.request).then(function(r){ return r || caches.match("./index.html"); });
    })
  );
});

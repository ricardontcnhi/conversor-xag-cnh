const CACHE_NAME = "pwa-v5";   // <-- quando subir nova versão, troque v5 por v6

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Instala o novo SW e baixa tudo novamente
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // ativa IMEDIATAMENTE
});

// Ativa o SW novo tomando controle sem reiniciar
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  clients.claim(); // assume todas as abas já abertas
});

// Responde usando cache mas atualiza sempre que houver mudança
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

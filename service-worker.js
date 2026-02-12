// Troque a versão SEMPRE que publicar (garante atualização imediata)
const CACHE_NAME = "pwa-v1.0.1";  // ex.: pwa-v1.0.1, pwa-v1.0.2 ...

// Núcleo do app (páginas que garantem o shell funcionar)
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Instala e ativa imediatamente a nova versão
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // ativa logo, sem esperar fechar abas
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim(); // assume controle das páginas abertas
});

// Estratégia:
// - Navegações (index / rotas): NETWORK FIRST -> pega versão nova da rede
// - Demais requests: CACHE FIRST -> rápido e offline
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Trata navegações (modo 'navigate' cobre index.html/rotas/atalhos do PWA)
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Demais recursos: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

// Network-first para páginas (garante atualização assim que você publicar)
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

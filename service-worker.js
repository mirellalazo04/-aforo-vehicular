
const CACHE = "aforo-vehicular-offline-v4";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg"
];

// Guardar los archivos necesarios durante la instalación.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Eliminar cachés antiguas.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("aforo-vehicular-") && key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Para la aplicación, buscar primero la copia local.
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Solo administrar archivos de nuestra aplicación.
  if (url.origin !== self.location.origin) return;

  const base = new URL(self.registration.scope);
  if (!url.pathname.startsWith(base.pathname)) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      });
    })
  );
});

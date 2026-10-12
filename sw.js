// Cambia este número cada vez que publiques una versión nueva
const VERSION = 'fidelizacion-v2';
const ARCHIVOS_BASE = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION)
            .then((cache) => cache.addAll(ARCHIVOS_BASE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((nombres) => Promise.all(
                nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))
            ))
            .then(() => self.clients.claim())
    );
});

// Red primero: siempre intenta traer la versión nueva; usa la caché solo sin conexión.
// Las llamadas al Google Script (otro dominio) no se tocan.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    if (new URL(req.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(req)
            .then((respuesta) => {
                const copia = respuesta.clone();
                caches.open(VERSION).then((cache) => cache.put(req, copia));
                return respuesta;
            })
            .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
});

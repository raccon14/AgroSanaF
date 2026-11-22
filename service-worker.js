/* =========================================================
   AgroSana · Service Worker (act2/service-worker.js)
   Rutas alineadas exactamente al árbol de act2/:
   css/estilos.css, fonts/*.woff2, img/*, js/app.js,
   index.html, offline.html, manifest.json y service-worker.js.
   ========================================================= */

'use strict';

const CACHE_NAME = 'agrosana-act2-v1';
const OFFLINE_URL = './offline.html';

const RECURSOS_ESTATICOS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './css/estilos.css',
    './js/app.js',
    './img/logo.svg',
    './img/bio-ph.jpg',
    './img/frutime.jpg',
    './img/hydrospeed-cab-max.jpg',
    './img/prozycar.jpg',
    './img/surfatek.jpg',
    './fonts/ibm-plex-sans-latin-400-normal.woff2',
    './fonts/ibm-plex-sans-latin-600-normal.woff2',
    './fonts/ibm-plex-sans-latin-700-normal.woff2',
    './fonts/ibm-plex-sans-condensed-latin-700-normal.woff2'
];

/* ---------- Instalación: guarda en caché todos los recursos de act2/ ---------- */
self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(RECURSOS_ESTATICOS))
            .then(() => self.skipWaiting())
    );
});

/* ---------- Activación: elimina cachés de versiones anteriores ---------- */
self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys()
            .then((nombres) =>
                Promise.all(
                    nombres
                        .filter((nombre) => nombre !== CACHE_NAME)
                        .map((nombre) => caches.delete(nombre))
                )
            )
            .then(() => self.clients.claim())
    );
});

/* ---------- Intercepción de peticiones (fetch) ---------- */
self.addEventListener('fetch', (evento) => {
    const { request } = evento;

    if (request.method !== 'GET') return;

    // 1. Navegación entre páginas HTML (index.html / offline.html)
    if (request.mode === 'navigate') {
        evento.respondWith(
            fetch(request)
                .then((respuestaRed) => {
                    const copia = respuestaRed.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
                    return respuestaRed;
                })
                .catch(async () => {
                    const paginaEnCache = await caches.match(request);
                    return paginaEnCache || caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // 2. Recursos estáticos (CSS, JS, imágenes de img/ y fuentes de fonts/)
    evento.respondWith(
        caches.match(request).then((respuestaCache) => {
            if (respuestaCache) return respuestaCache;

            return fetch(request).then((respuestaRed) => {
                if (!respuestaRed || respuestaRed.status !== 200 || respuestaRed.type === 'opaque') {
                    return respuestaRed;
                }
                const copia = respuestaRed.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
                return respuestaRed;
            });
        })
    );
});
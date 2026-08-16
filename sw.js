"use strict";

/* =========================================================
   HELP DESK PWA
   Archivo: sw.js

   Responsabilidad:
   - Instalar el Service Worker.
   - Crear la caché principal.
   - Guardar recursos esenciales.
   - Atender solicitudes desde caché.
   - Mostrar offline.html cuando no haya conexión.
   - Limpiar cachés antiguas.
========================================================= */


/* =========================================================
   1. NOMBRE Y VERSIÓN DE LA CACHÉ
========================================================= */

const CACHE_NAME = "helpdesk-cache-v1";


/* =========================================================
   2. PÁGINA OFFLINE
========================================================= */

const OFFLINE_URL = "./pages/offline.html";


/* =========================================================
   3. RECURSOS ESENCIALES
========================================================= */

const APP_SHELL = [

    "./",

    "./index.html",

    "./manifest.json",

    "./pages/create-ticket.html",

    "./pages/my-tickets.html",

    "./pages/ticket-detail.html",

    "./pages/about.html",

    "./pages/offline.html",

    "./CSS/variables.css",

    "./CSS/styles.css",

    "./CSS/components.css",

    "./CSS/responsive.css",

    "./JS/app.js",

    "./JS/tickets.js",

    "./JS/my-tickets.js",

    "./JS/ticket-detail.js"

];


/* =========================================================
   4. INSTALACIÓN DEL SERVICE WORKER
========================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "[Service Worker] Instalando..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(function (cache) {

                    console.log(
                        "[Service Worker] Guardando recursos en caché..."
                    );

                    return cache.addAll(
                        APP_SHELL
                    );

                })

                .then(function () {

                    /*
                     * Fuerza al nuevo Service Worker
                     * a pasar al estado waiting inmediatamente.
                     */

                    return self.skipWaiting();

                })

        );

    }
);


/* =========================================================
   5. ACTIVACIÓN DEL SERVICE WORKER
========================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "[Service Worker] Activando..."
        );


        event.waitUntil(

            caches
                .keys()

                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                /*
                                 * Eliminamos cualquier caché
                                 * que no corresponda con
                                 * la versión actual.
                                 */

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    console.log(
                                        "[Service Worker] Eliminando caché antigua:",
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                                return Promise.resolve();

                            }
                        )

                    );

                })

                .then(function () {

                    /*
                     * Permite que el Service Worker
                     * controle inmediatamente
                     * las páginas abiertas.
                     */

                    return self.clients.claim();

                })

        );

    }
);


/* =========================================================
   6. INTERCEPTAR SOLICITUDES
========================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        const request =
            event.request;


        /*
         * Solo trabajaremos con solicitudes GET.
         *
         * POST, PUT, DELETE, etc. no se almacenan
         * mediante esta estrategia.
         */

        if (
            request.method !== "GET"
        ) {

            return;

        }


        const requestUrl =
            new URL(request.url);


        /*
         * Solo manejamos recursos que pertenecen
         * al mismo dominio/origen de la aplicación.
         */

        if (
            requestUrl.origin !==
            self.location.origin
        ) {

            return;

        }


        /* =================================================
           7. SOLICITUDES DE NAVEGACIÓN
        ================================================= */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then(function (networkResponse) {

                        /*
                         * Guardamos una copia de la página
                         * obtenida desde la red.
                         */

                        const responseClone =
                            networkResponse.clone();


                        caches
                            .open(CACHE_NAME)

                            .then(function (cache) {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    })

                    .catch(function () {

                        /*
                         * Si falla Internet, intentamos
                         * buscar la página solicitada
                         * dentro de la caché.
                         */

                        return caches
                            .match(request)

                            .then(function (cachedResponse) {

                                /*
                                 * Si existe la página
                                 * solicitada en caché,
                                 * la devolvemos.
                                 */

                                if (cachedResponse) {

                                    return cachedResponse;

                                }


                                /*
                                 * Si tampoco existe en caché,
                                 * mostramos offline.html.
                                 */

                                return caches.match(
                                    OFFLINE_URL
                                );

                            });

                    })

            );


            return;

        }


        /* =================================================
           8. RECURSOS ESTÁTICOS
           CSS / JS / IMÁGENES / MANIFEST
        ================================================= */

        event.respondWith(

            caches
                .match(request)

                .then(function (cachedResponse) {

                    /*
                     * Si el archivo ya existe
                     * en caché, lo entregamos
                     * inmediatamente.
                     */

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    /*
                     * Si no está en caché,
                     * intentamos descargarlo.
                     */

                    return fetch(request)

                        .then(function (networkResponse) {

                            /*
                             * Evitamos guardar respuestas
                             * inválidas.
                             */

                            if (
                                !networkResponse ||
                                networkResponse.status !== 200
                            ) {

                                return networkResponse;

                            }


                            /*
                             * Creamos una copia porque
                             * una Response solo puede
                             * consumirse una vez.
                             */

                            const responseClone =
                                networkResponse.clone();


                            /*
                             * Guardamos el recurso
                             * para futuras solicitudes.
                             */

                            caches
                                .open(CACHE_NAME)

                                .then(function (cache) {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });


                            return networkResponse;

                        });

                })

        );

    }
);
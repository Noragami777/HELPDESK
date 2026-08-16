"use strict";

/* =========================================================
   HELP DESK PWA
   Archivo: register-sw.js

   Responsabilidad:
   - Verificar compatibilidad con Service Workers.
   - Registrar sw.js.
   - Detectar actualizaciones.
   - Informar errores de registro.
========================================================= */


/* =========================================================
   1. VERIFICAR COMPATIBILIDAD
========================================================= */

if ("serviceWorker" in navigator) {


    /* =====================================================
       2. ESPERAR A QUE LA PÁGINA TERMINE DE CARGAR
    ===================================================== */

    window.addEventListener(
        "load",
        function () {


            /* =================================================
               3. REGISTRAR SERVICE WORKER
            ================================================= */

            navigator.serviceWorker
                .register("/sw.js")

                .then(function (registration) {

                    console.log(
                        "[PWA] Service Worker registrado correctamente."
                    );

                    console.log(
                        "[PWA] Scope:",
                        registration.scope
                    );


                    /* =========================================
                       4. BUSCAR ACTUALIZACIONES
                    ========================================= */

                    registration.update()
                        .catch(function (error) {

                            console.warn(
                                "[PWA] No fue posible comprobar actualizaciones:",
                                error
                            );

                        });


                    /* =========================================
                       5. DETECTAR NUEVO SERVICE WORKER
                    ========================================= */

                    registration.addEventListener(
                        "updatefound",
                        function () {

                            console.log(
                                "[PWA] Se encontró una nueva versión del Service Worker."
                            );


                            const newWorker =
                                registration.installing;


                            if (!newWorker) {
                                return;
                            }


                            /* =================================
                               6. CAMBIOS DE ESTADO
                            ================================= */

                            newWorker.addEventListener(
                                "statechange",
                                function () {

                                    console.log(
                                        "[PWA] Estado del Service Worker:",
                                        newWorker.state
                                    );


                                    /*
                                     * Si existe un controlador,
                                     * significa que ya había una
                                     * versión anterior instalada.
                                     */

                                    if (
                                        newWorker.state === "installed" &&
                                        navigator.serviceWorker.controller
                                    ) {

                                        console.log(
                                            "[PWA] Hay una nueva versión de Help Desk disponible."
                                        );

                                    }

                                }
                            );

                        }
                    );

                })


                /* =================================================
                   7. ERROR DE REGISTRO
                ================================================= */

                .catch(function (error) {

                    console.error(
                        "[PWA] Error al registrar el Service Worker:",
                        error
                    );

                });

        }
    );


} else {


    /* =========================================================
       8. NAVEGADOR NO COMPATIBLE
    ========================================================= */

    console.warn(
        "[PWA] Este navegador no soporta Service Workers."
    );

}
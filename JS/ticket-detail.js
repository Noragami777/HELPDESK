"use strict";

/* =========================================================
   HELP DESK PWA
   Archivo: ticket-detail.js

   Responsabilidad:
   - Leer el ID del ticket desde la URL.
   - Buscar el ticket.
   - Mostrar sus datos.
   - Actualizar su estado.
   - Eliminar el ticket.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       1. CONTENEDORES PRINCIPALES
    ===================================================== */

    const ticketDetail =
        document.getElementById(
            "ticketDetail"
        );


    const ticketNotFound =
        document.getElementById(
            "ticketNotFound"
        );


    if (!ticketDetail || !ticketNotFound) {
        return;
    }


    /* =====================================================
       2. CAMPOS DEL TICKET
    ===================================================== */

    const detailTicketId =
        document.getElementById(
            "detailTicketId"
        );


    const detailStatus =
        document.getElementById(
            "detailStatus"
        );


    const detailSubject =
        document.getElementById(
            "detailSubject"
        );


    const detailName =
        document.getElementById(
            "detailName"
        );


    const detailEmail =
        document.getElementById(
            "detailEmail"
        );


    const detailCategory =
        document.getElementById(
            "detailCategory"
        );


    const detailPriority =
        document.getElementById(
            "detailPriority"
        );


    const detailCreatedAt =
        document.getElementById(
            "detailCreatedAt"
        );


    const detailUpdatedAt =
        document.getElementById(
            "detailUpdatedAt"
        );


    const detailFullSubject =
        document.getElementById(
            "detailFullSubject"
        );


    const detailDescription =
        document.getElementById(
            "detailDescription"
        );


    /* =====================================================
       3. CONTROLES
    ===================================================== */

    const ticketStatus =
        document.getElementById(
            "ticketStatus"
        );


    const updateStatusButton =
        document.getElementById(
            "updateStatusButton"
        );


    const deleteTicketButton =
        document.getElementById(
            "deleteTicketButton"
        );


    /* =====================================================
       4. CATEGORÍAS
    ===================================================== */

    const categoryNames = {

        hardware: "Hardware",
        software: "Software",
        network: "Red / Internet",
        email: "Correo electrónico",
        printer: "Impresoras",
        access: "Accesos y contraseñas",
        other: "Otro"

    };


    /* =====================================================
       5. PRIORIDADES
    ===================================================== */

    const priorityNames = {

        low: "Baja",
        medium: "Media",
        high: "Alta",
        critical: "Crítica"

    };


    const priorityClasses = {

        low: "priority-low",
        medium: "priority-medium",
        high: "priority-high",
        critical: "priority-critical"

    };


    /* =====================================================
       6. ESTADOS
    ===================================================== */

    const statusNames = {

        open: "Abierto",
        progress: "En proceso",
        resolved: "Resuelto",
        closed: "Cerrado"

    };


    const statusClasses = {

        open: "badge-open",
        progress: "badge-progress",
        resolved: "badge-resolved",
        closed: "badge-closed"

    };


    /* =====================================================
       7. OBTENER ID DE LA URL
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const ticketId =
        params.get("id");


    let currentTicket = null;


    /* =====================================================
       8. TICKET NO ENCONTRADO
    ===================================================== */

    function showTicketNotFound() {

        ticketDetail.hidden = true;

        ticketNotFound.hidden = false;

    }


    /* =====================================================
       9. MOSTRAR CONTENIDO
    ===================================================== */

    function showTicketContent() {

        ticketDetail.hidden = false;

        ticketNotFound.hidden = true;

    }


    /* =====================================================
       10. MOSTRAR ESTADO
    ===================================================== */

    function renderStatus(status) {

        detailStatus.classList.remove(
            "badge-open",
            "badge-progress",
            "badge-resolved",
            "badge-closed"
        );


        const cssClass =
            statusClasses[status]
            || "badge-open";


        detailStatus.classList.add(
            "badge",
            cssClass
        );


        detailStatus.textContent =
            statusNames[status]
            || status;

    }


    /* =====================================================
       11. MOSTRAR PRIORIDAD
    ===================================================== */

    function renderPriority(priority) {

        detailPriority.classList.remove(
            "priority-low",
            "priority-medium",
            "priority-high",
            "priority-critical"
        );


        const cssClass =
            priorityClasses[priority]
            || "priority-medium";


        detailPriority.classList.add(
            "priority",
            cssClass
        );


        detailPriority.textContent =
            priorityNames[priority]
            || priority;

    }


    /* =====================================================
       12. FORMATEAR FECHA
    ===================================================== */

    function getFormattedDate(date) {

        if (
            typeof formatDate === "function"
        ) {

            return formatDate(date);

        }


        return new Date(
            date
        ).toLocaleString("es-CO");

    }


    /* =====================================================
       13. MOSTRAR INFORMACIÓN
    ===================================================== */

    function renderTicket(ticket) {

        detailTicketId.textContent =
            ticket.id;


        detailSubject.textContent =
            ticket.subject;


        detailName.textContent =
            ticket.name;


        detailEmail.textContent =
            ticket.email;


        detailCategory.textContent =
            categoryNames[ticket.category]
            || ticket.category;


        renderPriority(
            ticket.priority
        );


        renderStatus(
            ticket.status
        );


        detailCreatedAt.textContent =
            getFormattedDate(
                ticket.createdAt
            );


        detailUpdatedAt.textContent =
            getFormattedDate(
                ticket.updatedAt
            );


        detailFullSubject.textContent =
            ticket.subject;


        detailDescription.textContent =
            ticket.description;


        if (ticketStatus) {

            ticketStatus.value =
                ticket.status;

        }


        /*
         * Cambiamos el título del navegador.
         */

        document.title =
            `${ticket.id} | Help Desk`;


        showTicketContent();

    }


    /* =====================================================
       14. CARGAR TICKET
    ===================================================== */

    function loadTicket() {

        if (!ticketId) {

            showTicketNotFound();

            return;

        }


        if (
            typeof getTicketById !==
            "function"
        ) {

            console.error(
                "No se encontró la función getTicketById(). Revisa tickets.js."
            );

            showTicketNotFound();

            return;

        }


        currentTicket =
            getTicketById(
                ticketId
            );


        if (!currentTicket) {

            showTicketNotFound();

            return;

        }


        renderTicket(
            currentTicket
        );

    }


    /* =====================================================
       15. ACTUALIZAR ESTADO
    ===================================================== */

    if (updateStatusButton) {

        updateStatusButton.addEventListener(
            "click",
            function () {

                if (!currentTicket) {
                    return;
                }


                const newStatus =
                    ticketStatus.value;


                /* =========================================
                   MISMO ESTADO
                ========================================= */

                if (
                    newStatus ===
                    currentTicket.status
                ) {

                    if (
                        typeof showMessage ===
                        "function"
                    ) {

                        showMessage(
                            "El ticket ya tiene seleccionado ese estado.",
                            "info"
                        );

                    }

                    return;
                }


                /* =========================================
                   ACTUALIZAR
                ========================================= */

                const updated =
                    updateTicketStatus(
                        currentTicket.id,
                        newStatus
                    );


                if (!updated) {

                    if (
                        typeof showMessage ===
                        "function"
                    ) {

                        showMessage(
                            "No fue posible actualizar el ticket.",
                            "error"
                        );

                    }

                    return;
                }


                /* =========================================
                   RECARGAR DATOS
                ========================================= */

                currentTicket =
                    getTicketById(
                        currentTicket.id
                    );


                renderTicket(
                    currentTicket
                );


                /* =========================================
                   MENSAJE
                ========================================= */

                if (
                    typeof showMessage ===
                    "function"
                ) {

                    showMessage(
                        `El ticket ${currentTicket.id} cambió a "${statusNames[newStatus]}".`,
                        "success"
                    );

                }

            }
        );

    }


    /* =====================================================
       16. ELIMINAR TICKET
    ===================================================== */

    if (deleteTicketButton) {

        deleteTicketButton.addEventListener(
            "click",
            function () {

                if (!currentTicket) {
                    return;
                }


                /* =========================================
                   CONFIRMACIÓN
                ========================================= */

                const confirmed =
                    window.confirm(

                        "¿Estás seguro de que deseas eliminar el ticket "
                        +
                        currentTicket.id
                        +
                        "?"

                    );


                if (!confirmed) {
                    return;
                }


                /* =========================================
                   ELIMINAR
                ========================================= */

                const deleted =
                    deleteTicket(
                        currentTicket.id
                    );


                if (!deleted) {

                    window.alert(
                        "No fue posible eliminar el ticket."
                    );

                    return;
                }


                /* =========================================
                   CONFIRMACIÓN
                ========================================= */

                window.alert(
                    `El ticket ${currentTicket.id} fue eliminado correctamente.`
                );


                /* =========================================
                   VOLVER A CONSULTA
                ========================================= */

                window.location.href =
                    "my-tickets.html";

            }
        );

    }


    /* =====================================================
       17. INICIAR
    ===================================================== */

    loadTicket();

});
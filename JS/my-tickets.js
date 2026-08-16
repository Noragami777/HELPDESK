"use strict";

/* =========================================================
   HELP DESK PWA
   Archivo: my-tickets.js

   Responsabilidad:
   - Mostrar los tickets guardados.
   - Buscar tickets.
   - Filtrar por estado.
   - Filtrar por prioridad.
   - Abrir el detalle de un ticket.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. ELEMENTOS DEL HTML
    ===================================================== */

    const tableBody =
        document.getElementById("ticketsTableBody");

    const tableContainer =
        document.getElementById("ticketsTableContainer");

    const emptyState =
        document.getElementById("emptyTickets");

    const ticketCount =
        document.getElementById("ticketCount");

    const searchInput =
        document.getElementById("ticketSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const priorityFilter =
        document.getElementById("priorityFilter");


    /*
     * Si no estamos en my-tickets.html,
     * detenemos el script.
     */

    if (!tableBody) {
        return;
    }


    /* =====================================================
       2. NOMBRES DE CATEGORÍAS
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
       3. PRIORIDADES
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
       4. ESTADOS
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
       5. MOSTRAR TICKETS
    ===================================================== */

    function renderTickets(tickets) {

        /*
         * Limpiamos la tabla.
         */

        tableBody.innerHTML = "";


        /*
         * Actualizamos contador.
         */

        if (ticketCount) {

            ticketCount.textContent =
                tickets.length;

        }


        /* =================================================
           SIN RESULTADOS
        ================================================= */

        if (tickets.length === 0) {

            if (tableContainer) {
                tableContainer.style.display = "none";
            }

            if (emptyState) {
                emptyState.style.display = "block";
            }

            return;
        }


        /* =================================================
           EXISTEN RESULTADOS
        ================================================= */

        if (tableContainer) {
            tableContainer.style.display = "block";
        }

        if (emptyState) {
            emptyState.style.display = "none";
        }


        /* =================================================
           ORDENAR POR FECHA
        ================================================= */

        const orderedTickets =
            [...tickets].sort(

                function (a, b) {

                    return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    );

                }

            );


        /* =================================================
           CREAR FILAS
        ================================================= */

        orderedTickets.forEach(
            function (ticket) {

                const row =
                    document.createElement("tr");


                /* =========================================
                   ID
                ========================================= */

                const idCell =
                    document.createElement("td");

                idCell.textContent =
                    ticket.id;


                /* =========================================
                   ASUNTO
                ========================================= */

                const subjectCell =
                    document.createElement("td");

                subjectCell.textContent =
                    ticket.subject;


                /* =========================================
                   CATEGORÍA
                ========================================= */

                const categoryCell =
                    document.createElement("td");

                categoryCell.textContent =
                    categoryNames[ticket.category]
                    || ticket.category;


                /* =========================================
                   PRIORIDAD
                ========================================= */

                const priorityCell =
                    document.createElement("td");


                const prioritySpan =
                    document.createElement("span");


                prioritySpan.classList.add(
                    "priority",
                    priorityClasses[ticket.priority]
                    || "priority-medium"
                );


                prioritySpan.textContent =
                    priorityNames[ticket.priority]
                    || ticket.priority;


                priorityCell.appendChild(
                    prioritySpan
                );


                /* =========================================
                   ESTADO
                ========================================= */

                const statusCell =
                    document.createElement("td");


                const statusSpan =
                    document.createElement("span");


                statusSpan.classList.add(
                    "badge",
                    statusClasses[ticket.status]
                    || "badge-open"
                );


                statusSpan.textContent =
                    statusNames[ticket.status]
                    || ticket.status;


                statusCell.appendChild(
                    statusSpan
                );


                /* =========================================
                   FECHA
                ========================================= */

                const dateCell =
                    document.createElement("td");


                if (
                    typeof formatDate === "function"
                ) {

                    dateCell.textContent =
                        formatDate(
                            ticket.createdAt
                        );

                } else {

                    dateCell.textContent =
                        new Date(
                            ticket.createdAt
                        ).toLocaleString("es-CO");

                }


                /* =========================================
                   ACCIONES
                ========================================= */

                const actionsCell =
                    document.createElement("td");


                const viewButton =
                    document.createElement("button");


                viewButton.type =
                    "button";


                viewButton.classList.add(
                    "btn",
                    "btn-secondary",
                    "btn-view-ticket"
                );


                viewButton.textContent =
                    "Ver";


                viewButton.dataset.ticketId =
                    ticket.id;


                actionsCell.appendChild(
                    viewButton
                );


                /* =========================================
                   AGREGAR CELDAS
                ========================================= */

                row.appendChild(idCell);

                row.appendChild(subjectCell);

                row.appendChild(categoryCell);

                row.appendChild(priorityCell);

                row.appendChild(statusCell);

                row.appendChild(dateCell);

                row.appendChild(actionsCell);


                /* =========================================
                   AGREGAR FILA
                ========================================= */

                tableBody.appendChild(row);

            }
        );

    }


    /* =====================================================
       6. FILTRAR TICKETS
    ===================================================== */

    function filterTickets() {

        /*
         * Obtenemos los tickets desde tickets.js
         */

        const tickets =
            typeof getTickets === "function"
                ? getTickets()
                : [];


        /* =================================================
           VALORES DE LOS FILTROS
        ================================================= */

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "all";


        const selectedPriority =
            priorityFilter
                ? priorityFilter.value
                : "all";


        /* =================================================
           APLICAR FILTROS
        ================================================= */

        const filteredTickets =
            tickets.filter(
                function (ticket) {

                    /* =====================================
                       BÚSQUEDA
                    ===================================== */

                    const searchableText = [

                        ticket.id,
                        ticket.subject,
                        ticket.name,
                        ticket.email,

                        categoryNames[ticket.category]
                        || ticket.category

                    ]
                        .join(" ")
                        .toLowerCase();


                    const matchesSearch =
                        searchableText.includes(
                            searchValue
                        );


                    /* =====================================
                       ESTADO
                    ===================================== */

                    const matchesStatus =

                        selectedStatus === "all"

                        ||

                        ticket.status ===
                        selectedStatus;


                    /* =====================================
                       PRIORIDAD
                    ===================================== */

                    const matchesPriority =

                        selectedPriority === "all"

                        ||

                        ticket.priority ===
                        selectedPriority;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );

                }
            );


        renderTickets(
            filteredTickets
        );

    }


    /* =====================================================
       7. EVENTOS DE FILTROS
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterTickets
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterTickets
        );

    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            filterTickets
        );

    }


    /* =====================================================
       8. BOTÓN VER
    ===================================================== */

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".btn-view-ticket"
                );


            if (!button) {
                return;
            }


            const ticketId =
                button.dataset.ticketId;


            /*
             * Abrimos el detalle.
             *
             * Ejemplo:
             * ticket-detail.html?id=TK-0001
             */

            window.location.href =
                "ticket-detail.html?id="
                +
                encodeURIComponent(
                    ticketId
                );

        }
    );


    /* =====================================================
       9. CARGA INICIAL
    ===================================================== */

    filterTickets();

});
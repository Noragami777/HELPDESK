/* =========================================================
   TICKETS.JS
   Proyecto: Help Desk PWA

   Funciones principales:
   - Registrar tickets.
   - Generar identificadores automáticos.
   - Guardar tickets en localStorage.
   - Validar datos básicos.
   - Preparar información para consultas posteriores.
========================================================= */


/* =========================================================
   1. CLAVE DE ALMACENAMIENTO
========================================================= */

const TICKETS_STORAGE_KEY = "helpdesk_tickets";


/* =========================================================
   2. OBTENER TICKETS GUARDADOS
========================================================= */

function getTickets() {

    const tickets = localStorage.getItem(TICKETS_STORAGE_KEY);

    if (!tickets) {
        return [];
    }

    try {

        return JSON.parse(tickets);

    } catch (error) {

        console.error(
            "Error al leer los tickets guardados:",
            error
        );

        return [];
    }

}


/* =========================================================
   3. GUARDAR TICKETS
========================================================= */

function saveTickets(tickets) {

    localStorage.setItem(
        TICKETS_STORAGE_KEY,
        JSON.stringify(tickets)
    );

}


/* =========================================================
   4. GENERAR ID DEL TICKET
========================================================= */

function generateTicketId() {

    const tickets = getTickets();

    let nextNumber = 1;

    if (tickets.length > 0) {

        const lastTicket = tickets[tickets.length - 1];

        const lastNumber = parseInt(
            lastTicket.id.replace("TK-", "")
        );

        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }

    }


    return "TK-" + String(nextNumber).padStart(4, "0");

}


/* =========================================================
   5. GENERAR FECHA ACTUAL
========================================================= */

function getCurrentDate() {

    const now = new Date();

    return now.toISOString();

}


/* =========================================================
   6. FORMATEAR FECHA
========================================================= */

function formatDate(dateValue) {

    const date = new Date(dateValue);

    return date.toLocaleString(
        "es-CO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   7. CREAR OBJETO TICKET
========================================================= */

function createTicket(ticketData) {

    return {

        id: generateTicketId(),

        name: ticketData.name.trim(),

        email: ticketData.email.trim(),

        category: ticketData.category,

        priority: ticketData.priority,

        subject: ticketData.subject.trim(),

        description: ticketData.description.trim(),

        status: "open",

        createdAt: getCurrentDate(),

        updatedAt: getCurrentDate()

    };

}


/* =========================================================
   8. REGISTRAR NUEVO TICKET
========================================================= */

function registerTicket(ticketData) {

    const tickets = getTickets();

    const newTicket = createTicket(ticketData);

    tickets.push(newTicket);

    saveTickets(tickets);

    return newTicket;

}


/* =========================================================
   9. BUSCAR TICKET POR ID
========================================================= */

function getTicketById(ticketId) {

    const tickets = getTickets();

    return tickets.find(
        ticket => ticket.id === ticketId
    );

}


/* =========================================================
   10. ACTUALIZAR ESTADO
========================================================= */

function updateTicketStatus(ticketId, newStatus) {

    const tickets = getTickets();

    const ticketIndex = tickets.findIndex(
        ticket => ticket.id === ticketId
    );


    if (ticketIndex === -1) {

        console.warn(
            "No se encontró el ticket:",
            ticketId
        );

        return false;
    }


    tickets[ticketIndex].status = newStatus;

    tickets[ticketIndex].updatedAt = getCurrentDate();


    saveTickets(tickets);

    return true;

}


/* =========================================================
   11. ELIMINAR TICKET
========================================================= */

function deleteTicket(ticketId) {

    const tickets = getTickets();

    const filteredTickets = tickets.filter(
        ticket => ticket.id !== ticketId
    );


    if (filteredTickets.length === tickets.length) {

        return false;

    }


    saveTickets(filteredTickets);

    return true;

}


/* =========================================================
   12. MOSTRAR MENSAJE
========================================================= */

function showMessage(message, type = "success") {

    const oldAlert = document.querySelector(
        ".dynamic-alert"
    );


    if (oldAlert) {
        oldAlert.remove();
    }


    const alert = document.createElement("div");

    alert.classList.add(
        "alert",
        `alert-${type}`,
        "dynamic-alert"
    );

    alert.textContent = message;


    const ticketCard = document.querySelector(
        ".ticket-card"
    );


    if (ticketCard) {

        ticketCard.before(alert);

    }


    setTimeout(() => {

        alert.remove();

    }, 5000);

}


/* =========================================================
   13. CAPTURAR FORMULARIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const ticketForm = document.getElementById(
            "ticketForm"
        );


        /*
           Si la página actual no tiene el formulario
           de tickets, no ejecutamos esta lógica.
        */

        if (!ticketForm) {
            return;
        }


        /* =============================================
           EVENTO SUBMIT
        ============================================== */

        ticketForm.addEventListener(
            "submit",
            function (event) {

                /*
                   Evita que el formulario recargue
                   la página automáticamente.
                */

                event.preventDefault();


                /* =====================================
                   OBTENER LOS CAMPOS
                ====================================== */

                const name =
                    document.getElementById("name").value;

                const email =
                    document.getElementById("email").value;

                const category =
                    document.getElementById("category").value;

                const priority =
                    document.getElementById("priority").value;

                const subject =
                    document.getElementById("subject").value;

                const description =
                    document.getElementById("description").value;


                /* =====================================
                   VALIDACIÓN
                ====================================== */

                if (
                    !name.trim() ||
                    !email.trim() ||
                    !category ||
                    !priority ||
                    !subject.trim() ||
                    !description.trim()
                ) {

                    showMessage(
                        "Por favor completa todos los campos obligatorios.",
                        "error"
                    );

                    return;
                }


                /* =====================================
                   CREAR DATOS DEL TICKET
                ====================================== */

                const ticketData = {

                    name: name,

                    email: email,

                    category: category,

                    priority: priority,

                    subject: subject,

                    description: description

                };


                /* =====================================
                   REGISTRAR TICKET
                ====================================== */

                const ticket = registerTicket(
                    ticketData
                );


                /* =====================================
                   CONFIRMACIÓN
                ====================================== */

                showMessage(
                    `Ticket ${ticket.id} registrado correctamente.`,
                    "success"
                );


                console.log(
                    "Ticket registrado:",
                    ticket
                );


                /* =====================================
                   LIMPIAR FORMULARIO
                ====================================== */

                ticketForm.reset();


                /* =====================================
                   ENFOQUE AL PRIMER CAMPO
                ====================================== */

                document.getElementById(
                    "name"
                ).focus();

            }
        );

    }
);
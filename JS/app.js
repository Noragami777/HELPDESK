"use strict";

/*
=========================================================
HELP DESK PWA
Archivo: app.js

Responsabilidad:
- Controlar el menú de navegación móvil.
- Mostrar el estado de conexión.
- Actualizar automáticamente el año del pie de página.
- Cargar el resumen de tickets almacenados localmente.

Nota:
El registro del Service Worker se realizará en
el archivo register-sw.js.
=========================================================
*/

/* =====================================================
   SELECTORES PRINCIPALES
===================================================== */

const navigationToggle = document.querySelector("#navigation-toggle");
const navigationMenu = document.querySelector("#navigation-menu");

const connectionStatus = document.querySelector("#connection-status");
const connectionStatusMessage = document.querySelector(
    "#connection-status-message"
);

const currentYearElement = document.querySelector("#current-year");

const openTicketsElement = document.querySelector("#open-tickets");
const progressTicketsElement = document.querySelector("#progress-tickets");
const closedTicketsElement = document.querySelector("#closed-tickets");

/* =====================================================
   MENÚ DE NAVEGACIÓN MÓVIL
===================================================== */

/**
 * Abre o cierra el menú de navegación móvil.
 *
 * También actualiza los atributos ARIA para que
 * los lectores de pantalla conozcan su estado.
 */
function toggleNavigationMenu() {
    if (!navigationToggle || !navigationMenu) {
        return;
    }

    const isMenuOpen = navigationMenu.classList.toggle(
        "navigation-menu--open"
    );

    navigationToggle.classList.toggle(
        "navigation-toggle--active",
        isMenuOpen
    );

    navigationToggle.setAttribute(
        "aria-expanded",
        String(isMenuOpen)
    );

    navigationToggle.setAttribute(
        "aria-label",
        isMenuOpen
            ? "Cerrar menú de navegación"
            : "Abrir menú de navegación"
    );
}

/**
 * Cierra el menú móvil y restablece sus atributos.
 */
function closeNavigationMenu() {
    if (!navigationToggle || !navigationMenu) {
        return;
    }

    navigationMenu.classList.remove("navigation-menu--open");
    navigationToggle.classList.remove("navigation-toggle--active");

    navigationToggle.setAttribute("aria-expanded", "false");
    navigationToggle.setAttribute(
        "aria-label",
        "Abrir menú de navegación"
    );
}

/**
 * Cierra el menú cuando el usuario selecciona un enlace.
 */
function handleNavigationLinkClick(event) {
    const clickedLink = event.target.closest(".navigation-menu__link");

    if (clickedLink) {
        closeNavigationMenu();
    }
}

/**
 * Cierra el menú cuando se hace clic fuera del encabezado.
 */
function handleOutsideClick(event) {
    const mainHeader = document.querySelector(".main-header");

    if (
        !mainHeader ||
        !navigationMenu?.classList.contains("navigation-menu--open")
    ) {
        return;
    }

    if (!mainHeader.contains(event.target)) {
        closeNavigationMenu();
    }
}

/**
 * Cierra el menú mediante la tecla Escape.
 */
function handleEscapeKey(event) {
    if (
        event.key === "Escape" &&
        navigationMenu?.classList.contains("navigation-menu--open")
    ) {
        closeNavigationMenu();
        navigationToggle?.focus();
    }
}

/**
 * Cierra el menú móvil cuando la pantalla cambia
 * nuevamente a un tamaño de escritorio.
 */
function handleViewportChange() {
    const desktopBreakpoint = 768;

    if (window.innerWidth > desktopBreakpoint) {
        closeNavigationMenu();
    }
}

/* =====================================================
   ESTADO DE CONEXIÓN
===================================================== */

/**
 * Actualiza el aviso visual según el estado de la red.
 *
 * navigator.onLine indica si el navegador detecta
 * una conexión disponible. No garantiza que Internet
 * responda, pero es apropiado para informar al usuario.
 */
function updateConnectionStatus() {
    if (!connectionStatus || !connectionStatusMessage) {
        return;
    }

    const isOnline = navigator.onLine;

    connectionStatus.hidden = false;

    connectionStatus.classList.toggle(
        "connection-status--offline",
        !isOnline
    );

    connectionStatusMessage.textContent = isOnline
        ? "Conexión restablecida"
        : "Sin conexión. Se mostrarán los recursos disponibles.";

    /*
     * El mensaje de conexión restablecida se oculta
     * después de unos segundos para no distraer al usuario.
     * El aviso offline permanece visible mientras no haya red.
     */
    if (isOnline) {
        window.setTimeout(() => {
            if (navigator.onLine) {
                connectionStatus.hidden = true;
            }
        }, 4000);
    }
}

/* =====================================================
   AÑO DEL PIE DE PÁGINA
===================================================== */

/**
 * Inserta el año actual para evitar actualizarlo
 * manualmente cada año.
 */
function updateCurrentYear() {
    if (!currentYearElement) {
        return;
    }

    currentYearElement.textContent = String(
        new Date().getFullYear()
    );
}

/* =====================================================
   RESUMEN DE TICKETS
===================================================== */

/**
 * Obtiene los tickets almacenados en localStorage.
 *
 * En las siguientes etapas del proyecto, los tickets
 * podrán guardarse desde el formulario de creación.
 *
 * @returns {Array<Object>} Lista de tickets almacenados.
 */
function getStoredTickets() {
    try {
        const storedTickets = localStorage.getItem("helpdeskTickets");

        if (!storedTickets) {
            return [];
        }

        const parsedTickets = JSON.parse(storedTickets);

        return Array.isArray(parsedTickets)
            ? parsedTickets
            : [];
    } catch (error) {
        console.error(
            "No fue posible leer los tickets almacenados:",
            error
        );

        return [];
    }
}

/**
 * Cuenta los tickets según su estado.
 *
 * Estados previstos:
 * - open: abierto
 * - progress: en proceso
 * - closed: finalizado
 *
 * @param {Array<Object>} tickets Lista de tickets.
 * @returns {{open: number, progress: number, closed: number}}
 */
function countTicketsByStatus(tickets) {
    return tickets.reduce(
        (summary, ticket) => {
            const status = String(ticket.status ?? "")
                .trim()
                .toLowerCase();

            if (status === "open") {
                summary.open += 1;
            } else if (status === "progress") {
                summary.progress += 1;
            } else if (status === "closed") {
                summary.closed += 1;
            }

            return summary;
        },
        {
            open: 0,
            progress: 0,
            closed: 0
        }
    );
}

/**
 * Muestra en la página principal la cantidad
 * de tickets agrupados por estado.
 */
function updateTicketSummary() {
    const tickets = getStoredTickets();
    const summary = countTicketsByStatus(tickets);

    if (openTicketsElement) {
        openTicketsElement.textContent = String(summary.open);
    }

    if (progressTicketsElement) {
        progressTicketsElement.textContent = String(
            summary.progress
        );
    }

    if (closedTicketsElement) {
        closedTicketsElement.textContent = String(
            summary.closed
        );
    }
}

/* =====================================================
   INICIALIZACIÓN DE EVENTOS
===================================================== */

/**
 * Registra los eventos principales de la aplicación.
 */
function initializeEventListeners() {
    navigationToggle?.addEventListener(
        "click",
        toggleNavigationMenu
    );

    navigationMenu?.addEventListener(
        "click",
        handleNavigationLinkClick
    );

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    /*
     * El evento storage permite actualizar el resumen
     * cuando localStorage cambia desde otra pestaña.
     */
    window.addEventListener("storage", updateTicketSummary);
}

/**
 * Inicializa las funciones generales cuando el DOM
 * ya se encuentra completamente disponible.
 */
function initializeApplication() {
    initializeEventListeners();
    updateCurrentYear();
    updateTicketSummary();

    /*
     * Al cargar la página solo se muestra el aviso
     * si el dispositivo se encuentra sin conexión.
     */
    if (!navigator.onLine) {
        updateConnectionStatus();
    }
}

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
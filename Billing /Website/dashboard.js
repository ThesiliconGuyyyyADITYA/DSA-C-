"use strict";

/* =========================================================
   MAXOSMITH BILLDESK
   Complete dashboard + pharmaceutical invoice logic
========================================================= */

/* -------------------------
   Fixed company information
   Replace placeholders once.
------------------------- */

const GOOGLE_SHEETS_CONFIG = {
    /*
     * Paste the deployed Apps Script Web App URL here later.
     * Keep blank until deployment. Local mode will continue working.
     */
    webAppUrl: "https://script.google.com/macros/s/AKfycbz-U_uDOv-gGBQpbp4NHZeybcsy9AbexHhVM-mgVH-C0rek8yLLJ5VglR-504AxXYnj/exec"
};

const companyDetails = {
    name: "MAXOSMITH",
    legalName: "Maxosmith (OPC) Private Limited",
    addressLine1: "85, SANGAM VIHAR COLONY, JWALAPUR, SANGAM VIHAR COLONY",
    addressLine2: "Haridwar, Uttarakhand - 249408",
    phone: "+91-82730 66581",
    drugLicence1: "DL No. 1: UA-HRD-129340",
    drugLicence2: "DL No. 2: UA-HRD-129341",
    gstin: "05AAPCM7912D1ZG",
    state: "Uttarakhand",
    stateCode: "05",
    directorName: "Authorised Director"
};

/* -------------------------
   Sample product master
   Replace with real products.
------------------------- */

const productMaster = [
    {
        name: "SUMO Tablet",
        hsn: "",
        rate: 132.35,
        mrp: 179.00,
        gst: 5
    },
    {
        name: "FLEXON MR Tablet",
        hsn: "",
        rate: 27.23,
        mrp: 32.20,
        gst: 5
    },
    {
        name: "KETOROL-DT Tablet",
        hsn: "",
        rate: 143.00,
        mrp: 177.25,
        gst: 5
    },
    {
        name: "WYSOLONE 10mg Tablet",
        hsn: "",
        rate: 16.12,
        mrp: 20.29,
        gst: 5
    },
    {
        name: "WYSOLONE 5mg Tablet",
        hsn: "",
        rate: 9.37,
        mrp: 11.54,
        gst: 5
    },
    {
        name: "BETONOVATEN N Ointment",
        hsn: "",
        rate: 52.25,
        mrp: 62.67,
        gst: 5
    },
    {
        name: "DYNAPAR injection",
        hsn: "",
        rate: 28.78,
        mrp: 43.83,
        gst: 5
    },
    {
        name: "FOLVITE Tablet",
        hsn: "",
        rate: 64.00,
        mrp: 77.42,
        gst: 5
    },
    {
        name: "MEFTAL SPAS Tablet",
        hsn: "",
        rate: 38.59,
        mrp: 55.00,
        gst: 5
    },
    {
        name: "MEFTAL FORTE Tablet",
        hsn: "",
        rate: 31.00,
        mrp: 46.00,
        gst: 5
    },
    {
        name: "ZANOCIN OZ Tablet",
        hsn: "",
        rate: 128.00,
        mrp: 185.00,
        gst: 5
    },
    {
        name: "OXALGIN DP Tablet",
        hsn: "",
        rate: 103.25,
        mrp: 148.10,
        gst: 5
    },
    {
        name: "CIPLOX 500 Tablet",
        hsn: "",
        rate: 35.98,
        mrp: 48.38,
        gst: 5
    },
    {
        name: "CIPLOX TZ Tablet",
        hsn: "",
        rate: 134.00,
        mrp: 207.57,
        gst: 5
    },
    {
        name: "CIPLACTIN Tablet",
        hsn: "",
        rate: 43.50,
        mrp: 65.25,
        gst: 5
    },
    {
        name: "GELUSIN MPS SYRUP",
        hsn: "",
        rate: 125.50,
        mrp: 168.28,
        gst: 5
    },
    {
        name: "EVION-400 Capsule",
        hsn: "",
        rate: 71.25,
        mrp: 95.55,
        gst: 5
    },
    {
        name: "QUADRIDERM RF 5GM",
        hsn: "",
        rate: 56.00,
        mrp: 89.58,
        gst: 5
    },
    {
        name: "ZERODOL SPAS Tablet",
        hsn: "",
        rate: 143.00,
        mrp: 174.95,
        gst: 5
    },
    {
        name: "ZERODOL-P Tablet",
        hsn: "",
        rate: 59.50,
        mrp: 77.00,
        gst: 5
    },
    {
        name: "MONOCEF 1GM",
        hsn: "",
        rate: 29.50,
        mrp: 71.08,
        gst: 5
    },
    {
        name: "MONOCEF 500mg",
        hsn: "",
        rate: 34.00,
        mrp: 57.29,
        gst: 5
    },
    {
        name: "NEUROBION FORTE Tablet",
        hsn: "",
        rate: 38.75,
        mrp: 46.10,
        gst: 5
    },
    {
        name: "PANTOP IV",
        hsn: "",
        rate: 22.25,
        mrp: 57.48,
        gst: 5
    },
    {
        name: "DEXORANGE PLUS Syrup",
        hsn: "",
        rate: 141.25,
        mrp: 211.00,
        gst: 5
    },
    {
        name: "LIV 52 TABLET",
        hsn: "",
        rate: 183.25,
        mrp: 220.00,
        gst: 5
    },
    {
        name: "LIV 52 DS TABLET",
        hsn: "",
        rate: 239.45,
        mrp: 300.00,
        gst: 5
    },
    {
        name: "LIV 52 SYRUP 200",
        hsn: "",
        rate: 197.98,
        mrp: 250.00,
        gst: 5
    },
    {
        name: "LIV 52 SYRUP 100",
        hsn: "",
        rate: 112.25,
        mrp: 140.00,
        gst: 5
    },
    {
        name: "LIV 52 DS SYRUP100",
        hsn: "",
        rate: 182.25,
        mrp: 220.00,
        gst: 5
    },
    {
        name: "LIV 52 DS SYRUP200",
        hsn: "",
        rate: 289.58,
        mrp: 351.00,
        gst: 5
    },
    {
        name: "PANTOP 40MG TABLET",
        hsn: "",
        rate: 122.25,
        mrp: 170.00,
        gst: 5
    },
    {
        name: "ZIFI 200MG TABLET",
        hsn: "",
        rate: 78.59,
        mrp: 111.43,
        gst: 5
    },
    {
        name: "MOXIKIND CV 375 TABLET",
        hsn: "",
        rate: 134.98,
        mrp: 179.52,
        gst: 5
    },
    {
        name: "MOXIKIND CV 625 TABLET",
        hsn: "",
        rate: 138.78,
        mrp: 195.16,
        gst: 5
    },
    {
        name: "AMLOKIND-AT TABLET",
        hsn: "",
        rate: 49.98,
        mrp: 61.18,
        gst: 5
    },
    {
        name: "TELMIKIND-40 TABLET",
        hsn: "",
        rate: 33.25,
        mrp: 44.01,
        gst: 5
    },
    {
        name: "MOX 250 CAPSULE",
        hsn: "",
        rate: 33.45,
        mrp: 41.66,
        gst: 5
    },
    {
        name: "MOX 500 CAPSULE",
        hsn: "",
        rate: 92.61,
        mrp: 125.62,
        gst: 5
    },
    {
        name: "BECOSULES CAPSULE",
        hsn: "",
        rate: 52.00,
        mrp: 62.37,
        gst: 5
    },
    {
        name: "ZIFI-O 200 TABLET",
        hsn: "",
        rate: 161.65,
        mrp: 222.20,
        gst: 5
    },
    {
        name: "MEFTAL-P TABLET",
        hsn: "",
        rate: 27.64,
        mrp: 38.00,
        gst: 5
    },
    {
        name: "OMNACORTIL-10 TABLET",
        hsn: "",
        rate: 10.98,
        mrp: 12.80,
        gst: 5
    },
    {
        name: "OMNACORTIL-5 TABLET",
        hsn: "",
        rate: 6.35,
        mrp: 7.23,
        gst: 5
    },
    {
        name: "PANTOP-DSR",
        hsn: "",
        rate: 175.65,
        mrp: 226.40,
        gst: 5
    },
    {
        name: "DYTOR-10 TABLET",
        hsn: "",
        rate: 73.38,
        mrp: 102.72,
        gst: 5
    },
    {
        name: "ZERODOL-SP Tablet",
        hsn: "",
        rate: 114.85,
        mrp: 139.69,
        gst: 5
    },
    {
        name: "UNIENZYME TABLET",
        hsn: "",
        rate: 77.65,
        mrp: 96.56,
        gst: 5
    },
    {
        name: "COMBIFLAM TABLET",
        hsn: "",
        rate: 44.98,
        mrp: 57.45,
        gst: 5
    },
    {
        name: "IBUGESIC PLUS SUSPENSION",
        hsn: "",
        rate: 42.65,
        mrp: 56.61,
        gst: 5
    },
    {
        name: "DIGENE ORANGE TABLET",
        hsn: "",
        rate: 23.65,
        mrp: 29.20,
        gst: 5
    },
    {
        name: "DIGENE orange Syrup",
        hsn: "",
        rate: 142.25,
        mrp: 180.74,
        gst: 5
    },
    {
        name: "ACILOC 150 TABLET",
        hsn: "",
        rate: 40.75,
        mrp: 50.44,
        gst: 5
    },
    {
        name: "ACILOC 300 TABLET",
        hsn: "",
        rate: 49.85,
        mrp: 61.60,
        gst: 5
    },
    {
        name: "COMBIFLAM SUSPENSION",
        hsn: "",
        rate: 39.85,
        mrp: 46.08,
        gst: 5
    },
    {
        name: "AMLOPRES-AT TABLET",
        hsn: "",
        rate: 148.95,
        mrp: 185.30,
        gst: 5
    },
    {
        name: "DOLO 650 TABLET",
        hsn: "",
        rate: 27.50,
        mrp: 32.12,
        gst: 5
    },
    {
        name: "BETNESOL 0.5 MG TABLET",
        hsn: "",
        rate: 12.80,
        mrp: 15.94,
        gst: 5
    },
    {
        name: "GASOFAST AYURVEDIC",
        hsn: "",
        rate: 755.00,
        mrp: 1200.00,
        gst: 5
    },
    {
        name: "CHESTON COLD TABLET",
        hsn: "",
        rate: 23.50,
        mrp: 64.79,
        gst: 5
    },
    {
        name: "INTAGESIC MR TABLET",
        hsn: "",
        rate: 21.50,
        mrp: 124.00,
        gst: 5
    },
    {
        name: "MONOCEF 250mg",
        hsn: "",
        rate: 34.00,
        mrp: 57.29,
        gst: 5
    },
    {
        name: "AMOXUNF-CV LB 625",
        hsn: "",
        rate: 0.00,
        mrp: 1520.00,
        gst: 5
    },
    {
        name: "PanUNF-DSR",
        hsn: "",
        rate: 0.00,
        mrp: 1200.00,
        gst: 5
    },
    {
        name: "Amter-UNF",
        hsn: "",
        rate: 0.00,
        mrp: 75.00,
        gst: 5
    },
    {
        name: "AceUNF-SP",
        hsn: "",
        rate: 0.00,
        mrp: 1100.00,
        gst: 5
    },
    {
        name: "AceUNF-P",
        hsn: "",
        rate: 0.00,
        mrp: 620.00,
        gst: 5
    },
    {
        name: "LEVO-UNF M",
        hsn: "",
        rate: 0.00,
        mrp: 1150.00,
        gst: 5
    },
    {
        name: "NIMESUL-UNF P",
        hsn: "",
        rate: 0.00,
        mrp: 570.00,
        gst: 5
    },
    {
        name: "OFLOX-UNF 200",
        hsn: "",
        rate: 0.00,
        mrp: 920.00,
        gst: 5
    },
    {
        name: "Croupncold-UNF",
        hsn: "",
        rate: 0.00,
        mrp: 1220.00,
        gst: 5
    },
    {
        name: "Drycroup-UNF-DX Syrup",
        hsn: "",
        rate: 0.00,
        mrp: 130.00,
        gst: 5
    },
    {
        name: "Maxohomarich Syrup",
        hsn: "",
        rate: 0.00,
        mrp: 211.00,
        gst: 5
    },
    {
        name: "Maxo Digienzyme Syrup",
        hsn: "",
        rate: 0.00,
        mrp: 175.00,
        gst: 5
    },
    {
        name: "AstaMax-LS",
        hsn: "",
        rate: 0.00,
        mrp: 121.00,
        gst: 5
    },
    {
        name: "Lesmith-5",
        hsn: "",
        rate: 0.00,
        mrp: 395.00,
        gst: 5
    },
    {
        name: "Diclosmith-Plus",
        hsn: "",
        rate: 0.00,
        mrp: 590.00,
        gst: 5
    },
    {
        name: "Parasmith-MR",
        hsn: "",
        rate: 0.00,
        mrp: 1224.00,
        gst: 5
    },
    {
        name: "Mefsmith-P Kid",
        hsn: "",
        rate: 0.00,
        mrp: 71.00,
        gst: 5
    },
    {
        name: "Montsmith-LC Kid",
        hsn: "",
        rate: 0.00,
        mrp: 98.00,
        gst: 5
    },
    {
        name: "Medical Device / Other Product",
        hsn: "",
        rate: 0.00,
        mrp: 0.00,
        gst: 18
    }
];

/* -------------------------
   Safe DOM helpers
------------------------- */

const $ = (id) => document.getElementById(id);

function on(element, eventName, handler) {
    if (element) {
        element.addEventListener(eventName, handler);
    }
}

function setText(id, value) {
    const element = $(id);
    if (element) {
        element.textContent = value;
    }
}


function isGoogleSheetsConnected_() {
    return /^https:\/\/script\.google\.com\/macros\/s\//.test(
        GOOGLE_SHEETS_CONFIG.webAppUrl
    );
}

async function postToGoogleSheets_(payload) {
    if (!isGoogleSheetsConnected_()) {
        return {
            success: false,
            skipped: true,
            message: "Google Sheets Web App has not been deployed."
        };
    }

    const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Google Sheets request failed (${response.status}).`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Google Sheets rejected the request.");
    }

    return result;
}

async function getFromGoogleSheets_(action) {
    if (!isGoogleSheetsConnected_()) {
        return null;
    }

    const url = new URL(GOOGLE_SHEETS_CONFIG.webAppUrl);
    url.searchParams.set("action", action);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`Google Sheets request failed (${response.status}).`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Google Sheets rejected the request.");
    }

    return result;
}

/* -------------------------
   Login protection
------------------------- */

const isLoggedIn = sessionStorage.getItem("isLoggedIn");
const loggedInUser = sessionStorage.getItem("loggedInUser") || "Admin";

if (isLoggedIn !== "true") {
    window.location.replace("index.html");
}

/* -------------------------
   Shared dashboard elements
------------------------- */

const sidebar = $("sidebar");
const sidebarOverlay = $("sidebarOverlay");
const menuToggle = $("menuToggle");
const sidebarCollapseButton = $("sidebarCollapseButton");
const pageTitle = $("pageTitle");
const modal = $("actionModal");
const modalTitle = $("modalTitle");
const modalMessage = $("modalMessage");

/*
 * Google Sheets is the only business-data source.
 * These arrays exist only while the current page is open.
 */
let googleInvoicesCache_ = [];
let googleLedgerCache_ = [];
let googleOutstandingMap_ = {};
let googlePartiesCache_ = [];
let googleExpensesCache_ = [];
let googleOrdersCache_ = [];
let ordersAutoRefreshTimer_ = null;


setText("loggedInUsername", loggedInUser);
setText("welcomeUsername", loggedInUser);

const currentDateElement = $("currentDate");
if (currentDateElement) {
    currentDateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

const sectionTitles = {
    dashboard: "Dashboard",
    "new-bill": "Create New Bill",
    "old-data": "Update Old Ledger Data",
    "update-bill": "Update Existing Bill",
    ledger: "Retailer Ledger",
    orders: "Retailer Orders",
    expenses: "Expense Management",
    reports: "Earnings & Outstanding"
};

const SIDEBAR_COLLAPSED_KEY = "maxosmithSidebarCollapsed";

function isDesktopSidebar_() {
    return window.matchMedia("(min-width: 951px)").matches;
}

function setSidebarCollapsed_(collapsed, savePreference = true) {
    if (!sidebar) return;

    const shouldCollapse = Boolean(collapsed) && isDesktopSidebar_();
    sidebar.classList.toggle("sidebar-collapsed", shouldCollapse);

    if (sidebarCollapseButton) {
        sidebarCollapseButton.setAttribute("aria-expanded", String(!shouldCollapse));
        sidebarCollapseButton.setAttribute(
            "aria-label",
            shouldCollapse ? "Expand sidebar" : "Collapse sidebar"
        );
        sidebarCollapseButton.title = shouldCollapse
            ? "Expand sidebar"
            : "Collapse sidebar";

        const collapseText = sidebarCollapseButton.querySelector(".sidebar-collapse-text");
        if (collapseText) {
            collapseText.textContent = shouldCollapse ? "Expand Menu" : "Collapse Menu";
        }
    }

    if (savePreference) {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(shouldCollapse));
    }
}

function restoreSidebarPreference_() {
    const savedPreference = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    setSidebarCollapsed_(savedPreference, false);
}

function closeSidebar() {
    sidebar?.classList.remove("open-sidebar");
    sidebarOverlay?.classList.remove("show-overlay");
}

function openSection(sectionId) {
    const selectedSection = $(sectionId);

    if (!selectedSection) {
        return;
    }

    document.querySelectorAll(".page-section").forEach((section) => {
        section.classList.remove("active-section");
    });

    document.querySelectorAll(".menu-link").forEach((link) => {
        link.classList.remove("active");
    });

    selectedSection.classList.add("active-section");

    if (sectionId === "orders") {
        void loadOrdersFromGoogleSheets_();
        startOrdersAutoRefresh_();
    } else {
        stopOrdersAutoRefresh_();
    }

    if (
        sectionId === "new-bill" &&
        sessionStorage.getItem("maxosmithLastSavedInvoiceNumber")
    ) {
        sessionStorage.removeItem("maxosmithLastSavedInvoiceNumber");
        void resetBillForm();
    }

    const menuLink = document.querySelector(
        `.menu-link[data-section="${sectionId}"]`
    );

    menuLink?.classList.add("active");

    if (pageTitle) {
        pageTitle.textContent = sectionTitles[sectionId] || "Dashboard";
    }

    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#${sectionId}`);
}

document.querySelectorAll(".menu-link").forEach((link) => {
    on(link, "click", (event) => {
        event.preventDefault();
        openSection(link.dataset.section);
    });
});

document.querySelectorAll("[data-open-section]").forEach((element) => {
    on(element, "click", () => {
        openSection(element.dataset.openSection);
    });
});

on(sidebarCollapseButton, "click", () => {
    const isCollapsed = sidebar?.classList.contains("sidebar-collapsed");
    setSidebarCollapsed_(!isCollapsed);
});

on(menuToggle, "click", () => {
    sidebar?.classList.toggle("open-sidebar");
    sidebarOverlay?.classList.toggle("show-overlay");
});

on(sidebarOverlay, "click", closeSidebar);

window.addEventListener("resize", () => {
    if (isDesktopSidebar_()) {
        restoreSidebarPreference_();
        closeSidebar();
    } else {
        sidebar?.classList.remove("sidebar-collapsed");
    }
});

restoreSidebarPreference_();

on($("logoutButton"), "click", () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("loggedInUser");
    window.location.replace("index.html");
});

/* -------------------------
   Modal
------------------------- */

function showModal(title, message) {
    if (!modal) {
        window.alert(`${title}\n\n${message}`);
        return;
    }

    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;

    modal.classList.add("show-modal");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    modal?.classList.remove("show-modal");
    modal?.setAttribute("aria-hidden", "true");
}

on($("modalClose"), "click", closeModal);
on($("modalOkayButton"), "click", closeModal);
on(modal, "click", (event) => {
    if (event.target === modal) closeModal();
});

/* -------------------------
   Placeholder module actions
------------------------- */

on($("addOrderButton"), "click", async () => {
    const button = $("addOrderButton");
    const originalText = button?.textContent || "Refresh Orders";

    if (button) {
        button.disabled = true;
        button.textContent = "Refreshing...";
    }

    try {
        await loadOrdersFromGoogleSheets_();
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
});

/* Historical ledger data is handled by the oldLedgerForm module below. */


/* =========================================================
   RETAILER ORDERS — GOOGLE SHEETS + STAFF APP
========================================================= */

function getOrdersSectionElements_() {
    const section = $("orders");
    const cards = section
        ? Array.from(section.querySelectorAll(".order-stat-grid article"))
        : [];
    const tableBody = section?.querySelector("table tbody") || null;

    const labels = ["Pending", "Ready", "Delivered", "Total Orders"];
    const ids = [
        "pendingOrderCount",
        "readyOrderCount",
        "deliveredOrderCount",
        "totalOrderCount"
    ];

    cards.slice(0, 4).forEach((card, index) => {
        const label = card.querySelector("span");
        const value = card.querySelector("strong");

        if (label) label.textContent = labels[index];
        if (value) value.id = ids[index];
    });

    if (tableBody) tableBody.id = "ordersTableBody";

    const button = $("addOrderButton");
    if (button) {
        button.textContent = "Refresh Orders";
        button.title = "Reload orders from Google Sheets";
    }

    return { section, tableBody };
}

function normalizeOrderStatus_(value) {
    const status = String(value || "Pending").trim().toLowerCase();

    if (status === "ready" || status === "approved") return "Ready";
    if (status === "delivered") return "Delivered";
    if (status === "cancelled" || status === "canceled") return "Cancelled";
    return "Pending";
}

function formatOrderDate_(value) {
    if (!value) return "—";

    const text = String(value).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text;

    const normalized = normalizeSheetDate_(value);
    if (!normalized) return text || "—";

    const date = new Date(`${normalized}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? text
        : date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}

function getOrderItems_(order) {
    if (Array.isArray(order?.items) && order.items.length) {
        return order.items
            .map((item) => ({
                productName: String(item?.productName || "").trim(),
                amount: Math.max(0, Number(item?.amount) || 0)
            }))
            .filter((item) => item.productName);
    }

    return String(order?.orderList || "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ productName: line, amount: 0 }));
}

function buildOrderItemsHtml_(order) {
    const items = getOrderItems_(order);

    if (!items.length) return "<span>No items recorded</span>";

    return `
        <ul class="order-item-list">
            ${items.map((item) => `
                <li>
                    <span>${escapeHTML_(item.productName)}</span>
                    ${item.amount > 0
                        ? `<strong>${escapeHTML_(item.amount)} Strips/Bottles</strong>`
                        : ""}
                </li>
            `).join("")}
        </ul>
    `;
}

function updateOrderStatistics_() {
    const counts = { Pending: 0, Ready: 0, Delivered: 0 };

    googleOrdersCache_.forEach((order) => {
        const status = normalizeOrderStatus_(order.status);
        if (counts[status] !== undefined) counts[status] += 1;
    });

    setText("pendingOrderCount", String(counts.Pending));
    setText("readyOrderCount", String(counts.Ready));
    setText("deliveredOrderCount", String(counts.Delivered));
    setText("totalOrderCount", String(googleOrdersCache_.length));
}

function renderOrders_() {
    const { tableBody } = getOrdersSectionElements_();
    updateOrderStatistics_();

    if (!tableBody) return;

    if (!googleOrdersCache_.length) {
        tableBody.innerHTML = `
            <tr class="empty-table-row">
                <td colspan="6">No retailer orders are available.</td>
            </tr>
        `;
        return;
    }

    const priority = { Pending: 0, Ready: 1, Delivered: 2, Cancelled: 3 };

    const orders = [...googleOrdersCache_].sort((a, b) => {
        const statusDifference =
            (priority[normalizeOrderStatus_(a.status)] ?? 9) -
            (priority[normalizeOrderStatus_(b.status)] ?? 9);

        if (statusDifference) return statusDifference;

        return String(b.lastUpdated || b.datePlaced || "")
            .localeCompare(String(a.lastUpdated || a.datePlaced || ""));
    });

    tableBody.innerHTML = orders.map((order) => {
        const status = normalizeOrderStatus_(order.status);
        const encodedId = encodeURIComponent(order.orderId || "");

        return `
            <tr class="order-main-row">
                <td><strong>${escapeHTML_(order.orderId || "—")}</strong></td>
                <td>${escapeHTML_(order.partyName || "—")}</td>
                <td>${escapeHTML_(order.staffName || "—")}</td>
                <td>${escapeHTML_(formatOrderDate_(order.datePlaced))}</td>
                <td>
                    <span class="order-status-badge order-status-${status.toLowerCase()}">
                        ${escapeHTML_(status)}
                    </span>
                    ${status === "Delivered" && order.deliveredDate
                        ? `<small>Delivered: ${escapeHTML_(formatOrderDate_(order.deliveredDate))}</small>`
                        : ""}
                </td>
                <td>
                    <button
                        type="button"
                        class="secondary-button"
                        data-order-details="${escapeHTML_(encodedId)}"
                    >
                        View Items
                    </button>
                    ${status === "Pending" ? `
                        <button
                            type="button"
                            class="primary-button"
                            data-order-ready="${escapeHTML_(encodedId)}"
                        >
                            Mark Ready
                        </button>
                    ` : ""}
                </td>
            </tr>
            <tr data-order-detail-row="${escapeHTML_(encodedId)}" hidden>
                <td colspan="6">
                    <div class="order-detail-panel">
                        <strong>Order Items</strong>
                        ${buildOrderItemsHtml_(order)}
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    tableBody.querySelectorAll("[data-order-details]").forEach((button) => {
        on(button, "click", () => {
            const encodedId = button.dataset.orderDetails || "";
            const detailRow = tableBody.querySelector(
                `[data-order-detail-row="${CSS.escape(encodedId)}"]`
            );

            if (!detailRow) return;

            detailRow.hidden = !detailRow.hidden;
            button.textContent = detailRow.hidden
                ? "View Items"
                : "Hide Items";
        });
    });

    tableBody.querySelectorAll("[data-order-ready]").forEach((button) => {
        on(button, "click", async () => {
            await markOrderReadyFromWebsite_(
                decodeURIComponent(button.dataset.orderReady || ""),
                button
            );
        });
    });
}

async function loadOrdersFromGoogleSheets_() {
    const { tableBody } = getOrdersSectionElements_();

    if (!isGoogleSheetsConnected_()) {
        googleOrdersCache_ = [];
        renderOrders_();
        return;
    }

    if (tableBody && !googleOrdersCache_.length) {
        tableBody.innerHTML = `
            <tr class="empty-table-row">
                <td colspan="6">Loading orders from Google Sheets...</td>
            </tr>
        `;
    }

    try {
        const result = await getFromGoogleSheets_("getOrders");

        googleOrdersCache_ = Array.isArray(result?.orders)
            ? result.orders.map((order) => ({
                ...order,
                status: normalizeOrderStatus_(order.status)
            }))
            : [];

        renderOrders_();
    } catch (error) {
        console.error("Order load failed:", error);

        if (tableBody) {
            tableBody.innerHTML = `
                <tr class="empty-table-row">
                    <td colspan="6">
                        Order sync failed: ${escapeHTML_(error.message)}
                    </td>
                </tr>
            `;
        }
    }
}

async function markOrderReadyFromWebsite_(orderId, button) {
    if (!orderId) return;
    if (!window.confirm(`Mark order ${orderId} as Ready?`)) return;

    const originalText = button?.textContent || "Mark Ready";

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {
        await postToGoogleSheets_({
            action: "markOrderReady",
            orderId,
            updatedBy: loggedInUser || "Website"
        });

        const order = googleOrdersCache_.find(
            (item) => item.orderId === orderId
        );

        if (order) order.status = "Ready";

        renderOrders_();

        showModal(
            "Order Ready",
            `${orderId} has been marked as Ready.`
        );
    } catch (error) {
        console.error("Order update failed:", error);

        showModal(
            "Order Update Failed",
            error.message || "The order could not be marked as Ready."
        );

        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

function startOrdersAutoRefresh_() {
    stopOrdersAutoRefresh_();

    ordersAutoRefreshTimer_ = window.setInterval(() => {
        if ($("orders")?.classList.contains("active-section")) {
            void loadOrdersFromGoogleSheets_();
        }
    }, 20000);
}

function stopOrdersAutoRefresh_() {
    if (ordersAutoRefreshTimer_) {
        window.clearInterval(ordersAutoRefreshTimer_);
        ordersAutoRefreshTimer_ = null;
    }
}


/* -------------------------
   Formatting
------------------------- */

function escapeHTML_(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function localISODate(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
}

/* =========================================================
   CREATE NEW BILL MODULE
========================================================= */

const newBillForm = $("newBillForm");
const billItemsBody = $("billItemsBody");
let billRowCounter = 0;

function loadCompanyDetails() {
    setText("invoiceCompanyName", companyDetails.name);
    setText("invoiceCompanyLegalName", companyDetails.legalName);
    setText(
        "invoiceCompanyAddress",
        `${companyDetails.addressLine1}, ${companyDetails.addressLine2}`
    );
    setText("invoiceCompanyPhone", companyDetails.phone);
    setText("invoiceCompanyGSTIN", companyDetails.gstin);
    setText("invoiceCompanyDL1", companyDetails.drugLicence1);
    setText("invoiceCompanyDL2", companyDetails.drugLicence2);
    setText("signatureCompanyName", companyDetails.name);
    setText("directorNameDisplay", companyDetails.directorName);
}

function getFinancialYearCode_(dateValue = new Date()) {
    const date = dateValue instanceof Date
        ? dateValue
        : new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date for invoice financial year.");
    }

    const calendarYear = date.getFullYear();
    const startYear = date.getMonth() >= 3
        ? calendarYear
        : calendarYear - 1;
    const endYear = startYear + 1;

    return `${startYear}${String(endYear).slice(-2)}`;
}

function getLocalNextInvoiceNumber_(billDate = localISODate()) {
    const financialYear = getFinancialYearCode_(billDate);
    return `MSB-${financialYear}-TEMP`;
}

async function generateBillNumber(forceRefresh = false) {
    const input = $("newBillNumber");
    const billDate = $("newBillDate")?.value || localISODate();

    if (!input) {
        return "";
    }

    if (!forceRefresh && input.value.trim()) {
        return input.value.trim();
    }

    input.value = "Generating...";

    try {
        if (isGoogleSheetsConnected_()) {
            const url = new URL(GOOGLE_SHEETS_CONFIG.webAppUrl);
            url.searchParams.set("action", "getNextInvoiceNumber");
            url.searchParams.set("billDate", billDate);

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(
                    `Invoice number request failed (${response.status}).`
                );
            }

            const result = await response.json();

            if (!result.success || !result.invoiceNumber) {
                throw new Error(
                    result.message || "Could not generate invoice number."
                );
            }

            input.value = result.invoiceNumber;
            return result.invoiceNumber;
        }

        const localNumber = getLocalNextInvoiceNumber_(billDate);
        input.value = localNumber;
        return localNumber;
    } catch (error) {
        console.error("Invoice number generation failed:", error);

        const fallbackNumber = getLocalNextInvoiceNumber_(billDate);
        input.value = fallbackNumber;
        return fallbackNumber;
    }
}

function clearGeneratedBillNumber_() {
    const input = $("newBillNumber");

    if (input) {
        input.value = "";
    }
}

function setDefaultBillDates() {
    const today = new Date();

    if ($("newBillDate")) {
        $("newBillDate").value = localISODate(today);
    }
}

on($("newBillDate"), "change", async () => {
    clearGeneratedBillNumber_();
    await generateBillNumber(true);
});

function getProductOptions() {
    return [
        '<option value="">Select product</option>',
        ...productMaster.map(
            (product, index) =>
                `<option value="${index}">${product.name}</option>`
        )
    ].join("");
}

function addProductRow(initialData = null) {
    if (!billItemsBody) return;

    billRowCounter += 1;

    const row = document.createElement("tr");
    row.className = "bill-item-row";

    row.innerHTML = `
        <td><span class="item-serial">${billRowCounter}</span></td>
        <td>
            <select class="item-product">${getProductOptions()}</select>
        </td>
        <td><input type="text" class="item-hsn" maxlength="8" placeholder="HSN"></td>
        <td><input type="text" class="item-batch" placeholder="Batch"></td>
        <td><input type="month" class="item-manufacturing-date"></td>
        <td><input type="month" class="item-expiry"></td>
        <td><input type="number" class="item-quantity" min="0" step="1" value="1"></td>
        <td><input type="number" class="item-free-quantity" min="0" step="1" value="0"></td>
        <td><input type="number" class="item-rate" min="0" step="0.01" value="0"></td>
        <td><input type="number" class="item-mrp" min="0" step="0.01" value="0"></td>
        <td><input type="number" class="item-discount" min="0" max="100" step="0.01" value="0"></td>
        <td>
            <select class="item-gst">
                <option value="0">Nil / 0%</option>
                <option value="5" selected>5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
                <option value="40">40%</option>
            </select>
        </td>
        <td><span class="item-taxable">₹0.00</span></td>
        <td><span class="item-tax">₹0.00</span></td>
        <td><span class="item-amount">₹0.00</span></td>
        <td>
            <button type="button" class="delete-item-button" title="Remove material">×</button>
        </td>
    `;

    billItemsBody.appendChild(row);
    attachProductRowEvents(row);

    if (initialData) {
        fillProductRow(row, initialData);
    }

    updateRowSerialNumbers();
    calculateBillTotals();
}

function fillProductRow(row, data) {
    const fields = {
        ".item-product": data.productIndex ?? "",
        ".item-hsn": data.hsn ?? "",
        ".item-batch": data.batch ?? "",
        ".item-manufacturing-date": data.manufacturingDate ?? "",
        ".item-expiry": data.expiryDate ?? "",
        ".item-quantity": data.quantity ?? 1,
        ".item-free-quantity": data.freeQuantity ?? 0,
        ".item-rate": data.rate ?? 0,
        ".item-mrp": data.mrp ?? 0,
        ".item-discount": data.discount ?? 0,
        ".item-gst": data.gst ?? 5
    };

    Object.entries(fields).forEach(([selector, value]) => {
        const input = row.querySelector(selector);
        if (input) input.value = String(value);
    });
}

function attachProductRowEvents(row) {
    const productSelect = row.querySelector(".item-product");

    on(productSelect, "change", () => {
        const productIndex = productSelect.value;

        if (productIndex === "") {
            row.querySelector(".item-hsn").value = "";
            row.querySelector(".item-rate").value = "0";
            row.querySelector(".item-mrp").value = "0";
            row.querySelector(".item-gst").value = "5";
        } else {
            const product = productMaster[Number(productIndex)];
            row.querySelector(".item-hsn").value = product.hsn || "";
            row.querySelector(".item-rate").value = Number(product.rate).toFixed(2);
            row.querySelector(".item-mrp").value = Number(product.mrp).toFixed(2);
            row.querySelector(".item-gst").value = String(product.gst);
        }

        calculateBillTotals();
    });

    row.querySelectorAll(
        ".item-quantity, .item-rate, .item-mrp, .item-discount, .item-gst"
    ).forEach((input) => {
        on(input, "input", calculateBillTotals);
        on(input, "change", calculateBillTotals);
    });

    on(row.querySelector(".delete-item-button"), "click", () => {
        const rows = billItemsBody.querySelectorAll(".bill-item-row");

        if (rows.length === 1) {
            showModal(
                "Material Required",
                "The invoice must contain at least one material row."
            );
            return;
        }

        row.remove();
        updateRowSerialNumbers();
        calculateBillTotals();
    });
}

function updateRowSerialNumbers() {
    const rows = billItemsBody?.querySelectorAll(".bill-item-row") || [];

    rows.forEach((row, index) => {
        const serial = row.querySelector(".item-serial");
        if (serial) serial.textContent = String(index + 1);
    });

    setText(
        "totalProductCount",
        `${rows.length} ${rows.length === 1 ? "material row" : "material rows"} added`
    );
}

function renderTaxSummary(summary) {
    const body = $("taxSummaryBody");
    if (!body) return;

    const rates = Object.keys(summary).map(Number).sort((a, b) => a - b);

    if (!rates.length) {
        body.innerHTML = `
            <tr>
                <td colspan="4">No taxable materials added.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = rates.map((rate) => {
        const item = summary[rate];

        return `
            <tr>
                <td>${rate}%</td>
                <td>${formatCurrency(item.taxable)}</td>
                <td>${formatCurrency(item.tax)}</td>
                <td>${formatCurrency(item.tax)}</td>
            </tr>
        `;
    }).join("");
}

function calculateBillTotals() {
    const rows = billItemsBody?.querySelectorAll(".bill-item-row") || [];

    let grossAmount = 0;
    let productDiscount = 0;
    let taxableAmount = 0;
    let gstAmount = 0;
    const rateSummary = {};

    rows.forEach((row) => {
        const quantity = Number(row.querySelector(".item-quantity")?.value) || 0;
        const rate = Number(row.querySelector(".item-rate")?.value) || 0;
        const discountPercent = Math.min(
            100,
            Math.max(0, Number(row.querySelector(".item-discount")?.value) || 0)
        );
        const gstPercent = Number(row.querySelector(".item-gst")?.value) || 0;

        const rowGross = quantity * rate;
        const rowDiscount = rowGross * discountPercent / 100;
        const rowTaxable = Math.max(0, rowGross - rowDiscount);
        const rowTax = rowTaxable * gstPercent / 100;
        const rowTotal = rowTaxable + rowTax;

        grossAmount += rowGross;
        productDiscount += rowDiscount;
        taxableAmount += rowTaxable;
        gstAmount += rowTax;

        setRowAmount(row, ".item-taxable", rowTaxable);
        setRowAmount(row, ".item-tax", rowTax);
        setRowAmount(row, ".item-amount", rowTotal);

        if (!rateSummary[gstPercent]) {
            rateSummary[gstPercent] = { taxable: 0, tax: 0 };
        }

        rateSummary[gstPercent].taxable += rowTaxable;
        rateSummary[gstPercent].tax += rowTax;
    });

    const additionalDiscount = Number($("additionalDiscount")?.value) || 0;
    const otherCharges = Number($("transportCharge")?.value) || 0;
    const roundOff = Number($("roundOffAmount")?.value) || 0;

    const grandTotal = Math.max(
        0,
        taxableAmount + gstAmount - additionalDiscount + otherCharges + roundOff
    );


    setText("grossAmountDisplay", formatCurrency(grossAmount));
    setText("productDiscountDisplay", `− ${formatCurrency(productDiscount)}`);
    setText("taxableAmountDisplay", formatCurrency(taxableAmount));
    setText("gstAmountDisplay", formatCurrency(gstAmount));
    setText("grandTotalDisplay", formatCurrency(grandTotal));

    renderTaxSummary(rateSummary);

    return {
        grossAmount,
        productDiscount,
        taxableAmount,
        gstAmount,
        additionalDiscount,
        otherCharges,
        roundOff,
        grandTotal
    };
}

function setRowAmount(row, selector, value) {
    const element = row.querySelector(selector);
    if (element) element.textContent = formatCurrency(value);
}

function configureOptionalPartyFields() {
    const includeDL = $("includePartyDL");
    const includeGST = $("includePartyGST");

    on(includeDL, "change", () => {
        $("partyDLInputArea")?.classList.toggle(
            "hidden-optional-field",
            !includeDL.checked
        );

        if (!includeDL.checked && $("retailerDrugLicense")) {
            $("retailerDrugLicense").value = "";
        }
    });

    on(includeGST, "change", () => {
        $("partyGSTInputArea")?.classList.toggle(
            "hidden-optional-field",
            !includeGST.checked
        );

        if (!includeGST.checked && $("retailerGST")) {
            $("retailerGST").value = "";
        }
    });
}



/* -------------------------
   Party master
------------------------- */

function normalizePartyType_(value) {
    return String(value || "").trim().toLowerCase();
}

function getPartyByName_(name) {
    const normalized = normalizePartyName_(name);
    return googlePartiesCache_.find(
        (party) => normalizePartyName_(party.partyName || party.name) === normalized
    ) || null;
}

function populatePartyDropdown_(selectedName = "") {
    const select = $("retailerName");
    if (!select) return;

    const currentName = selectedName || select.value || "";
    const parties = [...googlePartiesCache_].sort((left, right) =>
        String(left.partyName || left.name || "").localeCompare(
            String(right.partyName || right.name || "")
        )
    );

    select.innerHTML = [
        '<option value="">Select party name</option>',
        ...parties.map((party) => {
            const name = String(party.partyName || party.name || "").trim();
            return `<option value="${escapeHTML_(name)}">${escapeHTML_(name)}</option>`;
        })
    ].join("");

    if (currentName && getPartyByName_(currentName)) {
        select.value = currentName;
    }
}

function fillSelectedPartyDetails_() {
    const selectedName = $("retailerName")?.value || "";
    const party = getPartyByName_(selectedName);

    if (!party) {
        if ($("partyType")) $("partyType").value = "";
        if ($("retailerPhone")) $("retailerPhone").value = "";
        if ($("retailerAddress")) $("retailerAddress").value = "";
        return;
    }

    if ($("partyType")) {
        $("partyType").value = normalizePartyType_(
            party.partyType || party.type
        );
    }

    if ($("retailerPhone")) {
        $("retailerPhone").value = party.phone || "";
    }

    if ($("retailerAddress")) {
        $("retailerAddress").value = party.address || "";
    }

    const drugLicence = String(
        party.drugLicence || party.drugLicense || ""
    ).trim();
    const gstin = String(party.gstin || "").trim();

    if ($("includePartyDL")) {
        $("includePartyDL").checked = Boolean(drugLicence);
    }
    if ($("retailerDrugLicense")) {
        $("retailerDrugLicense").value = drugLicence;
    }
    $("partyDLInputArea")?.classList.toggle(
        "hidden-optional-field",
        !drugLicence
    );

    if ($("includePartyGST")) {
        $("includePartyGST").checked = Boolean(gstin);
    }
    if ($("retailerGST")) {
        $("retailerGST").value = gstin;
    }
    $("partyGSTInputArea")?.classList.toggle(
        "hidden-optional-field",
        !gstin
    );
}

async function loadPartiesFromGoogleSheets_() {
    if (!isGoogleSheetsConnected_()) {
        googlePartiesCache_ = [];
        populatePartyDropdown_();
        return;
    }

    const result = await getFromGoogleSheets_("getParties");
    googlePartiesCache_ = Array.isArray(result?.parties)
        ? result.parties
        : [];

    populatePartyDropdown_();
}

function setNewPartyMessage_(text = "", type = "") {
    const element = $("newPartyMessage");
    if (!element) return;
    element.textContent = text;
    element.className = type
        ? `party-form-message ${type}`
        : "party-form-message";
}

function openNewPartyModal_() {
    $("newPartyForm")?.reset();
    setNewPartyMessage_();
    $("newPartyModal")?.classList.add("party-modal-open");
    $("newPartyModal")?.setAttribute("aria-hidden", "false");
    document.body.classList.add("party-modal-active");
    window.setTimeout(() => $("newPartyName")?.focus(), 50);
}

function closeNewPartyModal_() {
    $("newPartyModal")?.classList.remove("party-modal-open");
    $("newPartyModal")?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("party-modal-active");
    setNewPartyMessage_();
}

on($("newRetailerButton"), "click", openNewPartyModal_);
on($("newPartyModalClose"), "click", closeNewPartyModal_);
on($("cancelNewPartyButton"), "click", closeNewPartyModal_);
on($("retailerName"), "change", fillSelectedPartyDetails_);

on($("newPartyModal"), "click", (event) => {
    if (event.target === $("newPartyModal")) {
        closeNewPartyModal_();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        $("newPartyModal")?.classList.contains("party-modal-open")
    ) {
        closeNewPartyModal_();
    }
});

on($("newPartyForm"), "submit", async (event) => {
    event.preventDefault();

    const party = {
        type: $("newPartyType")?.value || "",
        name: $("newPartyName")?.value.trim() || "",
        phone: $("newPartyPhone")?.value.trim() || "",
        address: $("newPartyAddress")?.value.trim() || "",
        gstin: "",
        drugLicence: ""
    };

    if (!party.type || !party.name) {
        setNewPartyMessage_(
            "Party type and party name are required.",
            "error"
        );
        return;
    }

    const saveButton = $("saveNewPartyButton");
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        const result = await postToGoogleSheets_({
            action: "saveParty",
            party
        });

        if (!result?.success) {
            throw new Error(result?.message || "Party could not be saved.");
        }

        await loadPartiesFromGoogleSheets_();
        populatePartyDropdown_(party.name);

        if ($("retailerName")) $("retailerName").value = party.name;
        fillSelectedPartyDetails_();

        setNewPartyMessage_(
            `${party.name} saved successfully.`,
            "success"
        );

        window.setTimeout(closeNewPartyModal_, 650);
    } catch (error) {
        console.error("Party save failed:", error);
        setNewPartyMessage_(
            error.message || "Party could not be saved.",
            "error"
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "Save Party";
        }
    }
});


[
    $("additionalDiscount"),
    $("transportCharge"),
    $("roundOffAmount")
].forEach((input) => on(input, "input", calculateBillTotals));

on($("addProductRowButton"), "click", () => addProductRow());
on($("addAnotherProductButton"), "click", () => addProductRow());

function collectBillData() {
    const products = Array.from(
        billItemsBody?.querySelectorAll(".bill-item-row") || []
    ).map((row) => {
        const productSelect = row.querySelector(".item-product");
        const option = productSelect?.options[productSelect.selectedIndex];

        return {
            productIndex: productSelect?.value || "",
            productName: option?.textContent.trim() || "",
            hsn: row.querySelector(".item-hsn")?.value.trim() || "",
            batch: row.querySelector(".item-batch")?.value.trim() || "",
            manufacturingDate:
                row.querySelector(".item-manufacturing-date")?.value || "",
            expiryDate: row.querySelector(".item-expiry")?.value || "",
            quantity: Number(row.querySelector(".item-quantity")?.value) || 0,
            freeQuantity:
                Number(row.querySelector(".item-free-quantity")?.value) || 0,
            rate: Number(row.querySelector(".item-rate")?.value) || 0,
            mrp: Number(row.querySelector(".item-mrp")?.value) || 0,
            discount: Number(row.querySelector(".item-discount")?.value) || 0,
            gst: Number(row.querySelector(".item-gst")?.value) || 0
        };
    });

    return {
        company: companyDetails,
        billNumber: $("newBillNumber")?.value || "",
        billDate: $("newBillDate")?.value || "",
        retailer: {
            type: $("partyType")?.value || "",
            name: $("retailerName")?.value.trim() || "",
            phone: $("retailerPhone")?.value.trim() || "",
            address: $("retailerAddress")?.value.trim() || "",
            includeDrugLicence: Boolean($("includePartyDL")?.checked),
            drugLicence: $("includePartyDL")?.checked
                ? $("retailerDrugLicense")?.value.trim() || ""
                : "",
            includeGSTIN: Boolean($("includePartyGST")?.checked),
            gstin: $("includePartyGST")?.checked
                ? $("retailerGST")?.value.trim() || ""
                : ""
        },
        products,
        notes: $("billNotes")?.value.trim() || "",
        terms: $("billTerms")?.value.trim() || "",
        totals: calculateBillTotals()
    };
}

function toGoogleSheetsInvoice_(data) {
    return {
        invoiceNumber: data.billNumber,
        billDate: data.billDate,
        party: {
            type: data.retailer.type,
            name: data.retailer.name,
            phone: data.retailer.phone,
            address: data.retailer.address,
            gstin: data.retailer.gstin,
            drugLicence: data.retailer.drugLicence
        },
        items: data.products.map((item) => ({
            productId: item.productIndex,
            productName: item.productName || item.name || "",
            name: item.productName || item.name || "",
            hsn: item.hsn,
            batchNumber: item.batch,
            manufacturingDate: item.manufacturingDate,
            expiryDate: item.expiryDate,
            quantity: item.quantity,
            freeQuantity: item.freeQuantity,
            rate: item.rate,
            mrp: item.mrp,
            discountPercent: item.discount,
            discountAmount: item.discountAmount,
            gstPercent: item.gst,
            taxableValue: item.taxable,
            cgst: item.cgst,
            sgst: item.sgst,
            igst: item.igst,
            totalGST: item.tax,
            lineTotal: item.amount
        })),
        summary: {
            grossMaterialValue: data.totals.grossAmount,
            itemDiscount: data.totals.productDiscount,
            taxableValue: data.totals.taxableAmount,
            cgst: data.totals.cgstAmount,
            sgst: data.totals.sgstAmount,
            igst: data.totals.igstAmount,
            totalGST: data.totals.gstAmount,
            additionalDiscount: data.totals.additionalDiscount,
            otherCharges: data.totals.transportCharge,
            roundOff: data.totals.roundOff,
            invoiceTotal: data.totals.grandTotal
        },
        terms: data.terms
    };
}

function validateBillData(data) {
    if (!data.billDate) {
        showModal("Bill Date Required", "Please select the bill date.");
        return false;
    }

    if (!data.retailer.type) {
        showModal("Party Type Required", "Please select Clinic, Hospital or Medical Store.");
        $("partyType")?.focus();
        return false;
    }

    if (!data.retailer.name) {
        showModal("Party Required", "Please enter or select the party name.");
        $("retailerName")?.focus();
        return false;
    }

    if (
        data.retailer.includeGSTIN &&
        data.retailer.gstin &&
        data.retailer.gstin.length !== 15
    ) {
        showModal(
            "Check GSTIN",
            "A GSTIN should contain 15 characters. Correct it or disable the GSTIN option."
        );
        return false;
    }

    const validProducts = data.products.filter(
        (product) =>
            product.productIndex !== "" &&
            product.quantity > 0 &&
            product.rate >= 0
    );

    if (!validProducts.length) {
        showModal(
            "Material Required",
            "Select at least one material and enter a valid quantity."
        );
        return false;
    }

    return true;
}

function getSavedBills() {
    return [];
}

function saveBills() {
    // Business records are stored only in Google Sheets.
}

async function requestInvoicePdfHandle_(data) {
    const fileName = `${sanitizeDownloadName_(data.retailer.name)} - ${sanitizeDownloadName_(data.billNumber)}.pdf`;

    if ("showSaveFilePicker" in window) {
        return window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
                {
                    description: "PDF Invoice",
                    accept: {
                        "application/pdf": [".pdf"]
                    }
                }
            ]
        });
    }

    return {
        fallbackDownload: true,
        suggestedName: fileName
    };
}


function formatInvoiceDate_(value) {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return escapeHTML_(value);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatMonthYear_(value) {
    if (!value) return "-";
    const [year, month] = String(value).split("-");
    if (!year || !month) return escapeHTML_(value);
    return `${month}/${String(year).slice(-2)}`;
}

function formatNumber_(value, digits = 2) {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(Number(value) || 0);
}

function numberToWordsIndian_(amount) {
    const number = Math.round(Number(amount) || 0);
    if (number === 0) return "Zero Rupees Only";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
        "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const belowHundred = (n) => {
        if (n < 20) return ones[n];
        return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`;
    };

    const belowThousand = (n) => {
        const hundred = Math.floor(n / 100);
        const rest = n % 100;
        return `${hundred ? `${ones[hundred]} Hundred` : ""}${
            hundred && rest ? " " : ""
        }${rest ? belowHundred(rest) : ""}`.trim();
    };

    let remaining = number;
    const parts = [];

    const crore = Math.floor(remaining / 10000000);
    if (crore) {
        parts.push(`${belowThousand(crore)} Crore`);
        remaining %= 10000000;
    }

    const lakh = Math.floor(remaining / 100000);
    if (lakh) {
        parts.push(`${belowHundred(lakh)} Lakh`);
        remaining %= 100000;
    }

    const thousand = Math.floor(remaining / 1000);
    if (thousand) {
        parts.push(`${belowHundred(thousand)} Thousand`);
        remaining %= 1000;
    }

    if (remaining) parts.push(belowThousand(remaining));
    return `${parts.join(" ")} Rupees Only`;
}

function calculateInvoiceLines_(data) {
    return data.products
        .filter((item) => item.productIndex !== "" && item.quantity > 0)
        .map((item, index) => {
            const gross = item.quantity * item.rate;
            const discountAmount = gross * Math.max(0, Math.min(100, item.discount)) / 100;
            const taxable = Math.max(0, gross - discountAmount);
            const tax = taxable * item.gst / 100;
            const amount = taxable + tax;

            return {
                ...item,
                serial: index + 1,
                gross,
                discountAmount,
                taxable,
                tax,
                amount
            };
        });
}

function buildInvoicePdfTemplate_(data) {
    let template = $("invoicePdfTemplate");

    if (!template) {
        template = document.createElement("div");
        template.id = "invoicePdfTemplate";
        template.className = "invoice-pdf-template";
        document.body.appendChild(template);
    }

    const items = calculateInvoiceLines_(data);
    const totals = data.totals || {};
    const gstMap = {};

    items.forEach((item) => {
        if (!gstMap[item.gst]) {
            gstMap[item.gst] = { taxable: 0, tax: 0 };
        }
        gstMap[item.gst].taxable += item.taxable;
        gstMap[item.gst].tax += item.tax;
    });

    const terms = String(data.terms || "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    const itemRows = items.map((item) => `
        <tr>
            <td class="center">${item.serial}</td>
            <td class="product-cell">${escapeHTML_(item.productName)}</td>
            <td>${escapeHTML_(item.hsn || "-")}</td>
            <td>${escapeHTML_(item.batch || "-")}</td>
            <td>${formatMonthYear_(item.manufacturingDate)}</td>
            <td>${formatMonthYear_(item.expiryDate)}</td>
            <td class="num">${formatNumber_(item.quantity, 0)}</td>
            <td class="num">${formatNumber_(item.freeQuantity, 0)}</td>
            <td class="num">${formatNumber_(item.rate)}</td>
            <td class="num">${formatNumber_(item.mrp)}</td>
            <td class="num">${formatNumber_(item.discount)}%</td>
            <td class="num">${formatNumber_(item.gst, 0)}%</td>
            <td class="num">${formatNumber_(item.taxable)}</td>
            <td class="num">${formatNumber_(item.tax)}</td>
            <td class="num strong">${formatNumber_(item.amount)}</td>
        </tr>
    `).join("");

    const emptyRows = Math.max(0, 8 - items.length);
    const fillerRows = Array.from({ length: emptyRows }, () => `
        <tr class="pdf-empty-row">
            <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>
            <td></td><td></td><td></td><td></td><td></td><td></td>
            <td></td><td></td><td></td>
        </tr>
    `).join("");

    const gstRows = Object.entries(gstMap)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([rate, values]) => `
            <tr>
                <td>${formatNumber_(rate, 0)}%</td>
                <td class="num">${formatNumber_(values.taxable)}</td>
                <td class="num">${formatNumber_(values.tax / 2)}</td>
                <td class="num">${formatNumber_(values.tax / 2)}</td>
                <td class="num">${formatNumber_(values.tax)}</td>
            </tr>
        `).join("") || `
            <tr><td colspan="5" class="center">No GST applicable</td></tr>
        `;

    const partyOptional = [
        data.retailer.phone ? `<div><b>Phone:</b> ${escapeHTML_(data.retailer.phone)}</div>` : "",
        data.retailer.gstin ? `<div><b>GSTIN:</b> ${escapeHTML_(data.retailer.gstin)}</div>` : "",
        data.retailer.drugLicence ? `<div><b>DL No.:</b> ${escapeHTML_(data.retailer.drugLicence)}</div>` : ""
    ].filter(Boolean).join("");

    template.innerHTML = `
        <div class="pdf-page">
            <header class="pdf-header">
                <div class="pdf-brand">
                    <img src="ms_Logo.png" alt="Maxosmith Logo" onerror="this.style.display='none'">
                    <div>
                        <div class="pdf-tax-label">TAX INVOICE</div>
                        <h1>${escapeHTML_(companyDetails.name)}</h1>
                        <h2>${escapeHTML_(companyDetails.legalName)}</h2>
                        <p>${escapeHTML_(companyDetails.addressLine1)}, ${escapeHTML_(companyDetails.addressLine2)}</p>
                        <p><b>Phone:</b> ${escapeHTML_(companyDetails.phone)} &nbsp; <b>GSTIN:</b> ${escapeHTML_(companyDetails.gstin)}</p>
                        <p>${escapeHTML_(companyDetails.drugLicence1)} &nbsp; | &nbsp; ${escapeHTML_(companyDetails.drugLicence2)}</p>
                    </div>
                </div>

                <div class="pdf-invoice-meta">
                    <div class="pdf-title">TAX INVOICE</div>
                    <table>
                        <tr><th>Invoice No.</th><td>${escapeHTML_(data.billNumber)}</td></tr>
                        <tr><th>Invoice Date</th><td>${formatInvoiceDate_(data.billDate)}</td></tr>
                        <tr><th>Place of Supply</th><td>${escapeHTML_(companyDetails.state)} (${escapeHTML_(companyDetails.stateCode)})</td></tr>
                        <tr><th>Payment Terms</th><td>20 Days</td></tr>
                    </table>
                </div>
            </header>

            <section class="pdf-party-grid">
                <div class="pdf-party-box">
                    <div class="pdf-box-title">BILLED TO / PARTY DETAILS</div>
                    <h3>${escapeHTML_(data.retailer.name)}</h3>
                    <div><b>Party Type:</b> ${escapeHTML_(data.retailer.type || "-")}</div>
                    <div><b>Address:</b> ${escapeHTML_(data.retailer.address || "-")}</div>
                    ${partyOptional}
                </div>
                <div class="pdf-reference-box">
                    <div class="pdf-box-title">INVOICE INFORMATION</div>
                    <div><b>Due Date:</b> ${formatInvoiceDate_(
                        (() => {
                            const d = new Date(`${data.billDate}T00:00:00`);
                            d.setDate(d.getDate() + 20);
                            return localISODate(d);
                        })()
                    )}</div>
                    <div><b>Supply State:</b> ${escapeHTML_(companyDetails.state)}</div>
                    <div><b>State Code:</b> ${escapeHTML_(companyDetails.stateCode)}</div>
                    <div><b>Currency:</b> INR</div>
                    ${data.notes ? `<div><b>Remarks:</b> ${escapeHTML_(data.notes)}</div>` : ""}
                </div>
            </section>

            <section class="pdf-items-section">
                <table class="pdf-items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Medicine / Product</th>
                            <th>HSN</th>
                            <th>Batch</th>
                            <th>MFD</th>
                            <th>EXP</th>
                            <th>Qty</th>
                            <th>Free</th>
                            <th>Rate</th>
                            <th>MRP</th>
                            <th>Disc.</th>
                            <th>GST</th>
                            <th>Taxable</th>
                            <th>Tax</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}${fillerRows}</tbody>
                </table>
            </section>

            <section class="pdf-summary-grid">
                <div class="pdf-gst-summary">
                    <div class="pdf-box-title">GST SUMMARY</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Rate</th>
                                <th>Taxable</th>
                                <th>CGST</th>
                                <th>SGST</th>
                                <th>Total GST</th>
                            </tr>
                        </thead>
                        <tbody>${gstRows}</tbody>
                    </table>
                    <div class="pdf-amount-words">
                        <b>Amount in Words:</b>
                        ${escapeHTML_(numberToWordsIndian_(totals.grandTotal))}
                    </div>
                </div>

                <div class="pdf-total-summary">
                    <table>
                        <tr><th>Gross Amount</th><td>${formatNumber_(totals.grossAmount)}</td></tr>
                        <tr><th>Item Discount</th><td>- ${formatNumber_(totals.productDiscount)}</td></tr>
                        <tr><th>Taxable Value</th><td>${formatNumber_(totals.taxableAmount)}</td></tr>
                        <tr><th>Total GST</th><td>${formatNumber_(totals.gstAmount)}</td></tr>
                        <tr><th>Additional Discount</th><td>- ${formatNumber_(totals.additionalDiscount)}</td></tr>
                        <tr><th>Other Charges</th><td>${formatNumber_(totals.otherCharges)}</td></tr>
                        <tr><th>Round Off</th><td>${formatNumber_(totals.roundOff)}</td></tr>
                        <tr class="pdf-grand-total"><th>GRAND TOTAL</th><td>₹ ${formatNumber_(totals.grandTotal)}</td></tr>
                    </table>
                </div>
            </section>

            <footer class="pdf-footer">
                <div class="pdf-terms">
                    <div class="pdf-box-title">TERMS & CONDITIONS</div>
                    <ol>
                        ${terms.slice(0, 5).map((term) => `<li>${escapeHTML_(term.replace(/^\d+\.\s*/, ""))}</li>`).join("")}
                    </ol>
                </div>

                <div class="pdf-signatures">
                    <div class="pdf-signature-box">
                        <div class="pdf-sign-line"></div>
                        <b>Receiver's Signature</b>
                        <span>Goods received in satisfactory condition</span>
                    </div>
                    <div class="pdf-signature-box">
                        <p>For <b>${escapeHTML_(companyDetails.name)}</b></p>
                        <div class="pdf-authorised-space"></div>
                        <div class="pdf-sign-line"></div>
                        <b>${escapeHTML_(companyDetails.directorName)}</b>
                        <span>Director / Authorised Signatory</span>
                    </div>
                </div>
            </footer>

            <div class="pdf-bottom-note">
                This is a computer-generated tax invoice.
            </div>
        </div>
    `;

    return template;
}

async function createInvoicePdfBlob_(data) {
    if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error(
            "The PDF library could not load. Check the internet connection and reload the page."
        );
    }

    const invoiceElement = buildInvoicePdfTemplate_(data);

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await window.html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const widthScale = printableWidth / canvas.width;
    const heightScale = printableHeight / canvas.height;
    const scale = Math.min(widthScale, heightScale);

    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;
    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;
    const imageData = canvas.toDataURL("image/jpeg", 0.96);

    pdf.addImage(
        imageData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
    );

    return pdf.output("blob");
}


async function saveInvoicePdfToComputer_(fileHandle, pdfBlob, fileName) {
    if (fileHandle?.fallbackDownload) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || fileHandle.suggestedName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return;
    }

    const writable = await fileHandle.createWritable();
    await writable.write(pdfBlob);
    await writable.close();
}

function updateBillStatus(message, saved = false) {
    const element = $("billStatusMessage");
    if (!element) return;

    element.classList.toggle("saved-status", saved);
    element.innerHTML = `<span>●</span> ${message}`;
}

on(newBillForm, "submit", async (event) => {
    event.preventDefault();

    const saveButton = $("saveBillButton");

    if (saveButton?.disabled) {
        return;
    }

    let data = collectBillData();

    if (!data.billNumber || data.billNumber === "Generating...") {
        await generateBillNumber(true);
        data = collectBillData();
    }

    if (!validateBillData(data)) return;

    if (!isGoogleSheetsConnected_()) {
        showModal(
            "Google Sheets Not Connected",
            "Run setupDatabase(), deploy Code.gs as a Web App, and paste the Web App URL in dashboard.js before saving production invoices."
        );
        return;
    }

    let pdfHandle;

    try {
        /*
         * Ask the user where the PDF should be saved while the click
         * still has browser user activation.
         */
        pdfHandle = await requestInvoicePdfHandle_(data);
    } catch (error) {
        if (error?.name === "AbortError") {
            updateBillStatus("Invoice save was cancelled.");
            return;
        }

        showModal(
            "Computer Save Error",
            error.message || "The save location could not be selected."
        );
        return;
    }

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        data.createdAt = new Date().toISOString();
        data.status = "saved";
        data.totals.amountReceived =
            Number(data.totals.amountReceived) || 0;
        data.totals.outstandingAmount = Math.max(
            0,
            Number(data.totals.grandTotal) -
            data.totals.amountReceived
        );

        const result = await postToGoogleSheets_({
            action: "saveInvoice",
            invoice: toGoogleSheetsInvoice_(data)
        });

        data.billNumber = result.invoiceNumber || data.billNumber;
        data.syncStatus = "synced";

        if ($("newBillNumber")) {
            $("newBillNumber").value = data.billNumber;
        }

        /*
         * The final number may be adjusted by Google Sheets if another
         * user saved first, so the actual PDF name uses the final number.
         */
        const finalFileName = `${sanitizeDownloadName_(data.retailer.name)} - ${sanitizeDownloadName_(data.billNumber)}.pdf`;
        const pdfBlob = await createInvoicePdfBlob_(data);
        await saveInvoicePdfToComputer_(
            pdfHandle,
            pdfBlob,
            finalFileName
        );

        sessionStorage.setItem(
            "maxosmithLastSavedInvoiceNumber",
            data.billNumber
        );

        updateBillStatus(
            `Bill ${data.billNumber} saved in Google Sheets.`,
            true
        );

        await refreshAllGoogleSheetsData_();

        showModal(
            "Bill Saved Successfully",
            `${data.billNumber} for ${data.retailer.name} was saved in Google Sheets and as ${finalFileName}.`
        );
    } catch (error) {
        console.error("Invoice save failed:", error);

        updateBillStatus(
            `Bill save failed: ${error.message}`
        );

        showModal(
            "Bill Save Failed",
            error.message || "Please check Google Sheets and try again."
        );
    } finally {
        restoreInvoiceAfterPrint();

        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "Save New Bill";
        }
    }
});

on($("saveDraftButton"), "click", () => {
    showModal(
        "Browser Draft Storage Disabled",
        "Drafts are not stored in this browser. Complete and save the invoice to Google Sheets."
    );
    updateBillStatus("Draft not saved — browser storage is disabled.");
});

on($("previewBillButton"), "click", () => {
    const data = collectBillData();
    if (!validateBillData(data)) return;

    showModal(
        `Invoice ${data.billNumber}`,
        `${data.retailer.name} — Invoice total ${formatCurrency(
            data.totals.grandTotal
        )}. Select Print Bill for the printable version.`
    );
});

on($("printBillButton"), "click", async () => {
    const data = collectBillData();
    if (!validateBillData(data)) return;

    try {
        const pdfBlob = await createInvoicePdfBlob_(data);
        const fileName = `${sanitizeDownloadName_(data.retailer.name)} - ${sanitizeDownloadName_(data.billNumber)}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
        showModal("PDF Creation Failed", error.message || "Could not create the invoice PDF.");
    }
});

async function resetBillForm() {
    newBillForm?.reset();

    if (billItemsBody) billItemsBody.innerHTML = "";
    billRowCounter = 0;

    setDefaultBillDates();
    clearGeneratedBillNumber_();
    await generateBillNumber(true);

    $("partyDLInputArea")?.classList.add("hidden-optional-field");
    $("partyGSTInputArea")?.classList.add("hidden-optional-field");

    addProductRow();
    updateBillStatus("Bill has not been saved.");
    calculateBillTotals();
}

on($("clearBillButton"), "click", () => {
    if (window.confirm("Clear all details from the current invoice?")) {
        void resetBillForm();
    }
});

/* =========================================================
   RETAILER LEDGER TRANSACTION MODULE
========================================================= */

const ledgerPaymentForm = $("ledgerPaymentForm");
const oldLedgerForm = $("oldLedgerForm");

function isLedgerDebitType_(entryType) {
    return ["Sale", "Debit Adjustment", "Opening Balance"].includes(entryType);
}

function configureLedgerPaymentMode_() {
    const entryType = $("ledgerEntryType");
    const mode = $("ledgerPaymentMode");
    const modeArea = $("ledgerPaymentModeArea");
    const onlineArea = $("ledgerOnlineIdArea");
    const cashArea = $("ledgerCashReceiptArea");
    const onlineInput = $("ledgerOnlinePaymentId");
    const cashInput = $("ledgerCashReceiptId");

    const refreshFields = () => {
        const isPayment = entryType?.value === "Payment";
        const value = isPayment ? mode?.value : "";

        modeArea?.classList.toggle("hidden-optional-field", !isPayment);
        onlineArea?.classList.toggle("hidden-optional-field", value !== "Online");
        cashArea?.classList.toggle("hidden-optional-field", value !== "Cash");

        if (mode) {
            mode.required = isPayment;
            if (!isPayment) mode.value = "";
        }
        if (onlineInput) {
            onlineInput.required = value === "Online";
            if (value !== "Online") onlineInput.value = "";
        }
        if (cashInput) {
            cashInput.required = value === "Cash";
            if (value !== "Cash") cashInput.value = "";
        }

        updateLedgerOutstandingPreview_();
    };

    on(entryType, "change", refreshFields);
    on(mode, "change", refreshFields);
    refreshFields();
}

function updateLedgerOutstandingPreview_() {
    const partyName = $("ledgerPartyName")?.value.trim() || "";
    const amount = Number($("ledgerPaymentAmount")?.value) || 0;
    const entryType = $("ledgerEntryType")?.value || "";
    const outstandingBefore = partyName ? getRetailerOutstanding_(partyName) : 0;
    const signedChange = isLedgerDebitType_(entryType) ? amount : -amount;
    const outstandingAfter = Math.max(0, outstandingBefore + signedChange);

    if ($("ledgerOutstandingBefore")) {
        $("ledgerOutstandingBefore").value = formatCurrency(outstandingBefore);
    }
    if ($("ledgerOutstandingAfter")) {
        $("ledgerOutstandingAfter").value = formatCurrency(outstandingAfter);
    }
    return { outstandingBefore, outstandingAfter };
}

function populateLedgerPartySuggestions_() {
    const datalist = $("ledgerPartySuggestions");
    if (!datalist) return;
    const parties = new Map();

    googleInvoicesCache_.forEach((invoice) => {
        const name = String(invoice?.partyName || "").trim();
        if (name) parties.set(normalizePartyName_(name), name);
    });
    googleLedgerCache_.forEach((entry) => {
        const name = String(entry?.partyName || "").trim();
        if (name) parties.set(normalizePartyName_(name), name);
    });

    datalist.innerHTML = [...parties.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((name) => `<option value="${escapeHTML_(name)}"></option>`)
        .join("");
}

function collectLedgerEntryData_(prefix = "ledger") {
    const historical = prefix === "oldLedger";
    const entryType = $(historical ? "oldLedgerEntryType" : "ledgerEntryType")?.value || "";
    const amount = Number($(historical ? "oldLedgerAmount" : "ledgerPaymentAmount")?.value) || 0;
    const debit = isLedgerDebitType_(entryType) ? amount : 0;
    const credit = isLedgerDebitType_(entryType) ? 0 : amount;

    return {
        rowNumber: historical ? Number($("oldLedgerRowNumber")?.value) || 0 : 0,
        partyName: $(historical ? "oldLedgerPartyName" : "ledgerPartyName")?.value.trim() || "",
        entryDate: $(historical ? "oldLedgerDate" : "ledgerPaymentDate")?.value || "",
        entryType,
        referenceNumber: $(historical ? "oldLedgerReference" : "ledgerReferenceNumber")?.value.trim() || "",
        paymentMode: historical ? "" : $("ledgerPaymentMode")?.value || "",
        transactionId: historical ? "" :
            ($("ledgerOnlinePaymentId")?.value.trim() ||
             $("ledgerCashReceiptId")?.value.trim() || ""),
        debit,
        credit,
        amount,
        notes: $(historical ? "oldLedgerNotes" : "ledgerNotes")?.value.trim() || ""
    };
}

function validateLedgerEntry_(entry, historical = false) {
    if (!entry.partyName) {
        showModal("Party Required", "Please enter the retailer or customer name.");
        return false;
    }
    if (!entry.entryDate) {
        showModal("Entry Date Required", "Please select the ledger entry date.");
        return false;
    }
    if (!entry.entryType) {
        showModal("Entry Type Required", "Please select debit, payment, return or adjustment.");
        return false;
    }
    if (entry.amount <= 0) {
        showModal("Amount Required", "Enter an amount greater than zero.");
        return false;
    }
    if (entry.entryType === "Payment" && !historical && !entry.paymentMode) {
        showModal("Payment Mode Required", "Please select the payment mode.");
        return false;
    }
    if (entry.entryType === "Payment" && entry.paymentMode === "Online" && !entry.transactionId) {
        showModal("Transaction ID Required", "Please enter the online transaction ID.");
        return false;
    }
    if (entry.entryType === "Payment" && entry.paymentMode === "Cash" && !entry.transactionId) {
        showModal("Cash Receipt Required", "Please enter the cash receipt ID.");
        return false;
    }
    return true;
}

function setLedgerStatus_(message, saved = false, statusId = "ledgerStatusMessage") {
    const status = $(statusId);
    if (!status) return;
    status.classList.toggle("saved-status", saved);
    status.innerHTML = `<span>●</span> ${escapeHTML_(message)}`;
}

function renderLedgerHistory_() {
    const body = $("ledgerHistoryTable");
    if (!body) return;

    const entries = [...getLedgerPayments_()]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || b.entryDate || 0) -
                        new Date(a.updatedAt || a.createdAt || a.entryDate || 0))
        .slice(0, 15);

    if (!entries.length) {
        body.innerHTML = `<tr class="empty-table-row"><td colspan="8">No ledger transaction has been added.</td></tr>`;
        return;
    }

    body.innerHTML = entries.map((entry) => `
        <tr>
            <td>${escapeHTML_(entry.rowNumber || "-")}</td>
            <td>${escapeHTML_(entry.partyName || "-")}</td>
            <td>${escapeHTML_(normalizeSheetDate_(entry.entryDate || entry.paymentDate) || "-")}</td>
            <td>${escapeHTML_(entry.entryType || "Payment")}</td>
            <td>${escapeHTML_(entry.referenceNumber || "-")}</td>
            <td>${formatCurrency(entry.debit || 0)}</td>
            <td>${formatCurrency(entry.credit ?? entry.amount ?? 0)}</td>
            <td>${formatCurrency(entry.balance || entry.outstandingAfterPayment || 0)}</td>
        </tr>
    `).join("");
}

function resetLedgerPaymentForm_() {
    ledgerPaymentForm?.reset();
    if ($("ledgerPaymentDate")) $("ledgerPaymentDate").value = localISODate();
    configureLedgerPaymentMode_();
    updateLedgerOutstandingPreview_();
    setLedgerStatus_("Ledger entry has not been saved.");
}

function resetOldLedgerForm_() {
    oldLedgerForm?.reset();
    if ($("oldLedgerDate")) $("oldLedgerDate").value = localISODate();
    setLedgerStatus_("Historical entry has not been saved.", false, "oldLedgerStatus");
}

on($("ledgerPartyName"), "input", updateLedgerOutstandingPreview_);
on($("ledgerPartyName"), "change", updateLedgerOutstandingPreview_);
on($("ledgerPaymentAmount"), "input", updateLedgerOutstandingPreview_);
on($("ledgerEntryType"), "change", updateLedgerOutstandingPreview_);
on($("clearLedgerPaymentButton"), "click", resetLedgerPaymentForm_);
on($("clearOldLedgerButton"), "click", resetOldLedgerForm_);

async function submitLedgerEntry_(entry, historical = false) {
    if (!validateLedgerEntry_(entry, historical)) return;
    if (!isGoogleSheetsConnected_()) {
        showModal("Google Sheets Required", "The ledger entry was not saved because Google Sheets is not connected.");
        return;
    }

    const button = $(historical ? "saveOldLedgerButton" : "saveLedgerPaymentButton");
    if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
    }

    try {
        const action = historical && entry.rowNumber ? "updateLedgerEntry" : "saveLedgerEntry";
        const result = await postToGoogleSheets_({ action, entry });

        setLedgerStatus_(
            entry.rowNumber ? "Ledger entry updated in Google Sheets." : "Ledger entry saved in Google Sheets.",
            true,
            historical ? "oldLedgerStatus" : "ledgerStatusMessage"
        );

        showModal(
            entry.rowNumber ? "Ledger Entry Updated" : "Ledger Entry Saved",
            `${entry.entryType} of ${formatCurrency(entry.amount)} for ${entry.partyName}. Current balance: ${formatCurrency(result.balance || 0)}.`
        );

        await refreshAllGoogleSheetsData_();
        historical ? resetOldLedgerForm_() : resetLedgerPaymentForm_();
    } catch (error) {
        console.error(error);
        setLedgerStatus_(
            `Google Sheets save failed: ${error.message}`,
            false,
            historical ? "oldLedgerStatus" : "ledgerStatusMessage"
        );
        showModal("Ledger Entry Not Saved", error.message || "Please check the Google Sheets connection.");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = historical ? "Save Historical Entry" : "Save Ledger Entry";
        }
    }
}

on(ledgerPaymentForm, "submit", async (event) => {
    event.preventDefault();
    await submitLedgerEntry_(collectLedgerEntryData_(), false);
});

on(oldLedgerForm, "submit", async (event) => {
    event.preventDefault();
    await submitLedgerEntry_(collectLedgerEntryData_("oldLedger"), true);
});

function refreshDashboardFromStorage_() {
    return refreshAllGoogleSheetsData_();
}

/* =========================================================
   UPDATE BILL SEARCH
========================================================= */

on($("billSearchForm"), "submit", async (event) => {
    event.preventDefault();

    const billNumber = $("billNumber")?.value.trim().toLowerCase() || "";
    const partyName = $("billRetailer")?.value.trim().toLowerCase() || "";
    const billDate = $("billDate")?.value || "";

    if (!billNumber && !partyName && !billDate) {
        const result = $("billSearchResult");
        if (result) {
            result.textContent =
                "Please enter a bill number, party name or bill date.";
            result.style.background = "#fee2e2";
            result.style.color = "#b91c1c";
        }
        return;
    }

    if (!googleInvoicesCache_.length) {
        await loadInvoicesFromGoogleSheets_();
    }

    const matches = googleInvoicesCache_.filter((invoice) => {
        const matchesNumber =
            !billNumber ||
            String(invoice.invoiceNumber || "").toLowerCase().includes(billNumber);

        const matchesParty =
            !partyName ||
            String(invoice.partyName || "").toLowerCase().includes(partyName);

        const matchesDate =
            !billDate || normalizeSheetDate_(invoice.billDate) === billDate;

        return matchesNumber && matchesParty && matchesDate;
    });

    const result = $("billSearchResult");
    if (!result) return;

    if (!matches.length) {
        result.textContent = "No matching invoice was found in Google Sheets.";
        result.style.background = "#fff4cc";
        result.style.color = "#8a6500";
        return;
    }

    result.innerHTML = matches
        .slice(0, 10)
        .map(
            (invoice) => `
                <div style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,.08)">
                    <strong>${escapeHTML_(invoice.invoiceNumber)}</strong> —
                    ${escapeHTML_(invoice.partyName || "Unknown party")} —
                    ${formatCurrency(invoice.invoiceTotal)}
                </div>
            `
        )
        .join("");

    result.style.background = "#ecfdf3";
    result.style.color = "#166534";
});

/* =========================================================
   DASHBOARD DATA FROM SAVED BILLS
========================================================= */

function getBillGrandTotal_(bill) {
    return Math.max(
        0,
        Number(
            bill?.totals?.grandTotal ??
            bill?.summary?.invoiceTotal ??
            bill?.invoiceTotal ??
            0
        ) || 0
    );
}

function getBillBaseOutstanding_(bill) {
    const storedOutstanding =
        bill?.totals?.outstandingAmount ??
        bill?.summary?.outstandingAmount ??
        bill?.outstandingAmount;

    if (
        storedOutstanding !== undefined &&
        storedOutstanding !== null &&
        storedOutstanding !== ""
    ) {
        return Math.max(0, Number(storedOutstanding) || 0);
    }

    const amountReceived = Math.max(
        0,
        Number(
            bill?.totals?.amountReceived ??
            bill?.summary?.amountReceived ??
            bill?.amountReceived ??
            0
        ) || 0
    );

    return Math.max(0, getBillGrandTotal_(bill) - amountReceived);
}

function normalizePartyName_(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function isSavedBill_(bill) {
    return String(bill?.status || "saved").toLowerCase() !== "draft";
}

function isDateInCurrentMonth_(dateValue, currentDate = new Date()) {
    if (!dateValue) return false;

    const date = new Date(`${dateValue}T00:00:00`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === currentDate.getFullYear() &&
        date.getMonth() === currentDate.getMonth()
    );
}

function getLedgerPayments_() {
    return [...googleLedgerCache_];
}

function saveLedgerPayments_() {
    // Ledger records are stored only in Google Sheets.
}

function getRetailerOutstandingMap_(bills, payments) {
    const outstandingMap = {};
    const displayNames = {};

    bills.filter(isSavedBill_).forEach((bill) => {
        const partyName = bill?.retailer?.name || "Unknown party";
        const key = normalizePartyName_(partyName);

        if (!key) return;

        displayNames[key] = partyName;
        outstandingMap[key] =
            (outstandingMap[key] || 0) + getBillBaseOutstanding_(bill);
    });

    payments.forEach((payment) => {
        const key = normalizePartyName_(payment.partyName);

        if (!key) return;

        displayNames[key] = payment.partyName;
        outstandingMap[key] = Math.max(
            0,
            (outstandingMap[key] || 0) -
            (Number(payment.amount) || 0)
        );
    });

    return Object.fromEntries(
        Object.entries(outstandingMap).map(([key, amount]) => [
            key,
            {
                partyName: displayNames[key] || key,
                outstandingAmount: Math.max(0, amount)
            }
        ])
    );
}

function getRetailerOutstanding_(partyName) {
    const key = normalizePartyName_(partyName);
    const party = googleOutstandingMap_[key];
    return party ? Number(party.outstandingAmount) || 0 : 0;
}


/* =========================================================
   EXPENSE MANAGEMENT
========================================================= */

function setExpenseMessage_(message = "", type = "") {
    const element = $("expenseFormMessage");
    if (!element) return;

    element.textContent = message;
    element.className = type
        ? `expense-form-message ${type}`
        : "expense-form-message";
}

function configureExpenseType_() {
    const isMaterial = $("expenseType")?.value === "Material Cost";
    $("materialExpensePanel")?.classList.toggle(
        "hidden-expense-panel",
        !isMaterial
    );

    ["supplierBillNumber", "supplierBillDate", "materialBillTotal"]
        .forEach((id) => {
            const input = $(id);
            if (input) input.required = isMaterial;
        });

    if (isMaterial && !$("supplierBillDate")?.value) {
        $("supplierBillDate").value = $("expenseDate")?.value || localISODate();
    }
}

function calculateMaterialBillTotal_() {
    const taxable = Number($("materialTaxableAmount")?.value) || 0;
    const gst = Number($("materialGSTAmount")?.value) || 0;
    const totalInput = $("materialBillTotal");

    if (totalInput && (taxable > 0 || gst > 0)) {
        totalInput.value = (taxable + gst).toFixed(2);
        if ($("expenseType")?.value === "Material Cost") {
            $("expenseAmount").value = totalInput.value;
        }
    }
}

function syncMaterialTotalToExpense_() {
    if ($("expenseType")?.value !== "Material Cost") return;
    const total = Number($("materialBillTotal")?.value) || 0;
    if (total > 0 && $("expenseAmount")) {
        $("expenseAmount").value = total.toFixed(2);
    }
}

function readExpenseAttachment_() {
    const file = $("expenseBillFile")?.files?.[0];

    if (!file) {
        return Promise.resolve(null);
    }

    const maximumBytes = 4 * 1024 * 1024;
    if (file.size > maximumBytes) {
        return Promise.reject(
            new Error("The attached bill must be 4 MB or smaller.")
        );
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            const base64 = dataUrl.includes(",")
                ? dataUrl.split(",")[1]
                : "";

            resolve({
                name: file.name,
                mimeType: file.type || "application/octet-stream",
                base64
            });
        };

        reader.onerror = () => {
            reject(new Error("The attached bill could not be read."));
        };

        reader.readAsDataURL(file);
    });
}

function normalizeExpenseDate_(value) {
    return normalizeSheetDate_(value);
}

function isCurrentMonthDate_(value) {
    const normalized = normalizeExpenseDate_(value);
    if (!normalized) return false;

    const date = new Date(`${normalized}T00:00:00`);
    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    );
}

function updateExpenseSummary_() {
    let monthlyTotal = 0;
    let materialTotal = 0;
    let otherTotal = 0;

    googleExpensesCache_.forEach((expense) => {
        if (!isCurrentMonthDate_(expense.expenseDate)) return;

        const amount = Number(expense.amount) || 0;
        monthlyTotal += amount;

        if (expense.expenseType === "Material Cost") {
            materialTotal += amount;
        } else {
            otherTotal += amount;
        }
    });

    setText("expenseMonthlyTotal", formatCurrency(monthlyTotal));
    setText("expenseMaterialTotal", formatCurrency(materialTotal));
    setText("expenseOtherTotal", formatCurrency(otherTotal));
    setText("reportExpenses", formatCurrency(monthlyTotal));
}

function renderExpenseHistory_() {
    const tableBody = $("expenseHistoryTable");
    if (!tableBody) return;

    const filter = $("expenseHistoryFilter")?.value || "All";
    const expenses = [...googleExpensesCache_]
        .filter((expense) =>
            filter === "All" || expense.expenseType === filter
        )
        .sort((left, right) => {
            const leftDate = new Date(
                left.createdAt || left.expenseDate || 0
            );
            const rightDate = new Date(
                right.createdAt || right.expenseDate || 0
            );
            return rightDate - leftDate;
        });

    if (!expenses.length) {
        tableBody.innerHTML = `
            <tr class="empty-table-row">
                <td colspan="7">No matching expense data is available.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = expenses.map((expense) => {
        const attachmentLink = expense.attachmentUrl
            ? `<a class="expense-bill-link" href="${escapeHTML_(expense.attachmentUrl)}" target="_blank" rel="noopener">View</a>`
            : "—";

        return `
            <tr>
                <td>${escapeHTML_(formatDisplayDate_(expense.expenseDate))}</td>
                <td><span class="expense-type-badge">${escapeHTML_(expense.expenseType)}</span></td>
                <td>${escapeHTML_(expense.payee || "—")}</td>
                <td>${escapeHTML_(expense.supplierBillNumber || "—")}</td>
                <td>${escapeHTML_(expense.paymentMode || "—")}</td>
                <td><strong>${escapeHTML_(formatCurrency(expense.amount || 0))}</strong></td>
                <td>${attachmentLink}</td>
            </tr>
        `;
    }).join("");
}

async function loadExpensesFromGoogleSheets_() {
    if (!isGoogleSheetsConnected_()) {
        googleExpensesCache_ = [];
        renderExpenseHistory_();
        updateExpenseSummary_();
        setText("expenseSyncStatus", "Google Sheets unavailable");
        return;
    }

    try {
        const result = await getFromGoogleSheets_("getExpenses");
        googleExpensesCache_ = Array.isArray(result?.expenses)
            ? result.expenses.map((expense) => ({
                ...expense,
                expenseDate: normalizeExpenseDate_(expense.expenseDate),
                supplierBillDate: normalizeExpenseDate_(
                    expense.supplierBillDate
                )
            }))
            : [];

        renderExpenseHistory_();
        updateExpenseSummary_();
        setText("expenseSyncStatus", "Synced with Google Sheets");
    } catch (error) {
        console.error("Expense load failed:", error);
        setText("expenseSyncStatus", "Expense sync failed");
    }
}

function resetExpenseForm_() {
    $("expenseForm")?.reset();

    if ($("expenseDate")) {
        $("expenseDate").value = localISODate();
    }

    $("materialExpensePanel")?.classList.add("hidden-expense-panel");
    setExpenseMessage_();
}

on($("expenseType"), "change", configureExpenseType_);
on($("materialTaxableAmount"), "input", calculateMaterialBillTotal_);
on($("materialGSTAmount"), "input", calculateMaterialBillTotal_);
on($("materialBillTotal"), "input", syncMaterialTotalToExpense_);
on($("expenseHistoryFilter"), "change", renderExpenseHistory_);
on($("resetExpenseButton"), "click", () => {
    window.setTimeout(resetExpenseForm_, 0);
});

on($("expenseForm"), "submit", async (event) => {
    event.preventDefault();
    setExpenseMessage_();

    const isMaterial = $("expenseType")?.value === "Material Cost";
    const amount = Number($("expenseAmount")?.value) || 0;

    if (amount <= 0) {
        setExpenseMessage_(
            "Please enter an expense amount greater than zero.",
            "error"
        );
        return;
    }

    const saveButton = $("saveExpenseButton");
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        const attachment = isMaterial
            ? await readExpenseAttachment_()
            : null;

        const expense = {
            expenseDate: $("expenseDate")?.value || "",
            expenseType: $("expenseType")?.value || "",
            payee: $("expensePayee")?.value.trim() || "",
            paymentMode: $("expensePaymentMode")?.value || "",
            amount,
            description: $("expenseDescription")?.value.trim() || "",
            supplierBillNumber: isMaterial
                ? $("supplierBillNumber")?.value.trim() || ""
                : "",
            supplierBillDate: isMaterial
                ? $("supplierBillDate")?.value || ""
                : "",
            taxableAmount: isMaterial
                ? Number($("materialTaxableAmount")?.value) || 0
                : 0,
            gstAmount: isMaterial
                ? Number($("materialGSTAmount")?.value) || 0
                : 0,
            materialBillTotal: isMaterial
                ? Number($("materialBillTotal")?.value) || amount
                : 0,
            attachment
        };

        const result = await postToGoogleSheets_({
            action: "saveExpense",
            expense
        });

        setExpenseMessage_(
            result.message || "Expense saved successfully.",
            "success"
        );

        resetExpenseForm_();
        setExpenseMessage_(
            `Expense ${result.expenseId || ""} saved successfully.`,
            "success"
        );

        await Promise.all([
            loadExpensesFromGoogleSheets_(),
            refreshDashboardFromGoogleSheets_()
        ]);
    } catch (error) {
        console.error("Expense save failed:", error);
        setExpenseMessage_(
            error.message || "Expense could not be saved.",
            "error"
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "Save Expense";
        }
    }
});

if ($("expenseDate") && !$("expenseDate").value) {
    $("expenseDate").value = localISODate();
}


function getMonthlyPayments_(payments, currentDate = new Date()) {
    return payments
        .filter((payment) =>
            isDateInCurrentMonth_(payment.paymentDate, currentDate)
        )
        .reduce(
            (sum, payment) => sum + (Number(payment.amount) || 0),
            0
        );
}

function refreshDashboardFromStorage() {
    return refreshAllGoogleSheetsData_();
}

async function refreshDashboardFromGoogleSheets_() {
    if (!isGoogleSheetsConnected_()) {
        return;
    }

    try {
        const result = await getFromGoogleSheets_("getDashboard");

        if (!result) return;

        setText(
            "monthlyEarnings",
            formatCurrency(result.monthlyEarnings || 0)
        );
        setText(
            "totalOutstanding",
            formatCurrency(result.retailerOutstanding || 0)
        );
        setText(
            "monthlyBills",
            String(result.billsThisMonth || 0)
        );

        setText(
            "reportSales",
            formatCurrency(result.monthlyEarnings || 0)
        );
        setText(
            "reportExpenses",
            formatCurrency(result.monthlyExpenses || 0)
        );
        setText(
            "reportNetEarnings",
            formatCurrency(
                (result.monthlyEarnings || 0) -
                (result.monthlyExpenses || 0)
            )
        );
        setText(
            "reportOutstanding",
            formatCurrency(result.retailerOutstanding || 0)
        );
        setText(
            "reportPayments",
            formatCurrency(result.monthlyEarnings || 0)
        );

        if (Array.isArray(result.recentBills)) {
            googleInvoicesCache_ = result.recentBills.map((invoice) => ({
                ...invoice,
                billDate: normalizeSheetDate_(invoice.billDate)
            }));
            renderRecentBills(googleInvoicesCache_);
        }

        if (Array.isArray(result.outstandingRetailers)) {
            const map = {};

            result.outstandingRetailers.forEach((retailer) => {
                map[normalizePartyName_(retailer.partyName)] = {
                    partyName: retailer.partyName,
                    outstandingAmount:
                        Number(retailer.outstandingAmount) || 0
                };
            });

            googleOutstandingMap_ = map;
            renderOutstandingPartiesFromMap_(map);
        }

        setText("ledgerSyncStatus", "Google Sheets connected");
        $("ledgerSyncStatus")?.classList.add("connected-status");
    } catch (error) {
        console.error("Dashboard Google Sheets refresh failed:", error);
        setText("ledgerSyncStatus", "Google Sheets unavailable");
        $("ledgerSyncStatus")?.classList.remove("connected-status");
    }
}

function normalizeSheetDate_(value) {
    if (!value) return "";

    if (typeof value === "string") {
        const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
        if (isoMatch) return isoMatch[0];
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : localISODate(date);
}

async function loadInvoicesFromGoogleSheets_() {
    if (!isGoogleSheetsConnected_()) {
        googleInvoicesCache_ = [];
        return;
    }

    const result = await getFromGoogleSheets_("getInvoices");
    googleInvoicesCache_ = Array.isArray(result?.invoices)
        ? result.invoices.map((invoice) => ({
            ...invoice,
            billDate: normalizeSheetDate_(invoice.billDate)
        }))
        : [];

    populateLedgerPartySuggestions_();
}

async function loadLedgerFromGoogleSheets_() {
    if (!isGoogleSheetsConnected_()) {
        googleLedgerCache_ = [];
        renderLedgerHistory_();
        return;
    }

    const result = await getFromGoogleSheets_("getLedger");
    googleLedgerCache_ = Array.isArray(result?.ledgerEntries)
        ? result.ledgerEntries.map((entry) => ({
            ...entry,
            entryDate: normalizeSheetDate_(entry.entryDate || entry.paymentDate),
            createdAt: entry.createdAt || entry.date || entry.entryDate || entry.paymentDate || ""
        }))
        : [];

    renderLedgerHistory_();
}

async function refreshAllGoogleSheetsData_() {
    if (!isGoogleSheetsConnected_()) {
        setText("ledgerSyncStatus", "Google Sheets unavailable");
        return;
    }

    await Promise.all([
        refreshDashboardFromGoogleSheets_(),
        loadInvoicesFromGoogleSheets_(),
        loadLedgerFromGoogleSheets_(),
        loadPartiesFromGoogleSheets_(),
        loadExpensesFromGoogleSheets_(),
        loadOrdersFromGoogleSheets_()
    ]);

    populateLedgerPartySuggestions_();
    updateLedgerOutstandingPreview_();
}

function renderRecentBills(bills) {
    const tableBody = $("recentBillsTable");
    if (!tableBody) return;

    const recent = [...bills]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

    if (!recent.length) {
        tableBody.innerHTML = `
            <tr class="empty-table-row">
                <td colspan="5">No bill data available yet.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = recent.map((bill) => `
        <tr>
            <td>${bill.billNumber || "—"}</td>
            <td>${bill.retailer?.name || "—"}</td>
            <td>${bill.billDate || "—"}</td>
            <td>${formatCurrency(getBillGrandTotal_(bill))}</td>
            <td>${bill.status || "saved"}</td>
        </tr>
    `).join("");
}

function renderOutstandingPartiesFromMap_(outstandingMap) {
    const container = $("outstandingRetailerList");
    if (!container) return;

    const entries = Object.values(outstandingMap)
        .filter((retailer) => retailer.outstandingAmount > 0)
        .sort(
            (a, b) =>
                b.outstandingAmount - a.outstandingAmount
        )
        .slice(0, 6);

    if (!entries.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>₹</span>
                <p>No retailer outstanding amount is currently recorded.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = entries
        .map(
            (retailer) => `
                <div class="outstanding-party-row">
                    <div>
                        <strong>${escapeHTML_(retailer.partyName)}</strong>
                        <span>Balance remaining after payments</span>
                    </div>
                    <b>${formatCurrency(retailer.outstandingAmount)}</b>
                </div>
            `
        )
        .join("");
}

function renderOutstandingParties(bills) {
    renderOutstandingPartiesFromMap_(
        getRetailerOutstandingMap_(
            bills,
            getLedgerPayments_()
        )
    );
}

/* -------------------------
   Initialization
------------------------- */

async function initializeApplication() {
    getOrdersSectionElements_();
    loadCompanyDetails();
    configureOptionalPartyFields();
    setDefaultBillDates();
    clearGeneratedBillNumber_();
    await generateBillNumber(true);

    if (billItemsBody && !billItemsBody.children.length) {
        addProductRow();
    }

    calculateBillTotals();

    /*
     * Permanently remove old prototype business records from this browser.
     * The sidebar preference is intentionally retained as a UI setting.
     */
    [
        "maxosmithBills",
        "maxosmithLedgerPayments",
        "maxosmithCurrentDraft"
    ].forEach((key) => localStorage.removeItem(key));

    await refreshAllGoogleSheetsData_();

    const initialSection = window.location.hash.replace("#", "");
    if (initialSection && $(initialSection)) {
        openSection(initialSection);
    }
}

void initializeApplication();

/* =========================================================
   Print preparation for compact A5 landscape invoices
========================================================= */

function sanitizeDownloadName_(value) {
    return String(value || "")
        .trim()
        .replace(/[\\/:*?"<>|]+/g, "-")
        .replace(/\s+/g, " ")
        .slice(0, 120);
}

let originalDocumentTitle_ = document.title;

function setInvoiceDownloadTitle_() {
    const data = collectBillData();
    const partyName = sanitizeDownloadName_(
        data.retailer.name || "Party"
    );
    const invoiceNumber = sanitizeDownloadName_(
        data.billNumber || "Invoice"
    );

    /*
     * Browser Print → Save as PDF uses the document title
     * as the suggested filename.
     */
    document.title = `${partyName} - ${invoiceNumber}`;
}

function setPrintHidden(element, shouldHide) {
    if (element) {
        element.classList.toggle("print-empty-hidden", Boolean(shouldHide));
    }
}

function prepareCompactInvoiceForPrint() {
    setInvoiceDownloadTitle_();
    const notes = $("billNotes");
    setPrintHidden($("remarksInputGroup"), !notes || !notes.value.trim());

    const includeDL = Boolean($("includePartyDL")?.checked);
    const includeGST = Boolean($("includePartyGST")?.checked);

    setPrintHidden($("partyDLControl"), !includeDL);
    setPrintHidden($("partyGSTControl"), !includeGST);
    setPrintHidden($("optionalPartyDetailsBox"), !includeDL && !includeGST);

    [
        ["additionalDiscount", "additionalDiscountRow"],
        ["transportCharge", "transportChargeRow"],
        ["roundOffAmount", "roundOffRow"]
    ].forEach(([inputId, rowId]) => {
        const value = Number($(inputId)?.value) || 0;
        setPrintHidden($(rowId), value === 0);
    });

    document.querySelectorAll("#billItemsBody .bill-item-row").forEach((row) => {
        const product = row.querySelector(".item-product")?.value || "";
        const batch = row.querySelector(".item-batch")?.value.trim() || "";
        const quantity = Number(row.querySelector(".item-quantity")?.value) || 0;
        const rate = Number(row.querySelector(".item-rate")?.value) || 0;

        setPrintHidden(row, !product && !batch && quantity <= 0 && rate <= 0);
    });
}

function restoreInvoiceAfterPrint() {
    document.querySelectorAll(".print-empty-hidden").forEach((element) => {
        element.classList.remove("print-empty-hidden");
    });

    document.title = originalDocumentTitle_;
}

window.addEventListener("beforeprint", prepareCompactInvoiceForPrint);
window.addEventListener("afterprint", restoreInvoiceAfterPrint);



/* =========================================================
   LEDGER AND GOOGLE SHEETS INITIALIZATION
========================================================= */

if ($("ledgerPaymentDate") && !$("ledgerPaymentDate").value) {
    $("ledgerPaymentDate").value = localISODate();
}

configureLedgerPaymentMode_();
resetOldLedgerForm_();

if (isGoogleSheetsConnected_()) {
    setText("ledgerSyncStatus", "Connecting...");
} else {
    setText("ledgerSyncStatus", "Google Sheets unavailable");
}
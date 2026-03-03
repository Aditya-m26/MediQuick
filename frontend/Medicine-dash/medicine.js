/* ================================================
   MediQuick – Medicine Detail Page Script
   Fetches from backend API, renders full-width product page
   ================================================ */

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : ''; // On Render: same origin, relative paths

// ── FA icon class per medicine type ────────────────────────────────────────
const TYPE_FA = {
    "tablet": "fa-solid fa-tablets",
    "capsule": "fa-solid fa-capsules",
    "injection": "fa-solid fa-syringe",
    "inhaler": "fa-solid fa-wind",
    "syrup": "fa-solid fa-prescription-bottle-medical",
    "powder": "fa-solid fa-flask",
    "cream": "fa-solid fa-pump-soap",
    "drop": "fa-solid fa-eye-dropper",
};
function getFAIcon(type) {
    return TYPE_FA[(type || "").toLowerCase()] || "fa-solid fa-pills";
}

// ── Gradient per medicine category ───────────────────────────────────────────
function getCategoryGradient(category) {
    const c = (category || "").toLowerCase();
    if (c.includes("analgesic") || c.includes("antipyretic"))
        return "linear-gradient(135deg,#f6d365,#fda085)";
    if (c.includes("antibiotic"))
        return "linear-gradient(135deg,#84fab0,#8fd3f4)";
    if (c.includes("antihistamine"))
        return "linear-gradient(135deg,#a1c4fd,#c2e9fb)";
    if (c.includes("antidiabetic") || c.includes("hormone"))
        return "linear-gradient(135deg,#d299c2,#fef9d7)";
    if (c.includes("antihypertensive") || c.includes("beta") || c.includes("ace") || c.includes("arb"))
        return "linear-gradient(135deg,#43e97b,#38f9d7)";
    if (c.includes("statin") || c.includes("cardiac") || c.includes("antiplatelet") || c.includes("anticoagulant"))
        return "linear-gradient(135deg,#f093fb,#f5576c)";
    if (c.includes("proton") || c.includes("antacid") || c.includes("h2 receptor"))
        return "linear-gradient(135deg,#ffecd2,#fcb69f)";
    if (c.includes("antiepileptic") || c.includes("benzodiazepine"))
        return "linear-gradient(135deg,#a18cd1,#fbc2eb)";
    if (c.includes("antipsychotic") || c.includes("antidepressant") || c.includes("ssri") || c.includes("tricyclic"))
        return "linear-gradient(135deg,#667eea,#764ba2)";
    if (c.includes("antiemetic"))
        return "linear-gradient(135deg,#96fbc4,#f9f586)";
    if (c.includes("bronchodilator") || c.includes("leukotriene"))
        return "linear-gradient(135deg,#89f7fe,#66a6ff)";
    if (c.includes("diuretic"))
        return "linear-gradient(135deg,#a8edea,#fed6e3)";
    if (c.includes("corticosteroid"))
        return "linear-gradient(135deg,#f7ce68,#fbab7e)";
    if (c.includes("antidiarrheal") || c.includes("electrolyte"))
        return "linear-gradient(135deg,#b8f4c8,#9be1fa)";
    if (c.includes("nsaid") || c.includes("opioid"))
        return "linear-gradient(135deg,#fe758f,#fe9d43)";
    // default teal
    return "linear-gradient(135deg,#0ea5b0,#38f9d7)";
}

// ── State ────────────────────────────────────────────────────────────────────
let currentMed = null;
let currentQty = 1;
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();

    const params = new URLSearchParams(window.location.search);
    const name = params.get("name") || "";
    const id = params.get("id") || "";

    if (!name && !id) {
        showError("No medicine specified", "Please go back and search for a medicine.");
        return;
    }

    const reSearch = document.getElementById("reSearchInput");
    if (reSearch && name) reSearch.value = name;

    fetchMedicine(name, id);
});

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchMedicine(name, id) {
    showLoading();

    const token = localStorage.getItem("mq_token");
    if (!token) {
        window.location.href = "../index.html";
        return;
    }

    try {
        const url = id
            ? `${API_BASE}/api/medicines/${encodeURIComponent(id)}`
            : `${API_BASE}/api/medicines/detail?name=${encodeURIComponent(name)}`;

        const res = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (res.status === 404) {
            showError("Medicine not found",
                `We couldn't find "${name}" in our database. Please try a different search.`);
            return;
        }
        if (res.status === 401) {
            localStorage.removeItem("mq_token");
            window.location.href = "../index.html";
            return;
        }
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();
        currentMed = data.medicine;
        renderDetail(currentMed);

    } catch (err) {
        console.error("Fetch error:", err);
        showError("Connection error",
            "Couldn't reach the server. Please make sure the backend is running.");
    }
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderDetail(med) {
    document.title = `${med.name} – MediQuick`;

    // Breadcrumb
    document.getElementById("bcCategory").textContent = med.category;
    document.getElementById("bcName").textContent = med.name;

    // Hero image side – gradient background + FA icon
    const heroSide = document.getElementById("heroImgSide");
    heroSide.style.background = getCategoryGradient(med.category);

    // Set the big medicine FA icon
    const heroIcon = document.getElementById("heroMedIcon");
    heroIcon.className = `hero-med-icon ${getFAIcon(med.type)}`;

    // Also update the form tile icon to match
    const tileFormIcon = document.getElementById("tileFormIcon");
    if (tileFormIcon) tileFormIcon.className = `tile-fa-icon ${getFAIcon(med.type)}`;

    // Pack chip in image area
    const packChip = document.getElementById("heroPackChip");
    if (med.packSize) {
        packChip.textContent = med.packSize;
    } else {
        packChip.style.display = "none";
    }

    // Badges ABOVE the name: Type | Rx
    document.getElementById("badgeType").textContent = med.type;

    const rxBadge = document.getElementById("badgeRx");
    const rxNotice = document.getElementById("rxNotice");
    if (med.prescription) {
        rxBadge.textContent = "Rx Required";
        rxBadge.className = "badge-rx rx-required";
        rxNotice.classList.remove("hidden");
    } else {
        rxBadge.textContent = "No Rx Needed";
        rxBadge.className = "badge-rx rx-ok";
    }

    // Medicine name (clean – no badges on it)
    document.getElementById("detailName").textContent = med.name;
    document.getElementById("detailCategorySub").textContent = med.category;

    // ── Price: show "₹10–₹20" / "10 tablets" ─────────────────────
    // estimatedPrice from DB = "₹10–₹20", packSize = "10 tablets"
    const priceEl = document.getElementById("detailPrice");
    const perEl = document.getElementById("detailPer");

    if (med.estimatedPrice) {
        priceEl.textContent = med.estimatedPrice;
    } else {
        priceEl.textContent = `₹${med.price}`;
    }
    if (med.packSize) {
        perEl.textContent = `/ ${med.packSize}`;
    } else {
        perEl.textContent = "/ strip";
    }

    // Stock badge
    const stockBadge = document.getElementById("detailStockBadge");
    if (med.inStock === false) {
        stockBadge.textContent = "✕ Out of Stock";
        stockBadge.className = "stock-badge out-of-stock";
        const btn = document.getElementById("addCartBtn");
        btn.disabled = true;
    } else {
        stockBadge.textContent = "✓ In Stock";
    }

    // Description
    document.getElementById("detailDesc").textContent =
        med.description || "No description available.";

    // Info tiles
    document.getElementById("infoCategory").textContent = med.category;
    document.getElementById("infoComposition").textContent = med.type;
    // The tileFormIcon is updated above

    // Pack size tile
    if (med.packSize) {
        document.getElementById("infoPackSize").textContent = med.packSize;
    } else {
        document.getElementById("tilePackSize").style.display = "none";
    }

    // Rx tile
    const rxTileIcon = document.getElementById("tileRxIcon");
    const rxTileVal = document.getElementById("tileRxVal");
    if (med.prescription) {
        if (rxTileIcon) rxTileIcon.className = "tile-fa-icon fa-solid fa-file-prescription";
        rxTileVal.textContent = "Required";
        rxTileVal.style.color = "#b91c1c";
    } else {
        if (rxTileIcon) rxTileIcon.className = "tile-fa-icon fa-solid fa-circle-check";
        rxTileVal.textContent = "Not Required";
        rxTileVal.style.color = "#065f46";
    }

    // Manufacturer tile (optional)
    if (med.manufacturer) {
        document.getElementById("infoManufacturer").textContent = med.manufacturer;
        document.getElementById("tileManufacturer").style.display = "";
    }

    // Side effects (optional)
    if (med.sideEffects) {
        document.getElementById("detailSideEffects").textContent = med.sideEffects;
        document.getElementById("sectionSideEffects").classList.remove("hidden");
    }

    showDetail();
}

// ── States ───────────────────────────────────────────────────────────────────
function showLoading() {
    document.getElementById("stateLoading").style.display = "flex";
    document.getElementById("stateError").classList.add("hidden");
    document.getElementById("medDetail").classList.add("hidden");
}
function showError(title, msg) {
    document.getElementById("stateLoading").style.display = "none";
    document.getElementById("errorTitle").textContent = title;
    document.getElementById("errorMsg").textContent = msg;
    document.getElementById("stateError").classList.remove("hidden");
    document.getElementById("medDetail").classList.add("hidden");
}
function showDetail() {
    document.getElementById("stateLoading").style.display = "none";
    document.getElementById("stateError").classList.add("hidden");
    document.getElementById("medDetail").classList.remove("hidden");
}

// ── Quantity ─────────────────────────────────────────────────────────────────
function changeQty(delta) {
    currentQty = Math.max(1, Math.min(99, currentQty + delta));
    document.getElementById("qtyVal").textContent = currentQty;
}

// ── Add to Cart ──────────────────────────────────────────────────────────────
function addToCart() {
    if (!currentMed) return;

    const existing = cart.find(i => i.id === String(currentMed._id));
    if (existing) {
        existing.qty = Math.min(99, existing.qty + currentQty);
    } else {
        cart.push({
            id: String(currentMed._id),
            name: currentMed.name,
            price: currentMed.price,
            qty: currentQty,
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    showToast(`${currentMed.name} ×${currentQty} added to cart!`);
}

function updateCartBadge() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = total > 0 ? total : "";
}

// ── Re-search ────────────────────────────────────────────────────────────────
function doReSearch() {
    const q = (document.getElementById("reSearchInput").value || "").trim();
    if (!q) return;
    window.location.href = `medicine.html?name=${encodeURIComponent(q)}`;
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarOverlay").classList.toggle("active");
}

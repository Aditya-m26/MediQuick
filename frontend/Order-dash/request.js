// ─── CONFIG ──────────────────────────────────────────
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : '';  // On Render: same origin, so just use relative paths like /api/...

// ─── SIDEBAR ─────────────────────────────────────────
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("active");
}

// ─── CART COUNT ───────────────────────────────────────
function updateCartCount() {
  var cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  var total = 0;
  for (var i = 0; i < cartItems.length; i++) {
    total += cartItems[i].qty;
  }
  document.getElementById("cartCount").textContent = total;
}

// ─── SEARCH → REDIRECT ────────────────────────────────
// Called when user presses Enter or clicks the search icon
function doSearch() {
  var q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  // Redirect to medicine detail page passing the name as query param
  window.location.href =
    "../Medicine-dash/medicine.html?name=" + encodeURIComponent(q);
}

// ─── LIVE SUGGESTIONS (autocomplete from backend) ─────
var suggestTimeout;

function onSearchInput(val) {
  clearTimeout(suggestTimeout);
  var box = document.getElementById("suggestionsBox");
  if (!box) return;
  if (!val || val.trim().length < 2) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }
  suggestTimeout = setTimeout(function () {
    fetchSuggestions(val.trim());
  }, 280);
}

function fetchSuggestions(q) {
  var token = localStorage.getItem("mq_token");
  if (!token) return; // not logged in – skip suggestions silently

  fetch(API_BASE + "/api/medicines/search?name=" + encodeURIComponent(q), {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderSuggestions(data.medicines || []);
    })
    .catch(function () {
      // silently ignore network errors in autocomplete
    });
}

function renderSuggestions(medicines) {
  var box = document.getElementById("suggestionsBox");
  if (!box) return;
  if (!medicines.length) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }
  box.innerHTML = medicines
    .map(function (m) {
      return (
        '<div class="suggestion-row" onclick="pickSuggestion(' +
        "'" + m.name.replace(/'/g, "\\'") + "'" +
        ')">' +
        '<span class="sug-name">' + m.name + "</span>" +
        '<span class="sug-cat">' + m.category + " · " + m.type + "</span>" +
        "</div>"
      );
    })
    .join("");
  box.style.display = "block";
}

function pickSuggestion(name) {
  document.getElementById("searchInput").value = name;
  var box = document.getElementById("suggestionsBox");
  if (box) { box.style.display = "none"; box.innerHTML = ""; }
  doSearch();
}

// Close suggestions when clicking outside
document.addEventListener("click", function (e) {
  var box = document.getElementById("suggestionsBox");
  if (box && !e.target.closest(".search-wrap") && !e.target.closest("#suggestionsBox")) {
    box.style.display = "none";
    box.innerHTML = "";
  }
});

// ─── INIT ─────────────────────────────────────────────
updateCartCount();


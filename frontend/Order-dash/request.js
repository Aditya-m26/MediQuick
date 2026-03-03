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
loadStores();

// ─── STORES (fetched from backend, sorted by GPS distance) ───────────────────
function loadStores() {
  var token = localStorage.getItem('mq_token');
  if (!token) return;

  // Try to get user GPS position first, then fetch stores
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        fetchStores(pos.coords.latitude, pos.coords.longitude, token);
      },
      function () {
        // User denied / unavailable — fetch without location (no distance sorting)
        fetchStores(null, null, token);
      },
      { timeout: 5000 }
    );
  } else {
    fetchStores(null, null, token);
  }
}

function fetchStores(lat, lng, token) {
  var url = API_BASE + '/api/stores';
  if (lat !== null && lng !== null) {
    url += '?lat=' + lat + '&lng=' + lng;
  }

  fetch(url, { headers: { Authorization: 'Bearer ' + token } })
    .then(function (r) { return r.json(); })
    .then(function (data) { renderStores(data.stores || []); })
    .catch(function () {
      var grid = document.getElementById('pharmacyGrid');
      if (grid) grid.innerHTML = '<p style="color:#888;padding:20px;">Could not load stores.</p>';
    });
}

function renderStores(stores) {
  var grid = document.getElementById('pharmacyGrid');
  if (!grid) return;

  if (!stores.length) {
    grid.innerHTML = '<p style="color:#888;padding:20px;">No stores found.</p>';
    return;
  }

  grid.innerHTML = stores.map(function (s) {
    var isOpen = s.isOpen;
    var badge = isOpen
      ? '<span class="store-open-badge">Open</span>'
      : '<span class="store-closed-badge">Closed</span>';

    // Photo: use real image if available, else show icon placeholder
    var imgHtml = s.photo
      ? '<img src="' + s.photo + '" alt="' + s.storeName + '" class="store-photo" loading="lazy">'
      : '<div class="store-img-placeholder"><i class="fa-solid fa-capsules"></i></div>';

    var distHtml = s.distanceKm !== null
      ? '<p class="store-distance"><i class="fa-solid fa-location-dot"></i> ' + s.distanceKm + ' km away</p>'
      : '<p class="store-distance"><i class="fa-solid fa-location-dot"></i> ' + s.city + '</p>';

    var hoursHtml = isOpen
      ? '<p class="store-hours"><i class="fa-regular fa-clock"></i> Closes ' + (s.closingTime || s.timings) + '</p>'
      : '<p class="store-hours"><i class="fa-regular fa-clock"></i> ' + (s.timings || 'See store for hours') + '</p>';

    var deliveryHtml = isOpen
      ? '<div class="store-delivery"><i class="fa-solid fa-circle-check"></i> ' + s.delivery + ' delivery</div>'
      : '<div class="store-delivery store-delivery-inactive"><i class="fa-solid fa-ban"></i> Currently Closed</div>';

    var starsHtml = '';
    var rating = parseFloat(s.rating) || 0;
    for (var i = 0; i < 5; i++) {
      starsHtml += '<i class="fa-solid fa-star' + (i < Math.round(rating) ? '' : ' star-empty') + '"></i>';
    }

    return (
      '<div class="store-card' + (isOpen ? '' : ' store-card-closed') + '">' +
      '<div class="store-img-wrap">' +
      imgHtml +
      badge +
      '</div>' +
      '<div class="store-info' + (isOpen ? '' : ' store-info-closed') + '">' +
      '<h3 class="store-name">' + s.storeName + '</h3>' +
      '<p class="store-rating">' + starsHtml + ' ' + rating.toFixed(1) +
      ' <span class="review-count">(' + (s.reviews || 0) + ' reviews)</span></p>' +
      distHtml +
      hoursHtml +
      deliveryHtml +
      '</div>' +
      '</div>'
    );
  }).join('');
}

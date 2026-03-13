// ===================================================
//  MediQuick – cart-ui.js  (Rendering + API Layer)
//  Fetches real pharmacies from the backend, renders
//  the cart page and handles all interactions.
// ===================================================

/* ──── API base (localhost:5000 or same-origin on Render) ──── */
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : '';

/* ──── State ──── */
let selectedDeliveryMode = 'standard';
let deliveryFee = 10;
let uploadedPrescription = null;
let selectedPharmacy = null;
let allPharmacies = [];  // raw from backend

/* ════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

/* ════════════════════════════════════════════════════
   CART BADGE (header count)
══════════════════════════════════════════════════════ */
function updateCartBadge() {
  var total = cart.reduce(function (a, it) { return a + it.qty; }, 0);
  var badge = document.getElementById('cartCount');
  if (badge) badge.textContent = total;
}

/* ════════════════════════════════════════════════════
   RENDER CART
   Decides what to show/hide based on cart length.
══════════════════════════════════════════════════════ */
function renderCart() {
  var isEmpty = (cart.length === 0);

  document.getElementById('emptyCart').style.display = isEmpty ? 'flex' : 'none';
  document.getElementById('cartContent').style.display = isEmpty ? 'none' : 'flex';

  var pharmacyPanel = document.getElementById('pharmacyPanel');
  if (pharmacyPanel) pharmacyPanel.style.display = isEmpty ? 'none' : 'flex';

  if (isEmpty) return;

  renderMedicineList();
  checkPrescription();
  updateOverview();
}

/* ════════════════════════════════════════════════════
   MEDICINE LIST
══════════════════════════════════════════════════════ */
function renderMedicineList() {
  var listEl = document.getElementById('cartList');
  if (!listEl) return;
  listEl.innerHTML = '';

  cart.forEach(function (item) {
    var typeIcon = getMedIcon(item.type);
    var rxBadge = item.requiresPrescription
      ? '<span class="rx-badge"><i class="fa-solid fa-prescription"></i> Rx</span>'
      : '';
    // URL to the medicine detail page (same pattern as request.js doSearch)
    var detailUrl = '../Medicine-dash/medicine.html?name=' + encodeURIComponent(item.name);

    var row = document.createElement('div');
    row.className = 'medicine-row';
    row.innerHTML = `
      <div class="med-left">
        <div class="med-icon">
          <i class="${typeIcon}"></i>
        </div>
        <div class="med-info">
          <a class="med-name med-name-link" href="${detailUrl}">${item.name}</a>
          <div class="med-meta-row">
            <span class="med-meta">${item.type || 'Medicine'}${item.category ? ' &middot; ' + item.category : ''}</span>
            ${rxBadge}
          </div>
          <div class="med-price-row">
            <span class="med-price">&#8377;${item.price} / strip</span>
            <a class="view-details-link" href="${detailUrl}">
              <i class="fa-solid fa-circle-info"></i> View Details
            </a>
          </div>
        </div>
      </div>
      <div class="med-right">
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)" title="Decrease">&#8722;</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)" title="Increase">&#43;</button>
        </div>
        <button class="remove-btn" onclick="deleteItem('${item.id}')" title="Remove">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    listEl.appendChild(row);
  });
}

/* Pick the right FA icon based on medicine type */
function getMedIcon(type) {
  if (!type) return 'fa-solid fa-pills';
  var t = type.toLowerCase();
  if (t.includes('inject')) return 'fa-solid fa-syringe';
  if (t.includes('syrup') || t.includes('liquid')) return 'fa-solid fa-bottle-droplet';
  if (t.includes('capsule')) return 'fa-solid fa-capsules';
  if (t.includes('cream') || t.includes('gel')) return 'fa-solid fa-pump-soap';
  return 'fa-solid fa-pills';
}

/* ════════════════════════════════════════════════════
   QTY CONTROLS & REMOVE
══════════════════════════════════════════════════════ */
function changeQty(id, delta) {
  updateQty(id, delta);
  renderCart();
  updateCartBadge();
  refreshPharmacyList(); // re-evaluate stock availability
}

function deleteItem(id) {
  removeFromCart(id);
  renderCart();
  updateCartBadge();
  refreshPharmacyList();
}

/* ════════════════════════════════════════════════════
   DELIVERY MODE
══════════════════════════════════════════════════════ */
function handleDeliveryChange() {
  var radios = document.getElementsByName('deliveryMode');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      selectedDeliveryMode = radios[i].value;
      break;
    }
  }
  deliveryFee = (selectedDeliveryMode === 'emergency') ? 40 : 10;
  updateOverview();
}

/* ════════════════════════════════════════════════════
   PRESCRIPTION
══════════════════════════════════════════════════════ */
function checkPrescription() {
  var rxCount = getPrescriptionCount();
  var card = document.getElementById('prescriptionCard');
  if (!card) return;

  if (rxCount > 0) {
    document.getElementById('rxCount').textContent = rxCount;
    card.style.display = 'flex';
  } else {
    card.style.display = 'none';
    uploadedPrescription = null;
  }
}

/* Opens file dialog when the upload zone is clicked */
function openPrescriptionFileDialog() {
  document.getElementById('rxFileInput').click();
}

function handlePrescriptionUpload(e) {
  var file = e.target.files[0];
  if (!file) return;

  // Accept only JPG and PNG
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    showToast('Please select a JPG or PNG image.', true);
    // reset so user can pick again
    e.target.value = '';
    return;
  }

  uploadedPrescription = file;

  var reader = new FileReader();
  reader.onload = function (ev) {
    var preview = document.getElementById('rxPreview');
    var placeholder = document.getElementById('uploadPlaceholder');
    var zone = document.getElementById('uploadZone');

    if (preview) {
      preview.src = ev.target.result;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';

    // Show success hint on zone
    if (zone) {
      zone.style.borderColor = '#0ea5b0';
      zone.style.background = '#f0fbfc';
    }

    updateOverview();
    showToast('Prescription uploaded successfully.');
  };
  reader.onerror = function () {
    showToast('Could not read the file. Please try again.', true);
  };
  reader.readAsDataURL(file);
}

/* ════════════════════════════════════════════════════
   LOAD PHARMACIES FROM BACKEND
══════════════════════════════════════════════════════ */
function loadPharmacies() {
  var token = localStorage.getItem('mq_token');
  if (!token) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        fetchPharmacies(pos.coords.latitude, pos.coords.longitude, token);
      },
      function () {
        // User denied GPS, still fetch without location
        fetchPharmacies(null, null, token);
      },
      { timeout: 6000 }
    );
  } else {
    fetchPharmacies(null, null, token);
  }
}

function fetchPharmacies(lat, lng, token) {
  var url = API_BASE + '/api/stores';
  var params = [];
  if (lat !== null && lng !== null) {
    params.push('lat=' + lat);
    params.push('lng=' + lng);
  }
  var pincode = localStorage.getItem('mq_pincode');
  if (pincode) {
    params.push('pincode=' + pincode);
  }
  if (params.length) {
    url += '?' + params.join('&');
  }

  fetch(url, { headers: { Authorization: 'Bearer ' + token } })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allPharmacies = data.stores || [];
      // Clear skeleton
      var list = document.getElementById('pharmacyList');
      if (list) list.innerHTML = '';
      refreshPharmacyList();
      if (localStorage.getItem('mq_emergency_mode') === '1' && typeof applyEmergencyMode === 'function') {
        applyEmergencyMode();
      }
    })
    .catch(function (err) {
      console.error('Failed to load pharmacies:', err);
    });
}

/* ════════════════════════════════════════════════════
   REFRESH PHARMACY LIST (re-sort + re-render)
══════════════════════════════════════════════════════ */
function refreshPharmacyList() {
  if (cart.length === 0 || allPharmacies.length === 0) return;

  // Build augmented list with availability info
  var augmented = allPharmacies.map(function (p) {
    var avail = computeAvailability(p);
    return Object.assign({}, p, avail);
  });

  // Sort: full stock first, then by distance
  augmented.sort(function (a, b) {
    if (a.allAvailable && !b.allAvailable) return -1;
    if (!a.allAvailable && b.allAvailable) return 1;
    return (a.distanceKm || 999) - (b.distanceKm || 999);
  });

  // Auto-select first if none selected or previously selected not in new list
  if (!selectedPharmacy || !augmented.find(function (p) { return p._id === selectedPharmacy._id; })) {
    selectedPharmacy = augmented[0];
  }

  renderPharmacyList(augmented);
  updateOverview();
}

/* Work out how many cart medicines a pharmacy likely has.
   Since the backend store schema doesn't expose per-item stock,
   we use a deterministic pseudo-random from the store's _id to
   simulate partial availability — easily swappable when inventory
   API is added. */
function computeAvailability(pharmacy) {
  var cartSize = cart.length;
  if (cartSize === 0) {
    return { availableCount: 0, allAvailable: true, colorClass: 'green' };
  }

  // Use last char of _id as seed for consistent but varied results per store
  var idSeed = pharmacy._id ? pharmacy._id.charCodeAt(pharmacy._id.length - 1) : 0;
  var availableCount = cartSize;
  var mod = (idSeed + cartSize) % 3;
  if (mod === 1 && cartSize > 1) availableCount = cartSize - 1;
  if (mod === 2 && cartSize > 2) availableCount = cartSize - 2;

  var allAvailable = availableCount >= cartSize;
  var noneAvailable = availableCount === 0;

  var colorClass = allAvailable ? 'green' : noneAvailable ? 'red' : 'yellow';

  var text;
  if (allAvailable) {
    text = 'All ' + cartSize + ' medicine' + (cartSize > 1 ? 's' : '') + ' available';
  } else {
    text = availableCount + ' of ' + cartSize + ' available';
  }

  return { availableCount: availableCount, allAvailable: allAvailable, colorClass: colorClass, availText: text };
}

/* ════════════════════════════════════════════════════
   RENDER PHARMACY CARDS
══════════════════════════════════════════════════════ */
function renderPharmacyList(pharmacies) {
  var listEl = document.getElementById('pharmacyList');
  if (!listEl) return;
  listEl.innerHTML = '';

  var isEmergencyMode = selectedDeliveryMode === 'emergency';
  var storeDetailBase = 'store-detail.html';

  pharmacies.forEach(function (p) {
    var isSelected = selectedPharmacy && selectedPharmacy._id === p._id;
    var card = document.createElement('div');
    card.className = 'pharm-card' + (isSelected ? ' selected' : '') + (isEmergencyMode ? ' emergency-on' : '');
    card.onclick = function (e) {
      if (e.target.closest('.pharm-view-details-btn') || e.target.closest('.pharm-ask-alternatives')) return;
      selectPharmacy(p, pharmacies);
    };

    // Image or icon
    var imgContent = p.photo
      ? '<img src="' + p.photo + '" alt="' + p.storeName + '">'
      : '<i class="fa-solid fa-store-alt"></i>';

    // Open/Closed badge
    var statusBadge = p.isOpen
      ? '<span class="pharm-open-badge">Open</span>'
      : '<span class="pharm-closed-badge">Closed</span>';

    // Distance
    var distText = p.distanceKm !== null && p.distanceKm !== undefined
      ? p.distanceKm + ' km'
      : p.city || '';

    // Delivery time from distance (min 15 for standard, ~10 for emergency)
    var deliveryLabel = getDeliveryTimeFromDistance(p.distanceKm, isEmergencyMode);

    // Rating stars
    var rating = parseFloat(p.rating) || 0;
    var starsHtml = '';
    for (var i = 0; i < 5; i++) {
      starsHtml += '<i class="fa-' + (i < Math.round(rating) ? 'solid' : 'regular') + ' fa-star" style="color:#f59e0b;font-size:11px;"></i>';
    }

    var storeDetailUrl = storeDetailBase + '?id=' + encodeURIComponent(p._id);
    var viewDetailsBtn = '<a href="' + storeDetailUrl + '" class="pharm-view-details-btn" onclick="event.stopPropagation()" title="View store details"><i class="fa-solid fa-circle-info"></i> View Details</a>';

    var askAlternativesHtml = '';
    if (!p.allAvailable) {
      askAlternativesHtml = '<a href="' + storeDetailUrl + '" class="pharm-ask-alternatives" onclick="event.stopPropagation()"><i class="fa-solid fa-comments"></i> Chat / Ask for alternatives</a>';
    }

    card.innerHTML = `
      <div class="pharm-img-wrap">
        ${imgContent}
        ${statusBadge}
        <div class="pharm-selected-tick"><i class="fa-solid fa-check"></i></div>
      </div>
      <div class="pharm-info">
        <div class="pharm-header-row">
          <div class="pharm-name">${p.storeName}</div>
          ${viewDetailsBtn}
        </div>
        <div class="pharm-meta-row">
          ${starsHtml} <span>${rating.toFixed(1)}</span>
          <span style="color:#cde8eb">|</span>
          <i class="fa-solid fa-location-dot"></i>
          <span>${distText}</span>
        </div>
        <div class="pharm-delivery-tag">
          <i class="fa-solid fa-truck"></i> ${deliveryLabel} delivery
        </div>
        <div class="avail-row">
          <div class="avail-dot ${p.colorClass}"></div>
          <span class="avail-text ${p.colorClass}">${p.availText || ''}</span>
        </div>
        ${askAlternativesHtml}
      </div>
    `;

    listEl.appendChild(card);
  });
}

function selectPharmacy(pharmacy, allList) {
  selectedPharmacy = pharmacy;
  renderPharmacyList(allList.map(function (p) {
    var avail = computeAvailability(p);
    return Object.assign({}, p, avail);
  }).sort(function (a, b) {
    if (a.allAvailable && !b.allAvailable) return -1;
    if (!a.allAvailable && b.allAvailable) return 1;
    return (a.distanceKm || 999) - (b.distanceKm || 999);
  }));
  updateOverview();
}

/* Delivery time from distance (min 15 min for standard). Emergency uses ~10 min. */
function getDeliveryTimeFromDistance(distanceKm, isEmergency) {
  if (isEmergency) return '~10 min';
  if (distanceKm === null || distanceKm === undefined) return '20&#8211;30 min';
  var d = parseFloat(distanceKm);
  if (isNaN(d)) return '20&#8211;30 min';
  if (d <= 1) return '15&#8211;18 min';
  if (d <= 2) return '15&#8211;20 min';
  if (d <= 4) return '18&#8211;24 min';
  if (d <= 7) return '22&#8211;28 min';
  if (d <= 10) return '25&#8211;32 min';
  return '28&#8211;35 min';
}

/* ════════════════════════════════════════════════════
   ORDER OVERVIEW
══════════════════════════════════════════════════════ */
function updateOverview() {
  var subtotal = getSubtotal();
  var total = subtotal + deliveryFee;

  // Pharmacy info
  if (selectedPharmacy) {
    document.getElementById('ovPharmacyName').textContent = selectedPharmacy.storeName;
    var distText = selectedPharmacy.distanceKm !== null
      ? selectedPharmacy.distanceKm + ' km away'
      : (selectedPharmacy.city || '');
    document.getElementById('ovPharmacyMeta').textContent = distText;
  }

  document.getElementById('ovSubtotal').textContent = '\u20B9' + subtotal;
  document.getElementById('ovDelivery').textContent = '\u20B9' + deliveryFee;
  document.getElementById('ovTotal').textContent = '\u20B9' + total;
}

/* ════════════════════════════════════════════════════
   PLACE ORDER
══════════════════════════════════════════════════════ */
function placeOrder() {
  if (cart.length === 0) {
    showToast('Your cart is empty.', true);
    return;
  }
  if (!selectedPharmacy) {
    showToast('Please select a pharmacy first.', true);
    return;
  }
  if (getPrescriptionCount() > 0 && !uploadedPrescription) {
    showToast('Please upload the required prescription.', true);
    return;
  }

  // Disable button to prevent double-click
  var btn = document.getElementById('placeOrderBtn');
  if (btn) btn.disabled = true;

  showToast('Order placed! Pharmacy is confirming your order.');

  setTimeout(function () {
    cart = [];
    saveCart();
    uploadedPrescription = null;
    selectedPharmacy = null;
    renderCart();
    updateCartBadge();
    if (btn) btn.disabled = false;
  }, 3000);
}

/* ════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
function showToast(msg, isError) {
  var toast = document.getElementById('toast');
  var msgEl = document.getElementById('toastMsg');
  var iconEl = toast.querySelector('i');

  msgEl.textContent = msg;
  if (isError) {
    toast.style.background = '#e53e3e';
    iconEl.className = 'fa-solid fa-circle-exclamation';
  } else {
    toast.style.background = '#1a2332';
    iconEl.className = 'fa-solid fa-circle-check';
    iconEl.style.color = '#48bb78';
  }

  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3500);
}

/* ════════════════════════════════════════════════════
   EMERGENCY MODE (cart)
   Auto-select emergency delivery + nearest full-stock pharmacy.
══════════════════════════════════════════════════════ */
function applyEmergencyMode() {
  selectedDeliveryMode = 'emergency';
  deliveryFee = 40;

  var optEmergency = document.getElementById('optEmergency');
  var optStandard = document.getElementById('optStandard');
  if (optEmergency && optEmergency.querySelector('input')) {
    optEmergency.querySelector('input').checked = true;
  }
  if (optStandard && optStandard.querySelector('input')) {
    optStandard.querySelector('input').checked = false;
  }

  var toggle = document.getElementById('emergencyToggle');
  var label = document.getElementById('emergencyLabel');
  var banner = document.getElementById('emergencyBanner');
  if (toggle) { toggle.classList.add('active'); if (label) label.textContent = 'Emergency ON'; }
  if (banner) banner.classList.remove('hidden');
  document.body.classList.add('emergency-on');

  refreshPharmacyList();
  updateOverview();
}

function clearEmergencyMode() {
  selectedDeliveryMode = 'standard';
  deliveryFee = 10;
  localStorage.removeItem('mq_emergency_mode');

  var optStandard = document.getElementById('optStandard');
  var optEmergency = document.getElementById('optEmergency');
  if (optStandard && optStandard.querySelector('input')) optStandard.querySelector('input').checked = true;
  if (optEmergency && optEmergency.querySelector('input')) optEmergency.querySelector('input').checked = false;

  var toggle = document.getElementById('emergencyToggle');
  var label = document.getElementById('emergencyLabel');
  var banner = document.getElementById('emergencyBanner');
  if (toggle) toggle.classList.remove('active');
  if (label) label.textContent = 'Emergency';
  if (banner) banner.classList.add('hidden');
  document.body.classList.remove('emergency-on');

  refreshPharmacyList();
  updateOverview();
}

function toggleCartEmergency() {
  if (localStorage.getItem('mq_emergency_mode') === '1') {
    clearEmergencyMode();
  } else {
    localStorage.setItem('mq_emergency_mode', '1');
    applyEmergencyMode();
  }
}

/* ════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
renderCart();
updateCartBadge();
loadPharmacies();

// Apply emergency mode if user came from request page with Emergency ON
if (localStorage.getItem('mq_emergency_mode') === '1') {
  applyEmergencyMode();
}

/* =====================================================
   MediQuick – store.js
   Store Manager Dashboard Logic (Redesigned)
   ===================================================== */

/* =====================================================
   SEED DATA – Stock
   ===================================================== */
let stockItems = [
    { id: 1, name: 'Paracetamol 500mg', qty: 80, price: 18 },
    { id: 2, name: 'Amoxicillin 250mg', qty: 45, price: 55 },
    { id: 3, name: 'Cetirizine 10mg', qty: 12, price: 22 },
    { id: 4, name: 'Pantoprazole 40mg', qty: 60, price: 38 },
    { id: 5, name: 'Azithromycin 500mg', qty: 5, price: 70 },
    { id: 6, name: 'Metformin 500mg', qty: 90, price: 14 },
    { id: 7, name: 'Atorvastatin 10mg', qty: 30, price: 42 },
    { id: 8, name: 'Dolo 650', qty: 3, price: 30 },
    { id: 9, name: 'Vitamin D3 60K', qty: 20, price: 95 },
    { id: 10, name: 'Ibuprofen 400mg', qty: 55, price: 25 },
    { id: 11, name: 'Omeprazole 20mg', qty: 40, price: 32 },
    { id: 12, name: 'Salbutamol Inhaler', qty: 8, price: 160 },
];

/* =====================================================
   SEED DATA – Simulated incoming orders
   ===================================================== */
const ORDER_NAMES = ['Rahul Sharma', 'Priya Mehta', 'Suresh Patil', 'Anita Raut', 'Vijay Desai'];
const ORDER_AREAS = ['Ramdaspeth', 'Jatharpeth', 'Civil Lines', 'Gandhi Nagar', 'Tapovan'];
const MEDICINE_SETS = [
    'Paracetamol 500mg × 2, Dolo 650 × 1',
    'Azithromycin 500mg × 1, Cetirizine 10mg × 1',
    'Metformin 500mg × 3, Pantoprazole 40mg × 1',
    'Vitamin D3 60K × 2, Atorvastatin 10mg × 1',
    'Salbutamol Inhaler × 1, Ibuprofen 400mg × 2',
];

let orderCounter = 1;
let pendingCount = 0;
let acceptedCount = 0;
let deliveredCount = 0;
let totalRevenue = 0;
let isStoreOpen = true;
let currentStockFilter = 'all';

/* =====================================================
   INIT
   ===================================================== */
window.addEventListener('DOMContentLoaded', function () {
    renderStockList(stockItems);
    updateStats();
    updateStockSummary();

    // First order arrives after 2 seconds
    setTimeout(spawnOrder, 2000);
});

/* =====================================================
   SIDEBAR NAVIGATION
   ===================================================== */
function switchPage(pageId, el) {
    if (el) el.preventDefault && el.preventDefault();

    // Hide all page sections
    var pages = document.querySelectorAll('.page-section');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }

    // Show selected page
    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // Update sidebar active state
    var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
    }
    if (el) el.classList.add('active');

    // Close sidebar on mobile
    closeSidebarMobile();

    return false;
}

/* =====================================================
   SIDEBAR TOGGLE (mobile)
   ===================================================== */
function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebarMobile() {
    if (window.innerWidth <= 1024) {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

/* =====================================================
   STORE OPEN / CLOSED TOGGLE
   ===================================================== */
function toggleStoreStatus() {
    isStoreOpen = document.getElementById('storeToggle').checked;
    var label = document.getElementById('statusLabel');
    var wrap = label.parentElement;
    label.textContent = isStoreOpen ? 'Store Open' : 'Store Closed';
    label.classList.toggle('closed', !isStoreOpen);
    wrap.classList.toggle('is-closed', !isStoreOpen);
}

/* =====================================================
   STOCK RENDERING
   ===================================================== */
function renderStockList(items) {
    var list = document.getElementById('stockList');
    if (items.length === 0) {
        list.innerHTML = '<div class="orders-empty"><i class="fa-solid fa-capsules"></i><p>No stock items found</p></div>';
        return;
    }

    list.innerHTML = items.map(function (item) {
        var isLow = item.qty <= 10;
        return '<div class="stock-item ' + (isLow ? 'low-stock' : '') + '" id="stock-' + item.id + '">' +
            '<div class="stock-item-info">' +
            '<p class="stock-item-name">' + item.name +
            (isLow ? ' <span class="low-stock-badge">Low Stock</span>' : '') +
            '</p>' +
            '<p class="stock-item-price">₹' + item.price + ' per unit</p>' +
            '</div>' +
            '<div class="stock-qty-wrap">' +
            '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)">−</button>' +
            '<span class="stock-qty ' + (isLow ? 'qty-low' : '') + '" id="qty-' + item.id + '">' + item.qty + '</span>' +
            '<button class="qty-btn" onclick="changeQty(' + item.id + ', +1)">+</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

/* =====================================================
   STOCK SUMMARY
   ===================================================== */
function updateStockSummary() {
    var totalEl = document.getElementById('totalItemsCount');
    var lowEl = document.getElementById('lowStockCount');
    var valueEl = document.getElementById('stockValue');

    if (!totalEl) return;

    var lowCount = 0;
    var totalValue = 0;
    for (var i = 0; i < stockItems.length; i++) {
        if (stockItems[i].qty <= 10) lowCount++;
        totalValue += stockItems[i].qty * stockItems[i].price;
    }

    totalEl.textContent = stockItems.length;
    lowEl.textContent = lowCount;
    valueEl.textContent = '₹' + totalValue.toLocaleString('en-IN');
}

/* =====================================================
   QTY CHANGE
   ===================================================== */
function changeQty(id, delta) {
    var item = stockItems.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);

    // Re-render this card
    var card = document.getElementById('stock-' + id);
    var qtyEl = document.getElementById('qty-' + id);
    var isLow = item.qty <= 10;

    qtyEl.textContent = item.qty;
    qtyEl.classList.toggle('qty-low', isLow);
    card.classList.toggle('low-stock', isLow);

    // Update low-stock badge
    var nameEl = card.querySelector('.stock-item-name');
    var badge = nameEl.querySelector('.low-stock-badge');
    if (isLow && !badge) {
        nameEl.insertAdjacentHTML('beforeend', ' <span class="low-stock-badge">Low Stock</span>');
    } else if (!isLow && badge) {
        badge.remove();
    }

    updateStockSummary();
}

/* =====================================================
   STOCK SEARCH
   ===================================================== */
function filterStock() {
    var query = document.getElementById('stockSearchInput').value.toLowerCase();
    var filtered = stockItems.filter(function (item) {
        var matchName = item.name.toLowerCase().includes(query);
        if (currentStockFilter === 'low') return matchName && item.qty <= 10;
        if (currentStockFilter === 'ok') return matchName && item.qty > 10;
        return matchName;
    });
    renderStockList(filtered);
}

/* =====================================================
   STOCK FILTER BY STATUS
   ===================================================== */
function filterStockByStatus(status, el) {
    currentStockFilter = status;

    // Update chip active state
    var chips = document.querySelectorAll('.stock-chip');
    for (var i = 0; i < chips.length; i++) {
        chips[i].classList.remove('active');
    }
    if (el) el.classList.add('active');

    filterStock();
}

/* =====================================================
   ADD NEW STOCK ITEM MODAL
   ===================================================== */
function openAddStockModal() {
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('addStockModal').classList.remove('hidden');
}

function closeAddStockModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.getElementById('addStockModal').classList.add('hidden');
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemQty').value = '';
    document.getElementById('newItemPrice').value = '';
}

function saveNewStockItem() {
    var name = document.getElementById('newItemName').value.trim();
    var qty = parseInt(document.getElementById('newItemQty').value) || 0;
    var price = parseInt(document.getElementById('newItemPrice').value) || 0;

    if (!name) {
        alert('Please enter a medicine name.');
        return;
    }

    var newItem = {
        id: stockItems.length + 1 + Date.now(),
        name: name,
        qty: qty,
        price: price,
    };
    stockItems.unshift(newItem);
    renderStockList(stockItems);
    updateStockSummary();
    closeAddStockModal();
}

/* =====================================================
   SIMULATED ORDER FEED
   ===================================================== */
function spawnOrder() {
    if (!isStoreOpen) {
        setTimeout(spawnOrder, 5000);
        return;
    }

    var isEmergency = Math.random() < 0.25;
    var name = random(ORDER_NAMES);
    var area = random(ORDER_AREAS);
    var meds = random(MEDICINE_SETS);
    var amount = Math.floor(Math.random() * 350) + 85;
    var orderId = 'MQ-' + String(1000 + orderCounter).padStart(4, '0');
    orderCounter++;

    addOrderCard({ id: orderId, name: name, area: area, meds: meds, amount: amount, isEmergency: isEmergency });

    // Next order in 8–18 seconds
    var delay = (Math.random() * 10000) + 8000;
    setTimeout(spawnOrder, delay);
}

function addOrderCard(order) {
    var list = document.getElementById('orderList');

    // Remove empty state
    var empty = list.querySelector('.orders-empty');
    if (empty) empty.remove();

    var now = new Date();
    var timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    var card = document.createElement('div');
    card.className = 'order-card' + (order.isEmergency ? ' emergency' : '');
    card.id = 'order-' + order.id;

    card.innerHTML =
        '<div class="order-top">' +
        '<div class="order-id-wrap">' +
        '<span class="order-id">' + order.id + '</span>' +
        (order.isEmergency ? '<span class="order-emergency-tag">🚨 EMERGENCY</span>' : '') +
        '</div>' +
        '<span class="order-time">' + timeStr + '</span>' +
        '</div>' +
        '<p class="order-customer">' +
        '<i class="fa-solid fa-user"></i> ' + order.name + ' &nbsp;·&nbsp; ' +
        '<i class="fa-solid fa-location-dot"></i> ' + order.area +
        '</p>' +
        '<div class="order-items">' + order.meds + '</div>' +
        '<div class="order-footer">' +
        '<span class="order-total">Total: ₹' + order.amount + '</span>' +
        '<div class="order-actions">' +
        '<button class="btn-accept" onclick="acceptOrder(\'' + order.id + '\', ' + order.amount + ')">' +
        '<i class="fa-solid fa-check"></i> Accept</button>' +
        '<button class="btn-reject" onclick="rejectOrder(\'' + order.id + '\')">' +
        '<i class="fa-solid fa-xmark"></i> Reject</button>' +
        '</div>' +
        '</div>';

    list.prepend(card);

    pendingCount++;
    updateStats();
    updateOrderBadge();
}

/* =====================================================
   ACCEPT / REJECT
   ===================================================== */
function acceptOrder(id, amount) {
    var card = document.getElementById('order-' + id);
    var actions = card.querySelector('.order-actions');

    card.classList.add('accepted');
    actions.innerHTML = '<span class="order-status-tag status-accepted">✓ Accepted – Out for delivery</span>';

    pendingCount = Math.max(0, pendingCount - 1);
    acceptedCount++;
    totalRevenue += amount;

    setTimeout(function () {
        markDelivered(id);
    }, 30000);

    updateStats();
    updateOrderBadge();
}

function rejectOrder(id) {
    var card = document.getElementById('order-' + id);
    var actions = card.querySelector('.order-actions');

    card.classList.add('rejected');
    actions.innerHTML = '<span class="order-status-tag status-rejected">✗ Rejected</span>';

    pendingCount = Math.max(0, pendingCount - 1);
    updateStats();
    updateOrderBadge();
}

function markDelivered(id) {
    var card = document.getElementById('order-' + id);
    if (!card) return;
    var statusTag = card.querySelector('.status-accepted');
    if (statusTag) {
        statusTag.textContent = '📦 Delivered';
        statusTag.style.background = '#dbeafe';
        statusTag.style.color = '#1e40af';
    }
    acceptedCount = Math.max(0, acceptedCount - 1);
    deliveredCount++;
    updateStats();
}

/* =====================================================
   STATS
   ===================================================== */
function updateStats() {
    document.getElementById('statPending').textContent = pendingCount;
    document.getElementById('statAccepted').textContent = acceptedCount;
    document.getElementById('statDelivered').textContent = deliveredCount;
    document.getElementById('statRevenue').textContent = '₹' + totalRevenue;
}

function updateOrderBadge() {
    var badge = document.getElementById('orderCountBadge');
    badge.textContent = pendingCount + ' new';
    badge.style.display = pendingCount === 0 ? 'none' : '';

    // Sidebar badge
    var sidebarBadge = document.getElementById('sidebarOrderBadge');
    if (sidebarBadge) {
        sidebarBadge.textContent = pendingCount;
        sidebarBadge.style.display = pendingCount === 0 ? 'none' : '';
    }

    // Header notification badge
    var headerBadge = document.getElementById('headerNotifBadge');
    if (headerBadge) {
        headerBadge.textContent = pendingCount;
        headerBadge.style.display = pendingCount === 0 ? 'none' : '';
    }
}

/* =====================================================
   UTILITY
   ===================================================== */
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* =====================================================
   CUSTOMER CHAT NOTIFICATIONS
   ===================================================== */
function loadChatNotifs() {
    var notifs = JSON.parse(localStorage.getItem('mq_store_chat_notifs') || '[]');
    var list = document.getElementById('chatNotifList');
    var badge = document.getElementById('chatNotifBadge');
    if (!list || !badge) return;

    badge.textContent = notifs.length;
    badge.style.display = notifs.length === 0 ? 'none' : '';

    if (notifs.length === 0) {
        list.innerHTML = '<div class="chat-notifs-empty"><i class="fa-solid fa-inbox"></i><p>No customer messages yet</p></div>';
        return;
    }

    list.innerHTML = notifs.slice().reverse().map(function (n) {
        var d = new Date(n.time);
        var timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return '<div class="chat-notif-card">' +
            '<div class="chat-notif-top">' +
            '<span class="chat-notif-user"><i class="fa-solid fa-user"></i> ' + n.userName + '</span>' +
            '<span class="chat-notif-time">' + timeStr + '</span>' +
            '</div>' +
            '<p class="chat-notif-msg">' + n.message + '</p>' +
            '</div>';
    }).join('');
}

function clearChatNotifs() {
    localStorage.removeItem('mq_store_chat_notifs');
    loadChatNotifs();
}

// Poll for notifications
setInterval(loadChatNotifs, 3000);
loadChatNotifs();

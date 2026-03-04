/* =============================================
   MediQuick – Store Detail JS (Redesigned)
   ============================================= */
var API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '';

var currentStore = null;

/* ── Pharmacist auto-responses ───────────────── */
var REPLIES = {
    'Is this medicine available?':
        'Please share the medicine name and I will check our stock for you right away!',
    'Do you have an alternative?':
        'Yes! Share the medicine name and I will suggest available alternatives with similar composition.',
    'What is the price?':
        'Please tell me the medicine name and I will share the current price with MRP and any discounts.',
    'How long will delivery take?':
        'Delivery usually takes 20-30 minutes depending on your distance. Emergency orders are prioritized!',
    'Do you accept prescriptions online?':
        'Yes, you can upload your prescription through the Order page and we will verify it before dispatching.',
    'Bulk order discount?':
        'We offer 5-10% discount on bulk medicine orders. Please share your list and I will prepare a quote!'
};
var FALLBACK = 'Thank you for your message! Our pharmacist will review this shortly. For urgent queries, call us directly.';

/* =============================================
   INIT
   ============================================= */
window.addEventListener('DOMContentLoaded', function () {
    var token = localStorage.getItem('mq_token');
    if (!token) { window.location.href = '../index.html'; return; }

    var params = new URLSearchParams(window.location.search);
    var storeId = params.get('id');
    if (!storeId) { window.location.href = 'request.html'; return; }

    loadStore(storeId, token);
});

/* =============================================
   LOAD STORE
   ============================================= */
function loadStore(id, token) {
    fetch(API_BASE + '/api/stores/' + id, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(function (r) {
            if (!r.ok) throw new Error('Not found');
            return r.json();
        })
        .then(function (data) {
            currentStore = data.store;
            render(currentStore);
        })
        .catch(function () {
            document.getElementById('stateLoading').innerHTML =
                '<p style="color:#ef4444;font-weight:600;">Store not found.</p>';
        });
}

/* =============================================
   RENDER
   ============================================= */
function render(s) {
    document.getElementById('stateLoading').style.display = 'none';
    document.getElementById('storeDetail').classList.remove('hidden');

    // Photo
    var img = document.getElementById('heroPhoto');
    var ph = document.getElementById('heroPlaceholder');
    if (s.photo) {
        img.src = s.photo;
        img.alt = s.storeName;
        img.style.display = 'block';
        ph.classList.remove('visible');
    } else {
        img.style.display = 'none';
        ph.classList.add('visible');
    }

    // Status chip
    var chip = document.getElementById('statusChip');
    chip.textContent = s.isOpen ? 'Open' : 'Closed';
    if (!s.isOpen) chip.classList.add('closed');

    // Name
    document.getElementById('storeName').textContent = s.storeName;
    document.title = s.storeName + ' \u2013 MediQuick';

    // Rating
    var rating = parseFloat(s.rating) || 0;
    var stars = '';
    for (var i = 0; i < 5; i++) {
        stars += '<i class="fa-solid fa-star' + (i < Math.round(rating) ? '' : ' star-empty') + '"></i>';
    }
    document.getElementById('ratingRow').innerHTML =
        stars + ' <span class="r-num">' + rating.toFixed(1) + '</span>' +
        '<span class="r-count">(' + (s.reviews || 0) + ' reviews)</span>';

    // Address
    document.querySelector('#storeAddress span').textContent = s.address || '\u2014';

    // Meta info
    document.querySelector('#storeTimings span').textContent = s.timings || '\u2014';
    document.querySelector('#storePhone span').textContent = s.phone || '\u2014';
    document.querySelector('#storeDelivery span').textContent = s.delivery ? s.delivery + ' delivery' : '\u2014';
    document.querySelector('#storeLicence span').textContent = s.licenceNo || 'Not listed';
    document.querySelector('#storePincode span').textContent = s.pincode ? 'Pincode: ' + s.pincode : '\u2014';

    // If already selected
    if (localStorage.getItem('mq_selected_store') === s._id) {
        markSelected();
    }
}

/* =============================================
   SELECT STORE -> save + redirect to search
   ============================================= */
function selectStore() {
    if (!currentStore) return;

    localStorage.setItem('mq_selected_store', currentStore._id);
    localStorage.setItem('mq_selected_store_name', currentStore.storeName);

    // Notify store dash
    saveChatNotif(currentStore.storeName + ' was selected for ordering.');

    markSelected();

    // Show toast then redirect
    showToast('Store selected! Redirecting to search...');
    setTimeout(function () {
        window.location.href = 'request.html';
    }, 1200);
}

function markSelected() {
    var btn = document.getElementById('selectBtn');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Selected';
    btn.classList.add('selected');
}

/* =============================================
   TOAST
   ============================================= */
function showToast(msg) {
    var t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
}

/* =============================================
   CHAT WIDGET
   ============================================= */
function toggleChat() {
    var w = document.getElementById('chatWidget');
    w.classList.toggle('hidden');
}

function sendQuick(msg) {
    addBubble(msg, 'user');
    saveChatNotif(msg);
    setTimeout(function () {
        addBubble(REPLIES[msg] || FALLBACK, 'pharmacist');
    }, 600);
}

function sendMsg() {
    var inp = document.getElementById('chatInput');
    var msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';
    addBubble(msg, 'user');
    saveChatNotif(msg);
    setTimeout(function () {
        addBubble(FALLBACK, 'pharmacist');
    }, 800);
}

function addBubble(text, who) {
    var win = document.getElementById('chatWindow');
    var el = document.createElement('div');
    el.className = 'cw-bubble ' + who;
    el.innerHTML = '<p>' + text + '</p>';
    win.appendChild(el);
    win.scrollTop = win.scrollHeight;
}

function saveChatNotif(msg) {
    var notifs = JSON.parse(localStorage.getItem('mq_store_chat_notifs') || '[]');
    var user = JSON.parse(localStorage.getItem('mq_user') || '{}');
    notifs.push({
        storeId: currentStore ? currentStore._id : '',
        storeName: currentStore ? currentStore.storeName : '',
        userName: user.fullName || user.email || 'A customer',
        message: msg,
        time: new Date().toISOString()
    });
    localStorage.setItem('mq_store_chat_notifs', JSON.stringify(notifs));
}

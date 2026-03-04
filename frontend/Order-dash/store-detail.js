/* =============================================
   MediQuick – Store Detail JS
   Loads store from backend via ?id= query param
   ============================================= */

var API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '';

var currentStore = null;

/* ── Pharmacist auto-responses ────────────────────────── */
var PHARMACIST_REPLIES = {
    'Is this medicine available?':
        'Please share the medicine name and I\u0027ll check our stock for you right away!',
    'Do you have an alternative for my medicine?':
        'Yes! Share the medicine name and I\u0027ll suggest available alternatives with similar composition.',
    'What is the price of this medicine?':
        'Please tell me the medicine name and I\u0027ll share the current price with MRP and any discounts.',
    'How long will delivery take?':
        'Delivery usually takes 20\u201330 minutes depending on your distance. Emergency orders are prioritized!',
    'Do you accept prescriptions online?':
        'Yes, you can upload your prescription through the Order page and we\u0027ll verify it before dispatching.',
    'Can I get a discount for bulk order?':
        'We offer 5\u201310% discount on bulk medicine orders. Please share your list and I\u0027ll prepare a quote!',
};

/* Default fallback for custom messages */
var DEFAULT_REPLY = 'Thank you for your message! Our pharmacist will review this and respond shortly. For urgent queries, please call us directly.';

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
   LOAD STORE FROM BACKEND
   ============================================= */
async function loadStore(id, token) {
    try {
        var res = await fetch(API_BASE + '/api/stores/' + id, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            document.getElementById('loadingSkeleton').innerHTML =
                '<p style="text-align:center;padding:40px;color:#ef4444;">Store not found.</p>';
            return;
        }

        var data = await res.json();
        currentStore = data.store;
        renderStoreDetail(currentStore);

    } catch (err) {
        console.error('Load store error:', err);
        document.getElementById('loadingSkeleton').innerHTML =
            '<p style="text-align:center;padding:40px;color:#ef4444;">Could not load store details.</p>';
    }
}

/* =============================================
   RENDER STORE DETAIL
   ============================================= */
function renderStoreDetail(s) {
    // Hide skeleton, show content
    document.getElementById('loadingSkeleton').style.display = 'none';
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('detailMain').style.display = 'block';

    // Hero image
    var heroImg = document.getElementById('heroImg');
    var heroPlaceholder = document.getElementById('heroPlaceholder');
    if (s.photo) {
        heroImg.src = s.photo;
        heroImg.alt = s.storeName;
        heroImg.style.display = 'block';
        heroPlaceholder.classList.remove('visible');
    } else {
        heroImg.style.display = 'none';
        heroPlaceholder.classList.add('visible');
    }

    // Open/Closed badge
    var statusEl = document.getElementById('heroStatus');
    if (s.isOpen) {
        statusEl.textContent = 'Open';
        statusEl.className = 'hero-status open';
    } else {
        statusEl.textContent = 'Closed';
        statusEl.className = 'hero-status closed';
    }

    // Title
    document.getElementById('storeName').textContent = s.storeName;
    document.title = s.storeName + ' – MediQuick';

    // Stars
    var rating = parseFloat(s.rating) || 0;
    var starsHtml = '';
    for (var i = 0; i < 5; i++) {
        starsHtml += '<i class="fa-solid fa-star' + (i < Math.round(rating) ? '' : ' star-empty') + '"></i>';
    }
    document.getElementById('stars').innerHTML = starsHtml;
    document.getElementById('ratingText').textContent = rating.toFixed(1);
    document.getElementById('reviewCount').textContent = '(' + (s.reviews || 0) + ' reviews)';

    // Info cards
    document.getElementById('storeAddress').textContent = s.address || '—';
    document.getElementById('storeTimings').textContent = s.timings || '—';
    document.getElementById('storePhone').textContent = s.phone || '—';
    document.getElementById('storeDelivery').textContent = s.delivery ? s.delivery + ' delivery' : '—';
    document.getElementById('storeLicence').textContent = s.licenceNo || 'Not listed';
    document.getElementById('storePincode').textContent = s.pincode || '—';

    // Check if this store was already selected
    var selectedId = localStorage.getItem('mq_selected_store');
    if (selectedId === s._id) {
        markAsSelected();
    }
}

/* =============================================
   SELECT STORE
   ============================================= */
function selectStore() {
    if (!currentStore) return;

    localStorage.setItem('mq_selected_store', currentStore._id);
    localStorage.setItem('mq_selected_store_name', currentStore.storeName);

    markAsSelected();

    // Send a chat notification to store dashboard (saved in localStorage for demo)
    var chatNotifs = JSON.parse(localStorage.getItem('mq_store_chat_notifs') || '[]');
    var user = JSON.parse(localStorage.getItem('mq_user') || '{}');
    chatNotifs.push({
        storeId: currentStore._id,
        storeName: currentStore.storeName,
        userName: user.fullName || user.email || 'A customer',
        message: 'selected this store for ordering.',
        time: new Date().toISOString(),
    });
    localStorage.setItem('mq_store_chat_notifs', JSON.stringify(chatNotifs));
}

function markAsSelected() {
    var btn = document.getElementById('selectStoreBtn');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Store Selected';
    btn.classList.add('selected');
    document.getElementById('selectedMsg').classList.remove('hidden');
}

/* =============================================
   CHAT – Quick Replies
   ============================================= */
function sendQuickReply(msg) {
    addBubble(msg, 'user');

    // Save chat notification for Store-dash
    saveChatNotification(msg);

    // Auto-reply after brief delay
    setTimeout(function () {
        var reply = PHARMACIST_REPLIES[msg] || DEFAULT_REPLY;
        addBubble(reply, 'pharmacist');
    }, 800);
}

function sendMessage() {
    var input = document.getElementById('chatInput');
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    addBubble(msg, 'user');

    // Save chat notification for Store-dash
    saveChatNotification(msg);

    setTimeout(function () {
        addBubble(DEFAULT_REPLY, 'pharmacist');
    }, 1000);
}

function addBubble(text, sender) {
    var win = document.getElementById('chatWindow');
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + sender;
    bubble.innerHTML =
        '<span class="chat-sender">' + (sender === 'user' ? 'You' : 'Pharmacist') + '</span>' +
        '<p>' + text + '</p>';
    win.appendChild(bubble);
    win.scrollTop = win.scrollHeight;
}

function saveChatNotification(msg) {
    var chatNotifs = JSON.parse(localStorage.getItem('mq_store_chat_notifs') || '[]');
    var user = JSON.parse(localStorage.getItem('mq_user') || '{}');
    chatNotifs.push({
        storeId: currentStore ? currentStore._id : '',
        storeName: currentStore ? currentStore.storeName : '',
        userName: user.fullName || user.email || 'A customer',
        message: msg,
        time: new Date().toISOString(),
    });
    localStorage.setItem('mq_store_chat_notifs', JSON.stringify(chatNotifs));
}

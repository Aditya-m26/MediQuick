/* =====================================================
   MediQuick – emergency.js
   Controls the Emergency Delivery Mode toggle
   When ON: redirects to cart with emergency mode active
   ===================================================== */

let isEmergencyOn = false;

function toggleEmergency() {
    isEmergencyOn = !isEmergencyOn;

    const banner = document.getElementById('emergencyBanner');
    const toggle = document.getElementById('emergencyToggle');
    const label = document.getElementById('emergencyLabel');
    const greeting = document.getElementById('greetingText');

    if (isEmergencyOn) {
        /* ---- TURN ON: redirect to cart/checkout with emergency mode ---- */
        localStorage.setItem('mq_emergency_mode', '1');
        window.location.href = 'cart.html';
        return;
    } else {
        /* ---- TURN OFF ---- */
        banner.classList.add('hidden');
        toggle.classList.remove('active');
        label.textContent = 'Emergency';
        greeting.textContent = 'Good day! What medicine do you need?';
        document.body.classList.remove('emergency-on');

        // Restore all delivery tags back to normal
        updateDeliveryTags(false);
    }
}

/* ---- Helper: emergency delivery time from distance (min 10, max 25) ---- */
function getEmergencyTime(distanceKm) {
    if (distanceKm === null || distanceKm === undefined || distanceKm === '') return '~15 min';
    var d = parseFloat(distanceKm);
    if (isNaN(d)) return '~15 min';
    if (d <= 2) return '~10 min';
    if (d <= 5) return '~12 min';
    if (d <= 10) return '~15 min';
    if (d <= 15) return '~20 min';
    return '~25 min';
}

/* ---- Helper: swap delivery text on all open store cards ---- */
function updateDeliveryTags(emergencyMode) {
    // Grab all open delivery tags (not closed / inactive ones)
    const deliveryTags = document.querySelectorAll('.store-delivery:not(.store-delivery-inactive)');

    deliveryTags.forEach(function (tag) {
        var dist = tag.getAttribute('data-distance');

        if (emergencyMode) {
            tag.classList.add('emergency-active');
            tag.innerHTML = '<i class="fa-solid fa-siren-on"></i> 🚨 Priority – ' +
                getEmergencyTime(dist);
        } else {
            tag.classList.remove('emergency-active');
            // Use the shared helper from request.js
            var normalTime = (typeof window.getDeliveryTime === 'function')
                ? window.getDeliveryTime(dist === '' ? null : parseFloat(dist))
                : '20–30 min';
            tag.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' +
                normalTime + ' delivery';
        }
    });
}

// Init: if user returned from cart with emergency mode on, show toggle as active
(function init() {
    if (localStorage.getItem('mq_emergency_mode') === '1') {
        isEmergencyOn = true;
        var banner = document.getElementById('emergencyBanner');
        var toggle = document.getElementById('emergencyToggle');
        var label = document.getElementById('emergencyLabel');
        var greeting = document.getElementById('greetingText');
        if (banner) banner.classList.remove('hidden');
        if (toggle) toggle.classList.add('active');
        if (label) label.textContent = 'Emergency ON';
        if (greeting) greeting.textContent = '🚨 Emergency! Finding fastest pharmacy...';
        document.body.classList.add('emergency-on');
        updateDeliveryTags(true);
    }
})();

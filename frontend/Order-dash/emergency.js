/* =====================================================
   MediQuick – emergency.js
   Controls the Emergency Delivery Mode toggle
   ===================================================== */

let isEmergencyOn = false;

function toggleEmergency() {
    isEmergencyOn = !isEmergencyOn;

    const banner = document.getElementById('emergencyBanner');
    const toggle = document.getElementById('emergencyToggle');
    const label = document.getElementById('emergencyLabel');
    const greeting = document.getElementById('greetingText');

    if (isEmergencyOn) {
        /* ---- TURN ON ---- */
        banner.classList.remove('hidden');
        toggle.classList.add('active');
        label.textContent = 'Emergency ON';
        greeting.textContent = '🚨 Emergency! Finding fastest pharmacy...';
        document.body.classList.add('emergency-on');

        // Update all open delivery tags to emergency style
        updateDeliveryTags(true);

        // Scroll user to pharmacy section so they see results instantly
        const section = document.querySelector('.pharmacy-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

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

/* ---- Helper: swap delivery text on all open store cards ---- */
function updateDeliveryTags(emergencyMode) {
    // Grab all open delivery tags (not closed / inactive ones)
    const deliveryTags = document.querySelectorAll('.store-delivery:not(.store-delivery-inactive)');

    // Emergency delivery times — one per card in order
    const emergencyTimes = [
        '🚨 Priority – ~8 min',
        '🚨 Priority – ~10 min',
        '🚨 Priority – ~12 min',
        '🚨 Priority – ~15 min',
        '🚨 Priority – ~18 min',
        '🚨 Priority – ~20 min',
        '🚨 Priority – ~22 min',
    ];

    const normalTimes = [
        '20–30 min delivery',
        '15–25 min delivery',
        '25–35 min delivery',
        '20–40 min delivery',
        '30–45 min delivery',
        '35–50 min delivery',
        '40–55 min delivery',
    ];

    deliveryTags.forEach(function (tag, index) {
        if (emergencyMode) {
            tag.classList.add('emergency-active');
            tag.innerHTML = '<i class="fa-solid fa-siren-on"></i> ' +
                (emergencyTimes[index] || '🚨 Priority dispatch');
        } else {
            tag.classList.remove('emergency-active');
            tag.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' +
                (normalTimes[index] || 'Fast delivery');
        }
    });
}

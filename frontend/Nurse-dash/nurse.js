/* ===================================================
   MediQuick – nurse.js
   Nurse Appointment Page Logic
   =================================================== */

// ==================== STATIC DATA ====================

const NURSES = [
    {
        id: 1,
        name: 'Nurse Anita Verma',
        services: ['injections', 'iv_drip', 'wound_care'],
        serviceLabels: ['Injections', 'IV Drip', 'Wound Care'],
        rating: 4.9,
        reviews: 287,
        experience: '10 yrs',
        avatar: 'av-purple',
        icon: 'fa-solid fa-syringe',
        available: true,
        schedule: 'Mon – Sat, 8 AM – 6 PM'
    },
    {
        id: 2,
        name: 'Nurse Kavya Nair',
        services: ['baby_care', 'injections'],
        serviceLabels: ['Baby Care', 'Injections'],
        rating: 4.8,
        reviews: 195,
        experience: '8 yrs',
        avatar: 'av-pink',
        icon: 'fa-solid fa-baby-carriage',
        available: true,
        schedule: 'Mon – Fri, 9 AM – 5 PM'
    },
    {
        id: 3,
        name: 'Nurse Ravi Shankar',
        services: ['physiotherapy', 'post_surgery'],
        serviceLabels: ['Physiotherapy', 'Post-Surgery'],
        rating: 4.7,
        reviews: 230,
        experience: '14 yrs',
        avatar: 'av-teal',
        icon: 'fa-solid fa-dumbbell',
        available: true,
        schedule: 'Mon – Sat, 7 AM – 7 PM'
    },
    {
        id: 4,
        name: 'Nurse Sonal Gupta',
        services: ['elderly_care', 'wound_care', 'injections'],
        serviceLabels: ['Elderly Care', 'Wound Care', 'Injections'],
        rating: 4.9,
        reviews: 340,
        experience: '16 yrs',
        avatar: 'av-green',
        icon: 'fa-solid fa-wheelchair',
        available: true,
        schedule: 'All days, 8 AM – 8 PM'
    },
    {
        id: 5,
        name: 'Nurse Deepak Jain',
        services: ['iv_drip', 'post_surgery', 'wound_care'],
        serviceLabels: ['IV Drip', 'Post-Surgery', 'Wound Care'],
        rating: 4.6,
        reviews: 168,
        experience: '12 yrs',
        avatar: 'av-blue',
        icon: 'fa-solid fa-droplet',
        available: true,
        schedule: 'Mon – Sat, 9 AM – 6 PM'
    },
    {
        id: 6,
        name: 'Nurse Priyanka Das',
        services: ['injections', 'physiotherapy'],
        serviceLabels: ['Injections', 'Physiotherapy'],
        rating: 4.8,
        reviews: 215,
        experience: '9 yrs',
        avatar: 'av-orange',
        icon: 'fa-solid fa-syringe',
        available: true,
        schedule: 'Mon – Fri, 8 AM – 4 PM'
    },
    {
        id: 7,
        name: 'Nurse Suresh Pillai',
        services: ['post_surgery', 'elderly_care'],
        serviceLabels: ['Post-Surgery', 'Elderly Care'],
        rating: 4.7,
        reviews: 182,
        experience: '18 yrs',
        avatar: 'av-red',
        icon: 'fa-solid fa-bed-pulse',
        available: true,
        schedule: 'All days, 6 AM – 10 PM'
    },
    {
        id: 8,
        name: 'Nurse Fatima Sheikh',
        services: ['baby_care', 'injections', 'wound_care'],
        serviceLabels: ['Baby Care', 'Injections', 'Wound Care'],
        rating: 4.9,
        reviews: 310,
        experience: '11 yrs',
        avatar: 'av-indigo',
        icon: 'fa-solid fa-baby-carriage',
        available: true,
        schedule: 'Mon – Sat, 8 AM – 5 PM'
    }
];

// ==================== STATE ====================

let currentFilter = 'all';

// ==================== SIDEBAR ====================

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    sb.classList.toggle('open');
    ov.classList.toggle('active');
}

// ==================== RENDER NURSES ====================

function renderNurses(filter) {
    const grid = document.getElementById('nursesGrid');
    const empty = document.getElementById('emptyState');
    const countEl = document.getElementById('nurseCount');

    const nurses = filter === 'all'
        ? NURSES
        : NURSES.filter(n => n.services.includes(filter));

    countEl.textContent = `${nurses.length} Nurse${nurses.length !== 1 ? 's' : ''}`;

    if (nurses.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');

    grid.innerHTML = nurses.map(nurse => `
        <div class="nurse-card" id="nurse-${nurse.id}">
            <a href="nurse-detail.html?id=${nurse.id}" class="nurse-card-link">
                <div class="nurse-card-top">
                    <div class="nurse-avatar ${nurse.avatar}">
                        <i class="${nurse.icon}"></i>
                    </div>
                    <div class="nurse-info">
                        <p class="nurse-name">${nurse.name}</p>
                        <div class="nurse-services-list">
                            ${nurse.serviceLabels.map(s => `<span class="service-tag">${s}</span>`).join('')}
                        </div>
                        <div class="nurse-meta">
                            <span class="nurse-experience"><i class="fa-solid fa-briefcase-medical"></i> ${nurse.experience} experience</span>
                        </div>
                        <div class="nurse-rating">
                            <i class="fa-solid fa-star"></i> ${nurse.rating}
                            <span class="rating-count">(${nurse.reviews} reviews)</span>
                        </div>
                    </div>
                </div>
                <div class="nurse-card-avail">
                    <div class="avail-row">
                        <span class="avail-dot"></span>
                        <span class="avail-text">Available</span>
                        <span class="avail-schedule">· ${nurse.schedule}</span>
                    </div>
                </div>
            </a>
            <div class="nurse-card-action">
                <a href="nurse-detail.html?id=${nurse.id}" class="book-btn">
                    <i class="fa-solid fa-calendar-days"></i> Check Schedule
                </a>
            </div>
        </div>
    `).join('');
}

// ==================== FILTER ====================

function filterNurses(filter, btn) {
    currentFilter = filter;

    // Update active chip
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    renderNurses(filter);
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    renderNurses('all');
});



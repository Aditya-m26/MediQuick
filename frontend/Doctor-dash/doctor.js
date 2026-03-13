/* ===================================================
   MediQuick – doctor.js
   Doctor Appointment Page Logic
   =================================================== */

// ==================== STATIC DATA ====================

const DOCTORS = [
    {
        id: 1,
        name: 'Dr. Arjun Sharma',
        speciality: 'cardiology',
        specLabel: 'Cardiologist',
        hospital: 'Apollo Heart Centre',
        rating: 4.9,
        reviews: 312,
        experience: '18 yrs',
        avatar: 'av-red',
        icon: 'fa-solid fa-heart-pulse',
        slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM']
    },
    {
        id: 2,
        name: 'Dr. Priya Deshmukh',
        speciality: 'dermatology',
        specLabel: 'Dermatologist',
        hospital: 'SkinGlow Clinic',
        rating: 4.8,
        reviews: 248,
        experience: '12 yrs',
        avatar: 'av-pink',
        icon: 'fa-solid fa-hand-dots',
        slots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM']
    },
    {
        id: 3,
        name: 'Dr. Rajesh Kumar',
        speciality: 'general',
        specLabel: 'General Physician',
        hospital: 'City General Hospital',
        rating: 4.7,
        reviews: 520,
        experience: '22 yrs',
        avatar: 'av-teal',
        icon: 'fa-solid fa-user-doctor',
        slots: ['08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '03:30 PM']
    },
    {
        id: 4,
        name: 'Dr. Sneha Patil',
        speciality: 'pediatrics',
        specLabel: 'Pediatrician',
        hospital: 'Rainbow Children Hospitals',
        rating: 4.9,
        reviews: 410,
        experience: '15 yrs',
        avatar: 'av-orange',
        icon: 'fa-solid fa-baby',
        slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    {
        id: 5,
        name: 'Dr. Vikram Joshi',
        speciality: 'orthopedics',
        specLabel: 'Orthopedic Surgeon',
        hospital: 'BoneCare Ortho Hospital',
        rating: 4.6,
        reviews: 189,
        experience: '20 yrs',
        avatar: 'av-blue',
        icon: 'fa-solid fa-bone',
        slots: ['10:00 AM', '12:00 PM', '03:00 PM']
    },
    {
        id: 6,
        name: 'Dr. Meera Iyer',
        speciality: 'neurology',
        specLabel: 'Neurologist',
        hospital: 'Fortis Brain & Spine Centre',
        rating: 4.8,
        reviews: 275,
        experience: '16 yrs',
        avatar: 'av-purple',
        icon: 'fa-solid fa-brain',
        slots: ['09:30 AM', '11:30 AM', '02:30 PM', '05:00 PM']
    },
    {
        id: 7,
        name: 'Dr. Anand Naik',
        speciality: 'ent',
        specLabel: 'ENT Specialist',
        hospital: 'ClearSound ENT Clinic',
        rating: 4.5,
        reviews: 156,
        experience: '10 yrs',
        avatar: 'av-green',
        icon: 'fa-solid fa-ear-listen',
        slots: ['08:30 AM', '10:00 AM', '01:00 PM', '04:00 PM']
    },
    {
        id: 8,
        name: 'Dr. Kavitha Reddy',
        speciality: 'gynecology',
        specLabel: 'Gynecologist',
        hospital: 'Motherhood Women Hospitals',
        rating: 4.9,
        reviews: 390,
        experience: '14 yrs',
        avatar: 'av-indigo',
        icon: 'fa-solid fa-person-pregnant',
        slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM']
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

// ==================== RENDER DOCTORS ====================

function renderDoctors(filter) {
    const grid = document.getElementById('doctorsGrid');
    const empty = document.getElementById('emptyState');
    const countEl = document.getElementById('docCount');

    const docs = filter === 'all'
        ? DOCTORS
        : DOCTORS.filter(d => d.speciality === filter);

    countEl.textContent = `${docs.length} Doctor${docs.length !== 1 ? 's' : ''}`;

    if (docs.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');

    grid.innerHTML = docs.map(doc => `
        <div class="doctor-card" id="doc-${doc.id}">
            <a href="doctor-detail.html?id=${doc.id}" class="doc-card-link">
                <div class="doc-card-top">
                    <div class="doc-avatar ${doc.avatar}">
                        <i class="${doc.icon}"></i>
                    </div>
                    <div class="doc-info">
                        <p class="doc-name">${doc.name}</p>
                        <p class="doc-spec">${doc.specLabel}</p>
                        <div class="doc-meta">
                            <span class="doc-hospital"><i class="fa-solid fa-hospital"></i> ${doc.hospital}</span>
                            <span class="doc-experience"><i class="fa-solid fa-briefcase-medical"></i> ${doc.experience} experience</span>
                        </div>
                        <div class="doc-rating">
                            <i class="fa-solid fa-star"></i> ${doc.rating}
                            <span class="rating-count">(${doc.reviews} reviews)</span>
                        </div>
                    </div>
                </div>
                <div class="doc-card-slots">
                    <p class="slots-label">Available Slots</p>
                    <div class="slots-wrap">
                        ${doc.slots.map(s => `<span class="slot-chip">${s}</span>`).join('')}
                    </div>
                </div>
            </a>
            <div class="doc-card-action">
                <a href="doctor-detail.html?id=${doc.id}" class="book-btn">
                    <i class="fa-solid fa-calendar-days"></i> Check Schedule
                </a>
            </div>
        </div>
    `).join('');
}

// ==================== FILTER ====================

function filterDoctors(filter, btn) {
    currentFilter = filter;

    // Update active chip
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    renderDoctors(filter);
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    renderDoctors('all');
});

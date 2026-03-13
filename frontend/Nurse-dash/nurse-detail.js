/* ===================================================
   MediQuick – nurse-detail.js
   Nurse Detail Page Logic
   =================================================== */

// ==================== STATIC DATA ====================

const SERVICE_ICONS = {
    'Injections':        'fa-solid fa-syringe',
    'IV Drip':           'fa-solid fa-droplet',
    'Wound Care':        'fa-solid fa-bandage',
    'Physiotherapy':     'fa-solid fa-dumbbell',
    'Post-Surgery Care': 'fa-solid fa-bed-pulse',
    'Post-Surgery':      'fa-solid fa-bed-pulse',
    'Elderly Care':      'fa-solid fa-wheelchair',
    'Baby Care':         'fa-solid fa-baby-carriage'
};

const NURSES = [
    {
        id: 1,
        name: 'Nurse Anita Verma',
        serviceLabels: ['Injections', 'IV Drip', 'Wound Care'],
        rating: 4.9,
        reviews: 287,
        experience: '10 yrs',
        avatar: 'av-purple',
        icon: 'fa-solid fa-syringe',
        about: 'Nurse Anita Verma is a highly skilled nursing professional with 10 years of experience specializing in injections, IV drip administration and wound care. She is known for her gentle technique and is particularly experienced with diabetic patients requiring daily insulin injections.',
        schedule: {
            Monday:    { hours: '8:00 AM – 6:00 PM', available: true },
            Tuesday:   { hours: '8:00 AM – 6:00 PM', available: true },
            Wednesday: { hours: '8:00 AM – 6:00 PM', available: true },
            Thursday:  { hours: '8:00 AM – 6:00 PM', available: true },
            Friday:    { hours: '8:00 AM – 6:00 PM', available: true },
            Saturday:  { hours: '8:00 AM – 6:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 2,
        name: 'Nurse Kavya Nair',
        serviceLabels: ['Baby Care', 'Injections'],
        rating: 4.8,
        reviews: 195,
        experience: '8 yrs',
        avatar: 'av-pink',
        icon: 'fa-solid fa-baby-carriage',
        about: 'Nurse Kavya Nair specializes in newborn and infant care with 8 years of experience. She provides expert baby bathing, feeding assistance, vaccination administration, and postnatal mother-baby care.',
        schedule: {
            Monday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Tuesday:   { hours: '9:00 AM – 5:00 PM', available: true },
            Wednesday: { hours: '9:00 AM – 5:00 PM', available: true },
            Thursday:  { hours: '9:00 AM – 5:00 PM', available: true },
            Friday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Saturday:  { hours: 'Closed', available: false },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 3,
        name: 'Nurse Ravi Shankar',
        serviceLabels: ['Physiotherapy', 'Post-Surgery Care'],
        rating: 4.7,
        reviews: 230,
        experience: '14 yrs',
        avatar: 'av-teal',
        icon: 'fa-solid fa-dumbbell',
        about: 'Nurse Ravi Shankar is a senior physiotherapy nurse with 14 years of experience in post-operative rehabilitation, mobility exercises, and pain management. He works closely with orthopedic and neurology patients.',
        schedule: {
            Monday:    { hours: '7:00 AM – 7:00 PM', available: true },
            Tuesday:   { hours: '7:00 AM – 7:00 PM', available: true },
            Wednesday: { hours: '7:00 AM – 7:00 PM', available: true },
            Thursday:  { hours: '7:00 AM – 7:00 PM', available: true },
            Friday:    { hours: '7:00 AM – 7:00 PM', available: true },
            Saturday:  { hours: '7:00 AM – 7:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 4,
        name: 'Nurse Sonal Gupta',
        serviceLabels: ['Elderly Care', 'Wound Care', 'Injections'],
        rating: 4.9,
        reviews: 340,
        experience: '16 yrs',
        avatar: 'av-green',
        icon: 'fa-solid fa-wheelchair',
        about: 'Nurse Sonal Gupta has 16 years of dedicated experience in elderly home care. She provides comprehensive daily assistance including medication management, wound dressing, blood pressure monitoring, and companionship care.',
        schedule: {
            Monday:    { hours: '8:00 AM – 8:00 PM', available: true },
            Tuesday:   { hours: '8:00 AM – 8:00 PM', available: true },
            Wednesday: { hours: '8:00 AM – 8:00 PM', available: true },
            Thursday:  { hours: '8:00 AM – 8:00 PM', available: true },
            Friday:    { hours: '8:00 AM – 8:00 PM', available: true },
            Saturday:  { hours: '8:00 AM – 8:00 PM', available: true },
            Sunday:    { hours: '8:00 AM – 8:00 PM', available: true }
        }
    },
    {
        id: 5,
        name: 'Nurse Deepak Jain',
        serviceLabels: ['IV Drip', 'Post-Surgery Care', 'Wound Care'],
        rating: 4.6,
        reviews: 168,
        experience: '12 yrs',
        avatar: 'av-blue',
        icon: 'fa-solid fa-droplet',
        about: 'Nurse Deepak Jain is an experienced critical care nurse specializing in IV therapy, post-surgical wound management, and vitals monitoring. He has worked in ICU settings for over a decade.',
        schedule: {
            Monday:    { hours: '9:00 AM – 6:00 PM', available: true },
            Tuesday:   { hours: '9:00 AM – 6:00 PM', available: true },
            Wednesday: { hours: '9:00 AM – 6:00 PM', available: true },
            Thursday:  { hours: '9:00 AM – 6:00 PM', available: true },
            Friday:    { hours: '9:00 AM – 6:00 PM', available: true },
            Saturday:  { hours: '9:00 AM – 6:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 6,
        name: 'Nurse Priyanka Das',
        serviceLabels: ['Injections', 'Physiotherapy'],
        rating: 4.8,
        reviews: 215,
        experience: '9 yrs',
        avatar: 'av-orange',
        icon: 'fa-solid fa-syringe',
        about: 'Nurse Priyanka Das combines expertise in injection administration with physiotherapy assistance. She is trained in intramuscular, subcutaneous, and IV injections, as well as guided stretching and mobility exercises.',
        schedule: {
            Monday:    { hours: '8:00 AM – 4:00 PM', available: true },
            Tuesday:   { hours: '8:00 AM – 4:00 PM', available: true },
            Wednesday: { hours: '8:00 AM – 4:00 PM', available: true },
            Thursday:  { hours: '8:00 AM – 4:00 PM', available: true },
            Friday:    { hours: '8:00 AM – 4:00 PM', available: true },
            Saturday:  { hours: 'Closed', available: false },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 7,
        name: 'Nurse Suresh Pillai',
        serviceLabels: ['Post-Surgery Care', 'Elderly Care'],
        rating: 4.7,
        reviews: 182,
        experience: '18 yrs',
        avatar: 'av-red',
        icon: 'fa-solid fa-bed-pulse',
        about: 'Nurse Suresh Pillai has 18 years of experience in post-operative patient care and elderly assistance. He specializes in surgical wound management, catheter care, bed-side monitoring, and daily living assistance.',
        schedule: {
            Monday:    { hours: '6:00 AM – 10:00 PM', available: true },
            Tuesday:   { hours: '6:00 AM – 10:00 PM', available: true },
            Wednesday: { hours: '6:00 AM – 10:00 PM', available: true },
            Thursday:  { hours: '6:00 AM – 10:00 PM', available: true },
            Friday:    { hours: '6:00 AM – 10:00 PM', available: true },
            Saturday:  { hours: '6:00 AM – 10:00 PM', available: true },
            Sunday:    { hours: '6:00 AM – 10:00 PM', available: true }
        }
    },
    {
        id: 8,
        name: 'Nurse Fatima Sheikh',
        serviceLabels: ['Baby Care', 'Injections', 'Wound Care'],
        rating: 4.9,
        reviews: 310,
        experience: '11 yrs',
        avatar: 'av-indigo',
        icon: 'fa-solid fa-baby-carriage',
        about: 'Nurse Fatima Sheikh is a versatile nursing professional with 11 years of experience in pediatric care, vaccination programs, and wound management. She is gentle with children and highly trusted by families.',
        schedule: {
            Monday:    { hours: '8:00 AM – 5:00 PM', available: true },
            Tuesday:   { hours: '8:00 AM – 5:00 PM', available: true },
            Wednesday: { hours: '8:00 AM – 5:00 PM', available: true },
            Thursday:  { hours: '8:00 AM – 5:00 PM', available: true },
            Friday:    { hours: '8:00 AM – 5:00 PM', available: true },
            Saturday:  { hours: '8:00 AM – 5:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    }
];

// Avatar styles
const AVATAR_STYLES = {
    'av-teal':   'background: linear-gradient(135deg, #e0f7f9, #b2dfe4); color: #0ea5b0;',
    'av-blue':   'background: linear-gradient(135deg, #dce8ff, #b3ccf7); color: #2563eb;',
    'av-purple': 'background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #7c3aed;',
    'av-green':  'background: linear-gradient(135deg, #d4f5e9, #a8e6cf); color: #27ae60;',
    'av-orange': 'background: linear-gradient(135deg, #fff0d9, #fcd9a5); color: #d97706;',
    'av-red':    'background: linear-gradient(135deg, #ffe4e6, #fca5a5); color: #dc2626;',
    'av-indigo': 'background: linear-gradient(135deg, #e0e7ff, #a5b4fc); color: #4338ca;',
    'av-pink':   'background: linear-gradient(135deg, #fce7f3, #f9a8d4); color: #db2777;'
};

// ==================== INIT ====================

let nurse = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const nurseId = parseInt(params.get('id'), 10);

    nurse = NURSES.find(n => n.id === nurseId);

    if (!nurse) {
        document.getElementById('stateError').classList.remove('hidden');
        return;
    }

    populateDetail(nurse);
    document.getElementById('nurseDetail').classList.remove('hidden');
});

// ==================== POPULATE ====================

function populateDetail(n) {
    // Avatar
    const av = document.getElementById('profileAvatar');
    if (AVATAR_STYLES[n.avatar]) av.style.cssText = AVATAR_STYLES[n.avatar];
    av.innerHTML = `<i class="${n.icon}" style="font-size:44px;color:inherit;"></i>`;

    // Info
    document.getElementById('profileName').textContent = n.name;
    document.getElementById('profileExp').textContent = n.experience + ' experience';
    document.getElementById('profileRating').innerHTML =
        `<i class="fa-solid fa-star"></i> ${n.rating} <span class="rating-count">(${n.reviews} reviews)</span>`;

    // Service tags in hero
    document.getElementById('profileServices').innerHTML =
        n.serviceLabels.map(s => `<span class="hero-service-tag">${s}</span>`).join('');

    // About
    document.getElementById('aboutText').textContent = n.about;

    // Services grid
    renderServices(n.serviceLabels);

    // Schedule
    renderSchedule(n.schedule);

    // Service dropdown in booking form
    const sel = document.getElementById('serviceType');
    sel.innerHTML = '<option value="">Select service</option>' +
        n.serviceLabels.map(s => `<option value="${s}">${s}</option>`).join('');

    // Min date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').setAttribute('min', today);

    // Page title
    document.title = `MediQuick – ${n.name}`;
}

// ==================== SERVICES GRID ====================

function renderServices(labels) {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = labels.map(label => `
        <div class="service-detail-item">
            <div class="service-detail-icon">
                <i class="${SERVICE_ICONS[label] || 'fa-solid fa-hand-holding-medical'}"></i>
            </div>
            <span class="service-detail-label">${label}</span>
        </div>
    `).join('');
}

// ==================== SCHEDULE ====================

function renderSchedule(schedule) {
    const grid = document.getElementById('scheduleGrid');
    const todayIndex = new Date().getDay();
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayMap[todayIndex];

    grid.innerHTML = Object.entries(schedule).map(([day, info]) => `
        <div class="schedule-day ${day === todayName ? 'today' : ''}">
            <p class="day-name">${day.slice(0, 3)}</p>
            <p class="day-hours">${info.hours}</p>
            <span class="day-status ${info.available ? 'available' : 'off'}">
                ${info.available ? 'Available' : 'Day Off'}
            </span>
            ${day === todayName ? '<span style="display:block;font-size:10px;color:#7c3aed;font-weight:700;margin-top:4px;">TODAY</span>' : ''}
        </div>
    `).join('');
}

// ==================== SIDEBAR ====================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

// ==================== BOOKING ====================

function confirmBooking(e) {
    e.preventDefault();

    const name = document.getElementById('patientName').value.trim();
    const service = document.getElementById('serviceType').value;
    const startDate = document.getElementById('startDate').value;
    const numDays = parseInt(document.getElementById('numDays').value, 10);
    const time = document.getElementById('dailyTime').value;

    if (!name || !service || !startDate || !numDays || !time) return;

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + numDays - 1);

    const opts = { day: 'numeric', month: 'short' };
    const niceStart = start.toLocaleDateString('en-IN', opts);
    const niceEnd = end.toLocaleDateString('en-IN', { ...opts, year: 'numeric' });
    const dayText = numDays === 1 ? '1 day' : `${numDays} days`;

    showToast(`${nurse.name} booked for ${service} · ${dayText} (${niceStart} – ${niceEnd}) at ${time}`);

    document.getElementById('bookingForm').reset();
    document.getElementById('numDays').value = 1;
}

// ==================== TOAST ====================

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}

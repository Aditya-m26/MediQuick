/* ===================================================
   MediQuick – doctor-detail.js
   Doctor Detail Page Logic
   =================================================== */

// ==================== STATIC DATA (same as doctor.js) ====================

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
        about: 'Dr. Arjun Sharma is a leading cardiologist with over 18 years of experience in interventional cardiology, heart failure management, and preventive cardiac care. He has performed 3000+ angioplasties and is known for his patient-first approach.',
        slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'],
        schedule: {
            Monday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Tuesday:   { hours: '9:00 AM – 5:00 PM', available: true },
            Wednesday: { hours: '9:00 AM – 1:00 PM', available: true },
            Thursday:  { hours: '9:00 AM – 5:00 PM', available: true },
            Friday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Saturday:  { hours: '10:00 AM – 2:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
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
        about: 'Dr. Priya Deshmukh specializes in medical and cosmetic dermatology, treating conditions like acne, eczema, psoriasis, and skin allergies. She also offers advanced laser treatments and skin rejuvenation therapies.',
        slots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'],
        schedule: {
            Monday:    { hours: '10:00 AM – 6:00 PM', available: true },
            Tuesday:   { hours: '10:00 AM – 6:00 PM', available: true },
            Wednesday: { hours: 'Closed', available: false },
            Thursday:  { hours: '10:00 AM – 6:00 PM', available: true },
            Friday:    { hours: '10:00 AM – 6:00 PM', available: true },
            Saturday:  { hours: '10:00 AM – 3:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
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
        about: 'Dr. Rajesh Kumar is a senior general physician with 22 years of experience in treating common and complex medical conditions. Known for accurate diagnosis and holistic treatment plans, he has treated over 50,000 patients.',
        slots: ['08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '03:30 PM'],
        schedule: {
            Monday:    { hours: '8:00 AM – 4:00 PM', available: true },
            Tuesday:   { hours: '8:00 AM – 4:00 PM', available: true },
            Wednesday: { hours: '8:00 AM – 4:00 PM', available: true },
            Thursday:  { hours: '8:00 AM – 4:00 PM', available: true },
            Friday:    { hours: '8:00 AM – 4:00 PM', available: true },
            Saturday:  { hours: '9:00 AM – 1:00 PM', available: true },
            Sunday:    { hours: '10:00 AM – 12:00 PM', available: true }
        }
    },
    {
        id: 4,
        name: 'Dr. Sneha Patil',
        speciality: 'pediatrics',
        specLabel: 'Pediatrician',
        hospital: "Rainbow Children\u2019s Hospital",
        rating: 4.9,
        reviews: 410,
        experience: '15 yrs',
        avatar: 'av-orange',
        icon: 'fa-solid fa-baby',
        about: "Dr. Sneha Patil is a dedicated pediatrician caring for newborns, infants, and children up to 18 years. She specializes in childhood vaccinations, growth monitoring, and pediatric infectious diseases.",
        slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        schedule: {
            Monday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Tuesday:   { hours: '9:00 AM – 5:00 PM', available: true },
            Wednesday: { hours: '9:00 AM – 5:00 PM', available: true },
            Thursday:  { hours: '9:00 AM – 1:00 PM', available: true },
            Friday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Saturday:  { hours: '10:00 AM – 2:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
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
        about: 'Dr. Vikram Joshi is an experienced orthopedic surgeon specializing in joint replacements, sports injuries, fracture management, and spinal disorders. He has performed over 2000 successful surgeries.',
        slots: ['10:00 AM', '12:00 PM', '03:00 PM'],
        schedule: {
            Monday:    { hours: '10:00 AM – 4:00 PM', available: true },
            Tuesday:   { hours: '10:00 AM – 4:00 PM', available: true },
            Wednesday: { hours: '10:00 AM – 4:00 PM', available: true },
            Thursday:  { hours: 'Closed', available: false },
            Friday:    { hours: '10:00 AM – 4:00 PM', available: true },
            Saturday:  { hours: '10:00 AM – 1:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
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
        about: 'Dr. Meera Iyer is a renowned neurologist with expertise in stroke management, epilepsy, migraines, and neurodegenerative disorders. She combines cutting-edge diagnostics with compassionate patient care.',
        slots: ['09:30 AM', '11:30 AM', '02:30 PM', '05:00 PM'],
        schedule: {
            Monday:    { hours: '9:30 AM – 5:30 PM', available: true },
            Tuesday:   { hours: '9:30 AM – 5:30 PM', available: true },
            Wednesday: { hours: '9:30 AM – 1:00 PM', available: true },
            Thursday:  { hours: '9:30 AM – 5:30 PM', available: true },
            Friday:    { hours: '9:30 AM – 5:30 PM', available: true },
            Saturday:  { hours: 'Closed', available: false },
            Sunday:    { hours: 'Closed', available: false }
        }
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
        about: 'Dr. Anand Naik is an ENT specialist treating ear, nose, and throat conditions including sinusitis, hearing loss, tonsillitis, and voice disorders. He also performs endoscopic sinus surgery.',
        slots: ['08:30 AM', '10:00 AM', '01:00 PM', '04:00 PM'],
        schedule: {
            Monday:    { hours: '8:30 AM – 4:30 PM', available: true },
            Tuesday:   { hours: '8:30 AM – 4:30 PM', available: true },
            Wednesday: { hours: '8:30 AM – 4:30 PM', available: true },
            Thursday:  { hours: '8:30 AM – 4:30 PM', available: true },
            Friday:    { hours: '8:30 AM – 2:00 PM', available: true },
            Saturday:  { hours: '9:00 AM – 12:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    },
    {
        id: 8,
        name: 'Dr. Kavitha Reddy',
        speciality: 'gynecology',
        specLabel: 'Gynecologist',
        hospital: "Motherhood Women\u2019s Hospital",
        rating: 4.9,
        reviews: 390,
        experience: '14 yrs',
        avatar: 'av-indigo',
        icon: 'fa-solid fa-person-pregnant',
        about: "Dr. Kavitha Reddy is an experienced gynecologist and obstetrician specializing in high-risk pregnancies, PCOS management, fertility treatments, and minimally invasive gynecological surgeries.",
        slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
        schedule: {
            Monday:    { hours: '9:00 AM – 5:00 PM', available: true },
            Tuesday:   { hours: '9:00 AM – 5:00 PM', available: true },
            Wednesday: { hours: '9:00 AM – 5:00 PM', available: true },
            Thursday:  { hours: '9:00 AM – 5:00 PM', available: true },
            Friday:    { hours: '9:00 AM – 3:00 PM', available: true },
            Saturday:  { hours: '10:00 AM – 1:00 PM', available: true },
            Sunday:    { hours: 'Closed', available: false }
        }
    }
];

// Avatar class map
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

let doctor = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const docId = parseInt(params.get('id'), 10);

    doctor = DOCTORS.find(d => d.id === docId);

    if (!doctor) {
        document.getElementById('stateError').classList.remove('hidden');
        return;
    }

    populateDetail(doctor);
    document.getElementById('docDetail').classList.remove('hidden');
});

// ==================== POPULATE ====================

function populateDetail(doc) {
    // Avatar
    const av = document.getElementById('profileAvatar');
    if (AVATAR_STYLES[doc.avatar]) av.style.cssText = AVATAR_STYLES[doc.avatar];
    av.innerHTML = `<i class="${doc.icon}" style="font-size:44px;color:inherit;"></i>`;

    // Info
    document.getElementById('profileName').textContent = doc.name;
    document.getElementById('profileSpec').textContent = doc.specLabel;
    document.getElementById('profileHospital').textContent = doc.hospital;
    document.getElementById('profileExp').textContent = doc.experience + ' experience';
    document.getElementById('profileRating').innerHTML =
        `<i class="fa-solid fa-star"></i> ${doc.rating} <span class="rating-count">(${doc.reviews} reviews)</span>`;

    // About
    document.getElementById('aboutText').textContent = doc.about;

    // Schedule
    renderSchedule(doc.schedule);

    // Today's slots
    renderTodaySlots(doc.slots);

    // Booking form time dropdown
    const sel = document.getElementById('appointmentTime');
    sel.innerHTML = '<option value="">Select slot</option>' +
        doc.slots.map(s => `<option value="${s}">${s}</option>`).join('');

    // Set min date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);

    // Page title
    document.title = `MediQuick – ${doc.name}`;
}

// ==================== SCHEDULE ====================

function renderSchedule(schedule) {
    const grid = document.getElementById('scheduleGrid');
    const todayIndex = new Date().getDay(); // 0=Sun
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayMap[todayIndex];

    grid.innerHTML = Object.entries(schedule).map(([day, info]) => `
        <div class="schedule-day ${day === todayName ? 'today' : ''}">
            <p class="day-name">${day.slice(0, 3)}</p>
            <p class="day-hours">${info.hours}</p>
            <span class="day-status ${info.available ? 'available' : 'off'}">
                ${info.available ? 'Available' : 'Day Off'}
            </span>
            ${day === todayName ? '<span style="display:block;font-size:10px;color:#0ea5b0;font-weight:700;margin-top:4px;">TODAY</span>' : ''}
        </div>
    `).join('');
}

// ==================== TODAY SLOTS ====================

function renderTodaySlots(slots) {
    const wrap = document.getElementById('todaySlots');
    wrap.innerHTML = slots.map(s =>
        `<button type="button" class="slot-pill" onclick="selectSlot(this, '${s}')">${s}</button>`
    ).join('');
}

function selectSlot(btn, time) {
    // Deselect all
    document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
    btn.classList.add('selected');

    // Fill the time dropdown in the booking form
    document.getElementById('appointmentTime').value = time;
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
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;

    if (!name || !date || !time) return;

    const dateObj = new Date(date + 'T00:00:00');
    const niceDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    showToast(`Appointment with ${doctor.name} on ${niceDate} at ${time} confirmed!`);

    // Reset form
    document.getElementById('bookingForm').reset();
    document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
}

// ==================== TOAST ====================

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
}

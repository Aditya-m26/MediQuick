/* ==============================================
   MediQuick – Profile Dashboard JS
   ============================================== */

/* =============================================
   STATE  (in Phase 2 this comes from the backend/localStorage)
   ============================================= */
var profileData = {
    fullName: 'Aditya Morey',
    mobile: '1234567890',
    email: '[EMAIL_ADDRESS]',
    dob: '2007-02-26',
    gender: 'Male',
    age: '19',
    address: 'Plot 12, Near Ram Mandir',
    city: 'Akola',
    state: 'Maharashtra',
    pin: '444001',
    blood: 'B+',
    weight: '72',
    height: "5′ 9″",
    condition: 'Type 2 Diabetes',
    allergy: 'Penicillin, Sulfa drugs',
    meds: 'Metformin 500mg, Atorvastatin 10mg',
    ecName: 'Madhav',
    ecRel: 'Friend',
    ecPhone: '1234567890',
    drName: 'Dr.Suresh Rathi',
    drSpec: 'Endocrinologist',
    drPhone: '0724-2345678',
    drHosp: 'City Care Hospital, Akola',
};

var isEditing = false;

/* All field IDs (view-id : edit-id) */
var FIELDS = [
    'fullName', 'mobile', 'email', 'dob', 'gender', 'age',
    'address', 'city', 'state', 'pin',
    'blood', 'weight', 'height', 'condition', 'allergy', 'meds',
    'ecName', 'ecRel', 'ecPhone',
    'drName', 'drSpec', 'drPhone', 'drHosp',
];

/* =============================================
   INIT
   ============================================= */
window.addEventListener('DOMContentLoaded', function () {
    renderProfile();
    updateSidebarInfo();
});

/* =============================================
   RENDER (view mode)
   ============================================= */
function renderProfile() {
    /* Personal */
    setVal('fullName', profileData.fullName);
    setVal('mobile', profileData.mobile);
    setVal('email', profileData.email);
    setVal('dob', formatDob(profileData.dob));
    setVal('gender', profileData.gender);
    setVal('age', profileData.age + ' years');

    /* Address */
    setVal('address', profileData.address);
    setVal('city', profileData.city);
    setVal('state', profileData.state);
    setVal('pin', profileData.pin);

    /* Health */
    setVal('blood', profileData.blood);
    setVal('weight', profileData.weight + ' kg');
    setVal('height', profileData.height);
    setVal('condition', profileData.condition);
    setVal('allergy', profileData.allergy);
    setVal('meds', profileData.meds);

    /* Emergency */
    setVal('ecName', profileData.ecName);
    setVal('ecRel', profileData.ecRel);
    setVal('ecPhone', profileData.ecPhone);

    /* Doctor */
    setVal('drName', profileData.drName);
    setVal('drSpec', profileData.drSpec);
    setVal('drPhone', profileData.drPhone);
    setVal('drHosp', profileData.drHosp);

    /* Avatar initials */
    var initials = profileData.fullName.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    document.getElementById('bigAvatar').textContent = initials;
    document.getElementById('sideAvatar').textContent = initials;
    document.getElementById('dispName').textContent = profileData.fullName;
    document.getElementById('sideName').textContent = profileData.fullName;
    document.getElementById('sideEmail').textContent = profileData.email;

    /* SOS display */
    document.getElementById('sosDisplay').textContent = profileData.ecName + ' · ' + profileData.ecPhone;
    document.getElementById('sosBtn').onclick = function () {
        window.location.href = 'tel:' + profileData.ecPhone;
    };

    /* Sidebar health summary */
    document.getElementById('shBlood').textContent = profileData.blood || '—';
    document.getElementById('shWeight').textContent = profileData.weight ? profileData.weight + ' kg' : '—';
    document.getElementById('shCondition').textContent = profileData.condition || '—';
    document.getElementById('shAllergy').textContent = profileData.allergy || '—';
}

function setVal(id, val) {
    var el = document.getElementById('v-' + id);
    if (el) el.textContent = val || '—';
}

/* =============================================
   EDIT TOGGLE
   ============================================= */
function toggleEdit() {
    isEditing = !isEditing;

    var btn = document.getElementById('editToggleBtn');
    var bar = document.getElementById('saveBar');

    if (isEditing) {
        btn.classList.add('editing');
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel Edit';
        bar.classList.remove('hidden');
        showEditInputs();
    } else {
        cancelEdit();
    }
}

function showEditInputs() {
    FIELDS.forEach(function (id) {
        var view = document.getElementById('v-' + id);
        var input = document.getElementById('e-' + id);
        if (view) view.classList.add('hidden');
        if (input) {
            input.classList.remove('hidden');
            /* Sync current value into input */
            var raw = profileData[id] || '';
            if (input.tagName === 'SELECT') {
                /* find matching option */
                for (var i = 0; i < input.options.length; i++) {
                    if (input.options[i].value === raw || input.options[i].text === raw) {
                        input.selectedIndex = i; break;
                    }
                }
            } else {
                input.value = raw;
            }
        }
    });
}

function cancelEdit() {
    isEditing = false;
    var btn = document.getElementById('editToggleBtn');
    var bar = document.getElementById('saveBar');

    btn.classList.remove('editing');
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Profile';
    bar.classList.add('hidden');

    FIELDS.forEach(function (id) {
        var view = document.getElementById('v-' + id);
        var input = document.getElementById('e-' + id);
        if (view) view.classList.remove('hidden');
        if (input) input.classList.add('hidden');
    });
}

/* =============================================
   SAVE
   ============================================= */
function saveProfile() {
    /* Read all inputs */
    FIELDS.forEach(function (id) {
        var input = document.getElementById('e-' + id);
        if (input && !input.classList.contains('hidden')) {
            var val = input.tagName === 'SELECT' ? input.options[input.selectedIndex].text : input.value.trim();
            profileData[id] = val;
        }
    });

    /* In Phase 2: POST profileData to backend API here */
    /* Example: fetch('/api/profile', { method:'PUT', body: JSON.stringify(profileData), headers:{'Content-Type':'application/json'} }) */

    cancelEdit();
    renderProfile();       // re-render view with new values
    showToast('Profile saved successfully!');
}

/* =============================================
   TOAST
   ============================================= */
function showToast(msg) {
    var toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(function () { toast.classList.add('hidden'); }, 3000);
}

/* =============================================
   SIDEBAR
   ============================================= */
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

function updateSidebarInfo() {
    /* Already set via renderProfile — kept for clarity */
}

/* =============================================
   UTILITY
   ============================================= */
function formatDob(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

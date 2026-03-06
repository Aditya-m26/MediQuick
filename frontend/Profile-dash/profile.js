/* =============================================
   MediQuick – Profile Dashboard Script
   ============================================= */

// ─── CONFIG ──────────────────────────────────────────
var API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : '';

var profileData = {};   // filled from backend
var isEditing = false;

/* All editable field IDs */
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
    var token = localStorage.getItem('mq_token');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }
    loadProfile(token);
});

/* =============================================
   LOAD FROM BACKEND
   ============================================= */
async function loadProfile(token) {
    try {
        var res = await fetch(API_BASE + '/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (res.status === 401) {
            localStorage.removeItem('mq_token');
            localStorage.removeItem('mq_user');
            window.location.href = '../index.html';
            return;
        }

        var data = await res.json();
        var u = data.user;

        /* Map DB fields → profileData */
        profileData = {
            fullName: u.fullName || '',
            mobile: u.mobile || '',
            email: u.email || '',
            dob: u.dob || '',
            gender: u.gender || '',
            age: u.age ? String(u.age) : '',
            address: u.address || '',
            city: u.city || '',
            state: u.state || '',
            pin: u.pin || '',
            blood: u.blood || '',
            weight: u.weight || '',
            height: u.height || '',
            condition: u.healthCondition || '',
            allergy: u.allergy || '',
            meds: u.meds || '',
            ecName: u.ecName || '',
            ecRel: u.ecRel || '',
            ecPhone: u.ecPhone || '',
            drName: u.drName || '',
            drSpec: u.drSpec || '',
            drPhone: u.drPhone || '',
            drHosp: u.drHosp || '',
        };

        renderProfile();

    } catch (err) {
        console.error('Failed to load profile:', err);
        showToast('Could not load profile. Check your connection.');
    }
}

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
    setVal('age', profileData.age ? profileData.age + ' years' : '');

    /* Address */
    setVal('address', profileData.address);
    setVal('city', profileData.city);
    setVal('state', profileData.state);
    setVal('pin', profileData.pin);

    /* Health */
    setVal('blood', profileData.blood);
    setVal('weight', profileData.weight ? profileData.weight + ' kg' : '');
    setVal('height', profileData.height);
    setVal('condition', profileData.condition);
    setVal('allergy', profileData.allergy);
    setVal('meds', profileData.meds);

    /* Emergency contact */
    setVal('ecName', profileData.ecName);
    setVal('ecRel', profileData.ecRel);
    setVal('ecPhone', profileData.ecPhone);

    /* Doctor */
    setVal('drName', profileData.drName);
    setVal('drSpec', profileData.drSpec);
    setVal('drPhone', profileData.drPhone);
    setVal('drHosp', profileData.drHosp);

    /* Avatar initials */
    var name = profileData.fullName || profileData.email || '?';
    var initials = name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2) || '?';
    var bigAv = document.getElementById('bigAvatar');
    var sideAv = document.getElementById('sideAvatar');
    if (bigAv) bigAv.textContent = initials;
    if (sideAv) sideAv.textContent = initials;

    var dispName = document.getElementById('dispName');
    var sideName = document.getElementById('sideName');
    var sideEmail = document.getElementById('sideEmail');
    if (dispName) dispName.textContent = profileData.fullName || '—';
    if (sideName) sideName.textContent = profileData.fullName || '—';
    if (sideEmail) sideEmail.textContent = profileData.email || '—';

    /* SOS button */
    var sosDisp = document.getElementById('sosDisplay');
    var sosBtn = document.getElementById('sosBtn');
    if (sosDisp) {
        sosDisp.textContent = (profileData.ecName && profileData.ecPhone)
            ? profileData.ecName + ' · ' + profileData.ecPhone
            : 'No emergency contact set';
    }
    if (sosBtn) {
        sosBtn.onclick = function () {
            if (profileData.ecPhone) window.location.href = 'tel:' + profileData.ecPhone;
        };
    }

    /* Sidebar health summary */
    var shBlood = document.getElementById('shBlood');
    var shWeight = document.getElementById('shWeight');
    var shCondition = document.getElementById('shCondition');
    var shAllergy = document.getElementById('shAllergy');
    if (shBlood) shBlood.textContent = profileData.blood || '—';
    if (shWeight) shWeight.textContent = profileData.weight ? profileData.weight + ' kg' : '—';
    if (shCondition) shCondition.textContent = profileData.condition || '—';
    if (shAllergy) shAllergy.textContent = profileData.allergy || '—';
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
            var raw = profileData[id] || '';
            if (input.tagName === 'SELECT') {
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
   SAVE – sends to backend
   ============================================= */
async function saveProfile() {
    /* Read all visible inputs into profileData */
    FIELDS.forEach(function (id) {
        var input = document.getElementById('e-' + id);
        if (input && !input.classList.contains('hidden')) {
            profileData[id] = input.tagName === 'SELECT'
                ? input.options[input.selectedIndex].text
                : input.value.trim();
        }
    });

    var token = localStorage.getItem('mq_token');
    if (!token) { window.location.href = '../index.html'; return; }

    /* Map profileData → backend field names */
    var payload = {
        fullName: profileData.fullName,
        mobile: profileData.mobile,
        gender: profileData.gender,
        age: profileData.age ? Number(profileData.age) : undefined,
        dob: profileData.dob,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pin: profileData.pin,
        healthCondition: profileData.condition,
        blood: profileData.blood,
        weight: profileData.weight,
        height: profileData.height,
        allergy: profileData.allergy,
        meds: profileData.meds,
        ecName: profileData.ecName,
        ecRel: profileData.ecRel,
        ecPhone: profileData.ecPhone,
        drName: profileData.drName,
        drSpec: profileData.drSpec,
        drPhone: profileData.drPhone,
        drHosp: profileData.drHosp,
    };

    try {
        var res = await fetch(API_BASE + '/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(payload),
        });

        var data = await res.json();

        if (!res.ok) {
            showToast('Save failed: ' + (data.message || 'Unknown error'));
            return;
        }

        /* Update localStorage cache with latest user */
        localStorage.setItem('mq_user', JSON.stringify(data.user));

        cancelEdit();
        renderProfile();
        showToast('Profile saved successfully!');

    } catch (err) {
        console.error('Save error:', err);
        showToast('Could not save. Check your connection.');
    }
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

/* =============================================
   UTILITY
   ============================================= */
function formatDob(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

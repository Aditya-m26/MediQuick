/* ==============================================
   MediQuick – Login Page Script
   ============================================== */

/* Current state */
let currentRole = 'patient'; /* 'patient' | 'manager' */
let currentTab = 'signin';  /* 'signin'  | 'signup'  */

/* =============================================
   ROLE SELECTION
   ============================================= */
function selectRole(role) {
  currentRole = role;

  /* Update button styles */
  document.getElementById('rolePatient').classList.toggle('active', role === 'patient');
  document.getElementById('roleManager').classList.toggle('active', role === 'manager');

  /* Show / hide form sets */
  document.getElementById('patientForms').classList.toggle('hidden', role !== 'patient');
  document.getElementById('managerForms').classList.toggle('hidden', role !== 'manager');

  /* Always go back to Sign In tab when switching roles */
  switchTab('signin');
}

/* =============================================
   TAB SWITCHING (Sign In / Sign Up)
   ============================================= */
function switchTab(tab) {
  currentTab = tab;

  document.getElementById('tabSignIn').classList.toggle('active', tab === 'signin');
  document.getElementById('tabSignUp').classList.toggle('active', tab === 'signup');

  if (currentRole === 'patient') {
    document.getElementById('patientSignIn').classList.toggle('hidden', tab !== 'signin');
    document.getElementById('patientSignUp').classList.toggle('hidden', tab !== 'signup');
  } else {
    document.getElementById('managerSignIn').classList.toggle('hidden', tab !== 'signin');
    document.getElementById('managerSignUp').classList.toggle('hidden', tab !== 'signup');
  }
}

/* =============================================
   PASSWORD SHOW / HIDE TOGGLE
   ============================================= */
function togglePwd(inputId, btn) {
  var input = document.getElementById(inputId);
  var icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

/* =============================================
   BACKEND API BASE URL
   Auto-detects: localhost → uses port 5000, production → relative /api
   ============================================= */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

/* =============================================
   HELPER – show an error toast inside the form
   ============================================= */
function showAuthError(message) {
  // Remove any existing error
  var existing = document.querySelector('.auth-error-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'auth-error-toast';
  toast.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + message;
  toast.style.cssText = [
    'background:#fee2e2',
    'color:#b91c1c',
    'border:1px solid #fca5a5',
    'border-radius:8px',
    'padding:10px 14px',
    'font-size:13.5px',
    'font-weight:500',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'margin-bottom:12px',
    'animation:fadeIn .25s ease'
  ].join(';');

  // Insert before the submit button of the active form
  var activeForm = document.querySelector('.auth-form:not(.hidden)');
  if (activeForm) {
    var submitBtn = activeForm.querySelector('.submit-btn');
    activeForm.insertBefore(toast, submitBtn);
    setTimeout(function () { toast.remove(); }, 5000);
  }
}

/* =============================================
   FORM SUBMIT – LOGIN
   ============================================= */
async function handleLogin(event, role) {
  event.preventDefault();
  var form = event.target;

  var email = form.querySelector('input[type="email"]').value.trim();
  var password = form.querySelector('input[type="password"]').value;

  // Show loading overlay
  showRoutingOverlay(role === 'patient' ? 'Signing you in…' : 'Accessing Manager Dashboard…', function () { });

  try {
    var res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, email, password })
    });

    var data = await res.json();

    if (!res.ok) {
      // Hide overlay and show error
      document.getElementById('routeOverlay').classList.add('hidden');
      showAuthError(data.message || 'Login failed. Please try again.');
      return;
    }

    // Save token & user to localStorage
    localStorage.setItem('mq_token', data.token);
    localStorage.setItem('mq_user', JSON.stringify(data.user));

    // Redirect to correct dashboard
    if (role === 'patient') {
      window.location.href = 'Order-dash/request.html';
    } else {
      window.location.href = 'Store-dash/index.html';
    }

  } catch (err) {
    document.getElementById('routeOverlay').classList.add('hidden');
    showAuthError('Cannot connect to server. Is the backend running?');
  }
}

/* =============================================
   FORM SUBMIT – SIGN UP
   ============================================= */
async function handleSignup(event, role) {
  event.preventDefault();
  var form = event.target;

  // Collect all named form fields into an object
  var formData = { role };
  var inputs = form.querySelectorAll('input[name], select[name]');
  inputs.forEach(function (el) {
    formData[el.name] = el.value.trim();
  });

  // Show loading overlay
  showRoutingOverlay(role === 'patient' ? 'Creating your account…' : 'Registering your store…', function () { });

  try {
    var res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    var data = await res.json();

    if (!res.ok) {
      document.getElementById('routeOverlay').classList.add('hidden');
      showAuthError(data.message || 'Registration failed. Please try again.');
      return;
    }

    // Save token & user to localStorage
    localStorage.setItem('mq_token', data.token);
    localStorage.setItem('mq_user', JSON.stringify(data.user));

    // Redirect
    if (role === 'patient') {
      window.location.href = 'Order-dash/request.html';
    } else {
      window.location.href = 'Store-dash/index.html';
    }

  } catch (err) {
    document.getElementById('routeOverlay').classList.add('hidden');
    showAuthError('Cannot connect to server. Is the backend running?');
  }
}


/* =============================================
   ROUTING OVERLAY ANIMATION
   ============================================= */
function showRoutingOverlay(message, callback) {
  var overlay = document.getElementById('routeOverlay');
  var msgEl = document.getElementById('routeMsg');

  msgEl.textContent = message;
  overlay.classList.remove('hidden');

  /* Navigate after brief animation */
  setTimeout(callback, 1600);
}

/* =============================================
   INIT – ensure correct state on page load
   ============================================= */
window.addEventListener('DOMContentLoaded', function () {
  selectRole('patient');
  switchTab('signin');
});

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
   FORM SUBMIT – LOGIN
   ============================================= */
function handleLogin(event, role) {
  event.preventDefault();

  var msg = role === 'patient'
    ? 'Signing you in…'
    : 'Accessing Manager Dashboard…';

  showRoutingOverlay(msg, function () {
    if (role === 'patient') {
      /* Route to patient order dashboard */
      window.location.href = 'Order-dash/request.html';
    } else {
      /* Route to store manager dashboard */
      window.location.href = 'Store-dash/index.html';
    }
  });
}

/* =============================================
   FORM SUBMIT – SIGN UP
   ============================================= */
function handleSignup(event, role) {
  event.preventDefault();

  var msg = role === 'patient'
    ? 'Creating your account…'
    : 'Registering your store…';

  showRoutingOverlay(msg, function () {
    if (role === 'patient') {
      window.location.href = 'Order-dash/request.html';
    } else {
      window.location.href = 'Store-dash/index.html';
    }
  });
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

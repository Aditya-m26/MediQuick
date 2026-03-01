/* ==============================================
   MediQuick – Reminder Dashboard JS
   Full-width redesign + missed detection + notifications
   ============================================== */

/* =============================================
   STATE
   ============================================= */
let reminders = [];
let editingId = null;
let selectedColour = 'teal';
let currentTab = 'daily';
let streak = 4;
let notifPermission = 'default'; // 'default' | 'granted' | 'denied'
let scheduledTimers = {};        // id → setTimeout handle

/* =============================================
   SEED DATA
   ============================================= */
const SEED = [
  { id: 1, name: 'Paracetamol 500mg', dose: '1 tablet', time: '08:00', instruction: 'After breakfast', frequency: 'Daily', colour: 'teal', taken: false, refillOn: false, stock: 30, alertAt: 5 },
  { id: 2, name: 'Metformin 500mg', dose: '1 tablet', time: '13:00', instruction: 'Before lunch', frequency: 'Daily', colour: 'purple', taken: false, refillOn: true, stock: 4, alertAt: 5 },
  { id: 3, name: 'Atorvastatin 10mg', dose: '1 tablet', time: '20:00', instruction: 'After dinner', frequency: 'Daily', colour: 'orange', taken: false, refillOn: true, stock: 3, alertAt: 5 },
  { id: 4, name: 'Vitamin D3 60K', dose: '1 capsule', time: '09:00', instruction: 'After breakfast', frequency: 'Weekly', colour: 'green', taken: false, refillOn: false, stock: 12, alertAt: 5 },
  { id: 5, name: 'Dolo 650', dose: '1 tablet', time: '22:00', instruction: 'After dinner', frequency: 'Daily', colour: 'red', taken: false, refillOn: false, stock: 8, alertAt: 5 },
  { id: 6, name: 'Cetirizine 10mg', dose: '1 tablet', time: '21:00', instruction: 'Before dinner', frequency: 'Daily', colour: 'blue', taken: false, refillOn: false, stock: 15, alertAt: 5 },
];

/* =============================================
   INIT
   ============================================= */
window.addEventListener('DOMContentLoaded', function () {
  reminders = SEED.map(function (r) { return Object.assign({}, r); });

  updateTopbarDate();
  renderAll();
  scheduleAllNotifications();
  checkNotifPermission();

  // Auto-refresh every 30 seconds for missed detection
  setInterval(function () {
    renderAll();
  }, 30000);

  // Refill toggle in modal
  document.getElementById('mRefill').addEventListener('change', function () {
    document.getElementById('refillExtra').classList.toggle('hidden', !this.checked);
  });
});

/* =============================================
   DATE
   ============================================= */
function updateTopbarDate() {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var now = new Date();
  document.getElementById('topbarDate').textContent =
    days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
}

/* =============================================
   SIDEBAR TOGGLE (mobile)
   ============================================= */
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

/* =============================================
   TAB SWITCHING
   ============================================= */
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabDaily').classList.toggle('active', tab === 'daily');
  document.getElementById('tabRefill').classList.toggle('active', tab === 'refill');
  document.getElementById('dailyTab').classList.toggle('hidden', tab !== 'daily');
  document.getElementById('refillTab').classList.toggle('hidden', tab !== 'refill');
}

/* =============================================
   RENDER ALL
   ============================================= */
function renderAll() {
  renderDailyGrid();
  renderRefillGrid();
  updateSidebarStats();
}

/* =============================================
   MISSED DETECTION
   ============================================= */
function isMissed(r) {
  if (r.taken) return false;
  var now = new Date();
  var rDate = new Date();
  var parts = r.time.split(':');
  rDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  return rDate < now; // past time AND not taken
}

/* =============================================
   DAILY GRID
   ============================================= */
function renderDailyGrid() {
  var grid = document.getElementById('reminderGrid');
  var empty = document.getElementById('dailyEmpty');

  if (reminders.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  var sorted = reminders.slice().sort(function (a, b) {
    return a.time.localeCompare(b.time);
  });

  var groups = { Morning: [], Afternoon: [], Evening: [], Night: [] };
  var groupIcons = { Morning: 'fa-sun', Afternoon: 'fa-cloud-sun', Evening: 'fa-moon', Night: 'fa-star-and-crescent' };

  sorted.forEach(function (r) {
    var h = parseInt(r.time.split(':')[0]);
    if (h >= 5 && h < 12) groups.Morning.push(r);
    else if (h >= 12 && h < 17) groups.Afternoon.push(r);
    else if (h >= 17 && h < 21) groups.Evening.push(r);
    else groups.Night.push(r);
  });

  var html = '';

  Object.keys(groups).forEach(function (grp) {
    if (groups[grp].length === 0) return;
    html += '<div class="group-header"><i class="fa-solid ' + groupIcons[grp] + '"></i>' + grp + '</div>';
    groups[grp].forEach(function (r) {
      html += buildCard(r);
    });
  });

  grid.innerHTML = html;
}

function buildCard(r) {
  var missed = isMissed(r);
  var timeStr = fmt12(r.time);
  var timeClass = missed && !r.taken ? 'time-missed' : '';

  var stateHtml = r.taken
    ? '<span class="state-badge badge-taken">✓ Taken</span>'
    : missed
      ? '<span class="state-badge badge-missed">⚠ Missed</span>'
      : '<span class="state-badge badge-pending">Pending</span>';

  var takenClass = r.taken ? 'taken' : '';
  var missedClass = missed && !r.taken ? 'missed' : '';

  var refillWarn = (r.refillOn && r.stock <= r.alertAt)
    ? '<div class="refill-warn"><i class="fa-solid fa-triangle-exclamation"></i> Refill needed · ' + r.stock + ' left</div>'
    : '';

  var takeDisabled = (r.taken || missed) ? 'disabled' : '';
  var takeLabel = r.taken ? '<i class="fa-solid fa-check"></i> Taken'
    : missed ? '<i class="fa-solid fa-xmark"></i> Missed'
      : '<i class="fa-solid fa-check"></i> Take Now';

  return '<div class="reminder-card card-' + r.colour + ' ' + takenClass + ' ' + missedClass + '" id="rc-' + r.id + '">' +
    '<div class="card-top">' +
    '<div class="card-icon"><i class="fa-solid fa-capsules"></i></div>' +
    '<div class="card-title-block">' +
    '<p class="card-name">' + r.name + '</p>' +
    '<p class="card-time ' + timeClass + '">' + timeStr + ' · ' + r.frequency + '</p>' +
    '</div>' +
    stateHtml +
    '</div>' +
    '<div class="card-meta">' +
    '<i class="fa-solid fa-pills"></i>' + r.dose +
    ' &nbsp;·&nbsp; <i class="fa-solid fa-utensils"></i>' + r.instruction +
    '</div>' +
    (refillWarn ? refillWarn : '') +
    '<div class="card-actions">' +
    '<button class="take-btn" ' + takeDisabled + ' onclick="markTaken(' + r.id + ')">' + takeLabel + '</button>' +
    '<button class="del-btn" onclick="deleteReminder(' + r.id + ')"><i class="fa-solid fa-trash"></i></button>' +
    '</div>' +
    '</div>';
}

/* =============================================
   MARK TAKEN
   ============================================= */
function markTaken(id) {
  var r = reminders.find(function (x) { return x.id === id; });
  if (!r || r.taken) return;
  r.taken = true;
  if (r.refillOn) r.stock = Math.max(0, r.stock - 1);
  renderAll();
}

/* =============================================
   DELETE
   ============================================= */
function deleteReminder(id) {
  reminders = reminders.filter(function (r) { return r.id !== id; });
  clearTimeout(scheduledTimers[id]);
  delete scheduledTimers[id];
  renderAll();
}

/* =============================================
   REFILL GRID
   ============================================= */
function renderRefillGrid() {
  var alertOnes = reminders.filter(function (r) {
    return r.refillOn && r.stock <= r.alertAt;
  });

  var grid = document.getElementById('refillGrid');
  var empty = document.getElementById('refillEmpty');
  var badge = document.getElementById('tabBadge');

  badge.textContent = alertOnes.length;
  badge.style.display = alertOnes.length === 0 ? 'none' : 'flex';

  if (alertOnes.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = alertOnes.map(function (r) {
    var pct = Math.min(100, Math.round((r.stock / (r.alertAt * 3)) * 100));
    return '<div class="refill-card">' +
      '<div class="refill-card-top">' +
      '<div class="refill-card-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>' +
      '<div>' +
      '<p class="refill-card-name">' + r.name + '</p>' +
      '<p class="refill-card-stock">Only ' + r.stock + ' units left</p>' +
      '<p class="refill-card-freq">' + r.frequency + ' · ' + r.dose + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="stock-bar-wrap"><div class="stock-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<a href="../Order-dash/request.html" class="order-btn"><i class="fa-solid fa-cart-plus"></i> Order Now</a>' +
      '</div>';
  }).join('');
}

/* =============================================
   SIDEBAR STATS + RING
   ============================================= */
function updateSidebarStats() {
  var taken = reminders.filter(function (r) { return r.taken; }).length;
  var missed = reminders.filter(function (r) { return isMissed(r); }).length;
  var pending = reminders.length - taken - missed;
  var total = reminders.length;
  var pct = total === 0 ? 0 : Math.round((taken / total) * 100);
  var circ = 2 * Math.PI * 30; // r=30

  document.getElementById('sideTaken').textContent = taken;
  document.getElementById('sideMissed').textContent = missed;
  document.getElementById('sidePending').textContent = Math.max(0, pending);
  document.getElementById('ringPct').textContent = pct + '%';
  document.getElementById('streakNum').textContent = streak;
  document.getElementById('progressRing').style.strokeDashoffset =
    circ - (circ * pct / 100);
}

/* =============================================
   MODAL
   ============================================= */
function openModal(id) {
  editingId = id || null;
  selectedColour = 'teal';

  // Reset
  ['mName', 'mDose', 'mTime', 'mStock', 'mAlertAt'].forEach(function (f) {
    document.getElementById(f).value = '';
  });
  document.getElementById('mInstruction').selectedIndex = 0;
  document.getElementById('mFrequency').selectedIndex = 0;
  document.getElementById('mRefill').checked = false;
  document.getElementById('refillExtra').classList.add('hidden');
  document.querySelectorAll('.cdot').forEach(function (d) {
    d.classList.toggle('active', d.dataset.c === 'teal');
  });

  if (editingId) {
    var r = reminders.find(function (x) { return x.id === editingId; });
    if (r) {
      document.getElementById('mName').value = r.name;
      document.getElementById('mDose').value = r.dose;
      document.getElementById('mTime').value = r.time;
      document.getElementById('mInstruction').value = r.instruction;
      document.getElementById('mFrequency').value = r.frequency;
      document.getElementById('mRefill').checked = r.refillOn;
      document.getElementById('mStock').value = r.stock;
      document.getElementById('mAlertAt').value = r.alertAt;
      if (r.refillOn) document.getElementById('refillExtra').classList.remove('hidden');
      selectedColour = r.colour;
      document.querySelectorAll('.cdot').forEach(function (d) {
        d.classList.toggle('active', d.dataset.c === r.colour);
      });
    }
    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Reminder';
    document.getElementById('saveBtn').innerHTML = '<i class="fa-solid fa-pen"></i> Update';
  } else {
    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-bell"></i> Add Reminder';
    document.getElementById('saveBtn').innerHTML = '<i class="fa-solid fa-bell"></i> Save';
  }

  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('mName').focus();
}

function closeModal() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  editingId = null;
}

function pickColour(btn) {
  document.querySelectorAll('.cdot').forEach(function (d) { d.classList.remove('active'); });
  btn.classList.add('active');
  selectedColour = btn.dataset.c;
}

function saveReminder() {
  var name = document.getElementById('mName').value.trim();
  var dose = document.getElementById('mDose').value.trim();
  var time = document.getElementById('mTime').value;
  var instr = document.getElementById('mInstruction').value;
  var freq = document.getElementById('mFrequency').value;
  var refill = document.getElementById('mRefill').checked;
  var stock = parseInt(document.getElementById('mStock').value) || 99;
  var alertAt = parseInt(document.getElementById('mAlertAt').value) || 5;

  if (!name || !dose || !time) {
    alert('Please fill in Medicine Name, Dose, and Time.');
    return;
  }

  if (editingId) {
    var r = reminders.find(function (x) { return x.id === editingId; });
    if (r) {
      Object.assign(r, {
        name, dose, time, instruction: instr, frequency: freq,
        colour: selectedColour, refillOn: refill, stock, alertAt
      });
    }
  } else {
    var nr = {
      id: Date.now(), name, dose, time, instruction: instr, frequency: freq,
      colour: selectedColour, taken: false, refillOn: refill, stock, alertAt
    };
    reminders.push(nr);
    scheduleNotification(nr);
  }

  closeModal();
  renderAll();
}

/* =============================================
   BROWSER NOTIFICATIONS
   ============================================= */
function checkNotifPermission() {
  if (!('Notification' in window)) return;
  notifPermission = Notification.permission;
  updateNotifBtn();
}

function requestNotifPermission() {
  if (!('Notification' in window)) {
    alert('Your browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'granted') {
    // Already granted — show status
    updateNotifBtn();
    return;
  }

  Notification.requestPermission().then(function (perm) {
    notifPermission = perm;
    updateNotifBtn();
    if (perm === 'granted') {
      scheduleAllNotifications();
      showNotif('✅ MediQuick Alerts On', 'You will be notified when it\'s time to take your medicine!');
    }
  });
}

function updateNotifBtn() {
  var btn = document.getElementById('notifBtn');
  var icon = document.getElementById('notifIcon');
  var text = document.getElementById('notifText');

  if (notifPermission === 'granted') {
    btn.classList.add('granted');
    icon.className = 'fa-solid fa-bell';
    text.textContent = 'Alerts Active';
  } else if (notifPermission === 'denied') {
    icon.className = 'fa-solid fa-bell-slash';
    text.textContent = 'Alerts Blocked';
    btn.style.cursor = 'not-allowed';
  } else {
    icon.className = 'fa-solid fa-bell-slash';
    text.textContent = 'Enable Alerts';
  }
}

function scheduleAllNotifications() {
  if (Notification.permission !== 'granted') return;
  reminders.forEach(function (r) { scheduleNotification(r); });
}

function scheduleNotification(r) {
  if (Notification.permission !== 'granted') return;
  if (r.taken) return;

  var now = new Date();
  var parts = r.time.split(':');
  var fire = new Date();
  fire.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);

  var delay = fire - now;
  if (delay <= 0) return; // already past

  // Clear any existing timer for this reminder
  clearTimeout(scheduledTimers[r.id]);

  scheduledTimers[r.id] = setTimeout(function () {
    if (!r.taken) {
      showNotif(
        '💊 Time to take: ' + r.name,
        r.dose + ' · ' + r.instruction + '\nMediQuick Reminder'
      );
    }
  }, delay);
}

function showNotif(title, body) {
  if (Notification.permission !== 'granted') return;
  var n = new Notification(title, {
    body: body,
    icon: '../Order-dash/favicon.ico',
    badge: '../Order-dash/favicon.ico',
    tag: 'mediquick-reminder',
    requireInteraction: true
  });
  // Auto-close after 8 seconds
  setTimeout(function () { n.close(); }, 8000);
}

/* =============================================
   UTILITY
   ============================================= */
function fmt12(t) {
  var p = t.split(':');
  var h = parseInt(p[0]);
  var m = p[1];
  var a = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + a;
}

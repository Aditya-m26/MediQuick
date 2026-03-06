// ===================================================
//  MediQuick – cart.js  (Data Layer)
//  Cart stored in localStorage. Helpers used by cart-ui.js.
// ===================================================

/* ──── Cart array (loaded from localStorage) ──── */
var cart = JSON.parse(localStorage.getItem('cart')) || [];

/* ──── Persist cart to localStorage ──── */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/* ──── Add (or increment) an item ──── */
function addToCart(item) {
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type || 'Tablet',
      category: item.category || '',
      requiresPrescription: item.prescription || item.requiresPrescription || false,
      qty: 1
    });
  }

  saveCart();
  if (typeof renderCart === 'function') {
    renderCart();
    updateCartBadge();
  }
}

/* ──── Remove one item by id ──── */
function removeFromCart(id) {
  cart = cart.filter(function (it) { return it.id !== id; });
  saveCart();
}

/* ──── Change qty (+/-). Removes item if qty drops to 0 ──── */
function updateQty(id, delta) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) {
        removeFromCart(id);
      } else {
        saveCart();
      }
      return;
    }
  }
}

/* ──── Count medicines that need a prescription ──── */
function getPrescriptionCount() {
  return cart.filter(function (it) { return it.requiresPrescription; }).length;
}

/* ──── Medicine sub-total ──── */
function getSubtotal() {
  return cart.reduce(function (acc, it) { return acc + it.price * it.qty; }, 0);
}
// ===== CART DATA =====
// Cart is stored in localStorage so items stay even if you refresh

var cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save the cart array to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add an item to the cart (or increase qty if already there)
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
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }

  saveCart();

  // If this page has a renderCart function (cart.html), refresh the view
  if (typeof renderCart === "function") {
    renderCart();
    updateCartBadge();
  }
}

// Remove an item from the cart by its id
function removeFromCart(id) {
  var newCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id !== id) {
      newCart.push(cart[i]);
    }
  }
  cart = newCart;
  saveCart();
}

// Change the qty of an item (+1 or -1)
function updateQty(id, change) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += change;

      if (cart[i].qty <= 0) {
        removeFromCart(id);
      } else {
        saveCart();
      }
      return;
    }
  }
}
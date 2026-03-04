// ===== CART UI =====
// This file draws the cart items on the page

// Run everything when the page loads
renderCart();
updateCartBadge();

// Sidebar toggle
function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
}

// Draw all cart items on the page
function renderCart() {
  var emptyDiv = document.getElementById("emptyCart");
  var listDiv = document.getElementById("cartList");

  // Clear whatever was there before
  listDiv.innerHTML = "";

  var orderBtn = document.getElementById("placeOrderBtn");

  // If cart is empty, show the empty message and hide Place Order
  if (cart.length === 0) {
    emptyDiv.style.display = "flex";
    orderBtn.style.display = "none";
    return;
  }

  // Cart has items — hide the empty message, show Place Order
  emptyDiv.style.display = "none";
  orderBtn.style.display = "flex";

  // Build a card for each item
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];

    var card = document.createElement("div");
    card.className = "cart-card";

    card.innerHTML =
      '<div class="cart-card-left">' +
      '<div class="medicine-icon"><i class="fa-solid fa-pills"></i></div>' +
      '<div>' +
      '<p class="medicine-name">' + item.name + '</p>' +
      '<p class="medicine-price">₹' + item.price + ' each</p>' +
      '</div>' +
      '</div>' +
      '<div class="qty-controls">' +
      '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\', -1)">−</button>' +
      '<span class="qty-number">' + item.qty + '</span>' +
      '<button class="qty-btn" onclick="changeQty(\'' + item.id + '\', +1)">+</button>' +
      '</div>' +
      '<button class="remove-btn" onclick="deleteItem(\'' + item.id + '\')" title="Remove">' +
      '<i class="fa-solid fa-trash"></i>' +
      '</button>';

    listDiv.appendChild(card);
  }
}


// Change qty of an item (+1 or -1)
function changeQty(id, change) {
  updateQty(id, change);   // defined in cart.js
  renderCart();
  updateCartBadge();
}


// Remove an item completely
function deleteItem(id) {
  removeFromCart(id);      // defined in cart.js
  renderCart();
  updateCartBadge();
}


// Update the cart count badge in the header
function updateCartBadge() {
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].qty;
  }
  document.getElementById("cartCount").textContent = total;
}

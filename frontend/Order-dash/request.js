// ===== SIDEBAR =====

function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
}


// ===== CART COUNT in header =====

function updateCartCount() {
  var cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  var total = 0;

  for (var i = 0; i < cartItems.length; i++) {
    total += cartItems[i].qty;
  }

  document.getElementById("cartCount").textContent = total;
}

// Run on page load
updateCartCount();

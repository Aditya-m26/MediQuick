// ===== LOCATION SYSTEM =====

// Load saved location when page opens
window.onload = function () {
  var saved = localStorage.getItem("userLocation");
  if (saved) {
    document.getElementById("locationText").textContent = saved;
  }
};

// Toggle the small dropdown panel
function openMiniPanel() {
  var panel = document.getElementById("miniPanel");
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
  } else {
    panel.classList.add("hidden");
  }
}

// Open the full location popup
function openPopup() {
  document.getElementById("miniPanel").classList.add("hidden");
  document.getElementById("locationPopup").classList.remove("hidden");
  document.getElementById("overlay").classList.remove("hidden");

  // Small delay so CSS transition plays
  setTimeout(function () {
    document.getElementById("locationPopup").classList.add("show");
  }, 10);
}

// Close the location popup
function closePopup() {
  document.getElementById("locationPopup").classList.remove("show");
  setTimeout(function () {
    document.getElementById("locationPopup").classList.add("hidden");
  }, 200);
  document.getElementById("overlay").classList.add("hidden");
}

// ESC key to close popup
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closePopup();
  }
});

// Get location using GPS
function useGPS() {
  if (!navigator.geolocation) {
    alert("GPS is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon;

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var city = data.address.city || data.address.town || data.address.village || "Your City";
        var pin = data.address.postcode || "";
        var text = city + (pin ? " - " + pin : "");

        localStorage.setItem("userLocation", text);
        if (pin) localStorage.setItem("mq_pincode", pin);
        document.getElementById("locationText").textContent = text;
        closePopup();
        // Refresh stores with new pincode filter
        if (typeof loadStores === 'function') loadStores();
        if (typeof loadPharmacies === 'function') loadPharmacies();
      })
      .catch(function () {
        alert("Could not get location. Please try pincode instead.");
      });

  }, function () {
    alert("Location permission was denied.");
  });
}

// Get location using pincode
function usePincode() {
  var pin = document.getElementById("pincodeInput").value.trim();

  if (pin.length !== 6) {
    alert("Please enter a valid 6-digit pincode.");
    return;
  }

  fetch("https://api.postalpincode.in/pincode/" + pin)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data[0].Status !== "Success") {
        alert("Invalid pincode. Please try again.");
        return;
      }

      var city = data[0].PostOffice[0].District;
      var text = city + " - " + pin;

      localStorage.setItem("userLocation", text);
      localStorage.setItem("mq_pincode", pin);
      document.getElementById("locationText").textContent = text;
      closePopup();
      // Refresh stores with new pincode filter
      if (typeof loadStores === 'function') loadStores();
      if (typeof loadPharmacies === 'function') loadPharmacies();
    })
    .catch(function () {
      alert("Could not verify pincode. Check your internet connection.");
    });
}
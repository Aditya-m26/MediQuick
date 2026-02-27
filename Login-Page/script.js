
function goToStep2() {
document.getElementById("step1").classList.add("hidden");
document.getElementById("step2").classList.remove("hidden");
document.getElementById("stepText").innerText = "Step 2 of 2";
}

function submitForm() {
  window.location.href = "dashboard.html";
}


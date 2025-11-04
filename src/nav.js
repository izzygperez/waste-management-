// /src/nav.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isExpanded);
    navList.classList.toggle("show");
  });
});



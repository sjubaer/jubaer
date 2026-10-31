
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuLinks = mobileMenu.querySelectorAll(".menu-links a");

let isMenuOpen = false;

function openMenu() {
  if (isMenuOpen) return;

  isMenuOpen = true;

  mobileMenu.classList.add("open");
  menuToggle.classList.add("active");

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");

  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.removeAttribute("inert");

  document.body.classList.add("menu-open");

  // Move keyboard focus into the menu
  const firstLink = mobileMenu.querySelector(".menu-links a");
  firstLink.focus();
}

function closeMenu() {
  if (!isMenuOpen) return;

  isMenuOpen = false;

  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("active");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");

  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.setAttribute("inert", "");

  document.body.classList.remove("menu-open");

  // Return focus to the menu button
  menuToggle.focus();
}

// Toggle menu
menuToggle.addEventListener("click", () => {
  isMenuOpen ? closeMenu() : openMenu();
});

// Close after clicking a navigation link
menuLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isMenuOpen) {
    closeMenu();
  }
});

// Close if clicking outside the menu content
mobileMenu.addEventListener("click", (event) => {
  if (event.target === mobileMenu) {
    closeMenu();
  }
});

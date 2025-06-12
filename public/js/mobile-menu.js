document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#main-nav");

  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
});

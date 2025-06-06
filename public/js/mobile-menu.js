document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');
  
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', function() {
      nav.classList.toggle('show');
      console.log('Menú clickeado - Estado:', nav.classList.contains('show'));
    });
  } else {
    console.error('No se encontraron elementos del menú móvil');
  }
});
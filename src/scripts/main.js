// Scroll suave para os links do menu
document.querySelectorAll('.menu a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: 'smooth',
      });
    }
  });
});

// Animação do header ao rolar
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Menu mobile toggle
const menuToggle = document.createElement('div');
menuToggle.classList.add('menu-toggle');
menuToggle.innerHTML = '☰';
document.querySelector('.header .container').appendChild(menuToggle);

menuToggle.addEventListener('click', () => {
  document.querySelector('.menu').classList.toggle('active');
});

// Formulário
const form = document.getElementById('form-contato');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
  });
}

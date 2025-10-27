// ==========================
// Scroll suave para âncoras do menu
// ==========================
document.querySelectorAll('.menu a').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 90;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ==========================
// HEADER: transparência ao rolar
// ==========================
const header = document.querySelector('.header');
function applyHeaderState() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', applyHeaderState);
applyHeaderState();

// ==========================
// MENU MOBILE
// ==========================
const menuBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.header .menu');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
}

// ==========================
// SUBMENU: abre por clique no mobile
// ==========================
document.querySelectorAll('.submenu-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if (!isMobile) return;
    e.preventDefault();
    const li = btn.closest('.has-submenu');
    if (!li) return;

    const open = li.classList.contains('open');
    document.querySelectorAll('.has-submenu.open').forEach((x) => x.classList.remove('open'));
    if (!open) li.classList.add('open');
  });
});

// Fecha menus ao redimensionar
window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && nav) {
    nav.classList.remove('active');
    document.querySelectorAll('.has-submenu.open').forEach((x) => x.classList.remove('open'));
  }
});

// ==========================
// FORMULÁRIO DE CONTATO
// ==========================
const form = document.getElementById('form-contato');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Obrigado por entrar em contato. 📨');
    form.reset();
  });
}

// ==========================
// FAQ: abre suavemente
// ==========================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Fecha todos antes de abrir outro
    faqItems.forEach((i) => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ==========================
// HERO / Carrossel automático com pontinhos
// ==========================
(() => {
  const hero = document.querySelector('.hero');
  const slidesWrap = document.querySelector('.hero-slides');
  if (!hero || !slidesWrap) return;

  const slides = Array.from(slidesWrap.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  const controls = hero.querySelector('.hero-controls');
  if (!controls) return;

  const btnPrev = controls.querySelector('.arrow.prev');
  const btnNext = controls.querySelector('.arrow.next');
  const dotsWrap = controls.querySelector('.dots');

  // Cria dots dinamicamente
  if (dotsWrap && dotsWrap.children.length !== slides.length) {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
      dotsWrap.appendChild(dot);
    }
  }

  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.dot')) : [];
  let index = slides.findIndex((s) => s.classList.contains('is-active'));
  if (index < 0) index = 0;
  let timer = null;
  const INTERVAL = 3500;

  const setActive = (i) => {
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    index = i;
  };
  const next = () => setActive((index + 1) % slides.length);
  const prev = () => setActive((index - 1 + slides.length) % slides.length);
  const start = () => { stop(); timer = setInterval(next, INTERVAL); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  // Eventos
  btnNext && btnNext.addEventListener('click', () => { stop(); next(); start(); });
  btnPrev && btnPrev.addEventListener('click', () => { stop(); prev(); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stop(); setActive(i); start(); }));

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);

  // Swipe no mobile
  let touchX = null;
  hero.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { stop(); (dx < 0 ? next() : prev()); start(); }
    touchX = null;
  });

  setActive(index);
  start();
})();
// Encolhe ao rolar
window.addEventListener('scroll', () => {
  const h = document.querySelector('.site-header');
  if(!h) return;
  h.classList.toggle('scrolled', window.scrollY > 10);
});

// Burger / menu mobile
(() => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if(!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // fecha ao clicar em link (mobile)
  nav.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================
   VGS Geotechnical Services — Main JS
   ============================================ */

// ---- Navbar scroll effect ----
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ---- Mobile menu toggle ----
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ---- Scroll reveal animation ----
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ---- Counter animation for stats ----
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  function update() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  update();
}

const counterElements = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.getAttribute('data-count'));
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counterElements.forEach(el => counterObserver.observe(el));

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Active nav link highlighting ----
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ---- Gallery photo viewer ----
const galleryGrid = document.querySelector('.gallery-grid');
const galleryLightbox = document.querySelector('.gallery-lightbox');

if (galleryGrid && galleryLightbox) {
  const lightboxImage = galleryLightbox.querySelector('img');
  const lightboxCaption = galleryLightbox.querySelector('.gallery-lightbox-caption');

  galleryGrid.addEventListener('click', event => {
    const button = event.target.closest('.gallery-open');
    if (!button) return;

    const image = button.querySelector('img');
    const caption = button.closest('.gallery-item').querySelector('.overlay h4');
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption.textContent;
    galleryLightbox.showModal();
  });

  galleryLightbox.querySelector('.gallery-lightbox-close').addEventListener('click', () => {
    galleryLightbox.close();
  });

  galleryLightbox.addEventListener('click', event => {
    if (event.target === galleryLightbox) galleryLightbox.close();
  });
}

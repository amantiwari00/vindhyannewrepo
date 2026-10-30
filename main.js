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
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (!href) return;
  const linkPath = href.split('#')[0].replace(/\/$/, '') || '/';
  if (currentPath === linkPath || ((currentPath === '' || currentPath === '/home') && linkPath === '/')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
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


/* ========================================================
   VGS Cookie Consent & Preferences Management System
   ======================================================== */
(function initCookieConsent() {
  const CONSENT_KEY = 'vgs_cookie_consent';
  const CONSENT_COOKIE_DAYS = 365;

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(prefix) === 0) {
        try {
          return decodeURIComponent(c.substring(prefix.length, c.length));
        } catch (e) {
          return c.substring(prefix.length, c.length);
        }
      }
    }
    return null;
  }

  function getStoredConsent() {
    try {
      const fromLocal = localStorage.getItem(CONSENT_KEY);
      if (fromLocal) return JSON.parse(fromLocal);
      const fromCookie = getCookie(CONSENT_KEY);
      if (fromCookie) return JSON.parse(fromCookie);
    } catch (e) {
      console.warn('Cookie consent parse error:', e);
    }
    return null;
  }

  function saveConsent(consentData) {
    const payload = {
      accepted: consentData.accepted,
      level: consentData.level || 'custom',
      necessary: true,
      analytics: Boolean(consentData.analytics),
      functional: Boolean(consentData.functional),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
      setCookie(CONSENT_KEY, JSON.stringify(payload), CONSENT_COOKIE_DAYS);
    } catch (e) {
      console.warn('Failed to save cookie consent:', e);
    }

    window.dispatchEvent(new CustomEvent('vgsCookieConsentUpdated', { detail: payload }));
    return payload;
  }

  function ensureBannerMarkup() {
    if (document.getElementById('vgsCookieConsent')) return;

    const banner = document.createElement('div');
    banner.id = 'vgsCookieConsent';
    banner.className = 'vgs-cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Cookie and Privacy Preferences');

    banner.innerHTML = `
      <div class="vgs-cookie-wrapper">
        <div class="vgs-cookie-header">
          <div class="vgs-cookie-title-group">
            <span class="vgs-cookie-icon">🍪</span>
            <h3>Cookie &amp; Privacy Preferences</h3>
          </div>
          <button type="button" class="vgs-cookie-close" id="vgsCookieClose" aria-label="Dismiss preferences banner">&times;</button>
        </div>
        <div class="vgs-cookie-body">
          <p>
            We use cookies to maintain website security, remember your form inputs, and evaluate site traffic to improve our geotechnical services. You can accept all, reject non-essential cookies, or customize your preferences. For more information, please read our <a href="/privacy-policy">Privacy Policy</a>.
          </p>
          
          <div class="vgs-cookie-details" id="vgsCookieDetails" style="display: none;">
            <div class="vgs-cookie-category">
              <div class="vgs-category-info">
                <strong>Strictly Necessary</strong>
                <span class="vgs-category-desc">Required for security, core page navigation, and verified form submissions. Cannot be disabled.</span>
              </div>
              <label class="vgs-switch" aria-label="Strictly Necessary Cookies">
                <input type="checkbox" checked disabled>
                <span class="vgs-slider locked"></span>
              </label>
            </div>
            
            <div class="vgs-cookie-category">
              <div class="vgs-category-info">
                <strong>Analytics &amp; Performance</strong>
                <span class="vgs-category-desc">Helps us evaluate site traffic patterns and optimize inquiries without tracking personal identities.</span>
              </div>
              <label class="vgs-switch" aria-label="Analytics Cookies">
                <input type="checkbox" id="vgsAnalyticsConsent" checked>
                <span class="vgs-slider"></span>
              </label>
            </div>
            
            <div class="vgs-cookie-category">
              <div class="vgs-category-info">
                <strong>Functional &amp; Experience</strong>
                <span class="vgs-category-desc">Remembers user interface preferences and temporary contact form inputs for your convenience.</span>
              </div>
              <label class="vgs-switch" aria-label="Functional Cookies">
                <input type="checkbox" id="vgsFunctionalConsent" checked>
                <span class="vgs-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="vgs-cookie-actions">
          <button type="button" class="btn btn-primary vgs-cookie-btn" id="vgsAcceptAllBtn">Accept All</button>
          <button type="button" class="btn btn-outline vgs-cookie-btn" id="vgsDeclineBtn">Reject Non-Essential</button>
          <button type="button" class="vgs-cookie-text-btn" id="vgsCustomizeBtn">Customize Settings</button>
          <button type="button" class="btn btn-primary vgs-cookie-btn" id="vgsSaveCustomBtn" style="display:none;">Save Choices</button>
        </div>
      </div>
    `;

    const badge = document.createElement('button');
    badge.id = 'vgsCookieBadge';
    badge.className = 'vgs-cookie-badge';
    badge.setAttribute('type', 'button');
    badge.setAttribute('title', 'Cookie Preferences');
    badge.setAttribute('aria-label', 'Open Cookie Preferences');
    badge.innerHTML = '<span>🍪</span>';

    document.body.appendChild(banner);
    document.body.appendChild(badge);

    bindBannerEvents();
  }

  function showBanner(customize = false) {
    const banner = document.getElementById('vgsCookieConsent');
    const badge = document.getElementById('vgsCookieBadge');
    if (!banner) return;

    const details = document.getElementById('vgsCookieDetails');
    const customizeBtn = document.getElementById('vgsCustomizeBtn');
    const saveBtn = document.getElementById('vgsSaveCustomBtn');
    const stored = getStoredConsent();

    if (stored) {
      const analyticsCheckbox = document.getElementById('vgsAnalyticsConsent');
      const functionalCheckbox = document.getElementById('vgsFunctionalConsent');
      if (analyticsCheckbox) analyticsCheckbox.checked = stored.analytics;
      if (functionalCheckbox) functionalCheckbox.checked = stored.functional;
    }

    if (customize) {
      if (details) details.style.display = 'block';
      if (customizeBtn) customizeBtn.style.display = 'none';
      if (saveBtn) saveBtn.style.display = 'inline-flex';
    }

    banner.classList.add('visible');
    if (badge) badge.classList.add('hidden');
  }

  function hideBanner() {
    const banner = document.getElementById('vgsCookieConsent');
    const badge = document.getElementById('vgsCookieBadge');
    if (banner) banner.classList.remove('visible');
    if (badge) badge.classList.remove('hidden');
  }

  function bindBannerEvents() {
    const banner = document.getElementById('vgsCookieConsent');
    const badge = document.getElementById('vgsCookieBadge');
    const acceptAllBtn = document.getElementById('vgsAcceptAllBtn');
    const declineBtn = document.getElementById('vgsDeclineBtn');
    const customizeBtn = document.getElementById('vgsCustomizeBtn');
    const saveBtn = document.getElementById('vgsSaveCustomBtn');
    const closeBtn = document.getElementById('vgsCookieClose');
    const details = document.getElementById('vgsCookieDetails');

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        saveConsent({ accepted: true, level: 'all', analytics: true, functional: true });
        hideBanner();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        saveConsent({ accepted: true, level: 'essential', analytics: false, functional: false });
        hideBanner();
      });
    }

    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        if (details) details.style.display = 'block';
        customizeBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-flex';
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const analytics = document.getElementById('vgsAnalyticsConsent')?.checked ?? false;
        const functional = document.getElementById('vgsFunctionalConsent')?.checked ?? false;
        saveConsent({ accepted: true, level: 'custom', analytics, functional });
        hideBanner();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideBanner();
      });
    }

    if (badge) {
      badge.addEventListener('click', () => {
        showBanner(true);
      });
    }

    document.querySelectorAll('.open-cookie-settings').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showBanner(true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureBannerMarkup();
      if (!getStoredConsent()) {
        setTimeout(() => showBanner(false), 800);
      }
    });
  } else {
    ensureBannerMarkup();
    if (!getStoredConsent()) {
      setTimeout(() => showBanner(false), 800);
    }
  }

  window.vgsCookieConsent = {
    get: getStoredConsent,
    open: (customize = true) => showBanner(customize),
    hasConsent: (category) => {
      const c = getStoredConsent();
      if (!c) return false;
      if (category === 'necessary') return true;
      return Boolean(c[category]);
    }
  };
})();

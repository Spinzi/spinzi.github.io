/* =====================================================
   ARHIVĂ ISTORICĂ — JAVASCRIPT
   Scroll effects, animations, interactivity
   ===================================================== */

'use strict';

// ---- LOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1800);
});

// ---- SCROLL PROGRESS BAR ----
const scrollProgress = document.getElementById('scroll-progress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}

// ---- NAVBAR SCROLL BEHAVIOR ----
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');

function updateNavbar() {
  if (!navbar) return;
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let currentSection = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.4) {
      currentSection = sec.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === currentSection);
  });
}

// ---- FADE IN ON SCROLL ----
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stagger children if multiple in same parent
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

// ---- ANIMATED COUNTERS ----
function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  const isInt = Number.isInteger(target);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = start + (target - start) * eased;
    el.textContent = isInt ? Math.round(current) : current.toFixed(1);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = true;
      const target = parseFloat(entry.target.dataset.count);
      animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

// ---- EXPANDABLE DOC CARDS ----
document.querySelectorAll('.doc-card[data-expandable]').forEach(card => {
  const header = card.querySelector('.doc-card-header');
  if (!header) return;
  header.addEventListener('click', () => {
    card.classList.toggle('open');
  });
});

// ---- MOBILE NAV TOGGLE ----
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.querySelector('.nav-links');

if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    const isOpen = navLinksEl.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    // Animate hamburger to X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

// ---- SMOOTH SCROLL FOR NAV LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- TIMELINE ANIMATION ----
const tlItems = document.querySelectorAll('.tl-item');
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }, i * 80);
    }
  });
}, { threshold: 0.2 });

tlItems.forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-20px)';
  item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  tlObserver.observe(item);
});

// ---- PARALLAX HERO ----
const heroBg = document.querySelector('.hero-bg');
let ticking = false;

function updateParallax() {
  if (heroBg) {
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
  }
  ticking = false;
}

// ---- SECTION REVEAL WITH STAGGER ----
const contentSides = document.querySelectorAll('.content-side');
contentSides.forEach(side => {
  const cards = side.querySelectorAll('.doc-card, .stat-card, .prop-quote-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
});

// ---- SCROLL EVENT LISTENER (unified) ----
window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateNavbar();
  updateActiveNavLink();

  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

// ---- PSYCH CARDS STAGGER ----
const psychCards = document.querySelectorAll('.psych-card');
const psychObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.parentElement.querySelectorAll('.psych-card');
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, i * 80);
      });
      psychObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

psychCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.4s ease';
  psychObserver.observe(card);
});

// ---- LEGACY CARDS STAGGER ----
const legacyCards = document.querySelectorAll('.legacy-card');
const legacyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = Array.from(entry.target.parentElement.querySelectorAll('.legacy-card'));
      cards.forEach((c, i) => {
        setTimeout(() => {
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, i * 100);
      });
      legacyObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

legacyCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = 'opacity 0.7s ease, transform 0.7s ease, background 0.4s ease';
  legacyObserver.observe(card);
});

// ---- QUOTE BLOCKS HIGHLIGHT ----
document.querySelectorAll('.quote-block').forEach(block => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.borderLeftColor = 'var(--accent-gold)';
        entry.target.style.opacity = '1';
      }
    });
  }, { threshold: 0.5 });
  block.style.opacity = '0.7';
  block.style.transition = 'opacity 0.6s ease, border-color 0.6s ease';
  observer.observe(block);
});

// ---- BIG STATS ROW ENTRANCE ----
const statsRow = document.querySelector('.stats-row');
if (statsRow) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stats = entry.target.querySelectorAll('.big-stat');
        stats.forEach((s, i) => {
          setTimeout(() => {
            s.style.opacity = '1';
            s.style.transform = 'translateY(0)';
          }, i * 100);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statsRow.querySelectorAll('.big-stat').forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    s.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.4s ease';
  });
  statsObserver.observe(statsRow);
}

// ---- MEMORIAL VICTIMS ENTRANCE ----
const memVictims = document.querySelector('.memorial-victims');
if (memVictims) {
  const memObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const groups = entry.target.querySelectorAll('.victim-group');
        groups.forEach((g, i) => {
          setTimeout(() => {
            g.style.opacity = '1';
            g.style.transform = 'translateY(0)';
          }, i * 120);
        });
        memObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  memVictims.querySelectorAll('.victim-group').forEach(g => {
    g.style.opacity = '0';
    g.style.transform = 'translateY(20px)';
    g.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  });
  memObserver.observe(memVictims);
}

// ---- HORIZONTAL TIMELINE STAGGER ----
document.querySelectorAll('.th-item').forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(16px)';
  item.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  obs.observe(item);
});

// ---- KEYBOARD NAVIGATION ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinksEl) {
    navLinksEl.classList.remove('open');
  }
});

// ---- INIT ----
updateScrollProgress();
updateNavbar();

/* ============================================================
   SPINZI.GITHUB.IO — app.js
   Content-driven rendering from data.js
   ============================================================ */

(function () {
  'use strict';

  /* ─── SVG icons ─────────────────────────────────────────── */
  const ICONS = {
    github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
    mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>`,
    arrow: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    external: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  /* ─── Helpers ────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    }
    children.flat().forEach(c => {
      if (typeof c === 'string') e.insertAdjacentHTML('beforeend', c);
      else if (c instanceof Node) e.appendChild(c);
    });
    return e;
  }

  /* ─── Meta ───────────────────────────────────────────────── */
  function applyMeta() {
    const { title, description, author } = SITE_DATA.meta;
    document.title = title;
    $('#meta-description')?.setAttribute('content', description);
    $('#meta-author')?.setAttribute('content', author);
    $('#og-title')?.setAttribute('content', title);
    $('#og-description')?.setAttribute('content', description);
    $('#page-title').textContent = title;
  }

  /* ─── Hero ───────────────────────────────────────────────── */
  function renderHero() {
    const { greeting, name, tagline, subtext, cta } = SITE_DATA.hero;

    $('.hero-greeting').textContent = greeting;
    $('.hero-name').textContent = name;
    $('.hero-tagline').textContent = tagline;
    $('.hero-subtext').textContent = subtext;

    const ctaContainer = $('.hero-cta');
    cta.forEach(({ label, href, variant, external }) => {
      const a = el('a', {
        class: `btn btn-${variant}`,
        href,
        ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
      });
      a.textContent = label;
      if (external) a.insertAdjacentHTML('beforeend', ` ${ICONS.external}`);
      ctaContainer.appendChild(a);
    });
  }

  /* ─── Hero Canvas ────────────────────────────────────────── */
  function initCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles, raf;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 130;
    const mouse = { x: -9999, y: -9999 };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Update & draw particles
      for (const p of particles) {
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124,106,255,0.6)';
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,106,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse interaction
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 100) {
          const alpha = (1 - mdist / 100) * 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(168,155,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas);

    document.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    init();
    if (!prefersReduced) draw();
    else {
      // Static render for reduced motion
      draw();
      cancelAnimationFrame(raf);
    }
  }

  /* ─── About ──────────────────────────────────────────────── */
  function renderAbout() {
    const { paragraphs, tags } = SITE_DATA.about;

    const textEl = $('#about-paragraphs');
    paragraphs.forEach(text => {
      textEl.appendChild(el('p', {}, text));
    });

    const tagEl = $('#about-tags');
    tags.forEach(tag => {
      tagEl.appendChild(el('li', { class: 'tag', role: 'listitem' }, tag));
    });
  }

  /* ─── Projects ───────────────────────────────────────────── */
  function renderProjects() {
    const grid = $('#projects-grid');
    SITE_DATA.projects.forEach((project, i) => {
      const card = buildProjectCard(project, i);
      grid.appendChild(card);
    });
  }

  function buildProjectCard(project, index) {
    const card = el('article', {
      class: 'project-card reveal',
      role: 'listitem',
      tabindex: '0',
      'aria-label': `${project.title} — ${project.short}`,
      'data-id': project.id,
    });

    if (index > 0) card.classList.add(`reveal-delay-${Math.min(index % 3 + 1, 3)}`);

    const statusLabel = project.status === 'live' ? 'Live' : project.status === 'wip' ? 'In Progress' : 'Archived';
    const statusClass = `status-${project.status}`;

    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-status ${statusClass}" aria-label="Status: ${statusLabel}">${statusLabel}</span>
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-short">${project.short}</p>
      <div class="project-tech">
        ${project.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
      </div>
      <div class="project-card-footer">
        <span class="project-open-hint">View details</span>
        <span class="project-arrow" aria-hidden="true">${ICONS.arrow}</span>
      </div>
    `;

    card.addEventListener('click', () => openModal(project));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(project);
      }
    });

    return card;
  }

  /* ─── Verse ──────────────────────────────────────────────── */
  function renderVerse() {
    const { reference, translation, text } = SITE_DATA.verse;
    const verseEl = $('#verse-text');
    const refEl = $('#verse-ref');
    if (verseEl) verseEl.textContent = text;
    if (refEl) refEl.textContent = `${reference} · ${translation}`;
  }

  /* ─── Footer & Social ────────────────────────────────────── */
  function renderFooter() {
    const { text, year } = SITE_DATA.footer;
    const footerEl = $('#footer-text');
    if (footerEl) footerEl.textContent = `© ${year} · ${text}`;

    const socialEl = $('#social-links');
    SITE_DATA.social.forEach(({ label, href, icon }) => {
      const li = el('li');
      const a = el('a', {
        class: 'social-link',
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${label} (opens in new tab)`,
      });
      a.innerHTML = (ICONS[icon] || '') + ` <span>${label}</span>`;
      li.appendChild(a);
      socialEl.appendChild(li);
    });
  }

  /* ─── Modal ──────────────────────────────────────────────── */
  let lastFocused = null;

  function openModal(project) {
    lastFocused = document.activeElement;

    const overlay = $('#modal-overlay');
    const content = $('#modal-content');

    const statusLabel = project.status === 'live' ? 'Live' : project.status === 'wip' ? 'In Progress' : 'Archived';
    const statusClass = `status-${project.status}`;

    let linksHTML = '';
    if (project.github) {
      linksHTML += `<a class="btn btn-secondary" href="${project.github}" target="_blank" rel="noopener noreferrer" aria-label="${project.title} on GitHub (opens in new tab)">${ICONS.github} GitHub</a>`;
    }
    if (project.demo) {
      linksHTML += `<a class="btn btn-primary" href="${project.demo}" target="_blank" rel="noopener noreferrer" aria-label="Live demo of ${project.title} (opens in new tab)">${ICONS.external} Live Demo</a>`;
    }

    const techHTML = project.tech.map(t => `<span class="tech-pill">${t}</span>`).join('');
    const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const noteHTML = project.notes ? `
      <div class="modal-section-label">Note</div>
      <div class="modal-note">${project.notes}</div>
    ` : '';

    content.innerHTML = `
      <div class="modal-status">
        <span class="project-status ${statusClass}">${statusLabel}</span>
      </div>
      <h2 class="modal-title" id="modal-title">${project.title}</h2>
      <p class="modal-desc">${project.description}</p>

      <div class="modal-section-label">Stack</div>
      <div class="modal-tech">${techHTML}</div>

      <div class="modal-section-label">Tags</div>
      <div class="modal-tags">${tagsHTML}</div>

      ${noteHTML}

      ${linksHTML ? `<div class="modal-section-label">Links</div><div class="modal-links">${linksHTML}</div>` : ''}
    `;

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus the close button
    setTimeout(() => $('#modal-close')?.focus(), 50);

    // Trap focus
    overlay.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    const overlay = $('#modal-overlay');
    overlay.hidden = true;
    document.body.style.overflow = '';
    overlay.removeEventListener('keydown', trapFocus);
    lastFocused?.focus();
  }

  function trapFocus(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;

    const modal = $('#modal');
    const focusable = $$('button, a, [tabindex]:not([tabindex="-1"])', modal);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function setupModal() {
    $('#modal-close')?.addEventListener('click', closeModal);
    $('#modal-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  /* ─── Navigation ─────────────────────────────────────────── */
  function setupNav() {
    // Scroll glass effect
    const header = $('.site-header');
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    const btn = $('.nav-menu-btn');
    const menu = $('#mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        menu.hidden = open;
      });

      // Close mobile menu on link click
      $$('a', menu).forEach(a => {
        a.addEventListener('click', () => {
          btn.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        });
      });
    }

    // Active nav link on scroll
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a, .mobile-nav-links a');

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            a.removeAttribute('aria-current');
            if (a.getAttribute('href') === `#${id}`) {
              a.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }, { rootMargin: '-10% 0px -85% 0px' });

    sections.forEach(s => io.observe(s));
  }

  /* ─── Scroll reveal ──────────────────────────────────────── */
  function setupReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(e => io.observe(e));
  }

  /* ─── Add reveal classes to sections ─────────────────────── */
  function markReveals() {
    const targets = [
      '.section-eyebrow',
      '.section-heading',
      '.section-subheading',
      '.about-text',
      '.about-sidebar',
      '.verse-card',
    ];
    targets.forEach((sel, i) => {
      $$(sel).forEach(el => {
        el.classList.add('reveal');
        if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 3)}`);
      });
    });
  }

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    applyMeta();
    renderHero();
    renderAbout();
    renderProjects();
    renderVerse();
    renderFooter();
    setupModal();
    setupNav();
    markReveals();
    setupReveal();
    initCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

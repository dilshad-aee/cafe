/* ==========================================================================
   App — Main Entry Point
   Initializes: Lenis, Custom Cursor, Loader, Nav, all modules
   ========================================================================== */

(function () {
  'use strict';

  // ── LOADER ──
  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loader-fill');
    const text = loader ? loader.querySelector('.loader-text') : null;

    if (!loader) return Promise.resolve();

    // Only show loader on first visit
    if (sessionStorage.getItem('visited')) {
      loader.style.display = 'none';
      return Promise.resolve();
    }

    sessionStorage.setItem('visited', 'true');

    return new Promise(resolve => {
      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({ onComplete: () => { loader.style.display = 'none'; resolve(); } });
        tl.to(text, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
          .to(fill, { width: '100%', duration: 1.4, ease: 'power2.inOut' }, 0.2)
          .to(loader, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.8);
      } else {
        setTimeout(() => { loader.style.display = 'none'; resolve(); }, 1500);
      }
    });
  }

  // ── LENIS SMOOTH SCROLL ──
  let lenis;
  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  window.reinitLenis = function () {
    if (lenis) lenis.destroy();
    initLenis();
  };

  // ── CUSTOM CURSOR ──
  function initCursor() {
    if (window.innerWidth <= 768) return;

    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    if (!cursor || !dot) return;

    let mx = 0, my = 0;
    let cx = 0, cy = 0;
    let dx = 0, dy = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    // Smooth follow
    (function loop() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      dx += (mx - dx) * 0.6;
      dy += (my - dy) * 0.6;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      dot.style.left = dx + 'px';
      dot.style.top = dy + 'px';
      requestAnimationFrame(loop);
    })();

    // Hover state
    function addHover() { cursor.classList.add('hover'); }
    function removeHover() { cursor.classList.remove('hover'); }

    document.querySelectorAll('a, button, .magnetic, .food-card, .feature-card, .menu-tab, .dot, .nav-cta, .wa-fab').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });
  }

  // ── MAGNETIC BUTTONS ──
  function initMagnetic() {
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        setTimeout(() => btn.style.transition = '', 400);
      });
    });
  }

  // ── NAVIGATION ──
  function initNav() {
    const navWrapper = document.getElementById('nav-wrapper');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const overlay = document.getElementById('nav-overlay');

    if (!navWrapper) return;

    // Sticky (only on home page where nav starts transparent)
    const isHome = navWrapper.classList.contains('scrolled') === false;
    if (isHome) {
      window.addEventListener('scroll', () => {
        navWrapper.classList.toggle('scrolled', window.scrollY > 80);
      }, { passive: true });
    }

    // Mobile menu
    function closeMenu() {
      if (hamburger) hamburger.classList.remove('open');
      if (navLinks) navLinks.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    function openMenu() {
      if (hamburger) hamburger.classList.add('open');
      if (navLinks) navLinks.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.contains('open') ? closeMenu() : openMenu();
      });
    }
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ── YEAR ──
  window.initYear = function () {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  };

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', async () => {
    await initLoader();
    initLenis();
    initCursor();
    initMagnetic();
    initNav();
    window.initYear();

    if (window.initAnimations) window.initAnimations();
    if (window.initTestimonials) window.initTestimonials();
    if (window.initTransitions) window.initTransitions();
  });

})();

/* ==========================================================================
   Animations — GSAP ScrollTrigger powered
   ========================================================================== */

function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // ── Reveal up ──
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  // ── Reveal left ──
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // ── Reveal right ──
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // ── Reveal scale ──
  gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // ── Stagger items ──
  const staggerGroups = document.querySelectorAll('.features-grid, .menu-grid, .values-grid, .stats-grid, .contact-cards-list');
  staggerGroups.forEach(group => {
    const items = group.querySelectorAll('.stagger-item, .feature-card.stagger-item, .food-card.stagger-item, .value-card.stagger-item, .stat.stagger-item, .contact-card.stagger-item');
    if (!items.length) return;
    gsap.fromTo(items,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 80%', once: true }
      }
    );
  });

  // ── Line draw ──
  gsap.utils.toArray('.line-draw').forEach(el => {
    gsap.to(el, {
      scaleX: 1, duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  // ── Parallax hero bg ──
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    gsap.to(heroBg, {
      y: 120, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // ── Counter animation ──
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.ceil(this.targets()[0].val).toLocaleString('en-IN') + '+';
          }
        });
      }
    });
  });

  // ── Horizontal scroll timeline (about page) ──
  const timelineTrack = document.getElementById('timeline-track');
  if (timelineTrack) {
    const cards = timelineTrack.querySelectorAll('.timeline-card');
    if (cards.length > 0 && window.innerWidth > 768) {
      const totalWidth = timelineTrack.scrollWidth - window.innerWidth + 200;
      gsap.to(timelineTrack, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline-section',
          start: 'top 20%',
          end: () => '+=' + totalWidth,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });
    }
  }

  // ── Image reveal wipe ──
  gsap.utils.toArray('.img-reveal').forEach(el => {
    const overlay = el.querySelector('::after') || el;
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      }
    );
  });

  // ── Split text hero animation ──
  const heroTitle = document.querySelector('.hero-title.split-text');
  if (heroTitle) {
    const text = heroTitle.innerHTML;
    // Simple word-by-word reveal
    const words = heroTitle.textContent.split(/\s+/);
    // Use GSAP to animate the title
    gsap.fromTo(heroTitle,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' }
    );
  }

  // ── Menu tab filter ──
  const menuTabs = document.querySelectorAll('.menu-tab');
  if (menuTabs.length) {
    menuTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        const cards = document.querySelectorAll('.food-card');
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          gsap.to(card, {
            opacity: show ? 1 : 0,
            scale: show ? 1 : 0.9,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              card.style.display = show ? '' : 'none';
            }
          });
          if (show) card.style.display = '';
        });
      });
    });
  }

  // ── 3D tilt on food cards ──
  if (window.innerWidth > 768) {
    document.querySelectorAll('.food-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -6;
        const rotateY = (x - centerX) / centerX * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        setTimeout(() => card.style.transition = '', 500);
      });
    });
  }
}

// ── Testimonial slider ──
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  if (!slides.length) return;

  let idx = 0, timer;
  function show(i) {
    if (i >= slides.length) i = 0;
    if (i < 0) i = slides.length - 1;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[i].classList.add('active');
    if (dots[i]) dots[i].classList.add('active');
    idx = i;
  }
  function start() { timer = setInterval(() => show(idx + 1), 5000); }
  function stop() { clearInterval(timer); }

  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); show(i); start(); }));

  const wrapper = document.querySelector('.testimonial-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stop);
    wrapper.addEventListener('mouseleave', start);
  }

  show(0);
  start();
}

// Export for app.js
window.initAnimations = initAnimations;
window.initTestimonials = initTestimonials;

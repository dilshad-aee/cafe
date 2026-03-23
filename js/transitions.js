/* ==========================================================================
   Page Transitions — CSS-based (no Barba.js)
   Simple fade-out on link click, fade-in on page load
   ========================================================================== */

function initTransitions() {
  if (typeof gsap === 'undefined') return;

  // Fade in page on load
  const wrapper = document.querySelector('.page-wrapper');
  if (wrapper) {
    gsap.fromTo(wrapper,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
    );
  }

  // Fade out on internal link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept internal links (not external, not hash, not whatsapp, not tel)
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || link.target === '_blank') return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      const dest = href;
      const overlay = document.getElementById('transition-overlay');

      if (overlay) {
        gsap.to(overlay, {
          scaleY: 1,
          transformOrigin: 'bottom',
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            window.location.href = dest;
          }
        });
      } else {
        window.location.href = dest;
      }
    });
  });
}

window.initTransitions = initTransitions;

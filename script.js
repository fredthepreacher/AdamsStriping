/* Adams Bros Striping — script.js (v6) */
(function () {

  /* ── Mobile nav ── */
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings for cascade effect
        const siblings = Array.from(entry.target.parentElement.children)
          .filter(c => c.classList.contains('reveal') || c.classList.contains('reveal-left') || c.classList.contains('reveal-right'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', ev => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        ev.preventDefault();
        const offset = 72;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  /* ── Before/After sliders — fixed no-stretch version ── */
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const after  = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    const afterImg = after.querySelector('img');
    let active = false;

    function setPos(clientX) {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(3, Math.min(97, pct));
      // Move the clip boundary — image itself stays full width
      after.style.width  = pct + '%';
      handle.style.left  = pct + '%';
      // Keep after image at full slider width so it never stretches
      afterImg.style.width = rect.width + 'px';
    }

    // Initialise at 50%
    after.style.width  = '50%';
    handle.style.left  = '50%';
    setTimeout(() => {
      afterImg.style.width = slider.getBoundingClientRect().width + 'px';
    }, 100);

    // Fix on resize
    window.addEventListener('resize', () => {
      afterImg.style.width = slider.getBoundingClientRect().width + 'px';
    }, { passive: true });

    // Mouse
    slider.addEventListener('mousedown',  e => { active = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove',  e => { if (active) setPos(e.clientX); });
    window.addEventListener('mouseup',    ()  => active = false);

    // Touch
    slider.addEventListener('touchstart', e => { active = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',  e => { if (active) setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',   ()  => active = false);
  });

})();

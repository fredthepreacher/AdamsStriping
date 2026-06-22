/* Adams Bros Striping — script.js (v14) */
(function () {

  /* ── Mobile nav ── */
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
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
        const offset = 120;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  /* ── Before/After sliders ── */
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const after    = slider.querySelector('.ba-after');
    const handle   = slider.querySelector('.ba-handle');
    const afterImg = after.querySelector('img');
    let active = false;
    let currentPct = 50;

    function setPos(clientX) {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(3, Math.min(97, pct));
      currentPct = pct;
      after.style.width    = pct + '%';
      handle.style.left    = pct + '%';
      afterImg.style.width = rect.width + 'px';
    }

    /* Initialise at 50% */
    after.style.width  = '50%';
    handle.style.left  = '50%';
    setTimeout(() => {
      afterImg.style.width = slider.getBoundingClientRect().width + 'px';
    }, 100);

    window.addEventListener('resize', () => {
      afterImg.style.width = slider.getBoundingClientRect().width + 'px';
    }, { passive: true });

    /* Mouse */
    slider.addEventListener('mousedown', e => { active = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (active) setPos(e.clientX); });
    window.addEventListener('mouseup',   ()  => { active = false; });

    /* Touch */
    slider.addEventListener('touchstart', e => { active = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',  e => { if (active) setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',   ()  => { active = false; });

    /* Keyboard — arrow keys when slider is focused */
    slider.addEventListener('keydown', e => {
      const step = e.shiftKey ? 10 : 2;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const rect = slider.getBoundingClientRect();
        setPos(rect.left + (rect.width * (currentPct - step) / 100));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const rect = slider.getBoundingClientRect();
        setPos(rect.left + (rect.width * (currentPct + step) / 100));
      }
    });
  });

  /* ── Sticky CTA — show after hero scrolls out, hide when quote is visible ── */
  const stickyCta    = document.getElementById('stickyCta');
  const heroSection  = document.querySelector('.hero');
  const quoteSection = document.getElementById('quote');

  if (stickyCta && heroSection) {
    let heroVisible  = true;
    let quoteVisible = false;

    function updateCtaVisibility() {
      if (!heroVisible && !quoteVisible) {
        stickyCta.classList.add('visible');
        stickyCta.removeAttribute('aria-hidden');
      } else {
        stickyCta.classList.remove('visible');
        stickyCta.setAttribute('aria-hidden', 'true');
      }
    }

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === heroSection)  heroVisible  = entry.isIntersecting;
        if (entry.target === quoteSection) quoteVisible = entry.isIntersecting;
        updateCtaVisibility();
      });
    }, { threshold: 0.1 });

    ctaObserver.observe(heroSection);
    if (quoteSection) ctaObserver.observe(quoteSection);
  }

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all open items */
      document.querySelectorAll('.faq-item').forEach(other => {
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').hidden = true;
        other.classList.remove('open');
      });

      /* Open clicked item if it was closed */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        item.classList.add('open');
        setTimeout(() => {
          const top = item.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 50);
      }
    });
  });

})();

/* Adams Bros Striping — script.js (v16) */
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

  /* ── Before/After sliders (v16) ──
     Markup contract (unchanged): .ba-slider > img (AFTER, full frame)
     + .ba-after > img (BEFORE overlay, revealed on the left under the
     "Before" label) + .ba-handle. The overlay is clipped with clip-path so
     neither image ever resizes, stretches, or zooms while dragging.
     Pointer events cover mouse, touch, and pen; touch-action: pan-y (CSS)
     keeps vertical page scroll working while horizontal drags move the divider. */
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const after  = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;
    let dragging = false;
    let pointerId = null;
    let currentPct = 50;
    let raf = 0;

    function render() {
      raf = 0;
      after.style.clipPath       = 'inset(0 ' + (100 - currentPct) + '% 0 0)';
      after.style.webkitClipPath = after.style.clipPath;
      handle.style.left          = currentPct + '%';
      const v = Math.round(currentPct);
      slider.setAttribute('aria-valuenow', String(v));
      slider.setAttribute('aria-valuetext', v + '% before, ' + (100 - v) + '% after');
    }
    function setPct(pct) {
      currentPct = Math.max(0, Math.min(100, pct));
      if (!raf) raf = requestAnimationFrame(render);
    }
    function pctFromX(clientX) {
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    setPct(50);

    slider.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      try { slider.setPointerCapture(pointerId); } catch (_) {}
      slider.classList.add('is-dragging');
      setPct(pctFromX(e.clientX));
      if (e.pointerType === 'mouse') e.preventDefault();
    });
    slider.addEventListener('pointermove', e => {
      if (dragging && e.pointerId === pointerId) setPct(pctFromX(e.clientX));
    });
    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      slider.classList.remove('is-dragging');
      try { slider.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
    }
    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);
    slider.addEventListener('lostpointercapture', endDrag);
    slider.addEventListener('dragstart', e => e.preventDefault());

    /* Keyboard: arrows (Shift = bigger step), Home/End, PageUp/PageDown */
    slider.addEventListener('keydown', e => {
      const step = e.shiftKey ? 10 : 2;
      let next = null;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = currentPct - step;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = currentPct + step;
      else if (e.key === 'PageDown') next = currentPct - 10;
      else if (e.key === 'PageUp') next = currentPct + 10;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 100;
      if (next !== null) { e.preventDefault(); setPct(next); }
    });
  });

  /* ── Quote form: preselect a service from CTA links ──
     <a href="#quote" data-service="Residential Driveway Sealcoating">
     or from another page: /?service=residential-driveway-sealcoating#quote */
  const serviceSelect = document.getElementById('service');
  if (serviceSelect) {
    const slug = t => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const pick = wanted => {
      if (!wanted) return;
      const w = slug(wanted);
      const opt = Array.from(serviceSelect.options).find(o => o.value && slug(o.value) === w);
      if (opt) serviceSelect.value = opt.value;
    };
    document.querySelectorAll('a[data-service]').forEach(a => {
      a.addEventListener('click', () => pick(a.getAttribute('data-service')));
    });
    try { pick(new URLSearchParams(window.location.search).get('service')); } catch (_) {}
  }

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

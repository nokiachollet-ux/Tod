/* =========================================================
   [NOM] — Couvreur · Interactions & animations
   GSAP + ScrollTrigger (chargés via CDN dans index.html)
   ========================================================= */

(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');

  /* ---------- Année du footer ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Photo indisponible : on laisse le fond bleu nuit ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const fail = () => img.classList.add('is-broken');
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail);
  });

  /* ---------- En-tête : état « scrollé » ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Hero plus haut que l'écran (laptop peu haut, paysage) ----------
     Le hero est "sticky" : s'il dépasse la hauteur de la fenêtre, on le laisse
     défiler jusqu'à son bas avant qu'il ne se fige, sinon la fin serait masquée. */
  const hero = document.querySelector('.hero');
  if (hero) {
    const fitHero = () => {
      hero.style.top = Math.min(0, window.innerHeight - hero.offsetHeight) + 'px';
    };
    fitHero();
    window.addEventListener('resize', fitHero);
    if ('ResizeObserver' in window) new ResizeObserver(fitHero).observe(hero);
  }

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector('.burger');
  const links = document.getElementById('nav-links');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    links.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  /* ---------- Formulaire de devis ----------
     À relier à un vrai service d'envoi (Formspree, PHP…).
     Ici : validation simple + message de confirmation. */
  const form = document.querySelector('.quote-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const invalid = !field.value.trim();
        field.closest('.field').classList.toggle('is-invalid', invalid);
        if (invalid && ok) { field.focus(); ok = false; }
      });
      if (!ok) return;
      form.reset();
      const msg = form.querySelector('.quote-form__success');
      msg.hidden = false;
      if (window.gsap) gsap.from(msg, { y: 10, opacity: 0, duration: .6, ease: 'power3.out' });
    });
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f) f.classList.remove('is-invalid');
    });
  }

  /* =========================================================
     ANIMATIONS
     ========================================================= */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sans GSAP (hors ligne) ou si l'utilisateur limite les animations : tout reste visible.
  if (!window.gsap || !window.ScrollTrigger || reduceMotion) {
    root.classList.remove('anim');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  const has = (sel) => document.querySelectorAll(sel).length > 0;

  /* ---------- 1. Entrée du hero (accueil et pages intérieures) ---------- */
  if (has('.hero')) {
    const intro = gsap.timeline({ delay: .15 });
    const step = (sel, vars, pos, method = 'to') => { if (has(sel)) intro[method](sel, vars, pos); };

    step('.hero__media img', { scale: 1.22, duration: 2.6, ease: 'power2.out' }, 0, 'from');
    step('.hero__overlay', { opacity: 0, duration: 1.6, ease: 'power1.out' }, 0, 'from');
    step('.topbar, .nav', { yPercent: -110, opacity: 0, duration: 1, stagger: .08, clearProps: 'transform,opacity' }, .3, 'from');
    ['.hero__eyebrow', '.hero__lead', '.hero__actions'].forEach((sel, i) => {
      const at = [.45, 1.15, 1.3][i];
      step(sel, { opacity: 1, duration: .9 }, at);
      step(sel, { y: 20, duration: .9 }, at, 'from');
    });
    step('.hero__title .line > span', { y: 0, yPercent: 0, duration: 1.25, stagger: .13, ease: 'power4.out' }, .55);
    step('.hero__scroll', { opacity: 1, duration: 1 }, 1.8);
  }

  /* ---------- 2. Le contenu glisse sur le hero ---------- */
  if (has('.hero') && has('.sheet')) {
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    })
      .to('.hero__media', { scale: 1.08, yPercent: 6, ease: 'none' }, 0)
      .to('.hero__content', { y: -90, opacity: 0, ease: 'none' }, 0);
  }

  // Pendant une animation GSAP, on coupe les transitions CSS de l'élément
  // (sinon les deux se superposent) puis on rend la main aux effets de survol.
  const freeze = (els) => els.forEach((el) => { el.style.transition = 'none'; });
  const release = (els) => els.forEach((el) => {
    el.classList.add('is-in');
    gsap.set(el, { clearProps: 'all' });
  });

  /* ---------- 3. Apparition des textes et blocs ---------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => {
      freeze(els);
      gsap.fromTo(els, { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 1, stagger: .1, overwrite: true,
        onComplete: () => release(els)
      });
    }
  });

  /* ---------- 4. Révélation des images (rideau) ---------- */
  gsap.utils.toArray('[data-reveal-img]').forEach((el) => {
    const img = el.querySelector('img');
    const parallax = el.hasAttribute('data-parallax');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: () => {
        el.classList.add('is-in');
        gsap.set(el, { clearProps: 'clipPath' });
        if (img && !parallax) gsap.set(img, { clearProps: 'all' });
      }
    });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' });
    if (img && !parallax) {
      img.style.transition = 'none';
      tl.from(img, { scale: 1.25, duration: 1.6, ease: 'power3.out' }, 0);
    }
  });

  /* ---------- 5. Parallaxe légère ---------- */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const img = el.querySelector('img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- 6. Transition vers la section sombre ---------- */
  if (has('.guarantees__panel')) gsap.fromTo('.guarantees__panel',
    { clipPath: 'inset(0% 3% 0% 3% round 28px)' },
    {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.guarantees', start: 'top bottom', end: 'top 25%', scrub: true }
    });

  /* ---------- 7. Ligne de progression des étapes (page Services) ---------- */
  if (has('.process__line span')) gsap.fromTo('.process__line span', { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.process__list', start: 'top 75%', end: 'bottom 55%', scrub: true }
  });

  // Recalcule les positions une fois toutes les images chargées
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();

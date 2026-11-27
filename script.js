(function () {
  'use strict';

  const body = document.body;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll('[data-slot] img').forEach((img) => {
    if (img.complete && img.src && !img.naturalWidth) img.remove();
    else img.addEventListener('error', () => img.remove(), { once: true });
  });

  window.hallmarkSlots = (map) => {
    Object.entries(map).forEach(([name, value]) => {
      const slot = document.querySelector(`[data-slot="${name}"]`);
      if (!slot) return;
      const img = new Image();
      img.src = typeof value === 'string' ? value : value.src;
      img.alt = (typeof value === 'object' && value.alt) || slot.dataset.alt || '';
      slot.querySelectorAll(':scope > img').forEach((old) => old.remove());
      slot.prepend(img);
    });
  };

  const fits = Array.from(document.querySelectorAll('.fit'));
  const fitAll = () => {
    fits.forEach((el) => {
      el.style.fontSize = '100px';
      const range = document.createRange();
      range.selectNodeContents(el);
      const natural = range.getBoundingClientRect().width;
      const room = el.clientWidth;
      const max = parseFloat(getComputedStyle(el).getPropertyValue('--fit-max')) || Infinity;
      if (natural > 0 && room > 0) el.style.fontSize = Math.min(100 * room / natural, max) + 'px';
      else el.style.fontSize = '';
    });
  };
  if (fits.length) {
    fitAll();
    let frame = 0;
    const refit = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fitAll); };
    window.addEventListener('resize', refit);
    if (document.fonts) {
      document.fonts.ready.then(fitAll);
      document.fonts.addEventListener('loadingdone', refit);
    }
  }

  const burger = document.querySelector('.burger');
  const links = document.getElementById('nav-links');
  if (burger && links) {
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
  }
})();

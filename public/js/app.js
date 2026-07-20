(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const header = $('.site-header');
  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const menuButton = $('.menu-toggle');
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 1040) closeMenu(); });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
  }

  const cards = $$('.property-card[data-filter-card]');
  const search = $('#property-search');
  const status = $('#property-status');
  const municipality = $('#property-municipality');
  const resultCount = $('#result-count');
  const emptyState = $('#no-results');

  const normalize = (value) => (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filterCards = () => {
    if (!cards.length) return;
    const query = normalize(search?.value);
    const statusValue = status?.value || 'all';
    const municipalityValue = municipality?.value || 'all';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search);
      const matchesQuery = !query || haystack.includes(query);
      const matchesStatus = statusValue === 'all' || card.dataset.status === statusValue;
      const matchesMunicipality = municipalityValue === 'all' || card.dataset.municipality === municipalityValue;
      const show = matchesQuery && matchesStatus && matchesMunicipality;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? 'propiedad' : 'propiedades'}`;
    emptyState?.classList.toggle('show', visible === 0);
  };

  search?.addEventListener('input', filterCards);
  status?.addEventListener('change', filterCards);
  municipality?.addEventListener('change', filterCards);
  filterCards();

  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCount = $('#lightbox-count');
  const galleryButtons = $$('.gallery-item[data-full]');
  let galleryIndex = 0;

  const showImage = (index) => {
    if (!galleryButtons.length || !lightboxImage) return;
    galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[galleryIndex];
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = button.dataset.alt || 'Fotografía de la propiedad';
    if (lightboxCount) lightboxCount.textContent = `${galleryIndex + 1} / ${galleryButtons.length}`;
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    showImage(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    $('.lightbox-close')?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    galleryButtons[galleryIndex]?.focus();
  };

  galleryButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  $('.lightbox-prev')?.addEventListener('click', () => showImage(galleryIndex - 1));
  $('.lightbox-next')?.addEventListener('click', () => showImage(galleryIndex + 1));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(galleryIndex - 1);
    if (event.key === 'ArrowRight') showImage(galleryIndex + 1);
  });

  $$('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = item?.classList.toggle('open');
      button.setAttribute('aria-expanded', String(Boolean(open)));
    });
  });

  const contactForm = $('#contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const whatsapp = contactForm.dataset.whatsapp;
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const interest = String(formData.get('interest') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const text = [
      `Hola Habid, soy ${name || 'una persona interesada'}.`,
      interest ? `Me interesa: ${interest}.` : '',
      phone ? `Mi teléfono es ${phone}.` : '',
      message ? `Mensaje: ${message}` : 'Quisiera recibir más información.'
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });

  const year = $('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

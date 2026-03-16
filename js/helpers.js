/* UI helper functions for What-To-Do */

export function initMobileNav() {
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileNav = document.querySelector('.mobile-nav');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
}

export function initHomeActive() {
  document.querySelector('.home')?.classList.add('active');
}

export function initChecklistToggle() {
  document.querySelectorAll('.check-item').forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('done');
      item.querySelector('.check-box')?.classList.toggle('done');
    });
  });
}

export function initCarouselHeaderHideOnScroll() {
  const carouselGroup = document.querySelector('.carousel-group');
  const carouselHeader = document.querySelector('.carousel-header');

  let lastScrollY = 0;

  carouselGroup?.addEventListener('scroll', () => {
    const currentScrollY = carouselGroup.scrollTop;

    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      carouselHeader?.classList.add('hidden');
    } else {
      carouselHeader?.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
  });
}

export function initTagPopup() {
  const tagFilterBtn = document.getElementById('listFilter');
  const tagFilterBtnCarousel = document.getElementById('listFilterCarousel');
  const tagPopup = document.getElementById('tag-popup');
  const tagBackdrop = document.getElementById('tag-backdrop');

  const openTagPopup = () => {
    tagPopup?.classList.add('open');
    tagBackdrop?.classList.add('open');
  };

  const closeTagPopup = () => {
    tagPopup?.classList.remove('open');
    tagBackdrop?.classList.remove('open');
  };

  const toggleTagPopup = (event) => {
    event.stopPropagation();
    if (tagPopup?.classList.contains('open')) {
      closeTagPopup();
    } else {
      openTagPopup();
    }
  };

  tagFilterBtn?.addEventListener('click', toggleTagPopup);
  tagFilterBtnCarousel?.addEventListener('click', toggleTagPopup);
  tagBackdrop?.addEventListener('click', closeTagPopup);

  return { closeTagPopup };
}

export function initCreatePopup() {
  const newNoteBtn = document.getElementById('new-note-btn');
  const createPopup = document.getElementById('create-popup');
  const createBackdrop = document.getElementById('create-backdrop');
  const createCloseBtn = document.querySelector('.create-close');

  const openCreatePopup = () => {
    createPopup?.classList.add('open');
    createBackdrop?.classList.add('open');
  };

  const closeCreatePopup = () => {
    createPopup?.classList.remove('open');
    createBackdrop?.classList.remove('open');
  };

  newNoteBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    openCreatePopup();
  });

  createBackdrop?.addEventListener('click', closeCreatePopup);
  createCloseBtn?.addEventListener('click', closeCreatePopup);

  return { closeCreatePopup };
}

export function initGlobalShortcuts({ closeTagPopup, closeCreatePopup }) {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeTagPopup?.();
      closeCreatePopup?.();
    }
  });
}

export function initUI() {
  initMobileNav();
  initHomeActive();
  initChecklistToggle();
  initCarouselHeaderHideOnScroll();

  const { closeTagPopup } = initTagPopup();
  const { closeCreatePopup } = initCreatePopup();

  initGlobalShortcuts({ closeTagPopup, closeCreatePopup });
}

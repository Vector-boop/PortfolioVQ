// Navigation and scroll utilities for the topbar-only layout
(function () {
  const menus = Array.from(document.querySelectorAll('nav.menu'));

  // Smooth-scroll for in-page nav links (topbar or sidebar)
  menus.forEach((menuEl) => {
    menuEl.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const id = href.slice(1);
        const section = document.getElementById(id);
        if (section) {
          e.preventDefault();
          const block = id === 'projects' ? 'center' : 'start';
          section.scrollIntoView({ behavior: 'smooth', block });
          history.pushState(null, '', href);
    }
      }
    });
  });

  // Scrollspy: highlight active section link (if page has matching sections)
  const sectionIds = ['home', 'about', 'projects', 'contact'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if (menus.length && sections.length) {
    const links = menus.flatMap((m) => Array.from(m.querySelectorAll('a')));
    function setActive(id) {
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const isActive = href === `#${id}`;
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
    const io = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) setActive(best.target.id);
    }, { threshold: [0.15, 0.35, 0.55, 0.75], rootMargin: '-35% 0px -35% 0px' });
    sections.forEach((sec) => io.observe(sec));
  }

  // If landing on page with #projects, recenter that section
  // This handles external links like ../index.html#projects
  if (location.hash === '#projects') {
    const target = document.getElementById('projects');
    if (target) {
      // Defer to ensure layout is ready before scrolling
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  // Reveal-on-scroll for sections or any element with .reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      // Activate near the middle of the viewport and deactivate when leaving
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -20% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

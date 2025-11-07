// Minimalist 3D rolodex effect for project cards
(function () {
  const container = document.querySelector('.rolodex');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.project-card'));
  if (!cards.length) return;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Create dynamic spacers so first/last card can truly center
  const leftSpacer = document.createElement('div');
  const rightSpacer = document.createElement('div');
  leftSpacer.className = 'rolodex-spacer';
  rightSpacer.className = 'rolodex-spacer';
  if (!container.firstElementChild || !container.firstElementChild.classList.contains('rolodex-spacer')) {
    container.prepend(leftSpacer);
  }
  if (!container.lastElementChild || !container.lastElementChild.classList.contains('rolodex-spacer')) {
    container.append(rightSpacer);
  }

  function layoutSpacers() {
    const sample = cards[0];
    if (!sample) return;
    const cs = getComputedStyle(container);
    const gap = parseFloat(cs.columnGap || cs.gap) || 0; // account for flex gap
    const side = Math.max(0, (container.clientWidth - sample.clientWidth) / 2 - gap / 2);
    leftSpacer.style.flex = `0 0 ${side}px`;
    rightSpacer.style.flex = `0 0 ${side}px`;
  }

  // style for spacer nodes
  const styleTagId = 'rolodex-spacer-style';
  if (!document.getElementById(styleTagId)) {
    const st = document.createElement('style');
    st.id = styleTagId;
    st.textContent = `.rolodex .rolodex-spacer{flex:0 0 0}`;
    document.head.appendChild(st);
  }

  function getCenteredIndex() {
    const crect = container.getBoundingClientRect();
    const containerCenter = crect.left + crect.width / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - containerCenter);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return bestIdx;
  }

  let targetIndex = null;
  function centerIndex(index, opts = {}) {
    const behavior = opts.behavior || 'smooth';
    // wrap into range for infinite feel
    if (cards.length > 0) {
      index = ((index % cards.length) + cards.length) % cards.length;
    } else {
      index = 0;
    }
    const card = cards[index];
    const targetLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    if (behavior === 'smooth') {
      container.classList.add('is-paging');
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      setTimeout(() => container.classList.remove('is-paging'), 260);
    } else {
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'auto' });
    }
    targetIndex = index;
    return index;
  }

  function update() {
    const crect = container.getBoundingClientRect();
    const containerCenter = crect.left + crect.width / 2;
    const epsilon = 0.06; // widen snap so centered card is perfectly flat
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const offset = (cardCenter - containerCenter) / rect.width; // 0 = centered

      if (Math.abs(offset) <= epsilon || (targetIndex === i && Math.abs(offset) <= 0.12)) {
        card.style.transform = 'none';
        card.style.zIndex = '2000';
        card.style.filter = 'brightness(1)';
        return;
      }

      const angle = clamp(-offset * 22, -28, 28); // degrees
      const depth = (1 - clamp(Math.abs(offset), 0, 1)) * 140; // px
      const scale = 0.94 + (1 - clamp(Math.abs(offset), 0, 1)) * 0.06;
      card.style.transform = `translateZ(${depth}px) rotateY(${angle}deg) scale(${scale})`;
      card.style.zIndex = String(1000 - Math.round(Math.abs(offset) * 1000));
      card.style.filter = `brightness(${0.9 + (1 - Math.min(1, Math.abs(offset))) * 0.15})`;
    });
  }

  let raf = null;
  function queuedUpdate() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; update(); });
  }

  // Initial and reactive updates
  layoutSpacers();
  update();
  container.addEventListener('scroll', queuedUpdate, { passive: true });
  window.addEventListener('resize', () => { layoutSpacers(); queuedUpdate(); centerIndex(getCenteredIndex()); });

  // Page one card per wheel tick, snapping centered
  let pagingLock = false;
  container.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return; // allow pinch-zoom
    const useY = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    if (!useY) return;
    e.preventDefault();
    if (pagingLock) return;
    pagingLock = true;
    const dir = e.deltaY > 0 ? 1 : -1;
    const cur = getCenteredIndex();
    // wrap around for infinite paging
    const next = (cur + dir + cards.length) % cards.length;
    centerIndex(next);
    setTimeout(() => { pagingLock = false; }, 260);
  }, { passive: false });

  // Keyboard navigation for accessibility/minimal controls
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (getCenteredIndex() + dir + cards.length) % cards.length;
    centerIndex(next);
  });

  // Make container focusable for arrow keys
  if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '0');

  // Ensure initial snap to nearest card on load
  requestAnimationFrame(() => centerIndex(getCenteredIndex()));
})();

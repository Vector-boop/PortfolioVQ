// Lightweight image lightbox for project mosaics
(function(){
  const ZOOM_SCALE = 1.5;
  let isZoomed = false;

  function ensureOverlay(){
    let overlay = document.getElementById('lightbox-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = '' +
      '<button class="lightbox-close" aria-label="Close">&#215;</button>' +
      '<div class="lightbox-stage" role="presentation">' +
      '  <img class="lightbox-image" alt="" />' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', close);
    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-stage').addEventListener('click', function(e){ e.stopPropagation(); });
    overlay.querySelector('.lightbox-image').addEventListener('click', handleImageClick);
    window.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
    return overlay;
  }

  function handleImageClick(event){
    const overlay = document.getElementById('lightbox-overlay');
    if(!overlay) return;
    event.stopPropagation();
    if (isZoomed) {
      resetZoom(overlay);
    } else {
      zoomIn(overlay, event);
    }
  }

  function zoomIn(overlay, event){
    const img = overlay.querySelector('.lightbox-image');
    if(!img) return;
    const rect = img.getBoundingClientRect();
    const originX = ((event.clientX - rect.left) / rect.width) * 100;
    const originY = ((event.clientY - rect.top) / rect.height) * 100;
    img.style.setProperty('--lb-scale', ZOOM_SCALE);
    img.style.setProperty('--lb-origin-x', originX + '%');
    img.style.setProperty('--lb-origin-y', originY + '%');
    overlay.classList.add('zoomed');
    isZoomed = true;
  }

  function resetZoom(overlay){
    const img = overlay.querySelector('.lightbox-image');
    if(!img) return;
    img.style.setProperty('--lb-scale', 1);
    img.style.removeProperty('--lb-origin-x');
    img.style.removeProperty('--lb-origin-y');
    overlay.classList.remove('zoomed');
    const stage = overlay.querySelector('.lightbox-stage');
    if(stage){
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }
    isZoomed = false;
  }

  function open(src, alt, trigger){
    const overlay = ensureOverlay();
    const img = overlay.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    // If the clicked tile had a rotate class, mirror it in overlay
    img.classList.remove('rotated');
    if (trigger && trigger.classList && trigger.classList.contains('rotate-180')) {
      img.classList.add('rotated');
    }
    resetZoom(overlay);
    document.body.classList.add('no-scroll');
    overlay.classList.add('open');
  }

  function close(){
    const overlay = document.getElementById('lightbox-overlay');
    if(!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    const img = overlay.querySelector('img');
    if (img) { img.removeAttribute('src'); }
    resetZoom(overlay);
  }

  function init(){
    const selectors = [
      '.project-mosaic .tile img',
      '.project-gallery .tile img'
    ];
    const tiles = document.querySelectorAll(selectors.join(','));
    if(!tiles.length) return;
    tiles.forEach(img => {
      if (img.dataset.lightboxBound) return;
      img.dataset.lightboxBound = 'true';
      img.addEventListener('click', () => {
        const full = img.getAttribute('data-full') || img.currentSrc || img.src;
        open(full, img.alt, img);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

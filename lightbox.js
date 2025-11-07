// Lightweight image lightbox for project mosaics
(function(){
  function ensureOverlay(){
    let overlay = document.getElementById('lightbox-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">×</button><img class="lightbox-image" alt="" />';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', close);
    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('img').addEventListener('click', function(e){ e.stopPropagation(); });
    window.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
    return overlay;
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
  }

  function init(){
    const tiles = document.querySelectorAll('.project-mosaic .tile img');
    if(!tiles.length) return;
    tiles.forEach(img => {
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

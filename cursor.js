'use strict';
(() => {
  if (!window.matchMedia('(pointer:fine)').matches) return;

  const scriptUrl = document.currentScript?.src || location.href;
  const assetBase = new URL('.', scriptUrl);
  let animationTimer = null;
  const frames = [1, 2, 3].map(n => {
    const image = new Image();
    image.src = new URL(`cursor/bongo-cat-frame-${n}.png`, assetBase).href;
    return image;
  });
  const cursor = document.createElement('img');
  cursor.id = 'bongo-ani-cursor';
  cursor.alt = '';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.src = frames[0].src;
  document.body.appendChild(cursor);

  const root = document.documentElement;
  const textTarget = 'input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea,[contenteditable]:not([contenteditable="false"])';
  let frame = 0;
  const disableAnimatedCursor = () => {
    root.classList.remove('bongo-ani-cursor', 'bongo-ani-text');
    cursor.remove();
    clearInterval(animationTimer);
  };
  frames.forEach(image => { image.onerror = disableAnimatedCursor; });
  cursor.onerror = disableAnimatedCursor;

  document.addEventListener('pointermove', e => {
    cursor.style.left = `${e.clientX - 1}px`;
    cursor.style.top = `${e.clientY - 1}px`;
    root.classList.add('bongo-ani-cursor');
    root.classList.toggle('bongo-ani-text', !!(e.target.closest && e.target.closest(textTarget)));
  }, { passive: true });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationTimer = setInterval(() => {
      if (document.hidden || root.classList.contains('bongo-ani-text')) return;
      frame = (frame + 1) % frames.length;
      cursor.src = frames[frame].src;
    }, 150);
  }
})();

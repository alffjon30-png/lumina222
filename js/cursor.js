const HOVER_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  '.chip',
  '.theme-pill',
  '.icon-btn',
  '.send',
  '.segment-row',
  '.volume-card',
  '.book',
  '.thumb',
  'input[type="submit"]',
  'label[for]'
].join(',');

export function initCursor() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let visible = false;
  let running = false;
  let rafId = 0;
  const LERP = 0.18;

  const start = () => {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };

  function loop() {
    if (!running) return;
    x += (targetX - x) * LERP;
    y += (targetY - y) * LERP;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(loop);
  }

  const onMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!visible) {
      visible = true;
      cursor.classList.add('visible');
      x = targetX;
      y = targetY;
    }
    start();
  };

  const onLeaveDoc = () => {
    visible = false;
    cursor.classList.remove('visible');
    stop();
  };

  const onEnterDoc = () => {
    visible = true;
    cursor.classList.add('visible');
    start();
  };

  const onOver = (e) => {
    const t = e.target;
    if (t && t.closest && t.closest(HOVER_SELECTOR)) {
      cursor.classList.add('hover');
    }
  };

  const onOut = (e) => {
    const t = e.target;
    if (t && t.closest && t.closest(HOVER_SELECTOR)) {
      const next = e.relatedTarget;
      if (!next || !next.closest || !next.closest(HOVER_SELECTOR)) {
        cursor.classList.remove('hover');
      }
    }
  };

  const onBlur = () => { stop(); };
  const onFocus = () => { if (visible) start(); };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', onLeaveDoc);
  document.addEventListener('mouseenter', onEnterDoc);
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  document.addEventListener('mousedown', () => cursor.classList.add('down'));
  document.addEventListener('mouseup', () => cursor.classList.remove('down'));
}

import { gsap } from 'gsap';

const DURATION = 0.4;
const INTERNAL_PAGES = new Set([
  'index.html',
  'marketplace.html',
  'rare.html',
  'philosophy.html',
  'scifi.html',
  'librarian.html'
]);

function getOverlay() {
  let el = document.querySelector('.page-transition');
  if (!el) {
    el = document.createElement('div');
    el.className = 'page-transition';
    document.body.appendChild(el);
  }
  return el;
}

function isInternalPageLink(anchor) {
  if (!anchor) return false;
  if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  const raw = anchor.getAttribute('href');
  if (!raw) return false;
  if (raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return false;

  let url;
  try { url = new URL(anchor.href, window.location.href); } catch { return false; }
  if (url.origin !== window.location.origin) return false;

  const file = url.pathname.split('/').pop() || 'index.html';
  if (!INTERNAL_PAGES.has(file)) return false;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  if (file === currentFile && url.search === window.location.search) return false;

  return true;
}

export function initPageTransitions() {
  const overlay = getOverlay();

  gsap.set(overlay, { autoAlpha: 1 });
  gsap.to(overlay, {
    autoAlpha: 0,
    duration: DURATION,
    ease: 'power2.out',
    onComplete: () => { overlay.style.pointerEvents = 'none'; }
  });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const anchor = e.target.closest('a[href]');
    if (!isInternalPageLink(anchor)) return;

    const href = anchor.href;
    e.preventDefault();
    overlay.style.pointerEvents = 'auto';
    gsap.killTweensOf(overlay);
    gsap.to(overlay, {
      autoAlpha: 1,
      duration: DURATION,
      ease: 'power2.in',
      onComplete: () => { window.location.href = href; }
    });
  });

  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'none' });
    gsap.to(overlay, { autoAlpha: 0, duration: DURATION, ease: 'power2.out' });
  });
}

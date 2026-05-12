import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const totalH = lines.length * lineHeight;
  const startY = y - totalH / 2 + lineHeight / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function coverTexture({ title, subtitle, bg, fg, accent }) {
  const w = 512, h = 720;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(w * 0.3, h * 0.25, 20, w * 0.5, h * 0.5, w);
  grad.addColorStop(0, 'rgba(255,255,255,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(w * 0.11, h * 0.11, w * 0.78, h * 0.78);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.28, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${Math.floor(w * 0.085)}px "Cormorant Garamond", Georgia, serif`;
  wrapText(ctx, title, w / 2, h * 0.5, w * 0.68, Math.floor(w * 0.1));

  if (subtitle) {
    ctx.fillStyle = accent;
    ctx.font = `${Math.floor(w * 0.034)}px "Inter", system-ui, sans-serif`;
    ctx.letterSpacing = '0.3em';
    ctx.fillText(subtitle.toUpperCase(), w / 2, h * 0.82);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function spineTexture({ title, bg, fg, accent }) {
  const w = 96, h = 720;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.4)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h * 0.08); ctx.lineTo(w * 0.8, h * 0.08);
  ctx.moveTo(w * 0.2, h * 0.92); ctx.lineTo(w * 0.8, h * 0.92);
  ctx.stroke();

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${Math.floor(w * 0.42)}px "Cormorant Garamond", Georgia, serif`;
  const short = title.length > 22 ? title.slice(0, 22) + '...' : title;
  ctx.fillText(short, 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function pagesTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ece3cf';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(120, 90, 50, 0.22)';
  for (let i = 0; i < size; i += 2) {
    ctx.fillRect(0, i, size, 0.7);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function contactShadowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.62)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function initBook3D(mount, opts) {
  const hoverEl = mount.closest('.volume-card') || mount;
  const {
    title = 'Untitled',
    subtitle = '',
    cover = '#1f1015',
    spine = '#180a0e',
    accent = '#d6b27a',
    text = '#f0e3c4'
  } = opts || {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.5, 8.6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xd6b27a, 0.55));
  const key = new THREE.DirectionalLight(0xfff2d8, 1.25);
  key.position.set(3.4, 4.6, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0009;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc9a36b, 0.4);
  fill.position.set(-3, 1.2, 2.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe6b8, 0.3);
  rim.position.set(0, 2.4, -4);
  scene.add(rim);

  const W = 2.1, H = 3.0, D = 0.55;
  const geo = new RoundedBoxGeometry(W, H, D, 4, 0.045);

  const coverTex = coverTexture({ title, subtitle, bg: cover, fg: text, accent });
  const spineTex = spineTexture({ title, bg: spine, fg: text, accent });
  const pagesTex = pagesTexture();

  const matPagesEdge = new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.92, metalness: 0 });
  const matSpine = new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.6, metalness: 0.08 });
  const matCover = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.52, metalness: 0.12 });
  const backColor = new THREE.Color(cover).multiplyScalar(0.78);
  const matBack = new THREE.MeshStandardMaterial({ color: backColor, roughness: 0.58, metalness: 0.1 });
  const matTopBot = new THREE.MeshStandardMaterial({ color: 0xe8dfc6, roughness: 0.9, metalness: 0 });

  // RoundedBoxGeometry uses BoxGeometry material order: +X, -X, +Y, -Y, +Z, -Z
  const materials = [matPagesEdge, matSpine, matTopBot, matTopBot, matCover, matBack];
  const book = new THREE.Mesh(geo, materials);
  book.castShadow = true;
  book.receiveShadow = true;
  book.position.y = 0.15;
  scene.add(book);

  const shadowTex = contactShadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.2, H * 0.85), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 + 0.05;
  scene.add(shadow);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const baseRotY = 0;
  const hoverRotY = -25 * Math.PI / 180;
  let targetRotY = baseRotY;
  let currentRotY = baseRotY;

  const onEnter = () => { targetRotY = hoverRotY; };
  const onLeave = () => { targetRotY = baseRotY; };
  hoverEl.addEventListener('pointerenter', onEnter);
  hoverEl.addEventListener('pointerleave', onLeave);
  hoverEl.addEventListener('focusin', onEnter);
  hoverEl.addEventListener('focusout', onLeave);

  const resize = () => {
    const rect = mount.getBoundingClientRect();
    const w = Math.max(2, rect.width);
    const h = Math.max(2, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();

  let visible = false;
  let running = false;
  let rafId = 0;
  const start = performance.now();

  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  }, { threshold: 0.05 });
  io.observe(mount);

  function loop() {
    if (!visible) { running = false; return; }
    rafId = requestAnimationFrame(loop);
    const t = performance.now() - start;
    const ease = reduceMotion ? 1 : 0.075;
    currentRotY += (targetRotY - currentRotY) * ease;
    book.rotation.y = currentRotY;
    if (!reduceMotion) {
      book.rotation.x = Math.sin(t * 0.0008) * 0.035;
      book.position.y = 0.15 + Math.sin(t * 0.0011) * 0.025;
    }
    renderer.render(scene, camera);
  }

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      hoverEl.removeEventListener('pointerenter', onEnter);
      hoverEl.removeEventListener('pointerleave', onLeave);
      hoverEl.removeEventListener('focusin', onEnter);
      hoverEl.removeEventListener('focusout', onLeave);
      geo.dispose();
      coverTex.dispose(); spineTex.dispose(); pagesTex.dispose(); shadowTex.dispose();
      materials.forEach((m) => m.dispose());
      shadowMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

export function initAllBooks(root = document) {
  const mounts = root.querySelectorAll('.book3d-mount');
  const instances = [];
  mounts.forEach((mount) => {
    const opts = {
      title: mount.dataset.title || 'Untitled',
      subtitle: mount.dataset.subtitle || '',
      cover: mount.dataset.cover || '#1f1015',
      spine: mount.dataset.spine || '#180a0e',
      accent: mount.dataset.accent || '#d6b27a',
      text: mount.dataset.text || '#f0e3c4'
    };
    instances.push(initBook3D(mount, opts));
  });
  return instances;
}

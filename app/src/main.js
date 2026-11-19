// Wires the page: pick photos for the three panels (one photo can fill them all), drag a panel to pan
// it, zoom it, type the title and subtitle, pick a post size, and export the cover as a PNG.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js). Photos are read on the
// user's own machine and never uploaded.
import { drawCover, panelAt, layoutFor, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const sizeSelect = document.getElementById('size');
const statusEl = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const zoomLabel = document.getElementById('zoom-label');
const panelNameEl = document.getElementById('panel-name');

const state = {
  sizeKey: '1920x1080',
  title: 'Sunset Heist',
  subtitle: 'Vice City • 2026',
  photos: [
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
    { img: null, zoom: 1, ox: 0, oy: 0 },
  ],
};
let selected = 0;

function redraw() {
  drawCover(canvas, state);
  const panel = layoutFor(state.sizeKey)[selected];
  panelNameEl.textContent = panel.name;
  zoomInput.value = String(state.photos[selected].zoom);
  zoomLabel.textContent = `${state.photos[selected].zoom.toFixed(2)}×`;
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  const [hero, pier] = await Promise.all([
    loadImage('samples/boulevard.jpg'),
    loadImage('samples/pier.jpg'),
  ]);
  state.photos[0].img = hero;
  state.photos[1].img = pier;
  state.photos[2].img = pier;
}

// One file input per panel.
document.querySelectorAll('[data-panel]').forEach((input) => {
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const i = Number(input.dataset.panel);
    state.photos[i].img = await loadImage(URL.createObjectURL(file));
    state.photos[i].zoom = 1;
    state.photos[i].ox = 0;
    state.photos[i].oy = 0;
    selected = i;
    redraw();
    statusEl.textContent = `${file.name} is in ${layoutFor(state.sizeKey)[i].name}.`;
  });
});

document.getElementById('fill-all').addEventListener('click', () => {
  const hero = state.photos[0];
  if (!hero.img) return;
  for (let i = 1; i < state.photos.length; i++) {
    state.photos[i].img = hero.img;
    state.photos[i].zoom = hero.zoom;
    state.photos[i].ox = hero.ox;
    state.photos[i].oy = hero.oy;
  }
  redraw();
  statusEl.textContent = 'The hero photo now fills every panel.';
});

document.getElementById('reset-crop').addEventListener('click', () => {
  const p = state.photos[selected];
  p.zoom = 1;
  p.ox = 0;
  p.oy = 0;
  redraw();
});

zoomInput.addEventListener('input', () => {
  state.photos[selected].zoom = Number(zoomInput.value);
  redraw();
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
sizeSelect.addEventListener('change', () => { state.sizeKey = sizeSelect.value; redraw(); });

// Drag on the preview to pan the photo in the panel under the pointer; the wheel zooms it.
let drag = null;
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { nx: (e.clientX - rect.left) / rect.width, ny: (e.clientY - rect.top) / rect.height };
}
canvas.addEventListener('pointerdown', (e) => {
  const { nx, ny } = canvasPoint(e);
  const panel = panelAt(state.sizeKey, nx, ny);
  if (!panel) return;
  selected = panel.id;
  drag = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const p = state.photos[selected];
  const layout = layoutFor(state.sizeKey)[selected];
  const xs = layout.poly.map(([x]) => x);
  const ys = layout.poly.map(([, y]) => y);
  const pw = (Math.max(...xs) - Math.min(...xs)) * rect.width;
  const ph = (Math.max(...ys) - Math.min(...ys)) * rect.height;
  p.ox += (e.clientX - drag.x) / pw;
  p.oy += (e.clientY - drag.y) / ph;
  drag = { x: e.clientX, y: e.clientY };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const { nx, ny } = canvasPoint(e);
  const panel = panelAt(state.sizeKey, nx, ny);
  if (!panel) return;
  selected = panel.id;
  const p = state.photos[selected];
  p.zoom = Math.min(3, Math.max(1, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });

document.getElementById('export').addEventListener('click', async () => {
  await document.fonts.ready;
  const [w, h] = SIZES[state.sizeKey];
  const off = document.createElement('canvas');
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { statusEl.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${w}x${h}.png`;
    a.click();
    statusEl.textContent = `Saved vice-cover-${w}x${h}.png`;
  }, 'image/png');
});

/** Applies a fixed screenshot scene: loads its sample photos, title and size, then draws. */
async function applyScene(scene) {
  await document.fonts.load('100px Anton').catch(() => {});
  const imgs = await Promise.all(scene.photos.map((name) => loadImage(`samples/${name}.jpg`)));
  state.photos.forEach((p, i) => {
    p.img = imgs[i] ?? imgs[0];
    p.oy = scene.offsets?.[i] ?? 0;
  });
  state.sizeKey = scene.size;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  titleInput.value = scene.title;
  subtitleInput.value = scene.subtitle;
  sizeSelect.value = scene.size;
  redraw();
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), applyScene);
} else {
  loadSamples().then(redraw);
}

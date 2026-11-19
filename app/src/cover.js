// Draws a GTA 6-style multi-panel cover: a Vice City sunset gradient sky, palm silhouettes and a glowing
// sun drawn in code, several angled photo panels (a big hero plus smaller panels, each with its own crop
// and zoom), a warm neon grade over the photos, halftone dots, a vignette, and the caption in bold condensed
// Anton lettering with an outline and drop shadow. Everything is drawn on canvas; no Rockstar artwork,
// logo, wordmark or font is used anywhere.

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** Panel polygons in normalised (0..1) coordinates, per export size. Diagonal edges give the poster look. */
export function layoutFor(sizeKey) {
  if (sizeKey === '1080x1080') {
    return [
      { id: 0, name: 'Hero', poly: [[0, 0], [1, 0], [1, 0.55], [0, 0.61]] },
      { id: 1, name: 'Panel left', poly: [[0, 0.61], [0.515, 0.579], [0.515, 1], [0, 1]] },
      { id: 2, name: 'Panel right', poly: [[0.515, 0.579], [1, 0.55], [1, 1], [0.515, 1]] },
    ];
  }
  if (sizeKey === '1080x1350') {
    return [
      { id: 0, name: 'Hero', poly: [[0, 0], [1, 0], [1, 0.48], [0, 0.53]] },
      { id: 1, name: 'Panel left', poly: [[0, 0.53], [0.51, 0.505], [0.51, 0.8], [0, 0.825]] },
      { id: 2, name: 'Panel right', poly: [[0.51, 0.505], [1, 0.48], [1, 0.775], [0.51, 0.8]] },
    ];
  }
  return [
    { id: 0, name: 'Hero', poly: [[0, 0], [0.6, 0], [0.545, 1], [0, 1]] },
    { id: 1, name: 'Panel top', poly: [[0.6, 0], [1, 0], [1, 0.47], [0.574, 0.47]] },
    { id: 2, name: 'Panel bottom', poly: [[0.574, 0.47], [1, 0.47], [1, 1], [0.545, 1]] },
  ];
}

/** True when normalised point (x, y) lies inside the polygon (ray casting). */
export function pointInPoly(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Returns the panel whose polygon contains the normalised point, or null. */
export function panelAt(sizeKey, nx, ny) {
  return layoutFor(sizeKey).find((p) => pointInPoly(p.poly, nx, ny)) ?? null;
}

function tracePoly(ctx, poly, w, h) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * w, y * h) : ctx.lineTo(x * w, y * h)));
  ctx.closePath();
}

function drawSky(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#2b0a4e');
  sky.addColorStop(0.35, '#7b1e6e');
  sky.addColorStop(0.62, '#e84393');
  sky.addColorStop(0.82, '#ff7a3d');
  sky.addColorStop(1, '#ffc46b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Low sun with a warm glow, upper right of the sky.
  const sx = w * 0.74;
  const sy = h * 0.3;
  const sr = Math.min(w, h) * 0.13;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr * 2.6);
  glow.addColorStop(0, 'rgba(255, 214, 130, 0.85)');
  glow.addColorStop(0.4, 'rgba(255, 122, 61, 0.35)');
  glow.addColorStop(1, 'rgba(255, 122, 61, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

/** One palm silhouette, drawn in code: a leaning trunk and drooping fronds. */
function drawPalm(ctx, x, y, s, lean, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk.
  ctx.lineWidth = Math.max(2, s * 0.055);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.3, y - s * 0.6, x + lean * s, y - s);
  ctx.stroke();
  // Fronds fanning from the crown.
  const cx = x + lean * s;
  const cy = y - s;
  ctx.lineWidth = Math.max(1.5, s * 0.032);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (i / 6) * 0.84);
    const ex = cx + Math.cos(a) * s * 0.52;
    const ey = cy + Math.sin(a) * s * 0.34 - s * 0.1;
    const mx = cx + Math.cos(a) * s * 0.3;
    const my = cy - s * 0.16 + Math.sin(a) * s * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(mx, my, ex, ey + s * 0.12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalms(ctx, w, h, sizeKey) {
  const color = 'rgba(22, 8, 36, 0.92)';
  if (sizeKey === '1080x1350') {
    // Title band at the foot: palms frame it left and right.
    drawPalm(ctx, w * 0.04, h * 0.995, h * 0.16, 0.35, color);
    drawPalm(ctx, w * 0.96, h * 0.995, h * 0.13, -0.3, color);
  } else {
    drawPalm(ctx, w * 0.015, h * 1.0, h * 0.17, 0.4, color);
    drawPalm(ctx, w * 0.985, h * 1.0, h * 0.13, -0.35, color);
  }
}

function drawHalftone(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  const rows = 5;
  const cols = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const radius = Math.max(0.6, (1 - (r + c) / (rows + cols)) * Math.min(w, h) * 0.006);
      ctx.beginPath();
      ctx.arc(w * 0.03 + c * w * 0.016, h * 0.035 + r * h * 0.02, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Draws one photo panel: the photo cover-fitted with its zoom and pan, then a warm neon grade. */
function drawPanel(ctx, panel, photo, w, h) {
  const xs = panel.poly.map(([x]) => x * w);
  const ys = panel.poly.map(([, y]) => y * h);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const pw = x1 - x0;
  const ph = y1 - y0;
  ctx.save();
  tracePoly(ctx, panel.poly, w, h);
  ctx.clip();
  if (photo?.img) {
    const iw = photo.img.naturalWidth;
    const ih = photo.img.naturalHeight;
    const base = Math.max(pw / iw, ph / ih);
    const scale = base * (photo.zoom || 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x0 + (pw - dw) / 2 + (photo.ox || 0) * pw;
    const dy = y0 + (ph - dh) / 2 + (photo.oy || 0) * ph;
    ctx.drawImage(photo.img, dx, dy, dw, dh);
  }
  // Sunset grade over the photo.
  const grade = ctx.createLinearGradient(x0, y0, x0, y1);
  grade.addColorStop(0, 'rgba(255, 110, 60, 0.07)');
  grade.addColorStop(1, 'rgba(150, 30, 120, 0.18)');
  ctx.fillStyle = grade;
  ctx.fillRect(x0, y0, pw, ph);
  ctx.restore();
  // Dark gutter between panels.
  ctx.save();
  tracePoly(ctx, panel.poly, w, h);
  ctx.strokeStyle = '#160824';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.stroke();
  ctx.restore();
}

function drawCaption(ctx, w, h, sizeKey, title, subtitle) {
  const portrait = sizeKey === '1080x1350';
  // Scrim so the lettering reads over any photo.
  const scrimTop = portrait ? h * 0.8 : h * 0.66;
  const scrim = ctx.createLinearGradient(0, scrimTop, 0, h);
  scrim.addColorStop(0, 'rgba(22, 8, 36, 0)');
  scrim.addColorStop(0.55, 'rgba(22, 8, 36, 0.55)');
  scrim.addColorStop(1, 'rgba(22, 8, 36, 0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimTop, w, h - scrimTop);

  const text = (title || '').trim().toUpperCase();
  const sub = (subtitle || '').trim().toUpperCase();
  const cx = w / 2;
  const maxW = w * (portrait ? 0.88 : 0.92);
  const font = (size) => `${size}px Anton, 'Arial Narrow', sans-serif`;

  if (text) {
    let size = h * (portrait ? 0.082 : 0.115);
    ctx.font = font(size);
    while (ctx.measureText(text).width > maxW && size > 12) {
      size -= 2;
      ctx.font = font(size);
    }
    const baseline = portrait ? h * 0.925 : h * 0.9;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    const fill = ctx.createLinearGradient(0, baseline - size, 0, baseline);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(0.55, '#ffe9a8');
    fill.addColorStop(1, '#ff7a3d');
    ctx.shadowColor = 'rgba(10, 2, 20, 0.85)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = '#160824';
    ctx.lineWidth = size * 0.09;
    ctx.strokeText(text, cx, baseline);
    ctx.fillStyle = fill;
    ctx.fillText(text, cx, baseline);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (sub) {
      let subSize = size * 0.26;
      ctx.font = font(subSize);
      try { ctx.letterSpacing = `${Math.max(2, subSize * 0.22)}px`; } catch { /* older canvas: ignore */ }
      while (ctx.measureText(sub).width > maxW && subSize > 8) {
        subSize -= 1;
        ctx.font = font(subSize);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(sub, cx, baseline + size * 0.42);
      try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
    }
  }
}

/**
 * Draws the whole cover onto `canvas` (resized to the export size).
 * `state` is { sizeKey, title, subtitle, photos: [{img, zoom, ox, oy}, ...] }.
 */
export function drawCover(canvas, state) {
  const [w, h] = SIZES[state.sizeKey] ?? SIZES['1920x1080'];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawSky(ctx, w, h);
  const panels = layoutFor(state.sizeKey);
  panels.forEach((panel, i) => drawPanel(ctx, panel, state.photos[i], w, h));
  drawHalftone(ctx, w, h);
  // Vignette.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(20, 0, 30, 0)');
  vig.addColorStop(1, 'rgba(20, 0, 30, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  drawPalms(ctx, w, h, state.sizeKey);
  drawCaption(ctx, w, h, state.sizeKey, state.title, state.subtitle);
}

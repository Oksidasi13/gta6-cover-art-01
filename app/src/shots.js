// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo loaded; ?shot=cover
// shows the exported cover alone, full-bleed. `photo`, `photo2` and `photo3` pick the samples
// (samples/<name>.jpg), `caption` the title, `subtitle` the subtitle line and `size` the post size.
// window.__shotReady is set once the cover is painted.
export async function runShot(shot, query, applyScene) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await applyScene({
    size: query.get('size') ?? '1920x1080',
    photos: [
      query.get('photo') ?? 'pier',
      query.get('photo2') ?? 'boulevard',
      query.get('photo3') ?? 'pier',
    ],
    // Vertical crop offsets per panel (-1..1): positive shows more of the photo's top.
    offsets: [
      Number(query.get('oy') ?? 0),
      Number(query.get('oy2') ?? 0),
      Number(query.get('oy3') ?? 0),
    ],
    title: query.get('caption') ?? 'Sunset Heist',
    subtitle: query.get('subtitle') ?? 'Vice City • 2026',
  });
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

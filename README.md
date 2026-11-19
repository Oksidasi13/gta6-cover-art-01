# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Oksidasi13/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Oksidasi13/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your own photos and a caption into GTA 6-style multi-panel cover art, exported as a PNG to share. A make.fun entry for the `gta6-cover-art-01` competition.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open http://localhost:8080 in a desktop browser. Everything is static files under `app/` with no build step and no network request — it works fully offline.

To hand the entry in, run `node main.ts` (or `MAKEFUN_OUTPUT_DIR=out node main.ts` outside the grader), which copies `app/` and `screenshots/` and writes `dossier.json`.

## What it does

- Upload your own photos from your machine (read locally, never uploaded) — one per panel, or fill every panel with the hero photo.
- Three angled panels per cover: a big hero panel plus two smaller panels, with diagonal poster-style edges.
- Crop and position each photo: click a panel in the preview to select it, drag to pan, scroll or use the slider to zoom, reset any time.
- Edit the caption: a bold title plus a subtitle line, in condensed Anton lettering with an outline, gradient fill and drop shadow.
- Post sizes: 1080 × 1080, 1080 × 1350, 1920 × 1080 — live preview, one-click PNG export.
- Original art direction only: a Vice City sunset gradient sky, glowing sun and palm-tree silhouettes drawn in code, halftone dots and a vignette. No Rockstar logo, wordmark, official artwork, character or font is used. The Anton font ships under the SIL Open Font License (see `app/fonts/OFL.txt`).

## Screenshots

`screenshots/` holds four PNGs taken of this app: the landscape cover first, then the editor with a photo loaded, then the square and portrait covers. The `?shot=` scenes that produce them are listed in `shots.json`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

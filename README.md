# DISORDER

First-person psychological horror during one night shift in an early-2000s administrative complex. Work and exploration come first; inconsistencies interrupt the routine. The current local slice is a work in progress, not the full night.

Developed with:

- JavaScript
- Three.js
- Vite

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

## Controls

WASD: move · Mouse: look · Shift: sprint · E: interact · TAB: work sheet · Escape: pause/close.
Pointer Lock is the default; if a browser denies it, drag on the game view to look around.
During dialogue, E reveals the current line, then advances. Click the menu to enable audio (browser autoplay restriction). Settings provides independent master, music and SFX volumes.

## Slice validation

Run `npm test` for automated checks. Add `?dev=true` for metrics and seeded restarts: **5** is normal, **8** has the clock offset, **1** can alter Marta's eyes. For the eye event, observe Marta with E before checking all three boxes; the change only occurs later, away from her.

The scene renders at 640×480, with a centered 4:3 pixelated upscale and HTML UI. Four NPCs are active; nine reference-based character assets have been prepared. Original reference/music folders remain untouched.

The art slice preserves the tested gameplay: four active characters remodeled in Blender, painted-pixel textures and a shared prop atlas. See `ART_REPORT.md` for captures, measurements and publication status. `PIVOT_REPORT.md` is the historical checkpoint before this art pass. The full campaign and a verified 5–10 minute duration are not claimed.

## Preview

```sh
npm run preview
```

## Deployment

GitHub Pages via GitHub Actions.

Live site: https://gustvxlz.github.io/disorder/

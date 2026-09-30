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

Run `npm test` for automated checks. Every new shift begins normal. Read the internal notice, authorize printing through the phone, collect the order/card, compare box counts, and submit the inventory. The printer manifestation then introduces the second observation pass. Add `?dev=true` for metrics and seeded restarts: after that scene, **5** stays normal, **8** can change the clock, **1** can alter Marta's eyes. Eyes still require normal observation and distance; changes never start beside the player.

The scene renders at 640×480, with a centered 4:3 pixelated upscale and HTML UI. Four NPCs are active; nine reference-based character assets have been prepared. Original reference/music folders remain untouched.

The current story slice keeps the art pass, adds the protagonist body, a printer/card puzzle, functional light circuits, the first telepathic manifestation and coherent pause/save. RESUME returns to the active paused scene; CONTINUE loads persistent progress. Old saves retain their previous progress and skip the new introduction: use NEW SHIFT to play the new mission. See `STORY_REPORT.md` for current verification and limitations. `ART_REPORT.md` and `PIVOT_REPORT.md` are historical checkpoints. The full campaign and a verified duration are not claimed.

## Preview

```sh
npm run preview
```

## Deployment

GitHub Pages via GitHub Actions.

Live site: https://gustvxlz.github.io/disorder/

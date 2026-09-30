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

Run `npm test` for automated checks. For a walking playtest, open the normal URL without `?dev=true` and choose NEW SHIFT. The only initial goal is to fetch September's monthly inventory from Archive B and deliver it to Marta. Access and document clues live in notices, conversations and the intranet; telephone, printer and box checks are not prerequisites.

The first contact requires delivery, at least ten minutes of unpaused simulation, and a return near the Protocolo printer. The interval allows optional desktop exploration, conversations and environmental interactions. This minimum protects normality; it is not a claim of ten to fifteen minutes of mandatory or validated entertaining content. After contact, the existing seeded anomalies remain gated by time, leaving Protocolo, normal observation and distance. DEV is only a diagnostic tool and was not used for the recorded walking playtest.

The scene renders at 640×480, with a centered 4:3 pixelated upscale and HTML UI. Four NPCs are active; nine reference-based character assets have been prepared. Original reference/music folders remain untouched.

The gameplay rescue preserves the art, controls, body, light circuits and pause/save. Four employees now have contextual stations and short routines. Three CRTs open an original fictional corporate desktop, including an optional cat doodle and depot pastime. RESUME returns to the active paused scene; CONTINUE loads persistent progress. Old saves retain their previous progress: use NEW SHIFT for the new mission. See `GAMEPLAY_REPORT.md` for current verification and limitations. `STORY_REPORT.md`, `ART_REPORT.md` and `PIVOT_REPORT.md` are historical checkpoints. Only the first mission is implemented; the seven-task fixed-building plan is not a playable campaign.

## Preview

```sh
npm run preview
```

## Deployment

GitHub Pages via GitHub Actions.

Live site: https://gustvxlz.github.io/disorder/

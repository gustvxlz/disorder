# DISORDER - Technical Foundation

## Stack

- HTML
- CSS
- JavaScript ES Modules
- Three.js
- Vite

## Build

Vite provides the local development server, production build, and local production preview. The generated static site is written to `dist/`.

## Deployment

GitHub Actions builds the project and deploys the `dist/` directory to GitHub Pages.

## Asset pipeline

Runtime assets belong under `public/assets/`, organized as models, textures, images, and audio. Prefer GLB, WebP, compressed audio, and appropriately sized textures. Blender source files belong in `source-assets/blender/` and are never loaded at runtime.

## GitHub Pages compatibility

Vite uses the relative base path `./`, so the static build works when hosted under the `/disorder/` project subdirectory. Runtime asset references must remain relative or be constructed with Vite's base URL support.

## Performance goals

The project targets modest computers. Development must account for draw calls, triangle counts, memory usage, texture sizes, light and shadow costs, and unnecessary per-frame updates.

## Blender

Blender 5.2.2 LTS is installed at `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`; background generation was verified. Run it with `--background --python source-assets/blender/build_kit.py` to regenerate the library and editable source. The optional `render_preview.py` writes an offline model preview to ignored `dist/qa/`; it is not a screenshot of the game.

## Vertical slice architecture

- `Game` coordinates startup, menus, progression and persistence.
- `WorldState`, `SeededRandom`, `AnomalyManager` and `TaskManager` own deterministic state. Clock offset and delayed purple eyes are implemented. Seed 5 is normal, 8 clock-only, 1 eyes-only. Eyes require previous normal observation, all three box checks, and distance of at least eight meters. No detection cue or visible score is shown.
- `PlayerController` uses an upright circle against AABBs and door segments. Movement is substepped, diagonals normalized, pitch clamped, input cleared on blur/panels. Pointer Lock is primary; mouse drag is the fallback if rejected.
- `InteractionSystem` casts a 2.25 m center ray with wall, furniture and door obstruction tests.
- `AssetLibrary` loads the office GLB, shared textures and four character GLBs. SkeletonUtils clones each skinned actor independently; animation clips/materials/geometry are reused where possible. Static geometry is merged by shared material; interactables, doors, clocks and NPCs remain independent.
- `WorldManager`, `RoomBuilder` and `OfficeRooms` define the existing rooms. Six point lights plus a hemisphere; other fixtures are emissive or deliberately unlit. Shared 64px transparent contact masks ground furniture/NPCs without real-time shadow maps.
- `AudioManager` unlocks WebAudio after user input, generates quantized effects and positional dialogue pulses. Footsteps depend on speed and use pitch variation; Archive ambience changes filter response. Legacy SAPI speech is archived outside runtime.
- `MusicManager` owns three original 26.4-second waltz cues, volume, slow crossfades, silence and repeat avoidance. The menu cue loops only after a gesture. Archive entry silences music; return/report are natural cue boundaries. The ending method exists, but no ending is implemented.
- `DialogueManager` owns typewriter text, spaced synthetic syllables, optional speaker, E skip/advance and completion callbacks. `ShiftFlow` coordinates waking, camera observation and delayed events; it does not simulate a full campaign.
- `OfficeNPC` uses a shared 16-bone skeleton for the four active art characters (hips/spine/neck/head and three joints per limb). Animation is throttled to 24 Hz within 20 m. A restrained head turn faces a nearby player. The opening colleague's collider follows walking. Five older prepared actors retain the previous rig and are not placed.
- `RetroDisplay` fixes the WebGL buffer at 640×480 with pixel ratio 1 and antialiasing off. CSS pixelated/crisp-edges upscale fits a centered 4:3 container. HTML UI remains legible; no postprocessing chain or stretched widescreen projection. Non-integer fit sizes can have uneven pixel replication.
- `SaveManager` validates versioned localStorage state; unavailable storage does not crash. Continue restores task/anomaly state and starts the player back in Protocolo, not at the previous physical position.

## Controls and verification

WASD, mouse look, Shift sprint, E interact, TAB work sheet, Escape pause/close. No jumping. `?dev=true` shows renderer metrics, state, seed restart and diagnostic positioning. Teleport-based interaction tests do not count as a walking playtest.

`npm test` covers actual GLB parsing, scene construction, route traversal using player physics, interactable raycasts, doors, obstruction, deterministic seeds, reports, save round trips and audio data integrity. It does not verify rendering, Pointer Lock, perceived audio quality or browser behavior.

Build chunks separate game, Three core and renderer/addons without altering the deployment workflow. Runtime remains entirely static, with Vite-relative asset URLs. See `AUDIT.md` for release gates and pending browser validation.

## Character and music generation

`source-assets/blender/characters/build_characters.py` regenerates only the four active employees and preserves the five old variants. Each contains idle, walk, talk, look, sit, stand, typing, work_at_desk, carry_folder and inspect_document clips. Documents are weighted to the hand; iris and badge have separate named materials. These are simple procedural animations, not motion capture. Work/sit clips are prepared, not used for new gameplay.

Run `source-assets/build_textures.py` with Pillow before `build_kit.py`. The latter executes `art_props.py`, saves the editable kit plus focused prop/environment .blend files, and exports one office GLB. A packed 256px 4×4 atlas consolidates ordinary props into `OfficeAtlas`; emissive tubes and architecture remain separate. Runtime WebP replaces the embedded atlas with glTF-compatible `flipY=false`, nearest magnification and nearest mip sampling. Surface textures are 64–128 px; labels use CanvasTexture. Collision remains simple AABBs/circles/door segments; visual detail is not triangle collision.

`source-assets/audio/build_music.py` produces original three-voice pulse/triangle compositions as mono 22.05 kHz, 8-bit PCM WAV. No new dependency or DAW is installed. These are not transcriptions or re-arrangements of the provided MP3s. WAV is used for deterministic, broadly supported decoding; compressed delivery remains a possible later optimization.

FPS uses raw frame delta, independently of physics' 50 ms timestep cap. Report renderer calls/triangles from the DEV panel, not static inventory. Diagnostic ART positions are visual inspection aids only. See `ART_REPORT.md` for current validation; the deployment workflow was not modified.

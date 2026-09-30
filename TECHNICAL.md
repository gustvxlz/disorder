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
- `WorldState`, `SeededRandom`, `AnomalyManager` and `TaskManager` own deterministic state. Every new shift begins normal. After inventory submission, `Manifestation` controls the printer/light/telepathic scene. Only after its completion, eight simulation seconds and leaving Protocolo are the existing seeded anomalies selected (5 normal, 8 clock-only, 1 eyes-only). Purple eyes additionally require normal observation, three box checks and distance of at least eight meters. No detection cue or visible score is shown.
- `PlayerController` uses an upright circle against AABBs and door segments. Movement is substepped, diagonals normalized, pitch clamped, input cleared on blur/panels. Pointer Lock is primary; mouse drag is the fallback if rejected.
- `InteractionSystem` casts a 2.25 m center ray with wall, furniture and door obstruction tests.
- `AssetLibrary` loads the office GLB, shared textures and four character GLBs. SkeletonUtils clones each skinned actor independently; animation clips/materials/geometry are reused where possible. Static geometry is merged by shared material; interactables, doors, clocks and NPCs remain independent.
- `WorldManager`, `RoomBuilder` and `OfficeRooms` define the existing rooms. Six point lights plus a hemisphere; other fixtures are emissive or deliberately unlit. Shared 64px transparent contact masks ground furniture/NPCs without real-time shadow maps.
- `AudioManager` unlocks WebAudio after user input, generates quantized effects and positional dialogue pulses. Footsteps depend on speed and use pitch variation; Archive ambience changes filter response. Legacy SAPI speech is archived outside runtime.
- `MusicManager` owns three original 26.4-second waltz cues, volume, slow crossfades, silence and repeat avoidance. The menu cue loops only after a gesture. Archive entry silences music; return/report are natural cue boundaries. The ending method exists, but no ending is implemented.
- `DialogueManager` owns typewriter text, spaced synthetic syllables, optional speaker, E skip/advance and completion callbacks. `ShiftFlow` coordinates waking, camera observation and delayed events; it does not simulate a full campaign.
- `OfficeNPC` uses a shared 16-bone skeleton for the four active art characters (hips/spine/neck/head and three joints per limb). Animation is throttled to 24 Hz within 20 m. A restrained head turn faces a nearby player. The opening colleague's collider follows walking. Five older prepared actors retain the previous rig and are not placed.
- `RetroDisplay` fixes the WebGL buffer at 640×480 with pixel ratio 1 and antialiasing off. CSS pixelated/crisp-edges upscale fits a centered 4:3 container. HTML UI remains legible; no postprocessing chain or stretched widescreen projection. Non-integer fit sizes can have uneven pixel replication.
- `SaveManager` validates v2 localStorage state, including story, access, lighting, doors and player pose. V1 saves migrate without discarding completed work: they keep old earned access/anomalies and skip the new introduction. New shifts use the complete narrative flow. Continue restores a safe pose; an interrupted manifestation restarts from its beginning. Unavailable storage does not crash.

## Controls and verification

WASD, mouse look, Shift sprint, E interact, TAB work sheet, Escape pause/close. No jumping. `?dev=true` shows renderer metrics, state, seed restart and diagnostic positioning. Teleport-based interaction tests do not count as a walking playtest.

`npm test` covers actual GLB parsing, scene construction, route traversal using player physics, interactable raycasts, doors, obstruction, deterministic seeds, reports, save round trips and audio data integrity. It does not verify rendering, Pointer Lock, perceived audio quality or browser behavior.

Build chunks separate game, Three core and renderer/addons without altering the deployment workflow. Runtime remains entirely static, with Vite-relative asset URLs. See `AUDIT.md` for release gates and pending browser validation.

## Character and music generation

`source-assets/blender/characters/build_characters.py` regenerates only the four active employees and preserves the five old variants. Each contains idle, walk, talk, look, sit, stand, typing, work_at_desk, carry_folder and inspect_document clips. Documents are weighted to the hand; iris and badge have separate named materials. These are simple procedural animations, not motion capture. Work/sit clips are prepared, not used for new gameplay.

Run `source-assets/build_textures.py` with Pillow before `build_kit.py`. The latter executes `art_props.py`, saves the editable kit plus focused prop/environment .blend files, and exports one office GLB. A packed 256px 4×4 atlas consolidates ordinary props into `OfficeAtlas`; emissive tubes and architecture remain separate. Runtime WebP replaces the embedded atlas with glTF-compatible `flipY=false`, nearest magnification and nearest mip sampling. Surface textures are 64–128 px; labels use CanvasTexture. Collision remains simple AABBs/circles/door segments; visual detail is not triangle collision.

`source-assets/audio/build_music.py` produces original three-voice pulse/triangle compositions as mono 22.05 kHz, 8-bit PCM WAV. No new dependency or DAW is installed. These are not transcriptions or re-arrangements of the provided MP3s. WAV is used for deterministic, broadly supported decoding; compressed delivery remains a possible later optimization.

FPS uses raw frame delta, independently of physics' 50 ms timestep cap. Report renderer calls/triangles from the DEV panel, not static inventory. Diagnostic positions are inspection aids only. See `STORY_REPORT.md` for the latest validation; `ART_REPORT.md` records the earlier art pass. The deployment workflow was not modified.

## Story / interaction pass

`MissionData` contains the fixed manifest, extension and story defaults. `TaskManager` gates printer authorization, order, card, access, correct counts and one-time inventory submission; anomaly reporting is a separate later stage. `MissionUI` owns HTML documents, telephone, checklist and terminal pages without a new UI dependency. The building layout remains authored and fixed; Archive B is the first card gate. Other side doors remain reserved/blocked, not unbuilt rooms presented as playable content.

`WorldManager` groups existing lights/emissive materials by circuit. Switches persist manual states; temporary entity interference overrides Protocolo only and restores the manual state. No additional real lights or shadow maps. Visual props keep simple colliders.

`PlayerBody` loads the reference-derived protagonist GLB (16 bones, 10 reusable clips, 2,628 tris), follows position/yaw and plays idle/walk/look. FPS uses a private head/neck index mask to avoid clipping; the full original geometry can be used in external views. This does not implement mirrors or shadow maps. Regenerate only that character with Blender `--background --python source-assets/blender/characters/build_characters.py -- --only protagonist`.

Pause is explicit session state: input cleared, pose saved, WebAudio context suspended, and dialogue/cutscene/NPC/doors/clock/music updates frozen. Resume restores that same scene and does not replay dialogue; busy cutscenes still gate movement. Continue loads the persisted snapshot and replaces the current scene. Resume is hidden after page reload until a session exists. Menus/settings do not accidentally resume audio while paused.

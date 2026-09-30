# Vertical slice rescue — audit

Historical rescue record. The current pivot supersedes the creative direction and checkpoint metrics below; see PIVOT_REPORT.md. Browser acceptance remains pending.

Baseline inspected on 2026-09-29 before the rescue pass. No slice changes have been committed yet.

## Confirmed defects

- Settings panel was rendered behind the menu (stacking order).
- Escape had no pause path when Pointer Lock was unavailable.
- Keyboard state was not cleared when the window lost focus or a panel opened.
- Interaction raycasts tested only interactables, allowing interaction through intervening geometry.
- Save validation accepted incomplete/corrupt world records.
- Phone consequence could ring again on every terminal close.
- Door model was 2.6 m high, had no handle, and slid into walls without a coherent office-door design.
- Archive doorway wall segments had inconsistent openings on opposite sides.
- The task was not available away from the terminal; no opening call or shelf identification existed.
- Task boxes were on the floor, not on shelf 03.
- Ambient audio gain was effectively inaudible; footsteps were identical and unrelated to movement speed.
- Digital text plates replaced clocks; raw cuboids and flat materials dominated the space.
- Marta had no facial details and never left TALK after interaction.

## Baseline validation

Seed 12346: terminal order, all three box raycast interactions, Marta dialogue, clock offset, irregularity report and reload/Continue worked. The browser automation used DEV positioning to reach objects; this is interaction validation, not proof of a complete walking playtest. Native Pointer Lock was rejected by the embedded browser. Automated movement/collision checks and a normal-browser playtest remain required.

Seed unit tests: 12346 produces clock_offset; 12345 does not. Two independent worlds using 12346 produce the same result.

## Rescue pass checkpoint — 2026-09-30 (NOT release approval)

1. **Bugs found:** baseline list above; additionally, camera matrix refresh occurred after ray setup; settings accepted invalid numeric values and could throw when storage was unavailable; report input accepted unknown types; corrupt NPC/counter save fields were not rejected; Continue's enabled state was stale in the pause menu; Escape did not dismiss Settings before a shift.
2. **Corrections implemented:** all listed code defects have corresponding changes. Collision uses movement substeps, circle/AABB tests and rotating door segments; closing doors reverse before hitting the player. UI/save/raycast fixes are in place. Visual/control fixes still need browser acceptance, not just code inspection.
3. **Blender assets:** modular wall, corner, baseboard, ceiling, ceiling panel, fluorescent fixture, door/frame; desk, chair, wheeled chair, cupboard, drawer cabinet, shelf, shelf board, archive box, bin; CRT, computer case, keyboard, mouse, telephone, printer; binder, folder, cup, mug, clock; cooler, extinguisher and Marta. Marta has 9,692 triangles and a separate animated head.
4. **GLB count:** one 1,261,044-byte GLB containing 31 reusable model roots. Editable .blend: 495,519 bytes. Keyboard reduced from 5,724 to 732 triangles; telephone from 1,728 to 576.
5. **Textures:** eight 512×512 WebP files: wall A/B, linoleum, carpet, wood, painted metal, paper and ceiling. Shared materials and wall variation are wired into runtime.
6. **Creation:** original Blender-generated kit, seven original procedural textures and one built-in image-generated linoleum texture, resized/compressed. Labels use original canvas typography. Offline Blender preview inspected; it is not game-rendering approval.
7. **Sound:** building ambience, speed-related footsteps with pitch variation, door, ring, terminal/button, paper, printer; four supervisor and two Marta voice clips. Archive uses a different ambient filter. Object sounds/voices use spatial audio.
8. **Origin:** procedural effects are original. Dialogue is original text synthesized with installed Windows SAPI Microsoft Maria; no downloaded recordings or CC0 claims. See CREDITS.md. Voices currently remain short mono WAV files, not compressed audio.
9. **FPS:** unmeasured after art pass. Old prototype FPS is not representative and must not be reused as a result.
10. **Draw calls:** unmeasured in the renderer after art pass. Static geometry batching is implemented; automated fixture counts 108 mesh objects, which is NOT a rendered draw-call measurement.
11. **Triangles:** automated inventory of the assembled scene: 144,698. Actual per-frame visible triangles remain to be measured.
12. **Build:** 2,732,466 bytes total at this checkpoint (about 2.73 MB decimal / 2.61 MiB). Game JS, Three core and renderer/addons are split into separate chunks; no >500 kB chunk warning.
13. **Anomaly seed:** 12346, deterministic tests and save/report checks passed.
14. **Normal seed:** 12345, deterministic tests and save/report checks passed.
15. **Playtest:** incomplete. Thirteen automated tests pass, including real GLB loading, scene construction, a full there-and-back physics route, phone/terminal/Marta/box raycasts, closed-door sprint collision, closing-door safety, wall occlusion, both report outcomes, saves and audio sample integrity. This is NOT the requested pair of full browser playthroughs. Browser reconnection was denied by tool security policy; no alternative surface was used to bypass it.
16. **Build result:** successful, no warnings on the last production build. Blender export succeeded; its sandbox warnings concerned preference/thumbnail writes, not missing model data.
17. **GitHub Actions:** no new run triggered; local rescue changes have not been committed or pushed because acceptance gates remain open. Existing deployment workflow is untouched.
18. **Published URL:** https://gustvxlz.github.io/disorder/ remains the previous published version, NOT this rescue pass. It has not been revalidated for these local changes.
19. **Remaining limitations:** two full browser runs including reload/Continue, native Pointer Lock, final lighting/texturing and UI review, listening/mix review, actual FPS/draw calls, public subpath loading, and measured 5–8 minute duration. No claim that the duration target has been reached. No new story, sectors, NPCs or anomalies were added. User folders `models/` and `musicas_jogo/` were preserved and not incorporated.

## Required release gate

In a permitted desktop browser, run seeds 12346 and 12345 without DEV teleport: NEW SHIFT → phone → terminal → corridor → Marta → Archive B → all three box confirmations → observe clock → return → report → reload → CONTINUE. Exercise corners, sprint, door closing, settings, pause and TAB. Listen to all sounds. Record duration and renderer metrics in each room. Fix failures before commits, push or deployment. Once deployed, repeat asset/console/gameplay checks under `/disorder/`.

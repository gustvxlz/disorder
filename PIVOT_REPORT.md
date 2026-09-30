# DISORDER — Vertical Slice 2 checkpoint

Registro histórico anterior ao Blender Art Pass. Estado atual e publicação: `ART_REPORT.md`.

2026-09-30. Implementation checkpoint, **not acceptance or release approval**. The author authorized proceeding from code/tests/screenshots while browser playtesting remains blocked. No full-night campaign was added.

## Requested report

1. **Bugs found:** earlier audit in AUDIT.md; new screenshot/code findings included overflowing plaque text, unfilled wall above doors, poorly legible original NPC face, FPS calculated from capped simulation time, and stale collider position when moving the opening actor on Continue. Offline character QA also exposed thigh/skin intersections with the skirt and incorrect translation axis for sitting.
2. **Corrections:** label text constrained to safe width; door headers added; new readable face/eye geometry; raw frame delta for metrics; actor movement/placement synchronizes collider; skirt weights and sitting translation corrected. Bin now blocks movement. Ended audio nodes are disconnected. Rendering and perceived quality still require browser verification.
3. **Reused systems:** player physics/Pointer Lock, interaction raycasts/occlusion, door safety, office kit, clocks, deterministic PRNG, task inspection, local saves, relative asset paths and deployment workflow.
4. **New/refactored systems:** RetroDisplay, DialogueManager, MusicManager, ShiftFlow and reusable OfficeNPC; character loading with SkeletonUtils; quantized SFX/dialogue synthesis; delayed eye anomaly. The old Marta-only implementation was replaced, not kept alongside a second NPC runtime.
5. **Individual references:** boss.png, colega_feminina.png, main_character.png, zelador.png. All four inspected; files unchanged.
6. **Generic references:** npc (1).png through npc (5).png. Each inspected as one distinct NPC; files unchanged.
7. **Blender models:** nine reference-based character adaptations, in addition to the existing 31-piece office library. Supervisor: suit/tie and swept hair; Marta: light blouse, dark skirt, tied brown hair; protagonist: anonymous/faceless suit; Antônio: receding hair, work shirt/apron/gloves. Generic variants retain cardigan, vest, skirt/bob, receding-hair shirt and short-hair shirt silhouettes. These are simplified adaptations, not exact likeness reproductions.
8. **Blend sources:** nine files under source-assets/blender/characters/important and generic; office-kit.blend retained. Reproducible generator and offline pose-preview script included.
9. **GLBs:** nine character GLBs plus one office-library GLB (ten files total). Runtime loads four character files; prepared unused characters are not placed in the world.
10. **Polycounts:** supervisor 3,788; Marta 4,604; protagonist 2,756 (no visible face); Antônio 3,856; generics 4,536 / 3,764 / 4,388 / 3,912 / 3,764. The approximate scene inventory is 152,346 triangles, not a per-frame visible count.
11. **Rigs:** compatible 15-bone skeleton with named torso/head/arm/hand/leg/foot bones and skin weights. Independent cloned skeletons in runtime.
12. **Animation clips:** idle, walk, talk, look, sit, stand, typing, work_at_desk, carry_folder, inspect_document in every character GLB. Simple procedural keyframes; no sophisticated facial rig or motion capture. Standing and seated pose sheets were rendered offline. Final animation polish is unapproved.
13. **Important NPCs active:** Marta and the opening colleague, whose appearance uses boss.png. Antônio and the faceless protagonist model are prepared but not placed or shown as new encounters.
14. **Generic NPCs active:** office_01 and office_02 in the administrative area, with short everyday dialogue and simple routines. Three additional generic assets remain unplaced; no new sectors were added.
15. **Author music inventory:** initial_menu_sound.mp3; bad_ending/A_Choked_Inheritance.mp3, A_Waltz_for_the_Porcelain_Heir.mp3, Rigid_Collapse.mp3, The_Gallery_at_Dawn.mp3, musica de encerramento/Ripped_From_the_Bone.mp3; good_ending/A_Portrait_of_Unease.mp3, Elevator_to_Nowhere.mp3, Gilded_Decay.mp3, The_Ticking_After_Hours.mp3, The_Unfinished_Waltz.mp3, musica de encerramento/The_Iron_Vow_ending_song_ending_soung.mp3. Twelve files inventoried, unchanged. This inventory is not a claim of listening/transcription.
16. **Reinterpreted author tracks:** none. New original cues were chosen; no automatic MP3-to-chiptune conversion is claimed.
17. **Music production:** deterministic Python/NumPy offline pulse and triangle synthesis, three voices, waltz meter, short envelopes and dissonant variation. No DAW installed. Mono 22.05 kHz, 8-bit PCM WAV for browser decoding.
18. **New music:** menu.wav, good.wav, bad.wav; 26.4 seconds each, 1,746,492 bytes combined. Slow fades, silence and repeat prevention implemented. Ending direction is supported by the manager API but no ending or ending-specific composition is implemented. Perceived mix/composition quality is unverified.
19. **SFX:** quantized building hum/ventilation, speed-related footsteps, door, telephone, terminal/button, paper and printer; additional per-character syllable timbres.
20. **SFX method:** seeded WebAudio buffers with noise/oscillation/envelopes and amplitude quantization. Phone/door/printer/NPC syllables are positional. No downloaded external samples. Old prototype SAPI speech was preserved in source-assets/audio/legacy-tts and removed from runtime delivery.
21. **Dialogue:** incremental text, optional speaker label, profile/pitch, spaced syllables, E reveal/advance, completion callback and cancellation. Opening colleague and NPC conversations use it. Full spoken TTS is no longer loaded.
22. **Task:** existing Archive B three-box inspection, now introduced by the waking colleague. TAB includes arrival, three boxes and return; terminal records an occurrence by sector/employee without exposing right/wrong or a score. One task only.
23. **Anomalies:** clock offset and purple eyes. Eye eligibility is seeded; activation requires previous normal observation, three inspected boxes and distance >=8 m. No sound, alert or surrounding-light change accompanies activation. The internal runDirection is saved but not displayed outside DEV.
24. **640×480:** fixed WebGL drawing buffer, pixel ratio 1, antialiasing off, 4:3 perspective camera.
25. **Upscale:** CSS pixelated/crisp-edges on the canvas within a fitted, centered 4:3 container. Black surrounding bars; HTML UI remains sharp. Fractional display scale may produce uneven pixel widths, not smooth filtering.
26. **FPS/frame time:** not measured after this pivot. Metrics calculation was corrected; targets are not proven by unit tests.
27. **Draw calls/textures/geometries:** renderer measurements pending. Test scene has 113 mesh objects; this must NOT be reported as 113 draw calls. Static batching/shared materials remain in use.
28. **Triangles:** 152,346 in the automated scene inventory. Visible per-frame total depends on renderer/frustum and remains unmeasured.
29. **Build size:** 8,468,104 bytes (8.47 MB decimal), including prepared character variants. No .blend sources, original reference images or author MP3s are copied to the build.
30. **Seeds tested in code:** 5 normal; 8 clock-only; 1 eyes-only. Legacy clock seeds 12345/12346 remain covered. These are automated tests, not completed browser runs.
31. **Playtest:** 19 automated tests pass, including real GLB parsing/skinning/clip presence, physics route, raycasts, safe doors, dialogue progression, opening gating, Continue skip, seed/eye gating, reports and save round trips. Offline model sheets inspected. Full browser flow, perceived sound, native mouse behavior and 5–10 minute duration have NOT been verified.
32. **Build:** npm run build passes without Vite warnings. git diff --check reports no whitespace errors; Git prints expected LF/CRLF normalization notices. Blender's sandbox preference/thumbnail warnings did not prevent GLB or .blend export.
33. **Commits:** none for this pivot; changes remain local until validation. Existing history was not rewritten.
34. **GitHub Actions:** no new workflow run triggered. Existing Pages workflow unchanged.
35. **Public URL:** https://gustvxlz.github.io/disorder/ — still the previous published version, NOT this local pivot.
36. **Pages test:** pending after authorized release. Vite base remains ./ and runtime asset loaders use BASE_URL; this is code validation, not a claim that public assets/gameplay were tested.
37. **Remaining limitations:** full visual/audio/interaction playtests, animation/likeness approval, measured duration, actual GPU metrics and public subpath testing. No forced waiting was added just to claim 5–10 minutes. Music remains short WAV rather than compressed tracks. No full campaign, extra endings, combat or additional sectors.

## Release blocker and next test

**BLOQUEIO:** full browser playtest and audiovisual approval.

**MOTIVO:** the previous browser tool denied local access by security policy. Code/unit/offline asset checks do not substitute for it; no alternate browser surface was used to bypass the denial.

**AÇÃO NECESSÁRIA:** test in an authorized desktop browser, or have the author run the local version and return findings. Use seeds 5, 8 and 1. Menu click enables audio → NEW SHIFT/RESTART SHIFT → E through waking dialogue → TAB → observe Marta normally → inspect three boxes → compare clock/return to Marta → return to Protocolo → record → reload/Continue. Walk the route without DEV teleport. Record elapsed minutes and DEV metrics in each room; test pause/settings during dialogue and near doors. Fix findings before commits/push/Actions/public testing.

# DISORDER - Credits

## Code

Original project code.

## 3D Models

Original DISORDER models built with Blender 5.2.2 LTS. Editable source and reproducible generator: `source-assets/blender/office-kit.blend` and `build_kit.py`.
One GLB library contains 41 reusable models; counts are recorded in `public/assets/models/manifest.json`. The legacy unrigged Marta template is retained in the library but never placed. No downloaded model packs.

AUTHOR-PROVIDED REFERENCE: nine images under `models/image/individual/` and `models/image/group/`, preserved unchanged. ORIGINAL / BLENDER: reference-derived characters, rigs and procedural animation sets. The art pass remodeled Marta (`colega_feminina.png`), the opening colleague (`boss.png`), office_01 (`npc (1).png`) and office_02 (`npc (2).png`). The story pass updates the protagonist (`main_character.png`): dark suit, light shirt, burgundy tie and deliberately blank reference-derived face; full 16-bone body and reusable clips. Four remaining adaptations are not placed.

## Textures

ORIGINAL / PROCEDURAL: eight painted-pixel surface textures at 64 or 128 px, a shared 256×256 prop atlas, and a 64×64 contact-shadow mask. Generated reproducibly by `source-assets/build_textures.py` using Pillow; exported as lossless WebP. No external photographs or author images are sampled.
The former ImageGen linoleum has been replaced; it is no longer a runtime asset.
Administrative labels are original text drawn to small canvas textures at runtime.

## Audio

ORIGINAL / PROCEDURAL: building ambience, footsteps, door, terminal/button click, paper, telephone ring, printer and entity interference, quantized for a lo-fi digital identity. Dialogue uses brief pulse, triangle or square syllables; the telepathic presence uses lower non-positional tones plus subtitles, not a complete spoken voice recording.

ORIGINAL / PROCEDURAL: short water-cooler pump/water effect, synthesized locally; no downloaded sample.

ORIGINAL / PROCEDURAL music: `menu.wav`, `good.wav`, `bad.wav`, each 26.4 seconds, generated from original note sequences in `source-assets/audio/build_music.py`. Pulse/triangle synthesis, three voices, waltz meter; bad-direction variation adds dissonance and modulation. These are NOT reinterpretations of the author's MP3s. No downloaded recordings or CC0 samples were used; no CC0 claim is made.

AUTHOR-PROVIDED: the twelve MP3s under `musicas_jogo/` were inventoried and preserved, not overwritten or moved. They are not loaded by the current game; no claim is made that their melodies were analyzed or transcribed.

LEGACY SOURCE ONLY: the six previous SAPI/Microsoft Maria dialogue WAVs were moved to `source-assets/audio/legacy-tts/`, preserving the originals created for the prototype. They no longer ship under public assets and are not used at runtime. Their generator remains for provenance, not as the active dialogue pipeline.

User-provided reference images and music files remain untouched. Models were adapted from the images; the original files themselves are not loaded or copied into runtime.

## Fictional desktop / gameplay rescue

ORIGINAL / CODE-DRAWN: SISCOR 2006 corporate interface, intranet/mail/documents, small CRT screen art, the Gato de Plantão pixel doodle and muted three-band trail. The cat grid is authored in `src/world/ScreenArt.js`; animation is CSS. It is not the Nyan Cat sprite/GIF or soundtrack, and no third-party graphic or audio was imported.

ORIGINAL / CODE: Varredura do Depósito is a small 6×4 neighborhood-count pastime with three unstable piles, implemented in `src/ui/ComputerUI.js`. It does not embed a third-party game, brand, sprite or executable. No Windows asset or external desktop is loaded. These extras are optional and do not gate the mission.

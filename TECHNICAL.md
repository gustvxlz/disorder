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

Blender was not available on the system PATH during initial setup. It is optional at this stage.

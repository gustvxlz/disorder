export function fitFourThree(width, height) {
  const scale = Math.min(width / 640, height / 480);
  return { width: Math.floor(640 * scale), height: Math.floor(480 * scale) };
}

export class RetroDisplay {
  constructor(root, renderer, camera) {
    this.root = root; this.renderer = renderer; this.camera = camera;
    renderer.setPixelRatio(1);
    renderer.setSize(640, 480, false);
    camera.aspect = 4 / 3;
    camera.updateProjectionMatrix();
    this.resize();
  }
  resize() {
    const size = fitFourThree(innerWidth, innerHeight);
    this.root.style.width = `${size.width}px`;
    this.root.style.height = `${size.height}px`;
  }
}

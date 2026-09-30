export class PerformanceManager {
  constructor(renderer, element) {
    this.renderer = renderer;
    this.element = element;
    this.frames = 0;
    this.elapsed = 0;
    this.sample = null;
  }

  update(dt, world, player) {
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed < 0.5) return;
    const fps = Math.round(this.frames / this.elapsed);
    const { render, memory } = this.renderer.info;
    this.sample={fps,calls:render.calls,triangles:render.triangles,textures:memory.textures,geometries:memory.geometries};
    if(this.element){
    this.element.querySelector('[data-metrics]').textContent =
      `${fps} FPS · ${(1000 / Math.max(fps, 1)).toFixed(1)} ms\n${render.calls} calls · ${render.triangles} tris\n${memory.textures} tex · ${memory.geometries} geom`;
    this.element.querySelector('[data-state]').textContent =
      `Seed ${world.seed} · ${world.currentTask}\nHora ${Math.floor(world.gameTime/60)%24}:${String(world.gameTime%60).padStart(2,'0')} · direction ${world.runDirection}\nAnomalias: ${Object.keys(world.anomalyStates).filter(key=>world.anomalyStates[key]).join(', ')||'nenhuma'}\nPos ${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}`;
    }
    this.frames = 0;
    this.elapsed = 0;
  }
  summary(){const s=this.sample;return s?`${s.fps} FPS · ${s.calls} draw calls · ${s.triangles} triângulos (última amostra)`:'Aguardando amostra de renderização.';}
}

export class GameTime {
  constructor(world) { this.world = world; this.elapsed = 0; }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= 30) {
      const minutes = Math.floor(this.elapsed / 30);
      this.world.gameTime += minutes;
      this.elapsed -= minutes * 30;
      return true;
    }
    return false;
  }

  format(offset = 0) {
    const total = (this.world.gameTime + offset) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}

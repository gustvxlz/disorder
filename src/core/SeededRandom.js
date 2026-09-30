export class SeededRandom {
  constructor(seed) {
    this.state = (Number(seed) >>> 0) || 0x6d2b79f5;
  }

  random() {
    let value = (this.state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) { return min + this.random() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  chance(probability) { return this.random() < probability; }
  pick(items) { return items[this.int(0, items.length - 1)]; }
}

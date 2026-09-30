const KEY = 'disorder.settings.v1';
const defaults = { sensitivity: 0.0022, volume: 0.5, music: .5, sfx: .7, quality: 'medium', resolution: 1, headBob: true };

function sanitize(value) {
  const result = { ...defaults, ...value };
  for (const [key, min, max] of [['sensitivity', .0005, .006], ['volume', 0, 1], ['music',0,1], ['sfx',0,1], ['resolution', .5, 1.5]]) {
    result[key] = Number.isFinite(result[key]) ? Math.max(min, Math.min(max, result[key])) : defaults[key];
  }
  if (!['low', 'medium', 'high'].includes(result.quality)) result.quality = defaults.quality;
  if (typeof result.headBob !== 'boolean') result.headBob = defaults.headBob;
  return result;
}

export class SettingsManager {
  constructor() {
    try { this.value = sanitize(JSON.parse(localStorage.getItem(KEY))); }
    catch { this.value = { ...defaults }; }
  }

  update(patch) {
    this.value = sanitize({ ...this.value, ...patch });
    try { localStorage.setItem(KEY, JSON.stringify(this.value)); return true; }
    catch { return false; }
  }
}

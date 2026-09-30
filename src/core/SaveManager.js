import { createWorldState } from './WorldState.js';
const KEY = 'disorder.save.v1';

export class SaveManager {
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data?.version !== 1 || !Number.isInteger(data.world?.seed)) return null;
      const world = data.world;
      if (!['pending', 'inspection', 'complete'].includes(world.currentTask)) return null;
      const base = createWorldState(world.seed);
      const restored = { ...base, ...world, flags: { ...base.flags, ...world.flags } };
      restored.flags.inspectedBoxes = [...new Set((world.flags?.inspectedBoxes || []).filter(code => ['A-14', 'A-15', 'A-16'].includes(code)))];
      for (const key of ['completedTasks', 'reportedEvents', 'inventory', 'playerChoices']) if (!Array.isArray(restored[key])) return null;
      if(!Number.isFinite(restored.runDirection)||Math.abs(restored.runDirection)>1)return null;
      if (!Number.isFinite(restored.gameTime) || restored.gameTime < 0) return null;
      for (const key of ['anomalyStates', 'npcStates']) {
        if (!restored[key] || typeof restored[key] !== 'object' || Array.isArray(restored[key])) return null;
      }
      for (const key of ['correctReports', 'falseReports', 'missedAnomalies']) {
        if (!Number.isInteger(restored[key]) || restored[key] < 0) return null;
      }
      return restored;
    } catch { return null; }
  }

  save(world) {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, world })); return true; }
    catch { return false; }
  }
}

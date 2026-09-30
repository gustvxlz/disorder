import { createWorldState } from './WorldState.js';
const KEY = 'disorder.save.v1';

export class SaveManager {
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (![1,2].includes(data?.version) || !Number.isInteger(data.world?.seed)) return null;
      const world = data.world;
      if (!['pending', 'inspection', 'complete'].includes(world.currentTask)) return null;
      const base = createWorldState(world.seed);
      const restored = { ...base, ...world, flags: { ...base.flags, ...world.flags } };
      restored.story = { ...base.story, ...world.story,
        lighting: { ...base.story.lighting, ...world.story?.lighting },
        doors: { ...world.story?.doors }, boxCounts: { ...world.story?.boxCounts } };
      if(data.version===1 && !world.story) {
        // An old in-progress run keeps its earned access and anomaly/report state.
        Object.assign(restored.story,{phase:'aftermath',printerAuthorized:true,orderPrinted:true,
          archiveUnlocked:true,routineSubmitted:true,entityHeard:true,anomaliesReleased:true});
        if(!restored.inventory.includes('archive-card'))restored.inventory=[...restored.inventory,'archive-card'];
      }
      if(!['routine','manifestation','aftermath'].includes(restored.story.phase))return null;
      for(const key of ['memoRead','printerAuthorized','orderPrinted','archiveUnlocked','routineSubmitted','entityHeard','anomaliesReleased']) {
        if(typeof restored.story[key]!=='boolean')return null;
      }
      if(!Number.isFinite(restored.story.releaseDelay)||restored.story.releaseDelay<0||restored.story.releaseDelay>60)return null;
      for(const value of Object.values(restored.story.lighting))if(typeof value!=='boolean')return null;
      for(const value of Object.values(restored.story.doors))if(!['CLOSED','OPEN','LOCKED'].includes(value))return null;
      if(restored.playerPose && (!Array.isArray(restored.playerPose)||restored.playerPose.length!==4||restored.playerPose.some(n=>!Number.isFinite(n))||Math.abs(restored.playerPose[0])>20||Math.abs(restored.playerPose[1])>25))return null;
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
    try { localStorage.setItem(KEY, JSON.stringify({ version: 2, world })); return true; }
    catch { return false; }
  }
}

import { archiveFolders, inventoryFolder } from './MissionData.js';

export class TaskManager {
  constructor(world) { this.world = world; }

  openOrder() {
    if (this.world.currentTask === 'pending') this.world.currentTask = 'inspection';
  }

  takeCard() {
    if(!this.world.inventory.includes('archive-card'))this.world.inventory.push('archive-card');
    return true;
  }
  takeFolder(code) {
    if(!this.world.story.archiveUnlocked || this.world.story.routineSubmitted || !archiveFolders.some(folder=>folder.code===code))return false;
    // One document slot: choosing another folder returns the previous one to the shelf.
    this.world.story.folderCode=code;
    if(!this.world.inventory.includes('archive-folder'))this.world.inventory.push('archive-folder');
    return true;
  }
  submitRoutine() {
    const s=this.world.story;
    if(!this.canSubmitRoutine)return false;
    s.routineSubmitted=true;s.folderCode=null;
    this.world.inventory=this.world.inventory.filter(item=>item!=='archive-folder');
    if(!this.world.completedTasks.includes('monthly_inventory'))this.world.completedTasks.push('monthly_inventory');
    return true;
  }
  get canSubmitRoutine() { return this.world.currentTask==='inspection' && this.world.inventory.includes('archive-folder') && this.world.story.folderCode===inventoryFolder && !this.world.story.routineSubmitted; }
  get canReport() { return this.world.currentTask === 'inspection' && this.world.story.routineSubmitted && this.world.story.entityHeard && this.world.story.anomaliesReleased; }

  report(type, location = null) {
    if (!this.canReport || !['conforme', 'irregularity'].includes(type)) return false;
    const anomaly = !!(this.world.anomalyStates.clock_offset||this.world.anomalyStates.purple_eyes);
    const correct = type === 'irregularity' && ((location === 'clock'&&this.world.anomalyStates.clock_offset)||(location==='marta'&&this.world.anomalyStates.purple_eyes));
    if (correct) this.world.correctReports++;
    else if (anomaly && type === 'conforme') this.world.missedAnomalies++;
    else if (!anomaly && type === 'irregularity') this.world.falseReports++;
    else if (anomaly && type === 'irregularity') this.world.missedAnomalies++;
    if (!correct && (anomaly || type === 'irregularity')) this.world.flags.phonePending = true;
    this.world.reportedEvents.push({ task: 'archive_b', type, location, time: this.world.gameTime });
    this.world.playerChoices.push({type,location});
    this.world.runDirection=Math.max(-1,Math.min(1,this.world.runDirection+(correct||(!anomaly&&type==='conforme')?.25:-.25)));
    this.world.completedTasks.push('archive_b');
    this.world.currentTask = 'complete';
    return true;
  }
}

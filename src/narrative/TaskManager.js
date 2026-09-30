const required = ['A-14', 'A-15', 'A-16'];
import { archiveRecords, printerExtension } from './MissionData.js';

export class TaskManager {
  constructor(world) { this.world = world; }

  openOrder() {
    if (this.world.currentTask === 'pending') this.world.currentTask = 'inspection';
  }

  authorizePrinter(extension) {
    if(String(extension).trim()!==printerExtension)return false;
    this.world.story.printerAuthorized=true;return true;
  }
  printOrder() {
    if(!this.world.story.printerAuthorized)return false;
    this.world.story.orderPrinted=true;return true;
  }
  takeCard() {
    if(!this.world.story.orderPrinted)return false;
    if(!this.world.inventory.includes('archive-card'))this.world.inventory.push('archive-card');
    return true;
  }
  submitRoutine() {
    const s=this.world.story;
    if(!this.canSubmitRoutine)return false;
    s.routineSubmitted=true;s.phase='manifestation';return true;
  }
  get canSubmitRoutine() { return this.world.currentTask==='inspection' && this.inspected===3 && this.world.story.orderPrinted && !this.world.story.routineSubmitted; }
  inspect(code, count) {
    if (this.world.currentTask !== 'inspection' || !required.includes(code)) return false;
    if(!this.world.story.orderPrinted || !this.world.story.archiveUnlocked || Number(count)!==archiveRecords[code])return false;
    this.world.story.boxCounts[code]=Number(count);
    if (!this.world.flags.inspectedBoxes.includes(code)) this.world.flags.inspectedBoxes.push(code);
    return true;
  }

  get inspected() { return this.world.flags.inspectedBoxes.length; }
  get canReport() { return this.world.currentTask === 'inspection' && this.inspected === required.length && this.world.story.entityHeard && this.world.story.anomaliesReleased; }

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

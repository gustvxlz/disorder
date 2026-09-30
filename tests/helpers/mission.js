import { archiveRecords } from '../../src/narrative/MissionData.js';

export function completeInventory(world,task) {
  task.openOrder();task.authorizePrinter('417');task.printOrder();task.takeCard();
  world.story.archiveUnlocked=true;
  for(const [code,count] of Object.entries(archiveRecords))task.inspect(code,count);
}
export function aftermath(world,manager) {
  Object.assign(world.story,{phase:'aftermath',entityHeard:true,anomaliesReleased:true,routineSubmitted:true});
  manager.select();
}

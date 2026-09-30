export function completeInventory(world,task) {
  task.openOrder();task.takeCard();
  world.story.archiveUnlocked=true;
  task.takeFolder('B-02');
}
export function aftermath(world,manager) {
  Object.assign(world.story,{phase:'aftermath',entityHeard:true,anomaliesReleased:true,routineSubmitted:true,normalSeconds:600,releaseDelay:30});
  manager.select();
}

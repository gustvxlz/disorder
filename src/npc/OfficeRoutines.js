// Short authored routes through existing circulation, not a navigation/AI system.
export const officeRoutines = {
  supervisor: [
    {name:'WAIT_PRINT',clip:'inspect_document',seconds:45,rotation:-2.5},
    {name:'CARRY_TO_DESK',walk:[-2.9,5.4]}, {name:'CARRY_TO_DESK',walk:[.1,5.4]},
    {name:'CARRY_TO_DESK',walk:[.1,8.65]}, {name:'SORT_COPIES',clip:'inspect_document',seconds:30,rotation:.55},
    {name:'RETURN_PRINTER',walk:[.1,5.4]}, {name:'RETURN_PRINTER',walk:[-2.9,5.4]}, {name:'RETURN_PRINTER',walk:[-2.9,9.45]},
  ],
  marta:[{name:'MONTHLY_RECORDS',clip:'typing',seconds:35,rotation:0},{name:'READ_INVENTORY',clip:'work_at_desk',seconds:12,rotation:0}],
  office_01:[{name:'TYPE_RECORDS',clip:'typing',seconds:30,rotation:Math.PI},{name:'READ_SCREEN',clip:'sit',seconds:12,rotation:Math.PI}],
  office_02:[
    {name:'SORT_FOLDERS',clip:'inspect_document',seconds:35,rotation:Math.PI},
    {name:'WALK_TO_WATER',walk:[-2.8,-11.2]}, {name:'WALK_TO_WATER',walk:[0,-11.2]},
    {name:'WALK_TO_WATER',walk:[0,-8.4]}, {name:'WALK_TO_WATER',walk:[-.45,-6]},
    {name:'DRINK',clip:'idle',seconds:7,rotation:-Math.PI/2},
    {name:'RETURN_DESK',walk:[0,-8.4]}, {name:'RETURN_DESK',walk:[0,-11.2]},
    {name:'RETURN_DESK',walk:[-2.8,-11.2]}, {name:'RETURN_DESK',walk:[-2.8,-13.1]},
  ],
};

export class OfficeRoutine {
  constructor(npc) {
    this.npc=npc;this.steps=officeRoutines[npc.id];this.tick=0;
    const saved=npc.world.game.world.story.routines[npc.id];
    this.step=saved&&saved.step<this.steps.length?saved.step:0;this.elapsed=saved?.elapsed||0;
    if(saved)npc.setPosition(...saved.position);
    this.enter();
  }
  enter() {
    const step=this.steps[this.step],npc=this.npc;
    if(npc.id==='office_01'){
      const screen=npc.world.computerScreens?.get('desk');
      if(screen)screen.material=npc.world.screens.material(step.clip==='typing'?'intranet':'cat');
    }
    if(step.walk)npc.moveTo(...step.walk);
    else {npc.destination=null;npc.play(step.clip);npc.root.rotation.y=step.rotation;}
  }
  update(dt) {
    const npc=this.npc,flow=npc.world.game.flow;
    if(flow?.observed===npc || (npc.id==='supervisor'&&!npc.world.game.world.flags.openingComplete))return;
    this.tick+=dt;if(this.tick<.1)return;
    this.elapsed+=this.tick;this.tick=0;
    const step=this.steps[this.step];
    if((step.walk&&!npc.destination)||(!step.walk&&this.elapsed>=step.seconds)){
      this.step=(this.step+1)%this.steps.length;this.elapsed=0;this.enter();
    }
    npc.world.game.world.story.routines[npc.id]={step:this.step,elapsed:Math.min(300,this.elapsed),position:[npc.root.position.x,npc.root.position.z]};
  }
  get drinking(){return this.steps[this.step].name==='DRINK';}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { ComputerUI } from '../src/ui/ComputerUI.js';
import { createWorldState } from '../src/core/WorldState.js';
import { SaveManager } from '../src/core/SaveManager.js';
import { OfficeRoutine } from '../src/npc/OfficeRoutines.js';

test('desktop exploration and original pastime never add task requirements',()=>{
  const world=createWorldState(8),before=JSON.stringify(world);
  let reports=0;
  const ui={game:{world},panelInner:{innerHTML:''},panel:{classList:{remove(){}}},mission:{terminal(){reports++;}}};
  const computer=new ComputerUI(ui);
  for(const app of ['intranet','mail','staff','phones','inventory','documents','personal','utility']){
    computer.open('desk',app);assert.ok(ui.panelInner.innerHTML.includes('SISCOR 2006'));
  }
  assert.match(computer.content('documents'),/NAO_ABRIR/);
  assert.match(computer.content('personal'),/desenho da Lúcia/);
  computer.handle('pc-cell',{dataset:{cell:'0'}});assert.equal(computer.cellLabel(0),'0');
  computer.handle('pc-cell',{dataset:{cell:'5'}});assert.equal(computer.cellLabel(5),'X');
  computer.handle('pc-reset',{});assert.equal(computer.cells.size,0);
  assert.equal(JSON.stringify(world),before);
  assert.doesNotMatch(computer.content('intranet'),/pc-report/);
  world.story.entityHeard=true;assert.match(computer.content('intranet'),/pc-report/);
  computer.handle('pc-report',{});assert.equal(reports,1);
});

test('saved office routine restores its station and rejects corrupt progression',()=>{
  const data=new Map();globalThis.localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
  const world=createWorldState(8);world.story.routines.office_02={step:5,elapsed:3.2,position:[-.45,-6]};
  const save=new SaveManager();save.save(world);const restored=save.load();
  const npc={id:'office_02',world:{game:{world:restored}},root:{rotation:{y:0}},
    setPosition(x,z){this.position=[x,z];},play(clip){this.clip=clip;},moveTo(){}};
  const routine=new OfficeRoutine(npc);
  assert.equal(routine.drinking,true);assert.deepEqual(npc.position,[-.45,-6]);assert.equal(routine.elapsed,3.2);
  world.story.routines.office_02.elapsed=NaN;save.save(world);assert.equal(save.load(),null);
});

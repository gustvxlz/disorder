import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ShiftFlow } from '../src/narrative/ShiftFlow.js';
import { DialogueManager } from '../src/narrative/DialogueManager.js';
import { TaskManager } from '../src/narrative/TaskManager.js';
import { createWorldState } from '../src/core/WorldState.js';
import { AnomalyManager } from '../src/anomalies/AnomalyManager.js';

function fixture(seed){
  const world=createWorldState(seed);
  const makeNpc=(id,name)=>({id,name,idle:'idle',root:{position:new THREE.Vector3(2.6,0,-12.4)},play(){},moveTo(){},setPosition(x,z){this.root.position.set(x,0,z);}});
  const g={world,camera:new THREE.PerspectiveCamera(68,4/3),player:{position:new THREE.Vector3(),clearInput(){},lock(){},enabled:false},
    task:new TaskManager(world),anomalies:new AnomalyManager(world,true),ui:{toast(){}},persist(){},music:{silence(){},direction(){}},
    worldManager:{supervisor:makeNpc('supervisor','Colega'),marta:makeNpc('marta','Marta')}};
  g.dialogue=new DialogueManager({classList:{add(){},remove(){}}},{dialogueTone(){}});
  g.flow=new ShiftFlow(g);return g;
}

test('opening gates movement, starts task and Continue skips completed opening',()=>{
  const g=fixture(5);g.flow.start();
  assert.equal(g.player.enabled,false);assert.equal(g.flow.busy,true);
  for(let i=0;i<10;i++)g.dialogue.advance();
  assert.equal(g.world.flags.openingComplete,true);assert.equal(g.world.currentTask,'inspection');assert.equal(g.player.enabled,true);
  g.flow=new ShiftFlow(g);g.flow.start();
  assert.equal(g.flow.busy,false);assert.equal(g.dialogue.active,false);
  assert.equal(g.worldManager.supervisor.root.position.x,2.8);
});

test('normal, clock-only and eyes-only seeds follow the intended observation gate',()=>{
  for(const [seed,clock,eyes] of [[5,false,false],[8,true,false],[1,false,true]]){
    const g=fixture(seed);g.flow.start();for(let i=0;i<10;i++)g.dialogue.advance();
    assert.equal(g.world.anomalyStates.clock_offset,clock);
    g.flow.observe(g.worldManager.marta);
    assert.equal(g.world.anomalyStates.purple_eyes,false);
    assert.equal(g.camera.fov,52);
    g.dialogue.advance();g.dialogue.advance();assert.equal(g.camera.fov,68);
    for(const code of ['A-14','A-15','A-16'])g.task.inspect(code);
    g.player.position.set(-9,0,-16);g.flow.update(.016);
    assert.equal(g.world.flags.visitedArchive,true);
    assert.equal(g.world.anomalyStates.purple_eyes,eyes);
    g.player.position.set(0,0,6);g.flow.update(.016);
    assert.equal(g.world.flags.returnedProtocol,true);
    assert.equal(g.task.report(clock||eyes?'irregularity':'conforme',clock?'clock':eyes?'marta':null),true);
    assert.equal(g.world.flags.phonePending,false);
  }
});

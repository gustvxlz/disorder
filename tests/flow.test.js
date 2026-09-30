import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ShiftFlow } from '../src/narrative/ShiftFlow.js';
import { DialogueManager } from '../src/narrative/DialogueManager.js';
import { TaskManager } from '../src/narrative/TaskManager.js';
import { createWorldState } from '../src/core/WorldState.js';
import { AnomalyManager } from '../src/anomalies/AnomalyManager.js';
import { completeInventory } from './helpers/mission.js';

function fixture(seed){
  const world=createWorldState(seed);
  const makeNpc=(id,name)=>({id,name,idle:'idle',root:{position:new THREE.Vector3(2.6,0,-12.4)},play(){},moveTo(){},setPosition(x,z){this.root.position.set(x,0,z);}});
  const g={world,camera:new THREE.PerspectiveCamera(68,4/3),player:{position:new THREE.Vector3(),clearInput(){},lock(){},enabled:false},
    task:new TaskManager(world),anomalies:new AnomalyManager(world,true),ui:{toast(){}},persist(){},music:{silence(){},direction(){}},
    audio:{printer(){},interference(){},phone(){},stopRing(){}},
    worldManager:{supervisor:makeNpc('supervisor','Colega'),marta:makeNpc('marta','Marta'),setInterference(){},refreshClocks(){},refreshFolders(){},printer:{position:new THREE.Vector3(-3.6,.79,8.5)},entityPaper:{visible:false,position:new THREE.Vector3()}}};
  g.ui.panel={classList:{add(){}}};
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
  assert.equal(g.worldManager.supervisor.root.position.x,2.6,'Continue does not teleport the colleague to a random idle point');
});

test('normal, clock-only and eyes-only seeds follow the intended observation gate',()=>{
  for(const [seed,clock,eyes] of [[5,false,false],[8,true,false],[1,false,true]]){
    const g=fixture(seed);g.flow.start();for(let i=0;i<10;i++)g.dialogue.advance();
    assert.equal(g.world.anomalyStates.clock_offset,false,'opening is normal for every seed');
    g.flow.observe(g.worldManager.marta);
    assert.equal(g.world.anomalyStates.purple_eyes,false);
    assert.equal(g.camera.fov,52);
    g.dialogue.advance();g.dialogue.advance();assert.equal(g.camera.fov,68);
    completeInventory(g.world,g.task);
    assert.equal(g.task.report('conforme'),false,'routine cannot jump to anomaly reporting');
    assert.equal(g.task.submitRoutine(),true);
    g.player.position.set(-2.25,0,8.6);g.flow.update(599);
    assert.equal(g.flow.manifestation,undefined,'no contact before ten normal simulation minutes');
    g.flow.update(1);assert.ok(g.flow.manifestation);g.flow.update(4.1);
    assert.equal(g.worldManager.entityPaper.visible,true);
    assert.equal(g.player.enabled,false);
    for(let i=0;i<8;i++)g.dialogue.advance();
    assert.equal(g.world.story.entityHeard,true);
    assert.equal(g.world.anomalyStates.clock_offset,false);
    g.player.position.set(-9,0,-16);g.flow.update(.016);
    assert.equal(g.world.story.anomaliesReleased,false);
    g.flow.update(8);
    assert.equal(g.world.anomalyStates.purple_eyes,false,'NPC escalation is delayed after the first small anomaly');
    g.flow.update(22);
    assert.equal(g.world.flags.visitedArchive,true);
    assert.equal(g.world.anomalyStates.purple_eyes,eyes);
    assert.equal(g.world.anomalyStates.clock_offset,clock);
    g.player.position.set(0,0,6);g.flow.update(.016);
    assert.equal(g.world.flags.returnedProtocol,true);
    assert.equal(g.task.report(clock||eyes?'irregularity':'conforme',clock?'clock':eyes?'marta':null),true);
    assert.equal(g.world.flags.phonePending,false);
  }
});

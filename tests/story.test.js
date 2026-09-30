import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createWorldState } from '../src/core/WorldState.js';
import { SaveManager } from '../src/core/SaveManager.js';
import { TaskManager } from '../src/narrative/TaskManager.js';
import { AudioManager } from '../src/audio/AudioManager.js';
import { Game } from '../src/core/Game.js';
import { PlayerBody } from '../src/player/PlayerBody.js';
import { completeInventory } from './helpers/mission.js';

test('folder puzzle needs access and correct month/type, never printer or box checks',()=>{
  const world=createWorldState(8),task=new TaskManager(world);task.openOrder();
  assert.equal(task.takeFolder('B-02'),false);assert.equal(task.takeCard(),true);
  assert.equal(task.takeCard(),true);task.takeCard();assert.deepEqual(world.inventory,['archive-card']);
  assert.equal(task.takeFolder('B-02'),false,'must unlock access');world.story.archiveUnlocked=true;
  assert.equal(task.takeFolder('B-01'),true);assert.equal(task.canSubmitRoutine,false,'August is not September');
  assert.equal(task.takeFolder('B-03'),true);assert.equal(task.canSubmitRoutine,false,'September maintenance is not inventory');
  assert.equal(task.takeFolder('B-02'),true);assert.equal(task.canSubmitRoutine,true);
  world.story.orderPrinted=false;world.flags.inspectedBoxes=[];
  assert.equal(task.submitRoutine(),true);assert.equal(task.submitRoutine(),false);
  assert.equal(world.story.phase,'routine','delivery is still completely normal');assert.equal(task.canReport,false);
  assert.deepEqual(world.inventory,['archive-card']);assert.deepEqual(world.completedTasks,['monthly_inventory']);
});

test('v3 story, lighting, access, pose survive and v1 progress migrates',()=>{
  const store=new Map();globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
  const world=createWorldState(1),task=new TaskManager(world);completeInventory(world,task);task.submitRoutine();
  world.story.lighting.archive=false;world.story.doors.archive='OPEN';world.playerPose=[-8,-14,.3,-.2];
  const save=new SaveManager();save.save(world);assert.deepEqual(save.load(),world);
  const old={...world};delete old.story;delete old.playerPose;
  store.set('disorder.save.v1',JSON.stringify({version:1,world:old}));
  const migrated=save.load();assert.equal(migrated.story.entityHeard,true);assert.equal(migrated.story.archiveUnlocked,true);
  world.story.releaseDelay=Infinity;save.save(world);assert.equal(save.load(),null);
});

test('pause suspends audio and freezes simulation, dialogue, clocks and mixers',async()=>{
  let suspended=0,resumed=0,updates=0;
  const audio=new AudioManager({});audio.context={suspend:async()=>suspended++,resume:async()=>resumed++};
  audio.pause();await Promise.resolve();assert.equal(suspended,1);audio.resume();await Promise.resolve();assert.equal(resumed,1);
  const hidden={contains:()=>true};globalThis.document={exitPointerLock(){}};
  const g={active:true,ui:{panel:{classList:hidden},menu:{classList:hidden},pause(){},resume(){}},
    audio,player:{enabled:true,clearInput(){},lock(){}},persist(){},flow:{busy:true}};
  Game.prototype.pause.call(g);assert.equal(g.paused,true);assert.equal(g.player.enabled,false);
  globalThis.requestAnimationFrame=()=>{};
  Object.assign(g,{clock:{getDelta:()=>.1},elapsed:3,music:{update:()=>updates++},dialogue:{update:()=>updates++},
    worldManager:{update:()=>updates++},body:{update:()=>updates++},time:{update:()=>updates++},
    performance:{update(){}},renderer:{render(){}},scene:{},camera:{}});
  Game.prototype.frame.call(g);assert.equal(updates,0);assert.equal(g.elapsed,3);
  Game.prototype.resume.call(g);assert.equal(g.paused,false);assert.equal(g.player.enabled,false,'busy cutscene still gates input');
});

test('protagonist has full body and an independently disposable FPS head mask',async()=>{
  const bytes=await readFile(new URL('../public/assets/models/characters/important/protagonist.glb',import.meta.url));
  const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const player={position:new THREE.Vector3(),yaw:0,pitch:-1,velocity:new THREE.Vector3()};
  const body=new PlayerBody(new THREE.Scene(),{character:()=>({root:asset.scene,animations:asset.animations})},player);body.update(.1);
  assert.equal(body.root.visible,true);assert.ok(body.root.getObjectByName('head'));assert.ok(body.root.getObjectByName('hand_L'));
  assert.ok(body.geometries.some(({full,fps})=>fps.index.count<(full.index?.count??full.attributes.position.count)));
  body.setExternalView(true);assert.ok(body.geometries.every(({mesh,full})=>mesh.geometry===full));body.dispose();
});

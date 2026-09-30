import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AssetLibrary } from '../src/world/AssetLibrary.js';
import { WorldManager } from '../src/world/WorldManager.js';
import { PlayerController } from '../src/player/PlayerController.js';
import { InteractionSystem } from '../src/player/InteractionSystem.js';
import { createWorldState } from '../src/core/WorldState.js';

// Real GLB, geometry, raycasts and movement; no renderer/audio/browser is simulated as verified.
test('actual office kit supports the complete walking route and interaction targets', async () => {
  const canvas = {};
  globalThis.document = {
    pointerLockElement: canvas, addEventListener() {}, removeEventListener() {},
    createElement: () => ({ getContext: () => ({ fillRect() {}, strokeRect() {}, fillText() {} }) }),
  };
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  const bytes = await readFile(new URL('../public/assets/models/office-kit.glb', import.meta.url));
  // Node has no image decoder. Stub only texture decoding; keep real geometry/skin parsing.
  const loader=new GLTFLoader().register(()=>({name:'NODE_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
  const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const assets = new AssetLibrary();
  assets.templates = new Map(gltf.scene.children.map(root => [root.name, root]));
  assets.characters=new Map();
  for(const path of ['important/marta','important/supervisor','generic/office_01','generic/office_02']) {
    const data=await readFile(new URL(`../public/assets/models/characters/${path}.glb`,import.meta.url));
    const asset=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
    assets.characters.set(path.split('/')[1],asset);
  }
  assets.floorMaterial = assets.carpetMaterial = new THREE.MeshStandardMaterial();
  const manifest=JSON.parse(await readFile(new URL('../public/assets/models/manifest.json',import.meta.url)));
  assert.equal(assets.templates.size,Object.keys(manifest).length);
  for(const name of ['extinguisher','key_board','noticeboard','archive_cart'])assert.ok(assets.templates.has(name),name);
  assert.ok(assets.clone('marta').getObjectByName('MartaHead'));
  const camera = new THREE.PerspectiveCamera(68, 1, .08, 65);
  const player = new PlayerController(camera, canvas, [], { value: { headBob: false } }, () => {});
  player.enabled = true;
  const interaction = new InteractionSystem(camera);
  const audio = { door() {} };
  const game = { world: createWorldState(12346), audio };
  const scene = new THREE.Scene();
  const world = new WorldManager(scene, player, interaction, game, {}, { clockOffset: 11 }, audio, assets);
  const walk = (x, z) => {
    player.clearInput(); player.keys.add('KeyW');
    for (let i = 0; i < 2000; i++) {
      const dx = x - player.position.x, dz = z - player.position.z;
      if (Math.hypot(dx, dz) < .07) { player.clearInput(); return; }
      player.yaw = Math.atan2(-dx, -dz);
      player.update(1 / 60);
    }
    assert.fail(`Route blocked toward ${x}, ${z} at ${player.position.x}, ${player.position.z}`);
  };
  const aim = (x, y, z, expected) => {
    camera.lookAt(x, y, z);
    assert.match(interaction.update(), expected);
  };
  walk(-.91, 6.2); aim(-.91, .88, 7.46, /Atender/);
  walk(-1.65, 6.2); aim(-1.65, 1.06, 7.72, /computador/);
  walk(-1.65,5.8);walk(3.6,5.8);aim(4.84,1.49,5.9,/Quadro de chaves/);
  walk(3.6,7.7);aim(4.87,1.7,7.7,/aviso/);
  walk(3.6,9.25);walk(2.65,9.25);aim(2.65,.7,10.35,/Gaveteiro/);
  walk(3.6,9.25);walk(3.6,5.8);walk(-2.9,5.8);walk(-2.9,8.5);aim(-3.6,1,8.5,/Impressora/);
  walk(-2.9,5.8);walk(0,4.2);
  walk(.9,4.2);aim(.9,1.18,3.09,/Interruptor/);walk(0,4.2);
  walk(0, 4.2);
  player.yaw = 0; player.keys.add('KeyW'); player.keys.add('ShiftLeft');
  for (let i = 0; i < 100; i++) player.update(.05);
  assert.ok(player.position.z >= 3.325, 'closed door blocks sprint');
  player.clearInput(); walk(0, 4.2);
  world.doors[0].interact();
  for (let i = 0; i < 80; i++) world.doors[0].update(1 / 60);
  walk(0, 1); walk(0, -11); walk(2.15, -12.85);
  aim(3.25, 1.3, -14.55, /Marta/);
  walk(-3.7, -12.5);
  world.doors[1].interact();
  assert.equal(world.doors[1].state,'LOCKED','no card cannot enter archive');
  game.world.inventory.push('archive-card');
  world.doors[1].interact();
  assert.equal(game.world.story.archiveUnlocked,true);
  for (let i = 0; i < 80; i++) world.doors[1].update(1 / 60);
  walk(-6.2, -12.5); walk(-8.9, -14.5); walk(-8.9, -15.5);
  for (const [x, code] of [[-9.37, 'B-01'], [-8.9, 'B-02'], [-8.43, 'B-03']]) {
    walk(x, -15.5); aim(x, 1.32, -16.8, new RegExp(code));
  }
  walk(-6.4,-15.1);aim(-5.18,2.1,-15.1,/relógio/);walk(-8.9,-15.5);
  walk(-8.9, -14.5); walk(-6.2, -12.5); walk(-3.7, -12.5);
  walk(0, -11); walk(0, 1); walk(0, 4.2); walk(-1.65, 6.2);
  aim(-1.65, 1.06, 7.72, /computador/);
  assert.equal(player.collides(-1.4, 7.7), true, 'desk blocks player');
  assert.equal(player.collides(3.25, -14.55), true, 'Marta/chair station blocks player');
  game.world.story.lighting.protocol=false;world.applyLighting();
  assert.ok(world.lights.protocol.every(light=>light.intensity===0));
  assert.ok(world.emitters.protocol.length>0);
  world.setInterference(.08);assert.ok(world.lights.protocol.every(light=>light.intensity>0),'entity can override a switched-off circuit');
  world.setInterference(1);assert.ok(world.lights.protocol.every(light=>light.intensity===0),'manual state restored after interference');
  game.world.story.folderCode='B-02';world.refreshFolders();
  assert.equal(world.folderMeshes.get('B-02').visible,false);
  game.world.story.folderCode=null;game.world.story.routineSubmitted=true;world.refreshFolders();
  assert.equal(world.folderMeshes.get('B-02').visible,false);
  assert.equal(world.folderMeshes.get('B-01').visible,true,'unrelated folders stay on the shelf after delivery');
  assert.equal(world.folderMeshes.get('B-03').visible,true);
  game.world.flags.openingComplete=true;game.flow={observed:null};player.position.set(4.4,0,5);
  const visited=new Map(world.npcs.map(npc=>[npc.id,new Set()]));
  for(let i=0;i<18000;i++){
    world.update(1/60);
    for(const npc of world.npcs)visited.get(npc.id).add(npc.routine.step);
  }
  for(const npc of world.npcs)assert.equal(visited.get(npc.id).size,npc.routine.steps.length,`${npc.name} completes every station/waypoint with real colliders`);
  assert.equal(world.screens.materials.size,3,'screen routines reuse shared materials');
  const renato=world.npcs.find(npc=>npc.id==='office_02');
  const before=renato.root.position.clone();game.flow.observed=renato;
  world.update(1);assert.deepEqual(renato.root.position,before,'speaking NPC stays in place');
  game.flow.observed=null;
  let meshes = 0, triangles = 0;
  scene.traverse(object => {
    if (!object.isMesh) return;
    meshes++;
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
  });
  console.log(`Scene inventory (not rendered FPS/draw calls): ${meshes} meshes, ${triangles} triangles`);
  world.dispose(); player.destroy();
});

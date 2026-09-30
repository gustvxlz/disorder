import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Door, DoorState, distanceToSegment } from '../src/world/Door.js';
import { InteractionSystem } from '../src/player/InteractionSystem.js';

test('closing door reverses before touching player and finishes when clear', () => {
  const player = { position: new THREE.Vector3(3, 0, 3), colliders: [] };
  const door = new Door({ scene: new THREE.Scene(), assets: { clone: () => new THREE.Group() }, x: 0, z: 0,
    player, audio: { door() {} }, interaction: { register() {}, registerBlocker() {} } });
  door.interact();
  for (let i = 0; i < 80; i++) door.update(1 / 60);
  assert.equal(door.state, DoorState.OPEN);
  player.position.set(.6, 0, -.1);
  door.interact();
  let reversed = false;
  for (let i = 0; i < 180; i++) {
    door.update(1 / 60);
    reversed ||= door.state === DoorState.OPENING;
    const c = door.collider;
    assert.ok(distanceToSegment(player.position.x, player.position.z, c.x1, c.z1, c.x2, c.z2) >= .325);
  }
  assert.equal(reversed, true);
  assert.equal(door.state, DoorState.OPEN);
  player.position.set(3, 0, 3);
  door.interact();
  for (let i = 0; i < 80; i++) door.update(1 / 60);
  assert.equal(door.state, DoorState.CLOSED);
});

test('raycast uses current camera transform and cannot interact through a wall', () => {
  const camera = new THREE.PerspectiveCamera(68, 1, .08, 65);
  const interaction = new InteractionSystem(camera);
  const object = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .4), new THREE.MeshBasicMaterial());
  object.position.set(2, 0, 0); object.updateMatrixWorld();
  interaction.register(object, { canInteract: () => true, getInteractionText: () => 'target' });
  camera.lookAt(2, 0, 0);
  assert.equal(interaction.update(), 'target');
  const wall = new THREE.Mesh(new THREE.BoxGeometry(.1, 3, 3), new THREE.MeshBasicMaterial());
  wall.position.x = 1; wall.updateMatrixWorld(); interaction.registerBlocker(wall);
  assert.equal(interaction.update(), '');
});

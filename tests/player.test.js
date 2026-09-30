import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PlayerController } from '../src/player/PlayerController.js';

test('sprint cannot cross a thin wall and stops on lost focus', () => {
  const canvas = {};
  globalThis.document = { pointerLockElement: canvas, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  const player = new PlayerController(new THREE.PerspectiveCamera(), canvas, [{ minX: 1, maxX: 1.08, minZ: -3, maxZ: 3 }], { value: { sensitivity: .002, headBob: false } }, () => {});
  player.position.set(0, 0, 0);
  player.yaw = -Math.PI / 2;
  player.enabled = true;
  player.keys.add('KeyW');
  player.keys.add('ShiftLeft');
  for (let i = 0; i < 100; i++) player.update(.05);
  assert.ok(player.position.x <= .72 && player.position.x > .6);
  player.onBlur();
  assert.equal(player.keys.size, 0);
  assert.equal(player.velocity.length(), 0);
  player.destroy();
});

test('diagonal movement is normalized and camera pitch is limited', () => {
  const canvas = {};
  globalThis.document = { pointerLockElement: canvas, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  const player = new PlayerController(new THREE.PerspectiveCamera(), canvas, [], { value: { sensitivity: .002, headBob: false } }, () => {});
  player.enabled = true;
  player.keys.add('KeyW'); player.keys.add('KeyD');
  for (let i = 0; i < 100; i++) player.update(.016);
  assert.ok(player.velocity.length() <= 2.551);
  player.onMouseMove({ movementX: 0, movementY: 10000 });
  assert.equal(player.pitch, -1.42);
  player.destroy();
});

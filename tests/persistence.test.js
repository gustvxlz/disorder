import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager } from '../src/core/SaveManager.js';
import { SettingsManager } from '../src/core/SettingsManager.js';
import { createWorldState } from '../src/core/WorldState.js';
import { TaskManager } from '../src/narrative/TaskManager.js';
import { AnomalyManager } from '../src/anomalies/AnomalyManager.js';
import { completeInventory, aftermath } from './helpers/mission.js';

test('both seeds finish, save and restore without losing report or delivery', () => {
  const data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  for (const seed of [12345, 12346]) {
    const world = createWorldState(seed);
    const task = new TaskManager(world);
    completeInventory(world,task);assert.equal(task.submitRoutine(),true);
    aftermath(world,new AnomalyManager(world, true));
    assert.equal(task.report('invalid'), false);
    assert.equal(task.report(seed === 12346 ? 'irregularity' : 'conforme', 'clock'), true);
    assert.equal(task.report('conforme'), false);
    const save = new SaveManager();
    assert.equal(save.save(world), true);
    assert.deepEqual(save.load(), world);
    assert.equal(world.flags.phonePending, false);
  }
});

test('corrupt saves and inaccessible storage fail safely', () => {
  const world = createWorldState(12346);
  globalThis.localStorage = { getItem: () => JSON.stringify({ version: 1, world: { ...world, npcStates: null } }) };
  assert.equal(new SaveManager().load(), null);
  globalThis.localStorage = { getItem() { throw Error('unavailable'); }, setItem() { throw Error('quota'); } };
  assert.equal(new SaveManager().load(), null);
  assert.equal(new SaveManager().save(world), false);
  const settings = new SettingsManager();
  assert.equal(settings.update({ sensitivity: Infinity, volume: 99, quality: 'invalid' }), false);
  assert.equal(settings.value.sensitivity, .0022);
  assert.equal(settings.value.volume, 1);
  assert.equal(settings.value.quality, 'medium');
});

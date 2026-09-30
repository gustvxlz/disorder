import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../src/core/SeededRandom.js';
import { createWorldState } from '../src/core/WorldState.js';
import { AnomalyManager } from '../src/anomalies/AnomalyManager.js';
import { TaskManager } from '../src/narrative/TaskManager.js';
import { completeInventory, aftermath } from './helpers/mission.js';

test('same seed repeats random sequence and anomaly', () => {
  const first = new SeededRandom(12346);
  const second = new SeededRandom(12346);
  assert.deepEqual([first.random(), first.int(1, 10), first.chance(0.5)], [second.random(), second.int(1, 10), second.chance(0.5)]);
  const a = createWorldState(12346);
  const b = createWorldState(12346);
  const am=new AnomalyManager(a, true),bm=new AnomalyManager(b, true);
  assert.equal(a.anomalyStates.clock_offset,false);
  aftermath(a,am);aftermath(b,bm);
  assert.equal(a.shiftId, b.shiftId);
  assert.equal(a.anomalyStates.clock_offset, true);
  assert.equal(b.anomalyStates.clock_offset, true);
});

test('different seed can remove anomaly', () => {
  const world = createWorldState(12345);
  aftermath(world,new AnomalyManager(world, true));
  assert.equal(world.anomalyStates.clock_offset, false);
});

test('inspection requires all boxes and report stays internal', () => {
  const world = createWorldState(12346);
  aftermath(world,new AnomalyManager(world, true));
  const task = new TaskManager(world);
  completeInventory(world,task);
  assert.equal(task.canReport, true);
  assert.equal(task.report('irregularity', 'clock'), true);
  assert.equal(world.correctReports, 1);
  assert.equal(world.currentTask, 'complete');
});

test('incorrect reports trigger the internal consequence once', () => {
  for (const [seed, type, location, counter] of [
    [12346, 'conforme', null, 'missedAnomalies'],
    [12346, 'irregularity', 'door', 'missedAnomalies'],
    [12345, 'irregularity', 'clock', 'falseReports'],
  ]) {
    const world = createWorldState(seed);
    aftermath(world,new AnomalyManager(world, true));
    const task = new TaskManager(world);
    completeInventory(world,task);
    assert.equal(task.report(type, location), true);
    assert.equal(world[counter], 1);
    assert.equal(world.flags.phonePending, true);
    assert.equal(task.report(type, location), false);
    assert.equal(world[counter], 1);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AudioManager } from '../src/audio/AudioManager.js';

test('procedural effects contain finite, non-silent samples without clipping', () => {
  const audio = new AudioManager({});
  audio.context = { createBuffer(channels, length, sampleRate) {
    const data = new Float32Array(length);
    return { duration: length / sampleRate, getChannelData: () => data };
  } };
  audio.synthesize();
  assert.equal(Object.keys(audio.buffers).length, 7);
  for (const [name, buffer] of Object.entries(audio.buffers)) {
    let peak = 0;
    for (const value of buffer.getChannelData(0)) {
      assert.ok(Number.isFinite(value), name);
      peak = Math.max(peak, Math.abs(value));
    }
    assert.ok(peak > .01 && peak <= 1, `${name}: peak=${peak}`);
  }
});

test('archived prototype voice sources remain intact', async () => {
  for (const name of ['supervisor-1', 'supervisor-2', 'supervisor-3', 'supervisor-4', 'marta-1', 'marta-2']) {
    const data = await readFile(new URL(`../source-assets/audio/legacy-tts/${name}.wav`, import.meta.url));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WAVE');
    let samples;
    for (let offset = 12; offset + 8 <= data.length;) {
      const id = data.toString('ascii', offset, offset + 4), size = data.readUInt32LE(offset + 4);
      if (id === 'fmt ') {
        assert.equal(data.readUInt16LE(offset + 8), 1);
        assert.equal(data.readUInt16LE(offset + 10), 1);
        assert.equal(data.readUInt32LE(offset + 12), 16000);
      }
      if (id === 'data') samples = data.subarray(offset + 8, offset + 8 + size);
      offset += 8 + size + (size % 2);
    }
    assert.ok(samples?.length > 32000, name);
    assert.ok(samples.some(value => value !== 0), name);
  }
});

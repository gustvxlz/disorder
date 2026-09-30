import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fitFourThree } from '../src/core/RetroDisplay.js';
import { DialogueManager } from '../src/narrative/DialogueManager.js';
import { createWorldState } from '../src/core/WorldState.js';
import { AnomalyManager } from '../src/anomalies/AnomalyManager.js';

test('retro image preserves aspect on landscape and portrait windows',()=>{
  assert.deepEqual(fitFourThree(1920,1080),{width:1440,height:1080});
  assert.deepEqual(fitFourThree(480,800),{width:480,height:360});
});
test('dialogue can finish text, advance and invoke its completion once',()=>{
  const element={classList:{add(){},remove(){}}};let sounds=0,done=0;
  const dialogue=new DialogueManager(element,{dialogueTone(){sounds++;}});
  dialogue.start(['Primeira fala.','Segunda.'],{onComplete:()=>done++});
  dialogue.update(.15);assert.equal(sounds,1);
  dialogue.advance();assert.match(element.textContent,/Primeira fala\./);
  dialogue.advance();assert.equal(dialogue.index,1);
  dialogue.advance();dialogue.advance();dialogue.advance();
  assert.equal(dialogue.active,false);assert.equal(done,1);
});
test('purple eyes cannot precede normal observation or appear beside the player',()=>{
  const world=createWorldState(12346);const anomalies=new AnomalyManager(world,true);
  world.flags.purpleEyesEligible=true;world.flags.inspectedBoxes=['A-14','A-15','A-16'];
  assert.equal(anomalies.revealEyes(20),false);
  world.flags.martaSeenNormal=true;
  assert.equal(anomalies.revealEyes(20),false,'cannot reveal before entity');
  world.story.entityHeard=true;world.story.anomaliesReleased=true;
  world.story.routineSubmitted=true;world.story.releaseDelay=30;
  assert.equal(anomalies.revealEyes(2),false);
  assert.equal(anomalies.revealEyes(20),true);
  assert.equal(anomalies.revealEyes(20),false);
});
test('all nine GLBs contain skinning and ten animation clips',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public/assets/models/characters/manifest.json',import.meta.url)));
  assert.equal(manifest.length,9);
  for(const entry of manifest){
    const bytes=await readFile(new URL(`../public/assets/models/characters/${entry.category}/${entry.id}.glb`,import.meta.url));
    const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
    assert.equal(gltf.skins.length,1,entry.id);
    assert.equal(gltf.skins[0].joints.length,entry.bones,entry.id);
    if(['protagonist','marta','supervisor','office_01','office_02'].includes(entry.id)) {
      assert.equal(entry.bones,16,entry.id);
      assert.ok(gltf.nodes.some(node=>node.name==='neck'),entry.id);
    }
    assert.deepEqual(gltf.animations.map(a=>a.name),entry.animations,entry.id);
    assert.ok(entry.triangles>=(entry.id==='protagonist'?2500:3000)&&entry.triangles<=12000,entry.id);
  }
});

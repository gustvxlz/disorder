import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

test('painted textures are lossless low-resolution WebP, with a 256px atlas',async()=>{
  for(const name of ['wall-a','wall-b','wood','painted-metal','paper','carpet','ceiling','linoleum','props-atlas','contact-shadow']) {
    const bytes=await readFile(new URL(`../public/assets/textures/${name}.webp`,import.meta.url));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(bytes.toString('ascii',12,16),'VP8L');
    const dimensions=bytes.readUInt32LE(21),width=(dimensions&0x3fff)+1,height=((dimensions>>>14)&0x3fff)+1;
    assert.ok([64,128,256].includes(width),name);assert.equal(width,height,name);
    if(name==='props-atlas')assert.equal(width,256);
  }
});

test('active art characters keep human scale and non-static talk/walk clips',async()=>{
  for(const path of ['important/marta','important/supervisor','generic/office_01','generic/office_02']) {
    const bytes=await readFile(new URL(`../public/assets/models/characters/${path}.glb`,import.meta.url));
    const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
    asset.scene.updateMatrixWorld(true);
    const height=new THREE.Box3().setFromObject(asset.scene).getSize(new THREE.Vector3()).y;
    assert.ok(height>1.60&&height<1.90,`${path}: ${height}`);
    const names=[];asset.scene.traverse(object=>{if(object.isMesh)names.push(object.material.name.split('.')[0]);});
    assert.ok(names.includes('iris'));assert.ok(names.includes('badge'));
    const mixer=new THREE.AnimationMixer(asset.scene),head=asset.scene.getObjectByName('head');
    mixer.clipAction(asset.animations.find(clip=>clip.name==='talk')).play();
    mixer.setTime(0);const initial=head.quaternion.clone();mixer.setTime(.45);
    assert.ok(initial.angleTo(head.quaternion)>.04,path);
    mixer.stopAllAction();mixer.clipAction(asset.animations.find(clip=>clip.name==='walk')).play();
    const leg=asset.scene.getObjectByName('thigh_L');mixer.setTime(0);const rest=leg.quaternion.clone();mixer.setTime(.45);
    assert.ok(rest.angleTo(leg.quaternion)>.15,path);
    mixer.stopAllAction();mixer.uncacheRoot(asset.scene);
  }
});

import * as THREE from 'three';

// One full rig/asset; the FPS copy of its index omits the head to prevent clipping.
export class PlayerBody {
  constructor(scene, assets, player) {
    this.player=player;
    const asset=assets.character('protagonist');
    this.root=asset.root;scene.add(this.root);
    this.mixer=new THREE.AnimationMixer(this.root);
    this.actions=new Map(asset.animations.map(clip=>[clip.name,this.mixer.clipAction(clip)]));
    this.geometries=[];this.tick=0;
    this.root.traverse(mesh=>{
      if(!mesh.isSkinnedMesh)return;
      const geometry=mesh.geometry.clone(), skin=geometry.attributes.skinIndex;
      const weights=geometry.attributes.skinWeight, indices=[];
      const original=geometry.index?.array??Array.from({length:skin.count},(_,i)=>i);
      const headVertex=i=>{
        let bone=0,weight=-1;
        for(let j=0;j<4;j++)if(weights.array[i*4+j]>weight){weight=weights.array[i*4+j];bone=skin.array[i*4+j];}
        return ['head','neck'].includes(mesh.skeleton.bones[bone]?.name);
      };
      for(let i=0;i<original.length;i+=3)if(![original[i],original[i+1],original[i+2]].some(headVertex))indices.push(original[i],original[i+1],original[i+2]);
      geometry.setIndex(indices);this.geometries.push({mesh,full:mesh.geometry,fps:geometry});mesh.geometry=geometry;
    });
    this.play('idle');
  }
  play(name) {
    if(this.current===name)return;
    const next=this.actions.get(name);if(!next)return;
    this.actions.get(this.current)?.fadeOut(.2);next.reset().fadeIn(.2).play();this.current=name;
  }
  setExternalView(external) { for(const {mesh,full,fps} of this.geometries)mesh.geometry=external?full:fps; }
  update(dt, cinematic=false) {
    const p=this.player;
    this.root.position.set(p.position.x+Math.sin(p.yaw)*.16,p.position.y,p.position.z+Math.cos(p.yaw)*.16);
    this.root.rotation.y=p.yaw+Math.PI;
    this.root.visible=cinematic||p.pitch<-.45;
    this.play(cinematic?'look':p.velocity.lengthSq()>.15?'walk':'idle');
    this.tick+=dt;if(this.tick>=1/24){this.mixer.update(this.tick);this.tick=0;}
  }
  dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);for(const {fps,mesh} of this.geometries){fps.dispose();mesh.skeleton.dispose();}this.root.removeFromParent();}
}

import * as THREE from 'three';

export class OfficeNPC {
  constructor(world,{id,model,name='',x,z,rotation=0,role='generic',idle='idle'}) {
    Object.assign(this,{world,id,name,role,idle});
    const asset=world.assets.character(model);
    this.root=asset.root;this.root.position.set(x,0,z);this.root.rotation.y=rotation;
    world.scene.add(this.root);
    this.mixer=new THREE.AnimationMixer(this.root);
    this.head=this.root.getObjectByName('head');this.lookYaw=0;
    this.actions=new Map(asset.animations.map(clip=>[clip.name,this.mixer.clipAction(clip)]));
    this.eyes=[];
    this.root.traverse(object=>{
      if(!object.isMesh)return;
      if(object.material.name.split('.')[0]==='iris') {
        object.material=object.material.clone();object.material.emissive.set(0x161915);object.material.emissiveIntensity=.35;
        this.eyes.push(object.material);
      }
    });
    this.collider={minX:x-.25,maxX:x+.25,minZ:z-.23,maxZ:z+.23};world.colliders.push(this.collider);
    world.interaction.register(this.root,this);this.play(idle);this.tick=0;
  }
  canInteract(){return !this.world.game.flow?.busy;}
  getInteractionText(){return this.role==='important'?`[E] Observar ${this.name}`:'[E] Falar';}
  interact(){this.world.game.flow.observe(this);}
  play(name){
    if(this.current===name)return;
    const next=this.actions.get(name);if(!next)return;
    this.actions.get(this.current)?.fadeOut(.25);next.reset().fadeIn(.25).play();this.current=name;
    this.world.game.world.npcStates[this.id]=name;
  }
  moveTo(x,z){this.destination=new THREE.Vector3(x,0,z);this.play('walk');}
  setPosition(x,z){this.root.position.set(x,0,z);Object.assign(this.collider,{minX:x-.25,maxX:x+.25,minZ:z-.23,maxZ:z+.23});}
  update(dt,player) {
    if(this.destination){
      const dx=this.destination.x-this.root.position.x,dz=this.destination.z-this.root.position.z;
      const distance=Math.hypot(dx,dz);
      if(distance<.04){this.destination=null;this.play(this.idle);}
      else {
        const step=Math.min(distance,dt*.75),nx=this.root.position.x+dx/distance*step,nz=this.root.position.z+dz/distance*step;
        if(Math.hypot(nx-player.position.x,nz-player.position.z)>.65){
          this.root.rotation.y=Math.atan2(dx,dz);this.root.position.set(nx,0,nz);
          Object.assign(this.collider,{minX:nx-.25,maxX:nx+.25,minZ:nz-.23,maxZ:nz+.23});
        }
      }
    }
    this.tick+=dt;
    if(this.tick<1/24)return;
    if(this.root.position.distanceToSquared(player.position)<400)this.mixer.update(this.tick);
    if(this.head&&this.root.position.distanceToSquared(player.position)<400) {
      const dx=player.position.x-this.root.position.x,dz=player.position.z-this.root.position.z;
      const angle=Math.atan2(Math.sin(Math.atan2(dx,dz)-this.root.rotation.y),Math.cos(Math.atan2(dx,dz)-this.root.rotation.y));
      const target=Math.hypot(dx,dz)<2.8&&Math.abs(angle)<.9?THREE.MathUtils.clamp(angle,-.3,.3):0;
      this.lookYaw=THREE.MathUtils.lerp(this.lookYaw,target,1-Math.exp(-this.tick*4));
      this.head.rotateY(this.lookYaw);
    }
    this.tick=0;
    if(this.id==='marta')for(const material of this.eyes)material.color.set(this.world.game.world.anomalyStates.purple_eyes?0x925bb5:0x657554);
  }
  dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.root.traverse(object=>object.skeleton?.dispose());for(const material of this.eyes)material.dispose();}
}

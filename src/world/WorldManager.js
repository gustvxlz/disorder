import * as THREE from 'three';
import { Door } from './Door.js';
import { AnalogClock } from './AnalogClock.js';
import { RoomBuilder } from './RoomBuilder.js';
import { Labels } from './Labels.js';
import { batchStatic } from './AssetLibrary.js';
import { furnishProtocol, furnishCorridor, furnishArchive } from './OfficeRooms.js';
import { OfficeNPC } from '../npc/OfficeNPC.js';

export class WorldManager {
  constructor(scene,player,interaction,game,time,anomalies,audio,assets) {
    Object.assign(this,{scene,player,interaction,game,time,anomalies,audio,assets});
    this.colliders=player.colliders;this.doors=[];this.clocks=[];
    this.staticRoot=new THREE.Group();scene.add(this.staticRoot);
    this.labels=new Labels();this.phonePosition=new THREE.Vector3();
    this.detailMaterial=new THREE.MeshStandardMaterial({color:0xa6a18a,roughness:.8});
    this.build();
  }
  place(name,x,y,z,rotation=0,isStatic=true) {
    const model=this.assets.clone(name,name==='wall'&&Math.round(x+z)%2===0);model.position.set(x,y,z);model.rotation.y=rotation;
    if(['desk','cabinet','filing_cabinet','shelf'].includes(name))this.interaction.registerBlocker(model);
    (isStatic?this.staticRoot:this.scene).add(model);
    if(isStatic&&y===0&&['desk','chair','office_chair','cabinet','filing_cabinet','archive_cart','bin'].includes(name)) {
      this.contactShadow(x,z,name==='desk'?1.7:.7,name==='desk'?.95:.7,rotation);
    }
    return model;
  }
  contactShadow(x,z,width,depth,rotation=0,parent=this.staticRoot) {
    if(!this.assets.shadowMaterial)return;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),this.assets.shadowMaterial);
    mesh.position.set(x,.009,z);mesh.rotation.set(-Math.PI/2,0,-rotation);
    mesh.userData.ownedGeometry=true;parent.add(mesh);
  }
  solid(x,z,width,depth) { this.colliders.push({minX:x-width/2,maxX:x+width/2,minZ:z-depth/2,maxZ:z+depth/2}); }
  label(text,x,y,z,w,h,rotation=0,dark=false) {const mesh=this.labels.make(text,x,y,z,w,h,rotation,dark);this.staticRoot.add(mesh);return mesh;}
  detail(x,y,z,w,h,d) {const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.detailMaterial);mesh.position.set(x,y,z);this.staticRoot.add(mesh);return mesh;}
  door(x,z,rotation=0,locked=false) {
    const centerX=x+Math.cos(rotation)*.49,centerZ=z-Math.sin(rotation)*.49;
    this.place('door_frame',centerX,0,centerZ,rotation);
    if (!locked) {
      const header=this.place('wall',centerX,2.12,centerZ,rotation);
      header.scale.set(.58,.68/2.8,1);
      header.traverse(object=>{if(object.isMesh&&object.material.name==='Institutional')object.visible=false;});
      this.interaction.registerBlocker(header);
    }
    this.doors.push(new Door({scene:this.scene,assets:this.assets,x,z,rotation,locked,player:this.player,audio:this.audio,interaction:this.interaction}));
  }
  light(x,z,intensity,color=0xd4dfca) {
    this.place('fluorescent',x,2.66,z);
    const light=new THREE.PointLight(color,intensity,10,2);light.position.set(x,2.5,z);this.scene.add(light);
  }
  build() {
    this.scene.background=new THREE.Color(0x18211d);
    this.scene.fog=new THREE.Fog(0x28322c,17,44);
    this.scene.add(new THREE.HemisphereLight(0xc4ccaf,0x34372e,.62));
    const r=new RoomBuilder(this);
    r.floor(-5,5,3,11,true);
    r.wall(-5,7,8,Math.PI/2);r.wall(5,7,8,-Math.PI/2);r.wall(0,11,10,Math.PI);
    r.wall(-2.79,3,4.42);r.wall(2.79,3,4.42);
    // A real 1.16 m opening, consistently shared by both adjacent rooms.
    this.door(-.49,3);
    r.floor(-1.5,1.5,-10,3);
    r.wall(-1.5,-3.5,13,Math.PI/2);r.wall(1.5,-3.5,13,-Math.PI/2);
    r.floor(-5,5,-15,-10);
    r.wall(0,-15,10);r.wall(-3.25,-10,3.5,Math.PI);r.wall(3.25,-10,3.5,Math.PI);
    r.wall(-5,-14.04,1.92,Math.PI/2);r.wall(-5,-10.96,1.92,Math.PI/2);
    r.wall(5,-12.5,5,-Math.PI/2);
    this.door(-5,-12.01,Math.PI/2);
    this.door(4.86,-12.99,-Math.PI/2,true);
    r.floor(-14,-5,-18,-10);
    r.wall(-14,-14,8,Math.PI/2);r.wall(-9.5,-18,9);r.wall(-9.5,-10,9,Math.PI);
    // East archive boundary is solid outside the shared doorway.
    r.wall(-5,-16.5,3,-Math.PI/2);
    for(const z of [0,-4])this.door(-1.39,z+.49,Math.PI/2,true);
    this.label('SALA 02\nACESSO RESTRITO',-1.38,2.3,0,.8,.26,Math.PI/2);
    this.label('ADMINISTRAÇÃO',-1.38,2.3,-4,.9,.24,Math.PI/2);
    this.light(-1,7.8,16,0xe6e4ca);
    this.light(2,9.1,7,0xe4dbbe);
    this.light(0,1,9);
    this.light(0,-6.5,7,0xc3d8c5);
    this.light(.5,-12.2,12,0xd4dbc7);
    this.light(-10,-14.3,7,0xc0d1c2);
    // Additional visible fixtures are emissive only.
    this.place('fluorescent_off',0,2.66,-2.5);
    this.place('fluorescent',0,2.66,-9);
    this.place('fluorescent_off',-7,2.66,-16);
    furnishProtocol(this);furnishCorridor(this);furnishArchive(this);
    this.clocks.push(new AnalogClock(this.scene,this.assets,0,2.06,10.88,Math.PI,()=>0));
    this.clocks.push(new AnalogClock(this.scene,this.assets,-10.65,2.18,-17.87,0,()=>this.anomalies.clockOffset));
    this.marta=new OfficeNPC(this,{id:'marta',model:'marta',name:'Marta',x:2.6,z:-12.4,rotation:-Math.PI/2,role:'important',idle:'inspect_document'});
    this.supervisor=new OfficeNPC(this,{id:'supervisor',model:'supervisor',name:'Colega',x:-.15,z:6.6,rotation:-Math.PI/2,role:'important'});
    this.npcs=[this.marta,this.supervisor,
      new OfficeNPC(this,{id:'office_01',model:'office_01',x:-3.5,z:-14.1,rotation:.4,idle:'carry_folder'}),
      new OfficeNPC(this,{id:'office_02',model:'office_02',x:3.9,z:-11.3,rotation:-Math.PI*.6,idle:'look'}),
    ];
    for(const npc of this.npcs)this.contactShadow(0,0,.62,.46,0,npc.root);
    this.scene.updateMatrixWorld(true);
    batchStatic(this.staticRoot,this.scene);
    this.refreshClocks();
  }
  refreshClocks() {for(const clock of this.clocks)clock.update(this.game.world.gameTime);}
  update(dt) {for(const door of this.doors)door.update(dt);for(const npc of this.npcs)npc.update(dt,this.player);}
  dispose() {
    this.labels.dispose();this.detailMaterial.dispose();
    for(const npc of this.npcs)npc.dispose();
    this.scene.traverse(object=>{if(object.userData.ownedGeometry)object.geometry.dispose();});
    for(const clock of this.clocks)for(const pivot of [clock.hour,clock.minute])pivot.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});
  }
}

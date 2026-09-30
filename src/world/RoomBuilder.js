import * as THREE from 'three';

export class RoomBuilder {
  constructor(world) { this.world = world; }

  floor(x1,x2,z1,z2,carpet=false) {
    const geometry = new THREE.PlaneGeometry(x2-x1,z2-z1);
    const uv = geometry.attributes.uv;
    for (let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*(x2-x1)/2,uv.getY(i)*(z2-z1)/2);
    const mesh = new THREE.Mesh(geometry, carpet ? this.world.assets.carpetMaterial : this.world.assets.floorMaterial);
    mesh.rotation.x = -Math.PI/2;
    mesh.position.set((x1+x2)/2,0,(z1+z2)/2);
    this.world.staticRoot.add(mesh);
    for(let x=x1+.5;x<x2;x+=1) for(let z=z1+.5;z<z2;z+=1) this.world.place('ceiling_panel',x,2.78,z,0);
  }

  wall(x,z,width,rotation=0) {
    const mesh=this.world.place('wall',x,0,z,rotation);
    mesh.scale.x=width/2;
    const alongX = Math.abs(Math.cos(rotation)) > .5;
    this.world.solid(x,z,alongX?width:.17,alongX?.17:width);
    this.world.interaction.registerBlocker(mesh);
    const trim=this.world.place('baseboard',x,0,z,rotation);
    trim.scale.x=width/2;
    const cove=this.world.place('ceiling_trim',x,2.72,z,rotation);
    cove.scale.x=width/2;
  }
}

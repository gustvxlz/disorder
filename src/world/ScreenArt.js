import * as THREE from 'three';

// Original office doodle: no downloaded sprite, GIF or soundtrack.
export const officeCat = ['100001000','110011000','133331000','132231000','133331001','011110011','011111110','001001000'];
export function drawOfficeCat(ctx,x,y,size=3) {
  const colors=['transparent','#cdb68c','#26372b','#947c62'];
  officeCat.forEach((row,iy)=>[...row].forEach((cell,ix)=>{
    if(cell==='0')return;ctx.fillStyle=colors[Number(cell)];ctx.fillRect(x+ix*size,y+iy*size,size,size);
  }));
}
export class ScreenArt {
  constructor(){this.materials=new Map();this.geometry=new THREE.PlaneGeometry(.34,.24);}
  material(kind) {
    if(this.materials.has(kind))return this.materials.get(kind);
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#315961';ctx.fillRect(0,0,128,96);
    ctx.fillStyle='#d5d7cc';ctx.fillRect(5,7,118,78);ctx.fillStyle='#223b4e';ctx.fillRect(5,7,118,12);
    ctx.fillStyle='#fff';ctx.font='8px monospace';ctx.fillText(kind==='cat'?'GATO DE PLANTAO':'EXPEDIENTE / 2006',9,16);
    if(kind==='cat'){
      ['#708c65','#baad72','#8b7395'].forEach((color,i)=>{ctx.fillStyle=color;ctx.fillRect(14,39+i*5,57,5);});
      drawOfficeCat(ctx,68,30,4);
    }else{
      ctx.fillStyle='#334235';ctx.fillText(kind==='marta'?'FECHAMENTO DO MES':'INTRANET INTERNA',10,31);
      for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#c1c9bb':'#e0e2d8';ctx.fillRect(10,38+i*8,106,7);}
      ctx.fillStyle='#506d54';ctx.fillRect(10,38,48,6);
    }
    ctx.fillStyle='#b3bbae';ctx.fillRect(0,87,128,9);ctx.fillStyle='#28382f';ctx.fillText('INICIO',4,94);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;
    const material=new THREE.MeshBasicMaterial({map});this.materials.set(kind,material);return material;
  }
  add(parent,kind,x,y,z,rotation) {
    const mesh=new THREE.Mesh(this.geometry,this.material(kind));mesh.position.set(x,y,z);mesh.rotation.y=rotation;parent.add(mesh);return mesh;
  }
  dispose(){this.geometry.dispose();for(const material of this.materials.values()){material.map.dispose();material.dispose();}}
}

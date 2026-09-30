import * as THREE from 'three';

export class Labels {
  constructor() { this.cache=new Map(); }
  make(text,x,y,z,width,height,rotation=0,dark=false) {
    const key=`${text}|${dark}`;
    if(!this.cache.has(key)) {
      const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=192;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle=dark?'#263a32':'#d0c7ad';ctx.fillRect(0,0,512,192);
      ctx.strokeStyle=dark?'#6b8775':'#7f806e';ctx.lineWidth=5;ctx.strokeRect(8,8,496,176);
      ctx.fillStyle=dark?'#b9cbb8':'#30392e';ctx.textAlign='center';ctx.textBaseline='middle';
      const lines=text.split('\n');
      lines.forEach((line,i)=>{ctx.font=`${i===0?'bold ':''}${lines.length>1?30: text.length>16?32:50}px monospace`;ctx.fillText(line,256,96+(i-(lines.length-1)/2)*42,458);});
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      this.cache.set(key,new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.FrontSide}));
    }
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),this.cache.get(key));
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;
    return mesh;
  }
  dispose() { for(const material of this.cache.values()){material.map.dispose();material.dispose();} }
}

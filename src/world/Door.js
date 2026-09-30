import * as THREE from 'three';

export const DoorState = Object.freeze({ CLOSED:'CLOSED', OPENING:'OPENING', OPEN:'OPEN', CLOSING:'CLOSING', LOCKED:'LOCKED' });
export function distanceToSegment(x,z,x1,z1,x2,z2) {
  const dx=x2-x1, dz=z2-z1;
  const t=Math.max(0,Math.min(1,((x-x1)*dx+(z-z1)*dz)/(dx*dx+dz*dz || 1)));
  return Math.hypot(x-x1-t*dx,z-z1-t*dz);
}

export class Door {
  constructor({scene,assets,x,z,rotation=0,locked=false,player,audio,interaction,access=null,onChange=()=>{}}) {
    this.access=access;this.onChange=onChange;
    this.state=locked?DoorState.LOCKED:DoorState.CLOSED;
    this.player=player; this.audio=audio; this.progress=0;
    this.rotation=rotation;
    this.mesh=assets.clone('door');
    this.mesh.position.set(x,0,z);
    this.mesh.rotation.y=rotation;
    scene.add(this.mesh);
    this.collider={segment:true,x1:x,z1:z,x2:0,z2:0,radius:.045};
    player.colliders.push(this.collider);
    interaction.register(this.mesh,this);
    interaction.registerBlocker(this.mesh);
    this.apply(0);
  }
  canInteract() { return true; }
  getInteractionText() { return this.state===DoorState.LOCKED?(this.access?'[E] Usar cartão B':'[E] Acesso restrito'):`[E] ${this.state===DoorState.OPEN||this.state===DoorState.OPENING?'Fechar':'Abrir'}`; }
  interact() {
    if(this.state===DoorState.LOCKED) {
      if(!this.access?.()){this.audio.door(this.mesh.position,true);return;}
      this.state=DoorState.CLOSED;
    }
    this.state=this.state===DoorState.OPEN||this.state===DoorState.OPENING?DoorState.CLOSING:DoorState.OPENING;
    this.audio.door(this.mesh.position);
    this.onChange(this.state===DoorState.OPENING?'OPEN':'CLOSED');
  }
  apply(progress) {
    const eased=progress*progress*(3-2*progress);
    const angle=this.rotation+eased*Math.PI*.5;
    this.mesh.rotation.y=angle;
    this.collider.x2=this.collider.x1+Math.cos(angle)*.98;
    this.collider.z2=this.collider.z1-Math.sin(angle)*.98;
    this.mesh.updateMatrixWorld(true);
  }
  update(dt) {
    if(![DoorState.OPENING,DoorState.CLOSING].includes(this.state)) return;
    const closing=this.state===DoorState.CLOSING;
    const next=THREE.MathUtils.clamp(this.progress+(closing?-1:1)*dt/1.05,0,1);
    const angle=this.rotation+next*next*(3-2*next)*Math.PI*.5;
    const c=this.collider,p=this.player.position;
    if(distanceToSegment(p.x,p.z,c.x1,c.z1,c.x1+Math.cos(angle)*.98,c.z1-Math.sin(angle)*.98)<.34) {
      if(closing) this.state=DoorState.OPENING;
      return;
    }
    this.progress=next; this.apply(next);
    if(next===0) this.state=DoorState.CLOSED;
    if(next===1) this.state=DoorState.OPEN;
  }
}

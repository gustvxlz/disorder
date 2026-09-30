import * as THREE from 'three';

export class AnalogClock {
  constructor(scene, assets, x, y, z, rotation, offset) {
    this.root = assets.clone('clock');
    this.root.position.set(x, y, z);
    this.root.rotation.y = rotation;
    this.offset = offset;
    const material = new THREE.MeshStandardMaterial({ color: 0x202620, roughness: .8 });
    this.hour = new THREE.Group();
    this.minute = new THREE.Group();
    for (const [pivot, length, width] of [[this.hour,.105,.018],[this.minute,.157,.011]]) {
      const hand = new THREE.Mesh(new THREE.BoxGeometry(width,length,.006), material);
      hand.position.set(0,length/2,.048);
      pivot.add(hand); this.root.add(pivot);
    }
    scene.add(this.root);
  }
  update(minutes) {
    const time = minutes + this.offset();
    this.hour.rotation.z = -(time % 720) / 720 * Math.PI * 2;
    this.minute.rotation.z = -(time % 60) / 60 * Math.PI * 2;
  }
}

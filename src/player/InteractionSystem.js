import * as THREE from 'three';

export class InteractionSystem {
  constructor(camera) {
    this.camera = camera;
    this.targets = [];
    this.objects = [];
    this.blockers = [];
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 2.25;
    this.center = new THREE.Vector2(0, 0);
    this.current = null;
  }

  register(object, behavior) { this.targets.push({ object, behavior }); this.objects.push(object); }
  registerBlocker(object) { this.blockers.push(object); }

  update() {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.center, this.camera);
    const hits = this.raycaster.intersectObjects(this.objects, true);
    const obstruction = this.raycaster.intersectObjects(this.blockers, true)[0];
    this.current = null;
    for (const hit of hits) {
      const target = this.targets.find(({ object }) => object === hit.object || object.getObjectById(hit.object.id));
      if (target?.behavior.canInteract()) {
        if (obstruction && obstruction.distance + 0.03 < hit.distance && !target.object.getObjectById(obstruction.object.id)) break;
        this.current = target.behavior;
        break;
      }
    }
    return this.current?.getInteractionText() || '';
  }

  interact() { this.update(); this.current?.interact(); }
}

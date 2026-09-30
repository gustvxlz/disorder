import { SeededRandom } from '../core/SeededRandom.js';
import { anomalyRegistry } from './AnomalyRegistry.js';

export class AnomalyManager {
  constructor(world, fresh = false) {
    this.world = world;
    if (fresh) {
      this.world.anomalyStates = { clock_offset: false, purple_eyes: false };
      this.world.flags.purpleEyesEligible = false;
    }
  }

  select() {
    const random = new SeededRandom(this.world.seed);
    for (const definition of anomalyRegistry) {
      const active = definition.conditions(this.world) && random.chance(0.5);
      (active ? definition.activate : definition.deactivate)(this.world);
    }
  }

  force(active) {
    const definition = anomalyRegistry[0];
    (active ? definition.activate : definition.deactivate)(this.world);
  }

  get clockOffset() { return this.world.anomalyStates.clock_offset ? 11 : 0; }
  revealEyes(distance) {
    const w=this.world;
    if(!w.story.entityHeard || !w.story.anomaliesReleased)return false;
    if(w.anomalyStates.purple_eyes||!w.flags.purpleEyesEligible||!w.flags.martaSeenNormal||w.flags.inspectedBoxes.length!==3||distance<8)return false;
    w.anomalyStates.purple_eyes=true;
    return true;
  }
}

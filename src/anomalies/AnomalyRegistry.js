export const anomalyRegistry = [
  // Clock remains first so existing deterministic clock seeds are stable.
  {
    id: 'clock_offset',
    sector: 'archive_b',
    weight: 1,
    conditions: () => true,
    activate(world) { world.anomalyStates.clock_offset = true; },
    deactivate(world) { world.anomalyStates.clock_offset = false; },
  },
  {
    id:'purple_eyes',sector:'administration',weight:1,conditions:()=>true,
    activate(world){world.flags.purpleEyesEligible=true;world.anomalyStates.purple_eyes=false;},
    deactivate(world){world.flags.purpleEyesEligible=false;world.anomalyStates.purple_eyes=false;},
  },
];

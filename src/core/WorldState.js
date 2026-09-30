import { SeededRandom } from './SeededRandom.js';

export function createWorldState(seed) {
  const normalized = Number(seed) >>> 0;
  const random = new SeededRandom(normalized);
  return {
    seed: normalized,
    shiftId: `D-${String(random.int(0, 9999)).padStart(4, '0')}-${String(random.int(0, 9999)).padStart(4, '0')}`,
    gameTime: 107,
    currentTask: 'pending',
    completedTasks: [],
    anomalyStates: {},
    reportedEvents: [],
    inventory: [],
    playerChoices: [],
    runDirection: 0,
    npcStates: { marta: 'WORK' },
    flags: { inspectedBoxes: [], openingComplete: false, martaSeenNormal: false, purpleEyesEligible: false, visitedArchive: false, returnedProtocol: false, introCallHeard: false, phonePending: false, phoneAnswered: false, phoneRang: false },
    correctReports: 0,
    falseReports: 0,
    missedAnomalies: 0,
  };
}

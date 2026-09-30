export const archiveRecords = Object.freeze({ 'A-14': 12, 'A-15': 8, 'A-16': 15 });
export const printerExtension = '417';
export const buildingAreas = Object.freeze([
  ['Protocolo / corredor / administração', 'Livre'],
  ['Arquivo B', 'Cartão B · liberado nesta missão'],
  ['Sala 02 / administração lateral / ala leste', 'Bloqueadas · etapas futuras'],
]);

export function createStoryState() {
  return { phase: 'routine', memoRead: false, printerAuthorized: false, orderPrinted: false,
    archiveUnlocked: false, routineSubmitted: false, entityHeard: false,
    anomaliesReleased: false, releaseDelay: 0, boxCounts: {},
    lighting: { protocol: true, corridor: true, archive: true }, doors: {} };
}

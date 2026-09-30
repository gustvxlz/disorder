export const archiveRecords = Object.freeze({ 'A-14': 12, 'A-15': 8, 'A-16': 15 });
export const NORMAL_SECONDS = 10 * 60;
export const archiveFolders = Object.freeze([
  { code: 'B-01', month: 'AGOSTO / 2006', title: 'Inventário mensal', detail: 'Fechamento de agosto. Transferências concluídas.' },
  { code: 'B-02', month: 'SETEMBRO / 2006', title: 'Inventário mensal', detail: 'Fechamento de setembro. Destinatária: Marta, Administração.' },
  { code: 'B-03', month: 'SETEMBRO / 2006', title: 'Notas de manutenção', detail: 'Troca de filtros e lâmpadas. Não é um inventário.' },
]);
export const inventoryFolder = 'B-02';
export const buildingAreas = Object.freeze([
  ['Protocolo / corredor / administração', 'Livre'],
  ['Arquivo B', 'Cartão B · liberado nesta missão'],
  ['Sala 02 / administração lateral / ala leste', 'Bloqueadas · etapas futuras'],
]);

export function createStoryState() {
  // Printer/count fields remain only for migration of the earlier save format.
  return { phase: 'routine', memoRead: false, printerAuthorized: false, orderPrinted: false,
    archiveUnlocked: false, routineSubmitted: false, entityHeard: false,
    anomaliesReleased: false, releaseDelay: 0, boxCounts: {},
    normalSeconds: 0, folderCode: null, routines: {},
    lighting: { protocol: true, corridor: true, archive: true }, doors: {} };
}

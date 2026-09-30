import { archiveRecords, buildingAreas } from '../narrative/MissionData.js';

// Legible, diegetic document/telephone interfaces, separated from menus/settings.
export class MissionUI {
  constructor(ui) { this.ui=ui;this.game=ui.game; }
  show(title,body,mode='mission') {
    const ui=this.ui;ui.panelMode=mode;
    ui.panelInner.innerHTML=`<p class="eyebrow">USO INTERNO · TURNO NOTURNO</p><h2>${title}</h2>${body}<button class="secondary" data-action="close">FECHAR [ESC]</button>`;
    ui.panel.classList.remove('hidden');
  }
  document(body) { return `<div class="document">${body}</div>`; }
  records() { return `<table><thead><tr><th>Caixa</th><th>Volumes</th><th>Lacre</th></tr></thead><tbody>${Object.entries(archiveRecords).map(([code,count])=>`<tr><td>${code}</td><td>${count}</td><td>0417</td></tr>`).join('')}</tbody></table>`; }
  memo() {
    this.game.world.story.memoRead=true;this.game.persist();
    this.show('CIRCULAR 17',this.document('<b>IMPRESSÃO DO TURNO NOTURNO</b><p>Folhas de conferência ficam retidas até autorização do Arquivo.</p><p>Disque o ramal <b>417</b> no telefone do Protocolo. Aguarde a liberação e retire a folha na impressora.</p><p>O cartão B permanece no gaveteiro. Não remova os lacres; conte os volumes pela etiqueta.</p><p>Responsável: Marta · Administração</p>'));
  }
  phone(message='') {
    this.show('RAMAL INTERNO',`<p role="status">${message||'Liberação de documentos · consulte a circular no quadro de avisos.'}</p><label>RAMAL<input data-extension inputmode="numeric" maxlength="3" autocomplete="off" aria-label="RAMAL"></label><button data-action="dial">DISCAR</button>`,'phone');
  }
  printer() {
    const s=this.game.world.story;
    if(s.entityHeard){this.entity();return;}
    this.show('IMPRESSORA / FILA',this.document(`<b>ORDEM 0417</b><p>${s.orderPrinted?'Folha já retirada. O cartão B está no gaveteiro.':s.printerAuthorized?'Autorização recebida. Uma folha aguardando retirada.':'TRABALHO RETIDO · autorização por ramal necessária.'}</p>`)+(s.printerAuthorized&&!s.orderPrinted?'<button data-action="print-order">IMPRIMIR E RETIRAR FOLHA</button>':''));
  }
  drawer() {
    const g=this.game,card=g.world.inventory.includes('archive-card');
    this.show('GAVETA / ACESSOS',this.document(`<b>CARTÃO B · ARQUIVO</b><p>${card?'Cartão em sua prancheta.':g.world.story.orderPrinted?'A folha autoriza a retirada do cartão B.':'Retire primeiro a folha de conferência na impressora.'}</p><p>Demais chaves: recolhidas pela manutenção.</p>`)+(!card&&g.world.story.orderPrinted?'<button data-action="take-card">RETIRAR CARTÃO B</button>':''));
  }
  order() {
    const g=this.game,w=g.world,s=w.story;
    const steps=[['Ler circular no quadro de avisos',s.memoRead],['Liberar a fila pelo ramal',s.printerAuthorized],['Retirar a folha impressa',s.orderPrinted],['Retirar cartão B no gaveteiro',w.inventory.includes('archive-card')||s.routineSubmitted],['Liberar o Arquivo B',s.archiveUnlocked],['Conferir volumes e lacres',g.task.inspected===3],['Entregar inventário no terminal',s.routineSubmitted]];
    let body=steps.map(([text,done])=>`<p>${done?'[x]':'[ ]'} ${text}</p>`).join('');
    if(s.orderPrinted)body+=this.records();
    body+='<p>Prateleira 03 · não abra os lacres. TAB consulta esta folha.</p>';
    if(s.entityHeard)body+='<hr><b>ANOTAÇÃO SEM REMETENTE</b><p>Compare o relógio do Arquivo com o Protocolo. Reveja Marta. Observe antes de registrar uma ocorrência.</p><p>O que falou pela máquina pode não estar dizendo a verdade.</p>';
    this.show('ORDEM 0417',this.document(body),'order');
  }
  box(code) {
    this.ui.boxCode=code;
    const count=archiveRecords[code], checked=this.game.world.flags.inspectedBoxes.includes(code);
    this.show(code,this.document(`<b>ETIQUETA DA REMESSA</b><p>DOCUMENTOS ADMINISTRATIVOS<br>VOLUMES: ${count}<br>LACRE: 0417 · intacto</p><p>Compare com a folha impressa antes de rubricar.</p>`)+`<label>VOLUMES NA FOLHA<select data-count aria-label="VOLUMES NA FOLHA"><option value="">Selecionar</option>${[8,12,15].map(n=>`<option>${n}</option>`).join('')}</select></label><button data-action="confirm-box" data-code="${code}">${checked?'CONFERÊNCIA REGISTRADA — FECHAR':'RUBRICAR CONFERÊNCIA'}</button>`,'box');
  }
  entity() {
    this.show('SEM REMETENTE',this.document('<b>ESTA FOLHA NÃO TEM NÚMERO DE PROTOCOLO</b><p>Há duas versões do mesmo lugar. Uma delas não se lembra de você.</p><p>Compare com a primeira passagem. Nem toda diferença é um erro. Nem toda ajuda é ajuda.</p><p>Não registre o que você apenas supõe.</p>'));
  }
  clock(clock) {
    const minutes=this.game.world.gameTime+clock.offset();
    const time=`${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
    this.show('RELÓGIO DE PAREDE',this.document(`<b>${time}</b><p>Os ponteiros não fazem barulho.</p><p>Este é o horário indicado neste relógio, não o horário oficial do prédio.</p>`));
  }
  terminal() {
    const g=this.game,w=g.world,s=w.story;
    let body=this.document(`<b>ARQUIVO B · ORDEM 0417</b><p>${g.task.inspected}/3 caixas rubricadas.</p><p>${w.currentTask==='complete'?'Conferência e ocorrência encerradas.':s.entityHeard?'Verificação complementar pendente.':'Conferência de fim de turno: volumes, lacres e devolução de acesso.'}</p>`);
    if(g.task.canSubmitRoutine)body+='<button data-action="submit-routine">ENTREGAR INVENTÁRIO E DEVOLVER CARTÃO</button>';
    else if(g.task.canReport)body+='<button data-action="conforme">NENHUMA ALTERAÇÃO OBSERVADA</button><button data-action="irregularity">REGISTRAR OCORRÊNCIA</button>';
    else if(w.currentTask==='complete')body+=this.document('<b>REGISTRO RECEBIDO</b><p>O turno segue aberto. A próxima etapa da noite ainda não está disponível.</p>');
    else body+='<button data-action="work-order">CONSULTAR FOLHA DE TRABALHO</button>';
    body+='<details><summary>MAPA DE ACESSOS</summary>'+buildingAreas.map(([name,state])=>`<p>${name}: ${name==='Arquivo B'?(s.archiveUnlocked?'Liberado':'Bloqueado · cartão B necessário'):state}</p>`).join('')+'</details>';
    this.show('PROTOCOLO / PENDÊNCIAS',body,'terminal');
  }
  handle(action,button) {
    const g=this.game;
    if(action==='dial'){g.audio.interact();const ok=g.task.authorizePrinter(this.ui.panel.querySelector('[data-extension]').value);g.persist();this.phone(ok?'ARQUIVO: Ordem 0417 liberada. A folha sai na impressora.':'Ramal sem atendimento. Consulte a circular.');}
    else if(action==='print-order'){if(g.task.printOrder()){g.audio.printer(g.worldManager.printer.position);g.persist();this.order();}}
    else if(action==='take-card'){if(g.task.takeCard()){g.audio.interact();g.persist();this.drawer();}}
    else if(action==='submit-routine')g.submitRoutine();
    else if(action==='work-order')this.order();
    else if(action==='confirm-box')g.confirmBox(button.dataset.code,this.ui.panel.querySelector('[data-count]').value);
    else return false;
    return true;
  }
}

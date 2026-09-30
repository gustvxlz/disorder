import { archiveRecords, archiveFolders, buildingAreas } from '../narrative/MissionData.js';

// Legible, diegetic document/telephone interfaces, separated from menus/settings.
export class MissionUI {
  constructor(ui) { this.ui=ui;this.game=ui.game; }
  show(title,body,mode='mission') {
    const ui=this.ui;ui.panelMode=mode;
    ui.panelInner.innerHTML=`<p class="eyebrow">USO INTERNO · TURNO NOTURNO</p><h2>${title}</h2>${body}<button class="secondary" data-action="close">FECHAR [ESC]</button>`;
    ui.panel.classList.remove('hidden');
  }
  document(body) { return `<div class="document">${body}</div>`; }
  memo() {
    this.game.world.story.memoRead=true;this.game.persist();
    this.show('AVISOS DO TURNO',this.document('<b>ACESSOS COMPARTILHADOS</b><p>O cartão do Arquivo B voltou ao quadro de chaves do Protocolo. Pode usar; devolva ao sair.</p><p>Inventários: organizados por mês. Notas de manutenção têm uma seção separada.</p><hr><p>O café é de hoje. A caneca com asa torta é do Antônio.</p><p>Sexta-feira: tragam um prato para o almoço. Não outra salada de passas.</p>'));
  }
  phone(message='') {
    this.show('RAMAL INTERNO',`<p role="status">${message||'Agenda interna: Administração 417 · Protocolo 203 · Manutenção 119.'}</p><label>RAMAL<input data-extension inputmode="numeric" maxlength="3" autocomplete="off" aria-label="RAMAL"></label><button data-action="dial">DISCAR</button>`,'phone');
  }
  printer() {
    const s=this.game.world.story;
    if(s.entityHeard){this.entity();return;}
    this.show('IMPRESSORA / FILA',this.document('<b>CÓPIAS DO ANTÔNIO</b><p>Relatórios do mês. A impressão já está na bandeja. Nenhum documento seu está pendente.</p><p>A máquina faz um ruído baixo de ventilação.</p>'));
  }
  drawer() {
    this.show('GAVETEIRO',this.document('<b>OBJETOS DO PROTOCOLO</b><p>Clipes, borrachas secas e uma revista velha. Um bilhete: “Cartão B no quadro. Não guardar aqui outra vez.”</p>'));
  }
  keys() {
    const card=this.game.world.inventory.includes('archive-card');
    this.show('QUADRO DE CHAVES',this.document(`<b>ARQUIVO B</b><p>${card?'O gancho B está vazio. Você está com o cartão.':'Um único cartão no gancho B. Etiqueta: acesso compartilhado · Arquivo B.'}</p><p>Demais chaves: manutenção.</p>`)+(!card?'<button data-action="take-card">PEGAR CARTÃO B</button>':''));
  }
  order() {
    const g=this.game,w=g.world,s=w.story;
    let body='<b>23:20 · ARQUIVO B</b><p>Buscar o inventário mensal de setembro e entregar para Marta.</p>';
    if(s.routineSubmitted)body='<b>INVENTÁRIO ENTREGUE</b><p>Marta recebeu a pasta. Intervalo liberado.</p>';
    const folder=archiveFolders.find(item=>item.code===s.folderCode);
    if(folder)body+=`<hr><p>Na prancheta: ${folder.code} · ${folder.title} · ${folder.month}.</p>`;
    if(s.entityHeard)body+='<hr><p>Uma folha apareceu sem remetente. “Não confie em tudo que reconhece.”</p>';
    this.show('ANOTAÇÃO DO TURNO',this.document(body),'order');
  }
  box(code) {
    this.ui.boxCode=code;
    this.show(code,this.document(`<b>REMESSA ANTIGA · LACRADA</b><p>VOLUMES: ${archiveRecords[code]} · LACRE: 0417</p><p>As caixas guardam documentos avulsos. Inventários mensais ficam nas pastas, na seção do mês.</p>`),'box');
  }
  folder(code) {
    const folder=archiveFolders.find(item=>item.code===code);if(!folder)return;
    const s=this.game.world.story;
    this.show(`PASTA ${code}`,this.document(`<b>${folder.title.toUpperCase()}</b><p>${folder.month}</p><p>${folder.detail}</p>`)+(!s.routineSubmitted?`<button data-action="take-folder" data-code="${code}">${s.folderCode===code?'DEVOLVER À PRATELEIRA':s.folderCode?'TROCAR A PASTA NA PRANCHETA':'LEVAR PASTA'}</button>`:''));
  }
  entity() {
    this.show('SEM REMETENTE',this.document('<b>VOCÊ CONSEGUE ME OUVIR?</b><p>Não confie em tudo que reconhece.</p><p>Nenhum nome. Nenhum número de protocolo.</p>'));
  }
  clock(clock) {
    const minutes=this.game.world.gameTime+clock.offset();
    const time=`${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
    this.show('RELÓGIO DE PAREDE',this.document(`<b>${time}</b><p>Os ponteiros não fazem barulho.</p><p>Este é o horário indicado neste relógio, não o horário oficial do prédio.</p>`));
  }
  terminal() {
    const g=this.game,w=g.world,s=w.story;
    let body=this.document(`<b>PORTARIA / LIVRO DE OCORRÊNCIAS</b><p>${s.entityHeard?'Registro disponível para alterações observadas.':'Plantão sem ocorrências. Inventários devem ser entregues pessoalmente à Administração.'}</p>`);
    if(g.task.canReport)body+='<button data-action="conforme">NENHUMA ALTERAÇÃO OBSERVADA</button><button data-action="irregularity">REGISTRAR OCORRÊNCIA</button>';
    else if(w.currentTask==='complete')body+=this.document('<b>REGISTRO RECEBIDO</b><p>O turno segue aberto. A próxima etapa da noite ainda não está disponível.</p>');
    else body+='<p>Consulte a intranet ou converse com os funcionários.</p>';
    body+='<details><summary>MAPA DE ACESSOS</summary>'+buildingAreas.map(([name,state])=>`<p>${name}: ${name==='Arquivo B'?(s.archiveUnlocked?'Liberado':'Bloqueado · cartão B necessário'):state}</p>`).join('')+'</details>';
    this.show('PROTOCOLO / PENDÊNCIAS',body,'terminal');
  }
  handle(action,button) {
    const g=this.game;
    if(action==='dial'){g.audio.interact();const ramal=this.ui.panel.querySelector('[data-extension]').value;this.phone(ramal==='417'?'MARTA: Pode vir pessoalmente. Estou na minha mesa, no fim do corredor.':ramal==='203'?'Você ouve seu próprio telefone, aqui no Protocolo.':ramal==='119'?'MANUTENÇÃO: Encerramos às 22h. Emergências, só pela portaria.':'Ramal sem atendimento. Consulte a agenda.');}
    else if(action==='take-card'){if(g.task.takeCard()){g.worldManager.cardBadge.visible=false;g.audio.interact();g.persist();g.closePanel();}}
    else if(action==='take-folder'){
      if(g.world.story.folderCode===button.dataset.code){g.world.story.folderCode=null;g.world.inventory=g.world.inventory.filter(item=>item!=='archive-folder');g.worldManager.refreshFolders();g.persist();g.closePanel();}
      else if(g.task.takeFolder(button.dataset.code)){g.audio.paper();g.worldManager.refreshFolders();g.persist();g.closePanel();}
    }
    else if(action==='work-order')this.order();
    else return false;
    return true;
  }
}

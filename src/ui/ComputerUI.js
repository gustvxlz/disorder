import { buildingPlan } from '../narrative/BuildingPlan.js';
import { officeCat } from '../world/ScreenArt.js';

const apps=[['intranet','INTRANET'],['mail','CORREIO'],['staff','FUNCIONÁRIOS'],['phones','RAMAIS'],['inventory','INVENTÁRIO'],['documents','DOCUMENTOS'],['personal','PESSOAL'],['utility','UTILITÁRIOS']];

export class ComputerUI {
  constructor(ui){this.ui=ui;this.game=ui.game;this.station='protocol';this.cells=new Set();}
  open(station='protocol',app='intranet') {
    this.station=station;this.ui.panelMode='computer';
    const owner=station==='marta'?'Marta':station==='desk'?'Lúcia':'Protocolo';
    this.ui.panelInner.innerHTML=`<div class="office-os"><div class="os-title">SISCOR 2006 · ${owner}</div><nav aria-label="APLICATIVOS">${apps.map(([id,label])=>`<button data-action="pc-app" data-app="${id}" ${id===app?'aria-current="page"':''}>${label}</button>`).join('')}</nav><section class="os-window"><h2>${apps.find(([id])=>id===app)?.[1]||'INTRANET'}</h2>${this.content(app)}</section><footer>REDE INTERNA · sessão de consulta · sem conexão externa</footer></div><button data-action="close" class="secondary">SAIR DO COMPUTADOR [ESC]</button>`;
    this.ui.panel.classList.remove('hidden');
  }
  content(app) {
    const s=this.game.world.story;
    if(app==='intranet')return `<p>Boa noite. Os setores administrativos permanecem em plantão.</p><h3>Como chegar</h3><p>Saia do Protocolo e siga o corredor até o fim. Marta trabalha à direita. A porta do Arquivo B fica à esquerda.</p><p>Os cartões compartilhados ficam no quadro de chaves do Protocolo.</p>${s.entityHeard?'<button data-action="pc-report">LIVRO DE OCORRÊNCIAS</button>':''}<details><summary>MAPA DO PRÉDIO</summary>${buildingPlan.map(([floor,rooms,status])=>`<p><b>${floor}</b><br>${rooms}<br><small>${status}</small></p>`).join('')}</details>`;
    if(app==='mail')return '<article><b>De: Marta · Assunto: Setembro</b><p>Preciso só da pasta do inventário mensal. Não das caixas nem das notas de manutenção. Vou conferir na minha mesa.</p></article><hr><article><b>De: Antônio · Assunto: Café</b><p>Troquei o filtro. Café novo, caneca velha. Quem deixar o ventilador ligado paga a conta.</p></article><hr><article><b>De: Lúcia · Assunto: Concurso de mascotes</b><p>Meu gato de plantão já tem asas. Não tem planilha. Prioridades.</p></article>';
    if(app==='staff')return '<p>Marta · Administração · fechamento mensal</p><p>Antônio · Protocolo · cópias e remessas</p><p>Lúcia · Protocolo · digitação</p><p>Renato · Administração · organização de pastas</p><p>Segurança e zeladoria: equipes previstas; não presentes nesta slice.</p>';
    if(app==='phones')return '<table><tr><th>Setor</th><th>Ramal</th></tr><tr><td>Administração / Marta</td><td>417</td></tr><tr><td>Protocolo</td><td>203</td></tr><tr><td>Manutenção (até 22h)</td><td>119</td></tr></table>';
    if(app==='inventory')return `<p><b>Inventários mensais · Arquivo B</b></p><p>Seção MENSAL · prateleira 03 · pastas organizadas por mês.</p><p>B-01: agosto / 2006<br>B-02: setembro / 2006<br>B-03: notas de manutenção / setembro</p><p>${s.routineSubmitted?'Marta recebeu o inventário de setembro.':'Retirada para consulta interna; entregar à responsável pelo fechamento.'}</p>`;
    if(app==='documents')return '<p><b>NAO_ABRIR.txt</b></p><p>Você abriu. Agora sabe: esconderam o último biscoito atrás da caixa de chá.</p><hr><p>compras.txt: pão, filtro de café, pilhas. Lembrar de ligar para casa.</p><p>Escala: RH e Contabilidade encerraram atendimento às 18h. Acesso noturno somente acompanhado.</p>';
    if(app==='personal')return `<p>GATO DE PLANTÃO · desenho da Lúcia</p><div class="office-cat" aria-label="Gato pixelado original voando sobre três faixas">${officeCat.map(row=>[...row].map(cell=>`<i class="pixel p${cell}"></i>`).join('')).join('')}</div><p>“O departamento aprovou o desenho. O gato recusou o departamento.”</p><p>Sem música. Antônio já reclamou do barulho da impressora.</p>`;
    return `<p>VARREDURA DO DEPÓSITO · passatempo original</p><p>Descubra quadrados livres; três pilhas estão instáveis. Os números mostram quantas pilhas encostam no quadrado. Sem consequência para o turno.</p><div class="sweep-grid">${Array.from({length:24},(_,i)=>`<button data-action="pc-cell" data-cell="${i}" aria-label="QUADRADO ${i+1}">${this.cells.has(i)?this.cellLabel(i):'·'}</button>`).join('')}</div><p role="status">${this.gameMessage||'Jogo opcional. Não é necessário para sua tarefa.'}</p><button data-action="pc-reset">NOVA PARTIDA</button>`;
  }
  cellLabel(index) {
    const unstable=[5,9,20];if(unstable.includes(index))return 'X';
    const x=index%6,y=Math.floor(index/6);
    return String(unstable.filter(i=>Math.abs(i%6-x)<=1&&Math.abs(Math.floor(i/6)-y)<=1).length);
  }
  handle(action,button) {
    if(action==='pc-app')this.open(this.station,button.dataset.app);
    else if(action==='pc-report')this.ui.mission.terminal();
    else if(action==='pc-cell'){
      const cell=Number(button.dataset.cell);if(!Number.isInteger(cell)||cell<0||cell>=24)return true;
      this.cells.add(cell);this.gameMessage=this.cellLabel(cell)==='X'?'Uma pilha caiu. Tente outro quadrado.':this.cells.size===21&&!['5','9','20'].some(i=>this.cells.has(Number(i)))?'Todas as áreas livres descobertas.':'Área verificada.';this.open(this.station,'utility');
    } else if(action==='pc-reset'){this.cells.clear();this.gameMessage='';this.open(this.station,'utility');}
    else return false;
    return true;
  }
}

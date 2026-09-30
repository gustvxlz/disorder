export class GameUI {
  constructor(root, game) {
    this.root = root;
    this.game = game;
    root.innerHTML = `
      <div class="viewport"></div>
      <div class="vignette"></div>
      <div class="fade"></div>
      <div class="hud hidden"><div class="topline"><span>PROTOCOLO INTERNO</span><span data-clock>01:47</span></div><div class="reticle">·</div><div class="prompt"></div><div class="toast"></div><div class="dialogue"></div></div>
      <section class="overlay menu"><div class="menu-inner"><p class="eyebrow">SISTEMA INTERNO · TURNO NOTURNO</p><h1>DISORDER</h1><div class="rule"></div><button data-action="resume" class="hidden">RESUME</button><button data-action="new">NEW SHIFT</button><button data-action="continue">CONTINUE</button><button data-action="settings">SETTINGS</button><p class="version">v0.1 · PROTOCOLO 01:47</p></div></section>
      <section class="overlay panel hidden"><div class="panel-inner"></div></section>
      <aside class="dev hidden"><strong>DEV</strong><pre data-metrics></pre><pre data-state></pre><label>SEED <input data-seed type="number" min="0" max="4294967295"></label><button data-action="restart">RESTART SHIFT</button><button data-action="force-on">FORCE ANOMALY ON</button><button data-action="force-off">FORCE ANOMALY OFF</button><label>POSITION <select data-position><option value="protocol">PROTOCOL</option><option value="protocol-door">PROTOCOL DOOR</option><option value="marta">MARTA</option><option value="archive-door">ARCHIVE DOOR</option><option value="A-14">A-14</option><option value="A-15">A-15</option><option value="A-16">A-16</option><option value="clock">ARCHIVE CLOCK</option></select></label><button data-action="go">GO TO POSITION</button></aside>`;
    this.menu = root.querySelector('.menu');
    this.menu.querySelector('[data-action="settings"]').insertAdjacentHTML('afterend','<button data-action="credits">CREDITS</button><p class="muted">Clique para ativar o áudio · 640 × 480</p>');
    this.hud = root.querySelector('.hud');
    this.panel = root.querySelector('.panel');
    this.panelInner = root.querySelector('.panel-inner');
    this.dev = root.querySelector('.dev');
    this.dev.querySelector('[data-position]').insertAdjacentHTML('beforeend', '<option value="phone">PHONE</option>');
    for(const [value,label] of [['art-protocol','ART PROTOCOL'],['art-corridor','ART CORRIDOR'],['art-archive','ART ARCHIVE'],['art-npc','ART NPC'],['art-prop','ART PROP']]) {
      const option=document.createElement('option');option.value=value;option.textContent=label;
      this.dev.querySelector('[data-position]').append(option);
    }
    this.dev.insertAdjacentHTML('beforeend','<button data-action="force-eyes">PREPARAR OLHOS ROXOS</button><button data-action="skip-task">CONFERIR CAIXAS (DEV)</button><button data-action="advance-time">+ 15 MINUTOS</button>');
    this.fade = root.querySelector('.fade');
    this.toastTimer = null;
    root.addEventListener('click', (event) => this.handleClick(event));
    root.addEventListener('input', (event) => this.handleInput(event));
  }

  setLoading(loading, message = 'CARREGANDO ARQUIVOS…') {
    this.menu.querySelector('[data-action="new"]').disabled = loading;
    this.menu.querySelector('.version').textContent = loading ? message : 'v0.1 · PROTOCOLO 01:47';
    this.updateContinue();
  }
  updateContinue() { this.menu.querySelector('[data-action="continue"]').disabled = !this.game.ready || !this.game.save.load(); }
  showMenu() { this.updateContinue(); this.menu.querySelector('[data-action="resume"]').classList.add('hidden'); this.menu.classList.remove('hidden'); this.hud.classList.add('hidden'); this.panel.classList.add('hidden'); }
  hideMenu() { this.menu.classList.add('hidden'); this.hud.classList.remove('hidden'); this.fade.classList.remove('clear'); requestAnimationFrame(() => requestAnimationFrame(() => this.fade.classList.add('clear'))); }
  pause() { this.updateContinue(); this.menu.classList.remove('hidden'); this.menu.querySelector('[data-action="resume"]').classList.remove('hidden'); }
  resume() { this.menu.classList.add('hidden'); this.panel.classList.add('hidden'); }
  prompt(text) { this.hud.querySelector('.prompt').textContent = text; }
  clock(text) { this.hud.querySelector('[data-clock]').textContent = text; }
  toast(text) {
    const element = this.hud.querySelector('.toast');
    element.textContent = text;
    element.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => element.classList.remove('visible'), 3400);
  }
  dialogue(name, line, duration = 4600) {
    const element = this.hud.querySelector('.dialogue');
    element.textContent = `${name}: “${line}”`;
    element.classList.add('visible');
    clearTimeout(this.dialogueTimer);
    this.dialogueTimer = setTimeout(() => element.classList.remove('visible'), duration);
  }

  terminal() {
    this.panelMode = 'terminal';
    const { world, task, time } = this.game;
    const inspected = world.flags.inspectedBoxes;
    let body;
    if (world.currentTask === 'pending') body = `<p>PENDÊNCIA ATUAL</p><div class="document"><b>ARQUIVO B</b><p>Conferir: A-14 · A-15 · A-16</p><p>LOCAL: SETOR DE ARQUIVO<br>PRATELEIRA 03</p></div><button data-action="order">ABRIR ORDEM 0417</button>`;
    else if (world.currentTask === 'inspection' && !task.canReport) body = `<p>PENDÊNCIA ATUAL</p><div class="document"><b>ORDEM 0417 · ARQUIVO B</b><p>Conferir caixas A-14, A-15 e A-16.</p><p>LOCAL: SETOR DE ARQUIVO · PRATELEIRA 03</p><p>REGISTRADAS: ${inspected.length}/3${inspected.length ? ` · ${inspected.join(', ')}` : ''}</p></div><p class="muted">TAB: consultar ficha. Retorne após a conferência.</p>`;
    else if (task.canReport) body = `<div class="document"><b>ARQUIVO B</b><p>CAIXAS: A-14 · A-15 · A-16</p><p>RESULTADO DA INSPEÇÃO</p></div><button data-action="conforme">CONFORME</button><button data-action="irregularity">REGISTRAR IRREGULARIDADE</button>`;
    else body = `<div class="document"><b>ARQUIVO B</b><p>REGISTRO RECEBIDO.</p></div><p class="muted">PENDÊNCIAS: 0</p>`;
    this.panelInner.innerHTML = `<p class="eyebrow">PROTOCOLO INTERNO / ${world.shiftId}</p><h2>TURNO NOTURNO</h2><div class="panel-meta"><span>HORÁRIO: ${time.format()}</span><span>SETOR 03</span></div>${body}<button class="secondary" data-action="close">FECHAR TERMINAL</button>`;
    this.panel.classList.remove('hidden');
  }

  locations() {
    this.panelInner.innerHTML = `<p class="eyebrow">PROTOCOLO INTERNO</p><h2>REGISTRAR OCORRÊNCIA</h2><button data-action="report-clock">ARQUIVO B · RELÓGIO</button><button data-action="report-marta">FUNCIONÁRIA · MARTA</button><button data-action="report-other">OUTRO</button><button class="secondary" data-action="terminal">VOLTAR</button>`;
  }

  settings() {
    this.panelMode = 'settings';
    const settings = this.game.settings.value;
    const volumes=[['volume','MASTER'],['music','MUSIC'],['sfx','SFX']].map(([key,label])=>`<label>${label}<input data-setting="${key}" type="range" min="0" max="1" step="0.01" value="${settings[key]}"></label>`).join('');
    this.panelInner.innerHTML = `<p class="eyebrow">DISORDER / CONFIGURAÇÕES</p><h2>SETTINGS</h2><label>MOUSE SENSITIVITY <input data-setting="sensitivity" type="range" min="0.0007" max="0.005" step="0.0001" value="${settings.sensitivity}"></label>${volumes}<p class="muted">IMAGEM: 640 × 480 · 4:3 · PIXEL PERFECT</p><label><input data-setting="headBob" type="checkbox" ${settings.headBob ? 'checked' : ''}> HEAD BOB</label><button class="secondary" data-action="close-settings">VOLTAR</button>`;
    this.panel.classList.remove('hidden');
  }

  workOrder() {
    this.panelMode = 'order';
    const { world } = this.game;
    const boxes = `<p>${world.flags.visitedArchive?'[x]':'[ ]'} Ir ao Arquivo B</p>`+['A-14', 'A-15', 'A-16'].map(code => `<p>${world.flags.inspectedBoxes.includes(code) ? '[x]' : '[ ]'} ${code}</p>`).join('')+`<p>${world.flags.returnedProtocol?'[x]':'[ ]'} Retornar ao Protocolo</p>`;
    this.panelInner.innerHTML = `<p class="eyebrow">PROTOCOLO / FICHA DE TRABALHO</p><h2>ORDEM 0417</h2><div class="document"><b>ARQUIVO B</b><p>SETOR DE ARQUIVO · PRATELEIRA 03</p>${boxes}<p>${world.currentTask === 'complete' ? 'REGISTRO RECEBIDO.' : 'Retorne ao Protocolo após a conferência.'}</p></div><button data-action="close">FECHAR FICHA [TAB]</button>`;
    this.panel.classList.remove('hidden');
  }

  boxInspection(code) {
    this.panelMode = 'box';
    const checked = this.game.world.flags.inspectedBoxes.includes(code);
    this.panelInner.innerHTML = `<p class="eyebrow">ARQUIVO B / PRATELEIRA 03</p><h2>${code}</h2><div class="document"><b>CAIXA DE ARQUIVO</b><p>CÓDIGO: ${code}</p><p>DOCUMENTOS ADMINISTRATIVOS<br>LACRE PRESENTE · ETIQUETA LEGÍVEL</p></div><button data-action="confirm-box" data-code="${code}">${checked ? 'CONFERÊNCIA REGISTRADA — FECHAR' : 'CONFIRMAR CONFERÊNCIA'}</button><button class="secondary" data-action="close">VOLTAR</button>`;
    this.panel.classList.remove('hidden');
  }

  handleInput(event) {
    const setting = event.target.dataset.setting;
    if (!setting) return;
    const value = setting === 'headBob' ? event.target.checked : setting === 'quality' ? event.target.value : Number(event.target.value);
    this.game.settings.update({ [setting]: value });
    this.game.applySettings();
  }

  handleClick(event) {
    const action = event.target.closest('button')?.dataset.action;
    if (!action) return;
    if (action === 'new') this.game.startNew();
    else if (action === 'resume') this.game.resume();
    else if (action === 'continue') this.game.continue();
    else if (action === 'settings') this.settings();
    else if (action === 'credits') this.credits();
    else if (action === 'order') { this.game.task.openOrder(); this.game.persist(); this.terminal(); }
    else if (action === 'conforme') this.game.report('conforme');
    else if (action === 'irregularity') this.locations();
    else if (action.startsWith('report-')) this.game.report('irregularity', action.slice(7));
    else if (action === 'terminal') this.terminal();
    else if (action === 'close') this.game.closePanel();
    else if (action === 'close-settings') this.game.closeSettings();
    else if (action === 'restart') this.game.startNew(this.dev.querySelector('[data-seed]').value);
    else if (action === 'force-on' || action === 'force-off') this.game.forceAnomaly(action === 'force-on');
    else if (action === 'go') this.game.devTeleport(this.dev.querySelector('[data-position]').value);
    else if (action === 'confirm-box') this.game.confirmBox(event.target.closest('button').dataset.code);
    else if(action==='force-eyes'&&this.game.world){this.game.world.flags.purpleEyesEligible=true;this.game.persist();}
    else if(action==='skip-task'&&this.game.world){this.game.task.openOrder();for(const code of ['A-14','A-15','A-16'])this.game.task.inspect(code);this.game.persist();}
    else if(action==='advance-time'&&this.game.world){this.game.world.gameTime+=15;this.game.worldManager.refreshClocks();this.game.persist();}
  }
  credits() {
    this.panelMode='settings';
    this.panelInner.innerHTML='<p class="eyebrow">DISORDER / CRÉDITOS</p><h2>UM TURNO NOTURNO</h2><div class="document"><p>Referências de personagens e músicas: fornecidas pelo autor.</p><p>Modelos: adaptações originais produzidas no Blender.</p><p>Trilha digital e efeitos: composições e síntese procedural originais.</p><p>Texturas: procedurais e linóleo gerado por imagem.</p><p>Three.js · Vite</p></div><button data-action="close-settings">VOLTAR</button>';
    this.panel.classList.remove('hidden');
  }
}

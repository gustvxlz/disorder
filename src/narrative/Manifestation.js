export class Manifestation {
  constructor(game) { this.game=game;this.elapsed=0;this.startedVoice=false; }
  start() {
    const g=this.game;
    g.player.clearInput();g.player.enabled=false;g.flow.busy=true;
    g.ui.panel.classList.add('hidden');g.music.silence();
    g.player.position.set(-2.25,0,8.6);g.player.yaw=Math.PI/2;g.player.pitch=-.4;
    g.camera.position.set(-2.25,1.68,8.6);g.ui.prompt?.('');g.persist();
    g.ui.toast('A FILA DE IMPRESSÃO NÃO ESTÁ VAZIA.');
  }
  update(dt) {
    const g=this.game;this.elapsed+=dt;
    const flicker=this.elapsed<3 && Math.floor(this.elapsed*5)%3===0;
    g.worldManager.setInterference(flicker?.08:.65);
    g.camera.position.set(-2.25,1.68,8.6);
    g.camera.lookAt(-3.6,1.0,8.5);
    if(this.elapsed>=2 && !this.printed){this.printed=true;g.audio.printer(g.worldManager.printer.position);g.worldManager.entityPaper.visible=true;g.audio.interference();}
    if(this.printed)g.worldManager.entityPaper.position.x=-3.55+Math.min(1,this.elapsed-2)*.25;
    if(this.elapsed>=4 && !this.startedVoice) {
      this.startedVoice=true;
      g.dialogue.start(['Você também ouviu a folha antes de ela sair?',
        'Duas realidades tocaram o mesmo lugar. Algumas coisas ficaram do lado errado.',
        'Não confie em mim. Compare com o que você já viu. O relógio. Os olhos. Os nomes.',
        'Termine o turno. Mas observe antes de registrar.'],{
        name:'SEM RAMAL',profile:'entity',speed:25,
        onComplete:()=>this.finish(),
      });
    }
  }
  finish() {
    const g=this.game,s=g.world.story;
    s.entityHeard=true;s.phase='aftermath';s.releaseDelay=0;
    g.worldManager.setInterference(1);g.player.yaw=g.camera.rotation.y;g.player.pitch=g.camera.rotation.x;
    g.flow.manifestation=null;g.flow.busy=false;g.player.enabled=true;g.player.lock();
    g.ui.toast('Nova anotação na ficha. Leia a impressão e revisite o Arquivo B.');g.persist();
  }
  dispose(){this.game.worldManager.setInterference(1);}
}

import * as THREE from 'three';
import { Manifestation } from './Manifestation.js';

export class ShiftFlow {
  constructor(game){this.game=game;this.busy=false;this.waking=0;this.observed=null;this.previousSector=null;}
  start() {
    const g=this.game;
    if(g.world.story.phase==='manifestation'){this.beginManifestation();return;}
    if(g.world.flags.openingComplete){g.player.enabled=true;g.player.lock();g.worldManager.supervisor.setPosition(2.8,6.6);return;}
    this.busy=true;this.waking=0.001;g.player.enabled=false;
    g.player.position.set(-1.65,0,6.2);g.player.yaw=-1.83;g.player.pitch=0;
    g.worldManager.supervisor.play('talk');
    g.dialogue.start(['Ei. Acorda. A última remessa ainda está aberta.',
      'A máquina segura a ordem até o ramal do arquivo liberar. O aviso explica.',
      'Imprime a folha, pega o cartão B no gaveteiro e confere volumes e lacres. Marta conhece a prateleira.',
      'Devolve o cartão e fecha o inventário no terminal. Amanhã ninguém quer procurar caixa faltando.',
      'Eu fico aqui até você voltar. Depois a gente bate o ponto.'],{
      name:'COLEGA',profile:'supervisor',position:g.worldManager.supervisor.root.position,
      onComplete:()=>{g.world.flags.openingComplete=true;g.world.flags.introCallHeard=true;g.task.openOrder();this.busy=false;this.waking=0;g.worldManager.supervisor.moveTo(2.8,6.6);g.player.enabled=true;g.player.lock();g.persist();g.ui.toast('TAB · ORDEM DE TURNO');},
    });
  }
  observe(npc) {
    if(this.busy)return;
    const g=this.game;
    this.busy=true;this.observed=npc;g.player.clearInput();g.player.enabled=false;
    g.camera.fov=52;g.camera.lookAt(npc.root.position.x,1.57,npc.root.position.z);g.camera.updateProjectionMatrix();
    npc.play('talk');
    if(npc.id==='marta'&&!g.world.anomalyStates.purple_eyes)g.world.flags.martaSeenNormal=true;
    const line=npc.id==='marta'?(g.world.story.entityHeard?'Essa impressora estava desligada. Você ouviu alguém?':g.task.inspected===3?'Voltou com a folha? Fecha o inventário no Protocolo. Eu guardo o cartão depois.':'Prateleira três, no fundo. Compare os volumes da folha com as etiquetas. Não abra os lacres.'):
      npc.id==='supervisor'?'A ordem ficou no Protocolo. Falta pouco.':npc.id==='office_01'?'Eu jurava que já tinha separado esta pasta.':'Só vou terminar esta página.';
    g.dialogue.start([line],{name:npc.name,profile:npc.id==='marta'?'marta':npc.id==='supervisor'?'supervisor':'generic',position:npc.root.position,onComplete:()=>this.endObservation()});
    g.persist();
  }
  endObservation(){const g=this.game;this.observed?.play(this.observed.idle);this.observed=null;this.busy=false;g.camera.fov=68;g.camera.updateProjectionMatrix();g.player.enabled=true;g.player.lock();}
  beginManifestation(){this.manifestation=new Manifestation(this.game);this.manifestation.start();}
  update(dt) {
    const g=this.game;
    if(this.manifestation){this.manifestation.update(dt);return;}
    if(this.waking){
      this.waking+=dt;
      const t=THREE.MathUtils.smoothstep(this.waking,0,4);
      g.camera.position.set(-1.65,1.03+.7*t,7.05-.85*t);g.camera.rotation.set(-.65*(1-t),-1.83,0,'YXZ');
    }
    const sector=g.player.position.x<-5?'archive':g.player.position.z>3?'protocol':'office';
    if(sector!==this.previousSector){
      this.previousSector=sector;
      if(sector==='archive'){g.world.flags.visitedArchive=true;g.music.silence();g.persist();}
      else if(sector==='protocol'&&g.task.inspected===3){g.world.flags.returnedProtocol=true;g.music.direction(g.world.runDirection);g.persist();}
    }
    const s=g.world.story;
    if(s.entityHeard && !s.anomaliesReleased && !this.busy) {
      s.releaseDelay=Math.min(60,s.releaseDelay+dt);
      if(s.releaseDelay>=8 && sector!=='protocol') {
        s.anomaliesReleased=true;g.anomalies.select();g.worldManager.refreshClocks();g.persist();
      }
    }
    if(g.anomalies.revealEyes(g.worldManager.marta.root.position.distanceTo(g.player.position)))g.persist();
  }
  dispose(){this.manifestation?.dispose();this.game.dialogue.cancel();this.game.camera.fov=68;this.game.camera.updateProjectionMatrix();}
}

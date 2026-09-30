import * as THREE from 'three';
import { Manifestation } from './Manifestation.js';
import { NORMAL_SECONDS } from './MissionData.js';

export class ShiftFlow {
  constructor(game){this.game=game;this.busy=false;this.waking=0;this.observed=null;this.previousSector=null;}
  start() {
    const g=this.game;
    if(g.world.story.phase==='manifestation'){this.beginManifestation();return;}
    if(g.world.flags.openingComplete){g.player.enabled=true;g.player.lock();return;}
    this.busy=true;this.waking=0.001;g.player.enabled=false;
    g.player.position.set(-1.65,0,6.2);g.player.yaw=2.65;g.player.pitch=0;
    g.worldManager.supervisor.play('talk');
    g.dialogue.start(['Ei, acordou? Marta ainda está fechando o mês lá na Administração.',
      'Leva o inventário de setembro do Arquivo B para ela, por favor. A saída do Protocolo é atrás de você.',
      'Eu termino estas cópias. Sua anotação está na prancheta, se precisar.'],{
      name:'ANTÔNIO',profile:'supervisor',position:g.worldManager.supervisor.root.position,
      onComplete:()=>{g.world.flags.openingComplete=true;g.world.flags.introCallHeard=true;g.task.openOrder();this.busy=false;this.waking=0;g.worldManager.supervisor.play('inspect_document');g.player.enabled=true;g.player.lock();g.persist();},
    });
  }
  observe(npc) {
    if(this.busy)return;
    const g=this.game;
    this.busy=true;this.observed=npc;g.player.clearInput();g.player.enabled=false;
    g.camera.fov=52;g.camera.lookAt(npc.root.position.x,['typing','sit','work_at_desk'].includes(npc.current)?1.12:1.57,npc.root.position.z);g.camera.updateProjectionMatrix();
    this.previousAnimation=npc.current;
    if(!['typing','work_at_desk','sit'].includes(npc.current))npc.play('talk');
    if(npc.id==='marta'&&!g.world.anomalyStates.purple_eyes)g.world.flags.martaSeenNormal=true;
    let line;
    if(npc.id==='marta') {
      if(g.task.canSubmitRoutine){g.submitRoutine();line='Setembro, isso mesmo. Obrigada! Pode ficar com o cartão até sair. Vou conferir na minha mesa; aproveita seu intervalo.';}
      else if(g.world.story.folderCode)line='Essa não é a pasta do inventário de setembro. No Arquivo a etiqueta mostra o mês e o tipo de documento. Deixa essa lá e traz a mensal, por favor.';
      else if(g.world.story.entityHeard)line='Estava tudo funcionando agora há pouco. Você também ouviu o telefone?';
      else line=g.world.story.routineSubmitted?'Já estou conferindo o que você trouxe. Pode descansar um pouco. O café do Protocolo ainda está quente.':'Preciso do inventário mensal de setembro. No Arquivo, os inventários ficam juntos, separados por mês. O cartão compartilhado fica no quadro de chaves do Protocolo.';
    } else if(npc.id==='supervisor')line='Essas cópias eram para ontem. O cartão B fica pendurado no quadro, não precisa pedir autorização. Eu assino a retirada depois.';
    else if(npc.id==='office_01')line='O computador só mostra meu desenho quando eu paro de digitar. Não conta para a Marta. Tem os ramais e o mapa na intranet também.';
    else line='Levo estas pastas para a mesa e volto ao bebedouro. De noite dá para ouvir a bomba d’água do outro lado do corredor.';
    g.dialogue.start([line],{name:npc.name,profile:npc.id==='marta'?'marta':npc.id==='supervisor'?'supervisor':'generic',position:npc.root.position,onComplete:()=>this.endObservation()});
    g.persist();
  }
  endObservation(){const g=this.game;this.observed?.play(this.previousAnimation||this.observed.idle);this.observed=null;this.busy=false;g.camera.fov=68;g.camera.updateProjectionMatrix();g.player.enabled=true;g.player.lock();}
  beginManifestation(){this.manifestation=new Manifestation(this.game);this.manifestation.start();}
  update(dt) {
    const g=this.game;
    if(this.manifestation){this.manifestation.update(dt);return;}
    if(this.waking){
      this.waking+=dt;
      const t=THREE.MathUtils.smoothstep(this.waking,0,4);
      g.camera.position.set(-1.65,1.03+.7*t,7.05-.85*t);g.camera.rotation.set(-.65*(1-t),2.65,0,'YXZ');
    }
    const sector=g.player.position.x<-5?'archive':g.player.position.z>3?'protocol':'office';
    if(sector!==this.previousSector){
      this.previousSector=sector;
      if(sector==='archive'){g.world.flags.visitedArchive=true;g.music.silence();g.persist();}
      else if(sector==='protocol'&&g.world.story.routineSubmitted){g.world.flags.returnedProtocol=true;g.music.direction(g.world.runDirection);g.persist();}
    }
    const s=g.world.story;
    if(s.phase==='routine') {
      s.normalSeconds=Math.min(7200,s.normalSeconds+dt);
      if(s.normalSeconds>=NORMAL_SECONDS && s.routineSubmitted && !this.busy && sector==='protocol' && g.player.position.distanceTo(g.worldManager.printer.position)<3) {
        s.phase='manifestation';this.beginManifestation();return;
      }
    }
    if(s.entityHeard && !s.anomaliesReleased && !this.busy) {
      s.releaseDelay=Math.min(60,s.releaseDelay+dt);
      if(s.releaseDelay>=8 && sector!=='protocol') {
        s.anomaliesReleased=true;g.anomalies.select();g.worldManager.refreshClocks();g.persist();
      }
    }
    else if(s.anomaliesReleased)s.releaseDelay=Math.min(60,s.releaseDelay+dt);
    if(g.anomalies.revealEyes(g.worldManager.marta.root.position.distanceTo(g.player.position)))g.persist();
  }
  dispose(){this.manifestation?.dispose();this.game.dialogue.cancel();this.game.camera.fov=68;this.game.camera.updateProjectionMatrix();}
}

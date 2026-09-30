import * as THREE from 'three';
import { SeededRandom } from '../core/SeededRandom.js';

export class AudioManager {
  constructor(settings) {this.settings=settings;this.random=new SeededRandom(417);this.buffers={};this.distance=0;this.sources=new Set();}
  attach(camera) {this.listener=new THREE.AudioListener();camera.add(this.listener);this.context=this.listener.context;this.applySettings();}
  async load() {
    this.synthesize();
  }
  synthesize() {
    const make=(name,duration,fn)=>{
      const buffer=this.context.createBuffer(1,Math.ceil(duration*22050),22050),data=buffer.getChannelData(0);
      let smooth=0;
      for(let i=0;i<data.length;i++){const noise=this.random.range(-1,1);smooth=smooth*.92+noise*.08;data[i]=Math.round(fn(i/22050,noise,smooth)*64)/64;}
      this.buffers[name]=buffer;
    };
    make('ambient',4,(t,n,s)=>s*.7+Math.sin(t*Math.PI*120)*.045+Math.sin(t*Math.PI*238)*.015);
    make('step',.2,(t,n,s)=>(s*.9+Math.sin(t*560)*.24)*Math.exp(-t*27));
    make('door',.65,(t,n,s)=>(s*.35+Math.sin(t*(300-t*120))*.055)*Math.sin(Math.PI*t/.65));
    make('click',.045,t=>(Math.sin(t*2*Math.PI*660)>0?.15:-.15)*Math.exp(-t*90));
    make('paper',.32,(t,n)=>n*.075*Math.sin(Math.PI*t/.32));
    make('ring',2,(t)=>((t%.65)<.42?1:0)*(Math.sin(t*2*Math.PI*440)+Math.sin(t*2*Math.PI*480))*.11*Math.min(1,t*25));
    make('printer',1.4,(t,n,s)=>(s*.17+Math.sin(t*1200)*.028)*(Math.sin(t*25)>.1?1:.15));
    make('interference',1.8,(t,n,s)=>(Math.sin(t*2*Math.PI*(100+t*22))*.08+n*.025)*Math.sin(Math.PI*t/1.8));
    make('water',.85,(t,n,s)=>(s*.45+Math.sin(t*(720+Math.sin(t*31)*140))*.04)*Math.sin(Math.PI*t/.85));
  }
  applySettings(){this.listener?.setMasterVolume(this.settings.value.volume);this.ambient?.setVolume(.42*this.settings.value.sfx);}
  unlock() {
    this.context.resume().catch(()=>{});this.applySettings();
    if(this.ambient)return;
    this.ambient=new THREE.Audio(this.listener);this.ambient.setBuffer(this.buffers.ambient);this.ambient.setLoop(true);this.ambient.setVolume(.42*this.settings.value.sfx);
    this.ambientFilter=this.context.createBiquadFilter();this.ambientFilter.type='lowpass';this.ambientFilter.frequency.value=480;
    this.ambient.setFilter(this.ambientFilter);this.ambient.play();
  }
  play(name,position,volume=.5,rate=1,onEnded) {
    if(!this.buffers[name])return null;
    const sound=position?new THREE.PositionalAudio(this.listener):new THREE.Audio(this.listener);
    sound.setBuffer(this.buffers[name]);sound.setVolume(volume*this.settings.value.sfx);sound.setPlaybackRate(rate);
    if(position){sound.position.copy(position);sound.setRefDistance(2.5);sound.setRolloffFactor(1.1);this.scene.add(sound);sound.updateMatrixWorld();}
    this.sources.add(sound);
    sound.onEnded=()=>{sound.isPlaying=false;this.release(sound);onEnded?.();};
    sound.play();return sound;
  }
  update(player,dt) {
    if(this.ambientFilter)this.ambientFilter.frequency.setTargetAtTime(player.position.x<-5?230:480,this.context.currentTime,.8);
    const speed=player.velocity.length();
    if(!player.enabled||speed<.3){this.distance=0;return;}
    this.distance+=speed*dt;
    if(this.distance>(speed>3?1.05:.83)){this.distance=0;this.play('step',null,speed>3?.72:.5,this.random.range(.88,1.12));}
  }
  door(position,locked=false){this.play(locked?'click':'door',position,locked?.4:.75,this.random.range(.94,1.04));}
  interact(){this.play('click',null,.35);}
  paper(){this.play('paper',null,.75);}
  water(position){this.play('water',position,.55);}
  phone(position){this.stopRing();this.ring=this.play('ring',position,.9);}
  release(sound){sound.disconnect();sound.gain.disconnect();sound.panner?.disconnect();sound.removeFromParent();this.sources.delete(sound);}
  stopRing(){if(this.ring?.isPlaying){this.ring.stop();this.release(this.ring);}this.ring=null;}
  printer(position){this.play('printer',position,.75);}
  interference(){this.play('interference',null,.6);}
  pause(){this.paused=true;this.context.suspend().catch(()=>{});}
  resume(){this.paused=false;this.context.resume().catch(()=>{});}
  voice(name,position,onEnded){return this.play(name,position,1,1,onEnded);}
  dialogueTone(profile,position) {
    const name=`dialogue-${profile.wave}`;
    if(!this.buffers[name]){
      const buffer=this.context.createBuffer(1,1764,22050),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++){
        const t=i/22050,phase=(t*220)%1;
        const wave=profile.wave==='triangle'?1-4*Math.abs(phase-.5):phase<(profile.wave==='pulse'?.25:.5)?1:-1;
        data[i]=wave*.12*Math.min(1,t/.008)*Math.max(0,1-t/.08);
      }
      this.buffers[name]=buffer;
    }
    this.play(name,position,.5,profile.pitch/220*this.random.range(.96,1.04));
  }
  stopEffects(){for(const sound of this.sources){if(sound.isPlaying)sound.stop();this.release(sound);}this.sources.clear();this.ring=null;}
}

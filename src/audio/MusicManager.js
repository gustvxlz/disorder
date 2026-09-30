import * as THREE from 'three';

export class MusicManager {
  constructor(audio, settings) { this.audio=audio; this.settings=settings; this.buffers={}; this.voices=[]; this.current=null; this.last=null; }
  async load() {
    const loader=new THREE.AudioLoader();
    await Promise.all(['menu','good','bad'].map(async name=>{
      this.buffers[name]=await loader.loadAsync(`${import.meta.env.BASE_URL}assets/audio/music/${name}.wav`);
    }));
  }
  cue(name, { repeat=false, loop=false }={}) {
    if(name&&!this.buffers[name])return;
    if(name===this.current || (!repeat && name===this.last))return;
    for(const voice of this.voices)voice.target=0;
    this.current=name;
    if(!name)return;
    const sound=new THREE.Audio(this.audio.listener);
    sound.setBuffer(this.buffers[name]);sound.setLoop(loop);sound.setVolume(0);sound.play();
    const voice={sound,gain:0,target:.32,name};
    sound.onEnded=()=>{sound.isPlaying=false;sound.disconnect();sound.gain.disconnect();this.voices=this.voices.filter(v=>v!==voice);if(this.current===name)this.current=null;};
    this.voices.push(voice);this.last=name;
  }
  direction(value) { this.cue(value<-.2?'bad':'good'); }
  silence() { this.cue(null,{repeat:true}); }
  ending(direction) { this.cue(direction<0?'bad':'good',{repeat:true}); }
  update(dt) {
    for(const voice of [...this.voices]) {
      const step=dt*.08;
      voice.gain+=Math.sign(voice.target-voice.gain)*Math.min(step,Math.abs(voice.target-voice.gain));
      voice.sound.setVolume(voice.gain*this.settings.value.music);
      if(voice.target===0&&voice.gain===0){voice.sound.stop();voice.sound.disconnect();voice.sound.gain.disconnect();this.voices.splice(this.voices.indexOf(voice),1);}
    }
  }
}

const profiles={marta:{pitch:330,wave:'triangle'},supervisor:{pitch:190,wave:'pulse'},generic:{pitch:245,wave:'square'}};

export class DialogueManager {
  constructor(element,audio) { this.element=element;this.audio=audio;this.active=false; }
  start(lines,{name='',profile='generic',position=null,speed=32,onComplete=()=>{}}={}) {
    this.lines=lines;this.index=0;this.name=name;this.profile=profiles[profile]||profiles.generic;
    this.position=position;this.speed=speed;this.onComplete=onComplete;this.active=true;this.nextLine();
  }
  nextLine() {this.revealed=0;this.lastSound=0;this.line=this.lines[this.index];this.render();}
  update(dt) {
    if(!this.active||this.revealed>=this.line.length)return;
    this.revealed=Math.min(this.line.length,this.revealed+dt*this.speed);
    const count=Math.floor(this.revealed);
    if(count-this.lastSound>=3&&/\S/.test(this.line[count-1]||'')) {
      this.audio.dialogueTone(this.profile,this.position);this.lastSound=count;
    }
    this.render();
  }
  advance() {
    if(!this.active)return;
    if(this.revealed<this.line.length){this.revealed=this.line.length;this.render();return;}
    if(++this.index<this.lines.length)this.nextLine();
    else {const done=this.onComplete;this.cancel();done();}
  }
  render() {this.element.textContent=`${this.name?this.name+': ':''}${this.line.slice(0,Math.floor(this.revealed))}\n[E] ${this.revealed<this.line.length?'ler':'continuar'}`;this.element.classList.add('visible');}
  cancel() {this.active=false;this.element.classList.remove('visible');this.onComplete=()=>{};}
}

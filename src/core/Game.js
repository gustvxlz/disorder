import * as THREE from 'three';
import { createWorldState } from './WorldState.js';
import { SaveManager } from './SaveManager.js';
import { SettingsManager } from './SettingsManager.js';
import { PerformanceManager } from './PerformanceManager.js';
import { GameTime } from '../world/GameTime.js';
import { WorldManager } from '../world/WorldManager.js';
import { PlayerController } from '../player/PlayerController.js';
import { InteractionSystem } from '../player/InteractionSystem.js';
import { AnomalyManager } from '../anomalies/AnomalyManager.js';
import { TaskManager } from '../narrative/TaskManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { GameUI } from '../ui/GameUI.js';
import { AssetLibrary } from '../world/AssetLibrary.js';
import { RetroDisplay } from './RetroDisplay.js';
import { MusicManager } from '../audio/MusicManager.js';
import { DialogueManager } from '../narrative/DialogueManager.js';
import { ShiftFlow } from '../narrative/ShiftFlow.js';
import { PlayerBody } from '../player/PlayerBody.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.settings = new SettingsManager();
    this.save = new SaveManager();
    this.audio = new AudioManager(this.settings);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(640, 480, false);
    this.ui = new GameUI(root, this);
    root.querySelector('.viewport').append(this.renderer.domElement);
    this.dev = new URLSearchParams(location.search).get('dev') === 'true';
    if (this.dev) this.ui.dev.classList.remove('hidden');
    this.performance = new PerformanceManager(this.renderer, this.dev ? this.ui.dev : null);
    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.active = false;
    this.paused = false;
    this.saveTimer=0;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 65);
    this.camera.position.set(0, 1.65, 8.7);
    this.display = new RetroDisplay(root, this.renderer, this.camera);
    this.audio.attach(this.camera);
    this.music = new MusicManager(this.audio,this.settings);
    this.dialogue = new DialogueManager(this.ui.hud.querySelector('.dialogue'),this.audio);
    this.assets = new AssetLibrary();
    this.ready = false;
    this.ui.setLoading(true);
    Promise.all([this.assets.load(), this.audio.load(), this.music.load()]).then(() => {
      this.ready = true;
      this.ui.setLoading(false);
    }).catch(error => {
      console.error('Asset loading failed', error);
      this.ui.setLoading(true, 'Falha ao carregar os arquivos. Recarregue a página.');
    });
    this.applySettings();
    this.ui.showMenu();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('keydown', (event) => this.keydown(event));
    root.addEventListener('pointerdown',()=>{
      if(!this.ready)return;
      if(!this.paused)this.audio.resume();
      if(!this.active)this.music.cue('menu',{loop:true,repeat:true});
    });
    this.frame();
  }

  applySettings() {
    this.display?.resize();
    this.audio.applySettings();
  }

  resize() {
    this.display.resize();
  }

  startNew(seedInput) {
    if (!this.ready) return;
    const seed = seedInput !== undefined && seedInput !== '' ? Number(seedInput) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0];
    this.start(createWorldState(seed), true);
  }

  continue() {
    if (!this.ready) return;
    const saved = this.save.load();
    if (saved) this.start(saved, false);
  }

  start(world, fresh) {
    if (this.worldManager) this.disposeWorld();
    this.world = world;
    this.time = new GameTime(world);
    this.anomalies = new AnomalyManager(world, fresh);
    this.task = new TaskManager(world);
    this.scene = new THREE.Scene();
    this.interaction = new InteractionSystem(this.camera);
    this.player = new PlayerController(this.camera, this.renderer.domElement, [], this.settings, () => this.pause());
    this.audio.scene = this.scene;
    this.worldManager = new WorldManager(this.scene, this.player, this.interaction, this, this.time, this.anomalies, this.audio, this.assets);
    this.body=new PlayerBody(this.scene,this.assets,this.player);
    this.active = true;
    this.paused = false;
    this.player.enabled = true;
    this.ui.resume();
    this.ui.hideMenu();
    this.ui.dev.querySelector('[data-seed]').value = String(world.seed);
    this.ui.clock(this.time.format());
    this.audio.unlock();
    this.music.silence();
    this.flow=new ShiftFlow(this);
    this.flow.start();
    if(world.flags.openingComplete && world.story.phase!=='manifestation' && world.playerPose) {
      const [x,z,yaw,pitch]=world.playerPose;
      if(!this.player.collides(x,z))this.player.position.set(x,0,z);
      this.player.yaw=yaw;this.player.pitch=pitch;
    }
    this.persist();
    if (fresh) this.ui.toast(`TURNO ${world.shiftId}`);
  }

  disposeWorld() {
    this.player.enabled = false;
    this.player.destroy();
    this.flow?.dispose();
    this.audio.stopEffects();
    this.body?.dispose();
    this.worldManager.dispose();
    this.scene.clear();
  }

  persist() {
    if(!this.world)return;
    if(this.player&&!this.flow?.busy)this.world.playerPose=[this.player.position.x,this.player.position.z,this.player.yaw,this.player.pitch];
    if(!this.save.save(this.world))this.ui.toast('Não foi possível salvar neste navegador.');
  }

  pause() {
    if (!this.active || this.ui.panel.classList.contains('hidden') === false) return;
    this.paused=true;
    this.player.enabled = false;
    this.player.clearInput();
    document.exitPointerLock?.();
    this.persist();this.audio.pause();
    this.ui.pause();
  }

  resume() {
    if (!this.active) return;
    this.paused=false;this.audio.resume();
    this.ui.resume();
    this.player.enabled = !this.flow?.busy;
    if(this.player.enabled)this.player.lock();
  }

  openTerminal() {
    this.player.enabled = false;
    this.player.clearInput();
    document.exitPointerLock?.();
    this.audio.interact();
    this.persist();
    this.ui.terminal();
  }
  openComputer(station) {
    if(this.flow.busy)return;
    this.player.enabled=false;this.player.clearInput();document.exitPointerLock?.();
    this.audio.interact();this.ui.computer.open(station,station==='desk'?'personal':station==='marta'?'inventory':'intranet');
  }
  inspectFolder(code) {
    if(this.flow.busy)return;
    this.player.enabled=false;this.player.clearInput();document.exitPointerLock?.();
    this.audio.paper();this.ui.mission.folder(code);
  }

  closePanel() {
    this.ui.panel.classList.add('hidden');
    this.ui.panelMode=null;
    if (this.world.flags.phonePending && !this.world.flags.phoneRang) {
      this.audio.phone(this.worldManager.phonePosition);
      this.world.flags.phoneRang = true;
      this.persist();
    }
    if(this.world.story.phase==='manifestation'&&!this.flow.manifestation){this.flow.beginManifestation();return;}
    this.player.enabled = !this.paused&&!this.flow.busy;
    this.player.lock();
  }

  closeSettings() {
    this.ui.panel.classList.add('hidden');
    if (this.active && this.ui.menu.classList.contains('hidden')) {
      this.player.enabled = !this.paused&&!this.flow?.busy;
      this.player.lock();
    }
  }

  inspectBox(code) {
    if(this.flow.busy)return;
    this.player.enabled = false;
    this.player.clearInput();
    document.exitPointerLock?.();
    this.audio.paper();
    this.ui.boxInspection(code);
  }

  openMissionPanel(type) {
    if(this.flow.busy)return;
    this.player.enabled=false;this.player.clearInput();document.exitPointerLock?.();
    this.audio.interact();this.ui.mission[type]();
  }
  inspectClock(clock) {
    this.player.enabled=false;this.player.clearInput();document.exitPointerLock?.();
    this.audio.interact();this.ui.mission.clock(clock);
  }
  submitRoutine() {
    if(!this.task.submitRoutine())return;
    this.audio.paper();this.worldManager.refreshFolders();this.persist();
  }

  report(type, location = null) {
    if (!this.task.report(type, location)) return;
    this.music.direction(this.world.runDirection);
    this.persist();
    this.ui.terminal();
    this.ui.toast('REGISTRO RECEBIDO.');
  }

  answerPhone() {
    this.audio.interact();
    this.audio.stopRing();
    if (this.world.flags.phonePending) {
      this.world.flags.phonePending = false;
      this.world.flags.phoneAnswered = true;
      this.ui.toast('...');
      this.persist();
    } else this.openMissionPanel('phone');
  }

  forceAnomaly(active) {
    if (!this.world) return;
    this.anomalies.force(active);
    this.worldManager.refreshClocks();
    this.persist();
  }

  devTeleport(name) {
    if (!this.dev || !this.player) return;
    const positions = {
      protocol: [-1.65, 6.2, Math.PI, -0.4],
      'protocol-door': [0, 4.5, 0, 0],
      phone: [-.9, 6.2, Math.PI, -.58],
      marta: [1, -12.4, -Math.PI / 2, 0],
      'archive-door': [-3.4, -12.5, Math.PI / 2, 0],
      'A-14': [-9.37, -15.5, 0, -.3],
      'A-15': [-8.9, -15.5, 0, -.3],
      'A-16': [-8.43, -15.5, 0, -.3],
      clock: [-6.4, -15.1, -Math.PI/2, .29],
      'art-protocol': [1.8,4.8,2.68,-.14],
      'art-corridor': [.4,1.5,0,-.02],
      'art-archive': [-6.4,-13.5,.9,-.14],
      'art-npc': [2.5,-11.3,-Math.PI/2,-.03],
      'art-prop': [.1,-3,-Math.PI/2,-.58],
      memo: [3.6,7.7,-Math.PI/2,0],
      drawer: [2.65,9.25,Math.PI,-.55],
      printer: [-2.3,8.5,Math.PI/2,-.4],
      'switch-protocol': [.9,4.2,0,-.46],
      'switch-corridor': [.3,1,-Math.PI/2,-.45],
      body: [0,5,0,-1.35],
    };
    const [x, z, yaw, pitch] = positions[name] || positions.protocol;
    this.player.position.set(x, 0, z);
    this.player.velocity.set(0, 0, 0);
    this.player.yaw = yaw;
    this.player.pitch = pitch;
    this.camera.position.set(x, 1.73, z);
    this.camera.rotation.set(pitch, yaw, 0);
  }

  keydown(event) {
    if (/INPUT|SELECT|TEXTAREA/.test(event.target?.tagName) && event.code !== 'Escape') return;
    if(event.code==='KeyE'&&!event.repeat&&this.dialogue.active&&!this.paused&&this.ui.panel.classList.contains('hidden')) {this.dialogue.advance();return;}
    if (event.code === 'Escape' && this.ui.panelMode === 'settings' && !this.ui.panel.classList.contains('hidden')) {
      this.closeSettings();
      return;
    }
    if (event.code === 'Tab' && this.active && !event.repeat) {
      event.preventDefault();
      if (this.ui.panelMode === 'order' && !this.ui.panel.classList.contains('hidden')) this.closePanel();
      else if (this.player.enabled) {
        this.player.enabled = false;
        this.player.clearInput();
        document.exitPointerLock?.();
        this.ui.workOrder();
      }
      return;
    }
    if (event.code === 'Escape' && this.active) {
      if (!this.ui.panel.classList.contains('hidden')) {
        if (this.ui.panelMode === 'settings') this.closeSettings();
        else this.closePanel();
      } else if (this.ui.menu.classList.contains('hidden')) this.pause();
      return;
    }
    if (event.code === 'KeyE' && !event.repeat && this.active && this.player.enabled && (document.pointerLockElement === this.renderer.domElement || this.player.fallbackLook)) {
      this.interaction.interact();
    }
  }

  frame() {
    requestAnimationFrame(() => this.frame());
    const realDelta = this.clock.getDelta();
    const dt = Math.min(realDelta, 0.05);
    if(!this.paused){this.elapsed += dt;this.music.update(dt);}
    if (this.active) {
      const playing=!this.paused&&this.ui.menu.classList.contains('hidden');
      if(playing){this.dialogue.update(dt);this.flow.update(dt);}
      if (this.player.enabled) {
        this.player.update(dt);
        this.ui.prompt(document.pointerLockElement === this.renderer.domElement || this.player.fallbackLook ? this.interaction.update() : '');
      }
      if (this.player.enabled && this.time.update(dt)) {
        this.ui.clock(this.time.format());
        this.worldManager.refreshClocks();
      }
      if(playing){
        this.worldManager.update(dt, this.elapsed);this.body.update(dt,!!this.flow.manifestation);
        this.audio.update(this.player, dt);
        this.saveTimer+=dt;if(this.saveTimer>10&&!this.flow.busy){this.saveTimer=0;this.persist();}
      }
      this.performance.update(realDelta, this.world, this.player);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

import * as THREE from 'three';
import { distanceToSegment } from '../world/Door.js';

const EYE_HEIGHT = 1.73;
const RADIUS = 0.28;

export class PlayerController {
  constructor(camera, canvas, colliders, settings, onEscape) {
    this.camera = camera;
    this.canvas = canvas;
    this.colliders = colliders;
    this.settings = settings;
    this.onEscape = onEscape;
    this.position = new THREE.Vector3(-.5, 0, 5.8);
    this.velocity = new THREE.Vector3();
    this.keys = new Set();
    this.yaw = 2.7;
    this.pitch = 0;
    this.verticalVelocity = 0;
    this.bob = 0;
    this.enabled = false;
    this.fallbackLook = false;
    this.dragging = false;
    this.move = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(this.position.x, EYE_HEIGHT, this.position.z);
    this.camera.rotation.set(0, this.yaw, 0);
    this.onLockChange = () => {
      if (document.pointerLockElement !== canvas && this.enabled) this.onEscape();
    };
    this.onMouseMove = (event) => {
      if (!this.enabled || (document.pointerLockElement !== canvas && !(this.fallbackLook && this.dragging))) return;
      this.yaw -= event.movementX * this.settings.value.sensitivity;
      this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * this.settings.value.sensitivity, -1.42, 1.42);
    };
    this.onKeyDown = (event) => {
      if (!this.enabled || /INPUT|SELECT|TEXTAREA/.test(event.target?.tagName)) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) this.keys.add(event.code);
    };
    this.onKeyUp = (event) => this.keys.delete(event.code);
    this.onMouseDown = (event) => { if (event.target === canvas && this.fallbackLook) this.dragging = true; };
    this.onMouseUp = () => { this.dragging = false; };
    this.onBlur = () => this.clearInput();
    document.addEventListener('pointerlockchange', this.onLockChange);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('blur', this.onBlur);
  }

  destroy() {
    document.removeEventListener('pointerlockchange', this.onLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('blur', this.onBlur);
  }

  clearInput() { this.keys.clear(); this.velocity.set(0, 0, 0); this.dragging = false; }

  lock() {
    if (!this.enabled || this.fallbackLook) return;
    try {
      const request = this.canvas.requestPointerLock();
      request?.catch(() => { this.fallbackLook = true; });
    } catch { this.fallbackLook = true; }
  }

  collides(x, z) {
    for (const box of this.colliders) {
      if (box.enabled === false) continue;
      if (box.segment) {
        if (distanceToSegment(x,z,box.x1,box.z1,box.x2,box.z2) < RADIUS + box.radius) return true;
        continue;
      }
      const nearX = Math.max(box.minX, Math.min(x, box.maxX));
      const nearZ = Math.max(box.minZ, Math.min(z, box.maxZ));
      const dx = x - nearX;
      const dz = z - nearZ;
      if (dx * dx + dz * dz < RADIUS * RADIUS) return true;
    }
    return false;
  }

  update(dt) {
    if (!this.enabled || (document.pointerLockElement !== this.canvas && !this.fallbackLook)) return false;
    const speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 4.15 : 2.55;
    const x = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    const z = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    this.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    this.move.copy(this.forward).multiplyScalar(z).addScaledVector(this.right, x);
    if (this.move.lengthSq() > 1) this.move.normalize();
    const smoothing = 1 - Math.exp(-(this.move.lengthSq() ? 12 : 9) * dt);
    this.velocity.x += (this.move.x * speed - this.velocity.x) * smoothing;
    this.velocity.z += (this.move.z * speed - this.velocity.z) * smoothing;
    // Substeps keep sprinting safe against thin obstacles, including low frame rates.
    const steps = Math.max(1, Math.ceil(this.velocity.length() * dt / 0.08));
    for (let step = 0; step < steps; step++) {
      const nextX = this.position.x + this.velocity.x * dt / steps;
      if (!this.collides(nextX, this.position.z)) this.position.x = nextX;
      else this.velocity.x = 0;
      const nextZ = this.position.z + this.velocity.z * dt / steps;
      if (!this.collides(this.position.x, nextZ)) this.position.z = nextZ;
      else this.velocity.z = 0;
    }
    this.verticalVelocity = Math.max(-20, this.verticalVelocity - 18 * dt);
    this.position.y = Math.max(0, this.position.y + this.verticalVelocity * dt);
    if (this.position.y === 0) this.verticalVelocity = 0;
    const moving = this.velocity.lengthSq() > 0.16;
    if (moving) this.bob += dt * (speed > 3 ? 11 : 8);
    this.camera.position.set(this.position.x, this.position.y + EYE_HEIGHT + (moving && this.settings.value.headBob ? Math.sin(this.bob) * 0.012 : 0), this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0);
    return moving;
  }
}

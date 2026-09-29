import * as THREE from 'three';

/**
 * InputManager.js - Suporte Unificado a Teclado e Joystick Virtual Mobile
 */

export class InputManager {
  constructor() {
    this.moveVector = new THREE.Vector2(0, 0);
    this.actionPressed = false;
    this.keys = {};

    this.onPauseCallback = null;
    this.onZoomCallback = null;
    this.onMuteCallback = null;

    this.initKeyboard();
    this.initTouchJoystick();
    this.detectDevice();
  }

  detectDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
      if (isTouch) {
        mobileControls.classList.remove('hidden');
      } else {
        mobileControls.classList.add('hidden');
      }
    }
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Escape' && this.onPauseCallback) {
        this.onPauseCallback();
      }
      if (e.code === 'KeyZ' && this.onZoomCallback) {
        this.onZoomCallback();
      }
      if (e.code === 'KeyM' && this.onMuteCallback) {
        this.onMuteCallback();
      }
      if (e.code === 'Space') {
        this.actionPressed = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.actionPressed = false;
      }
    });
  }

  initTouchJoystick() {
    const zone = document.getElementById('joystick-zone');
    const thumb = document.getElementById('joystick-thumb');
    const actionBtn = document.getElementById('btn-mobile-action');

    if (!zone || !thumb) return;

    let touchId = null;
    let startX = 0;
    let startY = 0;
    const maxRadius = 45;

    zone.addEventListener('touchstart', (e) => {
      if (touchId === null) {
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        const rect = zone.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }
    }, { passive: true });

    const handleMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const clampedDist = Math.min(dist, maxRadius);
          const angle = Math.atan2(dy, dx);

          const thumbX = Math.cos(angle) * clampedDist;
          const thumbY = Math.sin(angle) * clampedDist;

          thumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

          // Vetor normalizado de movimento
          const normMag = clampedDist / maxRadius;
          this.moveVector.set(Math.cos(angle) * normMag, Math.sin(angle) * normMag);
          break;
        }
      }
    };

    const handleEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          thumb.style.transform = 'translate(0px, 0px)';
          this.moveVector.set(0, 0);
          break;
        }
      }
    };

    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });
    window.addEventListener('touchcancel', handleEnd, { passive: true });

    if (actionBtn) {
      actionBtn.addEventListener('touchstart', () => { this.actionPressed = true; }, { passive: true });
      actionBtn.addEventListener('touchend', () => { this.actionPressed = false; }, { passive: true });
    }
  }

  getMovementDirection() {
    let x = 0;
    let z = 0;

    // Teclas WASD / Setas
    if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    // Se estiver usando joystick mobile
    if (this.moveVector.lengthSq() > 0.01) {
      x = this.moveVector.x;
      z = this.moveVector.y;
    }

    const dir = new THREE.Vector3(x, 0, z);
    if (dir.lengthSq() > 1) {
      dir.normalize();
    }
    return dir;
  }
}

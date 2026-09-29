import * as THREE from 'three';

/**
 * ParticleSystem.js - Efeitos Visuais 3D Encantadores:
 * Partículas de coleta, estrelas, corações, pegadas temporárias do gatinho e confetes
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.footprints = [];
    this.footprintEnabled = true;

    // Canvas de textura para pegadinha de gato fofa
    this.pawTexture = this.createPawTexture();
    this.starTexture = this.createStarTexture();
    this.heartTexture = this.createHeartTexture();
  }

  createPawTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ff8fb1';

    // Almofadinha principal
    ctx.beginPath();
    ctx.ellipse(32, 40, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Dedinhos
    const toes = [
      { x: 18, y: 22, r: 5 },
      { x: 27, y: 16, r: 5.5 },
      { x: 37, y: 16, r: 5.5 },
      { x: 46, y: 22, r: 5 }
    ];

    toes.forEach(toe => {
      ctx.beginPath();
      ctx.arc(toe.x, toe.y, toe.r, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    const cx = 32, cy = 32, spikes = 4, outer = 26, inner = 10;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outer;
      let y = cy + Math.sin(rot) * outer;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * inner;
      y = cy + Math.sin(rot) * inner;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outer);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createHeartTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ff4081';
    ctx.beginPath();
    const d = 28;
    const k = 32;
    ctx.moveTo(k, k + d / 4);
    ctx.bezierCurveTo(k, k, k - d / 2, k - d / 2, k - d / 2, k);
    ctx.bezierCurveTo(k - d / 2, k + d / 3, k, k + d * 0.7, k, k + d * 0.9);
    ctx.bezierCurveTo(k, k + d * 0.7, k + d / 2, k + d / 3, k + d / 2, k);
    ctx.bezierCurveTo(k + d / 2, k - d / 2, k, k, k, k + d / 4);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  /** Adiciona pegadinha fofa do gato no chão */
  addFootprint(pos, rotationY) {
    if (!this.footprintEnabled) return;

    const material = new THREE.MeshBasicMaterial({
      map: this.pawTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(0.35, 0.35);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -rotationY + Math.PI;
    mesh.position.set(pos.x, 0.03, pos.z);

    this.scene.add(mesh);
    this.footprints.push({
      mesh,
      life: 3.5, // Segundos até sumir
      maxLife: 3.5
    });
  }

  /** Explosão de estrelinhas e brilho ao coletar item */
  emitCollectBurst(pos, isFish = false) {
    const count = isFish ? 14 : 8;
    const color = isFish ? '#00e5ff' : '#ffca28';

    for (let i = 0; i < count; i++) {
      const spriteMaterial = new THREE.SpriteMaterial({
        map: isFish ? this.heartTexture : this.starTexture,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.95
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.4, 0.4, 0.4);
      sprite.position.copy(pos);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.2;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        1.8 + Math.random() * 2.5,
        Math.sin(angle) * speed
      );

      this.scene.add(sprite);
      this.particles.push({
        mesh: sprite,
        velocity,
        life: 0.8,
        maxLife: 0.8,
        gravity: 4.5
      });
    }
  }

  /** Chuva de confetes coloridos na tela de vitória */
  emitConfetti(centerPos, count = 75) {
    const colors = [0xff6b8b, 0xffd166, 0x06d6a0, 0x118ab2, 0xff70a6, 0xa78bfa];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.2, 0.35);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        centerPos.x + (Math.random() - 0.5) * 8,
        centerPos.y + 4 + Math.random() * 3,
        centerPos.z + (Math.random() - 0.5) * 8
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        -1.2 - Math.random() * 1.5,
        (Math.random() - 0.5) * 2
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity,
        life: 3.0,
        maxLife: 3.0,
        rotSpeed: new THREE.Vector3(
          Math.random() * 8,
          Math.random() * 8,
          Math.random() * 8
        )
      });
    }
  }

  /** Atualização de todas as partículas no frame */
  update(delta) {
    // 1. Partículas no ar
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Aplica gravidade e velocidade
      if (p.gravity) {
        p.velocity.y -= p.gravity * delta;
      }
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Rotação
      if (p.rotSpeed) {
        p.mesh.rotation.x += p.rotSpeed.x * delta;
        p.mesh.rotation.y += p.rotSpeed.y * delta;
        p.mesh.rotation.z += p.rotSpeed.z * delta;
      }

      // Fade out
      const progress = p.life / p.maxLife;
      if (p.mesh.material) {
        p.mesh.material.opacity = Math.max(0, progress);
      }
    }

    // 2. Pegadinhas do chão
    for (let i = this.footprints.length - 1; i >= 0; i--) {
      const fp = this.footprints[i];
      fp.life -= delta;

      if (fp.life <= 0) {
        this.scene.remove(fp.mesh);
        if (fp.mesh.geometry) fp.mesh.geometry.dispose();
        if (fp.mesh.material) fp.mesh.material.dispose();
        this.footprints.splice(i, 1);
        continue;
      }

      const progress = fp.life / fp.maxLife;
      fp.mesh.material.opacity = progress * 0.7;
    }
  }

  clear() {
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
      if (p.mesh.geometry) p.mesh.geometry.dispose();
      if (p.mesh.material) p.mesh.material.dispose();
    });
    this.particles = [];

    this.footprints.forEach(fp => {
      this.scene.remove(fp.mesh);
      if (fp.mesh.geometry) fp.mesh.geometry.dispose();
      if (fp.mesh.material) fp.mesh.material.dispose();
    });
    this.footprints = [];
  }
}

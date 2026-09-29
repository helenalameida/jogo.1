import * as THREE from 'three';

/**
 * PowerUp.js - Os 5 Super Power-Ups do Jogo
 * Peixe Dourado, Leite Mágico, Bolinha de Lã, Sininho e Caixa de Papelão
 */

export class PowerUp {
  constructor(scene, type = 'golden_fish', x = 0, z = 0) {
    this.scene = scene;
    this.type = type;
    this.group = new THREE.Group();
    this.group.position.set(x, 0.45, z);

    this.baseY = 0.45;
    this.radius = 0.42;
    this.collected = false;

    this.setupProperties();
    this.createModel();
    this.createGlowRing();

    this.scene.add(this.group);
  }

  setupProperties() {
    switch (this.type) {
      case 'golden_fish':
        this.name = 'PEIXE DOURADO';
        this.icon = '🐟';
        this.duration = 6.0;
        this.color = 0xffd700;
        this.desc = '+60% Super Velocidade Turbo!';
        break;
      case 'magic_milk':
        this.name = 'LEITE MÁGICO';
        this.icon = '🥛';
        this.duration = 7.0;
        this.color = 0x80deea;
        this.desc = 'Bolha de Invulnerabilidade Total!';
        break;
      case 'yarn_ball':
        this.name = 'BOLINHA DE LÃ';
        this.icon = '🧶';
        this.duration = 6.5;
        this.color = 0xff4081;
        this.desc = 'Ratinhos Ficaram Tontos!';
        break;
      case 'bell':
        this.name = 'SININHO';
        this.icon = '🔔';
        this.duration = 8.0;
        this.color = 0xffeb3b;
        this.desc = 'Localização de Todos Revelada!';
        break;
      case 'cardboard_box':
      default:
        this.name = 'CAIXA DE PAPELÃO';
        this.icon = '📦';
        this.duration = 6.0;
        this.color = 0xbcaaa4;
        this.desc = 'Camuflagem e Furtividade!';
        break;
    }
  }

  createModel() {
    if (this.type === 'golden_fish') {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.7,
        roughness: 0.2
      });

      this.mesh = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 12), mat);
      body.rotation.z = Math.PI / 2;
      this.mesh.add(body);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 4), mat);
      tail.rotation.z = -Math.PI / 2;
      tail.position.x = -0.28;
      this.mesh.add(tail);

      this.group.add(this.mesh);
    } else if (this.type === 'magic_milk') {
      const bottleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2
      });
      const capMat = new THREE.MeshLambertMaterial({ color: 0x4fc3f7 });

      this.mesh = new THREE.Group();
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.38, 12), bottleMat);
      this.mesh.add(bottle);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.1, 10), bottleMat);
      neck.position.y = 0.22;
      this.mesh.add(neck);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 10), capMat);
      cap.position.y = 0.28;
      this.mesh.add(cap);

      this.group.add(this.mesh);
    } else if (this.type === 'yarn_ball') {
      const mat = new THREE.MeshLambertMaterial({ color: 0xff4081 });
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), mat);

      // Fios de lã enrolados
      const stripeMat = new THREE.MeshLambertMaterial({ color: 0xff80ab });
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 16), stripeMat);
      stripe.rotation.x = Math.PI / 3;
      this.mesh.add(stripe);

      this.group.add(this.mesh);
    } else if (this.type === 'bell') {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffea00,
        metalness: 0.8,
        roughness: 0.2
      });

      this.mesh = new THREE.Group();
      const bellGeo = new THREE.CylinderGeometry(0.06, 0.22, 0.28, 12);
      const bell = new THREE.Mesh(bellGeo, mat);
      this.mesh.add(bell);

      const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat);
      clapper.position.y = -0.15;
      this.mesh.add(clapper);

      this.group.add(this.mesh);
    } else {
      // Caixa de papelão com desenho fofinho
      const boxMat = new THREE.MeshLambertMaterial({ color: 0xd7ba89 });
      this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), boxMat);
      this.group.add(this.mesh);
    }
  }

  createGlowRing() {
    const ringGeo = new THREE.RingGeometry(0.35, 0.48, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    this.glowRing = new THREE.Mesh(ringGeo, ringMat);
    this.glowRing.rotation.x = -Math.PI / 2;
    this.glowRing.position.y = -0.4;
    this.group.add(this.glowRing);
  }

  update(delta, time) {
    if (this.collected) return;

    this.group.position.y = this.baseY + Math.sin(time * 3) * 0.1;
    this.group.rotation.y += delta * 2.2;

    if (this.glowRing) {
      const s = 1.0 + Math.sin(time * 4) * 0.18;
      this.glowRing.scale.set(s, s, s);
    }
  }

  destroy() {
    this.collected = true;
    this.scene.remove(this.group);
  }
}

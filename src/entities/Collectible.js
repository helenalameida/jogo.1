import * as THREE from 'three';

/**
 * Collectible.js - Petiscos, Peixinhos e Brinquedos 3D Flutuantes
 */

export class Collectible {
  constructor(scene, type = 'snack', x = 0, z = 0) {
    this.scene = scene;
    this.type = type;
    this.group = new THREE.Group();
    this.group.position.set(x, 0.35, z);

    this.baseY = 0.35;
    this.rotationSpeed = 2.0;
    this.floatSpeed = 3.5;
    this.floatAmplitude = 0.08;
    this.floatPhase = Math.random() * Math.PI * 2;
    this.radius = 0.32;
    this.collected = false;

    this.setupProperties();
    this.createModel();

    this.scene.add(this.group);
  }

  setupProperties() {
    switch (this.type) {
      case 'fish':
        this.points = 25;
        this.color = 0x29b6f6;
        break;
      case 'toy':
        this.points = 50;
        this.color = 0xab47bc;
        break;
      case 'paw':
        this.points = 100;
        this.color = 0xffd54f;
        break;
      case 'snack':
      default:
        this.points = 10;
        this.color = 0xffb74d;
        break;
    }
  }

  createModel() {
    const mat = new THREE.MeshLambertMaterial({ color: this.color });

    if (this.type === 'snack') {
      // Biscoitinho / Petisco em formato de osso ou coraçãozinho
      const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.rotation.x = Math.PI / 2;
      this.group.add(this.mesh);

      // Pequenas bolinhas nas pontas para parecer um petisco fofo
      const dot1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat);
      dot1.position.set(-0.12, 0, 0);
      this.mesh.add(dot1);
      const dot2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat);
      dot2.position.set(0.12, 0, 0);
      this.mesh.add(dot2);
    } else if (this.type === 'fish') {
      // Peixinho Azul estilizado
      this.mesh = new THREE.Group();

      const bodyGeo = new THREE.ConeGeometry(0.14, 0.32, 12);
      const body = new THREE.Mesh(bodyGeo, mat);
      body.rotation.z = Math.PI / 2;
      this.mesh.add(body);

      // Cauda do peixe
      const tailGeo = new THREE.ConeGeometry(0.12, 0.16, 4);
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.rotation.z = -Math.PI / 2;
      tail.position.x = -0.22;
      this.mesh.add(tail);

      // Olhinho do peixe
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      eye.position.set(0.1, 0.05, 0.09);
      this.mesh.add(eye);

      this.group.add(this.mesh);
    } else if (this.type === 'toy') {
      // Brinquedinho de corda
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), mat);

      // Chavezinha de corda no topo
      const keyMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.6 });
      const key = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), keyMat);
      key.position.y = 0.2;
      this.mesh.add(key);

      this.group.add(this.mesh);
    } else {
      // Patinha Dourada Brilhante
      const pawMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.4, roughness: 0.2 });
      this.mesh = new THREE.Group();

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16), pawMat);
      this.mesh.add(pad);

      for (let i = 0; i < 4; i++) {
        const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), pawMat);
        const angle = -0.7 + i * 0.46;
        toe.position.set(Math.sin(angle) * 0.2, 0, Math.cos(angle) * 0.2);
        this.mesh.add(toe);
      }
      this.group.add(this.mesh);
    }
  }

  update(delta, time) {
    if (this.collected) return;

    // Flutuação suave
    this.group.position.y = this.baseY + Math.sin(time * this.floatSpeed + this.floatPhase) * this.floatAmplitude;

    // Rotação contínua
    this.group.rotation.y += delta * this.rotationSpeed;
  }

  destroy() {
    this.collected = true;
    this.scene.remove(this.group);
  }
}

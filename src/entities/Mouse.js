import * as THREE from 'three';

/**
 * Mouse.js - Os 4 Ratinhos Adoráveis (Inimigos Carismáticos)
 * Pinky (Rosa), Bluey (Azul), Sunny (Amarelo) e Violet (Roxo)
 */

export class Mouse {
  constructor(scene, type = 'pink') {
    this.scene = scene;
    this.type = type;
    this.group = new THREE.Group();

    // Definições de Personalidade
    this.setupPersonality();

    this.radius = 0.38; // Raio de colisão
    this.walkCycle = 0;
    this.currentDirection = new THREE.Vector3(0, 0, 1);
    this.targetRotation = 0;
    this.isDizzy = false;
    this.dizzyTimer = 0;

    // Timer de decisão de rota
    this.decisionTimer = 0;
    this.decisionInterval = 0.25;

    this.createModel();
    this.createDizzyStars();
    this.createBeaconMarker();

    this.scene.add(this.group);
  }

  setupPersonality() {
    switch (this.type) {
      case 'pink':
        this.name = 'Pinky';
        this.color = 0xff80ab;
        this.speed = 3.6; // Rápido e focado
        this.aiType = 'chaser';
        break;
      case 'blue':
        this.name = 'Bluey';
        this.color = 0x4fc3f7;
        this.speed = 2.9; // Mais calmo, tenta interceptar à frente
        this.aiType = 'ambush';
        break;
      case 'yellow':
        this.name = 'Sunny';
        this.color = 0xfff176;
        this.speed = 3.2; // Imprevisível, muda de direção repentinamente
        this.aiType = 'random';
        break;
      case 'purple':
      default:
        this.name = 'Violet';
        this.color = 0xba68c8;
        this.speed = 3.3; // Esperto, atalhos
        this.aiType = 'smart';
        break;
    }
  }

  createModel() {
    const mouseMat = new THREE.MeshLambertMaterial({ color: this.color });
    const innerEarMat = new THREE.MeshLambertMaterial({ color: 0xffb2dd });
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pawMat = new THREE.MeshLambertMaterial({ color: 0xffccd5 });

    // 1. Corpo em gota / oval fofo
    const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    this.body = new THREE.Mesh(bodyGeo, mouseMat);
    this.body.scale.set(0.9, 0.8, 1.25);
    this.body.position.y = 0.28;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Focinho afilado fofo
    const snoutGeo = new THREE.ConeGeometry(0.14, 0.24, 12);
    const snout = new THREE.Mesh(snoutGeo, mouseMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.04, 0.32);
    this.body.add(snout);

    // Narizinho
    const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.04, 0.44);
    this.body.add(nose);

    // Olhos brilhantes de miçanga
    const createEye = (x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), eyeMat);
      eye.position.set(x, 0.12, 0.22);
      this.body.add(eye);

      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), whiteMat);
      shine.position.set(x > 0 ? 0.015 : -0.015, 0.02, 0.035);
      eye.add(shine);
    };
    createEye(-0.14);
    createEye(0.14);

    // Orelhas Grandes e Arredondadas (muito fofas!)
    const earGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16);
    const innerEarGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.035, 14);

    const createEar = (x, rotZ) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(x, 0.38, 0.05);
      earPivot.rotation.set(Math.PI / 3, 0, rotZ);

      const ear = new THREE.Mesh(earGeo, mouseMat);
      ear.castShadow = true;
      earPivot.add(ear);

      const innerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
      innerEar.position.y = 0.005;
      earPivot.add(innerEar);

      this.body.add(earPivot);
    };
    createEar(-0.22, 0.35);
    createEar(0.22, -0.35);

    // Cauda longa e flexível
    this.tailPivot = new THREE.Group();
    this.tailPivot.position.set(0, 0.12, -0.36);
    this.group.add(this.tailPivot);

    const tailGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.45, 8);
    const tail = new THREE.Mesh(tailGeo, pawMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.1, -0.18);
    this.tailPivot.add(tail);

    // Patinhas curtas
    this.paws = [];
    const pawGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const pawPositions = [
      { x: -0.16, z: 0.16 },
      { x: 0.16, z: 0.16 },
      { x: -0.16, z: -0.18 },
      { x: 0.16, z: -0.18 }
    ];

    pawPositions.forEach((pos, idx) => {
      const p = new THREE.Mesh(pawGeo, pawMat);
      p.position.set(pos.x, 0.07, pos.z);
      this.group.add(p);
      this.paws.push({ mesh: p, idx });
    });
  }

  createDizzyStars() {
    this.dizzyGroup = new THREE.Group();
    this.dizzyGroup.position.y = 0.75;

    const starMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    for (let i = 0; i < 3; i++) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), starMat);
      const angle = (i / 3) * Math.PI * 2;
      star.position.set(Math.cos(angle) * 0.28, 0, Math.sin(angle) * 0.28);
      this.dizzyGroup.add(star);
    }

    this.dizzyGroup.visible = false;
    this.group.add(this.dizzyGroup);
  }

  createBeaconMarker() {
    // Halo visível no modo Sininho (sonar)
    const haloGeo = new THREE.RingGeometry(0.4, 0.55, 20);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.beaconMesh = new THREE.Mesh(haloGeo, haloMat);
    this.beaconMesh.rotation.x = -Math.PI / 2;
    this.beaconMesh.position.y = 0.05;
    this.beaconMesh.visible = false;
    this.group.add(this.beaconMesh);
  }

  setPosition(x, z) {
    this.group.position.set(x, 0, z);
  }

  setDizzy(duration = 5.0) {
    this.isDizzy = true;
    this.dizzyTimer = duration;
    this.dizzyGroup.visible = true;
  }

  setBeaconVisible(visible) {
    this.beaconMesh.visible = visible;
  }

  /**
   * Decide a direção de movimento do ratinho com base na personalidade
   */
  updateAI(delta, catPos, isCatStealth, levelCollisionChecker) {
    // Se estiver tonto pela Bolinha de Lã
    if (this.isDizzy) {
      this.dizzyTimer -= delta;
      if (this.dizzyTimer <= 0) {
        this.isDizzy = false;
        this.dizzyGroup.visible = false;
      } else {
        // Gira no próprio eixo de forma engraçada
        this.group.rotation.y += delta * 6;
        this.dizzyGroup.rotation.y += delta * 8;
        return;
      }
    }

    this.decisionTimer -= delta;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = this.decisionInterval;
      this.chooseDirection(catPos, isCatStealth, levelCollisionChecker);
    }

    // Movimentação contínua
    const moveDist = this.speed * delta;
    const nextPos = this.group.position.clone().addScaledVector(this.currentDirection, moveDist);

    if (!levelCollisionChecker(nextPos.x, nextPos.z, this.radius)) {
      this.group.position.copy(nextPos);
    } else {
      // Se bateu na parede, escolhe direção imediatamente
      this.chooseDirection(catPos, isCatStealth, levelCollisionChecker, true);
    }

    // Rotação suave
    this.targetRotation = Math.atan2(this.currentDirection.x, this.currentDirection.z);
    let diff = this.targetRotation - this.group.rotation.y;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.group.rotation.y += diff * 12 * delta;

    // Animações
    this.walkCycle += delta * (this.speed * 4);
    this.body.position.y = 0.28 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.03;
    this.tailPivot.rotation.y = Math.sin(this.walkCycle) * 0.45;

    this.paws.forEach(paw => {
      const offset = (paw.idx % 2 === 0) ? 0 : Math.PI;
      paw.mesh.position.y = 0.07 + Math.max(0, Math.sin(this.walkCycle + offset) * 0.04);
    });

    if (this.beaconMesh.visible) {
      this.beaconMesh.scale.setScalar(1 + Math.sin(this.walkCycle * 2) * 0.15);
    }
  }

  chooseDirection(catPos, isCatStealth, levelCollisionChecker, forced = false) {
    const directions = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0)
    ];

    // Filtra direções válidas (sem parede)
    const validDirs = directions.filter(dir => {
      // Não inverte direção 180° a menos que forçado
      if (!forced && dir.dot(this.currentDirection) < -0.8) return false;

      const testPos = this.group.position.clone().addScaledVector(dir, 0.6);
      return !levelCollisionChecker(testPos.x, testPos.z, this.radius);
    });

    if (validDirs.length === 0) {
      // Beco sem saída: inverte
      this.currentDirection.negate();
      return;
    }

    // Alvo dependendo da IA e do estado de stealth
    let target = catPos.clone();
    if (isCatStealth) {
      // Gato invisível na caixa: ratos perdem o rastro
      this.currentDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
      return;
    }

    if (this.aiType === 'chaser') {
      // Pinky: vai direto ao gato
      target = catPos;
    } else if (this.aiType === 'ambush') {
      // Bluey: tenta prever 2 unidades à frente
      target = catPos.clone().add(this.currentDirection.clone().multiplyScalar(2));
    } else if (this.aiType === 'random') {
      // Sunny: 60% chance de escolha aleatória
      if (Math.random() < 0.6) {
        this.currentDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
        return;
      }
    } else {
      // Violet (Smart): escolhe a direção que mais aproxima
      target = catPos;
    }

    // Escolhe a direção válida com menor distância ao alvo
    let bestDir = validDirs[0];
    let bestDist = Infinity;

    validDirs.forEach(dir => {
      const pos = this.group.position.clone().add(dir);
      const dist = pos.distanceTo(target);
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = dir;
      }
    });

    this.currentDirection = bestDir;
  }
}

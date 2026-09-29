import * as THREE from 'three';

/**
 * Cat.js - O Gatinho Adorável (Protagonista 3D Customizável)
 * Suporte a skins de pelo, cores de olhos, penteados, roupas, sapatos e acessórios 3D
 */

export class Cat {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Estado e Movimentação
    this.speed = 4.8;
    this.baseSpeed = 4.8;
    this.turboMultiplier = 1.6;
    this.isTurbo = false;
    this.isInvulnerable = false;
    this.isStealth = false;
    this.radius = 0.45; // Raio de colisão

    // Animação
    this.walkCycle = 0;
    this.isMoving = false;
    this.direction = new THREE.Vector3(0, 0, 1);
    this.targetRotation = 0;
    this.spinTimer = 0;

    // Configuração de Customização Padrão
    this.customConfig = {
      fur: 'ginger',
      eyes: 'blue',
      hair: 'none',
      clothes: 'none',
      pants: 'none',
      shoes: 'none',
      accessory: 'none'
    };

    // Componentes visuais
    this.legs = [];
    this.tailSegments = [];
    this.eyeMeshes = [];
    this.clothingGroup = new THREE.Group();
    this.hairGroup = new THREE.Group();
    this.accessoryGroup = new THREE.Group();
    this.shoeMeshes = [];

    this.createModel();
    this.createShieldBubble();
    this.createCardboardBox();

    // Aplica customização inicial
    this.applyCustomization(this.customConfig);

    this.scene.add(this.group);
  }

  createModel() {
    this.furMat = new THREE.MeshLambertMaterial({ color: 0xffa372 });
    this.bellyMat = new THREE.MeshLambertMaterial({ color: 0xfff4e6 });
    this.pinkMat = new THREE.MeshLambertMaterial({ color: 0xff8fb1 });
    this.darkMat = new THREE.MeshBasicMaterial({ color: 0x2d2138 });
    this.whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.bellMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.6, roughness: 0.3 });

    // 1. Corpo Redondinho e Fofo
    const bodyGeo = new THREE.SphereGeometry(0.38, 20, 20);
    this.body = new THREE.Mesh(bodyGeo, this.furMat);
    this.body.scale.set(1.0, 0.95, 1.25);
    this.body.position.y = 0.42;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Barriguinha creme
    const bellyGeo = new THREE.SphereGeometry(0.32, 16, 16);
    this.belly = new THREE.Mesh(bellyGeo, this.bellyMat);
    this.belly.scale.set(0.85, 0.75, 1.15);
    this.belly.position.set(0, -0.05, 0.1);
    this.body.add(this.belly);

    // Contêiner de roupas fixadas no tronco
    this.body.add(this.clothingGroup);

    // 2. Cabeça Grande e Proporcionalmente Fofa
    const headGeo = new THREE.SphereGeometry(0.36, 20, 20);
    this.head = new THREE.Mesh(headGeo, this.furMat);
    this.head.scale.set(1.15, 1.0, 1.05);
    this.head.position.set(0, 0.68, 0.32);
    this.head.castShadow = true;
    this.group.add(this.head);

    // Grupos de Cabelo e Acessórios de cabeça
    this.head.add(this.hairGroup);
    this.head.add(this.accessoryGroup);

    // Bochechas fofas
    const cheekGeo = new THREE.SphereGeometry(0.14, 12, 12);
    this.leftCheek = new THREE.Mesh(cheekGeo, this.bellyMat);
    this.leftCheek.position.set(-0.16, -0.1, 0.24);
    this.head.add(this.leftCheek);

    this.rightCheek = new THREE.Mesh(cheekGeo, this.bellyMat);
    this.rightCheek.position.set(0.16, -0.1, 0.24);
    this.head.add(this.rightCheek);

    // Focinho e Narizinho Rosa
    const noseGeo = new THREE.ConeGeometry(0.045, 0.04, 4);
    this.nose = new THREE.Mesh(noseGeo, this.pinkMat);
    this.nose.rotation.x = Math.PI;
    this.nose.position.set(0, -0.04, 0.35);
    this.head.add(this.nose);

    // Olhos com Íris Personalizáveis
    this.leftIrisMat = new THREE.MeshBasicMaterial({ color: 0x03a9f4 });
    this.rightIrisMat = new THREE.MeshBasicMaterial({ color: 0x03a9f4 });

    const createEye = (x, isLeft) => {
      const eyePivot = new THREE.Group();
      eyePivot.position.set(x, 0.06, 0.3);

      // Fundo escuro do olho
      const eyeBase = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), this.darkMat);
      eyeBase.scale.set(1, 1.25, 0.5);
      eyePivot.add(eyeBase);

      // Íris colorida brilhante
      const irisMat = isLeft ? this.leftIrisMat : this.rightIrisMat;
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), irisMat);
      iris.scale.set(1, 1.2, 0.4);
      iris.position.set(0, 0, 0.02);
      eyePivot.add(iris);

      // Pupila
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), this.darkMat);
      pupil.position.set(0, 0, 0.045);
      eyePivot.add(pupil);

      // Brilho do olhar (catchlight)
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), this.whiteMat);
      shine.position.set(0.02, 0.035, 0.05);
      eyePivot.add(shine);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), this.whiteMat);
      shine2.position.set(-0.022, -0.02, 0.05);
      eyePivot.add(shine2);

      this.head.add(eyePivot);
      this.eyeMeshes.push(eyePivot);
    };
    createEye(-0.16, true);
    createEye(0.16, false);

    // Orelhas Pontudinhas e Fofas
    const earGeo = new THREE.ConeGeometry(0.14, 0.24, 4);
    const innerEarGeo = new THREE.ConeGeometry(0.09, 0.16, 4);

    const createEar = (x, rotZ) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(x, 0.3, 0.05);
      earGroup.rotation.set(0.1, 0, rotZ);

      const ear = new THREE.Mesh(earGeo, this.furMat);
      ear.castShadow = true;
      earGroup.add(ear);

      const innerEar = new THREE.Mesh(innerEarGeo, this.pinkMat);
      innerEar.position.set(0, -0.01, 0.03);
      earGroup.add(innerEar);

      this.head.add(earGroup);
      return earGroup;
    };
    this.leftEar = createEar(-0.24, 0.35);
    this.rightEar = createEar(0.24, -0.35);

    // Coleira Vermelha com Guizo Dourado
    this.collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.035, 8, 20),
      new THREE.MeshLambertMaterial({ color: 0xff3366 })
    );
    this.collar.position.set(0, 0.44, 0.22);
    this.collar.rotation.x = Math.PI / 2.3;
    this.group.add(this.collar);

    this.bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), this.bellMat);
    this.bell.position.set(0, 0.38, 0.45);
    this.group.add(this.bell);

    // 3. Patinhas Curtinhas
    const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.22, 10);
    const pawGeo = new THREE.SphereGeometry(0.09, 10, 10);

    const legPositions = [
      { x: -0.19, z: 0.22 },  // Front-Left (0)
      { x: 0.19, z: 0.22 },   // Front-Right (1)
      { x: -0.19, z: -0.25 }, // Back-Left (2)
      { x: 0.19, z: -0.25 }   // Back-Right (3)
    ];

    legPositions.forEach((pos, idx) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(pos.x, 0.22, pos.z);

      const leg = new THREE.Mesh(legGeo, this.furMat);
      leg.position.y = -0.06;
      leg.castShadow = true;
      legPivot.add(leg);

      const paw = new THREE.Mesh(pawGeo, this.bellyMat);
      paw.scale.set(1.0, 0.7, 1.2);
      paw.position.set(0, -0.14, 0.03);
      paw.castShadow = true;
      legPivot.add(paw);

      // Contêiner de sapatos preso no pivô da perninha (acompanha caminhada!)
      const shoeGroup = new THREE.Group();
      legPivot.add(shoeGroup);

      this.group.add(legPivot);
      this.legs.push({ pivot: legPivot, baseZ: pos.z, idx, leg, paw, shoeGroup });
    });

    // 4. Cauda Fofinha e Animada
    this.tailPivot = new THREE.Group();
    this.tailPivot.position.set(0, 0.38, -0.42);
    this.group.add(this.tailPivot);

    let parent = this.tailPivot;
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05 - i * 0.007, 0.055 - i * 0.007, 0.14, 8),
        i === 3 ? this.bellyMat : this.furMat
      );
      seg.position.set(0, 0.08, -0.05);
      seg.rotation.x = -0.45;
      parent.add(seg);
      this.tailSegments.push(seg);
      parent = seg;
    }
  }

  createShieldBubble() {
    const shieldGeo = new THREE.SphereGeometry(0.9, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x80deea,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.8
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 0.5;
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);
  }

  createCardboardBox() {
    this.boxGroup = new THREE.Group();
    this.boxGroup.position.y = 0.42;

    const boxMat = new THREE.MeshLambertMaterial({ color: 0xd7ba89 });
    const tapeMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 });

    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 1.1), boxMat);
    boxMesh.castShadow = true;
    this.boxGroup.add(boxMesh);

    const tapeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.12, 0.12), tapeMat);
    tapeMesh.position.y = 0.35;
    this.boxGroup.add(tapeMesh);

    this.boxGroup.visible = false;
    this.group.add(this.boxGroup);
  }

  /**
   * Aplicação em tempo real de personalização (Pelo, Olhos, Cabelo, Roupas, Sapatos, Acessórios)
   */
  applyCustomization(config) {
    this.customConfig = { ...this.customConfig, ...config };

    // 1. Pelo & Cores
    this.updateFurSkin(this.customConfig.fur);

    // 2. Cor dos Olhos
    this.updateEyes(this.customConfig.eyes);

    // 3. Penteado / Cabelo
    this.updateHair(this.customConfig.hair);

    // 4. Roupas
    this.updateClothes(this.customConfig.clothes, this.customConfig.pants);

    // 5. Sapatos / Meias
    this.updateShoes(this.customConfig.shoes);

    // 6. Acessórios Extras
    this.updateAccessory(this.customConfig.accessory);
  }

  updateFurSkin(skinType) {
    let furHex = 0xffa372;
    let bellyHex = 0xfff4e6;

    switch (skinType) {
      case 'white':
        furHex = 0xffffff;
        bellyHex = 0xfff0f5;
        break;
      case 'black':
        furHex = 0x2b2b2b;
        bellyHex = 0xffffff;
        break;
      case 'calico':
        furHex = 0xe08e6d;
        bellyHex = 0xfff3e0;
        break;
      case 'gray':
        furHex = 0x90a4ae;
        bellyHex = 0xeceff1;
        break;
      case 'siamese':
        furHex = 0xede0d4;
        bellyHex = 0x5d4037;
        break;
      case 'ginger':
      default:
        furHex = 0xffa372;
        bellyHex = 0xfff4e6;
        break;
    }

    this.furMat.color.setHex(furHex);
    this.bellyMat.color.setHex(bellyHex);
  }

  updateEyes(eyeType) {
    const colors = {
      blue: 0x03a9f4,
      green: 0x2e7d32,
      amber: 0xffb300,
      pink: 0xf06292,
      purple: 0x8e24aa
    };

    if (eyeType === 'hetero') {
      this.leftIrisMat.color.setHex(0x00b0ff); // Azul
      this.rightIrisMat.color.setHex(0xffab00); // Dourado
    } else {
      const hex = colors[eyeType] || 0x03a9f4;
      this.leftIrisMat.color.setHex(hex);
      this.rightIrisMat.color.setHex(hex);
    }
  }

  updateHair(hairType) {
    this.clearGroup(this.hairGroup);
    if (!hairType || hairType === 'none') return;

    if (hairType === 'tuft') {
      // Topete fofinho
      const tuftMat = new THREE.MeshLambertMaterial({ color: 0xff8a65 });
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 6), tuftMat);
      tuft.position.set(0, 0.38, 0.12);
      tuft.rotation.x = -0.3;
      tuft.castShadow = true;
      this.hairGroup.add(tuft);
    } else if (hairType === 'bangs') {
      // Franjinha Kawaii
      const bangMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
      for (let i = 0; i < 3; i++) {
        const strand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), bangMat);
        strand.scale.set(0.8, 1.2, 0.4);
        strand.position.set(-0.12 + i * 0.12, 0.26, 0.28);
        strand.rotation.z = (i - 1) * 0.2;
        this.hairGroup.add(strand);
      }
    } else if (hairType === 'mohawk') {
      // Moicano Punk Pastel
      const mohawkMat = new THREE.MeshLambertMaterial({ color: 0xba68c8 });
      for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 5), mohawkMat);
        spike.position.set(0, 0.38 + i * 0.02, 0.16 - i * 0.1);
        spike.rotation.x = -0.15;
        this.hairGroup.add(spike);
      }
    } else if (hairType === 'bow') {
      // Laço de cabelo no topo
      const bowMat = new THREE.MeshLambertMaterial({ color: 0xff4081 });
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bowMat);
      knot.position.set(0, 0.42, 0.05);

      const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 4), bowMat);
      wingL.rotation.z = Math.PI / 2;
      wingL.position.set(-0.1, 0.42, 0.05);

      const wingR = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 4), bowMat);
      wingR.rotation.z = -Math.PI / 2;
      wingR.position.set(0.1, 0.42, 0.05);

      this.hairGroup.add(knot);
      this.hairGroup.add(wingL);
      this.hairGroup.add(wingR);
    }
  }

  updateClothes(shirtType, pantsType) {
    this.clearGroup(this.clothingGroup);

    // Camisetas / Vestidos / Moletom
    if (shirtType === 'striped') {
      // Camiseta listrada estilo marinheiro
      const shirtGeo = new THREE.CylinderGeometry(0.39, 0.4, 0.42, 16);
      const shirtMat = new THREE.MeshLambertMaterial({ color: 0x42a5f5 });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.set(0, 0, 0);

      // Listra branca
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.395, 0.395, 0.1, 16), this.whiteMat);
      stripe.position.y = 0.05;
      shirt.add(stripe);

      this.clothingGroup.add(shirt);
    } else if (shirtType === 'hoodie') {
      // Moletom Pastel com Capuz
      const hoodieGeo = new THREE.CylinderGeometry(0.41, 0.42, 0.45, 16);
      const hoodieMat = new THREE.MeshLambertMaterial({ color: 0x80cbc4 }); // Menta
      const hoodie = new THREE.Mesh(hoodieGeo, hoodieMat);

      // Capuz dobrado nas costas
      const hoodFold = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 16), hoodieMat);
      hoodFold.position.set(0, 0.2, -0.15);
      hoodFold.rotation.x = Math.PI / 4;
      hoodie.add(hoodFold);

      this.clothingGroup.add(hoodie);
    } else if (shirtType === 'dress') {
      // Vestidinho Rosa com Babados
      const dressMat = new THREE.MeshLambertMaterial({ color: 0xf48fb1 });
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.4, 0.3, 16), dressMat);

      // Saia plissada
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.28, 16, 1, true), dressMat);
      skirt.position.y = -0.18;
      skirt.rotation.x = Math.PI;

      this.clothingGroup.add(top);
      this.clothingGroup.add(skirt);
    } else if (shirtType === 'sweater') {
      // Suéter Quentinho Amarelo
      const sweaterGeo = new THREE.CylinderGeometry(0.4, 0.41, 0.46, 16);
      const sweaterMat = new THREE.MeshLambertMaterial({ color: 0xffd54f });
      const sweater = new THREE.Mesh(sweaterGeo, sweaterMat);
      this.clothingGroup.add(sweater);
    } else if (shirtType === 'vest') {
      // Colete Elegante
      const vestGeo = new THREE.CylinderGeometry(0.395, 0.405, 0.38, 16);
      const vestMat = new THREE.MeshLambertMaterial({ color: 0x5c6bc0 });
      const vest = new THREE.Mesh(vestGeo, vestMat);

      // Gravatinha vermelha
      const tie = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), new THREE.MeshLambertMaterial({ color: 0xe53935 }));
      tie.position.set(0, 0.08, 0.4);
      tie.rotation.x = Math.PI;
      vest.add(tie);

      this.clothingGroup.add(vest);
    }

    // Calças / Shorts
    if (pantsType === 'shorts') {
      const shortsMat = new THREE.MeshLambertMaterial({ color: 0x1e88e5 }); // Jeans
      const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.41, 0.22, 16), shortsMat);
      shorts.position.set(0, -0.15, -0.05);
      this.clothingGroup.add(shorts);
    } else if (pantsType === 'skirt') {
      const skirtMat = new THREE.MeshLambertMaterial({ color: 0xab47bc });
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.47, 0.22, 16, 1, true), skirtMat);
      skirt.position.set(0, -0.14, -0.05);
      skirt.rotation.x = Math.PI;
      this.clothingGroup.add(skirt);
    }
  }

  updateShoes(shoeType) {
    this.legs.forEach(leg => {
      this.clearGroup(leg.shoeGroup);
    });

    if (!shoeType || shoeType === 'none') return;

    this.legs.forEach(leg => {
      if (shoeType === 'sneakers') {
        // Tênis Vermelho e Branco fofinho
        const redMat = new THREE.MeshLambertMaterial({ color: 0xe53935 });
        const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), redMat);
        sneaker.position.set(0, -0.14, 0.04);
        sneaker.castShadow = true;

        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.21), this.whiteMat);
        sole.position.y = -0.05;
        sneaker.add(sole);

        leg.shoeGroup.add(sneaker);
      } else if (shoeType === 'socks') {
        // Meinhas listradas até o meio da pata
        const sockMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.085, 0.16, 10), sockMat);
        sock.position.y = -0.08;

        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.04, 10), new THREE.MeshLambertMaterial({ color: 0xff4081 }));
        stripe.position.y = 0.02;
        sock.add(stripe);

        leg.shoeGroup.add(sock);
      } else if (shoeType === 'boots') {
        // Galochas Amarelas de Chuva
        const yellowMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });
        const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.18, 10), yellowMat);
        boot.position.y = -0.08;

        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), yellowMat);
        foot.scale.set(1.0, 0.7, 1.3);
        foot.position.set(0, -0.08, 0.04);
        boot.add(foot);

        leg.shoeGroup.add(boot);
      }
    });
  }

  updateAccessory(accType) {
    this.clearGroup(this.accessoryGroup);
    if (!accType || accType === 'none') return;

    if (accType === 'glasses') {
      // Óculos Redondos Inteligentes
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x37474f });
      const rimL = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16), frameMat);
      rimL.position.set(-0.16, 0.06, 0.36);

      const rimR = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16), frameMat);
      rimR.position.set(0.16, 0.06, 0.36);

      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), frameMat);
      bridge.position.set(0, 0.06, 0.36);

      this.accessoryGroup.add(rimL);
      this.accessoryGroup.add(rimR);
      this.accessoryGroup.add(bridge);
    } else if (accType === 'backpack') {
      // Mochilinha com formato de Peixinho nas costas
      const packMat = new THREE.MeshLambertMaterial({ color: 0x4dd0e1 });
      const pack = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), packMat);
      pack.scale.set(1.1, 1.3, 0.8);
      pack.position.set(0, 0.1, -0.36);

      // Caudinha do peixe na mochila
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.15, 4), packMat);
      fin.position.set(0, -0.15, -0.05);
      fin.rotation.x = -Math.PI / 2;
      pack.add(fin);

      this.accessoryGroup.add(pack);
    } else if (accType === 'bowtie') {
      // Gravata borboleta no pescoço
      const bowMat = new THREE.MeshLambertMaterial({ color: 0xe91e63 });
      const bow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.05), bowMat);
      bow.position.set(0, -0.16, 0.36);
      this.accessoryGroup.add(bow);
    } else if (accType === 'flower_crown') {
      // Coroa de Flores coloridas
      const colors = [0xff4081, 0xffeb3b, 0x00e676, 0x00b0ff, 0xff9100];
      for (let i = 0; i < 7; i++) {
        const flowerMat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), flowerMat);
        const angle = -1.2 + i * 0.4;
        flower.position.set(Math.sin(angle) * 0.32, 0.32, Math.cos(angle) * 0.28);
        this.accessoryGroup.add(flower);
      }
    }
  }

  clearGroup(group) {
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
  }

  /** Pirueta comemorativa ao experimentar roupa */
  celebrateSpin() {
    this.spinTimer = 0.55;
  }

  setPosition(x, z) {
    this.group.position.set(x, 0, z);
  }

  update(delta, inputDir) {
    // Efeito de pirueta de experimentação
    if (this.spinTimer > 0) {
      this.spinTimer -= delta;
      this.group.rotation.y += delta * 12;
      this.head.position.y = 0.68 + Math.sin(this.spinTimer * 12) * 0.08;
      return;
    }

    this.isMoving = inputDir.lengthSq() > 0.001;

    // Atualiza velocidade de acordo com Power-Up
    const currentSpeed = (this.isTurbo ? this.speed * this.turboMultiplier : this.speed);

    if (this.isMoving) {
      this.direction.copy(inputDir).normalize();
      this.targetRotation = Math.atan2(this.direction.x, this.direction.z);

      // Suaviza a rotação do gatinho
      let diff = this.targetRotation - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * 15 * delta;

      // Animação de caminhada / corrida
      this.walkCycle += delta * (this.isTurbo ? 22 : 14);

      this.legs.forEach(leg => {
        const offset = (leg.idx % 2 === 0) ? 0 : Math.PI;
        const phase = (leg.idx >= 2) ? offset + Math.PI : offset;
        leg.pivot.rotation.x = Math.sin(this.walkCycle + phase) * 0.6;
      });

      // Balanço do corpinho
      this.body.position.y = 0.42 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
      this.head.position.y = 0.68 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;

      // Cauda oscilando alegremente
      this.tailPivot.rotation.y = Math.sin(this.walkCycle) * 0.6;
      this.tailPivot.rotation.z = Math.cos(this.walkCycle) * 0.2;
    } else {
      // Idle fofo: respiração e abano suave de cauda
      this.walkCycle += delta * 2.5;

      this.legs.forEach(leg => {
        leg.pivot.rotation.x *= 0.85;
      });

      this.body.position.y = 0.42 + Math.sin(this.walkCycle) * 0.015;
      this.head.position.y = 0.68 + Math.sin(this.walkCycle) * 0.018;

      this.tailPivot.rotation.y = Math.sin(this.walkCycle * 1.5) * 0.35;
      this.tailPivot.rotation.z = 0;
    }

    // Efeito visual do escudo de invulnerabilidade
    if (this.isInvulnerable) {
      this.shieldMesh.visible = true;
      this.shieldMesh.rotation.y += delta * 2;
      this.shieldMesh.scale.setScalar(1 + Math.sin(this.walkCycle * 4) * 0.06);
    } else {
      this.shieldMesh.visible = false;
    }

    // Efeito da caixa de papelão (esconde o corpinho do gato e mostra a caixinha)
    if (this.isStealth) {
      this.boxGroup.visible = true;
      this.body.visible = false;
      this.head.visible = false;
      this.legs.forEach(l => l.pivot.visible = false);
      this.tailPivot.visible = false;
    } else {
      this.boxGroup.visible = false;
      this.body.visible = true;
      this.head.visible = true;
      this.legs.forEach(l => l.pivot.visible = true);
      this.tailPivot.visible = true;
    }
  }

  jumpCelebration() {
    this.head.rotation.x = -0.3;
    this.legs.forEach(l => l.pivot.rotation.x = 0.5);
  }
}

import * as THREE from 'three';

/**
 * Furniture.js - Móveis 3D Estilizados, Fofos e Aconchegantes
 * Sofás, mesas, camas, armários, TV, geladeira, plantas que balançam, tapetes e cerquinhas
 */

export class FurnitureFactory {
  constructor() {
    // Paleta de materiais fofos compartilhados
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    this.lightWoodMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
    this.sofaMat = new THREE.MeshLambertMaterial({ color: 0x81d4fa }); // Azul bebê
    this.cushionMat = new THREE.MeshLambertMaterial({ color: 0xffab91 }); // Pêssego
    this.plantLeafMat = new THREE.MeshLambertMaterial({ color: 0x66bb6a });
    this.potMat = new THREE.MeshLambertMaterial({ color: 0xffcc80 });
    this.whiteMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    this.darkMat = new THREE.MeshBasicMaterial({ color: 0x37474f });
    this.goldMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.5, roughness: 0.3 });
  }

  /** Sofá Fofinho com Almofadas */
  createSofa() {
    const group = new THREE.Group();

    // Base do assento
    const baseGeo = new THREE.BoxGeometry(2.0, 0.45, 0.9);
    const base = new THREE.Mesh(baseGeo, this.sofaMat);
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Encosto
    const backGeo = new THREE.BoxGeometry(2.0, 0.7, 0.3);
    const back = new THREE.Mesh(backGeo, this.sofaMat);
    back.position.set(0, 0.7, -0.32);
    back.castShadow = true;
    group.add(back);

    // Braços laterais
    const armGeo = new THREE.BoxGeometry(0.28, 0.55, 0.95);
    const leftArm = new THREE.Mesh(armGeo, this.sofaMat);
    leftArm.position.set(-1.0, 0.45, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this.sofaMat);
    rightArm.position.set(1.0, 0.45, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Almofadas fofas
    const cushionGeo = new THREE.BoxGeometry(0.38, 0.38, 0.14);
    const c1 = new THREE.Mesh(cushionGeo, this.cushionMat);
    c1.position.set(-0.65, 0.58, -0.2);
    c1.rotation.set(0.15, 0.1, 0.1);
    group.add(c1);

    const c2 = new THREE.Mesh(cushionGeo, this.cushionMat);
    c2.position.set(0.65, 0.58, -0.2);
    c2.rotation.set(0.15, -0.15, -0.1);
    group.add(c2);

    return group;
  }

  /** Mesa de Centro com Caneca */
  createCoffeeTable() {
    const group = new THREE.Group();

    // Tampo de madeira
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 20), this.woodMat);
    top.position.y = 0.42;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Pés
    const legGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.4, 8);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(legGeo, this.lightWoodMat);
      leg.position.set(Math.cos(angle) * 0.45, 0.2, Math.sin(angle) * 0.45);
      leg.rotation.z = Math.cos(angle) * 0.15;
      leg.castShadow = true;
      group.add(leg);
    }

    // Xícara de café estilizada
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 12), this.whiteMat);
    cup.position.set(0.1, 0.52, 0.1);
    group.add(cup);

    return group;
  }

  /** Televisão Ligada com Tela Dinâmica */
  createTV() {
    const group = new THREE.Group();

    // Móvel rack
    const stand = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.6), this.woodMat);
    stand.position.y = 0.22;
    stand.castShadow = true;
    group.add(stand);

    // TV
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 0.1), this.darkMat);
    frame.position.set(0, 0.95, 0);
    frame.castShadow = true;
    group.add(frame);

    // Tela luminosa (aquário ou desenho de peixinho)
    const screenGeo = new THREE.PlaneGeometry(1.15, 0.72);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x80deea });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.95, 0.055);
    group.add(screen);

    // Peixinho animado desenhado na tela
    const fishOnScreen = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), new THREE.MeshBasicMaterial({ color: 0xff7043 }));
    fishOnScreen.rotation.z = -Math.PI / 2;
    fishOnScreen.position.set(0, 0.95, 0.06);
    group.add(fishOnScreen);
    group.userData.fishScreen = fishOnScreen;

    return group;
  }

  /** Planta Decorativa que Balança Suavemente */
  createPlant() {
    const group = new THREE.Group();

    // Vaso cerâmico
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.4, 16), this.potMat);
    pot.position.y = 0.2;
    pot.castShadow = true;
    group.add(pot);

    // Folhagem exuberante estilizada
    const leafPivot = new THREE.Group();
    leafPivot.position.y = 0.4;
    group.add(leafPivot);
    group.userData.leafPivot = leafPivot;

    const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
    leafGeo.scale(1.2, 0.2, 2.0);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, this.plantLeafMat);
      leaf.position.set(Math.cos(angle) * 0.12, 0.06 * i, Math.sin(angle) * 0.12);
      leaf.rotation.set(0.4, angle, 0.2);
      leaf.castShadow = true;
      leafPivot.add(leaf);
    }

    return group;
  }

  /** Cama Confortável de Quarto */
  createBed() {
    const group = new THREE.Group();

    // Estrutura de madeira da cama
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.2), this.woodMat);
    frame.position.y = 0.18;
    frame.castShadow = true;
    group.add(frame);

    // Cabeceira
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.18), this.woodMat);
    headboard.position.set(0, 0.55, -1.02);
    headboard.castShadow = true;
    group.add(headboard);

    // Colchão & Cobertor macio
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.28, 2.0), this.whiteMat);
    mattress.position.y = 0.42;
    group.add(mattress);

    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.47, 0.3, 1.4),
      new THREE.MeshLambertMaterial({ color: 0xce93d8 }) // Lavanda
    );
    blanket.position.set(0, 0.43, 0.32);
    group.add(blanket);

    // Travesseiro fofinho
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.4), this.whiteMat);
    pillow.position.set(0, 0.58, -0.75);
    group.add(pillow);

    return group;
  }

  /** Geladeira de Cozinha com Ímãs */
  createFridge() {
    const group = new THREE.Group();

    const fridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.9, 0.85),
      new THREE.MeshLambertMaterial({ color: 0xe0f2f1 }) // Menta clarinho
    );
    fridge.position.y = 0.95;
    fridge.castShadow = true;
    group.add(fridge);

    // Puxadores
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), this.whiteMat);
    handle.position.set(-0.35, 1.1, 0.45);
    group.add(handle);

    // Ímãs de geladeira fofos (coraçõezinhos)
    const magnet1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: 0xff4081 }));
    magnet1.position.set(0.1, 1.4, 0.44);
    group.add(magnet1);

    const magnet2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xffd54f }));
    magnet2.position.set(0.22, 1.25, 0.44);
    group.add(magnet2);

    return group;
  }

  /** Balcão de Cozinha com Pia */
  createCounter() {
    const group = new THREE.Group();

    // Balcão
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.8), this.whiteMat);
    base.position.y = 0.45;
    base.castShadow = true;
    group.add(base);

    // Tampo de granito/madeira clara
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.1, 0.86), this.lightWoodMat);
    top.position.y = 0.92;
    top.castShadow = true;
    group.add(top);

    // Cuba da pia
    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.05, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xb0bec5 })
    );
    sink.position.set(-0.35, 0.98, 0);
    group.add(sink);

    return group;
  }

  /** Estante com Livros Coloridos */
  createBookshelf() {
    const group = new THREE.Group();

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.45), this.woodMat);
    shelf.position.y = 0.9;
    shelf.castShadow = true;
    group.add(shelf);

    // Livros nas prateleiras
    const colors = [0xff8a80, 0x82b1ff, 0xb9f6ca, 0xffd180];
    for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
      const y = 0.45 + shelfIdx * 0.5;
      for (let b = 0; b < 5; b++) {
        const bookMat = new THREE.MeshLambertMaterial({ color: colors[(shelfIdx + b) % colors.length] });
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.3), bookMat);
        book.position.set(-0.45 + b * 0.14, y, 0.05);
        group.add(book);
      }
    }

    return group;
  }

  /** Tapete Fofo com Padrão Pastel */
  createRug(width = 2.4, depth = 1.8, color = 0xffe0b2) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = new THREE.MeshLambertMaterial({
      color,
      roughness: 0.9
    });
    const rug = new THREE.Mesh(geo, mat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.015; // Ligeiramente acima do piso
    rug.receiveShadow = true;
    return rug;
  }

  /** Cerquinha de Madeira para o Quintal */
  createFence() {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    for (let i = 0; i < 4; i++) {
      const picket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.04), mat);
      picket.position.set(-0.45 + i * 0.3, 0.45, 0);
      picket.castShadow = true;
      group.add(picket);
    }

    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.04), mat);
    rail.position.set(0, 0.5, 0.02);
    group.add(rail);

    return group;
  }

  /** Flores Coloridas para o Jardim */
  createFlowerPatch() {
    const group = new THREE.Group();
    const stemMat = new THREE.MeshBasicMaterial({ color: 0x4caf50 });
    const petalColors = [0xff4081, 0xffeb3b, 0xff9800, 0x00e676];

    for (let i = 0; i < 4; i++) {
      const flower = new THREE.Group();
      const x = (Math.random() - 0.5) * 0.8;
      const z = (Math.random() - 0.5) * 0.8;

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), stemMat);
      stem.position.y = 0.15;
      flower.add(stem);

      const petalMat = new THREE.MeshBasicMaterial({ color: petalColors[i % petalColors.length] });
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), petalMat);
      bloom.position.y = 0.3;
      flower.add(bloom);

      flower.position.set(x, 0, z);
      group.add(flower);
    }

    return group;
  }
}

import * as THREE from 'three';
import { FurnitureFactory } from '../entities/Furniture.js';
import { Collectible } from '../entities/Collectible.js';
import { PowerUp } from '../entities/PowerUp.js';

/**
 * LevelBuilder.js - Construtor Procedural do Labirinto Residencial 3D
 * Suporte a Portas Interativas ('D'), móveis interativos e colisões otimizadas
 */

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
    this.furnitureFactory = new FurnitureFactory();
    this.tileSize = 1.6; // Tamanho de cada célula do labirinto
    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.solids = []; // Objetos colidíveis (caixas de colisão)
    this.collectibles = [];
    this.powerups = [];
    this.doors = []; // Portas interativas
    this.mouseSpawns = [];
    this.catSpawn = new THREE.Vector3(0, 0, 0);

    this.animatedProps = [];
    this.interactiveProps = []; // Móveis que reagem ao toque do gato
  }

  buildLevel(levelData) {
    this.clear();

    const grid = levelData.grid;
    const rows = grid.length;
    const cols = grid[0].length;

    this.width = cols * this.tileSize;
    this.height = rows * this.tileSize;
    this.halfW = this.width / 2;
    this.halfH = this.height / 2;

    // 1. Piso da Casa / Quintal
    const floorGeo = new THREE.PlaneGeometry(this.width + 2, this.height + 2);
    const floorMat = new THREE.MeshLambertMaterial({
      color: levelData.floorColor
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.y = 0;
    this.floorMesh.receiveShadow = true;
    this.levelGroup.add(this.floorMesh);

    // Materiais das Paredes Fofas (Estilo Cartoon)
    const wallGeo = new THREE.BoxGeometry(this.tileSize, 1.4, this.tileSize);
    const trimGeo = new THREE.BoxGeometry(this.tileSize * 1.02, 0.16, this.tileSize * 1.02);

    const wallMat = new THREE.MeshLambertMaterial({ color: levelData.wallColor });
    const trimMat = new THREE.MeshLambertMaterial({ color: levelData.wallTrimColor });

    // Itera pela grade construindo o ambiente
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = grid[r][c];
        const worldX = (c * this.tileSize) - this.halfW + (this.tileSize / 2);
        const worldZ = (r * this.tileSize) - this.halfH + (this.tileSize / 2);

        // Paredes
        if (char === '#') {
          const wallGroup = new THREE.Group();
          wallGroup.position.set(worldX, 0, worldZ);

          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.y = 0.7;
          wall.castShadow = true;
          wall.receiveShadow = true;
          wallGroup.add(wall);

          // Moldura superior fofa
          const trim = new THREE.Mesh(trimGeo, trimMat);
          trim.position.y = 1.45;
          trim.castShadow = true;
          wallGroup.add(trim);

          this.levelGroup.add(wallGroup);

          // Registra colisor
          this.solids.push({
            id: `wall_${r}_${c}`,
            minX: worldX - this.tileSize / 2,
            maxX: worldX + this.tileSize / 2,
            minZ: worldZ - this.tileSize / 2,
            maxZ: worldZ + this.tileSize / 2
          });
        }
        // PORTA INTERATIVA ('D')
        else if (char === 'D') {
          this.createInteractiveDoor(worldX, worldZ, r, c);
        }
        // Spawn do Gatinho
        else if (char === 'C') {
          this.catSpawn.set(worldX, 0, worldZ);
        }
        // Spawns dos 4 Ratinhos
        else if (char === '1') {
          this.mouseSpawns.push({ type: 'pink', pos: new THREE.Vector3(worldX, 0, worldZ) });
        }
        else if (char === '2') {
          this.mouseSpawns.push({ type: 'blue', pos: new THREE.Vector3(worldX, 0, worldZ) });
        }
        else if (char === '3') {
          this.mouseSpawns.push({ type: 'yellow', pos: new THREE.Vector3(worldX, 0, worldZ) });
        }
        else if (char === '4') {
          this.mouseSpawns.push({ type: 'purple', pos: new THREE.Vector3(worldX, 0, worldZ) });
        }
        // Móveis Interativos
        else if (char === 'S') { // Sofá
          const sofa = this.furnitureFactory.createSofa();
          sofa.position.set(worldX, 0, worldZ);
          this.levelGroup.add(sofa);
          this.interactiveProps.push({ mesh: sofa, initialY: 0, wobble: 0 });
          this.solids.push({
            id: `sofa_${r}_${c}`,
            minX: worldX - 0.9, maxX: worldX + 0.9,
            minZ: worldZ - 0.45, maxZ: worldZ + 0.45
          });
        }
        else if (char === 'V') { // TV
          const tv = this.furnitureFactory.createTV();
          tv.position.set(worldX, 0, worldZ);
          this.levelGroup.add(tv);
          this.animatedProps.push(tv);
          this.solids.push({
            id: `tv_${r}_${c}`,
            minX: worldX - 0.7, maxX: worldX + 0.7,
            minZ: worldZ - 0.35, maxZ: worldZ + 0.35
          });
        }
        else if (char === 'B') { // Cama
          const bed = this.furnitureFactory.createBed();
          bed.position.set(worldX, 0, worldZ);
          this.levelGroup.add(bed);
          this.interactiveProps.push({ mesh: bed, initialY: 0, wobble: 0 });
          this.solids.push({
            id: `bed_${r}_${c}`,
            minX: worldX - 0.75, maxX: worldX + 0.75,
            minZ: worldZ - 0.95, maxZ: worldZ + 0.95
          });
        }
        else if (char === 'K') { // Balcão Pia
          const counter = this.furnitureFactory.createCounter();
          counter.position.set(worldX, 0, worldZ);
          this.levelGroup.add(counter);
          this.solids.push({
            id: `counter_${r}_${c}`,
            minX: worldX - 0.75, maxX: worldX + 0.75,
            minZ: worldZ - 0.4, maxZ: worldZ + 0.4
          });
        }
        else if (char === 'R') { // Geladeira
          const fridge = this.furnitureFactory.createFridge();
          fridge.position.set(worldX, 0, worldZ);
          this.levelGroup.add(fridge);
          this.solids.push({
            id: `fridge_${r}_${c}`,
            minX: worldX - 0.45, maxX: worldX + 0.45,
            minZ: worldZ - 0.45, maxZ: worldZ + 0.45
          });
        }
        else if (char === 'L') { // Planta
          const plant = this.furnitureFactory.createPlant();
          plant.position.set(worldX, 0, worldZ);
          this.levelGroup.add(plant);
          this.animatedProps.push(plant);
          this.interactiveProps.push({ mesh: plant, initialY: 0, wobble: 0 });
          this.solids.push({
            id: `plant_${r}_${c}`,
            minX: worldX - 0.3, maxX: worldX + 0.3,
            minZ: worldZ - 0.3, maxZ: worldZ + 0.3
          });
        }
        else if (char === 'W') { // Cerquinha
          const fence = this.furnitureFactory.createFence();
          fence.position.set(worldX, 0, worldZ);
          this.levelGroup.add(fence);
          this.solids.push({
            id: `fence_${r}_${c}`,
            minX: worldX - 0.55, maxX: worldX + 0.55,
            minZ: worldZ - 0.15, maxZ: worldZ + 0.15
          });
        }
        else if (char === '*') { // Canteiro de Flores
          const flowers = this.furnitureFactory.createFlowerPatch();
          flowers.position.set(worldX, 0, worldZ);
          this.levelGroup.add(flowers);
        }
        // Itens Coletáveis
        else if (char === '.') {
          const item = new Collectible(this.scene, 'snack', worldX, worldZ);
          this.collectibles.push(item);
        }
        else if (char === 'F') {
          const item = new Collectible(this.scene, 'fish', worldX, worldZ);
          this.collectibles.push(item);
        }
        else if (char === 'T') {
          const item = new Collectible(this.scene, 'toy', worldX, worldZ);
          this.collectibles.push(item);
        }
        else if (char === 'P') {
          const item = new Collectible(this.scene, 'paw', worldX, worldZ);
          this.collectibles.push(item);
        }
        // Power-Ups
        else if (char === 'G') {
          const pup = new PowerUp(this.scene, 'golden_fish', worldX, worldZ);
          this.powerups.push(pup);
        }
        else if (char === 'M') {
          const pup = new PowerUp(this.scene, 'magic_milk', worldX, worldZ);
          this.powerups.push(pup);
        }
        else if (char === 'Y') {
          const pup = new PowerUp(this.scene, 'yarn_ball', worldX, worldZ);
          this.powerups.push(pup);
        }
        else if (char === 'E') {
          const pup = new PowerUp(this.scene, 'bell', worldX, worldZ);
          this.powerups.push(pup);
        }
        else if (char === 'O') {
          const pup = new PowerUp(this.scene, 'cardboard_box', worldX, worldZ);
          this.powerups.push(pup);
        }
      }
    }
  }

  /**
   * Cria uma Porta 3D Interativa com batente, folha giratória e maçaneta
   */
  createInteractiveDoor(worldX, worldZ, r, c) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(worldX, 0, worldZ);

    const frameMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 });
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.7, roughness: 0.2 });

    // Batentes laterais
    const postGeo = new THREE.BoxGeometry(0.12, 1.4, 0.2);
    const postL = new THREE.Mesh(postGeo, frameMat);
    postL.position.set(-0.7, 0.7, 0);
    doorGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, frameMat);
    postR.position.set(0.7, 0.7, 0);
    doorGroup.add(postR);

    // Verga superior
    const header = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.14, 0.2), frameMat);
    header.position.set(0, 1.4, 0);
    doorGroup.add(header);

    // Folha da porta (com pivô na dobradiça esquerda)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.64, 0, 0);

    const leafGeo = new THREE.BoxGeometry(1.28, 1.32, 0.08);
    const doorLeaf = new THREE.Mesh(leafGeo, woodMat);
    doorLeaf.position.set(0.64, 0.68, 0);
    doorLeaf.castShadow = true;
    doorPivot.add(doorLeaf);

    // Maçaneta dourada
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), knobMat);
    knob.position.set(1.15, 0.65, 0.06);
    doorPivot.add(knob);

    doorGroup.add(doorPivot);
    this.levelGroup.add(doorGroup);

    // Colisor inicial da porta fechada
    const colliderId = `door_${r}_${c}`;
    this.solids.push({
      id: colliderId,
      minX: worldX - 0.7,
      maxX: worldX + 0.7,
      minZ: worldZ - 0.15,
      maxZ: worldZ + 0.15
    });

    this.doors.push({
      id: colliderId,
      pos: new THREE.Vector3(worldX, 0, worldZ),
      pivot: doorPivot,
      isOpen: false,
      targetAngle: 0,
      currentAngle: 0
    });
  }

  /**
   * Abre a porta suavemente e remove a colisão
   */
  openDoor(door) {
    if (door.isOpen) return false;
    door.isOpen = true;
    door.targetAngle = -Math.PI / 2; // Gira 90 graus para abrir

    // Remove o colisor para permitir passagem imediata
    this.solids = this.solids.filter(s => s.id !== door.id);
    return true;
  }

  /**
   * Encontra a porta fechada mais próxima da posição do gatinho
   */
  getNearbyClosedDoor(pos, maxDist = 1.6) {
    for (let i = 0; i < this.doors.length; i++) {
      const d = this.doors[i];
      if (!d.isOpen) {
        const dist = d.pos.distanceTo(pos);
        if (dist <= maxDist) {
          return d;
        }
      }
    }
    return null;
  }

  /**
   * Provoca uma pequena reação física e balanço em móveis ao encostar
   */
  triggerPropReaction(pos) {
    this.interactiveProps.forEach(prop => {
      const dist = prop.mesh.position.distanceTo(pos);
      if (dist < 1.1 && prop.wobble <= 0.01) {
        prop.wobble = 0.18;
      }
    });
  }

  /**
   * Checagem de colisão precisa e rápida contra paredes, portas fechadas e móveis
   */
  isSolid(x, z, radius = 0.4) {
    for (let i = 0; i < this.solids.length; i++) {
      const b = this.solids[i];
      if (
        x + radius > b.minX &&
        x - radius < b.maxX &&
        z + radius > b.minZ &&
        z - radius < b.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  update(delta, time) {
    // Animação de abertura suave das portas
    this.doors.forEach(door => {
      if (door.isOpen && door.currentAngle !== door.targetAngle) {
        door.currentAngle += (door.targetAngle - door.currentAngle) * 8 * delta;
        door.pivot.rotation.y = door.currentAngle;
      }
    });

    // Reação e amortecimento dos móveis interativos
    this.interactiveProps.forEach(prop => {
      if (prop.wobble > 0.001) {
        prop.wobble -= delta * 0.8;
        prop.mesh.rotation.z = Math.sin(time * 18) * prop.wobble;
      } else {
        prop.mesh.rotation.z = 0;
      }
    });

    // Animação de props (peixe da TV e plantas balançando)
    this.animatedProps.forEach(prop => {
      if (prop.userData.fishScreen) {
        prop.userData.fishScreen.position.x = Math.sin(time * 2) * 0.35;
      }
      if (prop.userData.leafPivot) {
        prop.userData.leafPivot.rotation.z = Math.sin(time * 2.5) * 0.08;
      }
    });

    // Atualiza itens coletáveis
    this.collectibles.forEach(item => item.update(delta, time));

    // Atualiza power-ups
    this.powerups.forEach(pup => pup.update(delta, time));
  }

  clear() {
    while (this.levelGroup.children.length > 0) {
      const obj = this.levelGroup.children[0];
      this.levelGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    this.collectibles.forEach(c => c.destroy());
    this.collectibles = [];

    this.powerups.forEach(p => p.destroy());
    this.powerups = [];

    this.solids = [];
    this.doors = [];
    this.interactiveProps = [];
    this.mouseSpawns = [];
    this.animatedProps = [];
  }
}

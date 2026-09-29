import * as THREE from 'three';
import { SceneManager } from '../graphics/SceneManager.js';
import { CameraController } from './CameraController.js';
import { InputManager } from './InputManager.js';
import { SoundEngine } from '../audio/SoundEngine.js';
import { MusicComposer } from '../audio/MusicComposer.js';
import { ParticleSystem } from '../graphics/ParticleSystem.js';
import { LevelBuilder } from '../levels/LevelBuilder.js';
import { LEVELS } from '../levels/LevelData.js';
import { Cat } from '../entities/Cat.js';
import { Mouse } from '../entities/Mouse.js';
import { UIManager } from '../ui/UIManager.js';

/**
 * Game.js - Controlador Principal do Jogo, Loop e Estados
 * Suporte à Customização do Gatinho, Portas Interativas e Física de Móveis
 */

export class Game {
  constructor(canvas) {
    this.canvas = canvas;

    // Subsistemas
    this.sceneManager = new SceneManager(canvas);
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.inputManager = new InputManager();
    this.soundEngine = new SoundEngine();
    this.musicComposer = new MusicComposer(this.soundEngine);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    this.levelBuilder = new LevelBuilder(this.sceneManager.scene);

    // Configuração persistente do Gatinho
    this.catConfig = {
      fur: 'ginger',
      eyes: 'blue',
      hair: 'none',
      clothes: 'none',
      pants: 'none',
      shoes: 'none',
      accessory: 'none'
    };

    // Entidades
    this.cat = new Cat(this.sceneManager.scene);
    this.mice = [];

    // UI Manager
    this.uiManager = new UIManager(this);

    // Callbacks de Input
    this.inputManager.onPauseCallback = () => this.togglePause();
    this.inputManager.onZoomCallback = () => this.toggleCameraZoom();
    this.inputManager.onMuteCallback = () => this.toggleMute();

    // Estado do Jogo
    this.state = 'menu'; // 'menu', 'customization', 'playing', 'paused', 'victory', 'gameover', 'gamecomplete'
    this.currentLevelIdx = 0;
    this.score = 0;
    this.levelScore = 0;
    this.lives = 3;
    this.levelTime = 0;
    this.totalItems = 0;
    this.collectedItems = 0;
    this.tookDamageThisLevel = false;

    // Temporizadores de Power-Up
    this.activePowerUp = null;
    this.powerUpTimeRemaining = 0;
    this.powerUpMaxDuration = 0;

    // Temporizador de Pegadas
    this.footprintTimer = 0;

    // Invulnerabilidade temporária pós-dano
    this.invulnerableTimer = 0;

    // Relógio
    this.clock = new THREE.Clock();

    // Inicia na fase 1 no fundo do menu inicial
    this.loadLevel(0, false);

    // Inicia loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  enterCustomizationMode() {
    this.state = 'customization';
    this.soundEngine.init();
    this.cat.setPosition(0, 0);
    this.cat.group.rotation.y = 0;
    this.cameraController.reset(new THREE.Vector3(0, 0, 0));
    this.cameraController.targetOffset.set(0, 1.8, 3.2); // Câmera próxima e centralizada no gatinho
  }

  rotateCustomCat(deltaAngle) {
    this.cat.group.rotation.y += deltaAngle;
  }

  updateCatCustomization(newConfig) {
    this.catConfig = { ...this.catConfig, ...newConfig };
    this.cat.applyCustomization(this.catConfig);
  }

  confirmCustomizationAndStart() {
    this.startGame();
  }

  startGame() {
    this.soundEngine.init();
    this.musicComposer.start();
    this.state = 'playing';
    this.score = 0;
    this.lives = 3;
    this.cameraController.targetOffset.set(0, 8.5, 7.0); // Retorna câmera à visão de jogo
    this.loadLevel(0, true);
    this.uiManager.showHUD();
    this.soundEngine.playMeow('happy');
    this.uiManager.showToast('Boa sorte, gatinho!', '🐾');
  }

  startFromFirstLevel() {
    this.currentLevelIdx = 0;
    this.score = 0;
    this.lives = 3;
    this.loadLevel(0, true);
    this.state = 'playing';
    this.uiManager.showHUD();
  }

  loadLevel(levelIndex, resetPositions = true) {
    this.currentLevelIdx = levelIndex;
    const levelData = LEVELS[this.currentLevelIdx];
    this.levelTime = 0;
    this.levelScore = 0;
    this.tookDamageThisLevel = false;

    // Reseta powerups
    this.activePowerUp = null;
    this.powerUpTimeRemaining = 0;
    this.cat.isTurbo = false;
    this.cat.isInvulnerable = false;
    this.cat.isStealth = false;

    // Limpa ratinhos anteriores
    this.mice.forEach(m => this.sceneManager.scene.remove(m.group));
    this.mice = [];

    // Constrói labirinto, portas e itens
    this.levelBuilder.buildLevel(levelData);

    this.totalItems = this.levelBuilder.collectibles.length;
    this.collectedItems = 0;

    // Posiciona e reaplica a customização no gatinho
    if (resetPositions) {
      this.cat.setPosition(this.levelBuilder.catSpawn.x, this.levelBuilder.catSpawn.z);
      this.cat.group.rotation.y = 0;
      this.cameraController.reset(this.cat.group.position);
    }
    this.cat.applyCustomization(this.catConfig);

    // Instancia os ratinhos definidos nesta fase
    this.levelBuilder.mouseSpawns.forEach(sp => {
      const mouse = new Mouse(this.sceneManager.scene, sp.type);
      mouse.setPosition(sp.pos.x, sp.pos.z);
      this.mice.push(mouse);
    });

    this.particleSystem.clear();

    this.uiManager.updateHUD(
      this.lives,
      this.score,
      this.collectedItems,
      this.totalItems,
      this.levelTime,
      levelData.name
    );
    this.uiManager.updatePowerUpBar(null, 0, 1);
    this.uiManager.showDoorPrompt(false);
  }

  restartLevel() {
    this.state = 'playing';
    this.loadLevel(this.currentLevelIdx, true);
    this.uiManager.showHUD();
  }

  nextLevel() {
    if (this.currentLevelIdx + 1 < LEVELS.length) {
      this.loadLevel(this.currentLevelIdx + 1, true);
      this.state = 'playing';
      this.uiManager.showHUD();
      this.soundEngine.playMeow('happy');
    } else {
      // Grande vitória final
      this.state = 'gamecomplete';
      this.uiManager.hideHUD();
      this.uiManager.showGameCompleteModal(this.score);
      this.soundEngine.playVictory();
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.uiManager.showModal(this.uiManager.modalPause);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.uiManager.hideModal(this.uiManager.modalPause);
    }
  }

  toggleCameraZoom() {
    this.cameraController.toggleZoom();
  }

  toggleMute() {
    const isMuted = this.soundEngine.toggleMute();
    this.musicComposer.toggleMute();
    this.uiManager.updateMuteIcon(isMuted);
  }

  /**
   * Ativação de Power-Up
   */
  activatePowerUp(pup) {
    this.activePowerUp = pup;
    this.powerUpMaxDuration = pup.duration;
    this.powerUpTimeRemaining = pup.duration;

    this.soundEngine.playPowerUp();
    this.particleSystem.emitCollectBurst(pup.group.position, true);
    this.uiManager.showToast(pup.desc, pup.icon);

    if (pup.type === 'golden_fish') {
      this.cat.isTurbo = true;
    } else if (pup.type === 'magic_milk') {
      this.cat.isInvulnerable = true;
    } else if (pup.type === 'yarn_ball') {
      this.soundEngine.playDizzy();
      this.mice.forEach(m => m.setDizzy(pup.duration));
    } else if (pup.type === 'bell') {
      this.soundEngine.playBell();
      this.mice.forEach(m => m.setBeaconVisible(true));
      const radar = document.getElementById('radar-overlay');
      if (radar) radar.classList.remove('hidden');
    } else if (pup.type === 'cardboard_box') {
      this.cat.isStealth = true;
    }
  }

  /**
   * Dano sofrido pelo Gatinho
   */
  handleCatDamage() {
    if (this.invulnerableTimer > 0 || this.cat.isInvulnerable || this.cat.isStealth) {
      return;
    }

    this.lives -= 1;
    this.tookDamageThisLevel = true;
    this.invulnerableTimer = 2.2;

    this.soundEngine.playHit();
    this.uiManager.showToast('Miau! Cuidado!', '😿');

    this.uiManager.updateHUD(
      this.lives,
      this.score,
      this.collectedItems,
      this.totalItems,
      this.levelTime,
      LEVELS[this.currentLevelIdx].name
    );

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.state = 'gameover';
    this.soundEngine.playGameOver();
    this.uiManager.hideHUD();
    this.uiManager.showGameOverModal({
      totalScore: this.score,
      levelName: LEVELS[this.currentLevelIdx].name
    });
  }

  victory() {
    this.state = 'victory';
    this.soundEngine.playVictory();
    this.cat.jumpCelebration();

    const bonus = this.tookDamageThisLevel ? 0 : 500;
    this.score += bonus;
    this.levelScore += bonus;

    this.particleSystem.emitConfetti(this.cat.group.position, 90);

    this.uiManager.hideHUD();
    this.uiManager.showVictoryModal({
      levelScore: this.levelScore,
      time: this.levelTime,
      bonus,
      totalScore: this.score
    });
  }

  /**
   * Loop Principal de Animação e Lógica
   */
  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    this.particleSystem.update(delta);
    this.levelBuilder.update(delta, time);
    this.sceneManager.updatePlayerLight(this.cat.group.position);

    if (this.state === 'playing') {
      this.levelTime += delta;

      // 1. Movimentação do Gatinho com checagem de colisão
      const inputDir = this.inputManager.getMovementDirection();
      const moveSpeed = (this.cat.isTurbo ? this.cat.speed * this.cat.turboMultiplier : this.cat.speed) * delta;

      if (inputDir.lengthSq() > 0.001) {
        const nextX = this.cat.group.position.x + inputDir.x * moveSpeed;
        const nextZ = this.cat.group.position.z + inputDir.z * moveSpeed;

        if (!this.levelBuilder.isSolid(nextX, this.cat.group.position.z, this.cat.radius)) {
          this.cat.group.position.x = nextX;
        }
        if (!this.levelBuilder.isSolid(this.cat.group.position.x, nextZ, this.cat.radius)) {
          this.cat.group.position.z = nextZ;
        }

        this.soundEngine.playStep();

        // Reação de móveis / almofadas ao toque
        this.levelBuilder.triggerPropReaction(this.cat.group.position);

        // Pegadinhas fofas no chão
        this.footprintTimer += delta;
        if (this.footprintTimer > 0.35) {
          this.footprintTimer = 0;
          this.particleSystem.addFootprint(this.cat.group.position, this.cat.group.rotation.y);
        }
      }

      this.cat.update(delta, inputDir);

      // 2. Interação com Portas
      const nearbyDoor = this.levelBuilder.getNearbyClosedDoor(this.cat.group.position, 1.8);
      if (nearbyDoor) {
        this.uiManager.showDoorPrompt(true, 'Abrir Porta (Espaço / Toque)');

        // Se o jogador pressionar o botão de ação ou andar em direção à porta
        if (this.inputManager.actionPressed || this.cat.group.position.distanceTo(nearbyDoor.pos) < 1.1) {
          if (this.levelBuilder.openDoor(nearbyDoor)) {
            this.soundEngine.playDoorOpen();
            this.particleSystem.emitCollectBurst(nearbyDoor.pos, false);
            this.uiManager.showToast('Porta Aberta!', '🚪✨');
            this.uiManager.showDoorPrompt(false);
          }
        }
      } else {
        this.uiManager.showDoorPrompt(false);
      }

      // 3. Temporizadores de Power-Up
      if (this.activePowerUp) {
        this.powerUpTimeRemaining -= delta;
        this.uiManager.updatePowerUpBar(this.activePowerUp, this.powerUpTimeRemaining, this.powerUpMaxDuration);

        if (this.powerUpTimeRemaining <= 0) {
          if (this.activePowerUp.type === 'golden_fish') this.cat.isTurbo = false;
          if (this.activePowerUp.type === 'magic_milk') this.cat.isInvulnerable = false;
          if (this.activePowerUp.type === 'bell') {
            this.mice.forEach(m => m.setBeaconVisible(false));
            const radar = document.getElementById('radar-overlay');
            if (radar) radar.classList.add('hidden');
          }
          if (this.activePowerUp.type === 'cardboard_box') this.cat.isStealth = false;

          this.activePowerUp = null;
        }
      }

      // Imunidade pós-dano pisca o gatinho
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= delta;
        this.cat.group.visible = Math.floor(time * 12) % 2 === 0;
      } else {
        this.cat.group.visible = true;
      }

      // 4. Ratinhos IA e Colisões
      const collisionChecker = (x, z, r) => this.levelBuilder.isSolid(x, z, r);
      this.mice.forEach(mouse => {
        mouse.updateAI(delta, this.cat.group.position, this.cat.isStealth, collisionChecker);

        const dist = mouse.group.position.distanceTo(this.cat.group.position);
        if (dist < (this.cat.radius + mouse.radius)) {
          if (this.cat.isInvulnerable) {
            mouse.setDizzy(4.0);
            this.soundEngine.playSqueak();
            this.score += 150;
            this.levelScore += 150;
            this.particleSystem.emitCollectBurst(mouse.group.position, true);
            this.uiManager.showToast('+150 Ratinho Assustado!', '🐭💨');
            this.uiManager.animateScore();
          } else if (!this.cat.isStealth) {
            this.handleCatDamage();
          }
        }
      });

      // 5. Coleta de Petiscos e Peixes
      for (let i = this.levelBuilder.collectibles.length - 1; i >= 0; i--) {
        const item = this.levelBuilder.collectibles[i];
        if (!item.collected) {
          const dist = item.group.position.distanceTo(this.cat.group.position);
          if (dist < (this.cat.radius + item.radius)) {
            item.destroy();
            this.collectedItems++;
            this.score += item.points;
            this.levelScore += item.points;

            this.soundEngine.playCollect(item.type === 'fish');
            this.particleSystem.emitCollectBurst(item.group.position, item.type === 'fish');
            this.uiManager.animateScore();

            this.uiManager.updateHUD(
              this.lives,
              this.score,
              this.collectedItems,
              this.totalItems,
              this.levelTime,
              LEVELS[this.currentLevelIdx].name
            );

            if (this.collectedItems >= this.totalItems) {
              this.victory();
              break;
            }
          }
        }
      }

      // 6. Coleta de Power-Ups
      for (let i = this.levelBuilder.powerups.length - 1; i >= 0; i--) {
        const pup = this.levelBuilder.powerups[i];
        if (!pup.collected) {
          const dist = pup.group.position.distanceTo(this.cat.group.position);
          if (dist < (this.cat.radius + pup.radius)) {
            pup.destroy();
            this.score += 100;
            this.levelScore += 100;
            this.activatePowerUp(pup);
            this.uiManager.animateScore();
          }
        }
      }

      this.uiManager.updateHUD(
        this.lives,
        this.score,
        this.collectedItems,
        this.totalItems,
        this.levelTime,
        LEVELS[this.currentLevelIdx].name
      );

      this.cameraController.update(delta, this.cat.group.position);
    } else if (this.state === 'customization') {
      // Modo de customização: gato no centro com respiração fofa e cauda suave
      this.cat.update(delta, new THREE.Vector3(0, 0, 0));
      this.cameraController.update(delta, this.cat.group.position);
    } else if (this.state === 'menu') {
      this.cat.update(delta, new THREE.Vector3(0, 0, 0));
      this.cameraController.update(delta, this.cat.group.position);
    }

    this.sceneManager.render();
  }
}

/**
 * UIManager.js - Controle de Interface, HUD, Modais, Customização e Telas
 */

export class UIManager {
  constructor(game) {
    this.game = game;

    // Elementos do HUD
    this.hud = document.getElementById('hud');
    this.heartsContainer = document.getElementById('hearts-container');
    this.levelNameElem = document.getElementById('level-name');
    this.itemsCountElem = document.getElementById('items-count');
    this.scoreCountElem = document.getElementById('score-count');
    this.timerDisplayElem = document.getElementById('timer-display');

    // Power-up HUD
    this.powerupStatus = document.getElementById('powerup-status');
    this.powerupIcon = document.getElementById('powerup-icon');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupBarFill = document.getElementById('powerup-bar-fill');
    this.powerupTime = document.getElementById('powerup-time');

    // Door Prompt
    this.doorPrompt = document.getElementById('door-prompt');

    // Toasts
    this.toastContainer = document.getElementById('toast-container');

    // Telas & Modais
    this.screenMenu = document.getElementById('screen-menu');
    this.screenCustomization = document.getElementById('screen-customization');
    this.modalHowToPlay = document.getElementById('modal-how-to-play');
    this.modalSettings = document.getElementById('modal-settings');
    this.modalCredits = document.getElementById('modal-credits');
    this.modalPause = document.getElementById('modal-pause');
    this.modalVictory = document.getElementById('modal-victory');
    this.modalGameOver = document.getElementById('modal-gameover');
    this.modalGameComplete = document.getElementById('modal-game-complete');

    // Estado da Customização
    this.currentCustomCategory = 'fur';
    this.customCatalog = this.initCustomCatalog();

    this.bindEvents();
  }

  initCustomCatalog() {
    return {
      fur: [
        { id: 'ginger', label: 'Laranja (Gengibre)', color: '#ffa372' },
        { id: 'white', label: 'Branco Neve', color: '#ffffff' },
        { id: 'black', label: 'Preto Meia-Noite', color: '#2b2b2b' },
        { id: 'calico', label: 'Calico Tricolor', color: '#e08e6d' },
        { id: 'gray', label: 'Cinza Aveludado', color: '#90a4ae' },
        { id: 'siamese', label: 'Siamês Elegante', color: '#d7ccc8' }
      ],
      eyes: [
        { id: 'blue', label: 'Azul Celeste', color: '#03a9f4' },
        { id: 'green', label: 'Verde Esmeralda', color: '#2e7d32' },
        { id: 'amber', label: 'Âmbar Dourado', color: '#ffb300' },
        { id: 'pink', label: 'Rosa Algodão', color: '#f06292' },
        { id: 'purple', label: 'Roxo Mágico', color: '#8e24aa' },
        { id: 'hetero', label: 'Heterocromia (Azul/Ouro)', icon: '👁️✨' }
      ],
      hair: [
        { id: 'none', label: 'Natural', icon: '🐾' },
        { id: 'tuft', label: 'Topete Fofo', icon: '💇' },
        { id: 'bangs', label: 'Franjinha Kawaii', icon: '✨' },
        { id: 'mohawk', label: 'Moicano Pastel', icon: '⚡' },
        { id: 'bow', label: 'Laço no Cabelo', icon: '🎀' }
      ],
      clothes: [
        { id: 'none', label: 'Sem Roupa', icon: '🐱' },
        { id: 'striped', label: 'Camiseta Listrada', icon: '👕' },
        { id: 'hoodie', label: 'Moletom Menta', icon: '🧥' },
        { id: 'dress', label: 'Vestidinho Rosa', icon: '👗' },
        { id: 'sweater', label: 'Suéter Quentinho', icon: '🧶' },
        { id: 'vest', label: 'Colete Elegante', icon: '🤵' }
      ],
      shoes: [
        { id: 'none', label: 'Patas Livres', icon: '🐾' },
        { id: 'sneakers', label: 'Tênis Vermelhos', icon: '👟' },
        { id: 'socks', label: 'Meias Listradas', icon: '🧦' },
        { id: 'boots', label: 'Galochas Amarelas', icon: '👢' }
      ],
      accessory: [
        { id: 'none', label: 'Nenhum', icon: '✨' },
        { id: 'glasses', label: 'Óculos Redondos', icon: '👓' },
        { id: 'backpack', label: 'Mochila Peixinho', icon: '🎒' },
        { id: 'bowtie', label: 'Gravata Borboleta', icon: '🎀' },
        { id: 'flower_crown', label: 'Coroa de Flores', icon: '🌸' }
      ]
    };
  }

  bindEvents() {
    // Menu Principal -> Vai para Tela de Personalização
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.hideScreen(this.screenMenu);
      this.openCustomizationScreen();
    });

    document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
      this.showModal(this.modalHowToPlay);
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.showModal(this.modalSettings);
    });

    document.getElementById('btn-credits')?.addEventListener('click', () => {
      this.showModal(this.modalCredits);
    });

    // Customização: Voltar ao Menu
    document.getElementById('btn-customization-back')?.addEventListener('click', () => {
      this.hideScreen(this.screenCustomization);
      this.showMenu();
    });

    // Customização: Botões de Rotação
    document.getElementById('btn-rot-left')?.addEventListener('click', () => {
      this.game.rotateCustomCat(-Math.PI / 4);
    });
    document.getElementById('btn-rot-right')?.addEventListener('click', () => {
      this.game.rotateCustomCat(Math.PI / 4);
    });

    // Customização: Abas de Categoria
    document.querySelectorAll('.custom-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.custom-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCustomCategory = tab.getAttribute('data-category');
        this.renderCustomOptions();
      });
    });

    // Customização: Botão Pronto
    document.getElementById('btn-customization-confirm')?.addEventListener('click', () => {
      this.hideScreen(this.screenCustomization);
      this.game.confirmCustomizationAndStart();
    });

    // Fechar Modais
    document.getElementById('btn-close-how')?.addEventListener('click', () => this.hideModal(this.modalHowToPlay));
    document.getElementById('btn-how-start')?.addEventListener('click', () => {
      this.hideModal(this.modalHowToPlay);
      if (this.game.state === 'menu') {
        this.hideScreen(this.screenMenu);
        this.openCustomizationScreen();
      }
    });

    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.hideModal(this.modalSettings));
    document.getElementById('btn-save-settings')?.addEventListener('click', () => this.hideModal(this.modalSettings));
    document.getElementById('btn-close-credits')?.addEventListener('click', () => this.hideModal(this.modalCredits));
    document.getElementById('btn-back-credits')?.addEventListener('click', () => this.hideModal(this.modalCredits));

    // Botões do HUD
    document.getElementById('btn-pause')?.addEventListener('click', () => this.game.togglePause());
    document.getElementById('btn-camera-zoom')?.addEventListener('click', () => this.game.toggleCameraZoom());
    document.getElementById('btn-mute')?.addEventListener('click', () => this.game.toggleMute());

    // Botões de Pausa
    document.getElementById('btn-resume')?.addEventListener('click', () => this.game.togglePause());
    document.getElementById('btn-restart-level')?.addEventListener('click', () => {
      this.hideModal(this.modalPause);
      this.game.restartLevel();
    });
    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      this.hideModal(this.modalPause);
      this.showMenu();
    });

    // Botões de Vitória
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.hideModal(this.modalVictory);
      this.game.nextLevel();
    });
    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.hideModal(this.modalVictory);
      this.showMenu();
    });

    // Botões de Game Over
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.hideModal(this.modalGameOver);
      this.game.restartLevel();
    });
    document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
      this.hideModal(this.modalGameOver);
      this.showMenu();
    });

    // Vitória Final
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.hideModal(this.modalGameComplete);
      this.openCustomizationScreen();
    });

    // Configurações de Áudio
    const sliderMusic = document.getElementById('slider-music');
    const labelMusic = document.getElementById('label-music-val');
    sliderMusic?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (labelMusic) labelMusic.textContent = `${val}%`;
      this.game.musicComposer.setVolume(val / 100);
    });

    const sliderSfx = document.getElementById('slider-sfx');
    const labelSfx = document.getElementById('label-sfx-val');
    sliderSfx?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (labelSfx) labelSfx.textContent = `${val}%`;
      this.game.soundEngine.setVolume(val / 100);
    });

    // Qualidade Gráfica
    document.querySelectorAll('.btn-quality').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-quality').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const quality = btn.getAttribute('data-quality');
        this.game.sceneManager.setQuality(quality);
      });
    });

    // Toggle Pegadas
    const toggleFootprints = document.getElementById('toggle-footprints');
    toggleFootprints?.addEventListener('change', (e) => {
      this.game.particleSystem.footprintEnabled = e.target.checked;
    });
  }

  openCustomizationScreen() {
    this.game.enterCustomizationMode();
    this.screenCustomization.classList.remove('hidden');
    this.renderCustomOptions();
  }

  renderCustomOptions() {
    const container = document.getElementById('custom-options-container');
    if (!container) return;
    container.innerHTML = '';

    const list = this.customCatalog[this.currentCustomCategory] || [];
    const currentVal = this.game.catConfig[this.currentCustomCategory];

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = `custom-option-card ${currentVal === item.id ? 'active' : ''}`;

      if (item.color) {
        const circle = document.createElement('div');
        circle.className = 'option-color-circle';
        circle.style.backgroundColor = item.color;
        card.appendChild(circle);
      } else {
        const icon = document.createElement('div');
        icon.className = 'option-icon';
        icon.textContent = item.icon || '✨';
        card.appendChild(icon);
      }

      const label = document.createElement('div');
      label.className = 'option-label';
      label.textContent = item.label;
      card.appendChild(label);

      card.addEventListener('click', () => {
        document.querySelectorAll('.custom-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Atualiza a personalização em tempo real no gato 3D
        this.game.updateCatCustomization({ [this.currentCustomCategory]: item.id });
        this.game.soundEngine.playEquip();
        this.game.cat.celebrateSpin();
      });

      container.appendChild(card);
    });
  }

  showDoorPrompt(visible, text = 'Abrir Porta (Espaço / Toque)') {
    if (!this.doorPrompt) return;
    if (visible) {
      this.doorPrompt.classList.remove('hidden');
      const textElem = this.doorPrompt.querySelector('.door-prompt-text');
      if (textElem) textElem.textContent = text;
    } else {
      this.doorPrompt.classList.add('hidden');
    }
  }

  showMenu() {
    this.game.state = 'menu';
    this.game.musicComposer.stop();
    this.hud.classList.add('hidden');
    this.screenMenu.classList.remove('hidden');
    this.screenCustomization.classList.add('hidden');
    this.showDoorPrompt(false);
  }

  showHUD() {
    this.hud.classList.remove('hidden');
  }

  hideHUD() {
    this.hud.classList.add('hidden');
  }

  showModal(modal) {
    if (modal) modal.classList.remove('hidden');
  }

  hideModal(modal) {
    if (modal) modal.classList.add('hidden');
  }

  hideScreen(screen) {
    if (screen) screen.classList.add('hidden');
  }

  updateHUD(lives, score, collected, total, time, levelName) {
    // Vidas
    if (this.heartsContainer) {
      const hearts = this.heartsContainer.children;
      for (let i = 0; i < hearts.length; i++) {
        if (i < lives) {
          hearts[i].className = 'heart active';
        } else {
          hearts[i].className = 'heart lost';
        }
      }
    }

    // Pontuação
    if (this.scoreCountElem) {
      this.scoreCountElem.textContent = score;
    }

    // Itens
    if (this.itemsCountElem) {
      this.itemsCountElem.textContent = `${collected} / ${total}`;
    }

    // Nível
    if (this.levelNameElem && levelName) {
      this.levelNameElem.textContent = levelName;
    }

    // Tempo MM:SS
    if (this.timerDisplayElem) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      this.timerDisplayElem.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  animateScore() {
    const el = document.getElementById('hud-score');
    if (el) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
  }

  updatePowerUpBar(activePup, remaining, maxDuration) {
    if (!activePup || remaining <= 0) {
      this.powerupStatus.classList.add('hidden');
      return;
    }

    this.powerupStatus.classList.remove('hidden');
    this.powerupIcon.textContent = activePup.icon;
    this.powerupName.textContent = activePup.name;
    this.powerupTime.textContent = `${Math.ceil(remaining)}s`;

    const pct = (remaining / maxDuration) * 100;
    this.powerupBarFill.style.width = `${pct}%`;
  }

  showToast(text, emoji = '✨') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `${emoji} ${text}`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 1800);
  }

  showVictoryModal(stats) {
    document.getElementById('vic-score').textContent = stats.levelScore;
    const minutes = Math.floor(stats.time / 60);
    const seconds = Math.floor(stats.time % 60);
    document.getElementById('vic-time').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('vic-bonus').textContent = `+${stats.bonus} ⭐`;
    document.getElementById('vic-total').textContent = stats.totalScore;

    this.showModal(this.modalVictory);
  }

  showGameOverModal(stats) {
    document.getElementById('gameover-score').textContent = stats.totalScore;
    document.getElementById('gameover-level').textContent = stats.levelName;

    this.showModal(this.modalGameOver);
  }

  showGameCompleteModal(finalScore) {
    document.getElementById('final-total-score').textContent = finalScore;
    this.showModal(this.modalGameComplete);
  }

  updateMuteIcon(isMuted) {
    const icon = document.getElementById('mute-icon');
    if (icon) {
      icon.textContent = isMuted ? '🔇' : '🔊';
    }
  }
}

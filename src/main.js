import { Game } from './core/Game.js';

/**
 * main.js - Inicialização e Ponto de Entrada da Aplicação
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error('Canvas WebGL não encontrado!');
    return;
  }

  // Inicializa o jogo
  const game = new Game(canvas);

  // Expõe para depuração se necessário
  window.catGame = game;

  console.log('🐱 CAT & MICE inicializado com sucesso! Divirta-se!');
});

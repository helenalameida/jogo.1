import * as THREE from 'three';

/**
 * SceneManager.js - Configuração da Cena 3D, Iluminação Aconchegante e Sombras
 */

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfcf8f2); // Fundo bege pastel aconchegante
    this.scene.fog = new THREE.FogExp2(0xfcf8f2, 0.022);

    // Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Câmera Principal
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.setupLighting();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // 1. Luz Hemisférica (Céu pastel morno / Chão suave)
    this.hemiLight = new THREE.HemisphereLight(0xfff5e6, 0xd0c4b8, 0.85);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    // 2. Luz Direcional Principal com Sombras Macias Estilo Desenho
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.dirLight.position.set(15, 24, 12);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 60;

    const d = 16;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);

    // 3. Luz Ambiente Suave de Preenchimento
    this.ambientLight = new THREE.AmbientLight(0xffebee, 0.45);
    this.scene.add(this.ambientLight);

    // 4. Luz de Toque que acompanha o gatinho para deixá-lo iluminado e fofinho
    this.playerLight = new THREE.PointLight(0xfff3e0, 0.8, 8);
    this.playerLight.position.set(0, 3, 0);
    this.scene.add(this.playerLight);
  }

  updatePlayerLight(targetPos) {
    this.playerLight.position.set(targetPos.x, targetPos.y + 2.5, targetPos.z);
    this.dirLight.target.position.set(targetPos.x, 0, targetPos.z);
    this.dirLight.target.updateMatrixWorld();
  }

  setQuality(quality = 'high') {
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

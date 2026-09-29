import * as THREE from 'three';

/**
 * CameraController.js - Câmera 3D Elevada com Acompanhamento Suave e Zoom
 */

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3(0, 0, 0);

    // Modos de Zoom
    this.isWide = false;
    this.normalOffset = new THREE.Vector3(0, 8.5, 7.0);
    this.wideOffset = new THREE.Vector3(0, 13.0, 10.5);

    this.currentOffset = this.normalOffset.clone();
    this.targetOffset = this.normalOffset.clone();

    this.smoothSpeed = 5.0;
  }

  toggleZoom() {
    this.isWide = !this.isWide;
    this.targetOffset = this.isWide ? this.wideOffset : this.normalOffset;
    return this.isWide;
  }

  update(delta, targetPos) {
    // Interpolação suave do alvo da câmera (acompanha o gatinho)
    this.target.lerp(targetPos, this.smoothSpeed * delta);

    // Interpolação do zoom
    this.currentOffset.lerp(this.targetOffset, this.smoothSpeed * delta);

    // Posiciona a câmera
    this.camera.position.copy(this.target).add(this.currentOffset);
    this.camera.lookAt(this.target.x, this.target.y + 0.5, this.target.z);
  }

  reset(targetPos) {
    this.target.copy(targetPos);
    this.camera.position.copy(this.target).add(this.currentOffset);
    this.camera.lookAt(this.target.x, this.target.y + 0.5, this.target.z);
  }
}

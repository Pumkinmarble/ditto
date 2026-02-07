/**
 * Avatar Renderer using Three.js
 * Handles 3D model loading and animation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface AvatarModel {
  scene: THREE.Group;
  morphTargets: THREE.Mesh[];
  mixer?: THREE.AnimationMixer;
}

export class AvatarRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: AvatarModel | null = null;
  private animationFrameId: number | null = null;

  constructor(container: HTMLElement) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 2);
    this.camera.lookAt(0, 1.5, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Add lights
    this.setupLights();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize(container));
  }

  private setupLights(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Directional light (key light)
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 2, 1);
    this.scene.add(directional);

    // Fill light
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-1, 1, -1);
    this.scene.add(fill);
  }

  private handleResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  /**
   * Load avatar from GLB URL
   */
  async loadAvatar(url: string): Promise<void> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          // Remove old avatar if exists
          if (this.avatar) {
            this.scene.remove(this.avatar.scene);
          }

          // Add new avatar
          this.scene.add(gltf.scene);

          // Find meshes with morph targets (for lip sync)
          const morphTargets: THREE.Mesh[] = [];
          gltf.scene.traverse((node) => {
            if (node instanceof THREE.Mesh && node.morphTargetInfluences) {
              morphTargets.push(node);
            }
          });

          // Create animation mixer
          const mixer = new THREE.AnimationMixer(gltf.scene);

          this.avatar = {
            scene: gltf.scene,
            morphTargets,
            mixer,
          };

          console.log('Avatar loaded:', {
            morphTargets: morphTargets.length,
            animations: gltf.animations.length,
          });

          resolve();
        },
        undefined,
        (error) => {
          console.error('Error loading avatar:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Update blend shapes (for lip sync)
   */
  setBlendShapes(shapes: Record<string, number>): void {
    if (!this.avatar) return;

    this.avatar.morphTargets.forEach((mesh) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

      Object.entries(shapes).forEach(([shapeName, value]) => {
        const index = mesh.morphTargetDictionary[shapeName];
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = value;
        }
      });
    });
  }

  /**
   * Start animation loop
   */
  startAnimation(): void {
    if (this.animationFrameId !== null) return;

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Update animation mixer
      if (this.avatar?.mixer) {
        this.avatar.mixer.update(0.016); // ~60fps
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Stop animation loop
   */
  stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopAnimation();

    if (this.avatar) {
      this.scene.remove(this.avatar.scene);
    }

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /**
   * Get available blend shape names
   */
  getAvailableBlendShapes(): string[] {
    if (!this.avatar) return [];

    const shapes = new Set<string>();

    this.avatar.morphTargets.forEach((mesh) => {
      if (mesh.morphTargetDictionary) {
        Object.keys(mesh.morphTargetDictionary).forEach((name) => {
          shapes.add(name);
        });
      }
    });

    return Array.from(shapes);
  }

  /**
   * Rotate avatar (for demonstration)
   */
  rotateAvatar(angle: number): void {
    if (this.avatar) {
      this.avatar.scene.rotation.y = angle;
    }
  }
}

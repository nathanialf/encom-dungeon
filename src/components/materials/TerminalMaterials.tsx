import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Load textures
const floorTexture = new THREE.TextureLoader().load('/textures/floor-texture.png');
const wallTexture = new THREE.TextureLoader().load('/textures/wall-texture.png');
const ceilingTexture = new THREE.TextureLoader().load('/textures/ceiling-texture.png');

// Configure texture settings for tiling
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);
floorTexture.magFilter = THREE.NearestFilter;
floorTexture.minFilter = THREE.NearestFilter;

wallTexture.wrapS = wallTexture.wrapT = THREE.ClampToEdgeWrapping;
wallTexture.repeat.set(1, 1);
wallTexture.magFilter = THREE.NearestFilter;
wallTexture.minFilter = THREE.NearestFilter;

ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
ceilingTexture.repeat.set(1, 1); // Single texture instance
ceilingTexture.offset.set(0, 0);
ceilingTexture.magFilter = THREE.NearestFilter;
ceilingTexture.minFilter = THREE.NearestFilter;

// Simple texture-based materials
class FloorMaterial extends THREE.MeshBasicMaterial {
  constructor() {
    super({
      map: floorTexture,
    });
  }
}

class WallMaterial extends THREE.MeshBasicMaterial {
  constructor() {
    super({
      map: wallTexture,
    });
  }
}

class CeilingMaterial extends THREE.MeshBasicMaterial {
  constructor() {
    super({
      map: ceilingTexture,
      side: THREE.DoubleSide, // Make ceiling visible from both sides
    });
  }
}

// Extend THREE materials for use in JSX
extend({ FloorMaterial, WallMaterial, CeilingMaterial });

// Type declarations for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      floorMaterial: any;
      wallMaterial: any;
      ceilingMaterial: any;
    }
  }
}

export { FloorMaterial, WallMaterial, CeilingMaterial };
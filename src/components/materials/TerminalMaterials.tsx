import React from 'react';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

// Terminal color scheme
const TERMINAL_COLORS = {
  primary: '#00ff41',      // Bright green
  secondary: '#00cc33',    // Medium green  
  tertiary: '#008822',     // Dark green
  background: '#001100',   // Very dark green
  accent: '#0088ff',       // Blue accent
  darkAccent: '#003366',   // Dark blue
};

// Floor shader with hexagonal grid pattern
const floorVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const floorFragmentShader = `
  uniform float uTime;
  uniform vec3 uPlayerPosition;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // Stone tile pattern
  float stonePattern(vec2 uv) {
    vec2 tileUv = fract(uv * 8.0);
    vec2 tileId = floor(uv * 8.0);
    
    // Add randomness to tile shapes
    float noise = sin(tileId.x * 43.0 + tileId.y * 37.0) * 0.1;
    
    // Create irregular stone shapes
    float stone = 1.0;
    stone *= step(0.05 + noise, tileUv.x);
    stone *= step(tileUv.x, 0.95 - noise);
    stone *= step(0.05 + noise, tileUv.y);
    stone *= step(tileUv.y, 0.95 - noise);
    
    // Add some cracks
    float cracks = 0.0;
    cracks += step(0.98, tileUv.x);
    cracks += step(0.98, tileUv.y);
    cracks += step(tileUv.x, 0.02);
    cracks += step(tileUv.y, 0.02);
    
    return stone * (1.0 - cracks);
  }
  
  
  void main() {
    vec2 uv = vUv;
    
    float pattern = stonePattern(uv);
    
    // Calculate distance from player
    float distanceFromPlayer = length(vWorldPosition - uPlayerPosition);
    
    // Two color palette: black and dark green - no dithering
    vec3 blackColor = vec3(0.0, 0.0, 0.0);
    vec3 greenColor = vec3(0.0, 0.06, 0.05); // Much darker green
    
    // Use pattern directly without dithering
    vec3 color = mix(blackColor, greenColor, pattern);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Wall shader with circuit-like patterns
const wallVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wallFragmentShader = `
  uniform float uTime;
  uniform vec3 uPlayerPosition;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // Brick pattern like the reference image
  float brickPattern(vec2 uv) {
    vec2 brickUv = uv * vec2(8.0, 16.0);
    
    // Offset every other row
    brickUv.x += step(1.0, mod(brickUv.y, 2.0)) * 0.5;
    
    vec2 brickId = floor(brickUv);
    vec2 brickLocal = fract(brickUv);
    
    // Create brick shape with mortar gaps
    float brick = 1.0;
    brick *= step(0.05, brickLocal.x);
    brick *= step(brickLocal.x, 0.95);
    brick *= step(0.05, brickLocal.y);
    brick *= step(brickLocal.y, 0.95);
    
    // Add some random variation to bricks
    float variation = sin(brickId.x * 43.0 + brickId.y * 37.0);
    brick *= step(0.1, variation + 0.8);
    
    return brick;
  }
  
  // Add some weathering details
  float weatheringPattern(vec2 uv) {
    vec2 detailUv = uv * 32.0;
    float detail1 = sin(detailUv.x * 3.0) * sin(detailUv.y * 5.0);
    float detail2 = sin(detailUv.x * 7.0 + 1.0) * sin(detailUv.y * 3.0 + 2.0);
    return step(0.6, detail1) + step(0.7, detail2);
  }
  
  
  void main() {
    vec2 uv = vUv;
    
    float bricks = brickPattern(uv);
    float weathering = weatheringPattern(uv);
    
    // Combine patterns
    float pattern = bricks * (1.0 - weathering * 0.5);
    
    // Calculate distance from player
    float distanceFromPlayer = length(vWorldPosition - uPlayerPosition);
    
    // Two color palette: black and dark green - no dithering
    vec3 blackColor = vec3(0.0, 0.0, 0.0);
    vec3 greenColor = vec3(0.0, 0.06, 0.05); // Much darker green
    
    // Use pattern directly without dithering
    vec3 color = mix(blackColor, greenColor, pattern);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Ceiling shader with data stream effect
const ceilingVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ceilingFragmentShader = `
  uniform float uTime;
  uniform vec3 uPlayerPosition;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // Small irregular curved brick pattern for ceiling
  float radialStonePattern(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    float distance = length(uv - center);
    float angle = atan(uv.y - center.y, uv.x - center.x);
    
    // Normalize angle to 0-1 range
    angle = (angle + 3.14159) / 6.28318;
    
    // Much smaller, irregular brick rings
    float ringSize = 0.025 + sin(distance * 20.0) * 0.01; // Irregular ring sizes
    float ringIndex = floor(distance / ringSize);
    float ringPos = fract(distance / ringSize);
    
    // Irregular number of bricks per ring with randomness
    float baseRingNoise = sin(ringIndex * 17.3) * 0.5 + 0.5;
    float bricksPerRing = max(12.0, ringIndex * 4.0 + baseRingNoise * 8.0);
    float brickIndex = floor(angle * bricksPerRing);
    float brickPos = fract(angle * bricksPerRing);
    
    // Irregular brick offsets and sizes
    float brickNoise = sin(brickIndex * 23.7 + ringIndex * 13.1) * 0.5 + 0.5;
    if (mod(ringIndex, 2.0) > 0.5) {
      brickPos = fract(brickPos + 0.3 + brickNoise * 0.4); // Irregular offset
    }
    
    // Irregular brick shapes and mortar lines
    float irregularRingPos = ringPos + sin(angle * bricksPerRing * 3.0) * 0.1;
    float irregularBrickPos = brickPos + sin(distance * 50.0) * 0.05;
    
    // Thicker, more varied mortar lines
    float mortarThickness = 0.08 + brickNoise * 0.04;
    float radialMortar = smoothstep(0.0, mortarThickness, irregularRingPos) * smoothstep(1.0, 1.0 - mortarThickness, irregularRingPos);
    float angularMortar = smoothstep(0.0, mortarThickness, irregularBrickPos) * smoothstep(1.0, 1.0 - mortarThickness, irregularBrickPos);
    
    // Weathered brick surface
    float weathering = sin(distance * 80.0 + angle * 40.0) * sin(ringIndex * 15.0) * 0.2;
    float brickTexture = 0.8 + weathering + brickNoise * 0.1;
    
    // Combine for irregular, aged appearance
    float isBrick = radialMortar * angularMortar * brickTexture;
    
    return isBrick;
  }
  
  
  void main() {
    vec2 uv = vUv;
    
    float pattern = radialStonePattern(uv);
    
    // Calculate distance from player
    float distanceFromPlayer = length(vWorldPosition - uPlayerPosition);
    
    // Two color palette: black and dark green - no dithering
    vec3 blackColor = vec3(0.0, 0.0, 0.0);
    vec3 greenColor = vec3(0.0, 0.06, 0.05); // Much darker green
    
    // Use pattern directly without dithering
    vec3 color = mix(blackColor, greenColor, pattern);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Load textures
const floorTexture = new THREE.TextureLoader().load('/textures/floor-texture.png');
const wallTexture = new THREE.TextureLoader().load('/textures/wall-texture.png');
const ceilingTexture = new THREE.TextureLoader().load('/textures/ceiling-texture.svg');

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
ceilingTexture.repeat.set(0.5, 0.5);
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
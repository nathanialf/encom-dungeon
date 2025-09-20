import React, { useMemo } from 'react';
import { DungeonHex } from '../types';
import { HexTile } from './HexTile';
import { useGameStore } from '../store/gameStore';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HexGridProps {
  hexes: DungeonHex[];
}

export const HexGrid: React.FC<HexGridProps> = ({ hexes }) => {
  const { player } = useGameStore();
  const { camera } = useThree();
  
  const visibleHexes = useMemo(() => {
    const RENDER_DISTANCE = 150; // Increased render distance
    const playerPos = player.position;
    
    // Round player position to much larger chunks to reduce hitching
    const roundedX = Math.round(playerPos[0] / 75) * 75; // Update every 3 hexes
    const roundedZ = Math.round(playerPos[2] / 75) * 75;
    
    // Use squared distance to avoid sqrt calculation
    const RENDER_DISTANCE_SQUARED = RENDER_DISTANCE * RENDER_DISTANCE;
    
    // Create frustum for culling
    const frustum = new THREE.Frustum();
    const cameraMatrix = new THREE.Matrix4();
    cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraMatrix);
    
    return hexes.filter((hex) => {
      // First check distance (cheap)
      const dx = hex.position.x - roundedX;
      const dz = hex.position.z - roundedZ;
      const distanceSquared = dx * dx + dz * dz;
      if (distanceSquared > RENDER_DISTANCE_SQUARED) {
        return false;
      }
      
      // Then check frustum (more expensive but reduces rendered objects significantly)
      const hexWorldPos = new THREE.Vector3(hex.position.x, hex.position.y, hex.position.z);
      
      // Create a bounding sphere for the hex (radius should cover the hex size)
      const hexRadius = 30; // Approximate hex size + some padding
      const boundingSphere = new THREE.Sphere(hexWorldPos, hexRadius);
      
      return frustum.intersectsSphere(boundingSphere);
    });
  }, [hexes, player.position, Math.round(player.position[0] / 75), Math.round(player.position[2] / 75), camera.projectionMatrix, camera.matrixWorldInverse]);
  
  return (
    <group name="hex-grid">
      {visibleHexes.map((hex) => (
        <HexTile
          key={`${hex.coordinate.q}-${hex.coordinate.r}-${hex.coordinate.s}`}
          hex={hex}
        />
      ))}
    </group>
  );
};
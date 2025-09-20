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
  
  // Create hex lookup map once and memoize it
  const hexMap = useMemo(() => {
    return new Map(hexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  }, [hexes]);
  
  const visibleHexes = useMemo(() => {
    const RENDER_DISTANCE = 300; // Extended render distance for better visibility
    const playerPos = player.position;
    
    // Round player position to large chunks to reduce hitching
    const roundedX = Math.round(playerPos[0] / 50) * 50; // Update every ~2 hexes
    const roundedZ = Math.round(playerPos[2] / 50) * 50;
    
    // Use squared distance to avoid sqrt calculation
    const RENDER_DISTANCE_SQUARED = RENDER_DISTANCE * RENDER_DISTANCE;
    
    return hexes.filter((hex) => {
      const dx = hex.position.x - roundedX;
      const dz = hex.position.z - roundedZ;
      const distanceSquared = dx * dx + dz * dz;
      return distanceSquared <= RENDER_DISTANCE_SQUARED;
    });
    // Only recalculate when rounded position changes
  }, [hexes, Math.round(player.position[0] / 50), Math.round(player.position[2] / 50)]);
  
  return (
    <group name="hex-grid">
      {visibleHexes.map((hex) => (
        <HexTile
          key={`${hex.coordinate.q}-${hex.coordinate.r}-${hex.coordinate.s}`}
          hex={hex}
          hexMap={hexMap}
        />
      ))}
    </group>
  );
};
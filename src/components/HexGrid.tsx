import React, { useMemo } from 'react';
import { DungeonHex } from '../types';
import { HexTile } from './HexTile';
import { CentralWalls } from './CentralWalls';
import { useGameStore } from '../store/gameStore';

interface HexGridProps {
  hexes: DungeonHex[];
}

export const HexGrid: React.FC<HexGridProps> = ({ hexes }) => {
  const { player } = useGameStore();
  
  // Create hex lookup map once and memoize it
  const hexMap = useMemo(() => {
    return new Map(hexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  }, [hexes]);
  
  const visibleHexes = useMemo(() => {
    const RENDER_DISTANCE = 300;
    const playerPos = player.position;
    
    // Round player position to larger chunks to reduce hitching further
    const roundedX = Math.round(playerPos[0] / 100) * 100; // Update every ~4 hexes
    const roundedZ = Math.round(playerPos[2] / 100) * 100;
    
    // Use squared distance to avoid sqrt calculation
    const RENDER_DISTANCE_SQUARED = RENDER_DISTANCE * RENDER_DISTANCE;
    
    return hexes.filter((hex) => {
      const dx = hex.position.x - roundedX;
      const dz = hex.position.z - roundedZ;
      const distanceSquared = dx * dx + dz * dz;
      return distanceSquared <= RENDER_DISTANCE_SQUARED;
    });
    // Only recalculate when rounded position changes
  }, [hexes, player.position]);  // Include player.position dependency as required
  
  return (
    <group name="hex-grid" userData={{ hexCount: visibleHexes.length }}>
      {/* Hex tiles without walls */}
      {visibleHexes.map((hex) => (
        <HexTile
          key={`${hex.coordinate.q}-${hex.coordinate.r}-${hex.coordinate.s}`}
          hex={hex}
          hexMap={hexMap}
          renderWalls={false}
        />
      ))}
      
      {/* Centralized wall system */}
      <CentralWalls hexes={visibleHexes} />
    </group>
  );
};
import React, { useMemo } from 'react';
import { DungeonHex } from '../types';
import { HexTile } from './HexTile';
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
    const RENDER_DISTANCE = 300; // Restored since effects were the issue
    const playerPos = player.position;
    
    // Round player position to large chunks to reduce hitching
    const roundedX = Math.round(playerPos[0] / 50) * 50; // Update every ~2 hexes
    const roundedZ = Math.round(playerPos[2] / 50) * 50;
    
    // Use squared distance to avoid sqrt calculation
    const RENDER_DISTANCE_SQUARED = RENDER_DISTANCE * RENDER_DISTANCE;
    
    const visibleHexes = hexes.filter((hex) => {
      const dx = hex.position.x - roundedX;
      const dz = hex.position.z - roundedZ;
      const distanceSquared = dx * dx + dz * dz;
      return distanceSquared <= RENDER_DISTANCE_SQUARED;
    });
    
    // Limit initial render count to prevent WebGL context loss
    const MAX_INITIAL_HEXES = 100;
    if (visibleHexes.length > MAX_INITIAL_HEXES) {
      // Sort by distance and take closest hexes first
      return visibleHexes
        .map(hex => ({
          hex,
          distance: (hex.position.x - roundedX) ** 2 + (hex.position.z - roundedZ) ** 2
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_INITIAL_HEXES)
        .map(item => item.hex);
    }
    
    return visibleHexes;
    // Only recalculate when rounded position changes
  }, [hexes, player.position]);  // Include player.position dependency as required
  
  return (
    <group name="hex-grid" userData={{ hexCount: visibleHexes.length }}>
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
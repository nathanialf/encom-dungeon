import React, { useMemo, memo } from 'react';
import * as THREE from 'three';
import { DungeonHex } from '../types';
import { HEX_SIZE, HEX_HEIGHT_SCALE, getNeighborType } from '../utils/hexUtils';
import { useGameStore } from '../store/gameStore';
import './materials/TerminalMaterials';

interface HexTileProps {
  hex: DungeonHex;
}

// Doorway wall component - just two side rectangles with black spanning planes
const DoorwayWall: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}> = ({ position, rotation, width, height }) => {
  // Create geometries with proper UV scaling to prevent texture squishing
  const leftSegmentGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(width * 0.3, height, 0.2);
    // Scale UV coordinates to maintain texture aspect ratio
    const uvScale = 0.3; // Since we're using 30% of the original width
    geometry.attributes.uv.array.forEach((_: number, i: number) => {
      if (i % 2 === 0) { // X coordinates
        geometry.attributes.uv.array[i] *= uvScale;
      }
    });
    return geometry;
  }, [width, height]);
  
  const rightSegmentGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(width * 0.3, height, 0.2);
    // Scale UV coordinates to maintain texture aspect ratio
    const uvScale = 0.3; // Since we're using 30% of the original width
    geometry.attributes.uv.array.forEach((_: number, i: number) => {
      if (i % 2 === 0) { // X coordinates
        geometry.attributes.uv.array[i] *= uvScale;
      }
    });
    return geometry;
  }, [width, height]);

  return (
    <group position={position} rotation={rotation}>
      {/* Left wall segment */}
      <mesh position={[-width * 0.35, height / 2, 0]} geometry={leftSegmentGeometry}>
        <wallMaterial />
      </mesh>
      
      {/* Right wall segment */}
      <mesh position={[width * 0.35, height / 2, 0]} geometry={rightSegmentGeometry}>
        <wallMaterial />
      </mesh>
      
      {/* Black doorframe on left edge of opening */}
      <mesh position={[-width * 0.2, height / 2, 0.05]}>
        <boxGeometry args={[0.45, height, 0.45]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Black doorframe on right edge of opening */}
      <mesh position={[width * 0.2, height / 2, 0.05]}>
        <boxGeometry args={[0.45, height, 0.45]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export const HexTile: React.FC<HexTileProps> = memo(({ hex }) => {
  const { dungeon } = useGameStore();
  
  const hexGeometry = useMemo(() => {
    const radius = HEX_SIZE;
    const rawHeight = typeof hex.height === 'number' ? hex.height : 1;
    const height = Math.max(0.1, rawHeight * HEX_HEIGHT_SCALE);
    
    // Validate that we have valid numbers
    if (isNaN(radius) || isNaN(height) || hex.height === undefined) {
      return null;
    }
    
    return { radius, height };
  }, [hex.height]);

  if (!hexGeometry) {
    return null;
  }


  // Validate position values
  const position = [
    isNaN(hex.position.x) ? 0 : hex.position.x,
    isNaN(hex.position.y) ? 0 : hex.position.y,
    isNaN(hex.position.z) ? 0 : hex.position.z
  ] as [number, number, number];

  return (
    <group position={position}>
      {/* Floor - full hex size, no gaps */}
      <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[hexGeometry.radius, hexGeometry.radius, 0.1, 6]} />
        <floorMaterial />
      </mesh>
      
      {/* Ceiling - flush with wall height */}
      {hex.isWalkable && (
        <mesh position={[0, hexGeometry.height + 0.05, 0]} rotation={[0, Math.PI / 6, Math.PI]}>
          <cylinderGeometry args={[hexGeometry.radius, hexGeometry.radius, 0.1, 6]} />
          <ceilingMaterial />
        </mesh>
      )}
      
      {/* Walls for non-walkable hexes */}
      {!hex.isWalkable && (
        <mesh position={[0, hexGeometry.height / 2 + 0.1, 0]} rotation={[0, Math.PI / 6, 0]}>
          <cylinderGeometry args={[hexGeometry.radius * 0.95, hexGeometry.radius * 0.95, hexGeometry.height, 6]} />
          <wallMaterial />
        </mesh>
      )}
      
      {/* North wall - between top-left and top-right pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'north', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[0, hexGeometry.height / 2, -hexGeometry.radius * 0.866]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[0, 0, -hexGeometry.radius * 0.866]}
              rotation={[0, 0, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* South wall - between bottom-left and bottom-right pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'south', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[0, hexGeometry.height / 2, hexGeometry.radius * 0.866]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[0, 0, hexGeometry.radius * 0.866]}
              rotation={[0, 0, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* Northeast wall - between top-right and right pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'northeast', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[hexGeometry.radius * 0.75, hexGeometry.height / 2, -hexGeometry.radius * 0.433]} rotation={[0, -Math.PI / 3, 0]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[hexGeometry.radius * 0.75, 0, -hexGeometry.radius * 0.433]}
              rotation={[0, -Math.PI / 3, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* Southeast wall - between right and bottom-right pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'southeast', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[hexGeometry.radius * 0.75, hexGeometry.height / 2, hexGeometry.radius * 0.433]} rotation={[0, Math.PI / 3, 0]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[hexGeometry.radius * 0.75, 0, hexGeometry.radius * 0.433]}
              rotation={[0, Math.PI / 3, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* Southwest wall - between bottom-left and left pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'southwest', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[-hexGeometry.radius * 0.75, hexGeometry.height / 2, hexGeometry.radius * 0.433]} rotation={[0, -Math.PI / 3, 0]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[-hexGeometry.radius * 0.75, 0, hexGeometry.radius * 0.433]}
              rotation={[0, -Math.PI / 3, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* Northwest wall - between left and top-left pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborType(hex, 'northwest', dungeon);
        if (neighborType === 'wall') {
          return (
            <mesh position={[-hexGeometry.radius * 0.75, hexGeometry.height / 2, -hexGeometry.radius * 0.433]} rotation={[0, Math.PI / 3, 0]}>
              <boxGeometry args={[hexGeometry.radius, hexGeometry.height, 0.2]} />
              <wallMaterial />
            </mesh>
          );
        } else if (neighborType === 'doorway') {
          return (
            <DoorwayWall
              position={[-hexGeometry.radius * 0.75, 0, -hexGeometry.radius * 0.433]}
              rotation={[0, Math.PI / 3, 0]}
              width={hexGeometry.radius}
              height={hexGeometry.height}
            />
          );
        }
        return null;
      })()}
      
      {/* Reduced lighting for performance */}
      {hex.lighting.intensity > 0 && hex.height > 6 && (
        <pointLight
          position={[0, hexGeometry.height + 2, 0]}
          color={hex.lighting.color}
          intensity={hex.lighting.intensity * 0.05}
          distance={hexGeometry.radius * 2}
        />
      )}
    </group>
  );
});
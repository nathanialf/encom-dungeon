import React, { useMemo, memo } from 'react';
import * as THREE from 'three';
import { DungeonHex, WallConfiguration } from '../types';
import { HEX_SIZE, HEX_HEIGHT_SCALE, hexNeighbors } from '../utils/hexUtils';
import './materials/TerminalMaterials';

// Optimized neighbor type check using the pre-built map
function getNeighborTypeOptimized(hex: DungeonHex, direction: keyof WallConfiguration, hexMap: Map<string, DungeonHex>): 'none' | 'wall' | 'doorway' {
  const neighbors = hexNeighbors(hex.coordinate);
  const wallDirections = ['southeast', 'northeast', 'north', 'northwest', 'southwest', 'south'] as const;
  const directionIndex = wallDirections.indexOf(direction);
  
  if (directionIndex === -1) return 'wall';
  
  const neighborCoord = neighbors[directionIndex];
  const neighborKey = `${neighborCoord.q},${neighborCoord.r}`;
  const physicalNeighbor = hexMap.get(neighborKey);
  
  // If no physical neighbor exists, it's a wall
  if (!physicalNeighbor) {
    return 'wall';
  }
  
  // Check if this physical neighbor is in our connections
  const isConnected = hex.connections.includes(physicalNeighbor.id);
  
  if (!isConnected) {
    // Physical neighbor exists but no connection = wall
    return 'wall';
  }
  
  // Connected neighbor - check type for doorway vs open
  if (physicalNeighbor.type === 'CORRIDOR') {
    return 'doorway';
  }
  
  // Connected to room = no wall
  return 'none';
}

interface HexTileProps {
  hex: DungeonHex;
  hexMap: Map<string, DungeonHex>;
}

// Shared geometries to prevent memory leaks
const sharedGeometries = {
  leftSegment: new THREE.BoxGeometry(1, 1, 0.2),
  rightSegment: new THREE.BoxGeometry(1, 1, 0.2),
  doorFrame: new THREE.BoxGeometry(0.45, 1, 0.45)
};

// Scale UV coordinates once for shared geometries
[sharedGeometries.leftSegment, sharedGeometries.rightSegment].forEach(geometry => {
  const uvScale = 0.3;
  geometry.attributes.uv.array.forEach((_: number, i: number) => {
    if (i % 2 === 0) { // X coordinates
      geometry.attributes.uv.array[i] *= uvScale;
    }
  });
});

// Doorway wall component - just two side rectangles with black spanning planes
const DoorwayWall: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}> = ({ position, rotation, width, height }) => {

  return (
    <group position={position} rotation={rotation}>
      {/* Left wall segment - use shared geometry with scale */}
      <mesh 
        position={[-width * 0.35, height / 2, 0]} 
        geometry={sharedGeometries.leftSegment}
        scale={[width * 0.3, height, 1]}
      >
        <wallMaterial />
      </mesh>
      
      {/* Right wall segment - use shared geometry with scale */}
      <mesh 
        position={[width * 0.35, height / 2, 0]} 
        geometry={sharedGeometries.rightSegment}
        scale={[width * 0.3, height, 1]}
      >
        <wallMaterial />
      </mesh>
      
      {/* Black doorframe on left edge of opening */}
      <mesh 
        position={[-width * 0.2, height / 2, 0.05]}
        geometry={sharedGeometries.doorFrame}
        scale={[1, height, 1]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Black doorframe on right edge of opening */}
      <mesh 
        position={[width * 0.2, height / 2, 0.05]}
        geometry={sharedGeometries.doorFrame}
        scale={[1, height, 1]}
      >
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
};

// Shared hex geometries to prevent memory leaks
const sharedHexGeometries = {
  floor: new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, 0.1, 6),
  ceiling: new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, 0.1, 6),
  wall: new THREE.CylinderGeometry(HEX_SIZE * 0.95, HEX_SIZE * 0.95, 1, 6),
  wallBox: new THREE.BoxGeometry(HEX_SIZE, 1, 0.2)
};

// Cleanup function to dispose geometries on page unload
if (typeof window !== 'undefined') {
  const cleanupGeometries = () => {
    Object.values(sharedHexGeometries).forEach(geometry => {
      geometry.dispose();
    });
    Object.values(sharedGeometries).forEach(geometry => {
      geometry.dispose();
    });
  };
  
  window.addEventListener('beforeunload', cleanupGeometries);
}

export const HexTile: React.FC<HexTileProps> = memo(({ hex, hexMap }) => {
  
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
      {/* Floor - use shared geometry with scale */}
      <mesh 
        position={[0, 0.05, 0]} 
        rotation={[0, Math.PI / 6, 0]}
        geometry={sharedHexGeometries.floor}
        scale={[hexGeometry.radius / HEX_SIZE, 1, hexGeometry.radius / HEX_SIZE]}
      >
        <floorMaterial />
      </mesh>
      
      {/* Ceiling - use shared geometry with scale */}
      {hex.isWalkable && (
        <mesh 
          position={[0, hexGeometry.height + 0.05, 0]} 
          rotation={[0, Math.PI / 6, Math.PI]}
          geometry={sharedHexGeometries.ceiling}
          scale={[hexGeometry.radius / HEX_SIZE, 1, hexGeometry.radius / HEX_SIZE]}
        >
          <ceilingMaterial />
        </mesh>
      )}
      
      {/* Walls for non-walkable hexes - use shared geometry with scale */}
      {!hex.isWalkable && (
        <mesh 
          position={[0, hexGeometry.height / 2 + 0.1, 0]} 
          rotation={[0, Math.PI / 6, 0]}
          geometry={sharedHexGeometries.wall}
          scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, hexGeometry.radius / HEX_SIZE]}
        >
          <wallMaterial />
        </mesh>
      )}
      
      {/* North wall - between top-left and top-right pillars */}
      {hex.isWalkable && (() => {
        const neighborType = getNeighborTypeOptimized(hex, 'north', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[0, hexGeometry.height / 2, -hexGeometry.radius * 0.866]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
        const neighborType = getNeighborTypeOptimized(hex, 'south', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[0, hexGeometry.height / 2, hexGeometry.radius * 0.866]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
        const neighborType = getNeighborTypeOptimized(hex, 'northeast', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[hexGeometry.radius * 0.75, hexGeometry.height / 2, -hexGeometry.radius * 0.433]} 
              rotation={[0, -Math.PI / 3, 0]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
        const neighborType = getNeighborTypeOptimized(hex, 'southeast', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[hexGeometry.radius * 0.75, hexGeometry.height / 2, hexGeometry.radius * 0.433]} 
              rotation={[0, Math.PI / 3, 0]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
        const neighborType = getNeighborTypeOptimized(hex, 'southwest', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[-hexGeometry.radius * 0.75, hexGeometry.height / 2, hexGeometry.radius * 0.433]} 
              rotation={[0, -Math.PI / 3, 0]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
        const neighborType = getNeighborTypeOptimized(hex, 'northwest', hexMap);
        if (neighborType === 'wall') {
          return (
            <mesh 
              position={[-hexGeometry.radius * 0.75, hexGeometry.height / 2, -hexGeometry.radius * 0.433]} 
              rotation={[0, Math.PI / 3, 0]}
              geometry={sharedHexGeometries.wallBox}
              scale={[hexGeometry.radius / HEX_SIZE, hexGeometry.height, 1]}
            >
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
import React, { useMemo } from 'react';
import { generateDeduplicatedWalls } from '../utils/wallDeduplication';
import { DungeonHex } from '../types';

interface CentralWallsProps {
  hexes: DungeonHex[];
}

const DoorwayWall: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}> = ({ position, rotation, width, height }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Left wall segment */}
      <mesh 
        position={[-width * 0.35, height / 2, 0]} 
        scale={[width * 0.3, height, 0.2]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <wallMaterial />
      </mesh>
      
      {/* Right wall segment */}
      <mesh 
        position={[width * 0.35, height / 2, 0]} 
        scale={[width * 0.3, height, 0.2]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <wallMaterial />
      </mesh>
      
      {/* Black doorframe on left edge */}
      <mesh 
        position={[-width * 0.2, height / 2, 0.05]}
        scale={[0.45, height, 0.45]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Black doorframe on right edge */}
      <mesh 
        position={[width * 0.2, height / 2, 0.05]}
        scale={[0.45, height, 0.45]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export const CentralWalls: React.FC<CentralWallsProps> = ({ hexes }) => {
  const { walls, doorways } = useMemo(() => {
    return generateDeduplicatedWalls(hexes);
  }, [hexes]);

  return (
    <group name="central-walls">
      {/* Regular walls */}
      {walls.map((wall) => (
        <mesh
          key={wall.id}
          position={[wall.position[0], wall.height / 2, wall.position[2]]}
          rotation={wall.rotation}
          scale={[wall.width / 25, wall.height, 1]}
        >
          <boxGeometry args={[25, 1, 0.2]} />
          <wallMaterial />
        </mesh>
      ))}
      
      {/* Doorway walls */}
      {doorways.map((doorway) => (
        <DoorwayWall
          key={doorway.id}
          position={doorway.position}
          rotation={doorway.rotation}
          width={doorway.width}
          height={doorway.height}
        />
      ))}
    </group>
  );
};
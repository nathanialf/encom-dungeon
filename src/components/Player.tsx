import React from 'react';
import { useGameStore } from '../store/gameStore';

export const Player: React.FC = () => {
  const { player } = useGameStore();

  return (
    <group position={player.position} rotation={player.rotation}>
      <mesh>
        <capsuleGeometry args={[0.3, 1.6]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  );
};
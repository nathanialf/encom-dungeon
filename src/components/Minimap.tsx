import React from 'react';
import { useGameStore } from '../store/gameStore';
import { isCorridorHex } from '../utils/hexUtils';

export const Minimap: React.FC = () => {
  const { dungeon, player } = useGameStore();
  
  const MAP_SIZE = 350;
  const SCALE = 0.5;

  // Player stays in center
  const playerX = MAP_SIZE / 2;
  const playerZ = MAP_SIZE / 2;
  
  // Map rotation values to minimap degrees
  // North=3.14 -> 0°, East=1.57 -> 90°, South=0/6.28 -> 180°, West=4.71 -> 270°
  let rotationDegrees;
  
  if (player.rotation[1] >= 3.14) {
    // North side (3.14 to 6.28) maps to 0° to 180°
    rotationDegrees = (player.rotation[1] - 3.14) * (180 / 3.14);
  } else {
    // South side (0 to 3.14) maps to 180° to 360°
    rotationDegrees = 180 + (player.rotation[1] * (180 / 3.14));
  }
  

  return (
    <div
      style={{
        width: `${MAP_SIZE}px`,
        height: `${MAP_SIZE}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #00ff00',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {dungeon.map((hex) => {
          // World moves relative to player
          const x = (hex.position.x - player.position[0]) * SCALE + MAP_SIZE / 2;
          const z = (hex.position.z - player.position[2]) * SCALE + MAP_SIZE / 2;
          
          if (x < -10 || x > MAP_SIZE + 10 || z < -10 || z > MAP_SIZE + 10) return null;
          
          return (
            <circle
              key={`${hex.coordinate.q}-${hex.coordinate.r}`}
              cx={x}
              cy={z}
              r={3}
              fill={
                hex.isWalkable 
                  ? (isCorridorHex(hex) ? '#4169E1' : '#FFD700') // blue for corridors, yellow for rooms
                  : '#ff0000' // red for non-walkable
              }
              opacity={0.8}
            />
          );
        })}
        
        {/* Player dot */}
        <circle
          cx={playerX}
          cy={playerZ}
          r={4}
          fill="#ffffff"
          stroke="#00ff00"
          strokeWidth={2}
        />
        
        {/* Direction triangle - flip rotation direction */}
        <polygon
          points={`${playerX},${playerZ - 8} ${playerX - 4},${playerZ + 4} ${playerX + 4},${playerZ + 4}`}
          fill="#ffffff"
          stroke="#00ff00"
          strokeWidth={1}
          transform={`rotate(${-rotationDegrees}, ${playerX}, ${playerZ})`}
        />
      </svg>
      
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          left: '5px',
          fontSize: '10px',
          color: '#00ff00',
        }}
      >
        MINIMAP
      </div>
    </div>
  );
};
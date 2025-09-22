import { DungeonHex, HexCoordinate, WallConfiguration } from '../types';
import { hexNeighbors, HEX_SIZE } from './hexUtils';

export interface WallSegment {
  id: string;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  type: 'wall' | 'doorway';
  hexIds: string[];
}

export interface WallSystem {
  walls: WallSegment[];
  doorways: WallSegment[];
}

function getWallId(hex1: HexCoordinate, hex2: HexCoordinate, direction: string): string {
  const [minHex, maxHex] = [hex1, hex2].sort((a, b) => {
    if (a.q !== b.q) return a.q - b.q;
    if (a.r !== b.r) return a.r - b.r;
    return a.s - b.s;
  });
  return `${minHex.q},${minHex.r}_${maxHex.q},${maxHex.r}_${direction}`;
}

function getWallPositionAndRotation(
  hex: DungeonHex, 
  direction: keyof WallConfiguration
): { position: [number, number, number]; rotation: [number, number, number]; width: number } {
  const radius = HEX_SIZE;
  const basePosition = hex.position;
  
  const wallConfigs = {
    north: {
      position: [0, 0, -radius * 0.866] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      width: radius
    },
    south: {
      position: [0, 0, radius * 0.866] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      width: radius
    },
    northeast: {
      position: [radius * 0.75, 0, -radius * 0.433] as [number, number, number],
      rotation: [0, -Math.PI / 3, 0] as [number, number, number],
      width: radius
    },
    southeast: {
      position: [radius * 0.75, 0, radius * 0.433] as [number, number, number],
      rotation: [0, Math.PI / 3, 0] as [number, number, number],
      width: radius
    },
    southwest: {
      position: [-radius * 0.75, 0, radius * 0.433] as [number, number, number],
      rotation: [0, -Math.PI / 3, 0] as [number, number, number],
      width: radius
    },
    northwest: {
      position: [-radius * 0.75, 0, -radius * 0.433] as [number, number, number],
      rotation: [0, Math.PI / 3, 0] as [number, number, number],
      width: radius
    }
  };

  const config = wallConfigs[direction];
  return {
    position: [
      basePosition.x + config.position[0],
      basePosition.y + config.position[1],
      basePosition.z + config.position[2]
    ],
    rotation: config.rotation,
    width: config.width
  };
}

function getNeighborTypeForWall(hex: DungeonHex, direction: keyof WallConfiguration, hexMap: Map<string, DungeonHex>): 'none' | 'wall' | 'doorway' {
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

export function generateDeduplicatedWalls(dungeon: DungeonHex[]): WallSystem {
  const hexMap = new Map(dungeon.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  const processedWalls = new Set<string>();
  const walls: WallSegment[] = [];
  const doorways: WallSegment[] = [];

  for (const hex of dungeon) {
    if (!hex.isWalkable) continue;

    const wallDirections: (keyof WallConfiguration)[] = [
      'southeast', 'northeast', 'north', 'northwest', 'southwest', 'south'
    ];

    for (const direction of wallDirections) {
      const neighbors = hexNeighbors(hex.coordinate);
      const directionIndex = wallDirections.indexOf(direction);
      
      if (directionIndex === -1) continue;
      
      const neighborCoord = neighbors[directionIndex];
      const wallId = getWallId(hex.coordinate, neighborCoord, direction);
      
      if (processedWalls.has(wallId)) continue;
      processedWalls.add(wallId);

      const wallType = getNeighborTypeForWall(hex, direction, hexMap);
      
      if (wallType === 'none') continue;

      const wallConfig = getWallPositionAndRotation(hex, direction);
      const height = hex.height * 12; // HEX_HEIGHT_SCALE

      const wallSegment: WallSegment = {
        id: wallId,
        startPosition: [
          wallConfig.position[0] - Math.cos(wallConfig.rotation[1]) * wallConfig.width / 2,
          wallConfig.position[1],
          wallConfig.position[2] - Math.sin(wallConfig.rotation[1]) * wallConfig.width / 2
        ],
        endPosition: [
          wallConfig.position[0] + Math.cos(wallConfig.rotation[1]) * wallConfig.width / 2,
          wallConfig.position[1],
          wallConfig.position[2] + Math.sin(wallConfig.rotation[1]) * wallConfig.width / 2
        ],
        position: wallConfig.position,
        rotation: wallConfig.rotation,
        width: wallConfig.width,
        height,
        type: wallType,
        hexIds: [hex.id]
      };

      if (wallType === 'wall') {
        walls.push(wallSegment);
      } else if (wallType === 'doorway') {
        doorways.push(wallSegment);
      }
    }
  }

  return { walls, doorways };
}
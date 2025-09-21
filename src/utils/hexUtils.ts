import { HexCoordinate, HexPosition, DungeonHex, WallConfiguration } from '../types';

export const HEX_SIZE = 25;
export const HEX_HEIGHT_SCALE = 12;

export function hexToPosition(hex: HexCoordinate): HexPosition {
  // Validate input coordinates
  const q = isNaN(hex.q) ? 0 : hex.q;
  const r = isNaN(hex.r) ? 0 : hex.r;
  
  // Flat-top hex orientation
  const x = HEX_SIZE * (3/2 * q);
  const z = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  
  // Validate output
  return { 
    x: isNaN(x) ? 0 : x, 
    y: 0, 
    z: isNaN(z) ? 0 : z 
  };
}

export function positionToHex(position: HexPosition): HexCoordinate {
  const q = Math.round((2/3 * position.x) / HEX_SIZE);
  const r = Math.round((Math.sqrt(3) * position.z - position.x) / (3 * HEX_SIZE));
  const s = -q - r;
  return { q, r, s };
}

export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

export function hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions = [
    { q: 1, r: 0, s: -1 },   // east
    { q: 1, r: -1, s: 0 },   // northeast
    { q: 0, r: -1, s: 1 },   // north
    { q: -1, r: 0, s: 1 },   // west
    { q: -1, r: 1, s: 0 },   // southwest
    { q: 0, r: 1, s: -1 },   // south
  ];

  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
    s: hex.s + dir.s,
  }));
}

export function determineWalls(hex: DungeonHex, allHexes: DungeonHex[], hexMap?: Map<string, DungeonHex>): WallConfiguration {
  const neighbors = hexNeighbors(hex.coordinate);
  const coordMap = hexMap || new Map(allHexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  
  const walls: WallConfiguration = {
    north: false,
    northeast: false,
    southeast: false,
    south: false,
    southwest: false,
    northwest: false,
  };

  // For flat-top hexagons, the neighbor order from HLD: [+1,0], [+1,-1], [0,-1], [-1,0], [-1,+1], [0,+1]
  // Map to visual directions: southeast, northeast, north, northwest, southwest, south
  const wallDirections = ['southeast', 'northeast', 'north', 'northwest', 'southwest', 'south'] as const;
  
  neighbors.forEach((neighborCoord, index) => {
    const neighborKey = `${neighborCoord.q},${neighborCoord.r}`;
    const neighbor = coordMap.get(neighborKey);
    
    const direction = wallDirections[index];
    
    // Place wall if:
    // 1. No neighbor exists at this position
    // 2. Neighbor is not walkable 
    // 3. Height difference is too large (creates a step/cliff)
    if (!neighbor || !neighbor.isWalkable || Math.abs(neighbor.height - hex.height) > 2) {
      walls[direction] = true;
    }
  });

  return walls;
}

export function isCorridorHex(hex: DungeonHex): boolean {
  return hex.type === 'CORRIDOR';
}

export function getNeighborType(hex: DungeonHex, direction: keyof WallConfiguration, allHexes: DungeonHex[]): 'none' | 'wall' | 'doorway' {
  
  // Get physical neighbors to map direction to hex ID
  const neighbors = hexNeighbors(hex.coordinate);
  const coordToHexMap = new Map(allHexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  
  const wallDirections = ['southeast', 'northeast', 'north', 'northwest', 'southwest', 'south'] as const;
  const directionIndex = wallDirections.indexOf(direction);
  
  if (directionIndex === -1) return 'wall';
  
  const neighborCoord = neighbors[directionIndex];
  const neighborKey = `${neighborCoord.q},${neighborCoord.r}`;
  const physicalNeighbor = coordToHexMap.get(neighborKey);
  
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
  if (isCorridorHex(physicalNeighbor)) {
    return 'doorway';
  }
  
  // Connected to room = no wall
  return 'none';
}

export function hexKey(hex: HexCoordinate): string {
  return `${hex.q},${hex.r},${hex.s}`;
}

export function isValidHex(hex: HexCoordinate): boolean {
  return hex.q + hex.r + hex.s === 0;
}

export function hexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
  if (radius === 0) return [center];
  
  const results: HexCoordinate[] = [];
  let hex = {
    q: center.q,
    r: center.r - radius,
    s: center.s + radius,
  };

  const directions = [
    { q: 0, r: -1, s: 1 },   // north
    { q: 1, r: -1, s: 0 },   // northeast
    { q: 1, r: 0, s: -1 },   // southeast
    { q: 0, r: 1, s: -1 },   // south
    { q: -1, r: 1, s: 0 },   // southwest
    { q: -1, r: 0, s: 1 },   // northwest
  ];

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ ...hex });
      hex.q += directions[i].q;
      hex.r += directions[i].r;
      hex.s += directions[i].s;
    }
  }

  return results;
}

export function hexSpiral(center: HexCoordinate, radius: number): HexCoordinate[] {
  const results = [center];
  for (let r = 1; r <= radius; r++) {
    results.push(...hexRing(center, r));
  }
  return results;
}


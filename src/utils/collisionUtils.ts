import { Vector3 } from 'three';
import { DungeonHex, WallConfiguration } from '../types';
import { hexToPosition, HEX_SIZE, hexNeighbors } from './hexUtils';

export const PLAYER_RADIUS = 1.5; // Player collision radius

// Collision box representing a wall segment
export interface CollisionBox {
  center: Vector3;
  width: number;
  height: number;
  depth: number;
  rotation: number; // Y-axis rotation in radians
}

// Get neighbor type using the same logic as HexTile
function getNeighborType(hex: DungeonHex, direction: keyof WallConfiguration, hexMap: Map<string, DungeonHex>): 'none' | 'wall' | 'doorway' {
  const neighbors = hexNeighbors(hex.coordinate);
  const wallDirections = ['southeast', 'northeast', 'north', 'northwest', 'southwest', 'south'] as const;
  const directionIndex = wallDirections.indexOf(direction);
  
  if (directionIndex === -1) return 'wall';
  
  const neighborCoord = neighbors[directionIndex];
  const neighborKey = `${neighborCoord.q},${neighborCoord.r}`;
  const physicalNeighbor = hexMap.get(neighborKey);
  
  if (!physicalNeighbor) {
    return 'wall';
  }
  
  const isConnected = hex.connections.includes(physicalNeighbor.id);
  
  if (!isConnected) {
    return 'wall';
  }
  
  if (physicalNeighbor.type === 'CORRIDOR') {
    return 'doorway';
  }
  
  return 'none';
}

// Generate collision boxes for all walls in a hex
export function generateHexCollisionBoxes(hex: DungeonHex, hexMap: Map<string, DungeonHex>): CollisionBox[] {
  if (!hex.isWalkable) {
    return []; // Non-walkable hexes don't need wall collision (they're solid)
  }

  const collisionBoxes: CollisionBox[] = [];
  const hexCenter = hexToPosition(hex.coordinate);
  const hexHeight = Math.max(0.1, hex.height * 12); // HEX_HEIGHT_SCALE = 12

  // Wall definitions matching HexTile.tsx exactly
  const wallDefinitions = [
    { 
      direction: 'north' as keyof WallConfiguration, 
      position: [0, hexHeight / 2, -HEX_SIZE * 0.866],
      rotation: 0,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    },
    { 
      direction: 'northeast' as keyof WallConfiguration, 
      position: [HEX_SIZE * 0.75, hexHeight / 2, -HEX_SIZE * 0.433],
      rotation: Math.PI / 3,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    },
    { 
      direction: 'southeast' as keyof WallConfiguration, 
      position: [HEX_SIZE * 0.75, hexHeight / 2, HEX_SIZE * 0.433],
      rotation: -Math.PI / 3,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    },
    { 
      direction: 'south' as keyof WallConfiguration, 
      position: [0, hexHeight / 2, HEX_SIZE * 0.866],
      rotation: 0,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    },
    { 
      direction: 'southwest' as keyof WallConfiguration, 
      position: [-HEX_SIZE * 0.75, hexHeight / 2, HEX_SIZE * 0.433],
      rotation: Math.PI / 3,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    },
    { 
      direction: 'northwest' as keyof WallConfiguration, 
      position: [-HEX_SIZE * 0.75, hexHeight / 2, -HEX_SIZE * 0.433],
      rotation: -Math.PI / 3,
      width: HEX_SIZE,
      height: hexHeight,
      depth: 0.2
    }
  ];

  for (const wall of wallDefinitions) {
    const neighborType = getNeighborType(hex, wall.direction, hexMap);
    
    if (neighborType === 'wall') {
      // Full wall - single collision box
      collisionBoxes.push({
        center: new Vector3(
          hexCenter.x + wall.position[0],
          wall.position[1],
          hexCenter.z + wall.position[2]
        ),
        width: wall.width,
        height: wall.height,
        depth: wall.depth,
        rotation: wall.rotation
      });
    } else if (neighborType === 'doorway') {
      // Doorway - two frame segments (matching DoorwayWall component)
      const frameWidth = wall.width * 0.3;
      
      // Left door frame
      collisionBoxes.push({
        center: new Vector3(
          hexCenter.x + wall.position[0] + Math.cos(wall.rotation) * (-wall.width * 0.35),
          wall.position[1],
          hexCenter.z + wall.position[2] + Math.sin(wall.rotation) * (-wall.width * 0.35)
        ),
        width: frameWidth,
        height: wall.height,
        depth: wall.depth,
        rotation: wall.rotation
      });
      
      // Right door frame
      collisionBoxes.push({
        center: new Vector3(
          hexCenter.x + wall.position[0] + Math.cos(wall.rotation) * (wall.width * 0.35),
          wall.position[1],
          hexCenter.z + wall.position[2] + Math.sin(wall.rotation) * (wall.width * 0.35)
        ),
        width: frameWidth,
        height: wall.height,
        depth: wall.depth,
        rotation: wall.rotation
      });
    }
    // neighborType === 'none' creates no collision boxes (open passage)
  }

  return collisionBoxes;
}

// Check collision between a circle (player) and an oriented box (wall)
function checkCircleBoxCollision(
  circleCenter: Vector3,
  circleRadius: number,
  box: CollisionBox
): { collision: boolean; pushVector: Vector3 } {
  
  // Transform circle center to box's local coordinate system
  const dx = circleCenter.x - box.center.x;
  const dz = circleCenter.z - box.center.z;
  
  const cos = Math.cos(-box.rotation);
  const sin = Math.sin(-box.rotation);
  
  const localX = dx * cos - dz * sin;
  const localZ = dx * sin + dz * cos;
  
  // Find closest point on box to circle center
  const halfWidth = box.width / 2;
  const halfDepth = box.depth / 2;
  
  const closestX = Math.max(-halfWidth, Math.min(halfWidth, localX));
  const closestZ = Math.max(-halfDepth, Math.min(halfDepth, localZ));
  
  // Distance from circle center to closest point
  const distanceX = localX - closestX;
  const distanceZ = localZ - closestZ;
  const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;
  
  if (distanceSquared < circleRadius * circleRadius) {
    // Collision detected - calculate push vector
    const distance = Math.sqrt(distanceSquared);
    const penetration = circleRadius - distance;
    
    let pushX, pushZ;
    
    if (distance < 0.001) {
      // Circle center is inside box - push in direction of closest edge
      const pushToLeft = halfWidth + localX;
      const pushToRight = halfWidth - localX;
      const pushToFront = halfDepth + localZ;
      const pushToBack = halfDepth - localZ;
      
      const minPush = Math.min(pushToLeft, pushToRight, pushToFront, pushToBack);
      
      if (minPush === pushToLeft) {
        pushX = -penetration - pushToLeft;
        pushZ = 0;
      } else if (minPush === pushToRight) {
        pushX = penetration + pushToRight;
        pushZ = 0;
      } else if (minPush === pushToFront) {
        pushX = 0;
        pushZ = -penetration - pushToFront;
      } else {
        pushX = 0;
        pushZ = penetration + pushToBack;
      }
    } else {
      // Push away from closest point
      pushX = (distanceX / distance) * penetration;
      pushZ = (distanceZ / distance) * penetration;
    }
    
    // Transform push vector back to world coordinates
    const worldPushX = pushX * cos + pushZ * sin;
    const worldPushZ = -pushX * sin + pushZ * cos;
    
    return {
      collision: true,
      pushVector: new Vector3(worldPushX, 0, worldPushZ)
    };
  }
  
  return { collision: false, pushVector: new Vector3(0, 0, 0) };
}

// Main collision detection function
export function checkWallCollision(
  currentPosition: Vector3,
  newPosition: Vector3,
  dungeon: DungeonHex[],
  hexMap: Map<string, DungeonHex>
): { collision: boolean; correctedPosition: Vector3 } {
  
  const correctedPosition = newPosition.clone();
  let totalPushVector = new Vector3(0, 0, 0);
  let hasCollision = false;
  
  // Get nearby hexes (current hex and neighbors)
  const nearbyHexes: DungeonHex[] = [];
  
  for (const hex of dungeon) {
    const hexCenter = hexToPosition(hex.coordinate);
    const distance = Math.sqrt(
      (newPosition.x - hexCenter.x) ** 2 + 
      (newPosition.z - hexCenter.z) ** 2
    );
    
    // Check hexes within player radius + hex size
    if (distance < HEX_SIZE + PLAYER_RADIUS * 2) {
      nearbyHexes.push(hex);
    }
  }
  
  // Check collisions with all walls in nearby hexes
  for (const hex of nearbyHexes) {
    const collisionBoxes = generateHexCollisionBoxes(hex, hexMap);
    
    for (const box of collisionBoxes) {
      const { collision, pushVector } = checkCircleBoxCollision(
        newPosition,
        PLAYER_RADIUS,
        box
      );
      
      if (collision) {
        hasCollision = true;
        totalPushVector.add(pushVector);
      }
    }
  }
  
  if (hasCollision) {
    // Apply damping to prevent jittering and bouncing
    const dampingFactor = 0.8;
    totalPushVector.multiplyScalar(dampingFactor);
    
    // Calculate movement vector to determine sliding direction
    const movementVector = new Vector3().subVectors(newPosition, currentPosition);
    
    // If push vector is opposing movement, apply sliding along the wall
    const pushLength = totalPushVector.length();
    if (pushLength > 0.001) {
      // Normalize push vector
      const pushDirection = totalPushVector.clone().normalize();
      
      // Project movement onto the plane perpendicular to push direction (sliding)
      const projectedMovement = movementVector.clone();
      const dotProduct = projectedMovement.dot(pushDirection);
      
      // If moving into the wall, remove that component and keep sliding component
      if (dotProduct < 0) {
        projectedMovement.addScaledVector(pushDirection, -dotProduct);
        // Apply the corrected movement from current position
        correctedPosition.copy(currentPosition).add(projectedMovement);
      } else {
        // If moving away from wall, just apply small push
        correctedPosition.add(totalPushVector);
      }
      
      // Ensure we don't move further than intended
      const maxMovement = movementVector.length();
      const actualMovement = new Vector3().subVectors(correctedPosition, currentPosition);
      if (actualMovement.length() > maxMovement * 1.1) {
        actualMovement.normalize().multiplyScalar(maxMovement);
        correctedPosition.copy(currentPosition).add(actualMovement);
      }
    }
  }
  
  return { collision: hasCollision, correctedPosition };
}
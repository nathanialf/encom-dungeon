import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { Vector3 } from 'three';
import { checkWallCollision } from '../utils/collisionUtils';

export const FirstPersonController: React.FC = () => {
  const { camera } = useThree();
  const { player, dungeon, updatePlayerPosition, updatePlayerRotation, setPlayer } = useGameStore();
  
  const controlsRef = useRef<any>();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const currentPosition = useRef(new Vector3(...player.position)); // Real-time position for collision
  const lastStoredPosition = useRef(new Vector3(...player.position)); // Throttled position for state
  const lastStoredRotation = useRef(0);
  const lastIsMoving = useRef(player.isMoving || false);
  const POSITION_THRESHOLD = 5; // Only update state if moved >5 units
  const ROTATION_THRESHOLD = 0.2; // Only update state if rotated >0.2 radians
  
  // Create hex lookup map for collision detection
  const hexMap = useMemo(() => {
    return new Map(dungeon.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
  }, [dungeon]);
  
  const MOVE_SPEED = 15;
  const DAMPING = 10;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    const { forward, backward, left, right } = moveState.current;
    
    // Skip expensive operations if no movement input
    if (!forward && !backward && !left && !right && velocity.current.length() < 0.01) {
      return;
    }
    
    direction.current.set(0, 0, 0);
    
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;
    
    direction.current.normalize();
    direction.current.multiplyScalar(MOVE_SPEED);
    
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const cameraRight = new Vector3();
    cameraRight.crossVectors(cameraDirection, new Vector3(0, 1, 0));
    cameraRight.normalize();
    
    const worldDirection = new Vector3();
    // Forward/backward movement in camera direction (negated to fix reversed direction)
    worldDirection.addScaledVector(cameraDirection, -direction.current.z);
    // Left/right movement perpendicular to camera
    worldDirection.addScaledVector(cameraRight, direction.current.x);
    
    velocity.current.lerp(worldDirection, delta * DAMPING);
    
    const newPosition = currentPosition.current.clone();
    newPosition.add(velocity.current.clone().multiplyScalar(delta));
    
    // Check for wall collisions and apply sliding
    const { collision, correctedPosition } = checkWallCollision(
      currentPosition.current,
      newPosition,
      dungeon,
      hexMap
    );
    
    // Use corrected position if there was a collision (includes sliding)
    const finalPosition = collision ? correctedPosition : newPosition;
    
    // Keep player at reasonable height above ground
    finalPosition.y = Math.max(finalPosition.y, 2);
    
    // Update real-time position for next frame's collision detection
    currentPosition.current.copy(finalPosition);
    
    camera.position.copy(finalPosition);
    camera.position.y = finalPosition.y + 1.7;
    
    // Get the actual direction the camera is facing using direction vector
    const forwardDirection = new Vector3();
    camera.getWorldDirection(forwardDirection);
    
    // Convert direction vector to angle in radians (atan2 gives us -π to π)
    const angleRadians = Math.atan2(forwardDirection.x, forwardDirection.z);
    
    // Convert to 0-2π range (always positive)
    const normalizedAngle = angleRadians < 0 ? angleRadians + 2 * Math.PI : angleRadians;
    
    // Only update state on significant movement/rotation changes
    const positionChanged = currentPosition.current.distanceTo(lastStoredPosition.current) > POSITION_THRESHOLD;
    const rotationChanged = Math.abs(normalizedAngle - lastStoredRotation.current) > ROTATION_THRESHOLD;
    const isMoving = velocity.current.length() > 0.1;
    const isMovingChanged = isMoving !== lastIsMoving.current;
    
    // Update any changed state
    if (positionChanged || rotationChanged || isMovingChanged) {
      const updates: any = {};
      
      if (positionChanged) {
        updates.position = [currentPosition.current.x, currentPosition.current.y, currentPosition.current.z];
        lastStoredPosition.current.copy(currentPosition.current);
      }
      
      if (rotationChanged) {
        updates.rotation = [camera.rotation.x, normalizedAngle, camera.rotation.z];
        lastStoredRotation.current = normalizedAngle;
      }
      
      if (isMovingChanged) {
        updates.isMoving = isMoving;
        lastIsMoving.current = isMoving;
      }
      
      // Single state update with all changes
      if (updates.position || updates.rotation) {
        if (updates.position) updatePlayerPosition(updates.position);
        if (updates.rotation) updatePlayerRotation(updates.rotation);
      }
      if (updates.isMoving !== undefined) {
        setPlayer({ isMoving: updates.isMoving });
      }
    }
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      camera={camera}
    />
  );
};
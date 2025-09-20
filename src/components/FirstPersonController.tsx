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
    
    const currentPosition = new Vector3(...player.position);
    const newPosition = currentPosition.clone();
    newPosition.add(velocity.current.clone().multiplyScalar(delta));
    
    // Check for wall collisions and apply sliding
    const { collision, correctedPosition } = checkWallCollision(
      currentPosition,
      newPosition,
      dungeon,
      hexMap
    );
    
    // Use corrected position if there was a collision (includes sliding)
    const finalPosition = collision ? correctedPosition : newPosition;
    
    // Keep player at reasonable height above ground
    finalPosition.y = Math.max(finalPosition.y, 2);
    
    camera.position.copy(finalPosition);
    camera.position.y = finalPosition.y + 1.7;
    
    // Get the actual direction the camera is facing using direction vector
    const forwardDirection = new Vector3();
    camera.getWorldDirection(forwardDirection);
    
    // Convert direction vector to angle in radians (atan2 gives us -π to π)
    const angleRadians = Math.atan2(forwardDirection.x, forwardDirection.z);
    
    // Convert to 0-2π range (always positive)
    const normalizedAngle = angleRadians < 0 ? angleRadians + 2 * Math.PI : angleRadians;
    
    updatePlayerPosition([finalPosition.x, finalPosition.y, finalPosition.z]);
    updatePlayerRotation([camera.rotation.x, normalizedAngle, camera.rotation.z]);
    
    const isMoving = velocity.current.length() > 0.1;
    setPlayer({ isMoving });
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      camera={camera}
    />
  );
};
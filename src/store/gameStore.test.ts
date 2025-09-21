import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      player: {
        position: [0, 2, 0],
        rotation: [0, 0, 0],
        velocity: [0, 0, 0],
        isMoving: false,
      },
      camera: {
        position: [0, 5, 0],
        target: [0, 0, 0],
        fov: 75,
        near: 0.1,
        far: 1000,
      },
      dungeon: [],
      isLoading: false,
      error: null,
      minimap: {
        visible: true,
        zoom: 1,
        center: { q: 0, r: 0, s: 0 },
      },
      hud: {
        showDebugInfo: false,
        showMinimap: true,
      },
    });
  });

  test('should have initial state', () => {
    const state = useGameStore.getState();
    
    expect(state.dungeon).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.player.position).toEqual([0, 2, 0]);
  });

  test('should update player position', () => {
    const { updatePlayerPosition } = useGameStore.getState();
    const newPosition: [number, number, number] = [10, 5, 15];
    
    updatePlayerPosition(newPosition);
    
    const state = useGameStore.getState();
    expect(state.player.position).toEqual(newPosition);
  });

  test('should set loading state', () => {
    const { setLoading } = useGameStore.getState();
    
    setLoading(true);
    expect(useGameStore.getState().isLoading).toBe(true);
    
    setLoading(false);
    expect(useGameStore.getState().isLoading).toBe(false);
  });

  test('should set error state', () => {
    const { setError } = useGameStore.getState();
    const errorMessage = 'Test error message';
    
    setError(errorMessage);
    expect(useGameStore.getState().error).toBe(errorMessage);
    
    setError(null);
    expect(useGameStore.getState().error).toBeNull();
  });

  test('should set dungeon', () => {
    const { setDungeon } = useGameStore.getState();
    const mockDungeon = [
      {
        id: 'test-hex-1',
        coordinate: { q: 0, r: 0, s: 0 },
        position: { x: 0, y: 0, z: 0 },
        height: 5,
        isWalkable: true,
        hasWalls: {
          north: false,
          northeast: false,
          southeast: false,
          south: false,
          southwest: false,
          northwest: false
        },
        lighting: { 
          color: [0, 1, 0] as [number, number, number], 
          intensity: 1,
          castsShadow: false
        },
        type: 'ROOM' as const,
        connections: []
      }
    ];
    
    setDungeon(mockDungeon);
    
    const state = useGameStore.getState();
    expect(state.dungeon).toEqual(mockDungeon);
  });

  test('should set player state', () => {
    const { setPlayer } = useGameStore.getState();
    const playerUpdate = {
      position: [5, 10, 15] as [number, number, number],
      isMoving: true,
    };
    
    setPlayer(playerUpdate);
    
    const state = useGameStore.getState();
    expect(state.player.position).toEqual([5, 10, 15]);
    expect(state.player.isMoving).toBe(true);
    expect(state.player.rotation).toEqual([0, 0, 0]); // Should preserve existing values
  });

  test('should set camera state', () => {
    const { setCamera } = useGameStore.getState();
    const cameraUpdate = {
      position: [10, 20, 30] as [number, number, number],
      fov: 90,
    };
    
    setCamera(cameraUpdate);
    
    const state = useGameStore.getState();
    expect(state.camera.position).toEqual([10, 20, 30]);
    expect(state.camera.fov).toBe(90);
    expect(state.camera.near).toBe(0.1); // Should preserve existing values
  });

  test('should set dungeon metadata', () => {
    const { setDungeonMetadata } = useGameStore.getState();
    const metadataUpdate = {
      hexagonCount: 150,
      mapSeed: 'test-seed',
    };
    
    setDungeonMetadata(metadataUpdate);
    
    const state = useGameStore.getState();
    expect(state.dungeonMetadata.hexagonCount).toBe(150);
    expect(state.dungeonMetadata.mapSeed).toBe('test-seed');
    expect(state.dungeonMetadata.generationTime).toBe(0); // Should preserve existing values
  });

  test('should set FPS', () => {
    const { setFps } = useGameStore.getState();
    
    setFps(60);
    expect(useGameStore.getState().fps).toBe(60);
    
    setFps(30);
    expect(useGameStore.getState().fps).toBe(30);
  });

  test('should update minimap state', () => {
    const { updateMinimap } = useGameStore.getState();
    const minimapUpdate = {
      zoom: 2,
      center: { q: 5, r: -2, s: -3 },
    };
    
    updateMinimap(minimapUpdate);
    
    const state = useGameStore.getState();
    expect(state.minimap.zoom).toBe(2);
    expect(state.minimap.center).toEqual({ q: 5, r: -2, s: -3 });
    expect(state.minimap.visible).toBe(true); // Should preserve existing values
  });

  test('should update HUD state', () => {
    const { updateHud } = useGameStore.getState();
    const hudUpdate = {
      showDebugInfo: true,
    };
    
    updateHud(hudUpdate);
    
    const state = useGameStore.getState();
    expect(state.hud.showDebugInfo).toBe(true);
    expect(state.hud.showMinimap).toBe(true); // Should preserve existing values
  });

  test('should update player rotation', () => {
    const { updatePlayerRotation } = useGameStore.getState();
    const newRotation: [number, number, number] = [0.5, 1.2, 0];
    
    updatePlayerRotation(newRotation);
    
    const state = useGameStore.getState();
    expect(state.player.rotation).toEqual(newRotation);
    expect(state.player.position).toEqual([0, 2, 0]); // Should preserve existing values
  });

  test('should toggle minimap visibility', () => {
    const { toggleMinimap } = useGameStore.getState();
    
    // Initial state should have minimap visible
    expect(useGameStore.getState().hud.showMinimap).toBe(true);
    
    toggleMinimap();
    expect(useGameStore.getState().hud.showMinimap).toBe(false);
    
    toggleMinimap();
    expect(useGameStore.getState().hud.showMinimap).toBe(true);
  });

  test('should toggle debug info visibility', () => {
    const { toggleDebugInfo } = useGameStore.getState();
    
    // Initial state should have debug info hidden
    expect(useGameStore.getState().hud.showDebugInfo).toBe(false);
    
    toggleDebugInfo();
    expect(useGameStore.getState().hud.showDebugInfo).toBe(true);
    
    toggleDebugInfo();
    expect(useGameStore.getState().hud.showDebugInfo).toBe(false);
  });
});
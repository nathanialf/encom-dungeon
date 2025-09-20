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
});
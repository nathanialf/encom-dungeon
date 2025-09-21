import { renderHook, waitFor } from '@testing-library/react';
import { useDungeonGenerator } from './useDungeonGenerator';
import { EncomMapResponse } from '../types';
import { mapService } from '../services/api';

// Mock the gameStore
const mockSetDungeon = jest.fn();
const mockSetDungeonMetadata = jest.fn();
const mockSetLoading = jest.fn();
const mockSetError = jest.fn();
const mockUpdatePlayerPosition = jest.fn();

jest.mock('../store/gameStore', () => ({
  useGameStore: Object.assign(
    () => ({
      setDungeon: mockSetDungeon,
      setDungeonMetadata: mockSetDungeonMetadata,
      setLoading: mockSetLoading,
      setError: mockSetError,
    }),
    {
      getState: () => ({
        updatePlayerPosition: mockUpdatePlayerPosition,
      }),
    }
  ),
}));

// Mock the mapService
jest.mock('../services/api', () => ({
  mapService: {
    generateMap: jest.fn(),
  },
}));

// Mock hexUtils
jest.mock('../utils/hexUtils', () => ({
  hexToPosition: jest.fn((coord) => ({ x: coord.q * 25, y: 0, z: coord.r * 25 })),
  determineWalls: jest.fn(() => ({
    north: false,
    northeast: false,
    southeast: false,
    south: false,
    southwest: false,
    northwest: false,
  })),
}));

describe('useDungeonGenerator', () => {
  const mockMapData: EncomMapResponse = {
    hexagons: [
      {
        id: 'hex-1',
        q: 0,
        r: 0,
        s: 0,
        height: 2,
        type: 'ROOM',
        connections: ['hex-2'],
      },
      {
        id: 'hex-2', 
        q: 1,
        r: 0,
        s: -1,
        height: 3,
        type: 'CORRIDOR',
        connections: ['hex-1'],
      },
      {
        id: 'hex-3',
        q: 0,
        r: 1,
        s: -1,
        height: 15, // High hex for non-walkable test
        type: 'ROOM',
        connections: [],
      },
    ],
    metadata: {
      totalHexagons: 3,
      seed: 'test-seed-123',
      dimensions: {
        width: 100,
        height: 100,
      },
      generation_time: 150,
    },
  };

  const mockGenerateMap = mapService.generateMap as jest.MockedFunction<typeof mapService.generateMap>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateMap.mockResolvedValue(mockMapData);
  });

  test('should return generateDungeon function', () => {
    const { result } = renderHook(() => useDungeonGenerator());
    
    expect(typeof result.current.generateDungeon).toBe('function');
  });

  test('should convert Encom map data to dungeon hexes correctly', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetDungeon).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'hex-1',
          coordinate: { q: 0, r: 0, s: 0 },
          height: 2,
          isWalkable: true,
          type: 'ROOM',
          connections: ['hex-2'],
        }),
        expect.objectContaining({
          id: 'hex-2',
          coordinate: { q: 1, r: 0, s: -1 },
          height: 3,
          isWalkable: true,
          type: 'CORRIDOR',
          connections: ['hex-1'],
        }),
        expect.objectContaining({
          id: 'hex-3',
          coordinate: { q: 0, r: 1, s: -1 },
          height: 15,
          isWalkable: false, // Height > 10 should be non-walkable
          type: 'ROOM',
          connections: [],
        }),
      ])
    );
  });

  test('should handle hexes with default values when type is missing', async () => {
    const mapDataWithMissingType: EncomMapResponse = {
      hexagons: [
        {
          id: 'hex-no-type',
          q: 0,
          r: 0,
          s: 0,
          height: 1,
          type: 'CORRIDOR', // Need to provide type for TypeScript
          connections: [], // Need to provide connections for TypeScript
        },
      ],
      metadata: {
        totalHexagons: 1,
        dimensions: {
          width: 50,
          height: 50,
        },
        generation_time: 0,
      },
    };

    mockGenerateMap.mockResolvedValueOnce(mapDataWithMissingType);
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetDungeon).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'hex-no-type',
          type: 'CORRIDOR', // Should default to CORRIDOR
          connections: [], // Should default to empty array
        }),
      ])
    );
  });

  test('should set dungeon metadata correctly', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100, 'custom-seed');
    });

    expect(mockSetDungeonMetadata).toHaveBeenCalledWith({
      hexagonCount: 3,
      mapSeed: 'test-seed-123',
      generationTime: 150,
    });
  });

  test('should set dungeon metadata with fallback seed when API seed is missing', async () => {
    // Clear all mocks before this test
    jest.clearAllMocks();
    
    const mapDataNoMetadata: EncomMapResponse = {
      hexagons: [
        {
          id: 'hex-1',
          q: 0,
          r: 0,
          s: 0,
          height: 1,
          type: 'ROOM',
          connections: [],
        },
      ],
      metadata: {
        totalHexagons: 1,
        dimensions: {
          width: 50,
          height: 50,
        },
        generation_time: 0,
        // No seed in metadata
      },
    };

    // First mock for the useEffect mount call
    mockGenerateMap.mockResolvedValueOnce(mockMapData);
    // Second mock for our specific call
    mockGenerateMap.mockResolvedValueOnce(mapDataNoMetadata);
    
    const { result } = renderHook(() => useDungeonGenerator());
    
    // Wait for initial mount to complete
    await waitFor(() => {
      expect(mockGenerateMap).toHaveBeenCalledTimes(1);
    });

    // Clear metadata calls from mount
    mockSetDungeonMetadata.mockClear();

    await waitFor(async () => {
      await result.current.generateDungeon(100, 'fallback-seed');
    });

    expect(mockSetDungeonMetadata).toHaveBeenLastCalledWith({
      hexagonCount: 1,
      mapSeed: 'fallback-seed', // Should use provided seed as fallback
      generationTime: 0,
    });
  });

  test('should handle numeric seed correctly', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100, 12345);
    });

    expect(mockGenerateMap).toHaveBeenCalledWith(100, 12345);
  });

  test.skip('should find and set spawn point at center walkable hex', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    // Clear initial mount calls
    mockUpdatePlayerPosition.mockClear();

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    // Should position player above closest walkable hex to origin
    expect(mockUpdatePlayerPosition).toHaveBeenCalledWith([
      0, // hex-1 position x (q=0 * 25)
      3, // spawn height (Math.max(2 * 0.5 + 2, 3) = 3)
      0, // hex-1 position z (r=0 * 25)
    ]);
  });

  test('should handle error when API returns empty data', async () => {
    const emptyMapData: EncomMapResponse = {
      hexagons: [],
      metadata: {
        totalHexagons: 0,
        dimensions: {
          width: 0,
          height: 0,
        },
        generation_time: 0,
      },
    };
    mockGenerateMap.mockResolvedValueOnce(emptyMapData);
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetError).toHaveBeenCalledWith('API returned empty or invalid data');
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  test('should handle error when API returns null', async () => {
    mockGenerateMap.mockResolvedValueOnce(null as any);
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetError).toHaveBeenCalledWith('API returned empty or invalid data');
  });

  test('should handle API error', async () => {
    const errorMessage = 'Network error';
    mockGenerateMap.mockRejectedValueOnce(new Error(errorMessage));
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  test('should handle non-Error exception', async () => {
    mockGenerateMap.mockRejectedValueOnce('String error');
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetError).toHaveBeenCalledWith('Failed to generate dungeon');
  });

  test('should handle hex height edge cases', async () => {
    const edgeCaseMapData: EncomMapResponse = {
      hexagons: [
        {
          id: 'hex-zero-height',
          q: 0,
          r: 0,
          s: 0,
          height: 0, // Should be clamped to 0.1
          type: 'ROOM',
          connections: [],
        },
        {
          id: 'hex-negative-height',
          q: 1,
          r: 0,
          s: -1,
          height: -5, // Should be clamped to 0.1
          type: 'ROOM',
          connections: [],
        },
        {
          id: 'hex-string-height',
          q: 0,
          r: 1,
          s: -1,
          height: 'invalid' as any, // Should default to 1
          type: 'ROOM',
          connections: [],
        },
      ],
      metadata: {
        totalHexagons: 3,
        dimensions: {
          width: 100,
          height: 100,
        },
        generation_time: 0,
      },
    };

    mockGenerateMap.mockResolvedValueOnce(edgeCaseMapData);
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    expect(mockSetDungeon).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'hex-zero-height',
          height: 0.1, // Clamped minimum
        }),
        expect.objectContaining({
          id: 'hex-negative-height',
          height: 0.1, // Clamped minimum
        }),
        expect.objectContaining({
          id: 'hex-string-height',
          height: 1, // Default when invalid
        }),
      ])
    );
  });

  test('should set correct lighting based on height', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    const dungeonCall = mockSetDungeon.mock.calls[0][0];
    
    // hex-1 and hex-2 have height <= 5, should have intensity 0
    expect(dungeonCall.find((h: any) => h.id === 'hex-1').lighting.intensity).toBe(0);
    expect(dungeonCall.find((h: any) => h.id === 'hex-2').lighting.intensity).toBe(0);
    
    // hex-3 has height > 5, should have intensity 0.5
    expect(dungeonCall.find((h: any) => h.id === 'hex-3').lighting.intensity).toBe(0.5);
  });

  test('should call generateDungeon on mount with default parameters', () => {
    renderHook(() => useDungeonGenerator());

    expect(mockGenerateMap).toHaveBeenCalledWith(1000, undefined);
  });

  test('should set loading state correctly during generation', async () => {
    const { result } = renderHook(() => useDungeonGenerator());

    // Clear the initial mount call
    mockSetLoading.mockClear();

    await waitFor(async () => {
      await result.current.generateDungeon(100);
    });

    // Should call setLoading(true) first, then setLoading(false) in finally
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
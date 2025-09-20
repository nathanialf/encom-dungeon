import { renderHook } from '@testing-library/react';
import { useDungeonGenerator } from './useDungeonGenerator';

// Mock the gameStore
const mockSetDungeon = jest.fn();
const mockSetLoading = jest.fn();
const mockSetError = jest.fn();

jest.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    setDungeon: mockSetDungeon,
    setLoading: mockSetLoading,
    setError: mockSetError
  })
}));

describe('useDungeonGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return generateDungeon function', () => {
    const { result } = renderHook(() => useDungeonGenerator());
    
    expect(typeof result.current.generateDungeon).toBe('function');
  });

  test('generateDungeon should accept hexagon count parameter', () => {
    const { result } = renderHook(() => useDungeonGenerator());
    
    expect(() => {
      result.current.generateDungeon(100);
    }).not.toThrow();
  });

  test('should call setLoading during generation', () => {
    renderHook(() => useDungeonGenerator());
    
    expect(mockSetLoading).toHaveBeenCalled();
  });

  test('should use game store methods', () => {
    renderHook(() => useDungeonGenerator());
    
    // Verify the hook is using the mocked store methods
    expect(mockSetLoading).toHaveBeenCalled();
  });

  test('should generate dungeon on mount', () => {
    renderHook(() => useDungeonGenerator());
    
    // The useEffect should trigger generateDungeon on mount
    expect(mockSetLoading).toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith(null);
  });
});
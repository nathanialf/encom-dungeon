import { useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { mapService } from '../services/api';
import { DungeonHex, EncomMapResponse } from '../types';
import { hexToPosition, determineWalls } from '../utils/hexUtils';

export const useDungeonGenerator = () => {
  const { setDungeon, setDungeonMetadata, setLoading, setError } = useGameStore();

  const convertEncomMapToDungeon = useCallback((mapData: EncomMapResponse): DungeonHex[] => {
    
    const hexes: DungeonHex[] = mapData.hexagons.map((hex) => {
      const coordinate = { q: hex.q, r: hex.r, s: hex.s };
      const position = hexToPosition(coordinate);
      const height = Math.max(0.1, typeof hex.height === 'number' ? hex.height : 1);
      
      return {
        id: hex.id,
        coordinate,
        position,
        height,
        isWalkable: height > 0 && height < 10,
        hasWalls: {
          north: false,
          northeast: false,
          southeast: false,
          south: false,
          southwest: false,
          northwest: false,
        },
        lighting: {
          intensity: height > 5 ? 0.5 : 0,
          color: [1, 0.8, 0.4] as [number, number, number],
          castsShadow: true,
        },
        type: hex.type || 'CORRIDOR', // Default to corridor if not specified
        connections: hex.connections || [],
      };
    });

    // Create shared hex map once to avoid creating 1000+ maps
    const hexMap = new Map(hexes.map(h => [`${h.coordinate.q},${h.coordinate.r}`, h]));
    
    hexes.forEach((hex) => {
      hex.hasWalls = determineWalls(hex, hexes, hexMap);
    });


    return hexes;
  }, []);

  const generateDungeon = useCallback(async (hexagonCount: number = 500, seed?: string | number) => {
    try {
      setLoading(true);
      setError(null);
      
      const mapData = await mapService.generateMap(hexagonCount, seed);
      
      if (!mapData || !mapData.hexagons || mapData.hexagons.length === 0) {
        throw new Error('API returned empty or invalid data');
      }
      
      const dungeonHexes = convertEncomMapToDungeon(mapData);
      
      setDungeon(dungeonHexes);
      
      // Store dungeon metadata
      setDungeonMetadata({
        hexagonCount: mapData.hexagons.length,
        mapSeed: mapData.metadata?.seed?.toString() || seed?.toString() || null,
        generationTime: mapData.metadata?.generation_time || 0,
      });
      
      // Find a good spawn point (walkable hex near center)
      const walkableHexes = dungeonHexes.filter(hex => hex.isWalkable);
      if (walkableHexes.length > 0) {
        // Find hex closest to origin
        const centerHex = walkableHexes.reduce((closest, hex) => {
          const distFromOrigin = Math.sqrt(hex.position.x ** 2 + hex.position.z ** 2);
          const closestDist = Math.sqrt(closest.position.x ** 2 + closest.position.z ** 2);
          return distFromOrigin < closestDist ? hex : closest;
        });
        
        // Set player position above this hex
        const spawnHeight = Math.max(centerHex.height * 0.5 + 2, 3);
        
        useGameStore.getState().updatePlayerPosition([
          centerHex.position.x,
          spawnHeight,
          centerHex.position.z
        ]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate dungeon');
    } finally {
      setLoading(false);
    }
  }, [convertEncomMapToDungeon, setDungeon, setDungeonMetadata, setLoading, setError]);

  useEffect(() => {
    generateDungeon(1000); // Increased back to 1000 hexes
  }, [generateDungeon]);

  return {
    generateDungeon,
  };
};
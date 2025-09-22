import { create } from 'zustand';
import { GameState, DungeonHex } from '../types';

interface GameStore extends GameState {
  setPlayer: (player: Partial<GameState['player']>) => void;
  setCamera: (camera: Partial<GameState['camera']>) => void;
  setDungeon: (dungeon: DungeonHex[]) => void;
  setDungeonMetadata: (metadata: Partial<GameState['dungeonMetadata']>) => void;
  setFps: (fps: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateMinimap: (minimap: Partial<GameState['minimap']>) => void;
  updateHud: (hud: Partial<GameState['hud']>) => void;
  updatePlayerPosition: (position: [number, number, number]) => void;
  updatePlayerRotation: (rotation: [number, number, number]) => void;
  toggleMinimap: () => void;
  toggleDebugInfo: () => void;
  setTouchInput: (x: number, y: number) => void;
  touchLook: (deltaX: number, deltaY: number) => void;
  touchInput: { x: number; y: number };
  touchLookDelta: { x: number; y: number };
  isTouchDevice: boolean;
  setTouchDevice: (isTouch: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: {
    position: [0, 2, 0],
    rotation: [0, 0, 0],
    velocity: [0, 0, 0],
    isMoving: false,
  },
  camera: {
    position: [0, 3, 8],
    target: [0, 0, 0],
    fov: 75,
    near: 0.1,
    far: 1000,
  },
  dungeon: [],
  dungeonMetadata: {
    hexagonCount: 0,
    mapSeed: null,
    generationTime: 0,
  },
  fps: 0,
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
  touchInput: { x: 0, y: 0 },
  touchLookDelta: { x: 0, y: 0 },
  isTouchDevice: false,

  setPlayer: (player) =>
    set((state) => ({
      player: { ...state.player, ...player },
    })),

  setCamera: (camera) =>
    set((state) => ({
      camera: { ...state.camera, ...camera },
    })),

  setDungeon: (dungeon) => set({ dungeon }),

  setDungeonMetadata: (metadata) =>
    set((state) => ({
      dungeonMetadata: { ...state.dungeonMetadata, ...metadata },
    })),

  setFps: (fps) => set({ fps }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateMinimap: (minimap) =>
    set((state) => ({
      minimap: { ...state.minimap, ...minimap },
    })),

  updateHud: (hud) =>
    set((state) => ({
      hud: { ...state.hud, ...hud },
    })),

  updatePlayerPosition: (position) =>
    set((state) => ({
      player: { ...state.player, position },
    })),

  updatePlayerRotation: (rotation) =>
    set((state) => ({
      player: { ...state.player, rotation },
    })),

  toggleMinimap: () =>
    set((state) => ({
      hud: { ...state.hud, showMinimap: !state.hud.showMinimap },
    })),

  toggleDebugInfo: () =>
    set((state) => ({
      hud: { ...state.hud, showDebugInfo: !state.hud.showDebugInfo },
    })),

  setTouchInput: (x, y) =>
    set({ touchInput: { x, y } }),

  touchLook: (deltaX, deltaY) =>
    set({ touchLookDelta: { x: deltaX, y: deltaY } }),

  setTouchDevice: (isTouch) =>
    set({ isTouchDevice: isTouch }),
}));
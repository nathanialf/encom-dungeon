export interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

export interface HexPosition {
  x: number;
  y: number;
  z: number;
}

export interface DungeonHex {
  id: string;
  coordinate: HexCoordinate;
  position: HexPosition;
  height: number;
  isWalkable: boolean;
  hasWalls: WallConfiguration;
  lighting: LightingData;
  type: 'CORRIDOR' | 'ROOM';
  connections: string[];
}

export interface WallConfiguration {
  north: boolean;
  northeast: boolean;
  southeast: boolean;
  south: boolean;
  southwest: boolean;
  northwest: boolean;
}

export interface LightingData {
  intensity: number;
  color: [number, number, number];
  castsShadow: boolean;
}

export interface PlayerState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  isMoving: boolean;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface GameState {
  player: PlayerState;
  camera: CameraState;
  dungeon: DungeonHex[];
  dungeonMetadata: {
    hexagonCount: number;
    mapSeed: string | null;
    generationTime: number;
  };
  fps: number;
  isLoading: boolean;
  error: string | null;
  minimap: {
    visible: boolean;
    zoom: number;
    center: HexCoordinate;
  };
  hud: {
    showDebugInfo: boolean;
    showMinimap: boolean;
  };
}

export interface EncomMapResponse {
  hexagons: Array<{
    id: string;
    q: number;
    r: number;
    s: number;
    height: number;
    type: 'CORRIDOR' | 'ROOM';
    connections: string[];
  }>;
  metadata: {
    totalHexagons: number;
    seed?: string | number;
    dimensions: {
      width: number;
      height: number;
    };
    generation_time: number;
  };
}

export interface PostProcessingSettings {
  terminalEffect: {
    enabled: boolean;
    scanlineIntensity: number;
    curvature: number;
  };
  pixelation: {
    enabled: boolean;
    pixelSize: number;
  };
  bloom: {
    enabled: boolean;
    intensity: number;
    threshold: number;
  };
  colorGrading: {
    enabled: boolean;
    temperature: number;
    tint: number;
    contrast: number;
  };
}
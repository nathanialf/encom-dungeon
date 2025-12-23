# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENCOM Dungeon Explorer is a 3D first-person dungeon exploration game built with React, Three.js (via React Three Fiber), and TypeScript. Features procedurally generated hex-grid dungeons, physics-based movement, touch controls, and retro terminal visual effects.

## Common Commands

```bash
npm install                                    # Install dependencies
npm start                                      # Dev server (localhost:3000)
npm run build                                  # Production build
npm test                                       # Run tests in watch mode
npm test -- --coverage --watchAll=false        # Run tests with coverage (CI mode)
npm test -- --testPathPattern="hexUtils"       # Run single test file
npm run lint                                   # ESLint on src directory
npm run typecheck                              # TypeScript type checking
```

## Architecture

### Tech Stack
- **React 18** with TypeScript (strict mode)
- **React Three Fiber** - React renderer for Three.js
- **Zustand** - State management
- **Jest + React Testing Library** - Testing

### Core Directory Structure
```
src/
├── api/api.ts              # EncomMapService - dungeon generation API client
├── components/             # React + R3F components
│   ├── DungeonScene.tsx    # Main 3D Canvas container
│   ├── FirstPersonController.tsx  # WASD movement, mouse look, collision
│   ├── HexGrid.tsx         # Renders hex tiles with distance culling (300 units)
│   ├── HexTile.tsx         # Individual hex geometry and walls
│   ├── TouchControls.tsx   # Virtual joystick + look bar for touch devices
│   ├── effects/            # Post-processing (terminal, pixelation, CRT)
│   └── materials/          # Custom Three.js shaders
├── hooks/
│   ├── useDungeonGenerator.ts  # Fetches and transforms dungeon data
│   └── useShaderTime.ts        # Shader uniform time sync
├── store/
│   ├── gameStore.ts        # Main game state (player, dungeon, UI, touch input)
│   └── timeStore.ts        # Global animation time
├── utils/
│   ├── hexUtils.ts         # Hex coordinate math (axial coords, neighbors, walls)
│   └── collisionUtils.ts   # Wall collision with sliding behavior
└── types/index.ts          # TypeScript interfaces (DungeonHex, GameState, etc.)
```

### Data Flow
1. `useDungeonGenerator` fetches hex data from API (`/api/v1/map/generate`)
2. Response transformed to `DungeonHex[]` and stored in `gameStore`
3. `HexGrid` renders visible hexes based on player distance
4. `FirstPersonController` handles input, applies collision via `collisionUtils`
5. Post-processing effects applied via React Three Fiber's `EffectComposer`

### Hex Coordinate System
Uses axial coordinates (q, r, s) where q + r + s = 0. Key utilities in `hexUtils.ts`:
- `hexToPixel` / `pixelToHex` - coordinate conversion
- `getHexNeighbors` - adjacent hex calculation
- Wall directions: north, northeast, southeast, south, southwest, northwest

### State Management (Zustand)
- `gameStore`: Player position/rotation, dungeon data, FPS, UI toggles, touch joystick state
- `timeStore`: Global elapsed time for shader animations

## Infrastructure

AWS deployment via Terraform:
- **Dev**: dungeon-dev.riperoni.com (CloudFront → S3)
- **Prod**: dungeon.riperoni.com (CloudFront → S3)
- Jenkins pipeline: lint → typecheck → test → build → terraform deploy

## Key Conventions

- TypeScript strict mode enabled - no implicit any
- Components use functional style with hooks
- Tests co-located with source (`*.test.ts` alongside `*.ts`)
- 3D components use React Three Fiber patterns (useFrame, useThree)
- Touch detection in App.tsx determines control scheme
- Performance: 60 FPS target, distance-based culling at 300 units

## Commit Requirements

Before every commit, run the full validation suite:
```bash
npm run lint && npm run typecheck && npm test -- --watchAll=false && npm run build
```

Commit message rules:
- Do NOT include Claude authoring attribution (no "Generated with Claude Code", no "Co-Authored-By: Claude")
- Write clear, concise commit messages describing the change

# ENCOM Dungeon Explorer

A 3D first-person dungeon explorer built with React Three Fiber, featuring procedurally generated hex-grid dungeons with dynamic terminal aesthetics and advanced performance optimizations.

## Features

### Core Gameplay
- **First-Person Navigation**: WASD movement with mouse look controls and wall collision
- **Touch Device Support**: Tablet-optimized with virtual joystick and touch look controls
- **Procedural Generation**: Dynamically generated hex-grid based dungeons
- **3D Exploration**: Fully immersive 3D environment with realistic lighting
- **Physics-Based Movement**: Wall collision detection with smooth sliding behavior

### Visual Design
- **Dynamic Terminal Aesthetic**: Color-cycling terminal effects (green ↔ purple) with retro computer styling
- **High-Quality Textures**: PNG-based floor, wall, and ceiling textures with proper UV mapping
- **Advanced Lighting**: Dynamic point lights and ambient lighting effects
- **Post-Processing**: Terminal effects with scanlines and color cycling
- **Doorway System**: Visual distinction between rooms and corridors with doorframe rendering

### User Interface
- **HUD System**: Real-time debug information with FPS monitoring and player coordinates
- **Minimap**: Interactive overview of explored areas
- **Screenshot Capture**: High-quality PNG screenshots with automatic download
- **Responsive Controls**: Desktop (keyboard/mouse) and touch device (virtual joystick) support
- **Adaptive Interface**: Touch-optimized button sizing and control instructions
- **Performance Monitoring**: Real-time FPS display and debug information

## Controls

### Desktop Controls
| Action | Keyboard | Button |
|--------|----------|--------|
| Move | `WASD` | - |
| Look Around | `Mouse` | - |
| Toggle Minimap | `M` | MAP (M) |
| Toggle Debug Info | `F1` | DEBUG (F1) |
| Screenshot | `P` | SCREENSHOT (P) |
| Regenerate Dungeon | `R` | - |

### Touch Device Controls
| Action | Touch Input | Button |
|--------|-------------|--------|
| Move | Virtual Joystick (left side) | - |
| Look Around | Horizontal Look Bar (right side) | - |
| Toggle Minimap | - | MAP |
| Toggle Debug Info | - | DEBUG |
| Screenshot | - | SCREENSHOT |

**Touch Features:**
- **Dual Joystick Design**: Circular movement joystick (left) + horizontal look bar (right)
- **Responsive Positioning**: Adaptive layout for portrait and landscape orientations
- **Horizontal Look Control**: Pill-shaped horizontal slider for left/right camera rotation
- **Enhanced Responsiveness**: Exponential scaling for faster movement at extremes (7x multiplier)
- **Multitouch Support**: Simultaneous movement and look controls with distinct touch identifiers
- **Zoom Prevention**: Disabled browser gestures for uninterrupted gameplay

## Technical Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety and developer experience
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics and WebGL rendering
- **Zustand** - Lightweight state management

### 3D Libraries
- **@react-three/drei** - Useful helpers and abstractions
- **@react-three/postprocessing** - Post-processing effects
- **three-stdlib** - Extended Three.js utilities

### Development Tools
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **React Scripts** - Build tooling and development server

## Infrastructure Architecture

### AWS Architecture Overview
```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│             DEV                 │  │            PROD                 │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│                                 │  │                                 │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   CloudFront        │       │  │  │   CloudFront        │       │
│  │ d1x72w8ik3u49a...   │       │  │  │ d2y83x9jl4v50b...   │       │
│  │dungeon-dev.riperoni.│       │  │  │ dungeon.riperoni.   │       │
│  │com ACM Certificate  │       │  │  │ com ACM Certificate │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   Origin Access     │       │  │  │   Origin Access     │       │
│  │   Control (OAC)     │       │  │  │   Control (OAC)     │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   S3 Bucket         │       │  │  │   S3 Bucket         │       │
│  │encom-dungeon-       │       │  │  │encom-dungeon-       │       │
│  │frontend-dev-us-     │       │  │  │frontend-prod-us-    │       │
│  │west-1               │       │  │  │west-1               │       │
│  │Versioning: Enabled  │       │  │  │Versioning: Enabled  │       │
│  │Encryption: AES256   │       │  │  │Encryption: AES256   │       │
│  │Public Access: Block │       │  │  │Public Access: Block │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   Route53           │       │  │  │   Route53           │       │
│  │dungeon-dev.riperoni.│       │  │  │ dungeon.riperoni.   │       │
│  │com A Record → CF    │       │  │  │ com A Record → CF   │       │
│  │CNAME → Cert Valid   │       │  │  │ CNAME → Cert Valid  │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
│            │                   │  │            │                   │
│  ┌─────────────────────┐       │  │  ┌─────────────────────┐       │
│  │   ACM Certificate   │       │  │  │   ACM Certificate   │       │
│  │ us-east-1 Region    │       │  │  │ us-east-1 Region    │       │
│  │ DNS Validation      │       │  │  │ DNS Validation      │       │
│  └─────────────────────┘       │  │  └─────────────────────┘       │
└─────────────────────────────────┘  └─────────────────────────────────┘

         ┌─────────────────────┐              ┌─────────────────────┐
         │   Terraform State   │              │   Terraform State   │
         │dev-encom-dungeon-   │              │prod-encom-dungeon-  │
         │terraform-state      │              │terraform-state      │
         │    (S3 Bucket)      │              │    (S3 Bucket)      │
         └─────────────────────┘              └─────────────────────┘
```

### Application Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Users       │───▶│   CloudFront     │───▶│   S3 Hosting    │
│ (Web Browsers)  │    │   (Global CDN)   │    │   (Static Web)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   API Gateway    │    │   React Three   │
                       │ (ENCOM Lambda)   │    │   Fiber App     │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Lambda Functions │    │  WebGL/Three.js │
                       │ (Map Generation) │    │  3D Rendering   │
                       └──────────────────┘    └─────────────────┘
```

### 3D Rendering Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    React Three Fiber                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Canvas        │  │  Scene Graph    │  │  Post-Process   │ │
│  │   WebGL Context │  │  Components     │  │  Effects        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Three.js Core                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Geometry      │  │    Materials    │  │    Lighting     │ │
│  │   - Hex Tiles   │  │  - Terminal     │  │  - Point Lights │ │
│  │   - Walls       │  │  - PBR Shaders  │  │  - Ambient      │ │
│  │   - Floors      │  │  - Textures     │  │  - Shadows      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                          WebGL                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    Shaders      │  │     Buffers     │  │    Textures     │ │
│  │  - Vertex       │  │  - Geometry     │  │  - Floor        │ │
│  │  - Fragment     │  │  - Index        │  │  - Wall         │ │
│  │  - Terminal FX  │  │  - Attribute    │  │  - Ceiling      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

### State Management
The application uses Zustand for state management with the following stores:
- **Game Store** (`/src/store/gameStore.ts`) - Player position, camera, dungeon data, UI state
- **Time Store** (`/src/store/timeStore.ts`) - Global time management for animations

### Component Structure
```
src/
├── components/          # React components
│   ├── DungeonScene.tsx    # Main 3D scene container
│   ├── FirstPersonController.tsx  # Movement and camera controls
│   ├── HUD.tsx            # User interface overlay
│   ├── Minimap.tsx        # Interactive minimap
│   └── effects/           # Post-processing effects
├── hooks/               # Custom React hooks
│   ├── useDungeonGenerator.ts  # Procedural generation logic
│   └── useShaderTime.ts       # Shader timing utilities
├── services/            # External API services
├── store/              # State management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Dungeon Generation
The dungeon generation system uses:
- **Hex Grid Layout** - Six-sided tile system for interesting geometry
- **Procedural Algorithms** - Randomized layout with guaranteed connectivity
- **Smart Wall System** - Automatic wall placement with doorway detection between rooms/corridors
- **Connection-Based Logic** - Walls only appear where hexes are not connected
- **Texture Mapping** - Seamless texture application to generated geometry
- **Performance Culling** - Only visible hexes within render distance are processed

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd encom-dungeon
npm install
```

### Development Server
```bash
npm start
```
Opens the application at `http://localhost:3000`

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Production Build
```bash
npm run build
```
Creates optimized production build in `/build` directory.

## Deployment

### Infrastructure
The project includes Terraform configuration for AWS deployment:
- **CloudFront Distribution** - Global CDN with custom domain support
- **Route53 DNS** - Hosted zones for dungeon-dev.riperoni.com and dungeon.riperoni.com
- **ACM Certificates** - SSL/TLS certificates with DNS validation
- **S3 State Backend** - Terraform state management
- **Bootstrap Process** - Initial infrastructure setup
- **Environment-specific** - Dev/staging/prod configurations

### CI/CD Pipeline
Jenkins pipeline with the following stages:
- **Bootstrap** - Set up Terraform state backend
- **Validate** - Terraform configuration validation  
- **Plan** - Infrastructure change planning
- **Apply** - Infrastructure deployment
- **Test** - Automated testing
- **Build** - Production artifact creation

### Local Development
```bash
# Start development server
npm start

# Run tests in watch mode
npm test

# Build for production
npm run build
```

## Configuration

### Environment Variables
- `GENERATE_SOURCEMAP=false` - Disables source maps for production builds

### Shader Configuration
The terminal effect shader supports seed-based color selection with glitch effects:
- **Single color per dungeon**: Map seed determines the terminal color theme
- **Subtle glitch system**: Random brightness shifts every 15 seconds lasting 1 second (80%-120% brightness)
- **Screen artifact simulation**: Mimics old CRT monitor flickering and brightness fluctuations
- **Seed-based timing**: Each dungeon has unique glitch patterns for variety
- **WebGL optimized**: Efficient shader uniforms with minimal CPU overhead

#### Terminal Color Palette
Each dungeon uses one of these terminal color themes based on map seed:
- **Green**: `#00b300` (classic terminal green)
- **Purple**: `#8500ad` (bright retro purple)  
- **Teal**: `#018c6c` (teal green)
- **Red**: `#8b0000` (dark red/warning)
- **Amber**: `#d53600` (orange-amber terminal)

### Texture Assets
Textures are located in `/public/textures/`:
- `floor-texture.png` - Dungeon floor tiling
- `wall-texture.png` - Wall surface textures  
- `ceiling-texture.png` - Overhead ceiling textures

## Performance

### Optimization Features
- **Memoized Components** - Prevent unnecessary re-renders
- **Hex Map Caching** - Pre-built neighbor lookup maps for efficient wall generation
- **Distance-based Culling** - Only render hexes within 300 unit radius
- **Chunked Updates** - Visibility recalculation every ~2 hex movement
- **WebGL Optimizations** - High-performance context with disabled antialiasing/shadows
- **Collision Optimization** - Efficient circle-to-box collision detection with nearby hex filtering

### Performance Notes
- **30 FPS Cap** - Some systems may be limited to 30fps due to VSync/power management
- **Chrome vs Firefox** - Chrome may exhibit more movement hitching at 30fps than Firefox
- **GPU Acceleration** - Requires discrete GPU for optimal performance
- **Render Distance** - 300 units with ~1000 hex capacity

### Target Performance
- **60 FPS** on modern desktop browsers (when system allows)
- **30 FPS** baseline with smooth movement compensation
- **< 2MB** initial bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 support required for optimal performance.

## Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for consistent formatting
- React functional components with hooks

### Testing
- Unit tests for all utility functions
- Component tests for UI interactions  
- Integration tests for 3D scene behavior
- Performance testing for frame rate stability
- **79%+ code coverage** with comprehensive test suites

#### Test Coverage Status
Current overall coverage: **79.35%** statement coverage (85.87% function coverage)

**100% Coverage Components:**
- ✅ `hexUtils.ts` - Hexagonal grid utility functions
- ✅ `api.ts` - API service layer with environment handling
- ✅ `gameStore.ts` - Zustand game state management
- ✅ `timeStore.ts` - Global time management
- ✅ `useShaderTime.ts` - Shader time synchronization hook
- ✅ `TimeUpdater.tsx` - Frame-based time updates and FPS monitoring
- ✅ `Effects.tsx` - Post-processing effects pipeline
- ✅ `LoadingScreen.tsx` - Loading state component
- ✅ `Player.tsx` - 3D player representation
- ✅ `HUD.tsx` - User interface overlay with debounced controls
- ✅ `Pixelation.tsx` - Pixelation effect wrapper component
- ✅ `PixelationEffect.tsx` - Custom pixelation shader effect
- ✅ `TerminalGreen.tsx` - Terminal color cycling effect
- ✅ `TouchControls.tsx` - Touch device controls with virtual joystick and multi-touch support

**High Coverage Components:**
- 🟡 `useDungeonGenerator.ts` - 94.59% (dungeon generation logic)
- 🟡 `collisionUtils.ts` - 92.45% (physics and collision detection)
- 🟡 `Minimap.tsx` - 86.66% (interactive minimap with SVG rendering)
- 🟡 `TerminalMaterials.tsx` - 85% (Three.js material system)
- 🟡 `HexGrid.tsx` - 84% (hex-based 3D grid rendering)
- 🟡 `DungeonScene.tsx` - 73.68% (main 3D scene with WebGL management)
- 🟡 `HexTile.tsx` - 63.75% (individual hex tile geometry and materials)

**Recent Test Additions:**
- ✅ **App.tsx** - Error handling, component integration, dungeon generation flows
- ✅ **DungeonScene.tsx** - Canvas setup, WebGL context management, scene bounds calculation
- ✅ **FirstPersonController.tsx** - Input handling, movement controls, event listeners
- ✅ **HexGrid.tsx** - Grid rendering, performance filtering, distance culling
- ✅ **HexTile.tsx** - Hex geometry, wall generation, lighting systems
- ✅ **Minimap.tsx** - Coordinate conversion, SVG rendering, player positioning
- ✅ **TerminalMaterials.tsx** - Material loading, texture management, shader compilation

### Recent Improvements

#### Latest Release (Touch Controls Refactor)
- **Touch Controls Redesign**: Replaced dual-area touch system with intuitive dual joystick design
- **Joystick Implementation**: Circular movement joystick (left) + horizontal look bar (right) for optimal ergonomics  
- **Enhanced Responsiveness**: Exponential scaling with 7x multiplier for faster look sensitivity at extremes
- **Test Suite Updates**: Updated all TouchControls and FirstPersonController tests to match new joystick implementation
- **Improved Touch UX**: Better visual feedback with pill-shaped look bar and constrained knob movement
- **Build & CI/CD**: All linting, testing, and build processes passing successfully with 79.35% test coverage maintained

#### Previous Enhancements
- **Screenshot Feature**: High-quality PNG screenshot capture with P hotkey and HUD button
- **Tablet Support**: Full touch device support with virtual joystick and responsive UI
- **Portrait Mode**: Adaptive joystick positioning for comfortable tablet use
- **Wall Collision System**: Full physics-based collision detection with sliding behavior
- **Doorway Support**: Proper collision for door frames while allowing passage through openings
- **Anti-Jitter Physics**: Damped collision response prevents camera bouncing and jittering
- **Performance Optimization**: Eliminated expensive Map creation in neighbor lookups (1000+ maps/frame → 1 map total)
- **Color Cycling Effects**: Dynamic terminal color transitions with precise timing
- **FPS Monitoring**: Real-time performance tracking and debug information
- **Render Distance**: Extended to 300 units with efficient culling
- **Infrastructure**: Complete DNS setup with CloudFront and Route53
- **Browser Compatibility**: Optimized WebGL context for high-performance rendering
- **Touch Controls**: Black-themed virtual joystick with white borders for enhanced visibility
- **Minimap Enhancements**: Hexagonal markers with white theme - transparent rooms with borders, solid white corridors
- **UI Design**: Consistent white color scheme across all interface elements with thicker borders for better contrast

## License

This project is private and proprietary.
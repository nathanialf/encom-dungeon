# ENCOM Dungeon Explorer

A 3D first-person dungeon explorer built with React Three Fiber, featuring procedurally generated hex-grid dungeons with dynamic terminal aesthetics and advanced performance optimizations.

## Features

### Core Gameplay
- **First-Person Navigation**: WASD movement with mouse look controls and wall collision
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
- **Responsive Controls**: Both keyboard shortcuts and clickable buttons
- **Performance Monitoring**: Real-time FPS display and debug information

## Controls

| Action | Keyboard | Button |
|--------|----------|--------|
| Move | `WASD` | - |
| Look Around | `Mouse` | - |
| Toggle Minimap | `M` | MAP (M) |
| Toggle Debug Info | `F1` | DEBUG (F1) |
| Regenerate Dungeon | `R` | - |

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
- **Route53 DNS** - Hosted zones for dev.dungeon.riperoni.com and dungeon.riperoni.com
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
The terminal effect shader supports time-based color cycling:
- **80-second cycle**: 30s green → 10s transition → 30s purple → 10s transition
- **Time-synchronized**: Connected to global time store for consistent animation
- **WebGL optimized**: Efficient shader uniforms with minimal CPU overhead

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
- 16%+ code coverage requirement

### Recent Improvements
- **Wall Collision System**: Full physics-based collision detection with sliding behavior
- **Doorway Support**: Proper collision for door frames while allowing passage through openings
- **Anti-Jitter Physics**: Damped collision response prevents camera bouncing and jittering
- **Performance Optimization**: Eliminated expensive Map creation in neighbor lookups (1000+ maps/frame → 1 map total)
- **Color Cycling Effects**: Dynamic terminal color transitions with precise timing
- **FPS Monitoring**: Real-time performance tracking and debug information
- **Render Distance**: Extended to 300 units with efficient culling
- **Infrastructure**: Complete DNS setup with CloudFront and Route53
- **Browser Compatibility**: Optimized WebGL context for high-performance rendering

## License

This project is private and proprietary.
# ENCOM Dungeon Explorer

A 3D first-person dungeon explorer built with React Three Fiber, featuring procedurally generated hex-grid dungeons with terminal green aesthetics.

## Features

### Core Gameplay
- **First-Person Navigation**: WASD movement with mouse look controls
- **Procedural Generation**: Dynamically generated hex-grid based dungeons
- **3D Exploration**: Fully immersive 3D environment with realistic lighting

### Visual Design
- **Terminal Aesthetic**: Green monospace UI with retro computer styling
- **High-Quality Textures**: PNG-based floor, wall, and ceiling textures
- **Advanced Lighting**: Dynamic shadows and ambient lighting effects
- **Post-Processing**: Pixelation effects for retro visual appeal

### User Interface
- **HUD System**: Real-time debug information and controls
- **Minimap**: Interactive overview of explored areas
- **Responsive Controls**: Both keyboard shortcuts and clickable buttons

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
- **Wall Detection** - Automatic wall placement between tiles
- **Texture Mapping** - Seamless texture application to generated geometry

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

### Texture Assets
Textures are located in `/public/textures/`:
- `floor-texture.png` - Dungeon floor tiling
- `wall-texture.png` - Wall surface textures  
- `ceiling-texture.png` - Overhead ceiling textures

## Performance

### Optimization Features
- **Memoized Components** - Prevent unnecessary re-renders
- **Texture Caching** - Efficient asset loading
- **Geometry Pooling** - Reuse 3D objects where possible
- **Level-of-Detail** - Adaptive quality based on distance

### Target Performance
- **60 FPS** on modern desktop browsers
- **30 FPS** on mobile devices
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
- 16%+ code coverage requirement

## License

This project is private and proprietary.
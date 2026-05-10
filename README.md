# 3DGS Discovery Game

A Progressive Web App (PWA) exploration game built on 3D Gaussian Splatting (3DGS) technology. Navigate through photorealistic 3D scenes captured from real-world environments and discover hidden markers as you explore.


<p align="center">
  <a href="https://www.youtube.com/watch?v=RCbC89QfhJo">
    <img src="https://img.youtube.com/vi/RCbC89QfhJo/maxresdefault.jpg" alt="3DGS Discovery Game Demo" style="width:80%;">
  </a>
</p>

## Features

- **Photorealistic 3D Scenes** — Powered by 3D Gaussian Splatting for real-time rendering of captured environments
- **Discovery Gameplay** — Explore the scene to find hidden discovery markers
- **Mobile-First Controls** — Intuitive touch-based joystick for smooth navigation
- **Cross-Platform** — Works on desktop and mobile browsers, installable as PWA
- **AI Chat Integration** — Built-in chat panel for in-game communication

## Table of Contents

- [Installation](#installation)
- [How to Play](#how-to-play)
- [Changing 3DGS Scenes](#changing-3dgs-scenes)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)
- Modern web browser with WebGL support

### Step 1: Clone the Repository

```bash
git clone https://github.com/kandeng/3dgs_discovery_game.git
cd 3dgs_discovery_game
```

### Step 2: Install Dependencies

This project uses `mobile_game_pwa` as a local dependency. Ensure both repositories are available:

```bash
# Make sure mobile_game_pwa is in the parent directory
# ../mobile_game_pwa should exist

# Install all dependencies (including mobile_game_pwa)
npm install
```

**Note:** The `mobile_game_pwa` package is referenced via a local file path in `package.json`:
```json
"mobile_game_pwa": "file:../mobile_game_pwa"
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The game will start at `http://localhost:5173`. Open this URL in your browser.

To access from a mobile device on the same Wi-Fi network, use your computer's local IP address (e.g., `http://192.168.x.x:5173`).

### Step 4: Production Build

```bash
npm run build
npm run preview
```

---

## How to Play

### Game Objective

Explore the 3D Gaussian Splat scene to discover **5 hidden markers**. Move around the environment and get close to each marker location to trigger a discovery.

### Controls

The game uses a **4-mode joystick** control system located at the center of the viewport:

#### Joystick Modes

| Mode | Label | Action | How to Control |
|------|-------|--------|----------------|
| **Move** | M | Horizontal movement | Drag up/down/left/right |
| **Rotate** | R | Camera yaw rotation | Drag left/right |
| **Height** | H | Vertical movement (up/down) | Drag up/down |
| **Lens** | L | Camera zoom (focal length) | Drag left (zoom out) / right (zoom in) |

#### How to Use the Joystick

1. **Toggle mode**: Tap the inner circle to cycle through modes: **M → R → H → L → M**
2. **Control**: Touch the outer ring area and drag in the desired direction
3. **Stop**: Release your finger to stop movement immediately

### User Interface

#### Discovery Notification
- When you discover a marker, a green notification appears: "Discovered: [Marker Name]!"
- The notification fades after 3 seconds

#### Discovery Counter
- Top-right corner shows your progress: `X/5 found`
- Track how many markers you've discovered out of the total

#### Chat Panel
- Located at the bottom of the screen
- **Swipe up** on the drag handle to expand the panel
- **Swipe down** to collapse it
- Tap the **+** button to open the toolbox with quick actions

### Discovery Markers

The current scene includes 5 discoverable locations:

| Marker | Position | Description |
|--------|----------|-------------|
| Desk Lamp | [2.0, 1.5, 1.0] | A lamp on the desk |
| Potted Plant | [-0.5, 1.2, 2.0] | A plant in a pot |
| Old Book | [1.0, 1.0, -0.5] | An ancient book |
| Wall Clock | [3.5, 2.0, 0.5] | A clock on the wall |
| Hidden Key | [0.5, 0.8, 1.5] | A secret key |

Get within the threshold distance (1.0–1.8 units) of each marker to trigger discovery.

---

## Changing 3DGS Scenes

### Overview

The game renders 3D scenes using the **GaussianSplats3D** library, which supports multiple file formats:
- `.ply` — Original format from INRIA's 3D Gaussian Splatting project
- `.splat` — Standard splat file format
- `.spz` — Compressed format by Niantic Labs (~10x smaller than PLY)
- `.ksplat` — Compressed format by GaussianSplats3D

The current game uses `.spz` format for optimal loading performance.

### How to Replace the Scene

1. **Prepare your scene file** in `.spz`, `.ply`, `.splat`, or `.ksplat` format
2. **Place the file** in the `public/` directory:
   ```
   public/your-scene.spz
   ```
3. **Update the scene path** in `src/components/GaussianSplatScene.tsx`:
   ```typescript
   viewer.addSplatScene('/your-scene.spz', {
     // ... configuration
   })
   ```
4. **Adjust camera settings** if needed (lines 6-8 in GaussianSplatScene.tsx):
   ```typescript
   const CAMERA_POS = [x, y, z];
   const CAMERA_TARGET = [x, y, z];
   const CAMERA_UP = [0, -1, 0];
   ```
5. **Update discovery markers** in `src/components/DiscoveryMarkers.tsx` to match your new scene

### Converting PLY to SPZ Format

The `.spz` format is recommended for web deployment due to its ~10x smaller file size. Here are multiple methods to convert PLY to SPZ:

#### Method 1: Using SuperSplat (Browser-based, Easiest)

1. Visit [SuperSplat Convert](https://superspl.at/convert)
2. Drag & drop your `.ply` file
3. Export as `.spz` format
4. Download the converted file

**Advantages**: No installation required, runs entirely in browser, privacy-friendly (no server uploads)

#### Method 2: Using Splattr (Online Converter)

1. Visit [Splattr Converter](https://splattr.app/tools/converter/online)
2. Upload your `.ply` file
3. Select SPZ as output format
4. Download the converted file

#### Method 3: Using spz-js (Node.js/TypeScript)

For programmatic conversion:

```bash
npm install spz-js
```

```typescript
import { createReadStream, writeFileSync } from 'fs';
import { Readable } from 'stream';
import { loadPly, serializeSpz } from 'spz-js';

// Load PLY file
const fileStream = createReadStream('scene.ply');
const webStream = Readable.toWeb(fileStream);
const gaussians = await loadPly(webStream);

// Convert and save as SPZ
const spzData = await serializeSpz(gaussians);
writeFileSync('scene.spz', Buffer.from(spzData));
```

#### Method 4: Using Niantic's C++ Library (Advanced)

For maximum control and performance:

```bash
git clone https://github.com/nianticlabs/spz.git
cd spz
mkdir build && cd build
cmake ..
make
```

Use the C++ API:
```cpp
#include "spz.h"

GaussianCloud gaussians = loadPly("scene.ply");
PackOptions options;
options.from = CoordinateSystem::RDF;  // PLY typically uses RDF
saveSpz(gaussians, options, "scene.spz");
```

**Note**: SPZ uses RUB coordinate system (OpenGL/Three.js convention). If your PLY uses RDF, specify the conversion in PackOptions.

### File Format Comparison

| Format | Size | Loading Speed | Best For |
|--------|------|---------------|----------|
| `.ply` | Large (100% baseline) | Slow (progressive) | Original data, editing |
| `.spz` | ~10% of PLY | Fast | **Web deployment** ✅ |
| `.ksplat` | ~15% of PLY | Fast | GaussianSplats3D native |
| `.splat` | ~50% of PLY | Medium | General use |

### Tips for Scene Optimization

- **Use SPZ format** for web deployment to reduce loading times
- **Adjust `splatAlphaRemovalThreshold`** (0-255) to remove transparent splats
- **Enable `progressiveLoad: true`** for faster initial rendering
- **Test on mobile devices** — large scenes may have performance issues
- **Consider scene scale** — very large dimensions may cause rendering artifacts

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              3DGS Discovery Game                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │         App.tsx (Game Controller)         │  │
│  │  • Game state management                  │  │
│  │  • Movement loop (requestAnimationFrame)  │  │
│  │  • Discovery marker detection             │  │
│  │  • Component orchestration                │  │
│  └─────────────┬─────────────────────────────┘  │
│                │                                │
│       ┌────────┴────────┐                       │
│       │                 │                       │
│  ┌────▼─────┐    ┌──────▼──────┐                │
│  │ 3D Scene │    │ UI Controls │                │
│  │Viewport  │    │  (PWA)      │                │
│  └────┬─────┘    └──────┬──────┘                │
│       │                 │                       │
│  ┌────▼──────────┐ ┌───▼────────────┐           │
│  │GaussianSplat  │ │ mobile_game_pwa │           │
│  │Scene.tsx      │ │   Framework     │           │
│  │               │ │                 │           │
│  │• Three.js     │ │• Joystick       │           │
│  │• GaussianSpl  │ │• ChatPanel      │           │
│  │ ats3D         │ │• HUD            │           │
│  │• Camera ctrl  │ │• EntityState    │           │
│  └───────────────┘ └─────────────────┘           │
└─────────────────────────────────────────────────┘
```

### Integration with mobile_game_pwa Framework

This game imports **mobile_game_pwa** as a general-purpose mobile game UI framework via local npm package reference.

#### How the Integration Works

**1. Package Reference**

In `package.json`:
```json
"dependencies": {
  "mobile_game_pwa": "file:../mobile_game_pwa"
}
```

This creates a symbolic link to the `mobile_game_pwa` directory, allowing direct import of its components.

**2. Imported Components**

```typescript
import { Joystick, ChatPanel } from 'mobile_game_pwa';
import type { EntityState } from 'mobile_game_pwa';
```

**Exported from mobile_game_pwa:**

| Component | Purpose |
|-----------|---------|
| `Joystick` | 4-mode touch joystick (Move/Rotate/Height/Lens) |
| `ChatPanel` | Resizable AI chat panel with expandable toolbox |
| `EntityState` | TypeScript interface for entity state (`x`, `y`, `z`, `yaw`, `focal`) |

**3. Architecture Pattern**

The game follows a **separation of concerns** pattern:

- **mobile_game_pwa** provides: 
  - Generic UI controls (joystick, chat panel)
  - Touch input handling
  - Animation systems (Framer Motion)
  - Type definitions

- **3dgs_discovery_game** provides:
  - Game-specific logic (discovery system)
  - 3D scene rendering (GaussianSplats3D)
  - Camera control integration
  - Game state management

**4. Data Flow**

```
Joystick Input → velocityRef → startLoop() → setEntityState() → Camera Update
                                                      ↓
                                               Discovery Check
                                                      ↓
                                            Marker Notification
```

- **Joystick callbacks** (`onMove`, `onRotate`, `onHeight`, `onFocal`) set velocity values
- **Persistent animation loop** (`requestAnimationFrame`) updates camera position each frame
- **EntityState** tracks: position (x, y, z), orientation (yaw), camera focal length
- **Discovery system** checks camera position against marker locations in real-time

**5. Benefits of This Architecture**

✅ **Reusability**: mobile_game_pwa can be used by multiple games  
✅ **Maintainability**: UI controls and game logic are decoupled  
✅ **Extensibility**: Easy to swap 3D scene implementations  
✅ **Type Safety**: Shared TypeScript interfaces ensure consistency  
✅ **No Build Step**: Source files are directly transpiled by Vite  

### Component Breakdown

#### Core Components

| File | Component | Responsibility |
|------|-----------|----------------|
| `App.tsx` | `App` | Game controller, state management, movement loop |
| `GaussianSplatScene.tsx` | `GaussianSplatScene` | 3D scene rendering, camera management, loading UI |
| `DiscoveryMarkers.tsx` | `MARKERS`, `checkDiscoveries` | Marker definitions, proximity detection |

#### External Dependencies

| Package | Purpose |
|---------|---------|
| `@mkkellogg/gaussian-splats-3d` | 3D Gaussian Splatting renderer |
| `mobile_game_pwa` | Mobile game UI framework |
| `three` | 3D graphics library |
| `framer-motion` | UI animations |
| `lucide-react` | Icon library |

### State Management

The game uses React's `useState` and `useRef` hooks:

- **`entityState`**: Current camera state (position, yaw, focal length)
- **`velocityRef`**: Mutable velocity values for smooth animation loop
- **`discoveries`**: Set of discovered marker IDs
- **`sceneRef`**: Imperative handle to Three.js camera and scene methods

### Rendering Pipeline

1. **GaussianSplats3D.DropInViewer** loads and renders the `.spz` scene
2. **Three.js** manages the camera and rendering loop
3. **Joystick input** updates velocity references
4. **Animation loop** calculates new camera position based on velocities
5. **Camera updates** are applied directly to Three.js camera object
6. **Discovery check** compares camera position with marker locations

---

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type-safe development
- **Vite** — Fast build tool with HMR
- **Three.js** — 3D rendering engine
- **@mkkellogg/gaussian-splats-3d** — 3D Gaussian Splatting renderer
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — UI animations
- **Lucide React** — Icon library
- **vite-plugin-pwa** — PWA support

---

## License

MIT

---

## Acknowledgments

- [GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) by Mark Kellogg — 3D Gaussian Splatting renderer
- [SPZ Format](https://github.com/nianticlabs/spz) by Niantic Labs — Compressed Gaussian splat file format
- [mobile_game_pwa](../mobile_game_pwa) — Mobile game UI framework

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Troubleshooting

### Scene doesn't load
- Check that the `.spz` file exists in `public/` directory
- Verify the file path in `GaussianSplatScene.tsx`
- Check browser console for loading errors

### Joystick not responding
- Ensure you're using a touch-capable device or browser
- Check that `mobile_game_pwa` is properly installed (`npm install`)

### Build errors
- Verify Node.js version is v18 or later
- Ensure `mobile_game_pwa` directory exists at `../mobile_game_pwa`
- Run `npm install` to refresh dependencies

### Performance issues
- Try reducing scene complexity or using SPZ format
- Enable `gpuAcceleratedSort: true` in GaussianSplats3D config
- Test on desktop browser first to isolate mobile-specific issues

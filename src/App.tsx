import { useState, useRef, useCallback } from 'react';
import { Joystick, ChatPanel } from 'mobile_game_pwa';
import type { EntityState } from 'mobile_game_pwa';
import GaussianSplatScene from './components/GaussianSplatScene';
import type { SceneHandle } from './components/GaussianSplatScene';
import { checkDiscoveries, MARKERS } from './components/DiscoveryMarkers';
import * as THREE from 'three';

export default function App() {
  const [entityState, setEntityState] = useState<EntityState>({
    x: 0.5, y: 2.5, z: 1.73, yaw: 0, focal: 60,
  });
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [chatHeight, setChatHeight] = useState(30);
  const [discoveries, setDiscoveries] = useState<Set<string>>(new Set());
  const [lastDiscovery, setLastDiscovery] = useState<string | null>(null);

  const sceneRef = useRef<SceneHandle>(null);
  const velocityRef = useRef({ vx: 0, vy: 0, vyaw: 0, vz: 0, vf: 0 });
  const animFrameRef = useRef<number>(0);

  // Persistent movement loop — updates camera position each frame
  const startLoop = useCallback(() => {
    if (animFrameRef.current) return;
    const tick = () => {
      const { vx, vy, vyaw, vz, vf } = velocityRef.current;
      if (vx !== 0 || vy !== 0 || vyaw !== 0 || vz !== 0 || vf !== 0) {
        setEntityState((prev) => {
          const yawRad = (prev.yaw * Math.PI) / 180;
          // Forward/backward based on yaw direction
          const fwdX = -Math.sin(yawRad);
          const fwdZ = -Math.cos(yawRad);
          // Right strafe
          const rightX = Math.cos(yawRad);
          const rightZ = -Math.sin(yawRad);

          const newState: EntityState = {
            x: prev.x + (fwdX * vy + rightX * vx) * 0.016,
            y: prev.y + (fwdZ * vy + rightZ * vx) * 0.016,
            z: Math.max(0.5, Math.min(5, prev.z + vz * 0.016)),
            yaw: (prev.yaw + vyaw * 0.016 + 360) % 360,
            focal: Math.max(30, Math.min(120, prev.focal + vf * 0.016)),
          };

          // Move Three.js camera
          const handle = sceneRef.current;
          if (handle?.camera) {
            handle.camera.position.set(newState.x, newState.z, newState.y);
            const lookX = newState.x - Math.sin((newState.yaw * Math.PI) / 180);
            const lookZ = newState.y - Math.cos((newState.yaw * Math.PI) / 180);
            handle.camera.lookAt(lookX, newState.z, lookZ);
            handle.camera.fov = newState.focal;
            handle.camera.updateProjectionMatrix();
          }

          // Check discovery markers
          const camPos = new THREE.Vector3(newState.x, newState.z, newState.y);
          const found = checkDiscoveries(camPos, discoveries);
          if (found) {
            setDiscoveries((prev) => new Set(prev).add(found));
            const marker = MARKERS.find((m) => m.id === found);
            setLastDiscovery(marker?.name ?? found);
            setTimeout(() => setLastDiscovery(null), 3000);
          }

          return newState;
        });
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [discoveries]);

  const stopAll = useCallback(() => {
    velocityRef.current = { vx: 0, vy: 0, vyaw: 0, vz: 0, vf: 0 };
  }, []);

  const setVelocity = useCallback((vx: number, vy: number) => {
    velocityRef.current.vx = vx;
    velocityRef.current.vy = vy;
    startLoop();
  }, [startLoop]);

  const setYawVelocity = useCallback((vyaw: number) => {
    velocityRef.current.vyaw = vyaw;
    startLoop();
  }, [startLoop]);

  const setHeightVelocity = useCallback((vz: number) => {
    velocityRef.current.vz = vz;
    startLoop();
  }, [startLoop]);

  const setFocalVelocity = useCallback((vf: number) => {
    velocityRef.current.vf = vf;
    startLoop();
  }, [startLoop]);

  const handleDragDelta = useCallback((deltaVh: number) => {
    setChatHeight((h) => Math.max(15, Math.min(60, h + deltaVh)));
  }, []);

  return (
    <div className="flex flex-col w-screen overflow-hidden bg-gray-100 select-none" style={{ height: '100dvh' }}>
      {/* Main 3D Viewport (top ~70%) */}
      <div className="relative w-full flex-shrink-0 touch-none" style={{ height: `${100 - chatHeight}vh` }}>
        {/* Gaussian Splat Scene */}
        <GaussianSplatScene ref={sceneRef} />

        {/* Discovery notification */}
        {lastDiscovery && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
            Discovered: {lastDiscovery}!
          </div>
        )}

        {/* Discovery counter */}
        <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
          {discoveries.size}/{MARKERS.length} found
        </div>

        {/* Joystick overlay — fills the viewport area so the joystick centers itself */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Joystick
            onMove={setVelocity}
            onRotate={setYawVelocity}
            onHeight={setHeightVelocity}
            onFocal={setFocalVelocity}
            onStop={stopAll}
          />
        </div>
      </div>

      {/* Chat & Toolbox Panel */}
      <div className="relative w-full flex-grow overflow-hidden" style={{ height: `${chatHeight}vh` }}>
        <ChatPanel
          toolboxOpen={toolboxOpen}
          onToggleToolbox={() => setToolboxOpen((o) => !o)}
          onDragDelta={handleDragDelta}
        />
      </div>
    </div>
  );
}

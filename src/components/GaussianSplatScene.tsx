import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

const CAMERA_POS = [0.5, 1.73, 2.5] as const;
const CAMERA_TARGET = [0.5, 1.73, 1.5] as const;
const CAMERA_UP = [0, -1, 0] as const;

export interface SceneHandle {
  camera: THREE.PerspectiveCamera | null;
  getForward: () => THREE.Vector3;
  getRight: () => THREE.Vector3;
}

const GaussianSplatScene = forwardRef<SceneHandle>(function GaussianSplatScene(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Initializing...');
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useImperativeHandle(ref, () => ({
    get camera() { return cameraRef.current; },
    getForward() {
      const cam = cameraRef.current;
      if (!cam) return new THREE.Vector3(0, 0, -1);
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      return dir;
    },
    getRight() {
      const cam = cameraRef.current;
      if (!cam) return new THREE.Vector3(1, 0, 0);
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3();
      right.crossVectors(dir, new THREE.Vector3(0, -1, 0)).normalize();
      return right;
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(
      60, container.clientWidth / container.clientHeight, 0.01, 1000
    );
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: false, powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf0f0f0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none'; // Prevent splat viewer from capturing touch
    container.appendChild(renderer.domElement);
    camera.up.set(CAMERA_UP[0], CAMERA_UP[1], CAMERA_UP[2]);
    camera.position.set(CAMERA_POS[0], CAMERA_POS[1], CAMERA_POS[2]);
    camera.lookAt(CAMERA_TARGET[0], CAMERA_TARGET[1], CAMERA_TARGET[2]);
    const viewer = new GaussianSplats3D.DropInViewer({
      sharedMemoryForWorkers: false,
      gpuAcceleratedSort: false,
      integerBasedSort: true,
      antialiased: false,
      logLevel: GaussianSplats3D.LogLevel.None,
    });
    scene.add(viewer);
    setStatusText('Downloading...');
    viewer.addSplatScene('/room.spz', {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
      showLoadingUI: false,
      progressiveLoad: true,
      splatAlphaRemovalThreshold: 10,
      onProgress: (pct: number, label: string) => {
        const p = Number.isFinite(pct) ? Math.round(pct) : 0;
        setProgress(p);
        setStatusText(label || (p < 100 ? 'Processing...' : 'Ready'));
      },
    }).then(() => { setLoading(false); }).catch((err: Error) => {
      console.error('[3DGS] Load error (non-fatal):', err);
      setLoading(false);
    });
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      try { viewer.dispose(); } catch { /* ignore */ }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <AnimatePresence>
        {loading && (
          <motion.div key="progress"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100"
          >
            <div className="w-3/4 max-w-xs">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GaussianSplatScene;

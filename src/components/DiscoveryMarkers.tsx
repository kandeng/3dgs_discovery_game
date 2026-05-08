import * as THREE from 'three';

export interface MarkerDef {
  id: string;
  name: string;
  position: [number, number, number];
  threshold: number; // distance to trigger discovery
}

export const MARKERS: MarkerDef[] = [
  { id: 'lamp', name: 'Desk Lamp', position: [2.0, 1.5, 1.0], threshold: 1.5 },
  { id: 'plant', name: 'Potted Plant', position: [-0.5, 1.2, 2.0], threshold: 1.5 },
  { id: 'book', name: 'Old Book', position: [1.0, 1.0, -0.5], threshold: 1.2 },
  { id: 'clock', name: 'Wall Clock', position: [3.5, 2.0, 0.5], threshold: 1.8 },
  { id: 'key', name: 'Hidden Key', position: [0.5, 0.8, 1.5], threshold: 1.0 },
];

export function checkDiscoveries(
  cameraPos: THREE.Vector3,
  found: Set<string>
): string | null {
  for (const marker of MARKERS) {
    if (found.has(marker.id)) continue;
    const markerPos = new THREE.Vector3(...marker.position);
    const dist = cameraPos.distanceTo(markerPos);
    if (dist < marker.threshold) {
      return marker.id;
    }
  }
  return null;
}

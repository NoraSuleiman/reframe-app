import { useEffect, useRef, type MutableRefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, Grid, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Material, SceneModule, SceneSettings } from '@/domain/types';
import type { BuilderApi, ViewPreset } from './api';
import { ModuleMesh } from './ModuleMesh';

const LIGHTING: Record<SceneSettings['lighting'], { ambient: number; dir: number; color: string; sky: string }> = {
  studio: { ambient: 0.85, dir: 0.6, color: '#ffffff', sky: '#eee9df' },
  daylight: { ambient: 0.6, dir: 1.0, color: '#fff4e2', sky: '#e7e2d6' },
  dusk: { ambient: 0.4, dir: 0.7, color: '#f4d2b0', sky: '#d8ccbe' },
};

interface SceneProps {
  modules: SceneModule[];
  settings: SceneSettings;
  selectedId: string | null;
  byId: Map<string, Material>;
  api: MutableRefObject<BuilderApi>;
  onSelect: (id: string | null) => void;
  onCommitPosition: (id: string, position: [number, number, number]) => void;
}

export function Scene({
  modules,
  settings,
  selectedId,
  byId,
  api,
  onSelect,
  onCommitPosition,
}: SceneProps) {
  const { facade, gridSize, snap, showGrid, lighting } = settings;
  const cy = facade.height / 2;
  const light = LIGHTING[lighting];

  return (
    <>
      <color attach="background" args={[light.sky]} />
      <hemisphereLight intensity={light.ambient} groundColor="#cabfa9" />
      <directionalLight
        position={[facade.width * 0.5, facade.height * 1.4, 12]}
        intensity={light.dir}
        color={light.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Façade backing panel */}
      <mesh position={[0, cy, -0.08]} receiveShadow>
        <planeGeometry args={[facade.width, facade.height]} />
        <meshStandardMaterial color="#efe9dd" roughness={1} />
      </mesh>

      {/* Vertical snapping grid on the façade plane */}
      {showGrid && (
        <Grid
          position={[0, cy, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[facade.width, facade.height]}
          cellSize={gridSize}
          cellThickness={0.6}
          cellColor="#b9b0a0"
          sectionSize={gridSize * 4}
          sectionThickness={1}
          sectionColor="#9c8f78"
          fadeDistance={60}
          fadeStrength={1}
          infiniteGrid={false}
        />
      )}

      {modules.map((m) => (
        <ModuleMesh
          key={m.id}
          module={m}
          material={byId.get(m.materialId)}
          selected={m.id === selectedId}
          onSelect={onSelect}
          onCommitPosition={onCommitPosition}
        />
      ))}

      <Controls api={api} facade={facade} gridSize={gridSize} snap={snap} />

      <GizmoHelper alignment="bottom-right" margin={[64, 64]}>
        <GizmoViewport axisColors={['#9c5b3b', '#586343', '#8fa7a6']} labelColor="#1b1812" />
      </GizmoHelper>
    </>
  );
}

/** OrbitControls + imperative bridges for placement (drop) and view presets. */
function Controls({
  api,
  facade,
  gridSize,
  snap,
}: {
  api: MutableRefObject<BuilderApi>;
  facade: { width: number; height: number };
  gridSize: number;
  snap: boolean;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const cy = facade.height / 2;

  useEffect(() => {
    const snapV = (v: number) => (snap ? Math.round(v / gridSize) * gridSize : v);

    api.current.place = (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      const point = new THREE.Vector3();
      if (!raycaster.current.ray.intersectPlane(plane.current, point)) return null;
      return [snapV(point.x), snapV(point.y), 0];
    };

    api.current.setView = (preset: ViewPreset) => {
      const controls = controlsRef.current;
      if (!controls) return;
      const span = Math.max(facade.width, facade.height);
      const positions: Record<ViewPreset, [number, number, number]> = {
        front: [0, cy, span * 1.3],
        iso: [span * 0.8, facade.height * 1.0, span * 1.1],
        top: [0, facade.height * 1.6, 0.001],
      };
      camera.position.set(...positions[preset]);
      controls.target.set(0, cy, 0);
      controls.update();
    };

    return () => {
      api.current.place = null;
      api.current.setView = null;
    };
  }, [api, camera, gl, gridSize, snap, facade.width, facade.height, cy]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, cy, 0]}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={80}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}

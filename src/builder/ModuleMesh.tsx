import { useEffect, useLayoutEffect, useRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import { TransformControls } from 'three-stdlib';
import type { Mesh } from 'three';
import type { Material, SceneModule } from '@/domain/types';
import { familyHex } from '@/lib/swatch';
import { pendingPositions } from './pendingPositions';

interface ModuleMeshProps {
  module: SceneModule;
  material: Material | undefined;
  selected: boolean;
  onSelect: (id: string) => void;
  onCommitPosition: (id: string, position: [number, number, number]) => void;
}

export function ModuleMesh({
  module,
  material,
  selected,
  onSelect,
  onCommitPosition,
}: ModuleMeshProps) {
  const meshRef = useRef<Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tcRef = useRef<any>(null);
  const color = material ? familyHex(material.family, material.slug) : '#9aa0a4';

  const { camera, gl, scene } = useThree();
  const orbitControls = useThree((s) => s.controls) as { enabled: boolean } | null;

  // Keep latest callbacks in refs so the imperative TC listeners never go stale
  const onCommitRef = useRef(onCommitPosition);
  onCommitRef.current = onCommitPosition;
  const orbitRef = useRef(orbitControls);
  orbitRef.current = orbitControls;

  // Create one TransformControls per module and add it directly to the Three.js
  // scene — completely outside React's tree. This means the <mesh> below always
  // stays at the same position in the component tree, so React never unmounts /
  // remounts it and the Three.js position is never reset by reconciliation.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tc: any = new TransformControls(camera, gl.domElement);
    tc.setMode('translate');
    tc.showZ = false;
    tc.size = 0.7;
    tc.enabled = false;
    tc.visible = false;
    scene.add(tc);
    tcRef.current = tc;

    const handleChange = () => {
      const p = meshRef.current?.position;
      if (p) pendingPositions.set(module.id, [p.x, p.y, p.z]);
    };
    const handleMouseDown = () => {
      if (orbitRef.current) orbitRef.current.enabled = false;
    };
    const handleMouseUp = () => {
      if (orbitRef.current) orbitRef.current.enabled = true;
      const p = meshRef.current?.position;
      if (p) {
        pendingPositions.delete(module.id);
        onCommitRef.current(module.id, [p.x, p.y, p.z]);
      }
    };

    tc.addEventListener('change', handleChange);
    tc.addEventListener('mouseDown', handleMouseDown);
    tc.addEventListener('mouseUp', handleMouseUp);

    return () => {
      tc.removeEventListener('change', handleChange);
      tc.removeEventListener('mouseDown', handleMouseDown);
      tc.removeEventListener('mouseUp', handleMouseUp);
      tc.detach();
      tc.dispose();
      scene.remove(tc);
      tcRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // camera/gl/scene are stable for the lifetime of the R3F canvas

  // Show/attach or hide/detach TC whenever selection or locked state changes
  useEffect(() => {
    const tc = tcRef.current;
    if (!tc || !meshRef.current) return;
    if (selected && !module.locked) {
      tc.attach(meshRef.current);
      tc.enabled = true;
      tc.visible = true;
    } else {
      tc.detach();
      tc.enabled = false;
      tc.visible = false;
    }
  }, [selected, module.locked]);

  // Set initial Three.js position on mount (objects default to [0,0,0])
  useLayoutEffect(() => {
    meshRef.current?.position.set(...module.position);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync from the store when deselected (handles page-reload / undo)
  const [px, py, pz] = module.position;
  useLayoutEffect(() => {
    if (!selected) meshRef.current?.position.set(px, py, pz);
  }, [px, py, pz, selected]);

  return (
    <mesh
      ref={meshRef}
      rotation={[0, module.rotationY, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onSelect(module.id);
      }}
      castShadow
    >
      <boxGeometry args={[module.size.width, module.size.height, module.size.depth]} />
      <meshStandardMaterial
        color={color}
        roughness={0.72}
        metalness={material?.family === 'substructure' ? 0.5 : 0.12}
      />
      <Edges threshold={15} color={selected ? '#9C5B3B' : '#1b1812'} />
      {(selected || module.locked) && (
        <Html
          position={[0, module.size.height / 2 + 0.25, 0]}
          center
          distanceFactor={14}
          className="pointer-events-none whitespace-nowrap rounded bg-ink/85 px-2 py-0.5 font-mono text-[10px] text-paper"
        >
          {module.locked ? '🔒 ' : ''}
          {material?.name ?? 'Module'} · {module.size.width.toFixed(1)}×{module.size.height.toFixed(1)}m
        </Html>
      )}
    </mesh>
  );
}

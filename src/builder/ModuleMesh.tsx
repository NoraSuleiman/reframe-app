import { useRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, Html, TransformControls } from '@react-three/drei';
import type { Mesh } from 'three';
import type { Material, SceneModule } from '@/domain/types';
import { familyHex } from '@/lib/swatch';

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
  const color = material ? familyHex(material.family, material.slug) : '#9aa0a4';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitControls = useThree((s) => s.controls) as any;

  const mesh = (
    <mesh
      ref={meshRef}
      position={module.position}
      rotation={[0, module.rotationY, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onSelect(module.id);
      }}
      castShadow
    >
      <boxGeometry args={[module.size.width, module.size.height, module.size.depth]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={material?.family === 'substructure' ? 0.5 : 0.12} />
      <Edges threshold={15} color={selected ? '#9C5B3B' : '#1b1812'} />
      {selected && (
        <Html
          position={[0, module.size.height / 2 + 0.25, 0]}
          center
          distanceFactor={14}
          className="pointer-events-none whitespace-nowrap rounded bg-ink/85 px-2 py-0.5 font-mono text-[10px] text-paper"
        >
          {material?.name ?? 'Module'} · {module.size.width.toFixed(1)}×{module.size.height.toFixed(1)}m
        </Html>
      )}
    </mesh>
  );

  if (!selected) return mesh;

  return (
    <TransformControls
      mode="translate"
      showZ={false}
      size={0.7}
      onDraggingChange={(e: any) => {
        if (orbitControls) orbitControls.enabled = !e.value;
      }}
      onMouseUp={() => {
        if (orbitControls) orbitControls.enabled = true;
        const p = meshRef.current?.position;
        if (p) onCommitPosition(module.id, [p.x, p.y, p.z]);
      }}
    >
      {mesh}
    </TransformControls>
  );
}

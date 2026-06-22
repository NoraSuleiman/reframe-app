import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ButtonLink } from '@/components/ui/Button';
import { useBuilderStore } from '@/store/builder';
import { useEntries } from '@/hooks/useEntries';
import { bandMid, scoreMaterial } from '@/domain/crs';
import type { SceneModule } from '@/domain/types';
import { Scene } from '@/builder/Scene';
import { PaletteBar } from '@/builder/PaletteBar';
import { Sidebar, type Readout } from '@/builder/Sidebar';
import type { BuilderApi } from '@/builder/api';

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Builder() {
  const { modules, settings, selectedId, addModule, updateModule, removeModule, duplicateModule, toggleLock, select, setSettings, clear } =
    useBuilderStore();
  const { byId } = useEntries([]);
  const api = useRef<BuilderApi>({ place: null, setView: null });
  const [hasWebgl] = useState(webglAvailable);
  const [toast, setToast] = useState<string | null>(null);

  const selected = useMemo(
    () => modules.find((m) => m.id === selectedId) ?? null,
    [modules, selectedId],
  );

  const placeMaterial = useCallback(
    (materialId: string, position: [number, number, number]) => {
      const material = byId.get(materialId);
      const size = material
        ? { width: material.unitDimensions.width, height: material.unitDimensions.height, depth: 0.12 }
        : { width: 1, height: 1, depth: 0.12 };
      const mod: SceneModule = { id: crypto.randomUUID(), materialId, position, size, rotationY: 0 };
      addModule(mod);
    },
    [byId, addModule],
  );

  const readout = useMemo<Readout>(() => {
    let area = 0;
    let weighted = 0;
    let carbon = 0;
    for (const m of modules) {
      const mat = byId.get(m.materialId);
      const a = m.size.width * m.size.height;
      area += a;
      if (mat) {
        weighted += scoreMaterial(mat).ecrsRatio * a;
        carbon += bandMid(mat.carbonSavingPct) * a;
      }
    }
    return {
      moduleCount: modules.length,
      totalArea: area,
      aggregateCrs: area > 0 ? weighted / area : 0,
      carbonSaving: area > 0 ? carbon / area : 0,
    };
  }, [modules, byId]);

  // Keyboard nudge + delete for the selected module (accessibility).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      const mod = useBuilderStore.getState().modules.find((m) => m.id === selectedId);
      if (!mod) return;
      const step = settings.gridSize;
      const [x, y, z] = mod.position;
      const map: Record<string, [number, number, number]> = {
        ArrowLeft: [x - step, y, z],
        ArrowRight: [x + step, y, z],
        ArrowUp: [x, y + step, z],
        ArrowDown: [x, y - step, z],
      };
      if (map[e.key]) {
        e.preventDefault();
        updateModule(selectedId, { position: map[e.key] });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeModule(selectedId);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, settings.gridSize, updateModule, removeModule]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="flex h-full flex-col">
      <PaletteBar
        onPlaceAtCenter={(materialId) => placeMaterial(materialId, [0, settings.facade.height / 2, 0])}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className="relative min-w-0 flex-1 bg-[var(--builder-bg-bottom)]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const materialId = e.dataTransfer.getData('text/material-id');
            if (!materialId) return;
            const pos = api.current.place?.(e.clientX, e.clientY);
            if (pos) placeMaterial(materialId, pos);
          }}
        >
          {hasWebgl ? (
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{ position: [10, 7, 16], fov: 45, near: 0.1, far: 200 }}
              onPointerMissed={() => select(null)}
            >
              <Scene
                modules={modules}
                settings={settings}
                selectedId={selectedId}
                byId={byId}
                api={api}
                onSelect={select}
                onCommitPosition={(id, position) => updateModule(id, { position })}
              />
            </Canvas>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-sm text-center">
                <h2 className="font-display text-h4">3D unavailable</h2>
                <p className="mt-2 text-body-sm text-stone">
                  Your browser or device doesn’t support WebGL, which the façade builder needs. You
                  can still curate your palette and request a quote.
                </p>
                <ButtonLink to="/palette" className="mt-4">
                  Back to palette
                </ButtonLink>
              </div>
            </div>
          )}

          {modules.length === 0 && hasWebgl && (
            <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-2 text-caption text-paper">
              Drag a material from the palette above onto the grid to place a module.
            </div>
          )}

          {toast && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-moss px-4 py-2 text-caption text-white shadow-card">
              {toast}
            </div>
          )}
        </div>

        <Sidebar
          settings={settings}
          setSettings={setSettings}
          selected={selected}
          selectedMaterial={selected ? byId.get(selected.materialId) : undefined}
          readout={readout}
          api={api}
          onUpdateSelected={(patch) => selectedId && updateModule(selectedId, patch)}
          onDuplicate={() => selectedId && duplicateModule(selectedId)}
          onRemove={() => selectedId && removeModule(selectedId)}
          onToggleLock={() => selectedId && toggleLock(selectedId)}
          onSave={() => flash('Scene saved to this browser')}
          onClear={() => {
            if (modules.length && confirm('Remove all modules from the scene?')) clear();
          }}
        />
      </div>
    </div>
  );
}

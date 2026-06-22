import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SceneModule, SceneSettings } from '@/domain/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { pendingPositions } from '@/builder/pendingPositions';

export const DEFAULT_SETTINGS: SceneSettings = {
  gridSize: 0.5,
  snap: true,
  showGrid: true,
  facade: { width: 12, height: 9 },
  lighting: 'daylight',
};

interface BuilderState {
  modules: SceneModule[];
  settings: SceneSettings;
  selectedId: string | null;

  addModule: (module: SceneModule) => void;
  updateModule: (id: string, patch: Partial<SceneModule>) => void;
  removeModule: (id: string) => void;
  duplicateModule: (id: string) => void;
  toggleLock: (id: string) => void;
  select: (id: string | null) => void;
  setSettings: (patch: Partial<SceneSettings>) => void;
  clear: () => void;
}

function snap(value: number, size: number, enabled: boolean): number {
  return enabled ? Math.round(value / size) * size : value;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      modules: [],
      settings: DEFAULT_SETTINGS,
      selectedId: null,

      addModule: (module) => set((s) => ({ modules: [...s.modules, module], selectedId: module.id })),

      updateModule: (id, patch) =>
        set((s) => {
          const { snap: snapOn, gridSize } = s.settings;
          return {
            modules: s.modules.map((m) => {
              if (m.id !== id) return m;
              const next = { ...m, ...patch };
              if (patch.position) {
                next.position = [
                  snap(patch.position[0], gridSize, snapOn),
                  snap(patch.position[1], gridSize, snapOn),
                  patch.position[2] ?? m.position[2],
                ];
              }
              if (patch.size) {
                next.size = {
                  width: Math.max(gridSize, snap(patch.size.width, gridSize, snapOn)),
                  height: Math.max(gridSize, snap(patch.size.height, gridSize, snapOn)),
                  depth: patch.size.depth ?? m.size.depth,
                };
              }
              return next;
            }),
          };
        }),

      removeModule: (id) =>
        set((s) => ({
          modules: s.modules.filter((m) => m.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      toggleLock: (id) =>
        set((s) => {
          const target = s.modules.find((m) => m.id === id);
          const isLocking = !target?.locked;
          // Flush any pending drag position before locking so it locks in place
          const pending = isLocking ? pendingPositions.get(id) : undefined;
          if (pending) pendingPositions.delete(id);
          const { snap: snapOn, gridSize } = s.settings;
          return {
            modules: s.modules.map((m) => {
              if (m.id !== id) return m;
              const next = { ...m, locked: !m.locked };
              if (pending) {
                next.position = [
                  snap(pending[0], gridSize, snapOn),
                  snap(pending[1], gridSize, snapOn),
                  pending[2],
                ];
              }
              return next;
            }),
            // Keep selected so the sidebar shows Unlock button
          };
        }),

      duplicateModule: (id) => {
        const src = get().modules.find((m) => m.id === id);
        if (!src) return;
        const { gridSize } = get().settings;
        const copy: SceneModule = {
          ...src,
          id: crypto.randomUUID(),
          position: [src.position[0] + gridSize * 2, src.position[1], src.position[2]],
        };
        set((s) => ({ modules: [...s.modules, copy], selectedId: copy.id }));
      },

      select: (id) =>
        set((s) => {
          // Flush any in-progress drag position for the module being deselected
          // so the commit and the selectedId change happen in one atomic update.
          const pending = s.selectedId ? pendingPositions.get(s.selectedId) : undefined;
          if (pending && s.selectedId) {
            pendingPositions.delete(s.selectedId);
            const { snap: snapOn, gridSize } = s.settings;
            return {
              selectedId: id,
              modules: s.modules.map((m) =>
                m.id === s.selectedId
                  ? { ...m, position: [snap(pending[0], gridSize, snapOn), snap(pending[1], gridSize, snapOn), pending[2]] as [number, number, number] }
                  : m,
              ),
            };
          }
          return { selectedId: id };
        }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      clear: () => set({ modules: [], selectedId: null }),
    }),
    { name: STORAGE_KEYS.scene },
  ),
);

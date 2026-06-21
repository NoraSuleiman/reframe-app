import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SceneModule, SceneSettings } from '@/domain/types';
import { STORAGE_KEYS } from '@/lib/storage';

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

      select: (id) => set({ selectedId: id }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      clear: () => set({ modules: [], selectedId: null }),
    }),
    { name: STORAGE_KEYS.scene },
  ),
);

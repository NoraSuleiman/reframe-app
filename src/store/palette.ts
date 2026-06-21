import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaletteItem } from '@/domain/types';
import { STORAGE_KEYS } from '@/lib/storage';

interface PaletteState {
  items: PaletteItem[];
  add: (materialId: string, quantity?: number) => void;
  setQuantity: (materialId: string, quantity: number) => void;
  remove: (materialId: string) => void;
  clear: () => void;
  has: (materialId: string) => boolean;
  count: () => number;
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (materialId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.materialId === materialId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.materialId === materialId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { materialId, quantity }] };
        }),
      setQuantity: (materialId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.materialId === materialId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (materialId) =>
        set((state) => ({ items: state.items.filter((i) => i.materialId !== materialId) })),
      clear: () => set({ items: [] }),
      has: (materialId) => get().items.some((i) => i.materialId === materialId),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: STORAGE_KEYS.palette },
  ),
);

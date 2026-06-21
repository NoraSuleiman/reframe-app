import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/storage';

export interface CartItem {
  materialId: string;
  quantity: number;
  unitPrice: number; // frozen at the time of adding to cart
}

interface CartState {
  items: CartItem[];
  addMany: (items: CartItem[]) => void;
  setQuantity: (materialId: string, quantity: number) => void;
  remove: (materialId: string) => void;
  clear: () => void;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addMany: (incoming) =>
        set((state) => {
          const map = new Map(state.items.map((i) => [i.materialId, i]));
          for (const item of incoming) {
            const existing = map.get(item.materialId);
            map.set(item.materialId, {
              materialId: item.materialId,
              unitPrice: item.unitPrice,
              quantity: (existing?.quantity ?? 0) + item.quantity,
            });
          }
          return { items: [...map.values()] };
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
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: STORAGE_KEYS.cart },
  ),
);

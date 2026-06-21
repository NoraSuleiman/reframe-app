import { useMemo } from 'react';
import { useMaterials } from './useMaterials';
import type { Material } from '@/domain/types';
import type { WeightedEntry } from '@/domain/crs';

export interface ResolvedEntry extends WeightedEntry {
  quantity: number;
  material: Material;
}

/**
 * Resolve a list of {materialId, quantity} against the catalogue, returning the
 * matched materials paired with their quantities (for CRS aggregation + totals).
 */
export function useEntries(items: { materialId: string; quantity: number }[]) {
  const { data: materials, isLoading } = useMaterials({ includeDrafts: true });

  const byId = useMemo(() => {
    const map = new Map<string, Material>();
    (materials ?? []).forEach((m) => map.set(m.id, m));
    return map;
  }, [materials]);

  const entries = useMemo<ResolvedEntry[]>(() => {
    return items
      .map((i) => {
        const material = byId.get(i.materialId);
        return material ? { material, quantity: i.quantity } : null;
      })
      .filter((e): e is ResolvedEntry => e !== null);
  }, [items, byId]);

  return { entries, byId, isLoading };
}

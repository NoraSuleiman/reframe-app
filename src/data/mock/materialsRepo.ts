import { scoreMaterial } from '@/domain/crs';
import type { Material } from '@/domain/types';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import { SEED_MATERIALS } from '@/data/seed/materials';
import type { MaterialQuery, MaterialsRepo } from '@/data/repository';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function load(): Material[] {
  const stored = readJSON<Material[] | null>(STORAGE_KEYS.materials, null);
  if (stored && stored.length) return stored;
  writeJSON(STORAGE_KEYS.materials, SEED_MATERIALS);
  return SEED_MATERIALS;
}

function save(materials: Material[]): void {
  writeJSON(STORAGE_KEYS.materials, materials);
}

function applyQuery(materials: Material[], q: MaterialQuery = {}): Material[] {
  let out = materials.slice();

  if (!q.includeDrafts) out = out.filter((m) => m.status === 'published');

  if (q.search) {
    const s = q.search.toLowerCase();
    out = out.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        m.description.toLowerCase().includes(s) ||
        m.sourceBuildings.some((b) => b.toLowerCase().includes(s)),
    );
  }
  if (q.families?.length) out = out.filter((m) => q.families!.includes(m.family));
  if (q.buildings?.length)
    out = out.filter((m) => m.sourceBuildings.some((b) => q.buildings!.includes(b)));
  if (q.maxPrice != null) out = out.filter((m) => m.price.min <= q.maxPrice!);

  if (q.pathways?.length || q.minCrs != null) {
    out = out.filter((m) => {
      const s = scoreMaterial(m);
      if (q.pathways?.length && !q.pathways.includes(s.pathway)) return false;
      if (q.minCrs != null && s.ecrsRatio < q.minCrs) return false;
      return true;
    });
  }

  switch (q.sort) {
    case 'carbon':
      out.sort((a, b) => midBand(b.carbonSavingPct) - midBand(a.carbonSavingPct));
      break;
    case 'price-asc':
      out.sort((a, b) => a.price.min - b.price.min);
      break;
    case 'price-desc':
      out.sort((a, b) => b.price.max - a.price.max);
      break;
    case 'name':
      out.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'crs':
    default:
      out.sort((a, b) => scoreMaterial(b).ecrsRatio - scoreMaterial(a).ecrsRatio);
  }
  return out;
}

function midBand(b: { min: number; max: number }): number {
  return (b.min + b.max) / 2;
}

export const mockMaterialsRepo: MaterialsRepo = {
  async list(query) {
    await delay();
    return applyQuery(load(), query);
  },
  async get(idOrSlug) {
    await delay(60);
    return load().find((m) => m.id === idOrSlug || m.slug === idOrSlug) ?? null;
  },
  async create(material) {
    await delay();
    const all = load();
    all.unshift(material);
    save(all);
    return material;
  },
  async update(id, patch) {
    await delay();
    const all = load();
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Material ${id} not found`);
    all[idx] = { ...all[idx], ...patch };
    save(all);
    return all[idx];
  },
  async remove(id) {
    await delay();
    save(load().filter((m) => m.id !== id));
  },
};

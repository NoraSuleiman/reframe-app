import type { Band, Material, Pathway } from './types';

/**
 * Capital Retention Score (CRS) — the conceptual heart of ReFrame.
 *
 *   CRS  = technical*0.4 + ecological*0.3 + economic*0.3   (sub-scores 0–5 → CRS 0–5)
 *   eCRS = CRS * (1 - E)                                    (E = entropy coefficient 0–1)
 *
 * Scores are displayed as a 0–100% retention figure.
 */

export const CRS_WEIGHTS = { technical: 0.4, ecological: 0.3, economic: 0.3 } as const;

/** Raw CRS on the 0–5 scale. */
export function crs(technical: number, ecological: number, economic: number): number {
  return (
    technical * CRS_WEIGHTS.technical +
    ecological * CRS_WEIGHTS.ecological +
    economic * CRS_WEIGHTS.economic
  );
}

/** Effective CRS (0–5) after applying the entropy coefficient E (0–1). */
export function ecrs(crsValue: number, entropy: number): number {
  return crsValue * (1 - clamp01(entropy));
}

/** Convenience: compute raw + effective CRS for a material, on both 0–5 and 0–1 scales. */
export function scoreMaterial(m: Material): {
  crs: number; // 0–5
  ecrs: number; // 0–5
  crsRatio: number; // 0–1
  ecrsRatio: number; // 0–1
  pathway: Pathway;
} {
  const raw = crs(m.technicalScore, m.ecologicalScore, m.economicScore);
  const eff = ecrs(raw, m.entropy);
  return {
    crs: raw,
    ecrs: eff,
    crsRatio: raw / 5,
    ecrsRatio: eff / 5,
    pathway: pathwayFromEcrs(eff / 5),
  };
}

/** Format a 0–1 ratio as a whole-percent string, e.g. 0.784 → "78%". */
export function toPct(ratio: number): number {
  return Math.round(clamp01(ratio) * 100);
}

/**
 * Reuse pathway classification from the eCRS ratio (0–1).
 *   Direct reuse        eCRS ≥ 0.75
 *   Refabrication        0.30 – 0.75
 *   ReHome / Recovery   < 0.30
 * (Recycle is assigned by data when a material is unfit for the above.)
 */
export function pathwayFromEcrs(ecrsRatio: number): Pathway {
  if (ecrsRatio >= 0.75) return 'direct';
  if (ecrsRatio >= 0.3) return 'refabrication';
  return 'rehome';
}

export const PATHWAY_LABELS: Record<Pathway, string> = {
  direct: 'Direct reuse',
  refabrication: 'Refabrication',
  rehome: 'ReHome / Recovery',
  recycle: 'Recycle',
};

/** Module area in m² implied by a material's unit dimensions. */
export function unitArea(m: Material): number {
  return m.unitDimensions.width * m.unitDimensions.height;
}

export interface WeightedEntry {
  material: Material;
  quantity: number;
}

export type WeightBy = 'area' | 'quantity';

/**
 * Aggregate (blended) eCRS ratio (0–1) across a set of materials.
 * - 'quantity'  weights each material by its quantity (palette / cart totals)
 * - 'area'      weights by quantity × unit area (façade builder readout)
 * Returns 0 for an empty set.
 */
export function aggregateCrs(entries: WeightedEntry[], weightBy: WeightBy = 'quantity'): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const { material, quantity } of entries) {
    const weight = weightBy === 'area' ? quantity * unitArea(material) : quantity;
    weightedSum += scoreMaterial(material).ecrsRatio * weight;
    totalWeight += weight;
  }
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

/** Quantity-weighted mean of a per-material band midpoint (e.g. carbon-saving %). */
export function weightedBandMidpoint(
  entries: WeightedEntry[],
  pick: (m: Material) => Band | undefined,
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const { material, quantity } of entries) {
    const band = pick(material);
    if (!band) continue;
    weightedSum += bandMid(band) * quantity;
    totalWeight += quantity;
  }
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

export function totalCarbonSavingPct(entries: WeightedEntry[]): number {
  return weightedBandMidpoint(entries, (m) => m.carbonSavingPct);
}

export function totalCostSavingPct(entries: WeightedEntry[]): number {
  return weightedBandMidpoint(entries, (m) => m.costSavingPct);
}

/** Midpoint of a min–max band. */
export function bandMid(band: Band): number {
  return (band.min + band.max) / 2;
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

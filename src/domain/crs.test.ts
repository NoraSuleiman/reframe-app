import { describe, expect, it } from 'vitest';
import {
  aggregateCrs,
  crs,
  ecrs,
  pathwayFromEcrs,
  scoreMaterial,
  toPct,
  totalCarbonSavingPct,
  unitArea,
} from './crs';
import type { Material } from './types';

function makeMaterial(over: Partial<Material> = {}): Material {
  return {
    id: 'm',
    slug: 'm',
    name: 'Test',
    family: 'panel',
    status: 'published',
    description: '',
    sourceBuildings: [],
    location: 'Sydney',
    unitSize: '1 × 1 m',
    unitDimensions: { width: 1, height: 1 },
    qtyAvailable: 10,
    stockUnit: 'panels',
    price: { min: 100, max: 200 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 80, max: 90 },
    technicalScore: 5,
    ecologicalScore: 5,
    economicScore: 5,
    entropy: 0,
    disassemblyTier: 'D1',
    criteria: {},
    images: [],
    ...over,
  };
}

describe('crs()', () => {
  it('applies the 0.4 / 0.3 / 0.3 weighting', () => {
    expect(crs(5, 5, 5)).toBe(5);
    expect(crs(4, 3, 3)).toBeCloseTo(3.4, 6);
    expect(crs(0, 0, 0)).toBe(0);
  });
});

describe('ecrs()', () => {
  it('reduces CRS by the entropy coefficient', () => {
    expect(ecrs(4, 0.25)).toBeCloseTo(3, 6);
    expect(ecrs(5, 0)).toBe(5);
    expect(ecrs(5, 1)).toBe(0);
  });
  it('clamps entropy to 0–1', () => {
    expect(ecrs(5, -1)).toBe(5);
    expect(ecrs(5, 2)).toBe(0);
  });
});

describe('toPct()', () => {
  it('rounds a 0–1 ratio to whole percent', () => {
    expect(toPct(0.784)).toBe(78);
    expect(toPct(0.89)).toBe(89);
    expect(toPct(1)).toBe(100);
  });
});

describe('pathwayFromEcrs()', () => {
  it('classifies by eCRS ratio thresholds', () => {
    expect(pathwayFromEcrs(0.89)).toBe('direct');
    expect(pathwayFromEcrs(0.75)).toBe('direct');
    expect(pathwayFromEcrs(0.5)).toBe('refabrication');
    expect(pathwayFromEcrs(0.3)).toBe('refabrication');
    expect(pathwayFromEcrs(0.2)).toBe('rehome');
  });
});

describe('scoreMaterial()', () => {
  it('reproduces a metal-cassette-like ~89% direct-reuse material', () => {
    // Strong scores, negligible entropy → high eCRS, direct reuse.
    const m = makeMaterial({
      technicalScore: 4.7,
      ecologicalScore: 4.5,
      economicScore: 4.4,
      entropy: 0.02,
    });
    const s = scoreMaterial(m);
    expect(toPct(s.ecrsRatio)).toBe(89);
    expect(s.pathway).toBe('direct');
  });

  it('reproduces a spandrel-like ~65% refabrication material', () => {
    const m = makeMaterial({
      technicalScore: 3.8,
      ecologicalScore: 3.6,
      economicScore: 3.6,
      entropy: 0.12,
    });
    const s = scoreMaterial(m);
    expect(toPct(s.ecrsRatio)).toBe(65);
    expect(s.pathway).toBe('refabrication');
  });
});

describe('aggregateCrs()', () => {
  const high = makeMaterial({ id: 'h', technicalScore: 5, ecologicalScore: 5, economicScore: 5 }); // eCRS 1.0
  const low = makeMaterial({
    id: 'l',
    technicalScore: 2,
    ecologicalScore: 2,
    economicScore: 2,
    unitDimensions: { width: 3, height: 3 }, // 9 m² each
  }); // eCRS 0.4

  it('quantity-weights by default', () => {
    // equal quantities → simple mean of 1.0 and 0.4 = 0.7
    expect(aggregateCrs([{ material: high, quantity: 1 }, { material: low, quantity: 1 }])).toBeCloseTo(
      0.7,
      6,
    );
  });

  it('area-weights when requested', () => {
    // high: 1m² × qty1 = weight 1; low: 9m² × qty1 = weight 9
    // (1*1.0 + 9*0.4) / 10 = 0.46
    expect(
      aggregateCrs([{ material: high, quantity: 1 }, { material: low, quantity: 1 }], 'area'),
    ).toBeCloseTo(0.46, 6);
  });

  it('returns 0 for an empty set', () => {
    expect(aggregateCrs([])).toBe(0);
  });
});

describe('unitArea() and carbon aggregation', () => {
  it('computes unit area', () => {
    expect(unitArea(makeMaterial({ unitDimensions: { width: 3, height: 1.2 } }))).toBeCloseTo(3.6, 6);
  });
  it('quantity-weights carbon-saving midpoints', () => {
    const a = makeMaterial({ id: 'a', carbonSavingPct: { min: 80, max: 90 } }); // mid 85
    const b = makeMaterial({ id: 'b', carbonSavingPct: { min: 60, max: 60 } }); // mid 60
    // (85*1 + 60*3) / 4 = 66.25
    expect(
      totalCarbonSavingPct([{ material: a, quantity: 1 }, { material: b, quantity: 3 }]),
    ).toBeCloseTo(66.25, 6);
  });
});

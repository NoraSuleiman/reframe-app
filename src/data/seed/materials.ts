import type { CriterionKey } from '@/domain/criteria';
import type { Material } from '@/domain/types';

// ---------------------------------------------------------------------------
// Seed catalogue — merged from `Material list.xlsx` (roster, quantities, unit
// sizes, storage, refabrication notes) and the Product Brief §11 (CRS sub-scores,
// pathway/tier, pricing and carbon bands). Sub-scores + entropy are tuned so the
// computed eCRS reads close to the brief's headline percentages. Imagery is left
// empty — the UI renders deterministic procedural swatches per family.
// ---------------------------------------------------------------------------

interface SeedInput {
  slug: string;
  name: string;
  family: Material['family'];
  description: string;
  sourceBuildings: string[];
  location?: string;
  unitSize: string;
  unitDimensions: { width: number; height: number };
  qtyAvailable: number;
  stockUnit: Material['stockUnit'];
  storageMethod?: string;
  machinery?: string;
  refabNotes?: string;
  price: { min: number; max: number };
  priceNew?: { min: number; max: number };
  priceUnit: Material['priceUnit'];
  carbonSavingPct: { min: number; max: number };
  costSavingPct?: { min: number; max: number };
  t: number; // technical sub-score 0–5
  e: number; // ecological sub-score 0–5
  ec: number; // economic sub-score 0–5
  entropy: number; // E, 0–1
  disassemblyTier: Material['disassemblyTier'];
  criteria: CriterionKey[]; // satisfied flags
  status?: Material['status'];
}

const DEPOT_LOCATION = 'Alexandria, Sydney';

function criteriaMap(keys: CriterionKey[]): Material['criteria'] {
  return Object.fromEntries(keys.map((k) => [k, true]));
}

function build(input: SeedInput): Material {
  return {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    family: input.family,
    status: input.status ?? 'published',
    description: input.description,
    sourceBuildings: input.sourceBuildings,
    location: input.location ?? DEPOT_LOCATION,
    unitSize: input.unitSize,
    unitDimensions: input.unitDimensions,
    qtyAvailable: input.qtyAvailable,
    stockUnit: input.stockUnit,
    storageMethod: input.storageMethod,
    machinery: input.machinery,
    refabNotes: input.refabNotes,
    price: input.price,
    priceNew: input.priceNew,
    priceUnit: input.priceUnit,
    carbonSavingPct: input.carbonSavingPct,
    costSavingPct: input.costSavingPct,
    technicalScore: input.t,
    ecologicalScore: input.e,
    economicScore: input.ec,
    entropy: input.entropy,
    disassemblyTier: input.disassemblyTier,
    criteria: criteriaMap(input.criteria),
    images: [],
  };
}

const SEED: SeedInput[] = [
  // ---------------- Primary panel systems ----------------
  {
    slug: 'pigmented-precast-concrete-panels',
    name: 'Pigmented Precast Concrete Panels',
    family: 'panel',
    description:
      'Through-coloured precast concrete cladding panels recovered from a primary façade. Robust, dimensionally stable and re-castable at the edges — well suited to adaptable reuse as cladding or solid infill.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)'],
    unitSize: '3.0 × 1.2 m',
    unitDimensions: { width: 3.0, height: 1.2 },
    qtyAvailable: 280,
    stockUnit: 'panels',
    storageMethod: 'Horizontal stacks (2 high)',
    machinery: 'Crane + forklift',
    refabNotes: 'Edge repair, recutting, cleaning',
    price: { min: 90, max: 180 },
    priceNew: { min: 220, max: 420 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 60, max: 80 },
    costSavingPct: { min: 40, max: 60 },
    t: 4.5, e: 4.3, ec: 4.4, entropy: 0.12, disassemblyTier: 'D2',
    criteria: ['STR', 'CON', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'AVA', 'TEC', 'VERS'],
  },
  {
    slug: 'terracotta-rainscreen-panels',
    name: 'Terracotta Rainscreen Panels',
    family: 'panel',
    description:
      'Clip-hung terracotta rainscreen panels — a high-value, low-carbon façade material. Directly re-hangable as rainscreen modules with minimal processing; among the strongest carbon-saving cases in the catalogue.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)', 'Aurora Place'],
    unitSize: '2.0 × 1.0 m',
    unitDimensions: { width: 2.0, height: 1.0 },
    qtyAvailable: 320,
    stockUnit: 'panels',
    storageMethod: 'Vertical stillages (5/pallet)',
    machinery: 'Forklift',
    refabNotes: 'Reuse as rainscreen modules',
    price: { min: 100, max: 260 },
    priceNew: { min: 240, max: 490 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 80, max: 90 },
    costSavingPct: { min: 45, max: 70 },
    t: 4.6, e: 4.4, ec: 4.3, entropy: 0.12, disassemblyTier: 'D2',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'AVA', 'TEC', 'VERS', 'TRA'],
  },
  {
    slug: 'honed-basalt-stone-panels',
    name: 'Honed Basalt Stone Panels',
    family: 'panel',
    description:
      'Honed basalt stone cladding panels. Durable natural stone that recuts and re-polishes cleanly for adaptable reuse across cladding and interior applications.',
    sourceBuildings: ['Aurora Place'],
    unitSize: '1.2 × 0.6 m',
    unitDimensions: { width: 1.2, height: 0.6 },
    qtyAvailable: 80,
    stockUnit: 'panels',
    storageMethod: 'Heavy pallets (2 high)',
    machinery: 'Crane + forklift',
    refabNotes: 'Cutting, polishing',
    price: { min: 120, max: 280 },
    priceNew: { min: 260, max: 520 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 70, max: 85 },
    costSavingPct: { min: 40, max: 65 },
    t: 4.5, e: 4.4, ec: 4.3, entropy: 0.12, disassemblyTier: 'D2',
    criteria: ['STR', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'EMB', 'PUR', 'AVA', 'TEC', 'VERS', 'TRA'],
  },
  {
    slug: 'polished-granite-panels',
    name: 'Polished Granite Panels',
    family: 'panel',
    description:
      'Polished granite cladding panels. High durability and visual value; re-polishing restores them to near-new finish for adaptable reuse.',
    sourceBuildings: ['Aurora Place', '8 Chifley Square'],
    unitSize: '1.0 × 1.0 m',
    unitDimensions: { width: 1.0, height: 1.0 },
    qtyAvailable: 60,
    stockUnit: 'panels',
    storageMethod: 'Pallets (2 high)',
    machinery: 'Forklift',
    refabNotes: 'Re-polishing',
    price: { min: 130, max: 300 },
    priceNew: { min: 280, max: 560 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 65, max: 82 },
    costSavingPct: { min: 40, max: 60 },
    t: 4.2, e: 4.0, ec: 4.0, entropy: 0.12, disassemblyTier: 'D2',
    criteria: ['STR', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'PUR', 'AVA', 'TEC', 'TRA'],
  },
  {
    slug: 'metal-cassette-panels-acp',
    name: 'Metal Cassette Panels (ACP)',
    family: 'panel',
    description:
      'Aluminium composite cassette panels with a folded-cassette edge detail. Lightweight, dimensionally precise and directly re-fixable — the highest-scoring panel system for direct reuse.',
    sourceBuildings: ['Foveaux Street'],
    unitSize: '1.5 × 1.0 m',
    unitDimensions: { width: 1.5, height: 1.0 },
    qtyAvailable: 150,
    stockUnit: 'panels',
    storageMethod: 'Vertical racks',
    machinery: 'Forklift',
    refabNotes: 'Re-coating, re-cutting',
    price: { min: 70, max: 160 },
    priceNew: { min: 160, max: 320 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 70, max: 85 },
    costSavingPct: { min: 45, max: 65 },
    t: 4.8, e: 4.6, ec: 4.6, entropy: 0.05, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC', 'VERS', 'TRA', 'LAB'],
  },
  {
    slug: 'fibre-cement-backing-boards',
    name: 'Fibre Cement Backing Boards',
    family: 'panel',
    description:
      'Fibre cement backing/sheathing boards recovered from behind rainscreen systems. Limited but useful reuse as backing, substrate or low-spec lining.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)'],
    unitSize: '2.4 × 1.2 m',
    unitDimensions: { width: 2.4, height: 1.2 },
    qtyAvailable: 200,
    stockUnit: 'sheets',
    storageMethod: 'Flat stacked pallets',
    machinery: 'Forklift',
    refabNotes: 'Limited reuse',
    price: { min: 18, max: 38 },
    priceNew: { min: 45, max: 80 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 50, max: 65 },
    costSavingPct: { min: 35, max: 55 },
    t: 3.9, e: 3.7, ec: 3.8, entropy: 0.05, disassemblyTier: 'D1',
    criteria: ['MOD', 'SID', 'REU', 'EMB', 'LOC', 'AVA', 'TEC', 'LAB'],
  },

  // ---------------- Glazing systems ----------------
  {
    slug: 'igu-curtain-wall-units',
    name: 'IGU Curtain Wall Units',
    family: 'glazing',
    description:
      'Double-glazed insulated glass units from a unitised curtain wall. After testing and re-sealing, a strong refabrication candidate — the entropy coefficient reflects value lost in handling and seal failure across the batch.',
    sourceBuildings: ['8 Chifley Square', 'Foveaux Street', 'UTS Building 6 (Peter Johnson Building)'],
    unitSize: '2.0 × 1.0 m',
    unitDimensions: { width: 2.0, height: 1.0 },
    qtyAvailable: 500,
    stockUnit: 'panels',
    storageMethod: 'A-frames (5/rack)',
    machinery: 'Forklift (glass rig)',
    refabNotes: 'Testing + reuse',
    price: { min: 80, max: 260 },
    priceNew: { min: 170, max: 410 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 75, max: 90 },
    costSavingPct: { min: 40, max: 65 },
    t: 4.4, e: 4.3, ec: 4.0, entropy: 0.18, disassemblyTier: 'D2',
    criteria: ['STR', 'MOD', 'CON', 'VIS', 'SID', 'REU', 'EMB', 'LOC', 'AVA', 'TEC', 'VERS'],
  },
  {
    slug: 'spandrel-glazing-panels',
    name: 'Spandrel Glazing Panels',
    family: 'glazing',
    description:
      'Back-painted / fritted spandrel IGUs forming the opaque bands of a curtain wall. Recoatable and re-usable as spandrel infill.',
    sourceBuildings: ['8 Chifley Square'],
    unitSize: '2.0 × 1.0 m',
    unitDimensions: { width: 2.0, height: 1.0 },
    qtyAvailable: 120,
    stockUnit: 'panels',
    storageMethod: 'A-frames (5/rack)',
    machinery: 'Forklift (glass rig)',
    refabNotes: 'Recoating',
    price: { min: 60, max: 180 },
    priceNew: { min: 150, max: 320 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 65, max: 85 },
    costSavingPct: { min: 40, max: 60 },
    t: 3.8, e: 3.6, ec: 3.6, entropy: 0.12, disassemblyTier: 'D2',
    criteria: ['MOD', 'CON', 'SID', 'REU', 'EMB', 'LOC', 'AVA', 'TEC'],
  },
  {
    slug: 'metal-insulated-spandrel-panels',
    name: 'Metal Insulated Spandrel Panels',
    family: 'glazing',
    description:
      'Opaque insulated metal infill modules from the curtain wall. Directly re-usable with minimal processing — a clean direct-reuse case.',
    sourceBuildings: ['Foveaux Street'],
    unitSize: '2.0 × 1.0 m',
    unitDimensions: { width: 2.0, height: 1.0 },
    qtyAvailable: 100,
    stockUnit: 'panels',
    storageMethod: 'Flat pallets',
    machinery: 'Forklift',
    refabNotes: 'Direct reuse',
    price: { min: 70, max: 170 },
    priceNew: { min: 160, max: 330 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 70, max: 88 },
    costSavingPct: { min: 45, max: 65 },
    t: 4.6, e: 4.4, ec: 4.4, entropy: 0.05, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'AVA', 'TEC', 'VERS', 'LAB'],
  },
  {
    slug: 'glass-fin-structural-panels',
    name: 'Glass Fin Panels (Structural)',
    family: 'glazing',
    description:
      'Point-fixed structural glass fins from a high-value glazed entrance. Specialist handling required, but very high retained value for direct architectural reuse.',
    sourceBuildings: ['8 Chifley Square'],
    unitSize: '3.0 × 0.5 m',
    unitDimensions: { width: 0.5, height: 3.0 },
    qtyAvailable: 40,
    stockUnit: 'panels',
    storageMethod: 'Protected vertical racks',
    machinery: 'Manual + forklift',
    refabNotes: 'Specialist handling — high-value reuse',
    price: { min: 180, max: 420 },
    priceNew: { min: 360, max: 760 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 70, max: 88 },
    costSavingPct: { min: 40, max: 60 },
    t: 4.7, e: 4.2, ec: 4.3, entropy: 0.1, disassemblyTier: 'D2',
    criteria: ['STR', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'PUR', 'AVA', 'TRA'],
  },

  // ---------------- Substructure (high-value zone) ----------------
  {
    slug: 'aluminium-mullions',
    name: 'Aluminium Mullions',
    family: 'substructure',
    description:
      'Vertical primary curtain-wall extrusions. Aluminium framing carries the highest retained value in the catalogue — cut-and-reuse with up to 85–95% lower carbon than new extrusion.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)', 'Foveaux Street', 'Aurora Place'],
    unitSize: '6–8 m lengths',
    unitDimensions: { width: 0.12, height: 6.0 },
    qtyAvailable: 700,
    stockUnit: 'm',
    storageMethod: 'Long-span racks',
    machinery: 'Forklift',
    refabNotes: 'Cut + reuse',
    price: { min: 18, max: 40 },
    priceNew: { min: 24, max: 52 },
    priceUnit: 'm',
    carbonSavingPct: { min: 85, max: 95 },
    costSavingPct: { min: 20, max: 40 },
    t: 4.7, e: 4.7, ec: 4.5, entropy: 0.05, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC', 'VERS', 'TRA', 'LAB'],
  },
  {
    slug: 'aluminium-transoms',
    name: 'Aluminium Transoms',
    family: 'substructure',
    description:
      'Horizontal primary curtain-wall members. Bundle-stored and re-assembled into new framing grids; high recyclability backstop and strong direct-reuse value.',
    sourceBuildings: ['Foveaux Street', 'Aurora Place'],
    unitSize: '2–3 m lengths',
    unitDimensions: { width: 0.1, height: 2.5 },
    qtyAvailable: 500,
    stockUnit: 'm',
    storageMethod: 'Bundled racks',
    machinery: 'Forklift',
    refabNotes: 'Reassembly',
    price: { min: 14, max: 32 },
    priceNew: { min: 20, max: 44 },
    priceUnit: 'm',
    carbonSavingPct: { min: 82, max: 93 },
    costSavingPct: { min: 20, max: 40 },
    t: 4.2, e: 4.1, ec: 3.9, entropy: 0.07, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC', 'LAB'],
  },
  {
    slug: 'curtain-wall-perimeter-frames',
    name: 'Curtain Wall Perimeter Frames',
    family: 'substructure',
    description:
      'Head / jamb / sill perimeter extrusions framing the curtain-wall edge. Mixed lengths, rack-stored and reusable as edge framing.',
    sourceBuildings: ['Foveaux Street'],
    unitSize: 'Mixed lengths',
    unitDimensions: { width: 0.12, height: 3.0 },
    qtyAvailable: 200,
    stockUnit: 'm',
    storageMethod: 'Rack storage',
    machinery: 'Forklift',
    refabNotes: 'Reuse',
    price: { min: 14, max: 34 },
    priceNew: { min: 22, max: 46 },
    priceUnit: 'm',
    carbonSavingPct: { min: 80, max: 92 },
    costSavingPct: { min: 20, max: 38 },
    t: 4.3, e: 4.3, ec: 4.1, entropy: 0.08, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC'],
  },
  {
    slug: 'stainless-steel-brackets-anchors',
    name: 'Stainless Steel Brackets / Anchors',
    family: 'substructure',
    description:
      'Adjustable stainless brackets and anchors from the cladding support system. Bin-stored, cleaned and reused as fixings — durable and broadly versatile.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)', 'Foveaux Street'],
    unitSize: 'Small components',
    unitDimensions: { width: 0.15, height: 0.15 },
    qtyAvailable: 1200,
    stockUnit: 'units',
    storageMethod: 'Pallet bins',
    machinery: 'Manual',
    refabNotes: 'Cleaning + reuse',
    price: { min: 4, max: 12 },
    priceNew: { min: 9, max: 22 },
    priceUnit: 'unit',
    carbonSavingPct: { min: 70, max: 85 },
    costSavingPct: { min: 40, max: 60 },
    t: 3.6, e: 3.4, ec: 3.4, entropy: 0.08, disassemblyTier: 'D1',
    criteria: ['STR', 'DIS', 'CON', 'REU', 'LIF', 'EMB', 'ENG', 'AVA', 'VERS', 'LAB'],
  },

  // ---------------- Shading & secondary systems ----------------
  {
    slug: 'aluminium-brise-soleil-fins',
    name: 'Aluminium Brise Soleil Fins',
    family: 'shading',
    description:
      'Horizontal and vertical aluminium sun-shading fins. Lightweight, modular and directly re-fixable to new façades as shading or screening.',
    sourceBuildings: ['Foveaux Street'],
    unitSize: '2.0–4.0 m fins',
    unitDimensions: { width: 0.3, height: 3.0 },
    qtyAvailable: 240,
    stockUnit: 'units',
    storageMethod: 'Long-span racks',
    machinery: 'Forklift',
    refabNotes: 'Cut + reuse',
    price: { min: 30, max: 70 },
    priceNew: { min: 70, max: 150 },
    priceUnit: 'unit',
    carbonSavingPct: { min: 80, max: 92 },
    costSavingPct: { min: 40, max: 60 },
    t: 4.5, e: 4.5, ec: 4.3, entropy: 0.05, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'VIS', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC', 'VERS'],
  },
  {
    slug: 'aluminium-louvres',
    name: 'Aluminium Louvres (Fixed + Adjustable)',
    family: 'shading',
    description:
      'Fixed and adjustable aluminium louvre blades from ventilation and shading zones. Modular and re-mountable as louvre banks or screening.',
    sourceBuildings: ['UTS Building 6 (Peter Johnson Building)'],
    unitSize: '1.5–2.0 m blades',
    unitDimensions: { width: 0.2, height: 1.8 },
    qtyAvailable: 180,
    stockUnit: 'units',
    storageMethod: 'Racks',
    machinery: 'Manual + forklift',
    refabNotes: 'Cleaning + reuse',
    price: { min: 24, max: 58 },
    priceNew: { min: 60, max: 130 },
    priceUnit: 'unit',
    carbonSavingPct: { min: 78, max: 90 },
    costSavingPct: { min: 40, max: 60 },
    t: 4.2, e: 4.3, ec: 4.1, entropy: 0.06, disassemblyTier: 'D1',
    criteria: ['STR', 'MOD', 'DIS', 'CON', 'SID', 'REU', 'LIF', 'EMB', 'LOC', 'PUR', 'ENG', 'AVA', 'TEC'],
  },
  {
    slug: 'perforated-metal-screening-panels',
    name: 'Perforated Metal Screening Panels',
    family: 'shading',
    description:
      'Perforated metal screening panels used for solar control and visual screening. Re-cuttable and re-coatable for adaptable reuse as screens or balustrade infill.',
    sourceBuildings: ['Aurora Place'],
    unitSize: '1.5 × 1.0 m',
    unitDimensions: { width: 1.5, height: 1.0 },
    qtyAvailable: 90,
    stockUnit: 'panels',
    storageMethod: 'Vertical racks',
    machinery: 'Forklift',
    refabNotes: 'Re-coating, re-cutting',
    price: { min: 40, max: 95 },
    priceNew: { min: 95, max: 190 },
    priceUnit: 'm2',
    carbonSavingPct: { min: 70, max: 86 },
    costSavingPct: { min: 40, max: 58 },
    t: 4.0, e: 4.0, ec: 4.0, entropy: 0.1, disassemblyTier: 'D2',
    criteria: ['MOD', 'DIS', 'CON', 'VIS', 'SID', 'REU', 'EMB', 'ENG', 'AVA', 'TEC', 'VERS'],
  },
];

export const SEED_MATERIALS: Material[] = SEED.map(build);

import type { CriterionKey } from './criteria';

export type MaterialFamily = 'panel' | 'glazing' | 'substructure' | 'shading';

export type Pathway = 'direct' | 'refabrication' | 'rehome' | 'recycle';

export type DisassemblyTier = 'D1' | 'D2' | 'D3';

export type MaterialStatus = 'draft' | 'published';

export type PriceUnit = 'm2' | 'kg' | 'unit' | 'm';

export type StockUnit = 'panels' | 'sheets' | 'units' | 'm';

/** A min–max band, used for price / carbon / cost-saving figures. */
export interface Band {
  min: number;
  max: number;
}

export interface Material {
  id: string;
  slug: string;
  name: string;
  family: MaterialFamily;
  status: MaterialStatus;
  description: string;

  // Provenance
  sourceBuildings: string[];
  location: string;
  originNotes?: string;

  // Specs
  unitSize: string; // human label, e.g. "3.0 × 1.2 m"
  unitDimensions: { width: number; height: number }; // metres, for the 3D module
  qtyAvailable: number;
  stockUnit: StockUnit;
  storageMethod?: string;
  machinery?: string;
  refabNotes?: string;

  // Commercial
  price: Band; // reclaimed price band
  priceNew?: Band; // baseline "new (imported)" band
  priceUnit: PriceUnit;

  // Impact
  carbonSavingPct: Band; // % lower carbon vs new
  costSavingPct?: Band; // % lower cost vs new

  // CRS inputs (sub-scores 0–5)
  technicalScore: number;
  ecologicalScore: number;
  economicScore: number;
  entropy: number; // E, 0–1
  disassemblyTier: DisassemblyTier;
  criteria: Partial<Record<CriterionKey, boolean>>;

  // Media (placeholder swatch tokens for now; Storage paths later)
  images: string[];
}

export interface PaletteItem {
  materialId: string;
  quantity: number;
}

export interface SceneModule {
  id: string;
  materialId: string;
  position: [number, number, number]; // x, y, z (metres)
  size: { width: number; height: number; depth: number };
  rotationY: number; // radians, 90° increments
}

export interface SceneSettings {
  gridSize: number; // cell size in metres
  snap: boolean;
  showGrid: boolean;
  facade: { width: number; height: number };
  lighting: 'studio' | 'daylight' | 'dusk';
}

export interface Scene {
  modules: SceneModule[];
  settings: SceneSettings;
}

export interface QuoteLineItem {
  materialId: string;
  name: string;
  quantity: number;
  unitPrice: number; // frozen at quote time (midpoint of band)
  priceUnit: PriceUnit;
  lineTotal: number;
}

export interface QuoteContact {
  name: string;
  email: string;
  organisation?: string;
  message?: string;
}

export interface Quote {
  id: string;
  reference: string;
  userId: string | null;
  contact: QuoteContact;
  lineItems: QuoteLineItem[];
  subtotal: number;
  total: number;
  aggregateCrs: number; // 0–1
  totalCarbonSavingPct: number;
  status: 'submitted' | 'reviewed';
  createdAt: string;
}

export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

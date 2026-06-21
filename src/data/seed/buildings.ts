// Real Sydney source buildings referenced by the thesis. Used for the
// provenance filter and material detail pages.
export const SOURCE_BUILDINGS = [
  'UTS Building 6 (Peter Johnson Building)',
  'Aurora Place',
  '8 Chifley Square',
  'Foveaux Street',
] as const;

export type SourceBuilding = (typeof SOURCE_BUILDINGS)[number];

// The Alexandria Canal Hub depot where material is received, assessed and stored.
export const DEPOT = '67c Bourke Rd, Alexandria (Alexandria Canal Hub)';

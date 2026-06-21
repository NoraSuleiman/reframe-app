import type { MaterialFamily } from '@/domain/types';

// Deterministic per-material colour derived from the family base hue + a hash of
// the slug, so each material reads as a distinct material sample while staying
// within its family's palette. Used by the <Swatch> placeholder imagery.

const FAMILY_HSL: Record<MaterialFamily, { h: number; s: number; l: number }> = {
  panel: { h: 24, s: 34, l: 58 }, // terracotta / earthen
  glazing: { h: 184, s: 16, l: 60 }, // cool glass teal-grey
  substructure: { h: 210, s: 6, l: 62 }, // aluminium grey
  shading: { h: 38, s: 26, l: 60 }, // bronze / anodised
};

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface SwatchColors {
  base: string;
  shade: string;
  light: string;
  line: string;
}

export function swatchColors(family: MaterialFamily, seed: string): SwatchColors {
  const { h, s, l } = FAMILY_HSL[family];
  const hash = hashString(seed);
  const hShift = (hash % 24) - 12;
  const lShift = ((hash >> 5) % 14) - 7;
  const hue = h + hShift;
  const lit = Math.max(38, Math.min(72, l + lShift));
  return {
    base: `hsl(${hue} ${s}% ${lit}%)`,
    shade: `hsl(${hue} ${s}% ${Math.max(26, lit - 16)}%)`,
    light: `hsl(${hue} ${s}% ${Math.min(86, lit + 14)}%)`,
    line: `hsl(${hue} ${s}% ${Math.max(22, lit - 26)}% / 0.5)`,
  };
}

/** A representative hex for the family — used by the 3D module material colour. */
export function familyHex(family: MaterialFamily, seed: string): string {
  // Render the HSL base to hex via a small canvas-free conversion.
  const { h, s, l } = FAMILY_HSL[family];
  const hash = hashString(seed);
  const hue = (h + ((hash % 24) - 12) + 360) % 360;
  const lit = Math.max(38, Math.min(72, l + (((hash >> 5) % 14) - 7)));
  return hslToHex(hue, s, lit);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

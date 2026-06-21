import type { Band, PriceUnit } from '@/domain/types';

const aud = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const audPrecise = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

export function currency(value: number): string {
  return value >= 100 ? aud.format(value) : audPrecise.format(value);
}

export const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  m2: '/m²',
  kg: '/kg',
  unit: '/unit',
  m: '/m',
};

export function priceBand(band: Band, unit: PriceUnit): string {
  return `${currency(band.min)}–${currency(band.max)} ${PRICE_UNIT_LABEL[unit]}`;
}

export function bandLabel(band: Band, suffix = ''): string {
  if (band.min === band.max) return `${band.min}${suffix}`;
  return `${band.min}–${band.max}${suffix}`;
}

export function number(value: number): string {
  return new Intl.NumberFormat('en-AU').format(value);
}

/** Round a 0–100 percentage value to a "NN%" label. */
export function toPctLabel(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

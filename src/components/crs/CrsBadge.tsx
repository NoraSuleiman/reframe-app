import { toPct } from '@/domain/crs';
import { cn } from '@/lib/cn';

/** Colour ramp for a 0–1 retention ratio: clay (low) → bronze → moss (high). */
export function crsColor(ratio: number): string {
  if (ratio >= 0.8) return '#586343'; // moss
  if (ratio >= 0.65) return '#7d7a3f'; // olive
  if (ratio >= 0.5) return '#9a7b3e'; // bronze
  if (ratio >= 0.35) return '#9c5b3b'; // clay
  return '#9e4a3c'; // muted red
}

interface CrsBadgeProps {
  /** Effective CRS ratio, 0–1. */
  ratio: number;
  size?: number;
  className?: string;
  label?: string;
}

/** Circular eCRS score ring used on cards and detail pages. */
export function CrsBadge({ ratio, size = 52, className, label = 'eCRS' }: CrsBadgeProps) {
  const pct = toPct(ratio);
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = crsColor(ratio);
  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label} ${pct} percent retained value`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2DCD0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ratio)}
        />
      </svg>
      <span className="absolute flex flex-col items-center leading-none">
        <span className="font-display text-[0.95rem] font-semibold text-ink">{pct}</span>
        <span className="font-mono text-[0.5rem] uppercase tracking-label text-stone">{label}</span>
      </span>
    </div>
  );
}

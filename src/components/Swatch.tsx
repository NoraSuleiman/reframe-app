import { useId } from 'react';
import type { MaterialFamily } from '@/domain/types';
import { hashString, swatchColors } from '@/lib/swatch';
import { cn } from '@/lib/cn';

interface SwatchProps {
  family: MaterialFamily;
  seed: string;
  className?: string;
  /** Number of tile columns for panel motif; auto-scales for others. */
  detail?: number;
}

/**
 * Procedural material-sample placeholder. Each family gets a distinct motif:
 * panels → tiled grid, glazing → reflective bands, substructure → extrusions,
 * shading → louvre slats. Deterministic per `seed`. Replaced by real photography
 * once supplied (Material.images).
 */
export function Swatch({ family, seed, className, detail = 4 }: SwatchProps) {
  const id = useId().replace(/:/g, '');
  const c = swatchColors(family, seed);
  const hash = hashString(seed);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`${family} material sample`}
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.shade} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${id})`} />
      {family === 'panel' && <PanelMotif c={c} cols={detail} hash={hash} />}
      {family === 'glazing' && <GlazingMotif c={c} />}
      {family === 'substructure' && <SubstructureMotif c={c} />}
      {family === 'shading' && <ShadingMotif c={c} hash={hash} />}
      <rect width="100" height="100" fill="none" stroke={c.shade} strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function PanelMotif({ c, cols, hash }: { c: ReturnType<typeof swatchColors>; cols: number; hash: number }) {
  const rows = Math.max(2, cols - 1);
  const cw = 100 / cols;
  const rh = 100 / rows;
  const lines = [];
  for (let i = 1; i < cols; i++)
    lines.push(<line key={`v${i}`} x1={i * cw} y1="0" x2={i * cw} y2="100" stroke={c.line} strokeWidth="0.8" />);
  for (let j = 1; j < rows; j++)
    lines.push(<line key={`h${j}`} x1="0" y1={j * rh} x2="100" y2={j * rh} stroke={c.line} strokeWidth="0.8" />);
  // subtle tonal variation per tile
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let col = 0; col < cols; col++) {
      const v = ((hash >> ((r * cols + col) % 24)) & 1) === 1;
      if (v)
        tiles.push(
          <rect key={`t${r}-${col}`} x={col * cw} y={r * rh} width={cw} height={rh} fill={c.shade} opacity="0.12" />,
        );
    }
  return (
    <g>
      {tiles}
      {lines}
    </g>
  );
}

function GlazingMotif({ c }: { c: ReturnType<typeof swatchColors> }) {
  return (
    <g>
      <polygon points="0,0 38,0 12,100 0,100" fill={c.light} opacity="0.35" />
      <polygon points="58,0 74,0 48,100 32,100" fill={c.light} opacity="0.25" />
      <line x1="0" y1="50" x2="100" y2="50" stroke={c.line} strokeWidth="1" />
      <line x1="50" y1="0" x2="50" y2="100" stroke={c.line} strokeWidth="1" />
    </g>
  );
}

function SubstructureMotif({ c }: { c: ReturnType<typeof swatchColors> }) {
  const bars = [20, 40, 60, 80];
  return (
    <g>
      {bars.map((x) => (
        <g key={x}>
          <rect x={x - 5} y="0" width="10" height="100" fill={c.shade} opacity="0.22" />
          <line x1={x} y1="0" x2={x} y2="100" stroke={c.light} strokeWidth="1.4" opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

function ShadingMotif({ c, hash }: { c: ReturnType<typeof swatchColors>; hash: number }) {
  const horizontal = (hash & 1) === 0;
  const slats = [12, 28, 44, 60, 76, 92];
  return (
    <g>
      {slats.map((p) =>
        horizontal ? (
          <rect key={p} x="0" y={p - 4} width="100" height="6" fill={c.shade} opacity="0.3" />
        ) : (
          <rect key={p} x={p - 4} y="0" width="6" height="100" fill={c.shade} opacity="0.3" />
        ),
      )}
    </g>
  );
}

import { scoreMaterial, toPct } from '@/domain/crs';
import { CRITERIA, criteriaByCapital, type Capital } from '@/domain/criteria';
import type { Material } from '@/domain/types';
import { crsColor } from './CrsBadge';
import { cn } from '@/lib/cn';

const CAPITAL_META: { key: Capital; label: string; weight: string }[] = [
  { key: 'technical', label: 'Technical', weight: '×0.4' },
  { key: 'ecological', label: 'Ecological', weight: '×0.3' },
  { key: 'economic', label: 'Economic', weight: '×0.3' },
];

function capitalScore(m: Material, capital: Capital): number {
  if (capital === 'technical') return m.technicalScore;
  if (capital === 'ecological') return m.ecologicalScore;
  return m.economicScore;
}

export function CrsBreakdown({ material }: { material: Material }) {
  const s = scoreMaterial(material);
  return (
    <div className="space-y-6">
      {/* Headline figures */}
      <div className="grid grid-cols-3 gap-4">
        <Figure label="CRS" value={`${toPct(s.crsRatio)}%`} sub="raw retained value" />
        <Figure
          label="Entropy E"
          value={material.entropy.toFixed(2)}
          sub="value lost in disassembly"
        />
        <Figure
          label="eCRS"
          value={`${toPct(s.ecrsRatio)}%`}
          sub="effective retained value"
          accent={crsColor(s.ecrsRatio)}
        />
      </div>

      {/* Three capitals */}
      <div className="space-y-3">
        {CAPITAL_META.map(({ key, label, weight }) => {
          const score = capitalScore(material, key);
          return (
            <div key={key}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-body-sm font-medium text-graphite">
                  {label} <span className="font-mono text-caption text-stone">{weight}</span>
                </span>
                <span className="font-mono text-caption text-stone">{score.toFixed(1)} / 5</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-graphite"
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Satisfied criteria */}
      <div>
        <p className="eyebrow mb-3">Assessment criteria satisfied</p>
        <div className="space-y-3">
          {CAPITAL_META.map(({ key, label }) => (
            <div key={key}>
              <p className="mb-1.5 text-caption font-medium text-stone">{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {criteriaByCapital(key).map((ck) => {
                  const on = material.criteria[ck] === true;
                  return (
                    <span
                      key={ck}
                      title={CRITERIA[ck].label}
                      className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-label',
                        on ? 'bg-moss-tint text-moss' : 'bg-sand text-mute line-through',
                      )}
                    >
                      {ck}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface p-3">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-h4 leading-none" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-[0.7rem] leading-tight text-stone">{sub}</p>
    </div>
  );
}

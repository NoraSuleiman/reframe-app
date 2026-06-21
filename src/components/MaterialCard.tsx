import { Link } from 'react-router-dom';
import { scoreMaterial } from '@/domain/crs';
import type { Material } from '@/domain/types';
import { Swatch } from './Swatch';
import { CrsBadge } from './crs/CrsBadge';
import { FamilyTag, PathwayTag } from './crs/tags';
import { priceBand } from '@/lib/format';

export function MaterialCard({ material }: { material: Material }) {
  const s = scoreMaterial(material);
  return (
    <Link
      to={`/material/${material.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-hairline bg-surface-raised transition-shadow hover:shadow-card focus-visible:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          {material.images.length > 0 ? (
            <img src={material.images[0]} alt={material.name} className="h-full w-full object-cover" />
          ) : (
            <Swatch family={material.family} seed={material.slug} />
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-surface-raised/90 p-1 shadow-card backdrop-blur">
          <CrsBadge ratio={s.ecrsRatio} size={46} />
        </div>
        {material.status === 'draft' && (
          <span className="absolute left-3 top-3 rounded bg-ink/80 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-label text-paper">
            Draft
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <FamilyTag family={material.family} />
          <PathwayTag pathway={s.pathway} />
        </div>
        <h3 className="font-display text-subtitle font-medium leading-snug text-ink">
          {material.name}
        </h3>
        <p className="mt-1 text-caption text-stone">{material.location}</p>
        <div className="mt-3 flex items-end justify-between border-t border-hairline-soft pt-3">
          <span className="text-body-sm font-medium text-graphite">
            {priceBand(material.price, material.priceUnit)}
          </span>
          <span className="font-mono text-caption text-moss">
            ↓{material.carbonSavingPct.min}–{material.carbonSavingPct.max}% CO₂
          </span>
        </div>
      </div>
    </Link>
  );
}

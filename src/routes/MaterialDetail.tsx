import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMaterial } from '@/hooks/useMaterials';
import { scoreMaterial, bandMid } from '@/domain/crs';
import { Swatch } from '@/components/Swatch';
import { CrsBreakdown } from '@/components/crs/CrsBreakdown';
import { FamilyTag, PathwayTag } from '@/components/crs/tags';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingBlock, EmptyState } from '@/components/ui/States';
import { usePaletteStore } from '@/store/palette';
import { bandLabel, currency, number, priceBand, PRICE_UNIT_LABEL } from '@/lib/format';

export default function MaterialDetail() {
  const { slug } = useParams();
  const { data: material, isLoading, isError } = useMaterial(slug);
  const add = usePaletteStore((s) => s.add);
  const inPalette = usePaletteStore((s) => (material ? s.has(material.id) : false));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => setAdded(false), [slug]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !material)
    return (
      <div className="container-content py-section">
        <EmptyState
          title="Material not found"
          description="It may have been unpublished or the link is out of date."
          action={
            <Link to="/marketplace" className="text-clay underline">
              Back to marketplace
            </Link>
          }
        />
      </div>
    );

  const s = scoreMaterial(material);
  const unitLabel = PRICE_UNIT_LABEL[material.priceUnit];
  const qtyOptions = Array.from({ length: Math.min(20, material.qtyAvailable) }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  function onAdd() {
    add(material!.id, qty);
    setAdded(true);
  }

  return (
    <div className="container-content py-10">
      <nav className="mb-6 text-caption text-stone">
        <Link to="/marketplace" className="hover:text-ink">
          Marketplace
        </Link>{' '}
        / <span className="text-graphite">{material.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Imagery + provenance */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-hairline bg-sand">
            {material.images.length > 0 ? (
              <img src={material.images[0]} alt={material.name} className="h-full w-full object-cover" />
            ) : (
              <Swatch family={material.family} seed={material.slug} detail={6} />
            )}
          </div>

          {/* Provenance */}
          <div className="mt-6 rounded-lg border border-hairline bg-surface p-5">
            <p className="eyebrow mb-3">Provenance</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Source building(s)" value={material.sourceBuildings.join(', ') || '—'} />
              <Detail label="Held at" value={material.location} />
            </dl>
          </div>

          {/* Specifications */}
          <div className="mt-4 rounded-lg border border-hairline bg-surface p-5">
            <p className="eyebrow mb-3">Specifications</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Unit size" value={material.unitSize} />
              <Detail
                label="Available"
                value={`${number(material.qtyAvailable)} ${material.stockUnit}`}
              />
              <Detail label="Disassembly tier" value={material.disassemblyTier} />
              {material.storageMethod && <Detail label="Storage" value={material.storageMethod} />}
              {material.machinery && <Detail label="Handling" value={material.machinery} />}
              {material.refabNotes && <Detail label="Refabrication" value={material.refabNotes} />}
            </dl>
          </div>
        </div>

        {/* Buy column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex flex-wrap gap-2">
            <FamilyTag family={material.family} />
            <PathwayTag pathway={s.pathway} />
            <Badge tone="outline">Tier {material.disassemblyTier}</Badge>
          </div>
          <h1 className="font-display text-h2 leading-tight">{material.name}</h1>
          <p className="mt-4 text-body text-stone">{material.description}</p>

          {/* Price + impact */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Reclaimed price" value={priceBand(material.price, material.priceUnit)} />
            {material.priceNew && (
              <Stat
                label="New (imported)"
                value={`${currency(material.priceNew.min)}–${currency(material.priceNew.max)} ${unitLabel}`}
                muted
              />
            )}
            <Stat
              label="Carbon saving"
              value={`${bandLabel(material.carbonSavingPct, '%')} lower`}
              accent
            />
            {material.costSavingPct && (
              <Stat label="Cost saving" value={`${bandLabel(material.costSavingPct, '%')} lower`} accent />
            )}
          </div>

          {/* Add to palette */}
          <div className="mt-6 flex items-end gap-3 rounded-lg border border-hairline bg-surface-raised p-4 shadow-card">
            <div className="w-24">
              <label htmlFor="qty" className="mb-1 block text-caption text-stone">
                Quantity
              </label>
              <Select
                id="qty"
                options={qtyOptions}
                value={String(qty)}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <Button onClick={onAdd} size="lg" variant={added || inPalette ? 'secondary' : 'primary'} className="w-full">
                {added ? '✓ Added to palette' : inPalette ? 'Add more to palette' : 'Add to palette'}
              </Button>
            </div>
          </div>
          {added && (
            <p className="mt-2 text-center text-caption text-stone">
              <Link to="/palette" className="text-clay underline">
                View palette
              </Link>{' '}
              or{' '}
              <Link to="/builder" className="text-clay underline">
                open the 3D builder
              </Link>
              .
            </p>
          )}

          {/* CRS */}
          <div className="mt-8 rounded-lg border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">Capital Retention Score</p>
              <span className="font-mono text-caption text-stone">
                line value ≈ {currency(bandMid(material.price))} {unitLabel}
              </span>
            </div>
            <CrsBreakdown material={material} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-stone">{label}</dt>
      <dd className="text-body-sm font-medium text-graphite">{value}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-raised p-3">
      <p className="text-caption text-stone">{label}</p>
      <p
        className={
          'mt-0.5 text-body-sm font-medium ' +
          (accent ? 'text-moss' : muted ? 'text-stone line-through decoration-stone/40' : 'text-ink')
        }
      >
        {value}
      </p>
    </div>
  );
}

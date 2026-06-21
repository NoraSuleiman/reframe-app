import { useNavigate } from 'react-router-dom';
import { usePaletteStore } from '@/store/palette';
import { useCartStore } from '@/store/cart';
import { useEntries } from '@/hooks/useEntries';
import { aggregateCrs, bandMid, scoreMaterial, toPct, totalCarbonSavingPct } from '@/domain/crs';
import { Swatch } from '@/components/Swatch';
import { CrsBadge } from '@/components/crs/CrsBadge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { currency, number, PRICE_UNIT_LABEL, toPctLabel } from '@/lib/format';

export default function Palette() {
  const navigate = useNavigate();
  const items = usePaletteStore((s) => s.items);
  const setQuantity = usePaletteStore((s) => s.setQuantity);
  const remove = usePaletteStore((s) => s.remove);
  const clear = usePaletteStore((s) => s.clear);
  const addManyToCart = useCartStore((s) => s.addMany);

  const { entries, isLoading } = useEntries(items);

  if (isLoading) return <LoadingBlock />;

  if (entries.length === 0) {
    return (
      <div className="container-content py-section">
        <p className="eyebrow">Material palette</p>
        <h1 className="mb-8 mt-2 font-display text-h2">Your palette</h1>
        <EmptyState
          title="Your palette is empty"
          description="Add materials from the marketplace to curate a palette, then compose them into a façade."
          action={<ButtonLink to="/marketplace">Browse materials</ButtonLink>}
        />
      </div>
    );
  }

  const subtotal = entries.reduce((sum, e) => sum + bandMid(e.material.price) * e.quantity, 0);
  const blendedCrs = aggregateCrs(entries, 'quantity');
  const carbon = totalCarbonSavingPct(entries);

  function addAllToCart() {
    addManyToCart(
      entries.map((e) => ({
        materialId: e.material.id,
        quantity: e.quantity,
        unitPrice: bandMid(e.material.price),
      })),
    );
    navigate('/cart');
  }

  return (
    <div className="container-content py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow">Material palette</p>
          <h1 className="mt-2 font-display text-h2">Your palette</h1>
          <p className="mt-1 text-body-sm text-stone">{entries.length} materials selected</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear palette
          </Button>
          <ButtonLink to="/builder" variant="secondary" size="sm">
            Open in 3D builder →
          </ButtonLink>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Tiles */}
        <ul className="space-y-3">
          {entries.map((e) => {
            const s = scoreMaterial(e.material);
            const line = bandMid(e.material.price) * e.quantity;
            const qtyOptions = Array.from(
              { length: Math.min(50, e.material.qtyAvailable) },
              (_, i) => ({ value: String(i + 1), label: String(i + 1) }),
            );
            return (
              <li
                key={e.material.id}
                className="flex items-center gap-4 rounded-lg border border-hairline bg-surface-raised p-3"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded">
                  <Swatch family={e.material.family} seed={e.material.slug} />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => navigate(`/material/${e.material.slug}`)}
                    className="text-left font-display text-subtitle font-medium hover:text-clay"
                  >
                    {e.material.name}
                  </button>
                  <p className="text-caption text-stone">
                    {currency(bandMid(e.material.price))} {PRICE_UNIT_LABEL[e.material.priceUnit]} ·{' '}
                    {toPct(s.ecrsRatio)}% eCRS
                  </p>
                </div>
                <div className="w-20">
                  <Select
                    aria-label={`Quantity of ${e.material.name}`}
                    options={qtyOptions}
                    value={String(e.quantity)}
                    onChange={(ev) => setQuantity(e.material.id, Number(ev.target.value))}
                  />
                </div>
                <div className="w-24 text-right text-body-sm font-medium">{currency(line)}</div>
                <CrsBadge ratio={s.ecrsRatio} size={44} />
                <button
                  onClick={() => remove(e.material.id)}
                  aria-label={`Remove ${e.material.name}`}
                  className="grid h-8 w-8 place-items-center rounded text-stone hover:bg-sand hover:text-danger"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-hairline bg-surface p-5">
            <h2 className="font-display text-h5">Palette summary</h2>
            <div className="mt-4 flex items-center gap-4 border-b border-hairline pb-4">
              <CrsBadge ratio={blendedCrs} size={64} label="blend" />
              <div>
                <p className="text-body-sm font-medium text-ink">Blended eCRS</p>
                <p className="text-caption text-stone">Quantity-weighted across the palette</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-body-sm">
              <Row label="Materials" value={number(entries.length)} />
              <Row label="Total units" value={number(entries.reduce((n, e) => n + e.quantity, 0))} />
              <Row label="Avg. carbon saving" value={toPctLabel(carbon)} accent />
              <Row label="Estimated subtotal" value={currency(subtotal)} strong />
            </dl>
            <Button size="lg" className="mt-5 w-full" onClick={addAllToCart}>
              Add all to cart
            </Button>
            <p className="mt-2 text-center text-caption text-stone">
              Subtotal uses mid-band pricing; a formal quote is generated at checkout.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  strong,
}: {
  label: string;
  value: string;
  accent?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-stone">{label}</dt>
      <dd className={accent ? 'font-medium text-moss' : strong ? 'font-display text-h5' : 'text-graphite'}>
        {value}
      </dd>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { useEntries } from '@/hooks/useEntries';
import { aggregateCrs, toPct, totalCarbonSavingPct } from '@/domain/crs';
import { CrsBadge } from '@/components/crs/CrsBadge';
import { Swatch } from '@/components/Swatch';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { currency, number, PRICE_UNIT_LABEL, toPctLabel } from '@/lib/format';

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const { entries, byId, isLoading } = useEntries(items);

  if (isLoading) return <LoadingBlock />;

  if (items.length === 0) {
    return (
      <div className="container-content py-section">
        <p className="eyebrow">Cart</p>
        <h1 className="mb-8 mt-2 font-display text-h2">Your cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Add a palette to your cart to generate a quote."
          action={<ButtonLink to="/palette">Go to palette</ButtonLink>}
        />
      </div>
    );
  }

  const grandTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const blendedCrs = aggregateCrs(entries, 'quantity');
  const carbon = totalCarbonSavingPct(entries);

  return (
    <div className="container-content py-10">
      <header className="mb-8 border-b border-hairline pb-6">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-2 font-display text-h2">Review &amp; quote</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-hairline">
          <table className="w-full text-body-sm">
            <thead className="bg-surface text-left text-caption uppercase tracking-label text-stone">
              <tr>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Unit price</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Line total</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const m = byId.get(i.materialId);
                if (!m) return null;
                const qtyOptions = Array.from(
                  { length: Math.min(50, m.qtyAvailable) },
                  (_, k) => ({ value: String(k + 1), label: String(k + 1) }),
                );
                return (
                  <tr key={i.materialId} className="border-t border-hairline-soft">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded">
                          <Swatch family={m.family} seed={m.slug} />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{m.name}</p>
                          <p className="text-caption text-stone">{m.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-graphite">
                      {currency(i.unitPrice)} {PRICE_UNIT_LABEL[m.priceUnit]}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        aria-label={`Quantity of ${m.name}`}
                        className="w-20"
                        options={qtyOptions}
                        value={String(i.quantity)}
                        onChange={(e) => setQuantity(i.materialId, Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {currency(i.unitPrice * i.quantity)}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        onClick={() => remove(i.materialId)}
                        aria-label={`Remove ${m.name}`}
                        className="grid h-8 w-8 place-items-center rounded text-stone hover:bg-sand hover:text-danger"
                      >
                        <svg viewBox="0 0 16 16" className="h-4 w-4">
                          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-hairline bg-surface p-5">
            <h2 className="font-display text-h5">Order summary</h2>
            <div className="mt-4 flex items-center gap-4 border-b border-hairline pb-4">
              <CrsBadge ratio={blendedCrs} size={60} label="blend" />
              <div>
                <p className="text-body-sm font-medium text-ink">{toPct(blendedCrs)}% blended eCRS</p>
                <p className="text-caption text-stone">{toPctLabel(carbon)} avg. carbon saving</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Items</dt>
                <dd className="text-graphite">{number(items.reduce((n, i) => n + i.quantity, 0))}</dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2">
                <dt className="text-stone">Estimated total</dt>
                <dd className="font-display text-h4">{currency(grandTotal)}</dd>
              </div>
            </dl>
            <Button size="lg" className="mt-5 w-full" onClick={() => navigate('/checkout')}>
              Proceed to quote
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { useEntries } from '@/hooks/useEntries';
import { useCreateQuote } from '@/hooks/useQuotes';
import { useAuthStore } from '@/store/auth';
import { aggregateCrs, toPct, totalCarbonSavingPct } from '@/domain/crs';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { currency, toPctLabel } from '@/lib/format';
import type { Quote, QuoteLineItem } from '@/domain/types';

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const profile = useAuthStore((s) => s.profile);
  const { byId, entries, isLoading } = useEntries(items);
  const createQuote = useCreateQuote();

  const [contact, setContact] = useState({
    name: profile?.displayName ?? '',
    email: profile?.email ?? '',
    organisation: '',
    message: '',
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <LoadingBlock />;

  if (quote) return <Confirmation quote={quote} />;

  if (items.length === 0) {
    return (
      <div className="container-content py-section">
        <EmptyState
          title="Nothing to quote"
          description="Your cart is empty."
          action={<ButtonLink to="/marketplace">Browse materials</ButtonLink>}
        />
      </div>
    );
  }

  const lineItems: QuoteLineItem[] = items.flatMap((i) => {
    const m = byId.get(i.materialId);
    if (!m) return [];
    return [
      {
        materialId: m.id,
        name: m.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        priceUnit: m.priceUnit,
        lineTotal: i.unitPrice * i.quantity,
      },
    ];
  });
  const subtotal = lineItems.reduce((s, li) => s + li.lineTotal, 0);
  const blendedCrs = aggregateCrs(entries, 'quantity');
  const carbon = totalCarbonSavingPct(entries);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await createQuote.mutateAsync({
        userId: profile?.id ?? null,
        contact,
        lineItems,
        subtotal,
        total: subtotal,
        aggregateCrs: blendedCrs,
        totalCarbonSavingPct: carbon,
      });
      clearCart();
      setQuote(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the quote.');
    }
  }

  return (
    <div className="container-content py-10">
      <header className="mb-8 border-b border-hairline pb-6">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 font-display text-h2">Request a quote</h1>
        <p className="mt-1 text-body-sm text-stone">
          No payment is taken — this generates a quote summary for the depot to review.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" required>
              <Input
                id="name"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="Organisation" htmlFor="org">
            <Input
              id="org"
              value={contact.organisation}
              onChange={(e) => setContact({ ...contact, organisation: e.target.value })}
            />
          </Field>
          <Field label="Notes for the depot" htmlFor="msg" hint="Timeframe, collection, processing requests…">
            <Textarea
              id="msg"
              rows={4}
              value={contact.message}
              onChange={(e) => setContact({ ...contact, message: e.target.value })}
            />
          </Field>
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" disabled={createQuote.isPending}>
            {createQuote.isPending ? 'Submitting…' : 'Submit quote request'}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-hairline bg-surface p-5">
            <h2 className="font-display text-h5">Quote summary</h2>
            <ul className="mt-4 space-y-2 text-body-sm">
              {lineItems.map((li) => (
                <li key={li.materialId} className="flex justify-between gap-3">
                  <span className="text-graphite">
                    {li.name} <span className="text-stone">×{li.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium">{currency(li.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Blended eCRS</dt>
                <dd className="font-medium">{toPct(blendedCrs)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Avg. carbon saving</dt>
                <dd className="font-medium text-moss">{toPctLabel(carbon)}</dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2">
                <dt className="text-stone">Estimated total</dt>
                <dd className="font-display text-h4">{currency(subtotal)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Confirmation({ quote }: { quote: Quote }) {
  return (
    <div className="container-content flex flex-col items-center py-section text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-moss-tint text-moss">
        <svg viewBox="0 0 24 24" className="h-7 w-7">
          <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <h1 className="mt-5 font-display text-h1">Quote submitted</h1>
      <p className="mt-3 max-w-md text-stone">
        Thanks — the depot has received your request and will be in touch. Keep your reference for
        any follow-up.
      </p>
      <div className="mt-6 rounded-lg border border-hairline bg-surface px-8 py-5">
        <p className="eyebrow">Reference</p>
        <p className="mt-1 font-mono text-h3 tracking-wide text-ink">{quote.reference}</p>
      </div>
      <dl className="mt-6 flex gap-8 text-body-sm">
        <div>
          <dt className="text-stone">Estimated total</dt>
          <dd className="font-display text-h4">{currency(quote.total)}</dd>
        </div>
        <div>
          <dt className="text-stone">Blended eCRS</dt>
          <dd className="font-display text-h4">{toPct(quote.aggregateCrs)}%</dd>
        </div>
        <div>
          <dt className="text-stone">Carbon saving</dt>
          <dd className="font-display text-h4 text-moss">{toPctLabel(quote.totalCarbonSavingPct)}</dd>
        </div>
      </dl>
      <div className="mt-8 flex gap-3">
        <ButtonLink to="/marketplace" variant="secondary">
          Keep browsing
        </ButtonLink>
        <ButtonLink to="/builder">Open the 3D builder</ButtonLink>
      </div>
      <p className="mt-6 text-caption text-stone">
        Need to revisit?{' '}
        <Link to="/contact" className="text-clay underline">
          Contact the depot
        </Link>
        .
      </p>
    </div>
  );
}

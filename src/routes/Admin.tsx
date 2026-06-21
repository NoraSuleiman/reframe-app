import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useMaterials, useMaterialMutations } from '@/hooks/useMaterials';
import { useQuotes, useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { scoreMaterial, toPct } from '@/domain/crs';
import type { Material } from '@/domain/types';
import { MaterialForm } from '@/components/admin/MaterialForm';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { FamilyTag } from '@/components/crs/tags';
import { LoadingBlock } from '@/components/ui/States';
import { currency, formatDate, number } from '@/lib/format';

export default function Admin() {
  return (
    <div className="container-content py-10">
      <header className="mb-8 border-b border-hairline pb-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 font-display text-h2">Depot operations</h1>
        <p className="mt-1 text-body-sm text-stone">
          Manage the catalogue and review incoming quote requests.
        </p>
      </header>

      <Tabs.Root defaultValue="materials">
        <Tabs.List className="mb-6 flex gap-1 border-b border-hairline">
          <TabTrigger value="materials">Materials</TabTrigger>
          <TabTrigger value="quotes">Quote requests</TabTrigger>
        </Tabs.List>
        <Tabs.Content value="materials">
          <MaterialsPanel />
        </Tabs.Content>
        <Tabs.Content value="quotes">
          <QuotesPanel />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="-mb-px border-b-2 border-transparent px-4 py-2.5 text-body-sm font-medium text-stone data-[state=active]:border-clay data-[state=active]:text-ink"
    >
      {children}
    </Tabs.Trigger>
  );
}

function MaterialsPanel() {
  const { data: materials, isLoading } = useMaterials({ includeDrafts: true, sort: 'name' });
  const { create, update, remove } = useMaterialMutations();
  const [editing, setEditing] = useState<Material | null>(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) return <LoadingBlock />;

  function onSubmit(material: Material) {
    if (editing) {
      update.mutate({ id: editing.id, patch: material });
    } else {
      create.mutate(material);
    }
    setEditing(null);
    setCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body-sm text-stone">{materials?.length ?? 0} materials</p>
        <Button size="sm" onClick={() => setCreating(true)}>
          + New material
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline">
        <table className="w-full text-body-sm">
          <thead className="bg-surface text-left text-caption uppercase tracking-label text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Family</th>
              <th className="px-4 py-3 font-medium">eCRS</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(materials ?? []).map((m) => {
              const s = scoreMaterial(m);
              return (
                <tr key={m.id} className="border-t border-hairline-soft">
                  <td className="px-4 py-3 font-medium text-ink">{m.name}</td>
                  <td className="px-4 py-3">
                    <FamilyTag family={m.family} />
                  </td>
                  <td className="px-4 py-3 text-graphite">{toPct(s.ecrsRatio)}%</td>
                  <td className="px-4 py-3 text-graphite">
                    {number(m.qtyAvailable)} {m.stockUnit}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={m.status === 'published'}
                      onCheckedChange={(on) =>
                        update.mutate({ id: m.id, patch: { status: on ? 'published' : 'draft' } })
                      }
                      aria-label={`Toggle published for ${m.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Delete “${m.name}”? This cannot be undone.`)) remove.mutate(m.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? 'Edit material' : 'New material'}
        className="max-w-2xl"
      >
        <MaterialForm
          material={editing ?? undefined}
          onSubmit={onSubmit}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          pending={create.isPending || update.isPending}
        />
      </Dialog>
    </div>
  );
}

function QuotesPanel() {
  const { data: quotes, isLoading } = useQuotes();
  const updateStatus = useUpdateQuoteStatus();

  if (isLoading) return <LoadingBlock />;

  if (!quotes || quotes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-hairline-strong bg-surface px-6 py-12 text-center text-body-sm text-stone">
        No quote requests yet. Submitted quotes will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div key={q.id} className="rounded-lg border border-hairline bg-surface-raised p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-body-sm font-medium text-ink">{q.reference}</span>
                <Badge tone={q.status === 'submitted' ? 'clay' : 'moss'}>{q.status}</Badge>
              </div>
              <p className="mt-1 text-body-sm text-graphite">
                {q.contact.name}
                {q.contact.organisation ? ` · ${q.contact.organisation}` : ''} · {q.contact.email}
              </p>
              <p className="text-caption text-stone">{formatDate(q.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-h4">{currency(q.total)}</p>
              <p className="text-caption text-stone">
                {toPct(q.aggregateCrs)}% eCRS · {Math.round(q.totalCarbonSavingPct)}% carbon saved
              </p>
            </div>
          </div>
          <ul className="mt-3 grid gap-1 border-t border-hairline-soft pt-3 text-caption text-stone sm:grid-cols-2">
            {q.lineItems.map((li) => (
              <li key={li.materialId}>
                {li.name} ×{li.quantity} — {currency(li.lineTotal)}
              </li>
            ))}
          </ul>
          {q.contact.message && (
            <p className="mt-3 rounded bg-surface p-3 text-body-sm text-graphite">“{q.contact.message}”</p>
          )}
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                updateStatus.mutate({
                  id: q.id,
                  status: q.status === 'submitted' ? 'reviewed' : 'submitted',
                })
              }
            >
              Mark as {q.status === 'submitted' ? 'reviewed' : 'submitted'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

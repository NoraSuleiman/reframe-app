import { useMemo, useState } from 'react';
import { crs, ecrs, pathwayFromEcrs, toPct } from '@/domain/crs';
import { PATHWAY_LABELS } from '@/domain/crs';
import type { Material, MaterialFamily } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CrsBadge } from '@/components/crs/CrsBadge';
import { slugify } from '@/lib/slug';

const FAMILY_OPTIONS = [
  { value: 'panel', label: 'Panel' },
  { value: 'glazing', label: 'Glazing' },
  { value: 'substructure', label: 'Substructure' },
  { value: 'shading', label: 'Shading' },
];
const TIER_OPTIONS = [
  { value: 'D1', label: 'D1 — direct' },
  { value: 'D2', label: 'D2 — adaptable' },
  { value: 'D3', label: 'D3 — recovery' },
];

type Draft = {
  name: string;
  family: MaterialFamily;
  description: string;
  location: string;
  sourceBuildings: string;
  unitSize: string;
  width: number;
  height: number;
  qtyAvailable: number;
  stockUnit: Material['stockUnit'];
  priceMin: number;
  priceMax: number;
  priceUnit: Material['priceUnit'];
  carbonMin: number;
  carbonMax: number;
  technicalScore: number;
  ecologicalScore: number;
  economicScore: number;
  entropy: number;
  disassemblyTier: Material['disassemblyTier'];
  status: Material['status'];
};

function toDraft(m?: Material): Draft {
  return {
    name: m?.name ?? '',
    family: m?.family ?? 'panel',
    description: m?.description ?? '',
    location: m?.location ?? 'Alexandria, Sydney',
    sourceBuildings: m?.sourceBuildings.join(', ') ?? '',
    unitSize: m?.unitSize ?? '',
    width: m?.unitDimensions.width ?? 1,
    height: m?.unitDimensions.height ?? 1,
    qtyAvailable: m?.qtyAvailable ?? 0,
    stockUnit: m?.stockUnit ?? 'panels',
    priceMin: m?.price.min ?? 0,
    priceMax: m?.price.max ?? 0,
    priceUnit: m?.priceUnit ?? 'm2',
    carbonMin: m?.carbonSavingPct.min ?? 0,
    carbonMax: m?.carbonSavingPct.max ?? 0,
    technicalScore: m?.technicalScore ?? 4,
    ecologicalScore: m?.ecologicalScore ?? 4,
    economicScore: m?.economicScore ?? 4,
    entropy: m?.entropy ?? 0.1,
    disassemblyTier: m?.disassemblyTier ?? 'D2',
    status: m?.status ?? 'draft',
  };
}

interface MaterialFormProps {
  material?: Material;
  onSubmit: (material: Material) => void;
  onCancel: () => void;
  pending?: boolean;
}

export function MaterialForm({ material, onSubmit, onCancel, pending }: MaterialFormProps) {
  const [d, setD] = useState<Draft>(() => toDraft(material));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((p) => ({ ...p, [key]: value }));

  const ecrsRatio = useMemo(() => {
    const raw = crs(d.technicalScore, d.ecologicalScore, d.economicScore);
    return ecrs(raw, d.entropy) / 5;
  }, [d.technicalScore, d.ecologicalScore, d.economicScore, d.entropy]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = material?.id ?? (slugify(d.name) || crypto.randomUUID());
    const result: Material = {
      id,
      slug: material?.slug ?? (slugify(d.name) || id),
      name: d.name,
      family: d.family,
      status: d.status,
      description: d.description,
      sourceBuildings: d.sourceBuildings
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      location: d.location,
      unitSize: d.unitSize,
      unitDimensions: { width: Number(d.width), height: Number(d.height) },
      qtyAvailable: Number(d.qtyAvailable),
      stockUnit: d.stockUnit,
      price: { min: Number(d.priceMin), max: Number(d.priceMax) },
      priceUnit: d.priceUnit,
      carbonSavingPct: { min: Number(d.carbonMin), max: Number(d.carbonMax) },
      technicalScore: Number(d.technicalScore),
      ecologicalScore: Number(d.ecologicalScore),
      economicScore: Number(d.economicScore),
      entropy: Number(d.entropy),
      disassemblyTier: d.disassemblyTier,
      criteria: material?.criteria ?? {},
      images: material?.images ?? [],
    };
    onSubmit(result);
  }

  return (
    <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <Field label="Name" htmlFor="m-name" required>
        <Input id="m-name" value={d.name} onChange={(e) => set('name', e.target.value)} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Family" htmlFor="m-family">
          <Select
            id="m-family"
            options={FAMILY_OPTIONS}
            value={d.family}
            onChange={(e) => set('family', e.target.value as MaterialFamily)}
          />
        </Field>
        <Field label="Status" htmlFor="m-status">
          <Select
            id="m-status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
            value={d.status}
            onChange={(e) => set('status', e.target.value as Material['status'])}
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="m-desc">
        <Textarea id="m-desc" rows={3} value={d.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" htmlFor="m-loc">
          <Input id="m-loc" value={d.location} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field label="Source buildings (comma-sep)" htmlFor="m-src">
          <Input id="m-src" value={d.sourceBuildings} onChange={(e) => set('sourceBuildings', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Unit size" htmlFor="m-us">
          <Input id="m-us" value={d.unitSize} onChange={(e) => set('unitSize', e.target.value)} />
        </Field>
        <Field label="Width (m)" htmlFor="m-w">
          <Input id="m-w" type="number" step="0.1" value={d.width} onChange={(e) => set('width', +e.target.value)} />
        </Field>
        <Field label="Height (m)" htmlFor="m-h">
          <Input id="m-h" type="number" step="0.1" value={d.height} onChange={(e) => set('height', +e.target.value)} />
        </Field>
        <Field label="Qty available" htmlFor="m-qty">
          <Input id="m-qty" type="number" value={d.qtyAvailable} onChange={(e) => set('qtyAvailable', +e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Price min" htmlFor="m-pmin">
          <Input id="m-pmin" type="number" value={d.priceMin} onChange={(e) => set('priceMin', +e.target.value)} />
        </Field>
        <Field label="Price max" htmlFor="m-pmax">
          <Input id="m-pmax" type="number" value={d.priceMax} onChange={(e) => set('priceMax', +e.target.value)} />
        </Field>
        <Field label="Carbon min %" htmlFor="m-cmin">
          <Input id="m-cmin" type="number" value={d.carbonMin} onChange={(e) => set('carbonMin', +e.target.value)} />
        </Field>
        <Field label="Carbon max %" htmlFor="m-cmax">
          <Input id="m-cmax" type="number" value={d.carbonMax} onChange={(e) => set('carbonMax', +e.target.value)} />
        </Field>
      </div>

      {/* CRS inputs + live preview */}
      <div className="rounded-lg border border-hairline bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">CRS inputs</p>
          <div className="flex items-center gap-3">
            <span className="text-caption text-stone">{PATHWAY_LABELS[pathwayFromEcrs(ecrsRatio)]}</span>
            <CrsBadge ratio={ecrsRatio} size={48} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreField label="Technical" value={d.technicalScore} onChange={(v) => set('technicalScore', v)} />
          <ScoreField label="Ecological" value={d.ecologicalScore} onChange={(v) => set('ecologicalScore', v)} />
          <ScoreField label="Economic" value={d.economicScore} onChange={(v) => set('economicScore', v)} />
          <Field label="Entropy E" htmlFor="m-e">
            <Input
              id="m-e"
              type="number"
              min={0}
              max={1}
              step="0.01"
              value={d.entropy}
              onChange={(e) => set('entropy', +e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Field label="Disassembly tier" htmlFor="m-tier" className="w-40">
            <Select
              id="m-tier"
              options={TIER_OPTIONS}
              value={d.disassemblyTier}
              onChange={(e) => set('disassemblyTier', e.target.value as Material['disassemblyTier'])}
            />
          </Field>
          <p className="text-body-sm text-stone">
            Live eCRS: <span className="font-display text-h5 text-ink">{toPct(ecrsRatio)}%</span>
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : material ? 'Save changes' : 'Create material'}
        </Button>
      </div>
    </form>
  );
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} (0–5)`} htmlFor={`s-${label}`}>
      <Input
        id={`s-${label}`}
        type="number"
        min={0}
        max={5}
        step="0.1"
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </Field>
  );
}

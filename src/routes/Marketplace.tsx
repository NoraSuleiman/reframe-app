import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMaterials } from '@/hooks/useMaterials';
import type { MaterialQuery } from '@/data';
import { MaterialCard } from '@/components/MaterialCard';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { FAMILY_LABELS } from '@/components/crs/tags';
import { PATHWAY_LABELS } from '@/domain/crs';
import type { MaterialFamily, Pathway } from '@/domain/types';
import { SOURCE_BUILDINGS } from '@/data/seed/buildings';
import { cn } from '@/lib/cn';

const FAMILIES = Object.keys(FAMILY_LABELS) as MaterialFamily[];
const PATHWAYS = Object.keys(PATHWAY_LABELS) as Pathway[];

const SORT_OPTIONS = [
  { value: 'crs', label: 'Highest eCRS' },
  { value: 'carbon', label: 'Most carbon saved' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name (A–Z)' },
];

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const [families, setFamilies] = useState<MaterialFamily[]>([]);
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [minCrs, setMinCrs] = useState(0);
  const [sort, setSort] = useState<MaterialQuery['sort']>('crs');

  const search = params.get('q') ?? '';

  // Initialise family filter from ?family= (e.g. footer links).
  useEffect(() => {
    const fam = params.get('family') as MaterialFamily | null;
    if (fam && FAMILIES.includes(fam)) setFamilies([fam]);
  }, [params]);

  const query: MaterialQuery = useMemo(
    () => ({
      search: search || undefined,
      families: families.length ? families : undefined,
      pathways: pathways.length ? pathways : undefined,
      buildings: buildings.length ? buildings : undefined,
      minCrs: minCrs > 0 ? minCrs / 100 : undefined,
      sort,
    }),
    [search, families, pathways, buildings, minCrs, sort],
  );

  const { data, isLoading } = useMaterials(query);

  function toggle<T>(list: T[], value: T, set: (next: T[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearAll() {
    setFamilies([]);
    setPathways([]);
    setBuildings([]);
    setMinCrs(0);
    if (search) setParams({});
  }

  const activeCount =
    families.length + pathways.length + buildings.length + (minCrs > 0 ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="container-content py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="mt-2 font-display text-h2">
            {search ? `Results for “${search}”` : 'Reclaimed façade materials'}
          </h1>
          {!isLoading && (
            <p className="mt-1 text-body-sm text-stone">
              {data?.length ?? 0} material{(data?.length ?? 0) === 1 ? '' : 's'} available
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-body-sm text-stone">
            Sort
          </label>
          <Select
            id="sort"
            className="w-48"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => setSort(e.target.value as MaterialQuery['sort'])}
          />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-h5">Filters</h2>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2">
                Clear ({activeCount})
              </Button>
            )}
          </div>

          <FilterGroup title="Family">
            {FAMILIES.map((f) => (
              <CheckRow
                key={f}
                label={FAMILY_LABELS[f]}
                checked={families.includes(f)}
                onChange={() => toggle(families, f, setFamilies)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Reuse pathway">
            {PATHWAYS.map((p) => (
              <CheckRow
                key={p}
                label={PATHWAY_LABELS[p]}
                checked={pathways.includes(p)}
                onChange={() => toggle(pathways, p, setPathways)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={`Minimum eCRS · ${minCrs}%`}>
            <Slider value={minCrs} onValueChange={setMinCrs} min={0} max={90} step={5} aria-label="Minimum eCRS" />
          </FilterGroup>

          <FilterGroup title="Source building">
            {SOURCE_BUILDINGS.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={buildings.includes(b)}
                onChange={() => toggle(buildings, b, setBuildings)}
              />
            ))}
          </FilterGroup>
        </aside>

        {/* Results */}
        <div>
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No materials match those filters"
              description="Try widening the eCRS range or clearing a filter."
              action={
                <Button variant="secondary" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 font-mono text-micro uppercase tracking-label text-stone">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-graphite">
      <span
        className={cn(
          'grid h-4 w-4 shrink-0 place-items-center rounded-sm border transition-colors',
          checked ? 'border-clay bg-clay text-white' : 'border-hairline-strong bg-surface-raised',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path d="M2.5 6.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span>{label}</span>
    </label>
  );
}

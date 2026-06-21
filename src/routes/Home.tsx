import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterials } from '@/hooks/useMaterials';
import { MaterialCard } from '@/components/MaterialCard';
import { Swatch } from '@/components/Swatch';
import { Button, ButtonLink } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/States';
import type { MaterialFamily } from '@/domain/types';

const HERO_TILES: { family: MaterialFamily; seed: string }[] = [
  { family: 'panel', seed: 'terracotta-rainscreen-panels' },
  { family: 'glazing', seed: 'igu-curtain-wall-units' },
  { family: 'substructure', seed: 'aluminium-mullions' },
  { family: 'panel', seed: 'honed-basalt-stone-panels' },
  { family: 'shading', seed: 'aluminium-brise-soleil-fins' },
  { family: 'glazing', seed: 'glass-fin-structural-panels' },
  { family: 'panel', seed: 'metal-cassette-panels-acp' },
  { family: 'substructure', seed: 'aluminium-transoms' },
  { family: 'panel', seed: 'pigmented-precast-concrete-panels' },
];

const CAPITALS = [
  {
    label: 'Technical',
    weight: '×0.4',
    body: 'Structural integrity, durability, disassemblability and condition — can the material carry load and come apart cleanly?',
  },
  {
    label: 'Ecological',
    weight: '×0.3',
    body: 'Embodied carbon, recyclability, purity and transport impact — what is spared by reusing rather than remaking?',
  },
  {
    label: 'Economic',
    weight: '×0.3',
    body: 'Availability, regulation, versatility and cost — is there a market, and does reuse make commercial sense?',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: featured, isLoading } = useMaterials({ sort: 'crs' });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-hairline bg-gradient-to-b from-surface to-paper">
        <div className="container-content grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="eyebrow">Reclaimed façade marketplace · Sydney</p>
            <h1 className="mt-4 font-display text-h1 leading-[1.04] sm:text-display">
              Every salvaged panel still holds&nbsp;value.
            </h1>
            <p className="mt-5 max-w-prose text-subtitle text-stone">
              ReFrame catalogues reclaimed building façades — terracotta, glazing, aluminium framing,
              stone and steel — and scores each for the capital it retains. Browse the catalogue,
              curate a palette, and reassemble it into a new façade in 3D.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/marketplace?q=${encodeURIComponent(query.trim())}`);
              }}
              className="mt-7 flex max-w-md gap-2"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search terracotta, IGU, aluminium…"
                aria-label="Search materials"
                className="h-12 flex-1 rounded border border-hairline-strong bg-surface-raised px-4 text-body focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink to="/marketplace" variant="secondary" size="md">
                Browse all materials
              </ButtonLink>
              <ButtonLink to="/builder" variant="ghost" size="md">
                Open the 3D builder →
              </ButtonLink>
            </div>
          </div>

          {/* Façade-sample mosaic */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-hairline bg-surface-raised p-2 shadow-card">
              {HERO_TILES.map((t, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded">
                  <Swatch family={t.family} seed={t.seed} />
                </div>
              ))}
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-lg border border-hairline bg-surface-raised px-4 py-3 shadow-card">
              <p className="font-display text-h3 leading-none">≈2,400 m²</p>
              <p className="mt-1 text-caption text-stone">façade inventory recovered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CRS explainer */}
      <section className="container-content py-16">
        <div className="max-w-prose">
          <p className="eyebrow">The Capital Retention Score</p>
          <h2 className="mt-3 font-display text-h2">
            One number for how much a material is still worth.
          </h2>
          <p className="mt-4 text-body text-stone">
            Each material carries a <strong className="text-ink">CRS</strong> from three weighted
            capitals, then adjusted by an entropy coefficient for value lost in disassembly — its{' '}
            <strong className="text-ink">effective CRS</strong>.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CAPITALS.map((c) => (
            <div key={c.label} className="rounded-lg border border-hairline bg-surface-raised p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-h5">{c.label}</h3>
                <span className="font-mono text-caption text-clay">{c.weight}</span>
              </div>
              <p className="mt-3 text-body-sm text-stone">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-caption text-stone">
          CRS = Technical×0.4 + Ecological×0.3 + Economic×0.3 &nbsp;·&nbsp; eCRS = CRS × (1 − E)
        </p>
      </section>

      {/* Featured */}
      <section className="container-content pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">Highest retained value</p>
            <h2 className="mt-2 font-display text-h3">Featured materials</h2>
          </div>
          <ButtonLink to="/marketplace" variant="ghost" size="sm" className="hidden sm:inline-flex">
            View all →
          </ButtonLink>
        </div>
        {isLoading ? (
          <LoadingBlock />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(featured ?? []).slice(0, 6).map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        )}
      </section>

      {/* Builder teaser */}
      <section className="container-content pb-section">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-ink text-paper">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-mono text-micro uppercase tracking-label text-clay-soft">
                3D façade builder
              </p>
              <h2 className="mt-3 font-display text-h2 text-paper">
                Compose a new façade from salvaged parts.
              </h2>
              <p className="mt-4 max-w-prose text-body text-paper/70">
                Drag materials from your palette onto a snapping grid, size and arrange modules, and
                watch the blended CRS and carbon saving update in real time.
              </p>
              <ButtonLink to="/builder" variant="accent" size="lg" className="mt-6">
                Launch the builder
              </ButtonLink>
            </div>
            <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-paper/5 p-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-sm opacity-90">
                  <Swatch
                    family={HERO_TILES[i % HERO_TILES.length].family}
                    seed={`teaser-${i}`}
                    detail={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

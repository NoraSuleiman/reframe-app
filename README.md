# ReFrame — Reclaimed Material Marketplace & 3D Façade Builder

A public marketplace for reclaimed building-façade materials — catalogued, scored for retained
value via a **Capital Retention Score (CRS)**, curated into a **palette**, and reassembled on a
**3D snapping-grid façade builder**. Companion app to the *Reframing Design* Masters thesis.

Built with **Vite + React 18 + TypeScript**, deployable to **Vercel**. Runs entirely client-side
on a typed mock data layer (seed JSON + `localStorage`) behind a repository interface, so a real
**Supabase** backend can be swapped in later without touching the UI.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts: `npm run build` · `npm run preview` · `npm test` (Vitest) · `npm run lint`.

### Demo accounts (mock auth)

| Role  | Email                    | Password  |
| ----- | ------------------------ | --------- |
| Admin | admin@reframe.studio     | `reframe` |
| User  | designer@reframe.studio  | `reframe` |

## Architecture

| Concern        | Choice                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| Routing        | React Router (`src/App.tsx`)                                                 |
| Styling        | Tailwind CSS + design tokens (`tailwind.config.js`, `src/styles/tokens.css`) |
| Server state   | TanStack Query (`src/hooks/*`)                                               |
| Local state    | Zustand + `persist` (`src/store/*` — palette, cart, builder, auth)           |
| 3D             | React Three Fiber + drei (`src/builder/*`)                                   |
| Data layer     | Repository interfaces (`src/data/repository.ts`) + mock impls (`src/data/mock/*`) |

### The CRS domain (`src/domain/`)

Pure, unit-tested functions are the single source of truth for scoring:

```
CRS  = technical*0.4 + ecological*0.3 + economic*0.3   (sub-scores 0–5)
eCRS = CRS * (1 - E)                                   (E = entropy 0–1)
```

`aggregateCrs()` blends a set of materials — **quantity-weighted** for palette/cart totals,
**area-weighted** for the façade builder readout. See `src/domain/crs.ts` and `crs.test.ts`.

## Swapping in Supabase later

Implement the interfaces in `src/data/repository.ts` under `src/data/supabase/*`, then repoint the
three bindings in `src/data/index.ts`. No UI or hook changes required. Move privileged admin/quote
operations to Vercel serverless functions at that point.

## Seed data

The catalogue (`src/data/seed/materials.ts`) merges the depot inventory from `Material list.xlsx`
(roster, quantities, unit sizes, storage, refabrication notes) with the product brief's CRS,
pathway/tier, pricing and carbon figures. Imagery is procedural per material family
(`src/components/Swatch.tsx`) until real photography is supplied via `Material.images`.

## Status

Phases 0–4 of the build plan are implemented (foundations, catalogue, auth/palette/cart/quote, 3D
builder, admin/contact). Remaining polish: a Playwright happy-path e2e test, a formal WCAG AA audit,
and per-page SEO meta tags.

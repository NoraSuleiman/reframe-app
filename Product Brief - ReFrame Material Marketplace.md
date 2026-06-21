# Product Brief — ReFrame: Reclaimed Material Marketplace & 3D Façade Builder

**Status:** Proposed
**Date:** 21 June 2026
**Authors / Deciders:** Nora & Christopher (Masters of Architecture)
**Build target:** Claude Code
**Working name:** ReFrame (placeholder — derived from "Reframing Design")

---

## 1. Vision

ReFrame is the digital companion to the *Reframing Design* thesis: an open, public-facing marketplace where reclaimed building façade materials — terracotta cladding, IGU glazing, aluminium framing, precast concrete, stone, metal cassettes and substructure — are catalogued, scored for retained value, and assembled into new façades.

The product turns the thesis's core idea — that a material retains measurable *capital* after it leaves a building — into a usable tool. Each material carries a **Capital Retention Score (CRS)**, and users can browse the catalogue, add materials to a personal **palette**, then drag those materials onto a **3D modular façade builder** to compose new façade massing in real time before submitting the palette as a quote.

The experience should feel like an architect's design tool crossed with a considered marketplace — tactile, precise, and editorial. Explicitly *not* generic e-commerce, and not "AI slop."

---

## 2. Context

This app sits on top of the *Material Capital* framework developed in the thesis and the Alexandria Canal Hub depot project (67c Bourke Rd, Alexandria, City of Sydney). Materials are deconstructed from real Sydney source buildings (e.g. UTS Building 6 / Peter Johnson Building, Aurora Place, 8 Chifley Square, Foveaux St), assessed, refabricated, and logged "in an open-source digital marketplace for public use." This app *is* that marketplace.

The brief reflects the choices made for this build:

| Decision | Choice |
|---|---|
| Build scope | Functional prototype — real interactions, expandable to production |
| Stack | Vite + React (TypeScript), hosted on Vercel |
| Backend | Full backend with authentication and admin material upload |
| 3D fidelity | Detailed modules on a snapping grid |
| Commerce | Mock checkout — generates a quote with totals, no real payment |

---

## 3. Goals & non-goals

**Goals**

- Let any visitor browse and search a catalogue of reclaimed façade materials with rich detail pages, including the CRS score and provenance.
- Let users curate a **material palette** and use it to build a **3D façade** from snapping modules.
- Generate a **quote** (mock checkout) summarising selected materials, quantities, totals, carbon savings, and a blended CRS.
- Provide an **admin role** to upload, edit, and publish materials (with images and specs).
- Be architecturally clean and expandable — real auth, real database, real API — so it can later grow into a production marketplace.

**Non-goals (this phase)**

- Real payment processing or shipping logistics (mock checkout only).
- Multi-vendor supplier onboarding flows beyond a single admin role.
- Mobile-native apps (responsive web is in scope; a phone-first 3D editor is not).
- Structural / engineering certification of assembled façades — the 3D builder is a design and visualisation tool, not a compliance tool.

---

## 4. Users & roles

**Visitor (unauthenticated)** — can browse, search, view material detail, and explore the 3D viewer with sample materials. Cannot persist a palette or submit a quote.

**Registered user (buyer / designer)** — everything a visitor can do, plus: save palettes, persist 3D façade compositions, add palettes to cart, and submit quote requests. This is the primary persona — an architect, designer, builder, or student sourcing reclaimed material.

**Admin (operator)** — manages the catalogue: create/edit/publish/unpublish materials, upload images, set specs, quantities, pricing, and CRS inputs. Reviews incoming quote requests.

Auth model: email/password + optional magic link. Role stored on the user record; admin routes and admin API actions guarded server-side.

---

## 5. Domain model — the CRS system

This is the conceptual heart of the product and must be implemented faithfully to the thesis.

**Capital Retention Score (CRS)** — a single number from 0–5 (scaled to 0–100%) representing retained material value, composed of three capitals:

```
CRS = (Technical × 0.4) + (Ecological × 0.3) + (Economic × 0.3)
```

- **Technical (×0.4)** — structural integrity, durability, ability to be disassembled, condition.
- **Ecological (×0.3)** — embodied carbon, recyclability, purity, transport impact.
- **Economic (×0.3)** — availability, regulation, versatility, cost.

**Effective CRS (eCRS)** — CRS adjusted by an **Entropy Coefficient (E)** that accounts for value lost during extraction/disassembly:

```
eCRS = CRS × (1 − E)
```

`E` is a fraction 0–1 (0 = no loss, 0.25 = 25% lost, 1 = total loss), reflecting losses from mechanical connections, contamination, material degradation, and separation labour.

**18 binary assessment criteria** drive the technical/ecological/economic sub-scores (each a yes/no flag): STR, MOD, DIS, CON, VIS, SID, REU, LIF, EMB, LOC, PUR, ENG, AVA, TEC, REG, VERS, TRA, LAB. The detail page should be able to show which criteria a material satisfies.

**Reuse pathway classification** — each material is tagged with a reuse route and a disassembly tier:

- Pathways: **Direct reuse** (eCRS ≥ ~0.75), **Refabrication / Adaptable** (~0.30–0.75, cut/re-profiled/re-coated), **ReHome / Recovery** (repurposed to lower-spec programmes), **Recycle**.
- Disassembly tier: **D1** (direct, e.g. metal cassette / aluminium sheet ≈ 89%), **D2** (adaptable, e.g. terracotta / stone / precast ≈ 78%), **D3** (recovery, e.g. thin-set veneers ≈ 22%).

**Provenance & impact** — each material records source building(s), typical "new (imported)" baseline vs "reclaimed (local)" figures, and resulting **carbon savings** and **cost savings** percentages (e.g. terracotta ≈ 80–90% lower carbon, 45–70% lower cost).

---

## 6. Screens & user flow

The full flow, screen by screen. Each is a route in the app.

**Home (`/`)** — featured materials, prominent search bar, a live 3D viewer teaser, and entry points to the material palette, contact, and cart. Editorial hero introducing the CRS concept.

**Marketplace / search results (`/marketplace`)** — triggered by search or category browse. Grid of material cards showing image, name, CRS badge, pathway tag, location, and price/unit. Filters: material family (panel / glazing / substructure / shading), pathway, CRS range, source building, price. Sort by CRS, carbon saving, price.

**Material detail (`/material/:id`)** — large material image(s), name, description, source location/building, full specifications (dimensions, unit size, quantity available), **CRS score with the three-capital breakdown and eCRS**, carbon and cost savings vs new, the satisfied assessment criteria, a quantity dropdown, and an **"Add to palette"** button.

**Material palette (`/palette`)** — the curated set of materials the user has selected. Shows each material as a tile with quantity, blended/aggregate CRS, total estimated carbon saving, and totals. Actions: open in 3D viewer, edit quantities, remove, and **"Add all to cart."**

**3D façade builder (`/builder`)** — the centrepiece. The palette sits as a **top bar** above the 3D canvas. The user **drags a material from the palette onto the canvas**, where it becomes a 3D massing module placed on a **snapping grid**. Modules can be moved, resized, duplicated, and deleted. Smooth orbit/pan/zoom camera. A **sidebar** holds settings and controls (grid size, snap toggle, module dimensions, façade dimensions, lighting, view presets, save). Real-time readout of the composed façade's aggregate CRS, total area, and material counts.

**Cart (`/cart`)** — line items from the palette with quantities, unit prices, line totals, grand total, aggregate carbon saving and blended CRS. Proceeds to **mock checkout**.

**Checkout / quote (`/checkout`)** — collects contact details, generates a **quote summary** (totals, no payment), and submits a quote request to the backend. Confirmation screen with a reference number.

**Contact (`/contact`)** — business information and an inquiry form, for enquiries or to connect.

**Admin (`/admin`)** — guarded. CRUD over materials, image upload, publish/unpublish, and a list of incoming quote requests.

**Auth (`/login`, `/signup`)** — email/password + magic link.

---

## 7. Information architecture

```
Home
├── Marketplace ──► Material detail ──► (Add to palette)
├── Palette ──► (Add all to cart) / (Open in 3D builder)
├── 3D Builder  ◄── palette top bar + settings sidebar
├── Cart ──► Checkout (mock quote) ──► Confirmation
├── Contact
├── Auth (login / signup)
└── Admin (materials CRUD, quote requests)   [admin only]
```

Global persistent UI: top nav with search, palette indicator, cart indicator, and account menu.

---

## 8. Architecture & stack

### 8.1 Decision summary

A single-page Vite + React (TypeScript) front end deployed to Vercel, backed by a managed Postgres + Auth + Storage service. The recommended backend is **Supabase**, with Vercel serverless functions used only where server-side secrets or privileged logic are required.

### 8.2 Options considered (backend)

**Option A — Supabase (recommended)**

| Dimension | Assessment |
|---|---|
| Complexity | Low–Med — managed Postgres, Auth, Storage, Row-Level Security out of the box |
| Cost | Free tier covers a prototype; predictable scaling |
| Scalability | Strong — real Postgres, expandable to production |
| Team familiarity | Friendly client SDK, minimal backend code to write |

**Pros:** auth + database + image storage + RLS in one place; fits "full backend with auth and admin upload" with the least code; deploys cleanly alongside Vercel.
**Cons:** another hosted service to manage; RLS policies need care; some lock-in to Supabase conventions.

**Option B — Vercel serverless functions + hosted Postgres (e.g. Neon) + Clerk/Auth.js + Blob storage**

| Dimension | Assessment |
|---|---|
| Complexity | Med–High — assemble auth, DB, and storage yourself |
| Cost | Comparable; more moving parts to meter |
| Scalability | Strong |
| Team familiarity | More boilerplate, more control |

**Pros:** everything in the Vercel ecosystem; maximum flexibility.
**Cons:** more glue code and configuration; slower to a working prototype.

**Option C — Frontend-only with mock JSON**
Rejected for this build — does not meet the "full backend with auth and admin upload" requirement, though the seed data (Section 11) is structured so the app can run against mock JSON during early development before the backend is wired.

### 8.3 Trade-off analysis

For a functional, expandable prototype that needs real auth and admin upload with minimal backend effort, Supabase delivers the most capability per unit of work and keeps a clean path to production. Option B is the fallback if tighter Vercel-native integration or a specific auth provider is later required.

### 8.4 Recommended stack

- **Build / framework:** Vite + React 18 + TypeScript.
- **Routing:** React Router.
- **Styling:** Tailwind CSS, with a small design-token layer (colours, type scale) for the editorial, architectural aesthetic. Headless UI / Radix for accessible primitives.
- **State / data:** TanStack Query for server state; Zustand for local UI state (palette, builder scene, cart).
- **3D:** Three.js via **React Three Fiber**, with **drei** helpers (OrbitControls, Grid, Bounds, TransformControls, drag handling) and a drag-and-drop bridge from the palette top bar.
- **Backend:** Supabase — Postgres, Auth (email/password + magic link), Storage (material images), Row-Level Security.
- **Privileged logic:** Vercel serverless functions for any admin-only operations and quote submission that shouldn't run client-side.
- **Hosting:** Vercel (front end) + Supabase (data/auth/storage).
- **Tooling:** ESLint + Prettier, Vitest + React Testing Library, Playwright for a couple of end-to-end happy-path tests.

### 8.5 High-level architecture

```
[ React SPA on Vercel ]
   │   TanStack Query / Supabase JS client
   ▼
[ Supabase ]
   ├── Postgres (materials, palettes, scene, cart, quotes, profiles)
   ├── Auth (users + role claim)
   └── Storage (material images)
        ▲
[ Vercel serverless functions ]  ── privileged admin ops, quote emails
```

---

## 9. Data model

Core tables (Postgres). Types abbreviated.

**`profiles`** — `id` (FK auth user), `display_name`, `role` (`user` | `admin`), `created_at`.

**`materials`**
- Identity: `id`, `slug`, `name`, `description`, `family` (panel / glazing / substructure / shading), `status` (`draft` | `published`).
- Provenance: `source_buildings` (text[]), `location`, `origin_type` (new vs reclaimed baseline notes).
- Specs: `unit_size` (e.g. "3.0 × 1.2 m"), `qty_available`, `unit` (panels / sheets / m / units), `storage_method`, `refab_notes`.
- Commercial: `price_min`, `price_max`, `price_unit` (per m² / per kg / per unit).
- Impact: `carbon_new_min/max`, `carbon_reclaimed_min/max`, `carbon_unit`, `carbon_saving_pct_min/max`, `cost_saving_pct_min/max`.
- CRS: `technical_score`, `ecological_score`, `economic_score` (0–5), computed/stored `crs`, `entropy_e` (0–1), computed `ecrs`, `pathway` (direct / refabrication / rehome / recycle), `disassembly_tier` (D1/D2/D3), `criteria` (jsonb of the 18 flags).
- Media: `images` (Storage paths / array).

**`palettes`** — `id`, `user_id`, `name`, `created_at`. **`palette_items`** — `id`, `palette_id`, `material_id`, `quantity`.

**`scenes`** — `id`, `user_id`, `palette_id`, `data` (jsonb: array of placed modules with material_id, position, dimensions, rotation, grid settings). One scene persists a 3D composition.

**`carts`** / **`cart_items`** — mirror of palette items promoted to cart with frozen unit prices.

**`quotes`** — `id`, `user_id`, `contact` (jsonb), `line_items` (jsonb snapshot), `subtotal`, `total`, `aggregate_crs`, `total_carbon_saving`, `reference`, `status` (`submitted` | `reviewed`), `created_at`.

**Derived values** (computed in app or via SQL/view): aggregate/blended CRS across a palette or scene (quantity- or area-weighted), total carbon saving, totals.

**Security:** RLS so users see only their own palettes/scenes/carts/quotes; `materials` readable by all when `published`, writable only by admins; admin checks enforced server-side.

---

## 10. 3D builder — technical spec

The builder is the highest-risk, highest-value component. Treat it as its own milestone.

**Canvas & camera** — React Three Fiber canvas filling the viewport below the palette top bar. `OrbitControls` (drei) tuned for smooth, damped pan/orbit/zoom. Sensible min/max zoom and a framed default view. A ground/grid plane defines the build field.

**Snapping grid** — configurable grid cell size (e.g. 0.5 m default, matching panel modularity). Placed modules snap their position and dimensions to grid increments. Snap can be toggled in the sidebar.

**Drag from palette to canvas** — palette materials sit in the **top bar**; dragging one over the canvas creates a module. Implement via pointer events with a raycast from screen position to the grid plane to determine drop location; on drop, instantiate a module at the snapped cell.

**Modules** — each placed material becomes a rectangular massing module (panel-like proportions from `unit_size`). Detailed fidelity: real proportions, material colour/texture (use the material image as a texture map where available), subtle edge bevels, and a label. Modules support:
- **Select** (click) — shows transform handles and a properties panel.
- **Move** — drag on the grid plane, snapping.
- **Resize** — handles or sidebar dimension inputs, snapping to grid; quantity implied by module size vs unit size.
- **Rotate** — 90° increments (and free rotate optional).
- **Duplicate / delete**.

**Sidebar (settings & controls)** — grid size, snap on/off, module dimensions, façade bounding dimensions, lighting/environment preset, camera view presets (front / iso / top), show/hide grid, and **save scene**. Live readout: module count, total façade area, aggregate CRS, total carbon saving.

**Persistence** — the scene serialises to the `scenes.data` jsonb (modules with material_id, position, size, rotation + grid settings) so a composition can be reloaded.

**Performance** — instance/share geometries and materials; cap module count gracefully; lazy-load textures. Target a smooth 60fps on a typical laptop.

**Accessibility / fallback** — keyboard nudge for selected module; graceful message if WebGL is unavailable.

---

## 11. Seed data

Seed the catalogue from the uploaded material inventory and presentation so the prototype is populated with real, defensible data. Representative entries (full list in `Material list.xlsx`):

| Material | Qty | Unit size | Pathway / tier | CRS | Notes |
|---|---|---|---|---|---|
| Pigmented precast concrete panels | 280 panels | 3.0 × 1.2 m | Adaptable / D2 | 78% | Edge repair, recutting, cleaning |
| Terracotta rainscreen panels (clip-hung) | 320 panels | 2.0 × 1.0 m | Adaptable / D2 | 78% | Reuse as rainscreen modules; ~80–90% carbon saving |
| Honed basalt stone panels | 80 panels | 1.2 × 0.6 m | Adaptable / D2 | 78% | Cutting, polishing |
| Polished granite panels | 60 panels | 1.0 × 1.0 m | Adaptable / D2 | 72% | Re-polishing |
| Metal cassette panels (ACP) | 150 panels | 1.5 × 1.0 m | Direct / D1 | 89% | Re-coating, re-cutting |
| Fibre cement backing boards | 200 sheets | 2.4 × 1.2 m | Adaptable / D1 | 72% | Limited reuse |
| IGU curtain wall units | 500 panels | 2.0 × 1.0 m | Refabrication / D2 | 59–81% eCRS | Testing + reuse; ~75–90% carbon saving |
| Spandrel glazing panels | 120 panels | 2.0 × 1.0 m | Refabrication | — | Recoating |
| Metal insulated spandrel panels | 100 panels | 2.0 × 1.0 m | Direct reuse | — | Direct reuse |
| Glass fin panels (structural) | 40 panels | 3.0 × 0.5 m | High-value reuse | — | Specialist handling |
| Aluminium mullions | 700 m | 6–8 m lengths | Adaptable / D1 | 88% (highest) | Cut + reuse |
| Aluminium transoms | 500 m | 2–3 m | Reassembly | 76% | Bundled racks |
| Stainless steel brackets / anchors | 1,200 units | small | Cleaning + reuse | 64% | Bins |

Provenance examples to attach: terracotta → Peter Johnson Building, Aurora Place; IGU → 8 Chifley Square, Foveaux St / UTS Building 6; aluminium framing → Peter Johnson Building, Foveaux St, Aurora Place. Total façade inventory ≈ 2,400 m².

Pricing/impact examples (per the presentation): terracotta reclaimed $100–260/m² (vs new $240–490/m²); IGU reclaimed $80–260/m² (vs $170–410/m²); aluminium framing reclaimed $1.50–3.00/kg (vs $1.50–3.60/kg) with 85–95% lower carbon.

---

## 12. Non-functional requirements

- **Performance:** marketplace and detail pages interactive < 2s on a typical connection; 3D builder smooth (target 60fps) for dozens of modules.
- **Responsive:** full experience on desktop/laptop; marketplace and detail fully responsive on tablet/phone; the 3D builder is desktop-first with a usable (if reduced) tablet experience.
- **Accessibility:** WCAG AA for catalogue and forms; keyboard support and ARIA on interactive controls.
- **Aesthetic:** editorial, architectural, material-forward — restrained type, generous whitespace, muted/earthy neutrals with the material imagery doing the colour work; precise UI, no generic e-commerce clutter. Dark mode optional.
- **Security:** RLS on all user data; admin actions server-guarded; no secrets in the client bundle.
- **SEO/sharing:** public material pages have meta tags and shareable URLs.

---

## 13. Phased build plan

**Phase 0 — Foundations**
Scaffold Vite + React + TS + Tailwind + Router. Set up design tokens, layout shell, global nav (search, palette, cart, account). Configure Supabase project; define schema and RLS; seed `materials` from the uploaded data (run against mock JSON first if backend isn't ready).

**Phase 1 — Catalogue**
Home, Marketplace grid with search/filter/sort, Material detail page with full CRS breakdown, eCRS, criteria, and impact. Read-only; no auth required.

**Phase 2 — Auth & palette**
Email/password + magic link. Palette: add-to-palette from detail, palette page, quantities, persistence per user. Cart and **mock checkout / quote** generation with totals, aggregate CRS, and carbon saving; quote submission + confirmation.

**Phase 3 — 3D builder**
R3F canvas, orbit/pan/zoom, snapping grid, drag-from-palette-top-bar to place modules, move/resize/rotate/duplicate/delete, settings sidebar, live readouts, scene persistence to `scenes`. This is the flagship — budget the most time here.

**Phase 4 — Admin & polish**
Admin CRUD for materials, image upload to Storage, publish/unpublish, quote-request inbox. Contact page. Accessibility pass, performance pass, tests (Vitest unit + Playwright happy-path). Deploy to Vercel.

---

## 14. Consequences

- **Easier:** with Supabase, auth/DB/storage/admin-upload come largely for free, so effort concentrates on the catalogue UX and the 3D builder where the product differentiates.
- **Harder:** the drag-from-2D-palette-into-3D-scene interaction and snapping/resize behaviour are genuinely fiddly — expect iteration. RLS policies need careful testing.
- **To revisit:** aggregate-CRS weighting method (by quantity vs area), promotion to real payments/logistics, multi-supplier onboarding, and whether scenes need versioning/sharing.

---

## 15. Open questions

1. **Aggregate CRS** — weight the blended palette/façade score by quantity, by area, or by cost? (Recommend area-weighted for the façade builder.)
2. **Module ↔ quantity coupling** — should resizing a 3D module automatically adjust the quantity drawn from available stock, or are the builder and cart quantities independent?
3. **Branding** — confirm the product name (ReFrame is a placeholder) and whether the visual identity should carry over directly from the thesis presentation.
4. **Contact details** — the real business/contact information to populate the Contact page.
5. **Image sourcing** — will real material photographs be supplied for the catalogue, or should placeholders/renders stand in for the prototype?

---

*Prepared as a build brief for Claude Code. Hand this document to Claude Code as the project spec; Phases 0–4 map to natural implementation milestones.*

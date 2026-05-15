@AGENTS.md

# Project Brain

> Maintained by `/sync`. Edit freely outside the marker blocks — those are auto-regenerated.
> Last synced: <!-- LAST_SYNCED -->2026-05-15<!-- /LAST_SYNCED -->

---

<!-- WIKI_PATHS (not auto-imported — read these manually with the Read tool when needed)
~/second-brain/wiki/architecture/apartment-hunter/structure.md
~/second-brain/wiki/patterns/apartment-hunter/patterns.md
-->

---

## What this project is

<!-- PROJECT_SUMMARY -->
Mobile-first apartment viewing tracker built with Next.js 15 App Router, Prisma v7 + Vercel Postgres (Neon), and Vercel Blob. Single user, no auth — tracks viewings on a weekly calendar, captures per-apartment photos/notes, and compares options in a sortable table. Full build completed 2026-05-15; deploy pending.
<!-- /PROJECT_SUMMARY -->

---

## Architecture map

<!-- ARCHITECTURE_MAP -->
- `app/calendar/page.tsx`: 'use client' — week navigation state, fetches /api/viewings
- `app/viewings/page.tsx`: Server — lists all viewings, calls autoCompletePassedViewings
- `app/viewings/[id]/page.tsx`: Server — viewing detail + apartments list → ViewingActions, AddApartmentButton
- `app/viewings/[id]/apartments/[aptId]/page.tsx`: Server — apartment detail → PhotoGrid, ApartmentActions
- `app/compare/page.tsx`: Server — fetches all apartments → CompareTable (client sort island)
- `app/api/**`: 7 route files — viewings CRUD, apartments CRUD, photo upload/delete, compare GET
- `lib/prisma.ts`: PrismaClient singleton (globalThis cache, @prisma/adapter-pg)
- `lib/queries.ts`: 14 exported query functions — all DB ops, Date→string serialization
- `lib/blob.ts`: uploadPhoto(file), removeBlob(url) — wraps @vercel/blob
- `types/index.ts`: Viewing, Apartment, Photo, ApartmentWithViewing interfaces
- `prisma/schema.prisma`: 3 models (Viewing, Apartment, Photo), Prisma v7 no-url datasource
- `components/nav/`: BottomNav (mobile+desktop), BackButton
- `components/viewings/`: ViewingForm (Sheet), ViewingActions, AddApartmentButton, ApartmentCard
- `components/apartments/`: ApartmentForm (Sheet), ApartmentActions, PhotoGrid, StarRating
- `components/compare/CompareTable.tsx`: 'use client' — sort state, receives data from server page
<!-- /ARCHITECTURE_MAP -->

Key files:

<!-- KEY_FILES -->
| File | What it does | Note |
|------|-------------|------|
| `lib/prisma.ts` | PrismaClient singleton | Import this everywhere — never `new PrismaClient()` inline |
| `lib/queries.ts` | All 14 DB query functions | Serializes Date→string; uses Prisma, no raw SQL |
| `lib/blob.ts` | Blob upload/delete | Wraps @vercel/blob |
| `types/index.ts` | All TS interfaces | snake_case fields, string dates |
| `prisma/schema.prisma` | DB schema source of truth | Prisma v7 — no url in datasource |
| `__tests__/helpers/prisma-mock.ts` | Test mock helper | mockDeep<PrismaClient>() via jest-mock-extended |
| `app/api/photos/[id]/route.ts` | Photo delete | Fetches blob_url from DB, removes Blob, then deletes record |
| `next.config.ts` | Image domains | `**.public.blob.vercel-storage.com` in remotePatterns |
<!-- /KEY_FILES -->

---

## Patterns — follow these exactly

<!-- PATTERNS -->
- ServerPageClientIsland: Pages are async server components fetching directly from DB. Only interactive UI is `'use client'`. Mutations → `router.refresh()`.
- NextJs15AsyncParams: Always `const { id } = await params` in route handlers and pages — never destructure directly.
- PrismaDateSerialization: Serialize `Date` objects to strings at the query layer (`toDateStr`, `toISOStr` helpers in queries.ts). Never let `Date` leak into API responses.
- PrismaSingleton: Import `{ prisma }` from `@/lib/prisma` — never `new PrismaClient()` inline.
- PrismaV7AdapterRuntime: schema.prisma datasource has no url. Runtime uses `new PrismaPg({ connectionString })` in lib/prisma.ts. Migrations use `POSTGRES_URL_NON_POOLING` via prisma.config.ts.
- ViewportSeparateExport: Next.js 15 requires `export const viewport: Viewport` as a separate named export from `metadata`.
- TestMockPrismaSingleton: Mock `@/lib/prisma` using `mockDeep<PrismaClient>()` from jest-mock-extended. Helper in `__tests__/helpers/prisma-mock.ts`.
- ShadcnInitFlags: Always init with `--style default --base-color slate` — CLI defaults to `base-nova` which breaks the Radix UI API.
<!-- /PATTERNS -->

---

## Current sprint

<!-- SPRINT_CONTEXT -->
*(no active sprint)*
<!-- /SPRINT_CONTEXT -->

---

## Open decisions

<!-- OPEN_DECISIONS -->
- Deploy: `vercel login` needed before `vercel deploy --prod --yes` can run
- DB migration: `npx prisma migrate dev --name init` must be run once .env.local is populated
<!-- /OPEN_DECISIONS -->

---

## Closed decisions

<!-- CLOSED_DECISIONS -->
- ADR-001: Prisma over raw @vercel/postgres — settled 2026-05-15
- ADR-002: Prisma v7 adapter-pg runtime pattern — settled 2026-05-15
- ADR-003: Server components as default, client islands for interactivity — settled 2026-05-15
- ADR-004: shadcn/ui Default style + Slate base color — settled 2026-05-15
<!-- /CLOSED_DECISIONS -->

---

## Token guidance

1. Read this file first (done)
2. Read `~/second-brain/wiki/meta/hot-apartment-hunter.md` for last session context
3. Load wiki pages on demand:
   - Working with data → `wiki/architecture/apartment-hunter/data-models.md`
   - Writing code → `wiki/patterns/apartment-hunter/patterns.md`
   - Adding endpoints → `wiki/architecture/apartment-hunter/api.md`
   - Finding a file → `wiki/architecture/apartment-hunter/structure.md`
4. If a pattern is listed above, follow it without opening the source file
5. If a decision is in CLOSED, don't re-examine it — just implement it

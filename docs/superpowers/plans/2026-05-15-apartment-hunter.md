# Apartment Hunter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web app for managing apartment viewing appointments with a weekly calendar, per-apartment photo/notes capture, and a desktop comparison table.

**Architecture:** Next.js 15 App Router with server components as the default — pages fetch data directly via query functions; only interactive islands (forms, photo upload, sortable table) are client components. API routes handle mutations; client components call them and then `router.refresh()` to re-run the server component tree. Vercel Postgres (Neon) for structured data; Vercel Blob for photo storage.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, `@vercel/postgres`, `@vercel/blob`, `date-fns`, Jest, `@testing-library/react`

---

## File Map

```
apartment-hunter/
├── app/
│   ├── layout.tsx                          # Root layout — font, metadata, viewport export, nav
│   ├── page.tsx                            # Redirect → /calendar
│   ├── calendar/
│   │   └── page.tsx                        # 'use client' — week navigation requires state
│   ├── viewings/
│   │   ├── page.tsx                        # Server component — lists all viewings
│   │   └── [id]/
│   │       ├── page.tsx                    # Server component — fetches viewing + apartments
│   │       └── apartments/
│   │           └── [aptId]/
│   │               └── page.tsx            # Server component — fetches apartment + photos
│   ├── compare/
│   │   └── page.tsx                        # Server component — fetches all apartments
│   └── api/
│       ├── viewings/
│       │   ├── route.ts                    # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts                # GET one, PUT update, DELETE
│       │       └── apartments/
│       │           └── route.ts            # GET list for viewing, POST create
│       ├── apartments/
│       │   └── [id]/
│       │       └── route.ts                # PUT update, DELETE
│       ├── photos/
│       │   ├── route.ts                    # POST upload → Vercel Blob
│       │   └── [id]/
│       │       └── route.ts                # DELETE photo
│       └── compare/
│           └── route.ts                    # GET all apartments joined with viewing data
├── components/
│   ├── nav/
│   │   └── BottomNav.tsx                   # 'use client' — usePathname for active tab
│   ├── calendar/
│   │   ├── WeekStrip.tsx                   # 'use client' — day selector
│   │   └── ViewingCard.tsx                 # Server-safe — pure display, Link
│   ├── viewings/
│   │   ├── ViewingForm.tsx                 # 'use client' — add/edit modal (Shadcn Sheet)
│   │   ├── ViewingActions.tsx              # 'use client' — mark complete, delete, edit trigger
│   │   ├── AddApartmentButton.tsx          # 'use client' — add apartment form trigger
│   │   └── ApartmentCard.tsx              # Server-safe — pure display, Link
│   ├── apartments/
│   │   ├── ApartmentForm.tsx               # 'use client' — add/edit modal (Shadcn Sheet)
│   │   ├── ApartmentActions.tsx            # 'use client' — edit trigger, delete
│   │   ├── PhotoGrid.tsx                   # 'use client' — file input, upload state
│   │   └── StarRating.tsx                  # 'use client' — interactive star tap
│   └── compare/
│       └── CompareTable.tsx                # 'use client' — sortable table state
├── lib/
│   ├── db.ts                               # Vercel Postgres sql client export
│   ├── queries.ts                          # All SQL queries (viewings, apartments, photos)
│   └── blob.ts                             # Vercel Blob upload/delete helpers
├── types/
│   └── index.ts                            # Viewing, Apartment, Photo, ApartmentWithViewing
├── sql/
│   └── schema.sql                          # DB schema — run once to initialize
└── __tests__/
    ├── lib/
    │   └── queries.test.ts                 # Unit tests for all query functions
    └── lib/
        └── blob.test.ts                    # Unit tests for blob helpers
```

---

## Task 1: Project Scaffold + Shadcn

**Files:**
- Create: `package.json` (via `create-next-app`)
- Create: `tailwind.config.ts`
- Create: `.env.local` (env var placeholders)
- Create: `components/ui/*` (via shadcn init)

- [ ] **Step 1: Scaffold the Next.js 15 app**

```bash
cd /Users/joselozano2003/Desktop
npx create-next-app@latest apartment-hunter \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd apartment-hunter
```

- [ ] **Step 2: Install Shadcn UI**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Then add the components used throughout this app:

```bash
npx shadcn@latest add button input textarea label card badge sheet table dialog
```

This creates `components/ui/` with pre-built, accessible components.

- [ ] **Step 3: Install runtime dependencies**

```bash
npm install @vercel/postgres @vercel/blob date-fns
```

- [ ] **Step 4: Install dev dependencies**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom ts-jest @types/jest
```

- [ ] **Step 5: Configure Jest**

Create `jest.config.ts`:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create env placeholder file**

Create `.env.local`:
```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 7: Add to .gitignore**

Append to `.gitignore`:
```
.superpowers/
.env.local
```

- [ ] **Step 8: Verify scaffold**

```bash
npm run dev
```
Expected: "Ready on http://localhost:3000" with no TypeScript or build errors.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 app with Tailwind, shadcn/ui, and testing deps"
```

---

## Task 2: Database Schema + Client

**Files:**
- Create: `sql/schema.sql`
- Create: `lib/db.ts`

- [ ] **Step 1: Write the schema**

Create `sql/schema.sql`:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS viewings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME,
  address     TEXT NOT NULL,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'completed')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS apartments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewing_id    UUID NOT NULL REFERENCES viewings(id) ON DELETE CASCADE,
  unit_label    TEXT NOT NULL,
  monthly_rent  INTEGER,
  bedrooms      INTEGER,
  bathrooms     NUMERIC(3,1),
  sqft          INTEGER,
  commute_note  TEXT,
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id  UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  blob_url      TEXT NOT NULL,
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 2: Create the Vercel Postgres project (Vercel dashboard)**

1. Go to vercel.com → Storage → Create Database → Postgres
2. Name it `apartment-hunter`
3. After creation, go to `.env.local` tab and copy all env vars into your local `.env.local`

- [ ] **Step 3: Run the schema**

```bash
npx vercel env pull .env.local   # or paste vars manually
npx tsx -e "
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const schema = fs.readFileSync('./sql/schema.sql', 'utf8');
sql.query(schema).then(() => { console.log('Schema applied'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
"
```
Expected: `Schema applied`

- [ ] **Step 4: Create the DB client**

Create `lib/db.ts`:
```typescript
export { sql } from '@vercel/postgres'
```

- [ ] **Step 5: Commit**

```bash
git add sql/schema.sql lib/db.ts
git commit -m "feat: add database schema and Vercel Postgres client"
```

---

## Task 3: TypeScript Types + Query Functions

**Files:**
- Create: `types/index.ts`
- Create: `lib/queries.ts`
- Create: `__tests__/lib/queries.test.ts`

- [ ] **Step 1: Write the types**

Create `types/index.ts`:
```typescript
export type ViewingStatus = 'upcoming' | 'completed'

export interface Viewing {
  id: string
  title: string
  date: string          // YYYY-MM-DD
  start_time: string    // HH:MM
  end_time: string | null
  address: string
  notes: string | null
  status: ViewingStatus
  created_at: string
  apartment_count?: number
}

export interface Apartment {
  id: string
  viewing_id: string
  unit_label: string
  monthly_rent: number | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  commute_note: string | null
  rating: number | null
  notes: string | null
  created_at: string
  photos?: Photo[]
}

export interface Photo {
  id: string
  apartment_id: string
  blob_url: string
  caption: string | null
  created_at: string
}

export interface ApartmentWithViewing extends Apartment {
  viewing_title: string
  viewing_date: string
  viewing_address: string
}
```

- [ ] **Step 2: Write the failing tests for query functions**

Create `__tests__/lib/queries.test.ts`:
```typescript
import { sql } from '@vercel/postgres'
import {
  getViewings,
  getViewing,
  createViewing,
  updateViewing,
  deleteViewing,
  autoCompletePassedViewings,
  getApartmentsForViewing,
  createApartment,
  updateApartment,
  deleteApartment,
  getPhotosForApartment,
  createPhoto,
  deletePhoto,
  getAllApartmentsWithViewings,
} from '@/lib/queries'

jest.mock('@vercel/postgres', () => ({
  sql: Object.assign(
    jest.fn(),
    { query: jest.fn() }
  ),
}))

const mockSql = sql as jest.MockedFunction<typeof sql>

beforeEach(() => {
  mockSql.mockReset()
})

describe('getViewings', () => {
  it('returns rows from the viewings table ordered by date', async () => {
    const mockRows = [
      { id: 'v1', title: 'Midtown', date: '2026-05-21', start_time: '14:00',
        end_time: null, address: '123 Main', notes: null, status: 'upcoming',
        created_at: '2026-05-15T00:00:00Z', apartment_count: 2 },
    ]
    mockSql.mockResolvedValueOnce({ rows: mockRows } as any)
    const result = await getViewings()
    expect(result).toEqual(mockRows)
  })
})

describe('createViewing', () => {
  it('inserts a viewing and returns the created row', async () => {
    const input = {
      title: 'Park Ave',
      date: '2026-05-22',
      start_time: '10:00',
      end_time: null,
      address: '456 Park Ave',
      notes: 'Bring ID',
    }
    const created = { id: 'v2', ...input, status: 'upcoming', created_at: '2026-05-15T00:00:00Z' }
    mockSql.mockResolvedValueOnce({ rows: [created] } as any)
    const result = await createViewing(input)
    expect(result).toEqual(created)
  })
})

describe('updateViewing', () => {
  it('updates the viewing status', async () => {
    const updated = { id: 'v1', status: 'completed' }
    mockSql.mockResolvedValueOnce({ rows: [updated] } as any)
    const result = await updateViewing('v1', { status: 'completed' })
    expect(result.status).toBe('completed')
  })
})

describe('deleteViewing', () => {
  it('deletes the viewing by id', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] } as any)
    await expect(deleteViewing('v1')).resolves.toBeUndefined()
  })
})

describe('createApartment', () => {
  it('inserts an apartment and returns the created row', async () => {
    const input = {
      viewing_id: 'v1',
      unit_label: 'Unit 203',
      monthly_rent: 2500,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      commute_note: '15 min',
      rating: 4,
      notes: 'Great light',
    }
    const created = { id: 'a1', ...input, created_at: '2026-05-15T00:00:00Z' }
    mockSql.mockResolvedValueOnce({ rows: [created] } as any)
    const result = await createApartment(input)
    expect(result).toEqual(created)
  })
})

describe('createPhoto', () => {
  it('inserts a photo record and returns it', async () => {
    const input = { apartment_id: 'a1', blob_url: 'https://blob.vercel.com/photo.jpg', caption: null }
    const created = { id: 'p1', ...input, created_at: '2026-05-15T00:00:00Z' }
    mockSql.mockResolvedValueOnce({ rows: [created] } as any)
    const result = await createPhoto(input)
    expect(result.blob_url).toBe('https://blob.vercel.com/photo.jpg')
  })
})

describe('autoCompletePassedViewings', () => {
  it('runs an UPDATE without throwing', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] } as any)
    await expect(autoCompletePassedViewings()).resolves.toBeUndefined()
  })
})

describe('getAllApartmentsWithViewings', () => {
  it('returns apartments joined with viewing data', async () => {
    const mockRows = [{
      id: 'a1', viewing_id: 'v1', unit_label: 'Unit 203', monthly_rent: 2500,
      bedrooms: 2, bathrooms: 1, sqft: 850, commute_note: '15 min', rating: 4,
      notes: null, created_at: '2026-05-15T00:00:00Z',
      viewing_title: 'Midtown', viewing_date: '2026-05-21', viewing_address: '123 Main',
    }]
    mockSql.mockResolvedValueOnce({ rows: mockRows } as any)
    const result = await getAllApartmentsWithViewings()
    expect(result[0].viewing_title).toBe('Midtown')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest __tests__/lib/queries.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '@/lib/queries'"

- [ ] **Step 4: Write the query implementations**

Create `lib/queries.ts`:
```typescript
import { sql } from '@/lib/db'
import type { Viewing, Apartment, Photo, ApartmentWithViewing, ViewingStatus } from '@/types'

// ── Viewings ─────────────────────────────────────────────────────────────────

export async function getViewings(): Promise<Viewing[]> {
  const { rows } = await sql`
    SELECT v.*, COUNT(a.id)::int AS apartment_count
    FROM viewings v
    LEFT JOIN apartments a ON a.viewing_id = v.id
    GROUP BY v.id
    ORDER BY v.date ASC, v.start_time ASC
  `
  return rows as Viewing[]
}

export async function getViewing(id: string): Promise<Viewing | null> {
  const { rows } = await sql`
    SELECT v.*, COUNT(a.id)::int AS apartment_count
    FROM viewings v
    LEFT JOIN apartments a ON a.viewing_id = v.id
    WHERE v.id = ${id}
    GROUP BY v.id
  `
  return (rows[0] as Viewing) ?? null
}

export async function createViewing(data: {
  title: string
  date: string
  start_time: string
  end_time: string | null
  address: string
  notes: string | null
}): Promise<Viewing> {
  const { rows } = await sql`
    INSERT INTO viewings (title, date, start_time, end_time, address, notes)
    VALUES (${data.title}, ${data.date}, ${data.start_time}, ${data.end_time},
            ${data.address}, ${data.notes})
    RETURNING *
  `
  return rows[0] as Viewing
}

export async function updateViewing(
  id: string,
  data: Partial<{ title: string; date: string; start_time: string; end_time: string | null; address: string; notes: string | null; status: ViewingStatus }>
): Promise<Viewing> {
  const fields = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k} = '${v}'`)
    .join(', ')
  const { rows } = await sql.query(
    `UPDATE viewings SET ${fields} WHERE id = $1 RETURNING *`,
    [id]
  )
  return rows[0] as Viewing
}

export async function deleteViewing(id: string): Promise<void> {
  await sql`DELETE FROM viewings WHERE id = ${id}`
}

// ── Apartments ────────────────────────────────────────────────────────────────

export async function getApartmentsForViewing(viewingId: string): Promise<Apartment[]> {
  const { rows } = await sql`
    SELECT a.*, COALESCE(
      json_agg(p ORDER BY p.created_at ASC) FILTER (WHERE p.id IS NOT NULL), '[]'
    ) AS photos
    FROM apartments a
    LEFT JOIN photos p ON p.apartment_id = a.id
    WHERE a.viewing_id = ${viewingId}
    GROUP BY a.id
    ORDER BY a.created_at ASC
  `
  return rows as Apartment[]
}

export async function createApartment(data: {
  viewing_id: string
  unit_label: string
  monthly_rent: number | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  commute_note: string | null
  rating: number | null
  notes: string | null
}): Promise<Apartment> {
  const { rows } = await sql`
    INSERT INTO apartments (viewing_id, unit_label, monthly_rent, bedrooms, bathrooms, sqft, commute_note, rating, notes)
    VALUES (${data.viewing_id}, ${data.unit_label}, ${data.monthly_rent}, ${data.bedrooms},
            ${data.bathrooms}, ${data.sqft}, ${data.commute_note}, ${data.rating}, ${data.notes})
    RETURNING *
  `
  return rows[0] as Apartment
}

export async function updateApartment(
  id: string,
  data: Partial<Omit<Apartment, 'id' | 'viewing_id' | 'created_at' | 'photos'>>
): Promise<Apartment> {
  const fields = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k} = ${v === null ? 'NULL' : `'${v}'`}`)
    .join(', ')
  const { rows } = await sql.query(
    `UPDATE apartments SET ${fields} WHERE id = $1 RETURNING *`,
    [id]
  )
  return rows[0] as Apartment
}

export async function deleteApartment(id: string): Promise<void> {
  await sql`DELETE FROM apartments WHERE id = ${id}`
}

// ── Photos ────────────────────────────────────────────────────────────────────

export async function getPhotosForApartment(apartmentId: string): Promise<Photo[]> {
  const { rows } = await sql`
    SELECT * FROM photos WHERE apartment_id = ${apartmentId} ORDER BY created_at ASC
  `
  return rows as Photo[]
}

export async function createPhoto(data: {
  apartment_id: string
  blob_url: string
  caption: string | null
}): Promise<Photo> {
  const { rows } = await sql`
    INSERT INTO photos (apartment_id, blob_url, caption)
    VALUES (${data.apartment_id}, ${data.blob_url}, ${data.caption})
    RETURNING *
  `
  return rows[0] as Photo
}

export async function deletePhoto(id: string): Promise<void> {
  await sql`DELETE FROM photos WHERE id = ${id}`
}

// ── Status auto-update ────────────────────────────────────────────────────────

export async function autoCompletePassedViewings(): Promise<void> {
  await sql`
    UPDATE viewings
    SET status = 'completed'
    WHERE status = 'upcoming'
      AND date < CURRENT_DATE
  `
}

// ── Compare ───────────────────────────────────────────────────────────────────

export async function getAllApartmentsWithViewings(): Promise<ApartmentWithViewing[]> {
  const { rows } = await sql`
    SELECT
      a.*,
      v.title  AS viewing_title,
      v.date   AS viewing_date,
      v.address AS viewing_address
    FROM apartments a
    JOIN viewings v ON v.id = a.viewing_id
    ORDER BY a.rating DESC NULLS LAST, v.date ASC
  `
  return rows as ApartmentWithViewing[]
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest __tests__/lib/queries.test.ts --no-coverage
```
Expected: PASS — 7 test suites pass.

- [ ] **Step 6: Commit**

```bash
git add types/index.ts lib/queries.ts __tests__/lib/queries.test.ts
git commit -m "feat: add TypeScript types and database query functions"
```

---

## Task 4: Vercel Blob Helpers

**Files:**
- Create: `lib/blob.ts`
- Create: `__tests__/lib/blob.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/blob.test.ts`:
```typescript
import { uploadPhoto, removeBlob } from '@/lib/blob'

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
}))

import { put, del } from '@vercel/blob'
const mockPut = put as jest.MockedFunction<typeof put>
const mockDel = del as jest.MockedFunction<typeof del>

beforeEach(() => {
  mockPut.mockReset()
  mockDel.mockReset()
})

describe('uploadPhoto', () => {
  it('calls put with the file and returns the url', async () => {
    mockPut.mockResolvedValueOnce({ url: 'https://blob.vercel.com/photo.jpg' } as any)
    const fakeFile = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const url = await uploadPhoto(fakeFile)
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringMatching(/^photos\//),
      fakeFile,
      { access: 'public' }
    )
    expect(url).toBe('https://blob.vercel.com/photo.jpg')
  })
})

describe('removeBlob', () => {
  it('calls del with the provided url', async () => {
    mockDel.mockResolvedValueOnce(undefined as any)
    await removeBlob('https://blob.vercel.com/photo.jpg')
    expect(mockDel).toHaveBeenCalledWith('https://blob.vercel.com/photo.jpg')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/blob.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '@/lib/blob'"

- [ ] **Step 3: Write the blob helpers**

Create `lib/blob.ts`:
```typescript
import { put, del } from '@vercel/blob'

export async function uploadPhoto(file: File): Promise<string> {
  const filename = `photos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { url } = await put(filename, file, { access: 'public' })
  return url
}

export async function removeBlob(url: string): Promise<void> {
  await del(url)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/lib/blob.test.ts --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/blob.ts __tests__/lib/blob.test.ts
git commit -m "feat: add Vercel Blob upload/delete helpers"
```

---

## Task 5: API Routes — Viewings

**Files:**
- Create: `app/api/viewings/route.ts`
- Create: `app/api/viewings/[id]/route.ts`

> **Next.js 15 note:** `params` in route handlers is now a `Promise`. Always `await params` before destructuring.

- [ ] **Step 1: Create viewing list + create route**

Create `app/api/viewings/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getViewings, createViewing, autoCompletePassedViewings } from '@/lib/queries'

export async function GET() {
  await autoCompletePassedViewings()
  const viewings = await getViewings()
  return NextResponse.json(viewings)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, date, start_time, end_time, address, notes } = body

  if (!date || !start_time || !address) {
    return NextResponse.json({ error: 'date, start_time, and address are required' }, { status: 400 })
  }

  const effectiveTitle = title?.trim() || address
  const viewing = await createViewing({
    title: effectiveTitle,
    date,
    start_time,
    end_time: end_time ?? null,
    address,
    notes: notes ?? null,
  })
  return NextResponse.json(viewing, { status: 201 })
}
```

- [ ] **Step 2: Create viewing detail route**

Create `app/api/viewings/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getViewing, updateViewing, deleteViewing } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params
  const viewing = await getViewing(id)
  if (!viewing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(viewing)
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  const viewing = await updateViewing(id, body)
  return NextResponse.json(viewing)
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  await deleteViewing(id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 3: Verify routes respond (dev server must be running)**

```bash
npm run dev &
curl -X POST http://localhost:3000/api/viewings \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-05-21","start_time":"14:00","address":"123 Main St","title":"Midtown"}'
```
Expected: `{"id":"...","title":"Midtown","date":"2026-05-21",...}`

```bash
curl http://localhost:3000/api/viewings
```
Expected: JSON array containing the created viewing.

- [ ] **Step 4: Commit**

```bash
git add app/api/viewings/
git commit -m "feat: add viewing CRUD API routes"
```

---

## Task 6: API Routes — Apartments

**Files:**
- Create: `app/api/viewings/[id]/apartments/route.ts`
- Create: `app/api/apartments/[id]/route.ts`

- [ ] **Step 1: Create apartments-per-viewing route**

Create `app/api/viewings/[id]/apartments/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getApartmentsForViewing, createApartment } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params
  const apartments = await getApartmentsForViewing(id)
  return NextResponse.json(apartments)
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  if (!body.unit_label?.trim()) {
    return NextResponse.json({ error: 'unit_label is required' }, { status: 400 })
  }
  const apartment = await createApartment({
    viewing_id: id,
    unit_label: body.unit_label,
    monthly_rent: body.monthly_rent ?? null,
    bedrooms: body.bedrooms ?? null,
    bathrooms: body.bathrooms ?? null,
    sqft: body.sqft ?? null,
    commute_note: body.commute_note ?? null,
    rating: body.rating ?? null,
    notes: body.notes ?? null,
  })
  return NextResponse.json(apartment, { status: 201 })
}
```

- [ ] **Step 2: Create apartment update/delete route**

Create `app/api/apartments/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { updateApartment, deleteApartment } from '@/lib/queries'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json()
  const apartment = await updateApartment(id, body)
  return NextResponse.json(apartment)
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  await deleteApartment(id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 3: Verify (requires a viewing id from Task 5)**

```bash
# Replace VIEWING_ID with the id returned in Task 5 Step 3
curl -X POST http://localhost:3000/api/viewings/VIEWING_ID/apartments \
  -H "Content-Type: application/json" \
  -d '{"unit_label":"Unit 203","monthly_rent":2500,"bedrooms":2,"bathrooms":1,"sqft":850,"rating":4}'
```
Expected: `{"id":"...","unit_label":"Unit 203","monthly_rent":2500,...}`

- [ ] **Step 4: Commit**

```bash
git add app/api/viewings/ app/api/apartments/
git commit -m "feat: add apartment CRUD API routes"
```

---

## Task 7: API Routes — Photos + Compare

**Files:**
- Create: `app/api/photos/route.ts`
- Create: `app/api/photos/[id]/route.ts`
- Create: `app/api/compare/route.ts`

- [ ] **Step 1: Create photo upload route**

Create `app/api/photos/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { uploadPhoto } from '@/lib/blob'
import { createPhoto } from '@/lib/queries'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const apartmentId = formData.get('apartment_id') as string | null
  const caption = formData.get('caption') as string | null

  if (!file || !apartmentId) {
    return NextResponse.json({ error: 'file and apartment_id are required' }, { status: 400 })
  }

  const blobUrl = await uploadPhoto(file)
  const photo = await createPhoto({ apartment_id: apartmentId, blob_url: blobUrl, caption })
  return NextResponse.json(photo, { status: 201 })
}
```

- [ ] **Step 2: Create photo delete route**

Create `app/api/photos/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { deletePhoto } from '@/lib/queries'
import { removeBlob } from '@/lib/blob'
import { sql } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params
  const { rows } = await sql`SELECT blob_url FROM photos WHERE id = ${id}`
  if (rows[0]?.blob_url) {
    await removeBlob(rows[0].blob_url)
  }
  await deletePhoto(id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 3: Create compare route**

Create `app/api/compare/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getAllApartmentsWithViewings } from '@/lib/queries'

export async function GET() {
  const apartments = await getAllApartmentsWithViewings()
  return NextResponse.json(apartments)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/photos/ app/api/compare/
git commit -m "feat: add photo upload/delete and compare API routes"
```

---

## Task 8: Root Layout + Navigation

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/nav/BottomNav.tsx`
- Modify: `app/page.tsx`

> **Next.js 15 note:** `viewport` is a separate named export from `metadata`. Do not include viewport properties inside `metadata`.

- [ ] **Step 1: Write the navigation component**

Create `components/nav/BottomNav.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/viewings', label: 'Viewings', icon: '🏠' },
  { href: '/compare', label: 'Compare', icon: '⚖️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-50">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex sticky top-0 bg-white border-b border-gray-200 z-50 px-6">
        <div className="flex items-center gap-1 h-14">
          <span className="font-bold text-indigo-700 mr-6 text-lg">Apartment Hunter</span>
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Update root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/nav/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Apartment Hunter',
  description: 'Track your apartment viewings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <BottomNav />
        <main className="pb-20 md:pb-0 md:pt-0 max-w-4xl mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Redirect root to /calendar**

Replace `app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/calendar')
}
```

- [ ] **Step 4: Verify nav renders**

Open http://localhost:3000 — should redirect to /calendar (404 for now). Bottom nav should be visible on mobile viewport. TypeScript should report no errors on the `viewport` export.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx components/nav/BottomNav.tsx
git commit -m "feat: add root layout with responsive navigation"
```

---

## Task 9: Calendar View

**Files:**
- Create: `app/calendar/page.tsx`
- Create: `components/calendar/WeekStrip.tsx`
- Create: `components/calendar/ViewingCard.tsx`

> The calendar page must be a client component — it owns the selected-date and reference-date state that drives the week strip.

- [ ] **Step 1: Build the week strip component**

Create `components/calendar/WeekStrip.tsx`:
```tsx
'use client'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Button } from '@/components/ui/button'

interface WeekStripProps {
  referenceDate: Date
  onDaySelect: (date: Date) => void
  selectedDate: Date
}

export default function WeekStrip({ referenceDate, onDaySelect, selectedDate }: WeekStripProps) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 gap-1 py-3">
      {days.map(day => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, new Date())
        return (
          <button
            key={day.toISOString()}
            onClick={() => onDaySelect(day)}
            className={`flex flex-col items-center py-1.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : isToday
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xs uppercase">{format(day, 'EEE')}</span>
            <span className="text-sm font-medium mt-0.5">{format(day, 'd')}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Build the viewing card component**

`ViewingCard` has no interactivity — it is a server-safe component (no `'use client'` directive).

Create `components/calendar/ViewingCard.tsx`:
```tsx
import Link from 'next/link'
import type { Viewing } from '@/types'

export default function ViewingCard({ viewing }: { viewing: Viewing }) {
  const isCompleted = viewing.status === 'completed'
  return (
    <Link href={`/viewings/${viewing.id}`}>
      <div className={`rounded-xl p-4 mb-3 border-l-4 ${
        isCompleted
          ? 'bg-green-50 border-green-400'
          : 'bg-indigo-50 border-indigo-500'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">{viewing.title}</span>
          {isCompleted && <span className="text-green-600 text-xs font-medium">Done ✓</span>}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">
          {viewing.start_time.slice(0, 5)}
          {viewing.end_time ? ` – ${viewing.end_time.slice(0, 5)}` : ''}
          {' · '}
          {viewing.apartment_count ?? 0} apartment{viewing.apartment_count !== 1 ? 's' : ''}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Build the calendar page**

The calendar page is `'use client'` because week navigation and day selection are stateful UI interactions. Data is loaded via `fetch` since we need it to re-fetch when the user navigates.

Create `app/calendar/page.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'
import { format, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import WeekStrip from '@/components/calendar/WeekStrip'
import ViewingCard from '@/components/calendar/ViewingCard'
import ViewingForm from '@/components/viewings/ViewingForm'
import { Button } from '@/components/ui/button'
import type { Viewing } from '@/types'

export default function CalendarPage() {
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [showForm, setShowForm] = useState(false)

  async function loadViewings() {
    const res = await fetch('/api/viewings')
    setViewings(await res.json())
  }

  useEffect(() => { loadViewings() }, [])

  const dayViewings = viewings.filter(v => isSameDay(parseISO(v.date), selectedDate))

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReferenceDate(d => subWeeks(d, 1))}
        >
          ‹
        </Button>
        <h2 className="text-base font-semibold text-gray-700">{format(referenceDate, 'MMMM yyyy')}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReferenceDate(d => addWeeks(d, 1))}
        >
          ›
        </Button>
      </div>

      <WeekStrip
        referenceDate={referenceDate}
        selectedDate={selectedDate}
        onDaySelect={setSelectedDate}
      />

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-3">{format(selectedDate, 'EEEE, MMMM d')}</p>
        {dayViewings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No viewings this day</p>
        ) : (
          dayViewings.map(v => <ViewingCard key={v.id} viewing={v} />)
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-6 md:bottom-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 text-2xl shadow-lg flex items-center justify-center z-40"
        aria-label="Add viewing"
      >
        +
      </Button>

      {showForm && (
        <ViewingForm
          defaultDate={format(selectedDate, 'yyyy-MM-dd')}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadViewings() }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify calendar renders**

Open http://localhost:3000/calendar. Should show:
- Month/year header with prev/next arrows
- 7-day strip with today highlighted
- "No viewings this day" placeholder
- Indigo FAB at bottom right

- [ ] **Step 5: Commit**

```bash
git add app/calendar/ components/calendar/
git commit -m "feat: add calendar view with week strip and viewing cards"
```

---

## Task 10: Add Viewing Form (Shadcn Sheet)

**Files:**
- Create: `components/viewings/ViewingForm.tsx`

> Uses Shadcn `Sheet` (slides up from bottom on mobile like a native bottom sheet), `Input`, `Label`, `Textarea`, and `Button`.

- [ ] **Step 1: Build the form modal**

Create `components/viewings/ViewingForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Viewing } from '@/types'

interface ViewingFormProps {
  defaultDate?: string
  viewing?: Viewing
  onClose: () => void
  onSaved: () => void
}

export default function ViewingForm({ defaultDate, viewing, onClose, onSaved }: ViewingFormProps) {
  const [title, setTitle] = useState(viewing?.title ?? '')
  const [date, setDate] = useState(viewing?.date ?? defaultDate ?? '')
  const [startTime, setStartTime] = useState(viewing?.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(viewing?.end_time?.slice(0, 5) ?? '')
  const [address, setAddress] = useState(viewing?.address ?? '')
  const [notes, setNotes] = useState(viewing?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !startTime || !address) {
      setError('Date, start time, and address are required.')
      return
    }
    setSaving(true)
    try {
      const url = viewing ? `/api/viewings/${viewing.id}` : '/api/viewings'
      const method = viewing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          start_time: startTime,
          end_time: endTime || null,
          address,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{viewing ? 'Edit Viewing' : 'Add Viewing'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midtown Complex"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start-time">Start time *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-time">End time (optional)</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, New York, NY"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Bring ID, ask about parking..."
              rows={2}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving…' : viewing ? 'Save Changes' : 'Add Viewing'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verify the form works end-to-end**

1. Open http://localhost:3000/calendar
2. Tap the "+" FAB
3. Sheet slides up from the bottom
4. Fill in date = today, start time = 14:00, address = "123 Test St"
5. Submit — sheet closes and viewing card appears on today's date

- [ ] **Step 3: Commit**

```bash
git add components/viewings/ViewingForm.tsx
git commit -m "feat: add viewing form as Shadcn Sheet"
```

---

## Task 11: Viewings List + Detail Pages

**Files:**
- Create: `app/viewings/page.tsx`
- Create: `app/viewings/[id]/page.tsx`
- Create: `components/viewings/ApartmentCard.tsx`
- Create: `components/viewings/ViewingActions.tsx`
- Create: `components/viewings/AddApartmentButton.tsx`

> Both pages are **server components** that fetch directly. Interactive parts (mark-complete, delete, edit, add-apartment) are extracted into client components. After mutations, client components call `router.refresh()` to re-run the server component tree.

- [ ] **Step 1: Build the mini apartment card**

`ApartmentCard` is server-safe (no `'use client'`).

Create `components/viewings/ApartmentCard.tsx`:
```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Apartment } from '@/types'

export default function ApartmentCard({ apt, viewingId }: { apt: Apartment; viewingId: string }) {
  const stars = apt.rating ? '★'.repeat(apt.rating) + '☆'.repeat(5 - apt.rating) : '—'
  const photoCount = apt.photos?.length ?? 0

  return (
    <Link href={`/viewings/${viewingId}/apartments/${apt.id}`}>
      <div className="border border-gray-200 rounded-xl p-4 mb-3 hover:border-indigo-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">{apt.unit_label}</span>
          <span className="text-amber-400 text-sm">{stars}</span>
        </div>
        <div className="flex gap-3 mt-1 text-sm text-gray-500">
          {apt.monthly_rent && <span>${apt.monthly_rent.toLocaleString()}/mo</span>}
          {apt.bedrooms && <span>{apt.bedrooms}bd · {apt.bathrooms}ba</span>}
          {apt.sqft && <span>{apt.sqft} sqft</span>}
        </div>
        {photoCount > 0 && (
          <div className="mt-2 text-xs text-gray-400">{photoCount} photo{photoCount !== 1 ? 's' : ''}</div>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Build the all-viewings list page (server component)**

Create `app/viewings/page.tsx`:
```tsx
import Link from 'next/link'
import { getViewings, autoCompletePassedViewings } from '@/lib/queries'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ViewingsPage() {
  await autoCompletePassedViewings()
  const viewings = await getViewings()

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">All Viewings</h1>
      {viewings.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No viewings yet — add one from the calendar.</p>
      )}
      {viewings.map(v => (
        <Link key={v.id} href={`/viewings/${v.id}`}>
          <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
            <div>
              <div className="font-semibold text-gray-800">{v.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {format(parseISO(v.date), 'EEE, MMM d')} · {v.start_time.slice(0, 5)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {v.apartment_count} apartment{v.apartment_count !== 1 ? 's' : ''}
              </div>
            </div>
            <Badge variant={v.status === 'completed' ? 'secondary' : 'default'}>
              {v.status === 'completed' ? 'Done' : 'Upcoming'}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Build the ViewingActions client component**

Create `components/viewings/ViewingActions.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ViewingForm from '@/components/viewings/ViewingForm'
import type { Viewing } from '@/types'

export default function ViewingActions({ viewing }: { viewing: Viewing }) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)

  async function markCompleted() {
    await fetch(`/api/viewings/${viewing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this viewing and all its apartments?')) return
    await fetch(`/api/viewings/${viewing.id}`, { method: 'DELETE' })
    router.push('/viewings')
  }

  return (
    <>
      <div className="flex gap-2 mt-3">
        {viewing.status !== 'completed' && (
          <Button size="sm" variant="secondary" onClick={markCompleted}>
            Mark Complete ✓
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setShowEditForm(true)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      {showEditForm && (
        <ViewingForm
          viewing={viewing}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Build the AddApartmentButton client component**

Create `components/viewings/AddApartmentButton.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ApartmentForm from '@/components/apartments/ApartmentForm'

export default function AddApartmentButton({ viewingId }: { viewingId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 mt-2"
        onClick={() => setShowForm(true)}
      >
        + Add Apartment
      </Button>
      {showForm && (
        <ApartmentForm
          viewingId={viewingId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 5: Build the viewing detail page (server component)**

Create `app/viewings/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { getViewing, getApartmentsForViewing } from '@/lib/queries'
import ApartmentCard from '@/components/viewings/ApartmentCard'
import ViewingActions from '@/components/viewings/ViewingActions'
import AddApartmentButton from '@/components/viewings/AddApartmentButton'
import BackButton from '@/components/nav/BackButton'

export const dynamic = 'force-dynamic'

export default async function ViewingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [viewing, apartments] = await Promise.all([
    getViewing(id),
    getApartmentsForViewing(id),
  ])

  if (!viewing) notFound()

  return (
    <div className="py-4">
      <BackButton />

      <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-4">
        <h1 className="text-xl font-bold">{viewing.title}</h1>
        <p className="text-indigo-200 text-sm mt-1">
          {format(parseISO(viewing.date), 'EEE, MMMM d')} · {viewing.start_time.slice(0, 5)}
          {viewing.end_time ? ` – ${viewing.end_time.slice(0, 5)}` : ''}
        </p>
        <p className="text-indigo-100 text-sm mt-1">📍 {viewing.address}</p>
        <ViewingActions viewing={viewing} />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Apartments ({apartments.length})
      </h2>

      {apartments.map(apt => (
        <ApartmentCard key={apt.id} apt={apt} viewingId={id} />
      ))}

      <AddApartmentButton viewingId={id} />
    </div>
  )
}
```

- [ ] **Step 6: Create BackButton client component (used by multiple pages)**

Create `components/nav/BackButton.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  const router = useRouter()
  return (
    <Button variant="ghost" size="sm" className="text-indigo-600 mb-4 -ml-2" onClick={() => router.back()}>
      ‹ Back
    </Button>
  )
}
```

- [ ] **Step 7: Verify end-to-end flow**

1. Open http://localhost:3000/viewings — should list viewings from Task 10
2. Tap a viewing → detail page shows
3. Tap "Mark Complete" → `router.refresh()` re-renders, status changes to Done

- [ ] **Step 8: Commit**

```bash
git add app/viewings/ components/viewings/ components/nav/BackButton.tsx
git commit -m "feat: add viewings list and detail pages as server components"
```

---

## Task 12: Apartment Detail + Photos + Star Rating

**Files:**
- Create: `components/apartments/StarRating.tsx`
- Create: `components/apartments/PhotoGrid.tsx`
- Create: `components/apartments/ApartmentForm.tsx`
- Create: `components/apartments/ApartmentActions.tsx`
- Create: `app/viewings/[id]/apartments/[aptId]/page.tsx`

> The apartment detail page is a **server component**. `ApartmentActions` (edit/delete) and `PhotoGrid` (upload) are client islands.

- [ ] **Step 1: Build the star rating component**

Create `components/apartments/StarRating.tsx`:
```tsx
'use client'
interface StarRatingProps {
  value: number | null
  onChange?: (rating: number) => void
  readOnly?: boolean
}

export default function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'} ${
            value && star <= value ? 'text-amber-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Build the photo grid component**

Create `components/apartments/PhotoGrid.tsx`:
```tsx
'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
  apartmentId: string
}

export default function PhotoGrid({ photos: initialPhotos, apartmentId }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('apartment_id', apartmentId)
      const res = await fetch('/api/photos', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const photo: Photo = await res.json()
      setPhotos(prev => [...prev, photo])
    } catch {
      setUploadError('Upload failed — tap to retry')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photo: Photo) {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' })
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image src={photo.blob_url} alt={photo.caption ?? 'Apartment photo'} fill className="object-cover" />
            <button
              onClick={() => handleDelete(photo)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <span className="text-xs">Uploading…</span>
          ) : (
            <>
              <span className="text-3xl">+</span>
              <span className="text-xs mt-1">Add photo</span>
            </>
          )}
        </button>
      </div>
      {uploadError && <p className="text-destructive text-xs mt-1">{uploadError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
```

- [ ] **Step 3: Build the apartment add/edit form**

Create `components/apartments/ApartmentForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StarRating from './StarRating'
import type { Apartment } from '@/types'

interface ApartmentFormProps {
  viewingId: string
  apartment?: Apartment
  onClose: () => void
  onSaved: () => void
}

export default function ApartmentForm({ viewingId, apartment, onClose, onSaved }: ApartmentFormProps) {
  const [unitLabel, setUnitLabel] = useState(apartment?.unit_label ?? '')
  const [rent, setRent] = useState(apartment?.monthly_rent?.toString() ?? '')
  const [bedrooms, setBedrooms] = useState(apartment?.bedrooms?.toString() ?? '')
  const [bathrooms, setBathrooms] = useState(apartment?.bathrooms?.toString() ?? '')
  const [sqft, setSqft] = useState(apartment?.sqft?.toString() ?? '')
  const [commute, setCommute] = useState(apartment?.commute_note ?? '')
  const [rating, setRating] = useState<number | null>(apartment?.rating ?? null)
  const [notes, setNotes] = useState(apartment?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!unitLabel.trim()) { setError('Unit label is required.'); return }
    setSaving(true)
    try {
      const url = apartment ? `/api/apartments/${apartment.id}` : `/api/viewings/${viewingId}/apartments`
      const method = apartment ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_label: unitLabel,
          monthly_rent: rent ? parseInt(rent) : null,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseFloat(bathrooms) : null,
          sqft: sqft ? parseInt(sqft) : null,
          commute_note: commute || null,
          rating,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{apartment ? 'Edit Apartment' : 'Add Apartment'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="unit-label">Unit label *</Label>
            <Input
              id="unit-label"
              value={unitLabel}
              onChange={e => setUnitLabel(e.target.value)}
              placeholder="e.g. Unit 203, Floor 4"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rent">Monthly rent ($)</Label>
              <Input
                id="rent"
                type="number"
                value={rent}
                onChange={e => setRent(e.target.value)}
                placeholder="2500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sqft">Sqft</Label>
              <Input
                id="sqft"
                type="number"
                value={sqft}
                onChange={e => setSqft(e.target.value)}
                placeholder="850"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                value={bathrooms}
                onChange={e => setBathrooms(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commute">Commute</Label>
            <Input
              id="commute"
              value={commute}
              onChange={e => setCommute(e.target.value)}
              placeholder="15 min to office"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Great natural light, quiet floor..."
              rows={3}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving…' : apartment ? 'Save Changes' : 'Add Apartment'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 4: Build ApartmentActions client component**

Create `components/apartments/ApartmentActions.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ApartmentForm from './ApartmentForm'
import type { Apartment } from '@/types'

export default function ApartmentActions({ apartment, viewingId }: { apartment: Apartment; viewingId: string }) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this apartment and all its photos?')) return
    await fetch(`/api/apartments/${apartment.id}`, { method: 'DELETE' })
    router.back()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowEditForm(true)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      {showEditForm && (
        <ApartmentForm
          viewingId={viewingId}
          apartment={apartment}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); router.refresh() }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 5: Build the apartment detail page (server component)**

Create `app/viewings/[id]/apartments/[aptId]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getApartmentsForViewing } from '@/lib/queries'
import PhotoGrid from '@/components/apartments/PhotoGrid'
import StarRating from '@/components/apartments/StarRating'
import ApartmentActions from '@/components/apartments/ApartmentActions'
import BackButton from '@/components/nav/BackButton'

export const dynamic = 'force-dynamic'

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; aptId: string }>
}) {
  const { id: viewingId, aptId } = await params
  const apartments = await getApartmentsForViewing(viewingId)
  const apt = apartments.find(a => a.id === aptId)

  if (!apt) notFound()

  return (
    <div className="py-4">
      <BackButton />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{apt.unit_label}</h1>
        <ApartmentActions apartment={apt} viewingId={viewingId} />
      </div>

      <div className="mb-5">
        <PhotoGrid photos={apt.photos ?? []} apartmentId={aptId} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {apt.monthly_rent && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rent</div>
            <div className="text-lg font-bold text-indigo-700 mt-0.5">${apt.monthly_rent.toLocaleString()}</div>
          </div>
        )}
        {(apt.bedrooms || apt.bathrooms) && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rooms</div>
            <div className="text-lg font-bold text-gray-800 mt-0.5">{apt.bedrooms}bd · {apt.bathrooms}ba</div>
          </div>
        )}
        {apt.sqft && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Size</div>
            <div className="text-lg font-bold text-gray-800 mt-0.5">{apt.sqft} sqft</div>
          </div>
        )}
        {apt.commute_note && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Commute</div>
            <div className="text-base font-medium text-gray-800 mt-0.5">{apt.commute_note}</div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Rating</div>
        <StarRating value={apt.rating} readOnly />
      </div>

      {apt.notes && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{apt.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verify photos upload on mobile**

1. Open the preview URL on your phone
2. Navigate to a viewing → apartment
3. Tap "+" in the photo grid
4. Your phone's camera should open
5. Take a photo → should appear in the grid within a few seconds

- [ ] **Step 7: Commit**

```bash
git add components/apartments/ app/viewings/
git commit -m "feat: add apartment detail with photo upload — server page, client islands"
```

---

## Task 13: Comparison Table

**Files:**
- Create: `app/compare/page.tsx`
- Create: `components/compare/CompareTable.tsx`

> The compare page is a **server component** that fetches all apartments. `CompareTable` is a client island that owns sort state. This avoids a client-side `useEffect` fetch cycle and means data is available on first render (no loading flash).

- [ ] **Step 1: Build the CompareTable client component**

Create `components/compare/CompareTable.tsx`:
```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApartmentWithViewing } from '@/types'

type SortKey = 'viewing_date' | 'monthly_rent' | 'sqft' | 'rating'
type SortDir = 'asc' | 'desc'

export default function CompareTable({ apartments }: { apartments: ApartmentWithViewing[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...apartments].sort((a, b) => {
    const av = a[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const bv = b[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const maxRating = Math.max(...apartments.map(a => a.rating ?? 0))

  function SortHead({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <TableHead
        onClick={() => handleSort(k)}
        className={`cursor-pointer select-none text-right whitespace-nowrap ${
          active ? 'text-indigo-600' : 'hover:text-gray-600'
        }`}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </TableHead>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Unit</TableHead>
            <TableHead>Viewing</TableHead>
            <SortHead label="Rent" k="monthly_rent" />
            <TableHead className="text-center">Rooms</TableHead>
            <SortHead label="Sqft" k="sqft" />
            <TableHead>Commute</TableHead>
            <SortHead label="Rating" k="rating" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((apt, i) => {
            const isTop = apt.rating === maxRating && maxRating > 0
            return (
              <TableRow
                key={apt.id}
                className={isTop ? 'bg-amber-50' : i % 2 === 0 ? '' : 'bg-gray-50/50'}
              >
                <TableCell className="font-semibold">
                  <Link
                    href={`/viewings/${apt.viewing_id}/apartments/${apt.id}`}
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {apt.unit_label}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-gray-800">{apt.viewing_title}</div>
                  <div className="text-xs text-gray-400">{format(parseISO(apt.viewing_date), 'MMM d')}</div>
                </TableCell>
                <TableCell className="text-right font-semibold text-indigo-700">
                  {apt.monthly_rent ? `$${apt.monthly_rent.toLocaleString()}` : '—'}
                </TableCell>
                <TableCell className="text-center text-gray-600">
                  {apt.bedrooms ? `${apt.bedrooms}bd·${apt.bathrooms}ba` : '—'}
                </TableCell>
                <TableCell className="text-right text-gray-600">{apt.sqft ?? '—'}</TableCell>
                <TableCell className="text-gray-600">{apt.commute_note ?? '—'}</TableCell>
                <TableCell className="text-right">
                  {apt.rating ? (
                    <span className="text-amber-400">
                      {'★'.repeat(apt.rating)}{'☆'.repeat(5 - apt.rating)}
                    </span>
                  ) : '—'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Build the compare server page**

Create `app/compare/page.tsx`:
```tsx
import { getAllApartmentsWithViewings } from '@/lib/queries'
import CompareTable from '@/components/compare/CompareTable'

export const dynamic = 'force-dynamic'

export default async function ComparePage() {
  const apartments = await getAllApartmentsWithViewings()

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Compare Apartments</h1>

      {apartments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No apartments yet — complete a viewing to see comparisons.
        </p>
      ) : (
        <CompareTable apartments={apartments} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify comparison table**

1. Open http://localhost:3000/compare
2. Table renders immediately (no loading spinner — data comes from the server)
3. Click "Rent" header → sorts by rent ascending
4. Click "Rent" again → descending
5. Top-rated apartment row has amber background

- [ ] **Step 4: Commit**

```bash
git add app/compare/ components/compare/
git commit -m "feat: add comparison table — server page with client sort island"
```

---

## Task 14: Deploy to Vercel

**Files:**
- No file changes — deployment configuration

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/apartment-hunter.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

```bash
npx vercel --prod
```
Or go to vercel.com → New Project → import the GitHub repo.

- [ ] **Step 3: Set environment variables**

In the Vercel dashboard → Project → Settings → Environment Variables, copy all variables from your local `.env.local`:
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NO_SSL`, `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`
- `BLOB_READ_WRITE_TOKEN`

- [ ] **Step 4: Configure Vercel Blob storage**

In the Vercel dashboard → Storage → Connect to Project → select your Blob store (or create one: Storage → Create → Blob).

- [ ] **Step 5: Trigger a production deployment**

```bash
git commit --allow-empty -m "chore: trigger prod deploy"
git push
```

Expected: Vercel build completes and provides a `.vercel.app` URL.

- [ ] **Step 6: Smoke test on phone**

Open the Vercel URL on your phone:
1. Add a viewing via the FAB
2. Navigate into it, add an apartment
3. Upload a photo from your camera
4. Open the same URL on your laptop → confirm data appears
5. Navigate to /compare → apartment shows in table with no loading flash

- [ ] **Step 7: Run all tests to confirm green**

```bash
npx jest --no-coverage
```
Expected: All tests pass.

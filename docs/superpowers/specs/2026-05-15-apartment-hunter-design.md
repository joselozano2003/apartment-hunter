# Apartment Hunter — Design Spec

**Date:** 2026-05-15  
**Status:** Approved  

---

## Context

A personal apartment hunting tool for one user, needed urgently for viewings starting next week. The primary usage is mobile (on-site during viewings), with a secondary desktop use case for comparing options afterward. Built to be used intensively for 1–2 weeks then referenced for a final decision.

---

## Architecture

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, RSC + API routes, excellent mobile web performance |
| Database | Vercel Postgres (Neon) | One Vercel account for everything, free tier sufficient |
| File storage | Vercel Blob | Photos stored as blobs, referenced by URL in DB |
| Deployment | Vercel | One `git push` to deploy; preview URLs for mobile testing |
| Auth | None | Private URL; single user only |

---

## Data Model

### `viewings`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
title       text NOT NULL
date        date NOT NULL
start_time  time NOT NULL
end_time    time
address     text NOT NULL
notes       text
status      text NOT NULL DEFAULT 'upcoming'  -- 'upcoming' | 'completed'; auto-set to 'completed' when viewing date has passed, can also be toggled manually from Viewing Detail
created_at  timestamptz DEFAULT now()
```

### `apartments`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
viewing_id    uuid NOT NULL REFERENCES viewings(id) ON DELETE CASCADE
unit_label    text NOT NULL      -- e.g. "Unit 203", "Floor 4"
monthly_rent  integer            -- in dollars
bedrooms      integer
bathrooms     numeric(3,1)       -- supports 1.5 baths
sqft          integer
commute_note  text               -- free text: "15 min to office"
rating        integer CHECK (rating BETWEEN 1 AND 5)
notes         text
created_at    timestamptz DEFAULT now()
```

### `photos`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
apartment_id  uuid NOT NULL REFERENCES apartments(id) ON DELETE CASCADE
blob_url      text NOT NULL
caption       text
created_at    timestamptz DEFAULT now()
```

---

## Screens & Navigation

Three-tab bottom navigation (mobile) / top navigation (desktop):

### Tab 1 — Calendar (default)

- **Default view:** current week, 7-day strip at top
- Week navigation: prev/next arrows
- Viewing cards below the strip, grouped by day
- Card shows: title, time, apartment count
- Visual states: purple = upcoming, green = completed
- Floating action button (FAB): opens Add Viewing form

**Add Viewing form (modal/sheet):**
- Title (optional; defaults to address if left blank)
- Date (date picker)
- Start time
- Address
- Notes (textarea)

### Tab 2 — Viewings

- Chronological list of all viewings (past + upcoming)
- Each row: title, date, apartment count, status badge
- Tap → Viewing Detail

**Viewing Detail:**
- Header: title, date/time, address
- List of apartment cards (unit label, rent, rating, photo thumbnails)
- "Add Apartment" button at bottom

**Apartment Detail (add/edit form + display):**
- Photo grid (3-column), "+" cell opens camera/gallery picker
- Stats grid: rent, size (beds/baths), sqft, commute, rating (tap stars)
- Notes textarea
- Auto-saves on field blur (no explicit save button needed for speed on mobile)

### Tab 3 — Compare

- Sortable table, one row per apartment across all viewings
- Columns: Unit, Viewing Date, Rent, Rooms, Sqft, Commute, Rating
- Click any column header to sort ascending/descending
- Highest-rated row highlighted
- Desktop: table has full breathing room; columns do not truncate

---

## Mobile vs Desktop

- **Same URL, same codebase** — responsive CSS handles layout
- Mobile: bottom tab bar, full-width cards, large touch targets, photo upload via `<input type="file" accept="image/*" capture="environment">`
- Desktop: side nav or top nav, wider calendar grid, comparison table uses full viewport width
- No native app, no App Store — accessed via browser on both devices

---

## Photo Upload Flow

1. User taps "+" in photo grid on Apartment Detail
2. Browser opens camera (mobile) or file picker (desktop) via `<input capture="environment">`
3. Selected image uploaded via `POST /api/photos` → streamed directly to Vercel Blob
4. Blob URL returned → saved to `photos` table → photo appears in grid immediately
5. Images are stored as-is (no server-side resize); Vercel Blob CDN handles delivery

---

## API Routes

```
GET    /api/viewings               list all viewings
POST   /api/viewings               create viewing
PUT    /api/viewings/[id]          update viewing
DELETE /api/viewings/[id]          delete viewing + cascade

GET    /api/viewings/[id]/apartments        list apartments for a viewing
POST   /api/viewings/[id]/apartments        create apartment
PUT    /api/apartments/[id]                 update apartment
DELETE /api/apartments/[id]                 delete apartment + photos

POST   /api/photos                 upload photo → Vercel Blob, save URL
DELETE /api/photos/[id]            delete from Blob + DB

GET    /api/compare                all apartments joined with viewing data (for table)
```

---

## Error Handling

- Photo upload failure: show inline error on the grid cell, allow retry
- Network offline: form fields keep their values; show a banner "You're offline — changes will save when reconnected" (no offline sync for v1 — just UX messaging)
- Invalid form: client-side validation before submit (required fields highlighted)

---

## Verification Plan

1. **Deploy to Vercel** — visit the preview URL on phone and laptop
2. **Add a viewing** — create one via the calendar FAB, confirm it appears on the week strip
3. **Add apartments** — add two units under the same viewing, fill all fields
4. **Upload photos** — take a photo on phone, confirm it appears in the grid
5. **Complete a viewing** — mark it done, confirm card turns green on calendar
6. **Compare tab** — confirm both apartments appear in the table, sort by rating and rent
7. **Cross-device** — add apartment on phone, open laptop, confirm data is there

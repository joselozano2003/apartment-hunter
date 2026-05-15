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

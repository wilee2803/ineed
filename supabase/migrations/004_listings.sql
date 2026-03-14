-- ============================================================
-- MIGRATION 004 · Listings
-- Kern-Tabelle für Immobilien-Inserate mit PostGIS Geo-Index
-- ============================================================

create type listing_type    as enum ('rent', 'sale');
create type listing_status  as enum ('draft', 'pending_review', 'active', 'paused', 'sold', 'rented', 'rejected');
create type smart_lock_type as enum ('nuki', 'salto', 'tedee', 'other');

create table listings (
  id                  uuid            primary key default uuid_generate_v4(),
  lister_id           uuid            not null references profiles(id) on delete cascade,
  market_id           uuid            not null references markets(id),

  -- Klassifizierung
  listing_type        listing_type    not null,
  status              listing_status  not null default 'draft',
  rejected_reason     text,

  -- Inhalt
  title               text            not null,
  description         text,

  -- Preis
  price               numeric         not null check (price > 0),
  price_currency      text            not null default 'EUR',

  -- Objekt-Details
  size_sqm            numeric,
  rooms               numeric,
  bathrooms           integer         default 1,
  floor               integer,
  total_floors        integer,
  year_built          integer,
  available_from      date,

  -- Ausstattung (JSONB für Flexibilität)
  amenities           jsonb           not null default '{}',
  -- Beispiel: {"kitchen": true, "balcony": true, "parking": false, "elevator": true}

  -- Adresse
  address_street      text,
  address_city        text,
  address_zip         text,
  address_country     text            not null default 'AT',

  -- Geoposition (PostGIS) — kritisch für Radius-Suche
  location            geography(point, 4326) not null,

  -- IoT / Besichtigung
  smart_lock_id       text,
  smart_lock_type     smart_lock_type,
  smart_lock_meta     jsonb           default '{}',  -- API-Keys etc. (verschlüsselt via Vault)
  has_live_camera     boolean         not null default false,
  camera_stream_url   text,

  -- Admin-Review
  reviewed_by         uuid            references profiles(id),
  reviewed_at         timestamptz,

  -- Stats (denormalisiert für Performance)
  view_count          integer         not null default 0,
  booking_count       integer         not null default 0,

  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────

-- Geo-Index: GIST für Radius-Suche (ST_DWithin)
create index listings_location_gist
  on listings using gist (location);

-- Compound-Index für häufigste Suche: aktive Listings eines Marktes
create index listings_market_status_idx
  on listings (market_id, status)
  where status = 'active';

-- Index für Lister-Dashboard
create index listings_lister_idx
  on listings (lister_id, status);

-- Trigram-Index für Adresssuche
create index listings_address_trgm_idx
  on listings using gin (
    (address_street || ' ' || coalesce(address_city, '')) gin_trgm_ops
  );

-- updated_at Trigger
create trigger listings_updated_at
  before update on listings
  for each row execute procedure set_updated_at();

-- ── Listing Images ───────────────────────────────────────────
create table listing_images (
  id          uuid        primary key default uuid_generate_v4(),
  listing_id  uuid        not null references listings(id) on delete cascade,
  url         text        not null,
  storage_path text,                      -- Supabase Storage Pfad
  is_360      boolean     not null default false,
  is_cover    boolean     not null default false,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index listing_images_listing_idx on listing_images (listing_id, sort_order);

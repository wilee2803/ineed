-- ============================================================
-- MIGRATION 011 · Geo-Funktionen
-- Radius-Suche und Listing-Abfragen mit PostGIS
-- ============================================================

-- ── Haupt-Suchfunktion ──────────────────────────────────────
-- Gibt aktive Listings im Radius zurück, sortiert nach Entfernung
-- Aufruf: select * from search_listings(48.2082, 16.3738, 2000, 'rent')

create or replace function search_listings(
  lat           float8,
  lng           float8,
  radius_meters float8  default 2000,
  p_type        text    default null,   -- 'rent' | 'sale' | null = beide
  price_min     numeric default null,
  price_max     numeric default null,
  rooms_min     numeric default null,
  size_min      numeric default null,
  p_limit       integer default 50,
  p_offset      integer default 0
)
returns table (
  id              uuid,
  title           text,
  listing_type    listing_type,
  price           numeric,
  price_currency  text,
  size_sqm        numeric,
  rooms           numeric,
  address_street  text,
  address_city    text,
  address_zip     text,
  smart_lock_type smart_lock_type,
  has_live_camera boolean,
  cover_image_url text,
  distance_m      float8,
  lat             float8,
  lng             float8
)
language sql stable security definer as $$
  select
    l.id,
    l.title,
    l.listing_type,
    l.price,
    l.price_currency,
    l.size_sqm,
    l.rooms,
    l.address_street,
    l.address_city,
    l.address_zip,
    l.smart_lock_type,
    l.has_live_camera,
    (
      select li.url from listing_images li
      where li.listing_id = l.id and li.is_cover = true
      order by li.sort_order limit 1
    ) as cover_image_url,
    st_distance(
      l.location::geography,
      st_makepoint(lng, lat)::geography
    ) as distance_m,
    st_y(l.location::geometry) as lat,
    st_x(l.location::geometry) as lng
  from listings l
  where
    l.status = 'active'
    and st_dwithin(
      l.location::geography,
      st_makepoint(lng, lat)::geography,
      radius_meters
    )
    and (p_type is null or l.listing_type = p_type::listing_type)
    and (price_min is null or l.price >= price_min)
    and (price_max is null or l.price <= price_max)
    and (rooms_min is null or l.rooms >= rooms_min)
    and (size_min  is null or l.size_sqm >= size_min)
  order by distance_m asc
  limit p_limit
  offset p_offset;
$$;

-- ── Listing-Count für Radius (für UI-Badge) ─────────────────
create or replace function count_listings_in_radius(
  lat           float8,
  lng           float8,
  radius_meters float8  default 2000,
  p_type        text    default null
)
returns integer
language sql stable security definer as $$
  select count(*)::integer
  from listings l
  where
    l.status = 'active'
    and st_dwithin(
      l.location::geography,
      st_makepoint(lng, lat)::geography,
      radius_meters
    )
    and (p_type is null or l.listing_type = p_type::listing_type);
$$;

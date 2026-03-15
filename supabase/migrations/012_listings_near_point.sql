-- ============================================================
-- MIGRATION 012 · RPC: listings_near_point
-- Gibt aktive Listings im Umkreis zurück (PostGIS ST_DWithin)
-- ============================================================

create or replace function listings_near_point(
  lat        double precision,
  lng        double precision,
  radius_km  double precision default 5
)
returns table (
  id              uuid,
  title           text,
  listing_type    text,
  price           numeric,
  address_street  text,
  address_city    text,
  rooms           numeric,
  size_sqm        numeric,
  floor           integer,
  available_from  date,
  lat             double precision,
  lng             double precision,
  distance_m      double precision
)
language sql stable as $$
  select
    l.id,
    l.title,
    l.listing_type::text,
    l.price,
    l.address_street,
    l.address_city,
    l.rooms,
    l.size_sqm,
    l.floor,
    l.available_from,
    st_y(l.location::geometry)  as lat,
    st_x(l.location::geometry)  as lng,
    st_distance(l.location, st_point(lng, lat)::geography) as distance_m
  from listings l
  where
    l.status = 'active'
    and st_dwithin(
      l.location,
      st_point(lng, lat)::geography,
      radius_km * 1000
    )
  order by distance_m asc
  limit 100;
$$;

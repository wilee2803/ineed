-- ============================================================
-- MIGRATION 003 · Markets
-- Multi-City Skalierung: jede Stadt = eine Zeile
-- ============================================================

create table markets (
  id              uuid        primary key default uuid_generate_v4(),
  name            text        not null,              -- 'Wien', 'Berlin'
  slug            text        not null unique,        -- 'wien', 'berlin'
  country_code    text        not null,              -- 'AT', 'DE', 'CH'
  currency        text        not null default 'EUR',
  timezone        text        not null default 'Europe/Vienna',
  is_active       boolean     not null default false, -- Pilot-Flag
  launched_at     timestamptz,
  -- Standard-Kaution für diesen Markt
  default_deposit numeric     not null default 300,
  created_at      timestamptz not null default now()
);

create unique index markets_slug_idx on markets (slug);

-- ============================================================
-- MIGRATION 008 · Services Marketplace
-- Buchbare Zusatzservices (Grundbuchauszug, Schufa, etc.)
-- ============================================================

create type service_order_status as enum ('pending', 'processing', 'completed', 'failed', 'refunded');

create table services (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  icon        text,                     -- Emoji oder Icon-Name
  price       numeric     not null check (price >= 0),
  currency    text        not null default 'EUR',
  provider    text,                     -- Name des Drittanbieters
  provider_api_key text,               -- Verschlüsselt via Vault
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create table service_orders (
  id                          uuid                  primary key default uuid_generate_v4(),
  service_id                  uuid                  not null references services(id),
  user_id                     uuid                  not null references profiles(id),
  listing_id                  uuid                  references listings(id),

  status                      service_order_status  not null default 'pending',

  -- Payment
  stripe_payment_intent_id    text                  unique,
  amount_paid                 numeric,
  currency                    text                  default 'EUR',

  -- Ergebnis
  result_url                  text,                 -- Link zum Dokument / Ergebnis
  result_data                 jsonb,

  created_at                  timestamptz           not null default now(),
  updated_at                  timestamptz           not null default now()
);

create index service_orders_user_idx on service_orders (user_id, created_at);

create trigger service_orders_updated_at
  before update on service_orders
  for each row execute procedure set_updated_at();

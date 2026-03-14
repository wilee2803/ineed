-- ============================================================
-- MIGRATION 006 · Closings & Provisions
-- Abschlüsse und automatische Provisions-Berechnung
-- Provision: 1% Kaufpreis ODER 3× Monatsmiete
-- ============================================================

create type closing_type    as enum ('rent', 'sale');
create type closing_status  as enum ('pending', 'paid', 'disputed', 'refunded');

create table closings (
  id                          uuid            primary key default uuid_generate_v4(),
  listing_id                  uuid            not null references listings(id),
  seeker_id                   uuid            not null references profiles(id),
  lister_id                   uuid            not null references profiles(id),
  market_id                   uuid            not null references markets(id),

  closing_type                closing_type    not null,

  -- Finanzen
  closing_price               numeric         not null check (closing_price > 0),
  -- Bei Miete: Monatsmiete · Bei Kauf: Kaufpreis
  price_currency              text            not null default 'EUR',

  commission_rate             numeric         not null,
  -- Miete: 3.0 (= 3× Monatsmiete) · Kauf: 0.01 (= 1%)
  commission_amount           numeric         not null,
  -- Automatisch berechnet: closing_price * commission_rate

  status                      closing_status  not null default 'pending',

  -- Stripe
  stripe_payment_intent_id    text            unique,
  paid_at                     timestamptz,

  -- Kontext
  booking_id                  uuid            references bookings(id),
  notes                       text,
  created_at                  timestamptz     not null default now(),
  updated_at                  timestamptz     not null default now()
);

create index closings_lister_idx  on closings (lister_id, status);
create index closings_seeker_idx  on closings (seeker_id);
create index closings_market_idx  on closings (market_id, created_at);

-- Provisions-Betrag automatisch berechnen
create or replace function calculate_commission()
returns trigger language plpgsql as $$
begin
  if new.closing_type = 'sale' then
    new.commission_rate   := 0.01;
    new.commission_amount := round(new.closing_price * 0.01, 2);
  elsif new.closing_type = 'rent' then
    new.commission_rate   := 3.0;
    new.commission_amount := round(new.closing_price * 3.0, 2);
  end if;
  return new;
end;
$$;

create trigger closings_calculate_commission
  before insert on closings
  for each row execute procedure calculate_commission();

create trigger closings_updated_at
  before update on closings
  for each row execute procedure set_updated_at();

-- Listing-Status bei Abschluss aktualisieren
create or replace function update_listing_on_closing()
returns trigger language plpgsql as $$
begin
  if new.status = 'paid' then
    update listings
    set status = case when new.closing_type = 'sale' then 'sold'::listing_status
                      else 'rented'::listing_status end
    where id = new.listing_id;
  end if;
  return new;
end;
$$;

create trigger closings_update_listing
  after update on closings
  for each row execute procedure update_listing_on_closing();

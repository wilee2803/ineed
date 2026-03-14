-- ============================================================
-- MIGRATION 005 · Viewing Slots & Bookings
-- Zeitslots, Buchungen, Smart-Lock-Zugang, Kautions-Verwaltung
-- ============================================================

create type slot_type     as enum ('physical', 'live_camera', 'self_service');
create type booking_status as enum (
  'pending', 'confirmed', 'active',
  'completed', 'cancelled', 'disputed', 'expired'
);

-- ── Viewing Slots (vom Lister definiert) ────────────────────
create table viewing_slots (
  id          uuid        primary key default uuid_generate_v4(),
  listing_id  uuid        not null references listings(id) on delete cascade,
  slot_type   slot_type   not null default 'self_service',
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  is_booked   boolean     not null default false,
  created_at  timestamptz not null default now(),

  constraint slot_times_valid check (end_time > start_time)
);

create index viewing_slots_listing_idx
  on viewing_slots (listing_id, start_time)
  where is_booked = false;

-- ── Bookings ─────────────────────────────────────────────────
create table bookings (
  id                          uuid            primary key default uuid_generate_v4(),
  slot_id                     uuid            not null references viewing_slots(id),
  seeker_id                   uuid            not null references profiles(id),
  listing_id                  uuid            not null references listings(id),
  status                      booking_status  not null default 'pending',

  -- Stripe Payment
  stripe_payment_intent_id    text            unique,
  deposit_amount              numeric         not null default 0,
  deposit_currency            text            not null default 'EUR',
  deposit_captured            boolean         not null default false,
  deposit_captured_at         timestamptz,
  deposit_released_at         timestamptz,
  deposit_release_reason      text,

  -- Smart Lock Zugang
  access_token                text,             -- temporärer Zugangs-Token
  access_token_expires_at     timestamptz,
  lock_opened_at              timestamptz,
  lock_closed_at              timestamptz,

  -- Nachbereitung
  seeker_rating               integer         check (seeker_rating between 1 and 5),
  seeker_feedback             text,
  damage_reported             boolean         not null default false,
  damage_description          text,

  notes                       text,
  created_at                  timestamptz     not null default now(),
  updated_at                  timestamptz     not null default now()
);

create index bookings_seeker_idx   on bookings (seeker_id, status);
create index bookings_listing_idx  on bookings (listing_id, status);
create index bookings_slot_idx     on bookings (slot_id);

create trigger bookings_updated_at
  before update on bookings
  for each row execute procedure set_updated_at();

-- Slot als gebucht markieren wenn Buchung bestätigt wird
create or replace function mark_slot_booked()
returns trigger language plpgsql as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' then
    update viewing_slots set is_booked = true where id = new.slot_id;
  end if;
  if new.status in ('cancelled', 'expired') and old.status = 'confirmed' then
    update viewing_slots set is_booked = false where id = new.slot_id;
  end if;
  return new;
end;
$$;

create trigger bookings_mark_slot
  after update on bookings
  for each row execute procedure mark_slot_booked();

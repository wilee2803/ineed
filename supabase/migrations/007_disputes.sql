-- ============================================================
-- MIGRATION 007 · Disputes
-- Schadensmeldungen und Admin-Entscheidungen
-- ============================================================

create type dispute_status   as enum ('open', 'under_review', 'resolved_lister', 'resolved_seeker', 'closed');
create type dispute_decision as enum ('capture_full', 'capture_partial', 'release', 'no_action');

create table disputes (
  id                  uuid            primary key default uuid_generate_v4(),
  booking_id          uuid            not null references bookings(id),
  reported_by         uuid            not null references profiles(id),
  against_user_id     uuid            not null references profiles(id),

  status              dispute_status  not null default 'open',

  -- Schadensbeschreibung
  title               text            not null,
  description         text            not null,
  damage_amount       numeric,          -- Geforderter Betrag

  -- Admin-Entscheidung
  admin_id            uuid            references profiles(id),
  decision            dispute_decision,
  decision_amount     numeric,          -- Betrag der eingezogen wird
  decision_notes      text,
  decided_at          timestamptz,

  -- Stripe
  stripe_payment_intent_id text,

  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

-- Beweise (Fotos, Videos, Dokumente)
create table dispute_evidence (
  id          uuid        primary key default uuid_generate_v4(),
  dispute_id  uuid        not null references disputes(id) on delete cascade,
  uploaded_by uuid        not null references profiles(id),
  type        text        not null,     -- 'photo', 'video', 'document', 'lock_log', 'camera_log'
  url         text        not null,
  storage_path text,
  description text,
  created_at  timestamptz not null default now()
);

create index disputes_booking_idx on disputes (booking_id);
create index disputes_status_idx  on disputes (status, created_at);

create trigger disputes_updated_at
  before update on disputes
  for each row execute procedure set_updated_at();

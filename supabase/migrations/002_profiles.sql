-- ============================================================
-- MIGRATION 002 · Profiles
-- Erweitert Supabase Auth mit Rollen und KYC-Status
-- ============================================================

create type user_role    as enum ('seeker', 'lister', 'admin');
create type kyc_status   as enum ('pending', 'in_review', 'verified', 'rejected');

create table profiles (
  id                        uuid        primary key references auth.users on delete cascade,
  role                      user_role   not null default 'seeker',
  full_name                 text        not null,
  phone                     text,
  avatar_url                text,

  -- KYC
  kyc_status                kyc_status  not null default 'pending',
  kyc_submitted_at          timestamptz,
  kyc_reviewed_at           timestamptz,
  kyc_reviewer_id           uuid        references profiles(id),
  kyc_rejection_reason      text,
  stripe_identity_session   text,         -- Stripe Identity session ID

  -- Stripe
  stripe_customer_id        text        unique,
  stripe_payment_method_id  text,         -- hinterlegte Kreditkarte

  -- Meta
  is_active                 boolean     not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Automatisch Profil anlegen wenn User sich registriert
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- updated_at automatisch setzen
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

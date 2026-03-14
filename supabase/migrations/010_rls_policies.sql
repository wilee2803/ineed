-- ============================================================
-- MIGRATION 010 · Row Level Security (RLS)
-- Jede Tabelle ist standardmäßig gesperrt.
-- Nur explizit erlaubte Operationen sind möglich.
-- ============================================================

-- ── Hilfsfunktionen ─────────────────────────────────────────

-- Aktuelle User-ID
create or replace function auth_uid()
returns uuid language sql stable as $$
  select auth.uid()
$$;

-- Aktuelle User-Rolle
create or replace function auth_role()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- Prüft ob aktueller User Admin ist
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- Prüft ob KYC verifiziert
create or replace function is_kyc_verified()
returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and kyc_status = 'verified')
$$;


-- ── PROFILES ────────────────────────────────────────────────
alter table profiles enable row level security;

create policy "profiles: eigenes Profil lesen"
  on profiles for select
  using (id = auth_uid() or is_admin());

create policy "profiles: eigenes Profil aktualisieren"
  on profiles for update
  using (id = auth_uid())
  with check (
    id = auth_uid()
    and role = (select role from profiles where id = auth_uid())  -- Rolle nicht selbst änderbar
  );

create policy "profiles: Admin kann alle lesen"
  on profiles for select
  using (is_admin());

create policy "profiles: Admin kann aktualisieren"
  on profiles for update
  using (is_admin());


-- ── MARKETS ─────────────────────────────────────────────────
alter table markets enable row level security;

create policy "markets: alle können aktive Märkte lesen"
  on markets for select
  using (is_active = true or is_admin());

create policy "markets: nur Admin kann verwalten"
  on markets for all
  using (is_admin());


-- ── LISTINGS ────────────────────────────────────────────────
alter table listings enable row level security;

create policy "listings: aktive öffentlich lesbar"
  on listings for select
  using (status = 'active' or lister_id = auth_uid() or is_admin());

create policy "listings: Lister kann eigene erstellen"
  on listings for insert
  with check (
    lister_id = auth_uid()
    and (select role from profiles where id = auth_uid()) = 'lister'
  );

create policy "listings: Lister kann eigene aktualisieren"
  on listings for update
  using (lister_id = auth_uid() or is_admin())
  with check (lister_id = auth_uid() or is_admin());

create policy "listings: Admin kann alles"
  on listings for all
  using (is_admin());


-- ── LISTING IMAGES ───────────────────────────────────────────
alter table listing_images enable row level security;

create policy "listing_images: mit Listing lesbar"
  on listing_images for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_id
      and (l.status = 'active' or l.lister_id = auth_uid() or is_admin())
    )
  );

create policy "listing_images: Lister kann hochladen"
  on listing_images for insert
  with check (
    exists (
      select 1 from listings l
      where l.id = listing_id and l.lister_id = auth_uid()
    )
  );

create policy "listing_images: Lister kann löschen"
  on listing_images for delete
  using (
    exists (
      select 1 from listings l
      where l.id = listing_id and l.lister_id = auth_uid()
    )
    or is_admin()
  );


-- ── VIEWING SLOTS ────────────────────────────────────────────
alter table viewing_slots enable row level security;

create policy "viewing_slots: mit aktivem Listing lesbar"
  on viewing_slots for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_id
      and (l.status = 'active' or l.lister_id = auth_uid() or is_admin())
    )
  );

create policy "viewing_slots: Lister kann eigene verwalten"
  on viewing_slots for all
  using (
    exists (
      select 1 from listings l
      where l.id = listing_id and l.lister_id = auth_uid()
    )
    or is_admin()
  );


-- ── BOOKINGS ─────────────────────────────────────────────────
alter table bookings enable row level security;

create policy "bookings: Seeker sieht eigene"
  on bookings for select
  using (seeker_id = auth_uid() or is_admin()
    or exists (
      select 1 from listings l
      where l.id = listing_id and l.lister_id = auth_uid()
    )
  );

create policy "bookings: Seeker kann buchen (nur wenn KYC verifiziert)"
  on bookings for insert
  with check (
    seeker_id = auth_uid()
    and is_kyc_verified()
  );

create policy "bookings: Seeker kann stornieren"
  on bookings for update
  using (seeker_id = auth_uid() or is_admin())
  with check (seeker_id = auth_uid() or is_admin());


-- ── CLOSINGS ─────────────────────────────────────────────────
alter table closings enable row level security;

create policy "closings: Beteiligte können lesen"
  on closings for select
  using (seeker_id = auth_uid() or lister_id = auth_uid() or is_admin());

create policy "closings: nur Admin kann erstellen"
  on closings for insert
  with check (is_admin());

create policy "closings: nur Admin kann aktualisieren"
  on closings for update
  using (is_admin());


-- ── DISPUTES ─────────────────────────────────────────────────
alter table disputes enable row level security;

create policy "disputes: Beteiligte können lesen"
  on disputes for select
  using (reported_by = auth_uid() or against_user_id = auth_uid() or is_admin());

create policy "disputes: Beteiligte können erstellen"
  on disputes for insert
  with check (reported_by = auth_uid());

create policy "disputes: nur Admin kann entscheiden"
  on disputes for update
  using (is_admin());


-- ── SERVICES ─────────────────────────────────────────────────
alter table services enable row level security;

create policy "services: aktive für alle lesbar"
  on services for select
  using (is_active = true or is_admin());

create policy "services: nur Admin kann verwalten"
  on services for all
  using (is_admin());


-- ── SERVICE ORDERS ───────────────────────────────────────────
alter table service_orders enable row level security;

create policy "service_orders: eigene lesbar"
  on service_orders for select
  using (user_id = auth_uid() or is_admin());

create policy "service_orders: eingeloggte User können bestellen"
  on service_orders for insert
  with check (user_id = auth_uid());


-- ── AUDIT LOGS ───────────────────────────────────────────────
alter table audit_logs enable row level security;

create policy "audit_logs: nur Admin kann lesen"
  on audit_logs for select
  using (is_admin());

-- INSERT nur via security definer Funktion (log_audit)
-- Direkte INSERTs von Clients sind nicht erlaubt

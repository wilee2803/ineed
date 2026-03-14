# Supabase Setup — Schritt für Schritt

## Voraussetzungen
- Supabase Account unter https://supabase.com
- Projekt angelegt (Free-Tier reicht für Pilot)

---

## 1 · Supabase Projekt anlegen

1. **https://supabase.com/dashboard** öffnen
2. **New Project** klicken
3. Einstellungen:
   - **Name:** `ineed-pilot`
   - **Database Password:** sicheres Passwort wählen & speichern
   - **Region:** `eu-central-1` (Frankfurt) — nächste Region zu Wien
4. Projekt erstellen — dauert ~2 Minuten

---

## 2 · PostGIS aktivieren

Im Supabase Dashboard:

1. **Database → Extensions** öffnen
2. Nach `postgis` suchen → **Enable** klicken
3. Nach `uuid-ossp` suchen → **Enable** klicken
4. Nach `pg_trgm` suchen → **Enable** klicken

---

## 3 · Migrations ausführen

Im Supabase Dashboard → **SQL Editor** → jeweils **New Query**, einfügen und ausführen:

| Reihenfolge | Datei | Inhalt |
|---|---|---|
| 1 | `migrations/001_extensions.sql` | Extensions |
| 2 | `migrations/002_profiles.sql` | User-Profile & Auth-Trigger |
| 3 | `migrations/003_markets.sql` | Märkte / Städte |
| 4 | `migrations/004_listings.sql` | Listings + Geo-Index |
| 5 | `migrations/005_bookings.sql` | Zeitslots & Buchungen |
| 6 | `migrations/006_closings.sql` | Abschlüsse & Provision |
| 7 | `migrations/007_disputes.sql` | Disputes & Beweise |
| 8 | `migrations/008_services.sql` | Services Marketplace |
| 9 | `migrations/009_audit_logs.sql` | Audit-Log (unveränderlich) |
| 10 | `migrations/010_rls_policies.sql` | Row Level Security |
| 11 | `migrations/011_geo_functions.sql` | Geo-Suchfunktionen |

Danach Seed-Daten einspielen:

| Datei | Inhalt |
|---|---|
| `seed/001_seed.sql` | Märkte (Wien aktiv) + Services |

---

## 4 · Admin-User anlegen

Nach Ausführung der Migrations im SQL Editor:

```sql
-- 1. User über Auth registrieren (Dashboard → Authentication → Users → Add User)
--    E-Mail: admin@ineed.app
--    Passwort: sicheres Passwort

-- 2. Dann Rolle auf 'admin' setzen (USER-ID anpassen):
update profiles
set role = 'admin'
where id = 'HIER-DIE-USER-ID-EINFÜGEN';
```

---

## 5 · Storage Buckets anlegen

Dashboard → **Storage → New Bucket:**

| Bucket Name | Public | Beschreibung |
|---|---|---|
| `listing-images` | ✅ Public | Listing-Fotos |
| `listing-360` | ✅ Public | 360°-Touren |
| `kyc-documents` | ❌ Private | Ausweise (nur via Service Role) |
| `dispute-evidence` | ❌ Private | Beweisfotos / -videos |

---

## 6 · API Keys holen

Dashboard → **Settings → API:**

```
Project URL:      https://DEIN-PROJEKT.supabase.co
anon public:      eyJ...   → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role:     eyJ...   → SUPABASE_SERVICE_ROLE_KEY (GEHEIM!)
```

In `.env.local` eintragen (aus `.env.example` kopieren).

---

## 7 · Geo-Suche testen

Im SQL Editor testen:

```sql
-- Alle aktiven Listings im 5km-Radius um Wien Innenstadt
select * from search_listings(
  lat           := 48.2082,
  lng           := 16.3738,
  radius_meters := 5000,
  p_type        := 'rent'
);
```

---

## 8 · Realtime aktivieren

Dashboard → **Database → Replication:**

Folgende Tabellen für Realtime aktivieren:
- `bookings` (für Live-Status bei Besichtigungen)
- `listings` (für Karten-Updates)

---

## Struktur nach Setup

```
Tabellen:
  profiles          · User-Profile mit KYC
  markets           · Wien aktiv, weitere vorbereitet
  listings          · Inserate mit PostGIS-Geo-Index
  listing_images    · Fotos und 360°-Touren
  viewing_slots     · Verfügbare Zeitslots
  bookings          · Buchungen mit Lock-Log
  closings          · Abschlüsse (Provision auto-berechnet)
  disputes          · Schadensmeldungen
  dispute_evidence  · Beweise
  services          · 5 Services vorgeladen
  service_orders    · Bestellungen
  audit_logs        · Unveränderliches Protokoll

Funktionen:
  search_listings()           · Radius-Suche (PostGIS)
  count_listings_in_radius()  · Count für UI-Badge
  log_audit()                 · Audit-Eintrag erstellen
  is_admin()                  · Admin-Check für RLS
  is_kyc_verified()           · KYC-Check für Buchungen

Trigger:
  on_auth_user_created        · Profil auto-anlegen
  bookings_mark_slot          · Slot als gebucht markieren
  closings_calculate_commission · Provision berechnen
  closings_update_listing     · Status auf sold/rented
  bookings_audit              · Lock-Events protokollieren
```

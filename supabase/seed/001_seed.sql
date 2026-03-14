-- ============================================================
-- SEED 001 · Initialdaten
-- Märkte, Services und Admin-User für den Pilot-Launch
-- ============================================================

-- ── Märkte ───────────────────────────────────────────────────
insert into markets (name, slug, country_code, currency, timezone, is_active, launched_at, default_deposit)
values
  ('Wien',    'wien',    'AT', 'EUR', 'Europe/Vienna', true,  now(), 300),
  ('München', 'muenchen','DE', 'EUR', 'Europe/Berlin', false, null,  500),
  ('Berlin',  'berlin',  'DE', 'EUR', 'Europe/Berlin', false, null,  500),
  ('Zürich',  'zuerich', 'CH', 'CHF', 'Europe/Zurich', false, null,  600);

-- ── Services Marketplace ─────────────────────────────────────
insert into services (name, slug, description, icon, price, currency, provider, is_active, sort_order)
values
  (
    'Grundbuchauszug',
    'grundbuchauszug',
    'Offizieller Grundbuchauszug mit allen Eigentümer- und Lastenangaben.',
    '📋',
    29.00, 'EUR',
    'BRZ Austria',
    true, 1
  ),
  (
    'Bonitätsauskunft',
    'bonitaetsauskunft',
    'KSV1870 Bonitätsauskunft über Mieter oder Verkäufer.',
    '📊',
    19.00, 'EUR',
    'KSV1870',
    true, 2
  ),
  (
    'Energieausweis',
    'energieausweis',
    'Ausstellung eines Energieausweises durch zertifizierten Gutachter.',
    '🔋',
    99.00, 'EUR',
    'EnergieAusweis.at',
    true, 3
  ),
  (
    'Premium Listing',
    'premium-listing',
    '7 Tage Sichtbarkeits-Boost: Dein Inserat erscheint ganz oben auf der Karte.',
    '⭐',
    49.00, 'EUR',
    'INEED',
    true, 4
  ),
  (
    'Notartermin',
    'notartermin',
    'Vermittlung eines Notartermins für Kaufverträge in Wien.',
    '⚖️',
    0.00, 'EUR',
    'Notarkammer Wien',
    true, 5
  );

-- ── Test-Listing für Wien (nach Registrierung des Lister-Users anpassen) ──
-- Kommentiert lassen bis echter Lister-User vorhanden ist
-- insert into listings (...)

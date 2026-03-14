---
title: "INEED — PropTech Platform"
subtitle: "Gesamtkonzept & Technische Spezifikation"
date: "März 2026"
---

# INEED — PropTech Platform
## Gesamtkonzept & Technische Spezifikation

**Stand:** März 2026 | **Status:** Konzeptphase | **Version:** 1.0

---

## 1. Vision & Produktidee

**INEED** ist eine vollautomatisierte PropTech-Plattform, die Wohnungssuchenden ermöglicht, Immobilien zur Miete oder zum Kauf zu finden und selbstständig zu besichtigen — ohne Makler, ohne Wartezeiten.

### Kernversprechen

- Kartenbasierte Suche mit frei einstellbarem Radius (in Metern oder Kilometern)
- Selbstbedienungs-Besichtigungen via Smart Locks, Kameras oder Drohnen
- Direktbuchung mit integrierter Identitätsprüfung (KYC) und Kautions-Vorabbuchung
- Erweiterbar um Zusatzservices (Grundbuchauszug, Bonitätsauskunft u.a.)
- **Accounts für Seeker und Lister sind kostenlos** — die Plattform verdient ausschließlich erfolgsbasiert

### Pilotstrategie

Start in einer einzigen Stadt als kontrollierter Pilot. Die technische Architektur ist von Beginn an **multi-city und multi-country skalierbar** ausgelegt — ein späterer Rollout erfordert keinen technischen Umbau.

---

## 2. Zielgruppen

| Rolle | Beschreibung |
|---|---|
| **Seeker** | Wohnungssuchende (Miete oder Kauf). Suchen per Karte, buchen Besichtigungen, bestellen Services. |
| **Lister** | Wohnungsbesitzer, Vermieter, Verkäufer. Inserieren Objekte, definieren Zeitslots, verbinden Smart Locks. |
| **Admin** | Plattform-Betreiber. Verwaltet KYC-Freigaben, Disputes, Auszahlungen und Märkte. |
| *(Phase 3)* **Service Provider** | Drittanbieter für Marketplace-Services (Notar, Energieausweis etc.) |

---

## 3. Kernfunktionen

### 3.1 Kartenbasierte Suche

- Geolokalisierung beim App-Start (oder manuelle Eingabe)
- Karte zeigt alle aktiven Listings im eingestellten Radius
- Radius frei einstellbar: 100 m bis 50 km
- Filter: Miete / Kauf, Preisrange, Zimmeranzahl, Fläche, Verfügbarkeit

### 3.2 Besichtigungssystem (3 Stufen)

**Stufe 1 — Virtueller Pre-Check** *(immer verfügbar)*
- Hochauflösende Fotos
- 360°-Foto-Touren (Matterport-Style)
- Grundriss-Viewer

**Stufe 2 — Live-Kamera Besichtigung** *(auf Anfrage / Zeitslot)*
- Festinstallierte IP-Kameras in der Wohnung
- Live-Stream direkt in der App via WebRTC
- Zeitslot-Buchung erforderlich

**Stufe 3 — Self-Service Tour** *(nach KYC-Freigabe)*
- Smart Door Lock öffnet sich per App-Freigabe
- Optional: in der Wohnung platzierte Drohne startet automatisch
- Zeitlimitierter Zugang (z.B. 30 Minuten)
- Vollständiges Audit-Log aller Zugangsereignisse

### 3.3 KYC & Kreditkarten-Hinterlegung

Jeder Seeker muss vor der ersten Besichtigung:
1. Lichtbildausweis fotografieren + Selfie (automatische Prüfung via Stripe Identity)
2. Kreditkarte hinterlegen
3. Für Self-Service-Besichtigungen: Kaution vormerken lassen (Stripe Pre-Auth, wird nicht abgebucht solange kein Schaden)

### 3.4 Services Marketplace

Buchbare Zusatzservices direkt in der App:
- Grundbuchauszug
- Bonitätsauskunft (Schufa / KSV)
- Energieausweis-Bestellung
- Notartermin-Vermittlung
- *(weitere Services erweiterbar)*

---

## 4. Business Model & Monetarisierung

### Grundprinzip

> Accounts sind für Seeker und Lister **kostenlos**. Die Plattform verdient **ausschließlich bei erfolgreichem Abschluss** sowie über Zusatzservices.

### 4.1 Erfolgsbasierte Provision (Kernumsatz)

| Abschlusstyp | Provision | Berechnungsbasis |
|---|---|---|
| **Kauf** | 1 % des Kaufpreises | Fällig bei Vertragsabschluss |
| **Miete** | 3-fache Monatsmiete | Fällig bei Mietvertragsunterzeichnung |

**Beispiele:**
- Wohnung Kaufpreis 350.000 € → Provision **3.500 €**
- Mietwohnung 1.200 €/Monat → Provision **3.600 €**

Die Provision wird über die Plattform abgewickelt und automatisch via Stripe aufgeteilt.

### 4.2 Services Marketplace

| Service | Preis (ca.) | Plattform-Marge |
|---|---|---|
| Grundbuchauszug | 19–39 € | ~50 % |
| Bonitätsauskunft | 14–29 € | ~40 % |
| Energieausweis | 79–149 € | ~25 % |
| Premium-Listing (Sichtbarkeits-Boost) | 49–99 €/Woche | 100 % |

### 4.3 Spätere Einnahmequellen (Phase 3+)

| Modell | Beschreibung |
|---|---|
| **SaaS für Hausverwaltungen** | Monatliche Lizenzgebühr für Verwaltung großer Portfolios |
| **Kautions-Float** | Bei hohem Transaktionsvolumen: Zinserträge auf vorgemerkten Beträgen |
| **B2B API** | Lizenzierung der Infrastruktur an Makler-Softwareanbieter |

### 4.4 Unit Economics Pilotstadt (konservativ)

```
Annahmen für Pilotstadt (z.B. Wien, Jahr 1):

  10 Miet-Abschlüsse/Monat × Ø 3.600 € Provision  =  36.000 €/Monat
   2 Kauf-Abschlüsse/Monat × Ø 3.500 € Provision  =   7.000 €/Monat
  30 Service-Bestellungen   × Ø 15 € Marge         =     450 €/Monat
─────────────────────────────────────────────────────────────────────
  Geschätzter MRR (Pilot, konservativ):              ~ 43.450 €/Monat
```

---

## 5. Technologie-Stack

### 5.1 Frontend / Mobile

| Schicht | Technologie | Begründung |
|---|---|---|
| Mobile App | **React Native + Expo** | iOS + Android aus einer Codebase |
| Web (Admin/Landing) | **Next.js 14** (App Router) | SEO-fähig, Admin-Panel |
| Styling | **NativeWind / Tailwind** | Einheitliches Design-System |
| Karten | **Mapbox GL** | Kostengünstiger als Google Maps, sehr flexibel |
| State Management | **Zustand** | Leichtgewichtig, kein Redux-Overhead |

### 5.2 Backend & Datenbank

| Schicht | Technologie | Begründung |
|---|---|---|
| Backend-as-a-Service | **Supabase** | PostgreSQL + Auth + Storage + Realtime |
| Geospatiale Queries | **PostGIS** (in Supabase) | Industrie-Standard für Radius-Suche |
| API-Layer | **Supabase Edge Functions** | Serverless, global verteilt |
| Bilder-Storage | **Supabase Storage + CDN** | Integriert, automatisches CDN |
| Background Jobs | **Trigger.dev** | Lock-Timeout, Payment-Release, Erinnerungen |

### 5.3 IoT & Besichtigung

| Schicht | Technologie | Begründung |
|---|---|---|
| Smart Locks (primär) | **Nuki API** | DACH-Markt, nachrüstbar, exzellente API |
| Smart Locks (Enterprise) | **SALTO KS** | Skalierbar für große Portfolios |
| Live-Streaming | **Livekit** (WebRTC) | Open Source WebRTC-Server, selbst hostbar |
| Video-Storage | **Cloudflare Stream** | Günstiger als AWS, globales CDN |
| 360°-Touren | **Matterport API / Pannellum** | Statische Touren in Phase 1 |

### 5.4 Payments & Compliance

| Schicht | Technologie | Begründung |
|---|---|---|
| Zahlungen | **Stripe** | PCI-DSS compliant, beste Developer-API |
| KYC / ID-Prüfung | **Stripe Identity** | Integriert, DSGVO-konform |
| Kaution Pre-Auth | **Stripe Payment Intents** (manual capture) | Betrag vormerken, nur bei Schaden einziehen |
| Auszahlungen | **Stripe Connect** | Automatische Aufteilung Plattform / Lister |
| Push Notifications | **Expo Push + Firebase FCM** | Cross-platform |

### 5.5 Hosting & Infrastruktur

| Dienst | Technologie |
|---|---|
| Web-Frontend | **Vercel** |
| Datenbank | **Supabase** (managed PostgreSQL) |
| CDN / Video | **Cloudflare** |

### 5.6 Skalierungspfad

```
Pilot (1 Stadt)               →  Scale-up (50+ Städte)
────────────────────────────────────────────────────────
Supabase Free/Pro             →  Supabase Enterprise / eigener PG-Cluster
Edge Functions (serverless)   →  Bleiben automatisch global verteilt
PostGIS mit Indexes           →  Performt mit Millionen Einträgen
React Native Codebase         →  Kein App-Rewrite nötig
markets-Tabelle (DB)          →  Neuen Markt = ein neuer DB-Eintrag
```

---

## 6. Datenbankschema

### 6.1 Kern-Tabellen

```sql
-- Benutzer (erweitert Supabase Auth)
CREATE TABLE profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users,
  role                     TEXT CHECK (role IN ('seeker', 'lister', 'admin')),
  full_name                TEXT NOT NULL,
  phone                    TEXT,
  kyc_status               TEXT CHECK (kyc_status IN
                             ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  stripe_customer_id       TEXT,
  stripe_payment_method_id TEXT,    -- hinterlegte Kreditkarte
  created_at               TIMESTAMPTZ DEFAULT now()
);

-- Märkte / Städte (Multi-City Skalierung)
CREATE TABLE markets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,        -- 'Wien', 'Berlin', 'München'
  country_code TEXT NOT NULL,        -- 'AT', 'DE', 'CH'
  currency     TEXT DEFAULT 'EUR',
  is_active    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Listings (Immobilien-Inserate)
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lister_id       UUID REFERENCES profiles(id),
  market_id       UUID REFERENCES markets(id),
  listing_type    TEXT CHECK (listing_type IN ('rent', 'sale')),
  status          TEXT CHECK (status IN
                    ('draft','active','paused','sold','rented')) DEFAULT 'draft',
  title           TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC NOT NULL,
  price_currency  TEXT DEFAULT 'EUR',
  size_sqm        NUMERIC,
  rooms           NUMERIC,
  floor           INT,
  available_from  DATE,

  -- Adresse & Geoposition
  address_street  TEXT,
  address_city    TEXT,
  address_zip     TEXT,
  address_country TEXT DEFAULT 'AT',
  location        GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS

  -- IoT
  smart_lock_id     TEXT,
  smart_lock_type   TEXT,             -- 'nuki', 'salto', null
  has_live_camera   BOOLEAN DEFAULT false,
  camera_stream_url TEXT,

  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Geospatial-Index (kritisch für Performance)
CREATE INDEX idx_listings_location ON listings USING GIST (location);

-- Besichtigungs-Zeitslots
CREATE TABLE viewing_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
  slot_type   TEXT CHECK (slot_type IN
                ('physical', 'live_camera', 'self_service')),
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  is_booked   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Buchungen
CREATE TABLE bookings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id                   UUID REFERENCES viewing_slots(id),
  seeker_id                 UUID REFERENCES profiles(id),
  listing_id                UUID REFERENCES listings(id),
  status                    TEXT CHECK (status IN (
                              'pending','confirmed','active',
                              'completed','cancelled','disputed'
                            )) DEFAULT 'pending',
  stripe_payment_intent_id  TEXT,
  deposit_amount            NUMERIC,
  deposit_captured          BOOLEAN DEFAULT false,
  deposit_released_at       TIMESTAMPTZ,
  lock_opened_at            TIMESTAMPTZ,
  lock_closed_at            TIMESTAMPTZ,
  access_token              TEXT,
  created_at                TIMESTAMPTZ DEFAULT now()
);

-- Abschlüsse (Provision-Trigger)
CREATE TABLE closings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id               UUID REFERENCES listings(id),
  seeker_id                UUID REFERENCES profiles(id),
  closing_type             TEXT CHECK (closing_type IN ('rent', 'sale')),
  closing_price            NUMERIC NOT NULL,  -- Kaufpreis oder Monatsmiete
  commission_amount        NUMERIC NOT NULL,  -- 1% Kauf / 3× Miete
  stripe_payment_intent_id TEXT,
  status                   TEXT CHECK (status IN
                             ('pending','paid','disputed')) DEFAULT 'pending',
  closed_at                TIMESTAMPTZ DEFAULT now()
);

-- Services Marketplace
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC NOT NULL,
  currency    TEXT DEFAULT 'EUR',
  provider    TEXT,
  is_active   BOOLEAN DEFAULT true
);

-- Service-Bestellungen
CREATE TABLE service_orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id                UUID REFERENCES services(id),
  user_id                   UUID REFERENCES profiles(id),
  listing_id                UUID REFERENCES listings(id),
  status                    TEXT CHECK (status IN
                              ('pending','processing','completed','failed')),
  stripe_payment_intent_id  TEXT,
  result_url                TEXT,
  created_at                TIMESTAMPTZ DEFAULT now()
);

-- Audit Log (unveränderlich)
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,
  actor_id    UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 Kern-Query: Radius-Suche

```sql
SELECT
  l.*,
  ST_Distance(
    l.location::geography,
    ST_MakePoint($lng, $lat)::geography
  ) AS distance_m
FROM listings l
WHERE
  l.status = 'active'
  AND l.listing_type = $type          -- 'rent' oder 'sale'
  AND ST_DWithin(
    l.location::geography,
    ST_MakePoint($lng, $lat)::geography,
    $radius_meters                    -- frei einstellbar
  )
ORDER BY distance_m ASC;
```

### 6.3 Provisions-Berechnung

```sql
-- Automatisch berechnet via Trigger oder Edge Function
closing_type = 'sale' → commission = closing_price * 0.01
closing_type = 'rent' → commission = closing_price * 3
```

---

## 7. User Flows

### Flow A: Seeker findet und besichtigt eine Wohnung

```
App öffnen
    ↓
Geolokalisierung (oder manuelle Ortseingabe)
    ↓
Karte mit Listings im eingestellten Radius
    ↓
Filter anwenden (Miete/Kauf, Preis, Größe, Zimmer)
    ↓
Listing antippen → Detailseite
    ↓
360°-Tour / Fotos / Grundriss ansehen
    ↓
"Besichtigung buchen" antippen
    │
    ├── [Nicht eingeloggt] → Registrierung
    │                             ↓
    │                     KYC: Ausweis + Selfie (Stripe Identity)
    │                             ↓
    │                     Kreditkarte hinterlegen
    │                             ↓
    └── [KYC verifiziert] → Zeitslot auswählen
                                  ↓
                          Stripe Pre-Auth (Kaution)
                                  ↓
                          Buchungsbestätigung per Push
                                  ↓
                     [Am Tag der Besichtigung]
                                  ↓
                    ┌─────────────┴──────────────┐
                    │                            │
             Self-Service                  Live-Kamera
           Smart Lock öffnet          WebRTC-Stream startet
                    │                            │
                    └─────────────┬──────────────┘
                                  ↓
                        Besichtigung beendet
                                  ↓
              Kaution freigegeben nach 48h (kein Schaden)
                                  ↓
                    Interesse? → Kontakt mit Lister
                                  ↓
                         Abschluss → Provision
```

### Flow B: Lister inseriert eine Immobilie

```
Kostenlose Registrierung als Lister
    ↓
Neues Listing erstellen
    ├── Fotos + 360°-Tour hochladen
    ├── Adresse eingeben (GPS-Pin auf Karte setzen)
    ├── Typ: Miete / Verkauf
    ├── Preis, Größe, Zimmer, Ausstattung
    └── Smart Lock verbinden (optional, Phase 2)
    ↓
Zeitslots für Besichtigungen definieren
    ↓
Listing einreichen (Admin-Review in Phase 1)
    ↓
Listing wird veröffentlicht → erscheint auf der Karte
    ↓
Benachrichtigungen bei Buchungsanfragen
    ↓
Dashboard: Kalender, Anfragen, Statistiken
    ↓
Bei Abschluss: Provision wird über Plattform abgewickelt
```

### Flow C: KYC & Kreditkarten-Pre-Auth (Detail)

```
Stripe Identity öffnet sich in-App
    ├── Ausweis: Vorder- und Rückseite fotografieren
    └── Selfie aufnehmen (Liveness-Check)
    ↓
Automatische Prüfung (Sekunden bis Minuten)
    ↓
Kreditkarte hinterlegen (Stripe, PCI-DSS compliant)
    ↓
Pre-Auth: Kautionsbetrag wird vorgemerkt (nicht abgebucht)
    ↓
Freigabe erteilt → Self-Service Buchungen möglich
```

---

## 8. Phasenplan

### Phase 1 — Pilot MVP (Monat 1–4)

| # | Feature | Priorität |
|---|---|---|
| 1 | Listings mit Karte & Radius-Suche (PostGIS) | Muss |
| 2 | User Auth: Seeker + Lister (zwei Rollen) | Muss |
| 3 | Foto-Upload + statische 360°-Touren | Muss |
| 4 | Besichtigungs-Zeitslots (Lister anwesend) | Muss |
| 5 | Stripe KYC + Kreditkarte hinterlegen | Muss |
| 6 | Provisions-Abwicklung via Stripe Connect | Muss |
| 7 | Admin-Panel (Listing-Review, KYC-Freigabe) | Muss |
| 8 | Eine Pilotstadt aktiv | Muss |

### Phase 2 — Self-Service (Monat 5–9)

| # | Feature | Priorität |
|---|---|---|
| 1 | Smart Lock Integration (Nuki API) | Hoch |
| 2 | Stripe Pre-Auth Kaution | Hoch |
| 3 | Live-Kamera Streaming (Livekit/WebRTC) | Hoch |
| 4 | Automatisches KYC-Approval | Mittel |
| 5 | Push Notifications | Mittel |
| 6 | Services Marketplace (Grundbuchauszug, Schufa) | Mittel |
| 7 | Rollout 2–3 weitere Städte | Hoch |

### Phase 3 — Scale & Marketplace (Monat 10+)

| # | Feature | Priorität |
|---|---|---|
| 1 | SaaS für Hausverwaltungen | Hoch |
| 2 | Multi-Country (DE, CH, weitere EU-Länder) | Hoch |
| 3 | B2B API für Makler-Software-Integration | Mittel |
| 4 | ML: Preisschätzung, Empfehlungsalgorithmus | Mittel |
| 5 | Drohnen-Integration (nach regulatorischer Prüfung) | Niedrig |

---

## 9. Risiken & Maßnahmen

### Rechtlich / Regulatorisch

| Risiko | Maßnahme |
|---|---|
| DSGVO: KYC-Daten (Ausweise, Selfies) | Datenschutzkonzept, DPA mit Stripe, explizite Einwilligung |
| Makler-Provisionsrecht (AT/DE) | Rechtsgutachten vor Launch |
| Haftung bei Smart-Lock-Versagen | AGB + Plattform-Versicherung |
| Drohnen in Wohngebäuden | Erst Phase 3, separates Rechtsgutachten |
| Kamera-Datenschutz | Aktivierung nur während gebuchter Slots, Protokollierung |

### Technisch

| Risiko | Maßnahme |
|---|---|
| Smart Lock offline (WLAN/Strom-Ausfall) | Physischer Backup-Schlüssel beim Lister |
| Skalierung Geo-Queries bei hohem Volumen | PostGIS-Indexes, Query-Caching mit Redis |
| Missbrauch bei Besichtigungen | Audit-Log, Kamera-Aufzeichnung, Kaution |

### Business

| Risiko | Maßnahme |
|---|---|
| Henne-Ei-Problem | Vor Launch 50 garantierte Listings akquirieren |
| Lister-Adoption Smart Locks | Hardware-Subventionierung in Phase 1 |
| Vertrauen (Wohnung ohne Makler öffnen) | Starkes KYC, Versicherung kommunizieren, Social Proof |
| Provisions-Verweigerung (Abschluss außerhalb der Plattform) | Juristisch: Nachweisbarkeit über Plattform-Aktivität |

---

## 10. Nächste Schritte

1. **Pilotstadt festlegen** — Marktanalyse, erste Lister-Akquise
2. **Rechtliche Prüfung** — Maklerrecht AT/DE, DSGVO-Konzept
3. **Supabase-Projekt aufsetzen** — Schema deployen, Auth konfigurieren
4. **Design & UX** — Wireframes Mobile App (Seeker-Flow + Karte)
5. **Stripe-Integration** — KYC, Payments, Connect aufsetzen
6. **Branding** — Name, Domain, Corporate Identity finalisieren

---

*Erstellt mit Claude Code — Konzeptgespräch März 2026*
*Alle Angaben sind vorläufig und dienen der konzeptionellen Planung.*

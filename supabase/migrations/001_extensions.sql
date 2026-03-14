-- ============================================================
-- MIGRATION 001 · Extensions
-- Aktiviert PostGIS und UUID-Erweiterungen
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";   -- für Volltextsuche auf Adressen

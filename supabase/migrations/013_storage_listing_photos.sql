-- ============================================================
-- MIGRATION 013 · Supabase Storage — listing-photos Bucket
-- Muss im Supabase SQL Editor ausgeführt werden.
-- HINWEIS: Bucket muss vorher manuell im Dashboard angelegt werden:
--   Storage → New Bucket → Name: "listing-photos" → Public: ON
-- ============================================================

-- Storage-Policies für listing-photos Bucket

-- Jeder kann Fotos aktiver Listings lesen (public bucket reicht, aber explizit)
create policy "listing-photos: public read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Lister kann nur in eigene Listing-Ordner hochladen
-- Pfad-Format: {listing_id}/{filename}
create policy "listing-photos: lister upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.listings
      where id::text = (string_to_array(name, '/'))[1]
      and lister_id = auth.uid()
    )
  );

-- Lister kann eigene Fotos löschen
create policy "listing-photos: lister delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.listings
      where id::text = (string_to_array(name, '/'))[1]
      and lister_id = auth.uid()
    )
  );

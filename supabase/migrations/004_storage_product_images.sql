-- Product images storage bucket (WebP files)
-- Run in Supabase SQL Editor after creating the bucket in Dashboard,
-- OR use the Storage UI: create public bucket named "product-images"

-- Create bucket via SQL (Supabase Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB max per file (after WebP conversion)
  ARRAY['image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp']::text[];

-- Public read
CREATE POLICY IF NOT EXISTS "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated admins can upload (app checks role; RLS allows authenticated)
CREATE POLICY IF NOT EXISTS "Authenticated upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Authenticated update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Authenticated delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

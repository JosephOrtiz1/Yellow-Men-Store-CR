-- Align bucket visibility with intended use: product media is public content.
UPDATE storage.buckets SET public = true WHERE id IN ('product-images', 'size-guides');

-- Remove now-redundant explicit SELECT policies (public buckets allow direct-URL reads natively).
DROP POLICY IF EXISTS "Public read product images by direct path" ON storage.objects;
DROP POLICY IF EXISTS "Public read size guides by direct path" ON storage.objects;
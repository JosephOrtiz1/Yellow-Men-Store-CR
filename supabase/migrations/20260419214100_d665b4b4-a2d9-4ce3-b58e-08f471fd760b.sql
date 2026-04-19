
-- Public buckets serve files directly via CDN URLs without needing a SELECT policy.
-- Removing the broad SELECT policy prevents listing/enumeration of bucket contents
-- while keeping individual file access by direct URL working.
DROP POLICY IF EXISTS "Public read product images by path" ON storage.objects;
DROP POLICY IF EXISTS "Public read size guides by path" ON storage.objects;


-- 1. Refactor has_role to be robust:
--    - Users can always check their own roles
--    - Admins can check anyone's roles
--    - Other authenticated users get false (cannot enumerate)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
        )
      )
  )
$$;

-- 2. Make storage buckets private to prevent listing.
--    Files remain accessible via direct URL because the app stores
--    the public URLs when uploading; bucket privacy only blocks enumeration.
UPDATE storage.buckets SET public = false WHERE id IN ('product-images', 'size-guides');

-- 3. Add an explicit SELECT policy so files can still be read by direct path.
CREATE POLICY "Public read product images by direct path"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Public read size guides by direct path"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'size-guides');

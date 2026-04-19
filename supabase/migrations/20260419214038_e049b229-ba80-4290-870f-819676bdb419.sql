
-- 1. Fix has_role: prevent enumeration of other users' roles
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
      AND _user_id = auth.uid()
  )
$$;

-- 2. Fix storage policies for product-images bucket
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

CREATE POLICY "Public read product images by path"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Only admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix storage policies for size-guides bucket
DROP POLICY IF EXISTS "Admins can upload size guides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update size guides" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete size guides" ON storage.objects;
DROP POLICY IF EXISTS "Public can view size guides" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view size guides" ON storage.objects;

CREATE POLICY "Public read size guides by path"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'size-guides');

CREATE POLICY "Only admins can upload size guides"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'size-guides'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can update size guides"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'size-guides'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'size-guides'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete size guides"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'size-guides'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Add explicit restrictive policies on user_roles to prevent privilege escalation
CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

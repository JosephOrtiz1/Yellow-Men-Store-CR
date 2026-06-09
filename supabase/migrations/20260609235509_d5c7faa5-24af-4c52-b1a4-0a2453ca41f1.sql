
-- 1. Restrict has_role to self-checks (prevents admin enumeration)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND _user_id = auth.uid()
  )
$$;

-- 2. Force new user-created orders to start as 'pending'
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

CREATE POLICY "Users can create their own pending orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');


CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Always check the caller's roles only. The _user_id parameter is kept
  -- for backwards compatibility with existing policies but is ignored to
  -- prevent any possibility of privilege enumeration or escalation.
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
      AND _user_id = auth.uid()
  )
$$;

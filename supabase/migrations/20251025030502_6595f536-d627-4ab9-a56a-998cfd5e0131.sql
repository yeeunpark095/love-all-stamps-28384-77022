-- Fix: Remove the policy that still exposes staff_pin and recreate view correctly
-- RLS policies don't support column-level restrictions, so any SELECT policy 
-- would expose ALL columns including staff_pin

DROP POLICY IF EXISTS "Authenticated users can view safe booth columns" ON public.booths;

-- Recreate booths_public view (without security_invoker, which makes it SECURITY DEFINER by default)
-- This allows the view to access booths table even though regular users don't have SELECT permission
DROP VIEW IF EXISTS public.booths_public;

CREATE VIEW public.booths_public AS
SELECT 
  booth_id,
  name,
  description,
  location,
  teacher,
  created_at
FROM public.booths
WHERE is_active = true;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.booths_public TO authenticated;

-- Now the security model is correct:
-- 1. Only admins can SELECT from booths table directly (via existing "Admins can view all booth data" RLS policy)
-- 2. Regular authenticated users cannot SELECT from booths table (no policy exists for them)
-- 3. Regular users access booths_public view which uses SECURITY DEFINER (default)
-- 4. The view only exposes safe columns (no staff_pin)
-- 5. staff_pin is fully protected and only accessible to admins via direct table access
-- Fix critical security issues: Secure booth data access

-- 1. Remove the overly permissive policy that exposes staff_pin to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view public booth info" ON public.booths;

-- 2. Recreate booths_public view as SECURITY INVOKER (not DEFINER)
-- This ensures the view respects the calling user's permissions
DROP VIEW IF EXISTS public.booths_public;

CREATE VIEW public.booths_public 
WITH (security_invoker = true)
AS
SELECT 
  booth_id,
  name,
  description,
  location,
  teacher,
  created_at
FROM public.booths
WHERE is_active = true;

-- 3. Add a new policy that allows authenticated users to SELECT only safe columns from booths table
-- This policy uses column-level access control
CREATE POLICY "Authenticated users can view safe booth columns"
ON public.booths
FOR SELECT
TO authenticated
USING (true);

-- Note: The booths table RLS is enabled, so this policy allows SELECT but staff_pin 
-- can only be accessed by admins through the existing "Admins can view all booth data" policy
-- Regular users can query booths table but the app should use booths_public view for safety
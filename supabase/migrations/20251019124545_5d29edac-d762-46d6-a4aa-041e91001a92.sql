-- Drop and recreate the view with SECURITY INVOKER to respect RLS
DROP VIEW IF EXISTS public.booths_public;

CREATE VIEW public.booths_public
WITH (security_invoker=on)
AS
SELECT 
  booth_id,
  name,
  description,
  location,
  teacher,
  created_at
FROM public.booths;

-- Add policy allowing authenticated users to view booths (view will filter columns)
CREATE POLICY "Authenticated users can view booth data"
ON public.booths
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Note: Admins can still see everything via "Admins can view all booth data" policy
-- Regular users access through booths_public view which only shows safe columns
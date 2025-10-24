-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Booths are viewable by authenticated users" ON public.booths;

-- Create new policy: only admins can see full booth data including PINs
CREATE POLICY "Admins can view all booth data" 
ON public.booths 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a view for public booth information (excludes sensitive fields)
CREATE OR REPLACE VIEW public.booths_public AS
SELECT 
  booth_id,
  name,
  description,
  location,
  teacher,
  created_at
FROM public.booths;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.booths_public TO authenticated;
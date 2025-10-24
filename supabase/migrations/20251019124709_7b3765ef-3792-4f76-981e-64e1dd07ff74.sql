-- Remove the policy that allows all authenticated users to see sensitive booth data
DROP POLICY IF EXISTS "Authenticated users can view booth data" ON public.booths;

-- Now only admins can query the booths table directly (via "Admins can view all booth data" policy)
-- Regular users must use the booths_public view which only shows safe columns
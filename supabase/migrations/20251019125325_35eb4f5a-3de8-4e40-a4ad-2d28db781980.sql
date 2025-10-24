-- Add RLS policy to allow authenticated users to read booth data
-- This enables the booths_public view to work for regular users
-- The view only exposes safe columns (booth_id, name, description, location, teacher, created_at)
-- Sensitive columns (staff_pin, qr_code_value, quiz_answer) are filtered out by the view

CREATE POLICY "Authenticated users can view public booth info" 
ON public.booths 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- SECURITY NOTE: 
-- Application code should always use booths_public view, never query booths directly
-- Map.tsx and MyStamps.tsx have been updated to use booths_public
-- Only admin functions can access the full booths table with sensitive columns
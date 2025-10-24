-- 1. Remove QR code and quiz fields from booths table
ALTER TABLE public.booths 
DROP COLUMN IF EXISTS qr_code_value,
DROP COLUMN IF EXISTS quiz_answer;

-- 2. Create lucky draw entries table
CREATE TABLE public.lucky_draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.lucky_draw_entries ENABLE ROW LEVEL SECURITY;

-- Students can view their own entry
CREATE POLICY "Students view own entry"
ON public.lucky_draw_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all entries
CREATE POLICY "Admins view all entries"
ON public.lucky_draw_entries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Update verify_stamp function to only check staff_pin
CREATE OR REPLACE FUNCTION public.verify_stamp(p_user_id uuid, p_booth_id integer, p_entered text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_booth record;
  v_exists boolean;
BEGIN
  -- Get booth data
  SELECT booth_id, staff_pin
    INTO v_booth
    FROM booths
   WHERE booth_id = p_booth_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if stamp already exists
  SELECT EXISTS (
    SELECT 1 FROM stamp_logs
     WHERE user_id = p_user_id
       AND booth_id = p_booth_id
  ) INTO v_exists;

  IF v_exists THEN
    RETURN false;
  END IF;

  -- Verify input against booth staff PIN only
  IF lower(trim(p_entered)) = lower(v_booth.staff_pin) THEN
    INSERT INTO stamp_logs(user_id, booth_id, method_used, verified_at)
    VALUES (p_user_id, p_booth_id, 'staff_pin', now());
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;

-- 4. Create function to register user for lucky draw
CREATE OR REPLACE FUNCTION public.register_lucky_draw(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
  v_exists boolean;
  v_profile record;
BEGIN
  -- Check if user has 20 stamps
  SELECT count(*) INTO v_count
  FROM stamp_logs
  WHERE user_id = p_user_id;

  IF v_count < 20 THEN
    RETURN;
  END IF;

  -- Check if already registered
  SELECT EXISTS(SELECT 1 FROM lucky_draw_entries WHERE user_id = p_user_id)
    INTO v_exists;

  IF v_exists THEN
    RETURN;
  END IF;

  -- Get profile info
  SELECT name, student_id
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Register for lucky draw
  INSERT INTO lucky_draw_entries(user_id, name, student_id)
  VALUES (p_user_id, v_profile.name, v_profile.student_id);
END;
$$;

REVOKE ALL ON FUNCTION register_lucky_draw(uuid) FROM public;
GRANT EXECUTE ON FUNCTION register_lucky_draw(uuid) TO authenticated;

-- 5. Create function for admin to pick random winners
CREATE OR REPLACE FUNCTION public.pick_random_winners(n int)
RETURNS TABLE(name text, student_id text, completed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT name, student_id, completed_at
  FROM lucky_draw_entries
  ORDER BY random()
  LIMIT n;
$$;

REVOKE ALL ON FUNCTION pick_random_winners(int) FROM public;
GRANT EXECUTE ON FUNCTION pick_random_winners(int) TO authenticated;

-- 6. Drop old QR rotation functions (no longer needed)
DROP FUNCTION IF EXISTS public.rotate_booth_qrcode(integer);
DROP FUNCTION IF EXISTS public.rotate_booth_pin(integer);
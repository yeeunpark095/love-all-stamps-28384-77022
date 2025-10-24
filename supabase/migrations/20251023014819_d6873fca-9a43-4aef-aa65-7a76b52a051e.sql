-- 1. Add is_active column to booths table
ALTER TABLE public.booths
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Deactivate 수달 booth
UPDATE public.booths
SET is_active = false
WHERE name ILIKE '%수달%';

-- 3. Add 수달 to exhibitions table (without teacher column as it doesn't exist)
INSERT INTO public.exhibitions (club, title, type, description)
VALUES (
  '수달(수학의달인)',
  '수학 보드게임 카페',
  '실물+체험',
  '수학 보드게임을 즐기며 수리적 사고를 체험하는 카페형 전시'
)
ON CONFLICT DO NOTHING;

-- 4. Create participant progress view
CREATE OR REPLACE VIEW public.v_participant_progress AS
WITH active_booths AS (
  SELECT booth_id
  FROM public.booths
  WHERE COALESCE(is_active, true) = true
),
agg AS (
  SELECT
    p.id AS user_id,
    p.name,
    p.student_id,
    COUNT(DISTINCT s.booth_id) AS stamps,
    MAX(s.verified_at) AS last_stamp_at
  FROM public.profiles p
  LEFT JOIN public.stamp_logs s
    ON s.user_id = p.id
    AND s.booth_id IN (SELECT booth_id FROM active_booths)
  GROUP BY p.id, p.name, p.student_id
)
SELECT
  a.user_id,
  a.name,
  a.student_id,
  a.stamps,
  (SELECT COUNT(*)::int FROM active_booths) AS required_total,
  (CASE WHEN a.stamps >= (SELECT COUNT(*) FROM active_booths) THEN true ELSE false END) AS completed,
  a.last_stamp_at
FROM agg a;

-- 5. Create admin progress list RPC function
CREATE OR REPLACE FUNCTION public.admin_list_progress(
  p_search text DEFAULT NULL,
  p_page int DEFAULT 0,
  p_page_size int DEFAULT 200,
  p_order text DEFAULT 'last_stamp_at desc nulls last, student_id asc'
)
RETURNS TABLE (
  user_id uuid,
  name text,
  student_id text,
  stamps bigint,
  required_total int,
  completed boolean,
  last_stamp_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT 
      v.user_id,
      v.name,
      v.student_id,
      v.stamps,
      v.required_total,
      v.completed,
      v.last_stamp_at
    FROM public.v_participant_progress v
    WHERE ($1 IS NULL
           OR v.name ILIKE ''%%'' || $1 || ''%%''
           OR v.student_id ILIKE ''%%'' || $1 || ''%%'')
    ORDER BY %s
    OFFSET $2 * $3
    LIMIT $3
  ', p_order)
  USING p_search, p_page, p_page_size;
END;
$$;

-- 6. Grant permissions
GRANT SELECT ON public.v_participant_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_progress(text, int, int, text) TO authenticated;

-- 7. Add RLS policies for admin access (drop first if exists)
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "stamp_logs_select_admin" ON public.stamp_logs;
CREATE POLICY "stamp_logs_select_admin"
ON public.stamp_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
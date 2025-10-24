-- 먼저 is_winner 컬럼 추가
ALTER TABLE lucky_draw_entries ADD COLUMN IF NOT EXISTS is_winner boolean DEFAULT false;

-- 1) 추첨 대상(완주자) 조회
CREATE OR REPLACE FUNCTION public.ld_list_eligible()
RETURNS TABLE(id uuid, user_id uuid, name text, student_id text, completed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, user_id, name, student_id, completed_at
  FROM lucky_draw_entries
  WHERE is_winner = false
  ORDER BY completed_at ASC;
$$;

-- 2) 당첨자 조회
CREATE OR REPLACE FUNCTION public.ld_list_winners()
RETURNS TABLE(id uuid, user_id uuid, name text, student_id text, completed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, user_id, name, student_id, completed_at
  FROM lucky_draw_entries
  WHERE is_winner = true
  ORDER BY completed_at ASC;
$$;

-- 3) 랜덤 N명 선택 (미저장)
CREATE OR REPLACE FUNCTION public.ld_pick_random(n int)
RETURNS TABLE(id uuid, user_id uuid, name text, student_id text, completed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, user_id, name, student_id, completed_at
  FROM lucky_draw_entries
  WHERE is_winner = false
  ORDER BY random()
  LIMIT GREATEST(n, 0);
$$;

-- 4) 당첨 확정
CREATE OR REPLACE FUNCTION public.ld_confirm_winners(p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE lucky_draw_entries
  SET is_winner = true
  WHERE id = ANY(p_ids);
END;
$$;

-- 5) 당첨 취소
CREATE OR REPLACE FUNCTION public.ld_unset_winner(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE lucky_draw_entries
  SET is_winner = false
  WHERE id = p_id;
END;
$$;
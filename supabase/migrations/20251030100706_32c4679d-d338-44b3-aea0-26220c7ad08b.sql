-- 추첨권이 1장 이상인 사람만 무작위 선택하도록 수정
CREATE OR REPLACE FUNCTION public.ld_pick_random(n int)
RETURNS TABLE(id uuid, user_id uuid, name text, student_id text, completed_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT e.id, e.user_id, e.name, e.student_id, e.completed_at
  FROM lucky_draw_entries e
  INNER JOIN lucky_draw_tickets t ON e.user_id = t.user_id
  WHERE e.is_winner = false
    AND t.ticket_count >= 1
  ORDER BY random()
  LIMIT GREATEST(n, 0);
$$;
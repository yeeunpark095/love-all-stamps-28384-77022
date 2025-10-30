-- 추첨 대상자 조회도 추첨권이 1장 이상인 사람만 표시하도록 수정
CREATE OR REPLACE FUNCTION public.ld_list_eligible()
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
  ORDER BY e.completed_at ASC;
$$;
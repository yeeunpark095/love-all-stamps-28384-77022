-- Fix search_path for ld_draw_winners function
CREATE OR REPLACE FUNCTION ld_draw_winners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- 기존 당첨자 초기화
  UPDATE lucky_draw_entries SET is_winner = false;
  
  -- 추첨권 3개 이상인 사람 중에서 5명을 무작위로 선택하여 당첨자로 설정
  WITH eligible AS (
    SELECT lde.id
    FROM lucky_draw_entries lde
    JOIN lucky_draw_tickets ldt ON lde.user_id = ldt.user_id
    WHERE ldt.ticket_count >= 3
    ORDER BY random()
    LIMIT 5
  )
  UPDATE lucky_draw_entries
  SET is_winner = true
  WHERE id IN (SELECT id FROM eligible);
END;
$$;
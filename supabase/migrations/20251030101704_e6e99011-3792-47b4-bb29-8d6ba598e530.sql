-- 기존 사용자들 중 추첨권이 1장 이상인 사람들을 lucky_draw_entries에 등록
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT DISTINCT t.user_id
    FROM lucky_draw_tickets t
    WHERE t.ticket_count >= 1
      AND NOT EXISTS (
        SELECT 1 FROM lucky_draw_entries e 
        WHERE e.user_id = t.user_id
      )
  LOOP
    PERFORM update_lucky_draw_tickets(r.user_id);
  END LOOP;
END $$;
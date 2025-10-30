-- 기존 사용자 중 추첨권이 1장 이상인 모든 사용자를 lucky_draw_entries에 등록
INSERT INTO lucky_draw_entries (user_id, name, student_id, is_winner)
SELECT 
  t.user_id,
  p.name,
  p.student_id,
  false
FROM lucky_draw_tickets t
INNER JOIN profiles p ON t.user_id = p.id
WHERE t.ticket_count >= 1
ON CONFLICT (user_id) DO NOTHING;
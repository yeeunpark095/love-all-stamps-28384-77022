-- Fix ld_draw_winners_2plus to include WHERE clause
CREATE OR REPLACE FUNCTION public.ld_draw_winners_2plus()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 기존 당첨자 초기화 (WHERE 절 추가)
  UPDATE lucky_draw_entries SET is_winner = false WHERE is_winner = true;
  
  -- 추첨권 2개 이상인 사람 중에서 5명을 무작위로 선택하여 당첨자로 설정
  WITH eligible AS (
    SELECT lde.id
    FROM lucky_draw_entries lde
    JOIN lucky_draw_tickets ldt ON lde.user_id = ldt.user_id
    WHERE ldt.ticket_count >= 2
    ORDER BY random()
    LIMIT 5
  )
  UPDATE lucky_draw_entries
  SET is_winner = true
  WHERE id IN (SELECT id FROM eligible);
END;
$function$;

-- Fix ld_draw_winners (3+ tickets) to include WHERE clause
CREATE OR REPLACE FUNCTION public.ld_draw_winners()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 기존 당첨자 초기화 (WHERE 절 추가)
  UPDATE lucky_draw_entries SET is_winner = false WHERE is_winner = true;
  
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
$function$;

-- Fix ld_draw_winners_exactly_3 to include WHERE clause
CREATE OR REPLACE FUNCTION public.ld_draw_winners_exactly_3()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 기존 당첨자 초기화 (WHERE 절 추가)
  UPDATE lucky_draw_entries SET is_winner = false WHERE is_winner = true;
  
  -- 추첨권 정확히 3개인 사람 중에서 5명을 무작위로 선택하여 당첨자로 설정
  WITH eligible AS (
    SELECT lde.id
    FROM lucky_draw_entries lde
    JOIN lucky_draw_tickets ldt ON lde.user_id = ldt.user_id
    WHERE ldt.ticket_count = 3
    ORDER BY random()
    LIMIT 5
  )
  UPDATE lucky_draw_entries
  SET is_winner = true
  WHERE id IN (SELECT id FROM eligible);
END;
$function$;
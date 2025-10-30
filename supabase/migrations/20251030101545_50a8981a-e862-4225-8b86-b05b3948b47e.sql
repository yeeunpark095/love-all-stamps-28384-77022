-- 추첨권이 1장 이상인 모든 사람이 추첨 대상이 되도록 수정

-- 1. update_lucky_draw_tickets 함수 수정: 추첨권 1장 이상이면 lucky_draw_entries에 등록
CREATE OR REPLACE FUNCTION public.update_lucky_draw_tickets(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stamp_count int;
  v_ticket_count int;
  v_profile record;
BEGIN
  -- Count user's stamps
  SELECT count(*) INTO v_stamp_count
  FROM stamp_logs
  WHERE user_id = p_user_id;

  -- Calculate tickets based on stamp count
  v_ticket_count := 0;
  IF v_stamp_count >= 20 THEN
    v_ticket_count := 5;
  ELSIF v_stamp_count >= 15 THEN
    v_ticket_count := 3;
  ELSIF v_stamp_count >= 10 THEN
    v_ticket_count := 2;
  ELSIF v_stamp_count >= 5 THEN
    v_ticket_count := 1;
  END IF;

  -- Insert or update ticket count
  IF v_ticket_count > 0 THEN
    INSERT INTO lucky_draw_tickets(user_id, ticket_count)
    VALUES (p_user_id, v_ticket_count)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      ticket_count = v_ticket_count,
      updated_at = now();
      
    -- Get profile info and register for lucky draw if 1+ tickets (5+ stamps)
    SELECT name, student_id
    INTO v_profile
    FROM profiles
    WHERE id = p_user_id;
    
    -- Register for lucky draw if not already registered
    INSERT INTO lucky_draw_entries(user_id, name, student_id)
    VALUES (p_user_id, v_profile.name, v_profile.student_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN v_ticket_count;
END;
$$;

-- 2. 추첨 대상자 목록에서 중복 제거를 위해 user_id로 unique constraint 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lucky_draw_entries_user_id_key'
  ) THEN
    ALTER TABLE lucky_draw_entries ADD CONSTRAINT lucky_draw_entries_user_id_key UNIQUE (user_id);
  END IF;
END $$;
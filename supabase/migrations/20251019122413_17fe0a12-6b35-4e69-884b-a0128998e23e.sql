-- 1) PIN 회전 함수 (관리자 전용)
create or replace function rotate_booth_pin(p_booth_id int)
returns table(booth_id int, staff_pin text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_pin text;
begin
  -- 관리자 권한 확인
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Admin access required';
  end if;

  -- 1000~9999 범위 4자리 생성
  v_new_pin := lpad(((random()*9000)::int + 1000)::text, 4, '0');

  update booths
     set staff_pin = v_new_pin
   where booths.booth_id = p_booth_id;

  return query
  select booths.booth_id, booths.staff_pin 
  from booths 
  where booths.booth_id = p_booth_id;
end;
$$;

-- 2) QR 코드 값 회전 함수 (관리자 전용)
create or replace function rotate_booth_qrcode(p_booth_id int)
returns table(booth_id int, qr_code_value text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_code text;
begin
  -- 관리자 권한 확인
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Admin access required';
  end if;

  -- LOVE + 6자리 난수
  v_new_code := 'LOVE' || lpad((floor(random()*1000000))::int::text, 6, '0');

  update booths
     set qr_code_value = v_new_code
   where booths.booth_id = p_booth_id;

  return query
  select booths.booth_id, booths.qr_code_value 
  from booths 
  where booths.booth_id = p_booth_id;
end;
$$;
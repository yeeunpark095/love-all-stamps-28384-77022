-- 수달(수학의달인) 부스 삭제
DELETE FROM booths WHERE booth_id = 17;

-- Be Creator 부스 추가
INSERT INTO booths (name, description, location, teacher, staff_pin, is_active)
VALUES (
  'Be Creator',
  'Be Creator 동아리 부스입니다',
  '엘리베이터',
  '박예은',
  '1234',
  true
);
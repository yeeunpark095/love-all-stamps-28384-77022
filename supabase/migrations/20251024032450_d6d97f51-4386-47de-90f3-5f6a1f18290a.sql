-- Be creator 삭제
DELETE FROM exhibitions WHERE club = 'Be creator';

-- 간호보건동아리 업데이트
UPDATE exhibitions 
SET title = '사랑과 스트레스의 비밀',
    description = '사랑할 때의 심리 변화와 스트레스 상황에서의 관리 방법을 알아보는 건강 심리 전시 💗'
WHERE club = '간호보건동아리';

-- 플로깅 업데이트
UPDATE exhibitions 
SET title = '걷고, 줍고, 지구를 지키다',
    description = '''플로깅''의 의미와 다양한 환경 보호 활동을 소개하는 전시 🌎
깨끗한 지구를 위한 실천 아이디어를 함께 나눠요.'
WHERE club = '플로깅';

-- 사회정책탐구반 업데이트
UPDATE exhibitions 
SET title = '더 나은 사회를 향한 한 걸음',
    description = '우리 사회의 다양한 정책을 분석하고 대안을 제시한 연구 결과물 전시 💬'
WHERE club = '사회정책탐구반';

-- 한걸음 업데이트
UPDATE exhibitions 
SET description = '좋은 교사가 되기 위해 준비하는 한걸음 부원들의 활동'
WHERE club = '한걸음';

-- 핸즈온 과학탐구반 업데이트
UPDATE exhibitions 
SET title = '사랑의 원리, 과학으로 해석하는 체험 전시',
    description = '사랑의 원리, 과학으로 해석하는 체험 전시 🧠'
WHERE club = '핸즈온 과학탐구반';

-- 애니메이션 동아리 업데이트
UPDATE exhibitions 
SET title = '애니는 이렇게 만들어진다!',
    description = '애니메이션 제작의 과정과 원리를 한눈에 👀
직접 참여해볼 수 있는 체험도 준비되어 있어요!'
WHERE club = '애니메이션 동아리';

-- Guide Makers 업데이트
UPDATE exhibitions 
SET title = '영어로 만나는 나만의 박물관',
    description = '학생들이 직접 제작한 박물관 영문 안내서 전시
우리 문화를 영어로 소개하는 특별한 시도!'
WHERE club = 'Guide Makers';

-- 뷰티동아리 업데이트
UPDATE exhibitions 
SET title = '나를 빛내는 뷰티 솔루션',
    description = '퍼스널컬러와 스타일링으로 자신을 표현하는 뷰티 💄
나에게 어울리는 색과 스타일을 찾아보세요!'
WHERE club = '뷰티동아리';

-- STEAM사회참여반 업데이트
UPDATE exhibitions 
SET title = '세상을 바꾸는 아이디어',
    description = '사회문제 해결을 위한 주제 탐구 보고서 전시 ⚙️
창의적 사고로 사회를 바라보는 학생들의 시선을 담았어요.'
WHERE club = 'STEAM사회참여반';

-- ARTY 미술반 업데이트
UPDATE exhibitions 
SET title = '사랑을 그리다',
    description = '단체작품 ''사랑''과 개성 넘치는 개인작 전시 💕'
WHERE club = 'ARTY 미술반';

-- 진로DREAM(드림) 업데이트
UPDATE exhibitions 
SET title = '나의 꿈을 디자인하다',
    description = '지역사회 기관과 연계한 진로·직업 체험 및 학생 작품 전시 🌈
미래의 나를 스스로 디자인하는 여정을 만나보세요.'
WHERE club = '진로DREAM(드림)';

-- 수달(수학의달인) 추가
INSERT INTO exhibitions (club, title, description, teacher, type, location)
VALUES (
  '수달(수학의달인)',
  '일상 속에서 발견한 수학의 원리',
  '일상 속에서 발견한 수학의 원리를 한눈에 볼 수 있는 전시',
  '전승주',
  '탐구전시',
  '미술2실'
);
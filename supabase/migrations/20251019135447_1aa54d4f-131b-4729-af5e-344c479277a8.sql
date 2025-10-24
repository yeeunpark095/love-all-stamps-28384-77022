-- 체험부스 정보 업데이트 (총 20개)
UPDATE booths SET name = '영어토론', teacher = '지경주', description = '친구와 손잡고 오세요'' 영어 스피드 퀴즈 프레젠테이션' WHERE booth_id = 1;
UPDATE booths SET name = 'KIKKER(국제교류반)', teacher = '신희영', description = '전 세계 사랑을 전하는 KIKKER 항공, 지금 탑승하세요!' WHERE booth_id = 2;
UPDATE booths SET name = 'STEAM사회참여반', teacher = '정재은, 이은영', description = '1. 사랑의 단맛 체험, 간식 부스 2. 사랑의 매운맛 체험, 게임' WHERE booth_id = 3;
UPDATE booths SET name = '학생회', teacher = '이은영', description = '학생회 부스' WHERE booth_id = 4;
UPDATE booths SET name = '랩퀘스트', teacher = '정유정', description = '여러가지 분자모형 쿠키 만들기 (LabQuest)' WHERE booth_id = 5;
UPDATE booths SET name = '솔리언(또래상담반)', teacher = '윤지숙', description = '작은 선물과 함께 큰 마음을 나누는 따뜻한 추억의 뽑기 판' WHERE booth_id = 6;
UPDATE booths SET name = '빅데이터투인사이트', teacher = '이영석', description = '빅데이터 알아가기' WHERE booth_id = 7;
UPDATE booths SET name = 'ARTY 미술반', teacher = '이규화', description = '페이스페인팅·쥬얼리 메이크업·타투·스페셜 체험' WHERE booth_id = 8;
UPDATE booths SET name = 'BUKU(독서토론반)', teacher = '서수란', description = '연애 mbti, 운세 카페, 북클립 만들기' WHERE booth_id = 9;
UPDATE booths SET name = '빛글 (학생기자반)', teacher = '이문덕', description = '각 주제별 미션 카드에 맞는 사람을 찾아 데려오는 게임' WHERE booth_id = 10;
UPDATE booths SET name = '한걸음', teacher = '이동엽', description = '오늘은 내가 선생님!' WHERE booth_id = 11;
UPDATE booths SET name = '축구반', teacher = '현종명', description = '프리스타일 축구, 승부차기로 우수학생 선발' WHERE booth_id = 12;
UPDATE booths SET name = '슬램덩크 (농구동아리)', teacher = '조정현', description = '사랑을 쏴라! 농구 커플 챌린지!'' (농구 슛 이벤트)' WHERE booth_id = 13;
UPDATE booths SET name = 'Ballin (배구동아리)', teacher = '박창민', description = '배구 서브로 농구 백보드 맞추기, 언더 핸드패스로 농구 골대에 넣기' WHERE booth_id = 14;
UPDATE booths SET name = '애드미찬양반', teacher = '안유린', description = '2025[ 애드미 버스킹 사랑을 노래하다]' WHERE booth_id = 15;
UPDATE booths SET name = '물리를 만들다', teacher = '김기정', description = '골드버그장치전시, 로봇과 드론 조종체험, 랜덤상품뽑기' WHERE booth_id = 16;
UPDATE booths SET name = '수달(수학의달인)', teacher = '전승주', description = '수학 원리를 이용한 보드게임 카페' WHERE booth_id = 17;
UPDATE booths SET name = '디자인공예반', teacher = '천혜심', description = '내가 사랑한 것을 주제로 한 굿즈' WHERE booth_id = 18;
UPDATE booths SET name = '융합과학STEAM 주제연구반', teacher = '김성환, 박효민', description = '방탈출 게임' WHERE booth_id = 19;
UPDATE booths SET name = 'AI·SW 코딩반', teacher = '김예지', description = '파이썬 아두이노 작품 전시 및게임' WHERE booth_id = 20;

-- 전시 정보 업데이트
DELETE FROM exhibitions;

INSERT INTO exhibitions (club, title, description, type) VALUES
('간호보건동아리', '사랑/스트레스 상황의 변화와 관리', '사랑할 때 또는 스트레스 상황에서의 변화 및 관리 방법', '인쇄물(A1)'),
('Be creator', '축제 기획 자료 전시', '축제 기획과 관련된 자료 전시', '인쇄물(A1)'),
('플로깅', '플로깅 활동 전시', '''플로깅''의 의미, 다양한 플로깅 활동 및 자료 전시', '인쇄물(A1)'),
('사회정책탐구반', '사회정책 연구결과', '사회정책 분석 및 대안 제시 연구결과물 전시', '인쇄물(A1)'),
('친환경연구동아리', '친환경 생활용품', '친환경 아이디어로 만든 생활용품 전시', '인쇄물(A1)'),
('핸즈온 과학탐구반', '과학 연구결과', '소모임 연구결과 전시', '인쇄물(A1)'),
('애니메이션 동아리', '애니메이션 제작 과정', '애니메이션은 어떻게 만들어질까 ? : 제작 과정 전시 및 체험', '인쇄물(A1)'),
('Guide Makers', '박물관 영문 안내서', '내가 만든 박물관 영문 안내서', '인쇄물(A1)'),
('뷰티동아리', '맞춤 뷰티 솔루션', '나를 빛내는 맞춤 뷰티 솔루션', '인쇄물(A1)'),
('STEAM사회참여반', '주제 탐구 보고서', '주제 탐구 보고서 전시', '인쇄물(A1)'),
('ARTY 미술반', '사랑 단체작품과 개인작', '단체작품 ''사랑''과 개인작 전시, 페이스페인팅·쥬얼리 메이크업·타투·스페셜 체험 진행', '인쇄물(A1)'),
('진로DREAM(드림)', '진로체험 작품', '진로직업체험센터 및 지역사회의 진로 관련 기관들과 연계하여 다양한 진로와 직업활동을 직, 간접적으로 체험하면서 자신의 희망 진로와 관련하여 스스로 디자인한 작품 및 동아리 활동 전시', '인쇄물(A1)');
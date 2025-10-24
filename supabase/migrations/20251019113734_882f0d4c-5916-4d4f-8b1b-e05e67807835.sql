-- Create enum for user roles
create type public.app_role as enum ('student', 'admin');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(student_id, name)
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create user_roles table (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create booths table
create table public.booths (
  booth_id serial primary key,
  name text not null,
  description text,
  location text,
  teacher text,
  qr_code_value text not null,
  staff_pin text not null,
  quiz_answer text,
  created_at timestamptz not null default now()
);

alter table public.booths enable row level security;

create policy "Booths are viewable by authenticated users"
  on public.booths for select
  to authenticated
  using (true);

create policy "Admins can manage booths"
  on public.booths for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Create exhibitions table
create table public.exhibitions (
  exhibition_id serial primary key,
  club text not null,
  title text not null,
  type text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.exhibitions enable row level security;

create policy "Exhibitions are viewable by authenticated users"
  on public.exhibitions for select
  to authenticated
  using (true);

create policy "Admins can manage exhibitions"
  on public.exhibitions for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Create performances table
create table public.performances (
  performance_id serial primary key,
  order_num int not null,
  time text not null,
  team text not null,
  genre text not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique(order_num)
);

alter table public.performances enable row level security;

create policy "Performances are viewable by authenticated users"
  on public.performances for select
  to authenticated
  using (true);

create policy "Admins can manage performances"
  on public.performances for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Create stamp_logs table
create table public.stamp_logs (
  log_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  booth_id int references public.booths(booth_id) on delete cascade not null,
  method_used text not null,
  verified_at timestamptz not null default now(),
  unique(user_id, booth_id)
);

alter table public.stamp_logs enable row level security;

create policy "Users can view their own stamps"
  on public.stamp_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own stamps"
  on public.stamp_logs for insert
  with check (auth.uid() = user_id);

-- Create verify_stamp function (server-side verification)
create or replace function public.verify_stamp(
  p_user_id uuid,
  p_booth_id int,
  p_entered text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booth record;
  v_exists boolean;
begin
  -- Get booth data
  select booth_id, qr_code_value, staff_pin, quiz_answer
    into v_booth
    from booths
   where booth_id = p_booth_id;

  if not found then
    return false;
  end if;

  -- Check if stamp already exists
  select exists (
    select 1 from stamp_logs
     where user_id = p_user_id
       and booth_id = p_booth_id
  ) into v_exists;

  if v_exists then
    return false;
  end if;

  -- Verify input against booth codes
  if lower(trim(p_entered)) in (
      lower(v_booth.qr_code_value),
      lower(v_booth.staff_pin),
      lower(coalesce(v_booth.quiz_answer, ''))
  ) then
    insert into stamp_logs(user_id, booth_id, method_used, verified_at)
    values (p_user_id, p_booth_id, 'server_validated', now());
    return true;
  else
    return false;
  end if;
end;
$$;

revoke all on function public.verify_stamp(uuid, int, text) from public;
grant execute on function public.verify_stamp(uuid, int, text) to authenticated;

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, student_id, name)
  values (
    new.id,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'name'
  );
  
  -- Assign student role by default
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert initial booth data
insert into public.booths (name, description, location, teacher, qr_code_value, staff_pin, quiz_answer) values
('영어토론 프레젠테이션', '친구와 손잡고 오세요! 영어 스피드 퀴즈', '본관 부스 1', '지경주', 'QR001', 'PIN001', 'love'),
('ARTY 미술반', '미술 체험 활동', '본관 부스 2', '미술부', 'QR002', 'PIN002', 'art'),
('BUKU (독서토론반)', '독서 퀴즈 대회', '본관 부스 3', '국어부', 'QR003', 'PIN003', 'book'),
('빛글 (학생기자반)', '기사 작성 체험', '본관 부스 4', '국어부', 'QR004', 'PIN004', 'news'),
('한걸음', '전통 놀이 체험', '본관 부스 5', '체육부', 'QR005', 'PIN005', 'walk'),
('Ballin (배구동아리)', '배구 게임', '축구반', '체육부', 'QR006', 'PIN006', 'ball'),
('슬램덩크 (농구동아리)', '농구 슛 도전', '축구반', '체육부', 'QR007', 'PIN007', 'dunk'),
('애드미 찬양반', '찬양 체험', '본관 부스 6', '음악부', 'QR008', 'PIN008', 'praise'),
('영어토론 프레젠테이션', '영어 토론 참여', '과학3실', '영어부', 'QR009', 'PIN009', 'debate'),
('KIKKER (국제교류반)', '세계 문화 퀴즈', '과학3실', '사회부', 'QR010', 'PIN010', 'world'),
('STEAM 사회참여반', '사회 문제 토론', '과학3실', '사회부', 'QR011', 'PIN011', 'steam'),
('학생회', '학생회 소개', '과학3실', '학생회', 'QR012', 'PIN012', 'council'),
('캠페스트 (LabQuest)', '과학 실험 체험', '과학3실', '과학부', 'QR013', 'PIN013', 'lab'),
('슬기연 (또래상담반)', '상담 체험', '과학3실', '상담부', 'QR014', 'PIN014', 'counsel'),
('영어과학STEAM 주제연구반', '과학 탐구 체험', '미술1실', '과학부', 'QR015', 'PIN015', 'research'),
('영어과학STEAM 주제연구반', '과학 프로젝트 전시', '미술1실', '과학부', 'QR016', 'PIN016', 'project'),
('수탐 (수학의달인)', '수학 퀴즈', '미술2실', '수학부', 'QR017', 'PIN017', 'math'),
('영어과학실 AI·SW 코딩반', 'AI 체험', '융합과학실', '정보부', 'QR018', 'PIN018', 'coding'),
('늘품관 BUKU (독서토론반)', '독서 토론', '늘품관', '국어부', 'QR019', 'PIN019', 'reading'),
('빅데이터 인사이트', '데이터 분석 체험', '본관 부스 7', '정보부', 'QR020', 'PIN020', 'data');

-- Insert exhibition data
insert into public.exhibitions (club, title, type, description) values
('간호보건동아리', '사랑/스트레스 상황의 변화와 관리', '인쇄물(A1)', '사랑과 스트레스가 신체·감정에 미치는 영향과 관리법'),
('Be Creator', '축제 기획 자료 전시', '인쇄물(A1)', '성덕제 기획/운영 과정 아카이브'),
('ARTY 미술반', '학생 미술 작품 전시', '인쇄물(A1)', '학생들의 창작 미술 작품'),
('한걸음', '전통문화 자료', '인쇄물(A1)', '한국 전통 문화 소개'),
('슬램덩크', '농구 동아리 활동', '인쇄물(A1)', '동아리 활동 사진 및 성과'),
('KIKKER', '국제교류 활동', '인쇄물(A1)', '글로벌 문화 교류 자료'),
('STEAM 사회참여반', '사회 프로젝트', '인쇄물(A1)', '지역사회 참여 활동 결과'),
('학생회', '학생회 활동', '인쇄물(A1)', '학생회 1년 활동 요약'),
('캠페스트', '과학 실험 결과', '인쇄물(A1)', '과학 동아리 실험 보고서'),
('슬기연', '또래상담 사례', '인쇄물(A1)', '또래상담 활동 및 사례 연구'),
('수탐', '수학의 아름다움', '인쇄물(A1)', '수학 원리와 예술의 융합'),
('진로DREAM(드림)', '진로 탐색 결과물', '인쇄물(A1)', '지역기관 연계 직업체험 산출물');

-- Insert performance data
insert into public.performances (order_num, time, team, genre, content) values
(1, '13:00', '20436 김이수', '기타 솔로', '오프닝 연주'),
(2, '13:05', '학생회', '개회사·에티켓 영상', '개회사 및 예절 영상'),
(3, '13:15', '애드미 찬양팀', '밴드·찬양', '사랑을 노래하다'),
(4, '13:30', '혼성 밴드 (20627 최고은 외 3)', '밴드', '밴드 연주'),
(5, '13:45', '학생회', '시상식', '베스트 드레서 시상'),
(6, '13:50', '방송반', '영상', '방송제 영상 1'),
(7, '14:00', '뮤지컬부', '뮤지컬', '공연'),
(8, '14:20', '학생회', '이벤트', '현장 이벤트'),
(9, '14:30', '방송반', '영상', '방송제 영상 2'),
(10, '14:35', '1학년 여학생 팀', '댄스', '우아하게 + 젠틀맨'),
(11, '14:45', '양현기·김규린', '듀엣', '보컬 듀엣'),
(12, '14:50', '방송반', '영상', '방송제 영상 3'),
(13, '14:55', '2학년 여학생 팀', '댄스', 'Tell Me + 빠빠빠'),
(14, '15:05', '학생·교사 합동', '합창', '엄마가 딸에게'),
(15, '15:10', '여교사팀', '댄스', '교사 댄스 공연'),
(16, '15:20', '남교사팀', '중창', '남교사 중창'),
(17, '15:30', '루미너스', '댄스', '댄스 퍼포먼스'),
(18, '15:45', '이정원', '마술', '매직 쇼'),
(19, '16:00', '안상진 외 4명', '댄스', '뱅뱅뱅 + 챔피언'),
(20, '16:10', '방송반', '영상', '방송제 영상 4'),
(21, '16:15', '이준우 밴드', '밴드', 'Tik Tak Tok + 그대에게');
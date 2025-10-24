import { useState } from "react";
import { Heart, MapPin, Stamp, Plane, BookOpen, Flame, Gift, Bot, Palette, Theater, Leaf, Sparkles, Star, Camera, Users, Music, School, Target, CircleDot } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Festival = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"booths" | "exhibitions">("booths");

  const booths = [
    {
      name: "1. 영어토론프레젠테이션",
      subtitle: "English Debate & Presentation",
      icon: <Users className="w-6 h-6" />,
      tagline: "친구와 손잡고 오세요! 영어 스피드 퀴즈 💬",
      description: "짝꿍과 손잡고 빠르게 답을 맞혀보는 영어 토크 배틀!",
      location: "부스 1",
      teacher: "지경주"
    },
    {
      name: "2. KIKKER",
      subtitle: "International Exchange Club",
      icon: <Plane className="w-6 h-6" />,
      tagline: "전 세계 사랑을 전하는 KIKKER 항공, 지금 탑승하세요!",
      description: "탑승권을 받고 세계 곳곳의 사랑 문화를 탐험하는 글로벌 여행 🌍",
      location: "부스 2",
      teacher: "신희영"
    },
    {
      name: "3. STEAM 사회참여반",
      subtitle: "Social Participation Club",
      icon: <Flame className="w-6 h-6" />,
      tagline: "사랑의 단맛과 매운맛, 어떤 맛이 더 강할까?",
      description: "'전남친 토스트' 간식 부스 & 사랑의 매운맛 게임 도전!",
      location: "부스 3",
      teacher: "정재은, 이은영"
    },
    {
      name: "4. 학생회",
      subtitle: "Student Council",
      icon: <Users className="w-6 h-6" />,
      tagline: "우리의 축제는 우리가 만든다!",
      description: "학생회의 열정이 담긴 부스, 놓치지 마세요 ✨",
      location: "부스 4",
      teacher: "이은영"
    },
    {
      name: "5. LabQuest",
      subtitle: "Lab Quest",
      icon: <Sparkles className="w-6 h-6" />,
      tagline: "과학+사랑+쿠키의 만남!",
      description: "직접 만드는 분자모형 쿠키로 달콤한 실험을 즐겨요 🧪",
      location: "부스 5",
      teacher: "정유정"
    },
    {
      name: "6. 솔리언",
      subtitle: "Peer Counseling",
      icon: <Heart className="w-6 h-6" />,
      tagline: "작은 선물, 큰 마음",
      description: "뽑기판 속 메시지로 친구에게 따뜻한 마음을 전해요 🎁",
      location: "부스 6",
      teacher: "윤지숙"
    },
    {
      name: "7. 애드미 찬양반",
      subtitle: "Worship Team",
      icon: <Music className="w-6 h-6" />,
      tagline: "2025 애드미 버스킹 – '사랑을 노래하다'",
      description: "음악으로 전하는 축제의 진심, 마음이 따뜻해지는 무대 🎤",
      location: "부스 7",
      teacher: "안유린"
    },
    {
      name: "8. 빅데이터 투 인사이트",
      subtitle: "Big Data Club",
      icon: <School className="w-6 h-6" />,
      tagline: "데이터 속에 숨어있는 사랑을 찾아라!",
      description: "빅데이터로 세상을 읽는 특별한 인사이트 💻",
      location: "부스 8",
      teacher: "이영석"
    },
    {
      name: "9. ARTY 미술반",
      subtitle: "Art Club",
      icon: <Palette className="w-6 h-6" />,
      tagline: "사랑을 그리다, 나를 꾸미다",
      description: "페이스페인팅·쥬얼리 메이크업·타투 등 아트 체험존 💎",
      location: "부스 9",
      teacher: "이규화"
    },
    {
      name: "10. BUKU",
      subtitle: "Book Talk Club",
      icon: <BookOpen className="w-6 h-6" />,
      tagline: "연애 MBTI ✨ 운세 카페 ☕ 북클립 만들기 ✂️",
      description: "사랑과 감성이 만나는 북카페, 오늘의 운세는?",
      location: "부스 10 & 늘품관",
      teacher: "서수란"
    },
    {
      name: "11. 빛글",
      subtitle: "Student Press Club",
      icon: <Target className="w-6 h-6" />,
      tagline: "사랑을 찾아라!",
      description: "미션 카드에 맞는 사람을 직접 찾아 데려오는 탐정 게임 🧡",
      location: "부스 11",
      teacher: "이문덕"
    },
    {
      name: "12. 한걸음",
      subtitle: "Volunteer Club",
      icon: <Users className="w-6 h-6" />,
      tagline: "오늘은 내가 선생님!",
      description: "학생이 선생님이 되어 사랑을 나누는 하루 💫",
      location: "부스 12",
      teacher: "이동엽"
    },
    {
      name: "13. 슬램덩크",
      subtitle: "Basketball Club",
      icon: <CircleDot className="w-6 h-6" />,
      tagline: "사랑을 쏴라! 농구 커플 챌린지",
      description: "짝을 이뤄 슛을 성공시키면 상품은 짝꿍에게 💞",
      location: "부스 13",
      teacher: "조정현"
    },
    {
      name: "14. Ballin",
      subtitle: "Volleyball Club",
      icon: <CircleDot className="w-6 h-6" />,
      tagline: "러브 리시브 챌린지!",
      description: "배구 서브로 농구백보드 맞추기 & 언더핸드 골대 넣기 🏐",
      location: "부스 14",
      teacher: "박창민"
    },
    {
      name: "15. 축구반",
      subtitle: "Soccer Club",
      icon: <Target className="w-6 h-6" />,
      tagline: "사랑의 슛! 프리스타일 & 승부차기 챌린지",
      description: "승부차기 왕에게는 특별한 선물 ⚡",
      location: "부스 15",
      teacher: "현종명"
    },
    {
      name: "16. 물리를 만들다",
      subtitle: "Physics Club",
      icon: <Bot className="w-6 h-6" />,
      tagline: "과학의 재미를 한가득!",
      description: "골드버그 장치, 로봇·드론 조종체험, 랜덤 뽑기까지!",
      location: "과학 3실",
      teacher: "김기정"
    },
    {
      name: "17. 수달",
      subtitle: "Math Club",
      icon: <Target className="w-6 h-6" />,
      tagline: "수학으로 즐기는 사랑의 보드게임 카페",
      description: "두뇌와 감성을 함께 자극하는 수학 놀이터 ♟️",
      location: "미술 2실",
      teacher: "전승주"
    },
    {
      name: "18. 디자인공예반",
      subtitle: "Design & Craft Club",
      icon: <Gift className="w-6 h-6" />,
      tagline: "내가 사랑한 것을 굿즈로 만들자!",
      description: "직접 디자인한 사랑 굿즈 전시 & 체험 ✨",
      location: "과학 2실",
      teacher: "천혜심"
    },
    {
      name: "19. 융합과학 STEAM 주제연구반",
      subtitle: "STEAM Research Club",
      icon: <Target className="w-6 h-6" />,
      tagline: "사랑의 단서를 찾아 탈출하라!",
      description: "주어진 시간 안에 미션을 해결하는 방탈출 게임 🔍",
      location: "늘품관",
      teacher: "김성환, 박효민"
    },
    {
      name: "20. AI·SW 코딩반",
      subtitle: "Coding Club",
      icon: <Bot className="w-6 h-6" />,
      tagline: "AI와 사랑에 빠진 코딩 체험존",
      description: "아두이노 작품 전시, 햄스터봇 축구, 파이썬 미니게임!",
      location: "융합과학실",
      teacher: "김예지"
    }
  ];

  const exhibitions = [
    {
      name: "간호보건동아리",
      icon: <Heart className="w-6 h-6" />,
      tagline: "사랑할 때, 내 몸은 어떻게 반응할까?",
      description: "스트레스 상황에서의 변화와 관리법을 과학적으로 알아보는 부스!",
      teacher: "심보경"
    },
    {
      name: "Be Creator",
      icon: <Sparkles className="w-6 h-6" />,
      tagline: "축제를 만드는 사람들, 그들의 비밀 노트",
      description: "성덕제의 기획 여정을 한눈에! 기획서·아이디어·홍보 자료 등 창의력이 폭발하는 전시 💡",
      teacher: "박예은"
    },
    {
      name: "플로깅 동아리",
      icon: <Leaf className="w-6 h-6" />,
      tagline: "사랑은 줍는 것부터 시작돼요!",
      description: "걷고, 주우며, 지구를 사랑하는 플로깅 이야기 🌎 다양한 활동 사진과 자료 전시로 환경사랑을 전해요.",
      teacher: "이혜미"
    },
    {
      name: "사회정책탐구반",
      icon: <BookOpen className="w-6 h-6" />,
      tagline: "사회를 바꾸는 사랑, 정책으로 말하다",
      description: "청소년의 시선으로 사회문제를 분석하고 더 나은 세상을 위한 대안을 제시하는 정책 탐구 전시 🧠",
      teacher: "이은정"
    },
    {
      name: "친환경연구동아리",
      icon: <Leaf className="w-6 h-6" />,
      tagline: "지구를 사랑하는 생활 아이디어!",
      description: "재활용과 창의성을 더한 친환경 생활용품 전시 ♻️ 작은 실천으로 만드는 지속가능한 사랑 이야기.",
      teacher: "이윤주"
    },
    {
      name: "핸즈온 과학탐구반",
      icon: <Sparkles className="w-6 h-6" />,
      tagline: "손으로 만든 과학, 마음으로 담은 사랑",
      description: "학생들이 직접 진행한 소모임 연구 결과 전시 🧪 실험을 통해 발견한 호기심과 열정의 기록!",
      teacher: "오주현"
    },
    {
      name: "애니메이션 동아리",
      icon: <Star className="w-6 h-6" />,
      tagline: "사랑은 프레임 사이에 있다",
      description: "애니메이션이 만들어지는 과정과 그 속의 스토리텔링 💕 제작 과정 전시 + 애니메이션 체험 코너까지!",
      teacher: "김예원"
    },
    {
      name: "Guide Makers",
      icon: <BookOpen className="w-6 h-6" />,
      tagline: "내가 만든 박물관, 영어로 안내해볼까?",
      description: "직접 제작한 영문 안내서를 통해 학생들의 언어 감각과 창의력을 엿볼 수 있는 전시 ✈️",
      teacher: "박형진"
    },
    {
      name: "뷰티동아리",
      icon: <Sparkles className="w-6 h-6" />,
      tagline: "나를 사랑하는 가장 예쁜 방법",
      description: "퍼스널 컬러와 스타일링으로 '나'를 빛내는 뷰티 솔루션 전시 💋",
      teacher: "민소정"
    },
    {
      name: "STEAM 사회참여반",
      icon: <Flame className="w-6 h-6" />,
      tagline: "사랑의 단맛, 연구의 깊이",
      description: "사회 문제를 과학적 시선으로 풀어낸 탐구 보고서 전시와 연구 결과 공개 🧩",
      teacher: "정재은, 이은영"
    },
    {
      name: "ARTY 미술반",
      icon: <Palette className="w-6 h-6" />,
      tagline: "사랑을 그리다, 예술로 피어나다",
      description: "단체작 '사랑'과 개인작 전시 💕 페이스페인팅, 쥬얼리 메이크업, 타투 등 스페셜 체험으로 완성하는 예술적 사랑 🌹",
      teacher: "이규화"
    },
    {
      name: "진로 DREAM",
      icon: <Star className="w-6 h-6" />,
      tagline: "사랑하는 일을 찾아서 – 나의 꿈 전시",
      description: "다양한 직업 체험과 진로 탐색, 그리고 '나의 미래'를 스스로 디자인한 작품 전시 🌟",
      teacher: "박건희"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 to-blue-100/50" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block animate-bounce mb-4">
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            2025 성덕제 ❤️
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">
            사랑을 담다
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            사랑을 주제로 한 성덕제의 모든 체험과 전시를 한눈에!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 text-white gap-2"
              onClick={() => navigate("/stamps")}
            >
              <Stamp className="w-5 h-5" />
              스탬프 투어 시작하기
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 border-pink-300 text-pink-600 hover:bg-pink-50"
              onClick={() => navigate("/map")}
            >
              <MapPin className="w-5 h-5" />
              부스 배치도 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex gap-4 justify-center">
          <Button
            variant={activeTab === "booths" ? "default" : "outline"}
            className={activeTab === "booths" ? "bg-pink-500 hover:bg-pink-600" : "border-pink-300 text-pink-600 hover:bg-pink-50"}
            onClick={() => setActiveTab("booths")}
          >
            체험 부스
          </Button>
          <Button
            variant={activeTab === "exhibitions" ? "default" : "outline"}
            className={activeTab === "exhibitions" ? "bg-pink-500 hover:bg-pink-600" : "border-pink-300 text-pink-600 hover:bg-pink-50"}
            onClick={() => setActiveTab("exhibitions")}
          >
            전시 마당
          </Button>
        </div>
      </div>

      {/* Booths Section */}
      {activeTab === "booths" && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">체험 부스</h2>
            <p className="text-lg text-gray-600">사랑을 체험하고 느끼는 특별한 공간들</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booths.map((booth, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur border-pink-100"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 group-hover:scale-110 transition-transform">
                      {booth.icon}
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <CardTitle className="text-xl">{booth.name}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">{booth.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-pink-600 mb-2">{booth.tagline}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{booth.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📍 {booth.location}</p>
                    <p>👨‍🏫 {booth.teacher} 선생님</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Exhibitions Section */}
      {activeTab === "exhibitions" && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">🎨 전시 & 체험 마당</h2>
            <p className="text-lg text-gray-600">사랑으로 담아낸 성덕인의 생각과 이야기들</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.map((exhibition, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur border-purple-100"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 group-hover:scale-110 transition-transform">
                      {exhibition.icon}
                    </div>
                    <Sparkles className="w-4 h-4 text-pink-400 fill-pink-400" />
                  </div>
                  <CardTitle className="text-xl">{exhibition.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-purple-600 mb-2">{exhibition.tagline}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{exhibition.description}</p>
                  <div className="text-xs text-gray-500">
                    <p>👨‍🏫 {exhibition.teacher} 선생님</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quote Section */}
      <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-12 h-12 mx-auto mb-6 text-pink-500 fill-pink-500 animate-pulse" />
          <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-800 mb-4">
            "사랑이 있는 곳엔 늘 축제가 있다."
          </blockquote>
          <p className="text-gray-600">2025 성덕제에서 사랑의 모든 순간을 만나보세요</p>
        </div>
      </section>

      <Navigation />
    </div>
  );
};

export default Festival;

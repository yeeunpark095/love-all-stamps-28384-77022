import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Navigation from "@/components/Navigation";

type Zone = "main" | "seogwan";
type Booth = { id: number; name: string; emoji: string; x: number; y: number; zone: Zone };

// ⬇⬇⬇ 여기 BOOTHS 배열을 캘리브레이터에서 복사한 JSON으로 교체하세요 ⬇⬇⬇
const BOOTHS: Booth[] = [
  // 예시 기본값 — 실제 운영 시 캘리브레이터 JSON으로 대체
  { id: 1, name: "친환경동아리", emoji: "🌱", x: 14, y: 48, zone: "main" },
  { id: 2, name: "빅데이터투인사이트", emoji: "💾", x: 24.5, y: 48, zone: "main" },
  { id: 3, name: "미술반", emoji: "🎨", x: 35, y: 48, zone: "main" },
  { id: 4, name: "과학탐구반", emoji: "🔬", x: 45.5, y: 48, zone: "main" },
  { id: 5, name: "영어회화반", emoji: "💬", x: 56, y: 48, zone: "main" },
  { id: 6, name: "체육반", emoji: "⚽", x: 14, y: 68, zone: "main" },
  { id: 7, name: "음악반", emoji: "🎵", x: 24.5, y: 68, zone: "main" },
  { id: 8, name: "독서반", emoji: "📚", x: 35, y: 68, zone: "main" },
  { id: 9, name: "요리반", emoji: "🍳", x: 45.5, y: 68, zone: "main" },
  { id: 10, name: "댄스반", emoji: "💃", x: 56, y: 68, zone: "main" },
  { id: 11, name: "사진반", emoji: "📷", x: 14, y: 88, zone: "main" },
  { id: 12, name: "영화반", emoji: "🎬", x: 24.5, y: 88, zone: "main" },
  { id: 13, name: "봉사반", emoji: "🤝", x: 35, y: 88, zone: "main" },
  { id: 14, name: "토론반", emoji: "💭", x: 45.5, y: 88, zone: "main" },
  { id: 15, name: "창업반", emoji: "💼", x: 56, y: 88, zone: "main" },
  { id: 16, name: "AI·SW 코딩반", emoji: "🤖", x: 50, y: 50, zone: "seogwan" },
  { id: 17, name: "드론반", emoji: "🚁", x: 50, y: 65, zone: "seogwan" },
  { id: 18, name: "로봇반", emoji: "🦾", x: 50, y: 80, zone: "seogwan" },
  { id: 19, name: "3D프린팅반", emoji: "🖨️", x: 30, y: 50, zone: "seogwan" },
  { id: 20, name: "메이커반", emoji: "🔧", x: 70, y: 50, zone: "seogwan" },
];

const TOTAL = BOOTHS.length;
const LS_KEY = "seongdeok_stamp_progress_v1";

function usePersistentStamps() {
  const [stamped, setStamped] = useState<number[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setStamped(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(stamped));
  }, [stamped]);
  return { stamped, setStamped };
}

function BoothPin({ booth, stamped, onStamp }: { booth: Booth; stamped: number[]; onStamp: (b: Booth) => void }) {
  const done = stamped.includes(booth.id);
  const sizeRem = 2.1;
  return (
    <button
      className="absolute select-none"
      style={{
        left: `${booth.x}%`,
        top: `${booth.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={() => onStamp(booth)}
      aria-label={booth.name}
      title={`${booth.name} (${booth.x.toFixed(1)}%, ${booth.y.toFixed(1)}%)`}
    >
      {done ? (
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.28 }}
          className="text-red-600 font-extrabold drop-shadow"
          style={{ fontSize: `${sizeRem + 1}rem` }}
        >
          💮
        </motion.div>
      ) : (
        <motion.span whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.92 }} style={{ fontSize: `${sizeRem}rem` }}>
          {booth.emoji}
        </motion.span>
      )}
    </button>
  );
}

function MapBlock({
  title,
  bgUrl,
  zone,
  stamped,
  onStamp,
  height = 640,
  baseWidth = 1100,
}: {
  title: string;
  bgUrl: string;
  zone: Zone;
  stamped: number[];
  onStamp: (b: Booth) => void;
  height?: number;
  baseWidth?: number;
}) {
  const booths = useMemo(() => BOOTHS.filter((b) => b.zone === zone), [zone]);
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-xs text-muted-foreground">핀치 제스처로 확대/축소 가능</span>
      </div>
      <div className="w-full border rounded-xl overflow-hidden bg-card">
        <TransformWrapper minScale={0.7} maxScale={3} wheel={{ step: 0.1 }}>
          <TransformComponent>
            <div
              className="relative bg-center bg-contain bg-no-repeat"
              style={{ width: `${baseWidth}px`, height: `${height}px`, backgroundImage: `url(${bgUrl})` }}
            >
              {booths.map((b) => (
                <BoothPin key={b.id} booth={b} stamped={stamped} onStamp={onStamp} />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </section>
  );
}

export default function BoothMapPage() {
  const { stamped, setStamped } = usePersistentStamps();
  const [confetti, setConfetti] = useState(false);

  const onStamp = (b: Booth) => {
    if (stamped.includes(b.id)) {
      toast(`${b.name}은(는) 이미 완료!`);
      return;
    }
    const next = [...stamped, b.id];
    setStamped(next);
    toast.success(`${b.name} 스탬프 획득! 💮`);
    if (next.length === TOTAL) {
      setConfetti(true);
      toast.success("🎉 모든 부스 완주! 축하합니다!");
      setTimeout(() => setConfetti(false), 4500);
    }
  };

  const reset = () => {
    if (!confirm("진행률을 초기화할까요?")) return;
    localStorage.removeItem(LS_KEY);
    setStamped([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      <Toaster position="top-center" />
      
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">🗺️ 성덕제 부스 배치도</h1>
        <p className="text-white/90 text-sm">클릭해서 스탬프를 모아보세요!</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            진행률: <span className="font-bold text-foreground">{stamped.length}</span> / {TOTAL}
          </div>
          <button 
            onClick={reset} 
            className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
          >
            초기화
          </button>
        </div>

        <MapBlock title="본관 · 운동장 구역" bgUrl="/booth-main.png" zone="main" stamped={stamped} onStamp={onStamp} />
        <MapBlock title="서관존" bgUrl="/booth-seogwan.png" zone="seogwan" stamped={stamped} onStamp={onStamp} height={700} baseWidth={520} />

        {/* 플로팅 진행률 */}
        <div className="fixed bottom-20 right-4 bg-card/95 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border">
          진행률: {stamped.length} / {TOTAL}
        </div>

        {confetti && <Confetti recycle={false} numberOfPieces={420} />}
      </div>

      <Navigation />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";

/** =========================
 *  설정
 *  ========================= */
const TITLE = "성덕제 스탬프 도장판";
const LS_KEY = "seongdeok_stamp_board_v1";
const REQUIRE_PIN = false; // ← true 로 바꾸면 PIN 모드 (스태프가 입력해야 도장 찍힘)

/** (선택) PIN 검증 훅: 서버 RPC로 교체 가능 */
async function verifyPinServer(boothId: number, pin: string): Promise<boolean> {
  // TODO: Supabase RPC로 교체해 쓰세요. 예:
  // const { data, error } = await supabase.rpc('verify_pin', { booth_id: boothId, pin });
  // return !!data && !error;
  // 지금은 데모용(빈 PIN도 true로) — REQUIRE_PIN=true 로 켜면 "0000"만 OK 예시
  return pin === "0000";
}

/** 부스 목록 (원하는 순서대로 정렬) */
type Booth = { id: number; name: string; emoji: string };
const BOOTHS: Booth[] = [
  { id: 1,  name: "영어토론 프레젠테이션", emoji: "🗣️" },
  { id: 2,  name: "KIKKER(국제교류반)",  emoji: "✈️" },
  { id: 3,  name: "STEAM 사회참여반",    emoji: "🔬" },
  { id: 4,  name: "학생회",               emoji: "🏫" },
  { id: 5,  name: "랩퀘스트(LabQuest)",  emoji: "🧪" },
  { id: 6,  name: "솔리언(또래상담반)",   emoji: "💬" },
  { id: 7,  name: "빅데이터투인사이트",  emoji: "💾" },
  { id: 8,  name: "ARTY 미술반",          emoji: "🎨" },
  { id: 9,  name: "BUKU(독서토론반)",     emoji: "📚" },
  { id: 10,  name: "빛글(학생기자반)",     emoji: "📰" },
  { id: 11,  name: "한걸음",               emoji: "📚" },
  { id: 12,  name: "축구반",               emoji: "⚽" },
  { id: 13,  name: "슬램덩크(농구)",       emoji: "🏀" },
  { id: 14,  name: "Ballin(배구)",         emoji: "🏐" },
  { id: 15,  name: "애드미 찬양반",        emoji: "🎤" },
  { id: 16,  name: "물리를 만들다",        emoji: "⚛️" },
  { id: 17,  name: "Be creator",           emoji: "✨" },
  { id: 18,  name: "디자인공예반",        emoji: "🎁" },
  { id: 19,  name: "융합과학STEAM(연구)",  emoji: "🔭" },
  { id: 20,  name: "AI·SW 코딩반",        emoji: "🤖" },
];

/** 빨간 도장 SVG (텍스트 없음, 깔끔) */
function StampMark({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#c00" floodOpacity="0.5" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="48" fill="none" stroke="#d90429" strokeWidth="10" filter="url(#shadow)" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#d90429" strokeWidth="6" strokeDasharray="8 4" />
      <g transform="translate(60 64)">
        <text x="0" y="0" textAnchor="middle" fontWeight="900" fontFamily="system-ui, sans-serif" fontSize="24" fill="#d90429">
          💮
        </text>
      </g>
    </svg>
  );
}

/** 진행률 바 */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">진행률</span>
        <span className="text-muted-foreground">{current} / {total} ({pct}%)</span>
      </div>
      <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StampBoardPage() {
  const total = BOOTHS.length;
  const [stamped, setStamped] = useState<number[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [pinModal, setPinModal] = useState<{ open: boolean; booth?: Booth }>({ open: false });

  // 저장/복원
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setStamped(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(stamped));
  }, [stamped]);

  const remaining = useMemo(
    () => BOOTHS.filter(b => !stamped.includes(b.id)).map(b => b.name),
    [stamped]
  );

  const onStamp = async (booth: Booth) => {
    if (stamped.includes(booth.id)) {
      toast(`${booth.name} 이미 완료!`);
      return;
    }

    if (REQUIRE_PIN) {
      setPinModal({ open: true, booth });
      return;
    }

    doStamp(booth);
  };

  const doStamp = (booth: Booth) => {
    const next = [...stamped, booth.id];
    setStamped(next);
    toast.success(`${booth.name} 스탬프 획득!`);

    if (next.length === total) {
      setConfetti(true);
      toast.success("🎉 모든 부스 완주! 축하합니다!");
      setTimeout(() => setConfetti(false), 4500);
    }
  };

  const reset = () => {
    if (!confirm("도장판을 초기화할까요?")) return;
    localStorage.removeItem(LS_KEY);
    setStamped([]);
    toast("초기화 완료");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 px-4 py-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-extrabold">{TITLE}</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <ProgressBar current={stamped.length} total={total} />
            <button
              onClick={reset}
              className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm whitespace-nowrap transition-colors"
            >
              초기화
            </button>
          </div>
        </header>

        {/* 도장판 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {BOOTHS.map((b) => {
            const done = stamped.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => onStamp(b)}
                className={`relative group rounded-2xl p-4 h-36 border shadow-sm bg-card text-left
                            hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-ring`}
                aria-label={`${b.name} 도장`}
              >
                {/* 상단 이모지 */}
                <div className="text-3xl">{b.emoji}</div>
                {/* 이름 */}
                <div className="mt-2 font-semibold leading-tight pr-10">{b.name}</div>

                {/* 도장(완료 표시) */}
                <AnimatePresence>
                  {done && (
                    <motion.div
                      initial={{ scale: 3, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="absolute right-2 bottom-2"
                    >
                      <StampMark size={64} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 힌트 라벨 */}
                {!done && (
                  <div className="absolute right-2 bottom-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    탭해서 도장 찍기
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 남은 부스 안내(선택) */}
        {stamped.length < total && (
          <div className="mt-6 text-sm text-muted-foreground">
            남은 부스: {remaining.join(" · ")}
          </div>
        )}

        {/* 완료 폭죽 */}
        {confetti && <Confetti recycle={false} numberOfPieces={420} />}

        {/* PIN 모달 (옵션) */}
        <PinModal
          open={pinModal.open}
          booth={pinModal.booth}
          onClose={() => setPinModal({ open: false })}
          onVerified={() => {
            if (pinModal.booth) doStamp(pinModal.booth);
            setPinModal({ open: false });
          }}
        />
      </div>
    </div>
  );
}

/** 간단 PIN 모달 — REQUIRE_PIN=true일 때만 사용 */
function PinModal({
  open,
  booth,
  onClose,
  onVerified,
}: {
  open: boolean;
  booth?: Booth;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [pin, setPin] = useState("");

  if (!open || !booth) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl w-[90%] max-w-sm p-5 shadow-xl border">
        <h3 className="text-lg font-bold mb-1">스태프 확인</h3>
        <p className="text-sm text-muted-foreground mb-4">
          <b>{booth.name}</b> 부스 도장 확인용 PIN을 입력하세요.
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN (예: 0000)"
          inputMode="numeric"
          className="w-full border rounded-lg px-3 py-2 mb-4 bg-background"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            취소
          </button>
          <button
            onClick={async () => {
              const ok = await verifyPinServer(booth.id, pin);
              if (!ok) {
                toast.error("PIN 검증 실패");
                return;
              }
              onVerified();
              setPin("");
            }}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

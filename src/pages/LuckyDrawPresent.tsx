import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AdminGuard from "@/components/AdminGuard";

interface Winner {
  name: string;
  student_id: string;
}

export default function LuckyDrawPresent() {
  return (
    <AdminGuard>
      <LuckyDrawPresentContent />
    </AdminGuard>
  );
}

function LuckyDrawPresentContent() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDrumroll, setShowDrumroll] = useState(true);

  useEffect(() => {
    (async () => {
      console.log("Fetching winners...");
      const { data, error } = await supabase.rpc("ld_list_winners");
      console.log("Winners data:", data);
      console.log("Winners error:", error);
      if (error) {
        console.error("Error fetching winners:", error);
        alert("당첨자 목록을 불러올 수 없습니다: " + error.message);
        return;
      }
      console.log("Setting winners:", data?.length || 0, "winners");
      setWinners(data || []);
    })();
  }, []);

  useEffect(() => {
    if (!isPlaying || winners.length === 0 || revealedCount >= Math.min(5, winners.length)) return;
    const timer = setInterval(() => {
      if (showDrumroll) {
        // 드럼롤 중이면 당첨자 공개
        setShowDrumroll(false);
        setRevealedCount(prev => prev + 1);
      } else {
        // 당첨자 공개 중이면 다음 당첨자 드럼롤
        if (revealedCount < Math.min(5, winners.length)) {
          setShowDrumroll(true);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isPlaying, winners, showDrumroll, revealedCount]);

  const handleNext = () => {
    if (showDrumroll) {
      // 드럼롤 상태에서 다음 버튼 클릭 -> 당첨자 공개
      setShowDrumroll(false);
      setRevealedCount(prev => prev + 1);
    } else {
      // 당첨자 공개 상태에서 다음 버튼 클릭 -> 다음 당첨자 드럼롤
      if (revealedCount < Math.min(5, winners.length)) {
        setShowDrumroll(true);
      }
    }
  };

  if (!winners.length)
    return (
      <div className="h-screen flex items-center justify-center text-4xl text-muted-foreground">
        아직 당첨자가 없습니다 🎟
      </div>
    );

  const displayWinners = winners.slice(0, 5);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-pink-300 text-center relative overflow-hidden"
      style={{
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div className="absolute top-5 left-5 text-lg text-pink-800 font-semibold">
        🎉 성덕제 Love wins all
      </div>

      {showDrumroll && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-pink-200 to-pink-400 animate-pulse">
          <div className="text-center">
            <div className="text-8xl md:text-9xl font-black text-pink-900 mb-8 animate-bounce">
              🥁
            </div>
            <div className="text-6xl md:text-8xl font-extrabold text-pink-800 tracking-wider">
              두구두구두구...
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {displayWinners.map((winner, idx) => (
            <div
              key={idx}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl transition-all duration-700 ${
                idx < revealedCount && !showDrumroll
                  ? "scale-100 opacity-100"
                  : "scale-50 opacity-0"
              }`}
            >
              <div className="text-4xl md:text-5xl font-extrabold text-pink-800 mb-4 text-center animate-bounce">
                {winner.name}
              </div>
              <div className="text-2xl md:text-3xl font-mono text-gray-700 text-center">
                {winner.student_id}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 mt-auto mb-20 relative z-20">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 자동 발표"}
        </Button>
        <Button
          onClick={handleNext}
          variant="secondary"
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
          disabled={revealedCount >= Math.min(5, winners.length) && !showDrumroll}
        >
          ➡ {showDrumroll ? "공개" : "다음"}
        </Button>
      </div>

      <div className="absolute bottom-5 right-5 text-sm text-gray-600">
        총 {winners.length}명 | {revealedCount}/{Math.min(5, winners.length)} 공개
      </div>
    </div>
  );
}

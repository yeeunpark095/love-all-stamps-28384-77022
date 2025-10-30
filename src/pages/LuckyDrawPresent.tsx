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
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDrumroll, setShowDrumroll] = useState(true);
  const [revealWinner, setRevealWinner] = useState(false);

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
    if (!isPlaying || winners.length === 0) return;
    const timer = setInterval(() => {
      setShowDrumroll(true);
      setRevealWinner(false);
      
      setTimeout(() => {
        setShowDrumroll(false);
        setRevealWinner(true);
        setIndex((i) => (i + 1) % winners.length);
      }, 2000);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, winners]);

  const handleNext = () => {
    setShowDrumroll(true);
    setRevealWinner(false);
    
    setTimeout(() => {
      setShowDrumroll(false);
      setRevealWinner(true);
      setIndex((i) => (i + 1) % winners.length);
    }, 2000);
  };

  if (!winners.length)
    return (
      <div className="h-screen flex items-center justify-center text-4xl text-muted-foreground">
        아직 당첨자가 없습니다 🎟
      </div>
    );

  const current = winners[index];

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

      {!showDrumroll && (
        <div className={`transition-all duration-700 ${revealWinner ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <div className="text-6xl md:text-8xl font-extrabold text-pink-800 drop-shadow-lg mb-6 animate-bounce">
            {current.name}
          </div>

          <div className="text-4xl md:text-6xl font-mono text-gray-800 mb-10">
            {current.student_id}
          </div>
        </div>
      )}

      <div className="flex gap-6 mt-auto mb-20">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
          disabled={showDrumroll}
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 자동 발표"}
        </Button>
        <Button
          onClick={handleNext}
          variant="secondary"
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
          disabled={showDrumroll}
        >
          ➡ 다음
        </Button>
      </div>

      <div className="absolute bottom-5 right-5 text-sm text-gray-600">
        총 {winners.length}명 | {index + 1}/{winners.length}
      </div>
    </div>
  );
}

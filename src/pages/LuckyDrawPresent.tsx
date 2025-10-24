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

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("ld_list_winners");
      if (error) {
        console.error(error);
        alert("당첨자 목록을 불러올 수 없습니다.");
        return;
      }
      setWinners(data || []);
    })();
  }, []);

  useEffect(() => {
    if (!isPlaying || winners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % winners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, winners]);

  if (!winners.length)
    return (
      <div className="h-screen flex items-center justify-center text-4xl text-muted-foreground">
        아직 당첨자가 없습니다 🎟
      </div>
    );

  const current = winners[index];

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-pink-300 text-center transition-all duration-800"
      style={{
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      <div className="absolute top-5 left-5 text-lg text-pink-800 font-semibold">
        🎉 성덕제 Love wins all
      </div>

      <div className="text-6xl md:text-8xl font-extrabold text-pink-800 drop-shadow-lg animate-bounce mb-6">
        {current.name}
      </div>

      <div className="text-4xl md:text-6xl font-mono text-gray-800 mb-10">
        {current.student_id}
      </div>

      <div className="flex gap-6">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 자동 발표"}
        </Button>
        <Button
          onClick={() => setIndex((i) => (i + 1) % winners.length)}
          variant="secondary"
          className="px-8 py-6 text-2xl rounded-xl"
          size="lg"
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Award, MapPin, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

export default function MyStamps() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stamps, setStamps] = useState<Set<number>>(new Set());
  const [booths, setBooths] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: boothsData } = await supabase
        .from("booths_public")
        .select("*")
        .order("booth_id");
      setBooths(boothsData || []);

      const { data: stampsData } = await supabase
        .from("stamp_logs")
        .select("booth_id")
        .eq("user_id", user.id);
      
      const stampSet = new Set((stampsData || []).map(s => s.booth_id));
      setStamps(stampSet);
    };

    checkAuth();
  }, [navigate]);

  const progress = (stamps.size / 20) * 100;
  const isComplete = stamps.size === 20;

  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  const getRandomPastelColor = (index: number) => {
    const colors = [
      'from-pink-400 to-pink-500',
      'from-purple-400 to-purple-500',
      'from-blue-400 to-blue-500',
      'from-teal-400 to-teal-500',
      'from-green-400 to-green-500',
      'from-yellow-400 to-yellow-500',
      'from-orange-400 to-orange-500',
      'from-red-400 to-red-500',
    ];
    return colors[index % colors.length];
  };

  const getMotivationalMessage = (remaining: number) => {
    if (remaining === 0) return "🏆 완주! 최고예요!";
    if (remaining <= 3) return `🔥 ${remaining}개만 더! 거의 다 왔어요!`;
    if (remaining <= 7) return `💪 ${remaining}개 남았어요! 조금만 더!`;
    if (remaining <= 12) return `⭐ ${remaining}개 남았어요! 화이팅!`;
    return `🎯 ${remaining}개 남았어요! 시작이 반이에요!`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-3 animate-heart-pulse">
          <Heart className="w-10 h-10 text-white" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">내 스탬프</h1>
        {profile && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 inline-block">
            <p className="text-white text-base font-semibold">
              {profile.name}
            </p>
            <p className="text-white/90 text-sm">
              {profile.student_id}
            </p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/80 shadow-xl border-2 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              진행 상황
            </h2>
            <div className="text-3xl font-bold text-primary">{stamps.size} / 20</div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-6 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 flex items-center justify-end pr-3 shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && (
                <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>
              )}
            </div>
          </div>

          {isComplete ? (
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-5 border-2 border-primary/30 animate-heart-pulse">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-10 h-10 text-primary" />
                <div>
                  <p className="font-bold text-xl text-primary">LOVE MASTER ♥</p>
                  <p className="text-sm text-muted-foreground">완주를 축하합니다!</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-center">🎁 경품 수령 안내</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>본관 1층 안내데스크</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  오늘 16:30까지 방문하세요
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-bold text-primary mb-1">
                {getMotivationalMessage(20 - stamps.size)}
              </p>
              <p className="text-sm text-muted-foreground">
                조금만 더 힘내세요!
              </p>
            </div>
          )}
        </Card>

        {/* Stamp Grid */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">스탬프 컬렉션</h2>
          <div className="grid grid-cols-4 gap-3">
            {booths.map((booth, index) => {
              const hasStamp = stamps.has(booth.booth_id);
              const colorClass = getRandomPastelColor(index);
              return (
                <div
                  key={booth.booth_id}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-md ${
                    hasStamp
                      ? `bg-gradient-to-br ${colorClass} animate-heart-pulse`
                      : "bg-muted/50"
                  }`}
                >
                  <Heart
                    className={`w-8 h-8 ${hasStamp ? "text-white" : "text-muted-foreground"}`}
                    fill={hasStamp ? "currentColor" : "none"}
                  />
                  <span className={`text-xs font-bold ${hasStamp ? "text-white" : "text-muted-foreground"}`}>
                    #{booth.booth_id}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Booth Details */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">획득한 스탬프 상세</h2>
          {stamps.size === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              아직 획득한 스탬프가 없습니다<br />
              스탬프 투어를 시작해보세요!
            </p>
          ) : (
            <div className="space-y-3">
              {booths
                .filter(booth => stamps.has(booth.booth_id))
                .map((booth, index) => {
                  const colorClass = getRandomPastelColor(index);
                  return (
                    <div
                      key={booth.booth_id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                        <Heart className="w-5 h-5 text-white" fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{booth.name}</p>
                        <p className="text-xs text-muted-foreground">{booth.location}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        {!isComplete && (
          <Button
            onClick={() => navigate("/stamps")}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary"
          >
            스탬프 더 모으러 가기 ♥
          </Button>
        )}
      </div>

      <Navigation />
    </div>
  );
}

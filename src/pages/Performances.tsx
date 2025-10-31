import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Music, Clock, Users, Sparkles, Film, Mic, Radio } from "lucide-react";

export default function Performances() {
  const navigate = useNavigate();
  const [performances, setPerformances] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("performances")
        .select("*")
        .order("order_num");
      setPerformances(data || []);
    };

    checkAuth();
  }, [navigate]);

  const getCurrentPerformance = () => {
    // 10번 순서 공연을 현재 진행중으로 고정
    const currentPerf = performances.find(p => p.order_num === 10);
    return currentPerf?.performance_id || null;
  };

  const getGenreIcon = (genre: string) => {
    if (genre.includes('밴드')) return Music;
    if (genre.includes('댄스')) return Users;
    if (genre.includes('노래')) return Mic;
    if (genre.includes('영상') || genre.includes('방송')) return Film;
    if (genre.includes('이벤트')) return Sparkles;
    return Radio;
  };

  const getGenreColor = (genre: string) => {
    if (genre.includes('밴드')) return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    if (genre.includes('댄스')) return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
    if (genre.includes('노래')) return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    if (genre.includes('영상') || genre.includes('방송')) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    if (genre.includes('이벤트')) return 'bg-green-500/10 text-green-700 border-green-500/20';
    if (genre.includes('마술')) return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
    if (genre.includes('뮤지컬')) return 'bg-red-500/10 text-red-700 border-red-500/20';
    if (genre.includes('중창')) return 'bg-teal-500/10 text-teal-700 border-teal-500/20';
    return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  const currentPerfId = getCurrentPerformance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Music className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">공연 타임테이블</h1>
        </div>
        <p className="text-white/90 text-sm">2025 성덕제 공연 순서</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-2">
          {performances.map((perf, index) => {
            const isCurrent = perf.performance_id === currentPerfId;
            const GenreIcon = getGenreIcon(perf.genre);
            const genreColor = getGenreColor(perf.genre);
            
            return (
              <Card
                key={perf.performance_id}
                className={`overflow-hidden transition-all animate-fade-in ${
                  isCurrent
                    ? "bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary shadow-lg scale-[1.02]"
                    : "hover:shadow-md hover:border-primary/30"
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-0">
                  {/* 순서 번호 */}
                  <div
                    className={`flex-shrink-0 w-20 h-full flex flex-col items-center justify-center py-4 ${
                      isCurrent
                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">NO.</div>
                    <div className="text-2xl font-bold">{perf.order_num}</div>
                  </div>

                  <Separator orientation="vertical" className="h-20" />

                  {/* 시간 */}
                  <div className="flex-shrink-0 w-24 px-4 text-center">
                    <Clock className={`w-4 h-4 mx-auto mb-1 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                    <div className={`text-lg font-bold ${isCurrent ? "text-primary" : ""}`}>
                      {perf.time}
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-20" />

                  {/* 공연 내용 */}
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {isCurrent && (
                          <Badge variant="default" className="mb-2 animate-heart-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            현재 진행중
                          </Badge>
                        )}
                        <h3 className="font-bold text-lg mb-1 leading-tight">
                          {perf.content}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{perf.team}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`flex-shrink-0 ${genreColor} border`}
                      >
                        <GenreIcon className="w-3 h-3 mr-1" />
                        {perf.genre}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                          isCurrent
                            ? "bg-gradient-to-br from-primary to-secondary text-white"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {perf.order_num}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-bold ${isCurrent ? "text-primary" : ""}`}>
                          {perf.time}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${genreColor} border text-xs`}
                    >
                      <GenreIcon className="w-3 h-3 mr-1" />
                      {perf.genre}
                    </Badge>
                  </div>
                  
                  {isCurrent && (
                    <Badge variant="default" className="mb-2 animate-heart-pulse text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      현재 진행중
                    </Badge>
                  )}
                  
                  <h3 className="font-bold text-base mb-1 leading-tight">
                    {perf.content}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span>{perf.team}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Navigation />
    </div>
  );
}

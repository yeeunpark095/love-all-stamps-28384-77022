import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Music, Clock, Users, Sparkles, MapPin } from "lucide-react";

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
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    for (let i = 0; i < performances.length; i++) {
      const perf = performances[i];
      const nextPerf = performances[i + 1];
      
      if (currentTime >= perf.time && (!nextPerf || currentTime < nextPerf.time)) {
        return perf.performance_id;
      }
    }
    return null;
  };

  const currentPerfId = getCurrentPerformance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">공연 순서</h1>
        <p className="text-white/90 text-sm">오늘의 공연 타임테이블</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {performances.map((perf, index) => {
          const isCurrent = perf.performance_id === currentPerfId;
          return (
            <Card
              key={perf.performance_id}
              className={`p-5 transition-all animate-fade-in ${
                isCurrent
                  ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] animate-heart-pulse"
                  : "hover:shadow-lg hover:border-primary/20"
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                    isCurrent
                      ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {perf.order_num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={`w-5 h-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`font-bold text-lg ${isCurrent ? "text-primary" : ""}`}>
                      {perf.time}
                    </span>
                    {isCurrent && (
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center gap-1 animate-heart-pulse">
                        <Sparkles className="w-3 h-3" />
                        현재 진행중
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <h3 className="font-bold text-2xl mb-2">{perf.content}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{perf.team}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">📍강당</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-accent/30 rounded-full text-sm font-medium flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {perf.genre}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Navigation />
    </div>
  );
}

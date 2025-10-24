import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Heart, Map, Stamp, Calendar, Frame, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stampCount, setStampCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Get stamp count
      const { count } = await supabase
        .from("stamp_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setStampCount(count || 0);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다");
  };

  if (!user) return null;

  const quickLinks = [
    { icon: Map, label: "배치도", path: "/map", color: "from-primary to-secondary" },
    { icon: Frame, label: "전시 안내", path: "/exhibitions", color: "from-accent to-primary" },
    { icon: Calendar, label: "공연 순서", path: "/performances", color: "from-primary to-accent" },
    { icon: Stamp, label: "스탬프 투어", path: "/stamps", color: "from-secondary to-accent" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent p-8 text-center shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
          
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4 animate-heart-pulse shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <Heart className="w-12 h-12 text-white" fill="currentColor" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            2025 성덕제
          </h1>
          <p className="text-2xl text-white/95 font-semibold mb-6 drop-shadow-md">
            Love wins all
          </p>
          
          {profile && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
              <p className="text-white text-lg">
                <span className="font-bold">{profile.name}</span>님 환영합니다!
              </p>
              <p className="text-white/90 text-sm">학번: {profile.student_id}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stamp Progress */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/80 shadow-lg border-2 border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">스탬프 진행 상황</h2>
            <Stamp className="w-6 h-6 text-primary animate-heart-pulse" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">획득</span>
              <span className="font-bold text-lg text-primary">{stampCount} / 20</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                style={{ width: `${(stampCount / 20) * 100}%` }}
              />
            </div>
            
            {stampCount === 20 && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border-2 border-primary/20 animate-heart-pulse">
                <p className="text-center font-bold text-primary">
                  🎉 완주 축하합니다! 경품 수령처: 본관 1층 안내데스크 (16:30까지)
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/stamps")}
          className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 shadow-[0_10px_30px_hsl(var(--primary)/0.3)] animate-bounce-in"
          style={{ animation: "gentle-bounce 2s ease-in-out infinite" }}
        >
          <Stamp className="w-10 h-10 mr-3" />
          지금 바로 스탬프 투어 시작! 💗
        </Button>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.path}
                onClick={() => navigate(link.path)}
                className="p-6 cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-card to-card/80 shadow-lg border-2 border-transparent hover:border-primary/30 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${link.color} mb-3 group-hover:animate-heart-pulse shadow-md`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-center text-base group-hover:text-primary transition-colors">
                  {link.label}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <Navigation />
    </div>
  );
}

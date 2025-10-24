import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Map, Stamp, Calendar, Frame, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Navigation() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    };
    checkAdmin();
  }, []);

  const navItems = [
    { path: "/", icon: Home, label: "홈" },
    { path: "/map", icon: Map, label: "배치도" },
    { path: "/stamps", icon: Stamp, label: "스탬프 투어" },
    { path: "/exhibitions", icon: Frame, label: "전시" },
    { path: "/performances", icon: Calendar, label: "공연" },
    { path: "/my-stamps", icon: User, label: "내 스탬프" },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", icon: ShieldCheck, label: "관리자" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 shadow-[0_-10px_30px_-10px_hsl(var(--primary)/0.1)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-300 ${
                    isActive
                      ? "text-primary scale-110"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "animate-heart-pulse" : ""}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
    </nav>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function Exhibitions() {
  const navigate = useNavigate();
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("exhibitions")
        .select("*")
        .neq('club', 'STEAM사회참여반')
        .order("exhibition_id");
      setExhibitions(data || []);
    };

    checkAuth();
  }, [navigate]);

  const exhibitionEmojis: { [key: string]: string } = {
    '수달(수학의달인)': '📐',
    '기획전시 <이게 사랑인데?>': '💝',
    'Be creator': '✨',
    '간호보건동아리': '💊',
    '플로깅': '🌿',
    '사회정책탐구반': '⚖️',
    '친환경연구동아리': '🌱',
    '핸즈온 과학탐구반': '🧪',
    '애니메이션 동아리': '🎬',
    'Guide Makers': '🌏',
    '뷰티동아리': '✨',
    'STEAM사회참여반': '💡',
    'ARTY 미술반': '🎨',
    '진로DREAM(드림)': '🌟',
    '융합과학STEAM주제연구반': '🔬'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 pb-24">
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">전시 안내</h1>
        <p className="text-white/90 text-sm">다양한 동아리의 전시를 만나보세요</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Exhibition Grid - Album Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitions.map((exhibition, index) => {
            const emoji = exhibitionEmojis[exhibition.club] || '📚';
            
            return (
              <Card
                key={exhibition.exhibition_id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in group"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedExhibition({ ...exhibition, emoji })}
              >
                {/* Album Cover */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                  <span className="text-8xl z-10 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                </div>
                
                {/* Album Info */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-xl text-primary line-clamp-1">{exhibition.club}</h3>
                  <p className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                    {exhibition.title}
                  </p>
                  
                  {(exhibition.location || exhibition.teacher) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <span className="text-lg">👩‍🏫</span>
                      <p className="text-xs text-muted-foreground truncate">
                        {exhibition.location && <span>{exhibition.location}</span>}
                        {exhibition.location && exhibition.teacher && <span> · </span>}
                        {exhibition.teacher && <span>{exhibition.teacher} 선생님</span>}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {exhibitions.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">전시 정보를 불러오는 중...</p>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedExhibition} onOpenChange={() => setSelectedExhibition(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <span className="text-5xl">{selectedExhibition?.emoji}</span>
              {selectedExhibition?.club}
            </DialogTitle>
          </DialogHeader>
          {selectedExhibition && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                <p className="text-xl font-bold text-foreground">
                  {selectedExhibition.title}
                </p>
                {selectedExhibition.type && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedExhibition.type}
                  </p>
                )}
              </div>
              
              {selectedExhibition.description && (
                <div className="space-y-3">
                  <h4 className="font-bold text-lg">전시 소개</h4>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selectedExhibition.description}
                  </p>
                </div>
              )}
              
              {(selectedExhibition.location || selectedExhibition.teacher) && (
                <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg">
                  <span className="text-2xl">👩‍🏫</span>
                  <div className="text-sm space-y-1">
                    {selectedExhibition.location && (
                      <p>
                        장소: <span className="font-medium">{selectedExhibition.location}</span>
                      </p>
                    )}
                    {selectedExhibition.teacher && (
                      <p>
                        지도교사: <span className="font-medium">{selectedExhibition.teacher} 선생님</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Navigation />
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Trophy, Stamp, TrendingUp, Search, Download, BarChart3, Eye, EyeOff, Copy, Pencil, Trash2, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Booth {
  booth_id: number;
  name: string;
  description: string | null;
  location: string | null;
  teacher: string | null;
  staff_pin: string;
}

interface Entry {
  id: string;
  user_id: string;
  name: string;
  student_id: string;
  completed_at: string;
}

interface Participant {
  id: string;
  name: string;
  student_id: string;
  stamp_count: number;
}

interface BoothStats {
  booth_id: number;
  booth_name: string;
  visit_count: number;
}

export default function Admin() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [eligible, setEligible] = useState<Entry[]>([]);
  const [winners, setWinners] = useState<Entry[]>([]);
  const [sample, setSample] = useState<Entry[]>([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [rotatingPin, setRotatingPin] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [boothStats, setBoothStats] = useState<BoothStats[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePins, setVisiblePins] = useState<Set<number>>(new Set());
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editName, setEditName] = useState("");
  const [editStudentId, setEditStudentId] = useState("");
  const [deletingParticipantId, setDeletingParticipantId] = useState<string | null>(null);
  const [resettingPasswordId, setResettingPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  const loadBooths = async () => {
    const { data, error } = await supabase
      .from("booths")
      .select("booth_id, name, description, location, teacher, staff_pin")
      .order("booth_id", { ascending: true });

    if (error) {
      console.error("Error loading booths:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "부스 정보를 불러오는데 실패했습니다.",
      });
      return;
    }

    setBooths(data || []);
  };

  const loadLuckyDraw = async () => {
    setLoading(true);
    const [{ data: elig }, { data: win }] = await Promise.all([
      supabase.rpc("ld_list_eligible"),
      supabase.rpc("ld_list_winners"),
    ]);
    setEligible(elig || []);
    setWinners(win || []);
    setSample([]);
    setLoading(false);
  };

  const loadParticipants = async () => {
    // 모든 프로필과 스탬프 수 가져오기
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, student_id");

    if (!profiles) return;

    const participantData: Participant[] = [];
    
    for (const profile of profiles) {
      const { count } = await supabase
        .from("stamp_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      participantData.push({
        id: profile.id,
        name: profile.name,
        student_id: profile.student_id,
        stamp_count: count || 0,
      });
    }

    setParticipants(participantData);
    setTotalParticipants(profiles.length);
  };

  const loadBoothStats = async () => {
    const { data: stamps } = await supabase
      .from("stamp_logs")
      .select("booth_id");

    if (!stamps) return;

    const boothCounts: { [key: number]: number } = {};
    stamps.forEach((stamp) => {
      boothCounts[stamp.booth_id] = (boothCounts[stamp.booth_id] || 0) + 1;
    });

    const { data: boothsData } = await supabase
      .from("booths")
      .select("booth_id, name");

    if (!boothsData) return;

    const stats: BoothStats[] = boothsData.map((booth) => ({
      booth_id: booth.booth_id,
      booth_name: booth.name,
      visit_count: boothCounts[booth.booth_id] || 0,
    }));

    stats.sort((a, b) => b.visit_count - a.visit_count);
    setBoothStats(stats);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadBooths(), 
        loadLuckyDraw(), 
        loadParticipants(), 
        loadBoothStats()
      ]);
    };

    loadData();

    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      loadParticipants();
      loadBoothStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const pickRandom = async () => {
    const { data, error } = await supabase.rpc("ld_pick_random", { n: count });
    if (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "무작위 선택 실패",
      });
      console.error(error);
      return;
    }
    setSample(data || []);
    toast({
      title: "임시 선택 완료",
      description: `${data?.length || 0}명이 선택되었습니다. '당첨 확정'을 눌러주세요.`,
    });
  };

  const confirmWinners = async () => {
    if (sample.length === 0) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "먼저 무작위 후보를 선택하세요.",
      });
      return;
    }
    const ids = sample.map((s) => s.id);
    const { error } = await supabase.rpc("ld_confirm_winners", { p_ids: ids });
    if (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "당첨 확정에 실패했습니다.",
      });
      console.error(error);
      return;
    }
    await loadLuckyDraw();
    toast({
      title: "🎉 당첨 확정 완료!",
      description: `${ids.length}명의 당첨자가 확정되었습니다.`,
    });
  };

  const unsetWinner = async (id: string) => {
    const { error } = await supabase.rpc("ld_unset_winner", { p_id: id });
    if (error) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "취소 실패",
      });
      console.error(error);
      return;
    }
    await loadLuckyDraw();
    toast({
      title: "당첨 취소",
      description: "당첨이 취소되었습니다.",
    });
  };

  const exportCSV = (rows: Entry[], filename: string) => {
    const header = ["name", "student_id", "completed_at"];
    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((r) =>
          [r.name, r.student_id, new Date(r.completed_at).toISOString()].join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "CSV 내보내기 완료",
      description: `${filename} 파일이 다운로드되었습니다.`,
    });
  };

  const rotatePin = async (boothId: number) => {
    try {
      setRotatingPin(boothId);
      
      const newPin = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error } = await supabase
        .from("booths")
        .update({ staff_pin: newPin })
        .eq("booth_id", boothId);

      if (error) throw error;

      toast({
        title: "PIN 재발급 완료",
        description: `새 PIN: ${newPin}`,
      });

      await loadBooths();
    } catch (error) {
      console.error("Error rotating PIN:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "PIN 재발급 중 오류가 발생했습니다.",
      });
    } finally {
      setRotatingPin(null);
    }
  };

  const exportParticipantsCSV = () => {
    const header = ["이름", "학번", "스탬프 개수"];
    const csv =
      header.join(",") +
      "\n" +
      participants
        .map((p) => [p.name, p.student_id, p.stamp_count].join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "CSV 내보내기 완료",
      description: "참가자 명단이 다운로드되었습니다.",
    });
  };

  const exportBoothStatsCSV = () => {
    const header = ["부스명", "방문 횟수"];
    const csv =
      header.join(",") +
      "\n" +
      boothStats
        .map((s) => [s.booth_name, s.visit_count].join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booth_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "CSV 내보내기 완료",
      description: "부스 통계가 다운로드되었습니다.",
    });
  };

  const togglePinVisibility = (boothId: number) => {
    setVisiblePins((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(boothId)) {
        newSet.delete(boothId);
      } else {
        newSet.add(boothId);
        // 3초 후 자동 숨김
        setTimeout(() => {
          setVisiblePins((current) => {
            const updated = new Set(current);
            updated.delete(boothId);
            return updated;
          });
        }, 3000);
      }
      return newSet;
    });
  };

  const copyPinToClipboard = async (pin: string, boothName: string) => {
    try {
      await navigator.clipboard.writeText(pin);
      toast({
        title: "복사 완료",
        description: `${boothName}의 PIN이 클립보드에 복사되었습니다.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "복사 실패",
        description: "PIN 복사에 실패했습니다.",
      });
    }
  };

  const openEditDialog = (participant: Participant) => {
    setEditingParticipant(participant);
    setEditName(participant.name);
    setEditStudentId(participant.student_id);
  };

  const handleUpdateParticipant = async () => {
    if (!editingParticipant) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editName,
          student_id: editStudentId,
        })
        .eq("id", editingParticipant.id);

      if (error) throw error;

      toast({
        title: "수정 완료",
        description: "참가자 정보가 수정되었습니다.",
      });

      await loadParticipants();
      setEditingParticipant(null);
    } catch (error) {
      console.error("Error updating participant:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "참가자 정보 수정에 실패했습니다.",
      });
    }
  };

  const handleDeleteParticipant = async () => {
    if (!deletingParticipantId) return;

    try {
      // Delete related stamps first
      const { error: stampError } = await supabase
        .from("stamp_logs")
        .delete()
        .eq("user_id", deletingParticipantId);

      if (stampError) throw stampError;

      // Delete lucky draw entries
      const { error: luckyDrawError } = await supabase
        .from("lucky_draw_entries")
        .delete()
        .eq("user_id", deletingParticipantId);

      if (luckyDrawError) throw luckyDrawError;

      // Delete lucky draw tickets
      const { error: ticketsError } = await supabase
        .from("lucky_draw_tickets")
        .delete()
        .eq("user_id", deletingParticipantId);

      if (ticketsError) throw ticketsError;

      // Delete user roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deletingParticipantId);

      if (rolesError) throw rolesError;

      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingParticipantId);

      if (profileError) throw profileError;

      toast({
        title: "삭제 완료",
        description: "참가자가 삭제되었습니다.",
      });

      await loadParticipants();
      await loadLuckyDraw();
      setDeletingParticipantId(null);
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "참가자 삭제에 실패했습니다.",
      });
    }
  };

  const openResetPasswordDialog = (participantId: string) => {
    setResettingPasswordId(participantId);
    setNewPassword("");
  };

  const handleResetPassword = async () => {
    if (!resettingPasswordId || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: resettingPasswordId,
            newPassword: newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      toast({
        title: "비밀번호 재발급 완료",
        description: "새 비밀번호가 설정되었습니다.",
      });

      setResettingPasswordId(null);
      setNewPassword("");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message || "비밀번호 재발급에 실패했습니다.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const eligibleCount = eligible.length;
  const winnerCount = winners.length;
  const completedCount = participants.filter((p) => p.stamp_count >= 20).length;
  const topBooths = boothStats.slice(0, 3);

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student_id.includes(searchQuery)
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-24">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 shadow-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">🎉 성덕제 관리자 대시보드</h1>
            <p className="text-white/90 text-sm">실시간으로 축제를 관리하세요</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                대시보드
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                로그인 사용자
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-2" />
                참가자
              </TabsTrigger>
              <TabsTrigger value="booths">
                <Stamp className="w-4 h-4 mr-2" />
                부스 관리
              </TabsTrigger>
              <TabsTrigger value="luckydraw">
                <Trophy className="w-4 h-4 mr-2" />
                추첨
              </TabsTrigger>
            </TabsList>

            {/* 대시보드 탭 */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* 주요 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-foreground/70">전체 참여자</CardDescription>
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">{totalParticipants}명</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-foreground/70">완주자</CardDescription>
                      <Trophy className="w-5 h-5 text-secondary" />
                    </div>
                    <CardTitle className="text-4xl">{completedCount}명</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-foreground/70">완주율</CardDescription>
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <CardTitle className="text-4xl">
                      {totalParticipants > 0
                        ? Math.round((completedCount / totalParticipants) * 100)
                        : 0}
                      %
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-foreground/70">총 부스 수</CardDescription>
                      <Stamp className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-4xl">{booths.length}개</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* 인기 부스 TOP 3 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔥 인기 부스 TOP 3
                  </CardTitle>
                  <CardDescription>가장 많이 방문한 부스입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topBooths.map((booth, index) => (
                      <div
                        key={booth.booth_id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-3xl font-bold ${
                              index === 0
                                ? "text-yellow-500"
                                : index === 1
                                ? "text-gray-400"
                                : "text-orange-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{booth.booth_name}</p>
                            <p className="text-sm text-muted-foreground">
                              부스 #{booth.booth_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {booth.visit_count}
                          </p>
                          <p className="text-xs text-muted-foreground">방문 횟수</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportBoothStatsCSV}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      전체 부스 통계 CSV 다운로드
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 부스별 방문 현황 */}
              <Card>
                <CardHeader>
                  <CardTitle>부스별 방문 현황</CardTitle>
                  <CardDescription>모든 부스의 실시간 방문 횟수</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {boothStats.map((booth) => (
                      <div
                        key={booth.booth_id}
                        className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <p className="font-semibold text-sm truncate">{booth.booth_name}</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {booth.visit_count}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 로그인 사용자 탭 */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>로그인한 사용자 목록</CardTitle>
                  <CardDescription>
                    현재 시스템에 로그인한 모든 사용자를 확인할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="이름 또는 학번으로 검색..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" onClick={exportParticipantsCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        CSV 다운로드
                      </Button>
                    </div>

                    <div className="rounded-lg border">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-semibold">이름</th>
                            <th className="text-left p-3 font-semibold">학번</th>
                            <th className="text-center p-3 font-semibold">스탬프 수</th>
                            <th className="text-center p-3 font-semibold">추첨권</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParticipants.map((p, idx) => {
                            const ticketCount = 
                              p.stamp_count >= 20 ? 5 :
                              p.stamp_count >= 15 ? 3 :
                              p.stamp_count >= 10 ? 2 :
                              p.stamp_count >= 5 ? 1 : 0;
                            
                            return (
                              <tr
                                key={p.id}
                                className={`border-t ${
                                  idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                                }`}
                              >
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3">{p.student_id}</td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      p.stamp_count >= 20
                                        ? "bg-primary/20 text-primary"
                                        : p.stamp_count >= 10
                                        ? "bg-secondary/20 text-secondary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {p.stamp_count}/20
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="text-lg font-bold text-primary">
                                    {ticketCount > 0 ? `🎟️ ${ticketCount}` : "-"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filteredParticipants.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "검색 결과가 없습니다" : "로그인한 사용자가 없습니다"}
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">전체 사용자</p>
                          <p className="text-2xl font-bold text-primary">{participants.length}명</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">추첨권 1개 이상</p>
                          <p className="text-2xl font-bold text-secondary">
                            {participants.filter(p => p.stamp_count >= 5).length}명
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">추첨권 3개 이상</p>
                          <p className="text-2xl font-bold text-accent">
                            {participants.filter(p => p.stamp_count >= 15).length}명
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">완주자 (5개)</p>
                          <p className="text-2xl font-bold text-primary">
                            {participants.filter(p => p.stamp_count >= 20).length}명
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 참가자 관리 탭 */}
            <TabsContent value="participants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>참가자 명단</CardTitle>
                  <CardDescription>
                    전체 {participants.length}명 | 완주 {completedCount}명
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 검색 */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="이름 또는 학번으로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={exportParticipantsCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>

                  {/* 참가자 리스트 */}
                  <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left">이름</th>
                          <th className="px-4 py-3 text-left">학번</th>
                          <th className="px-4 py-3 text-center">스탬프</th>
                          <th className="px-4 py-3 text-center">진행률</th>
                          <th className="px-4 py-3 text-center">상태</th>
                          <th className="px-4 py-3 text-center">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParticipants.map((p) => {
                          const progress = Math.round((p.stamp_count / 20) * 100);
                          return (
                            <tr key={p.id} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium">{p.name}</td>
                              <td className="px-4 py-3 font-mono text-sm">
                                {p.student_id}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-bold text-primary">
                                  {p.stamp_count}
                                </span>
                                <span className="text-muted-foreground"> / 20</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {progress}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {p.stamp_count >= 20 ? (
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    완주
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    진행중
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditDialog(p)}
                                    className="h-8 w-8 p-0"
                                    title="정보 수정"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openResetPasswordDialog(p.id)}
                                    className="h-8 w-8 p-0"
                                    title="비밀번호 재발급"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeletingParticipantId(p.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title="삭제"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 부스 관리 탭 */}
            <TabsContent value="booths" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>부스 PIN 관리</CardTitle>
                  <CardDescription>
                    각 부스의 인증 PIN을 관리합니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">부스 ID</th>
                          <th className="px-4 py-2 text-left">부스명</th>
                          <th className="px-4 py-2 text-left">위치</th>
                          <th className="px-4 py-2 text-left">담당 교사</th>
                          <th className="px-4 py-2 text-left">PIN</th>
                          <th className="px-4 py-2 text-left">액션</th>
                        </tr>
                      </thead>
                      <tbody>
                        {booths.map((booth) => {
                          const isPinVisible = visiblePins.has(booth.booth_id);
                          return (
                            <tr key={booth.booth_id} className="border-t">
                              <td className="px-4 py-2">{booth.booth_id}</td>
                              <td className="px-4 py-2">{booth.name}</td>
                              <td className="px-4 py-2">{booth.location || "-"}</td>
                              <td className="px-4 py-2">{booth.teacher || "-"}</td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold text-lg ${isPinVisible ? "text-primary" : ""}`}>
                                    {isPinVisible ? booth.staff_pin : "••••••"}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => togglePinVisibility(booth.booth_id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    {isPinVisible ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyPinToClipboard(booth.staff_pin, booth.name)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rotatePin(booth.booth_id)}
                                  disabled={rotatingPin === booth.booth_id}
                                >
                                  {rotatingPin === booth.booth_id ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      재발급 중...
                                    </>
                                  ) : (
                                    "PIN 재발급"
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 추첨 탭 */}
            <TabsContent value="luckydraw" className="space-y-6">
              {/* Lucky Draw Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>완주자 (eligible)</CardDescription>
                  <CardTitle className="text-3xl">{eligibleCount}명</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportCSV(eligible, "eligible.csv")}
                    disabled={eligibleCount === 0}
                  >
                    CSV 내보내기
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>당첨자 (winners)</CardDescription>
                  <CardTitle className="text-3xl">{winnerCount}명</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportCSV(winners, "winners.csv")}
                    disabled={winnerCount === 0}
                  >
                    CSV 내보내기
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>추첨 인원 설정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={Math.max(1, eligibleCount)}
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value || "1", 10))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">명</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={pickRandom}
                      disabled={eligibleCount === 0 || loading}
                      size="sm"
                    >
                      🎲 무작위 선택
                    </Button>
                    <Button
                      onClick={confirmWinners}
                      variant="secondary"
                      disabled={sample.length === 0 || loading}
                      size="sm"
                    >
                      ✅ 당첨 확정
                    </Button>
                  </div>
                  {sample.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      임시 선택 {sample.length}명 — 확정 전까지 저장되지 않습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Temporary Sample */}
            {sample.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>임시 선택 (확정 전)</CardTitle>
                  <CardDescription>
                    '당첨 확정'을 눌러야 DB에 저장됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">이름</th>
                          <th className="px-4 py-2 text-left">학번</th>
                          <th className="px-4 py-2 text-left">완주시간</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sample.map((s) => (
                          <tr key={s.id} className="border-t">
                            <td className="px-4 py-2">{s.name}</td>
                            <td className="px-4 py-2 font-mono">{s.student_id}</td>
                            <td className="px-4 py-2">{new Date(s.completed_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Winners List */}
            <Card>
              <CardHeader>
                <CardTitle>당첨자 목록</CardTitle>
                <CardDescription>
                  확정된 당첨자들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    onClick={() => window.open("/admin/lucky-draw/present", "_blank")}
                    disabled={winners.length === 0}
                  >
                    🎤 발표 화면 열기
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">이름</th>
                        <th className="px-4 py-2 text-left">학번</th>
                        <th className="px-4 py-2 text-left">완주시간</th>
                        <th className="px-4 py-2 text-left">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map((w) => (
                        <tr key={w.id} className="border-t">
                          <td className="px-4 py-2">{w.name}</td>
                          <td className="px-4 py-2 font-mono">{w.student_id}</td>
                          <td className="px-4 py-2">{new Date(w.completed_at).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("정말 당첨을 취소할까요?")) {
                                  unsetWinner(w.id);
                                }
                              }}
                            >
                              당첨 취소
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {winners.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                            아직 당첨자가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Booth Management */}
            <Card>
              <CardHeader>
                <CardTitle>부스 PIN 관리</CardTitle>
                <CardDescription>
                  각 부스의 PIN을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">부스 ID</th>
                        <th className="px-4 py-2 text-left">부스명</th>
                        <th className="px-4 py-2 text-left">위치</th>
                        <th className="px-4 py-2 text-left">담당 교사</th>
                        <th className="px-4 py-2 text-left">PIN</th>
                        <th className="px-4 py-2 text-left">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booths.map((booth) => (
                        <tr key={booth.booth_id} className="border-t">
                          <td className="px-4 py-2">{booth.booth_id}</td>
                          <td className="px-4 py-2">{booth.name}</td>
                          <td className="px-4 py-2">{booth.location || "-"}</td>
                          <td className="px-4 py-2">{booth.teacher || "-"}</td>
                          <td className="px-4 py-2 font-mono font-bold text-lg">
                            {booth.staff_pin}
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rotatePin(booth.booth_id)}
                              disabled={rotatingPin === booth.booth_id}
                            >
                              {rotatingPin === booth.booth_id ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  재발급 중...
                                </>
                              ) : (
                                "PIN 재발급"
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 참가자 수정 다이얼로그 */}
        <Dialog open={editingParticipant !== null} onOpenChange={() => setEditingParticipant(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>참가자 정보 수정</DialogTitle>
              <DialogDescription>
                참가자의 이름과 학번을 수정할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">이름</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-student-id">학번</Label>
                <Input
                  id="edit-student-id"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="학번을 입력하세요"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingParticipant(null)}>
                취소
              </Button>
              <Button onClick={handleUpdateParticipant}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 참가자 삭제 확인 다이얼로그 */}
        <AlertDialog open={deletingParticipantId !== null} onOpenChange={() => setDeletingParticipantId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>참가자 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 참가자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 모든 데이터(스탬프, 추첨 정보 등)가 함께 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteParticipant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 비밀번호 재발급 다이얼로그 */}
        <Dialog open={resettingPasswordId !== null} onOpenChange={() => setResettingPasswordId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>비밀번호 재발급</DialogTitle>
              <DialogDescription>
                참가자의 새로운 비밀번호를 설정하세요. (최소 6자)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  비밀번호는 최소 6자 이상이어야 합니다.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResettingPasswordId(null)} disabled={resetLoading}>
                취소
              </Button>
              <Button onClick={handleResetPassword} disabled={resetLoading || !newPassword}>
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    재발급 중...
                  </>
                ) : (
                  "재발급"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}

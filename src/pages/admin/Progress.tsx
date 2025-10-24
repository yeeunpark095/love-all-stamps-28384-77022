import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminGuard from "@/components/AdminGuard";

type ProgressRow = {
  user_id: string;
  name: string;
  student_id: string;
  stamps: number;
  required_total: number;
  completed: boolean;
  last_stamp_at: string | null;
};

export default function AdminProgress() {
  return (
    <AdminGuard>
      <ProgressContent />
    </AdminGuard>
  );
}

function ProgressContent() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(false);

  const pageSize = 200;

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_progress", {
      p_search: q || null,
      p_page: page,
      p_page_size: pageSize,
      p_order: "completed desc, stamps desc, last_stamp_at desc nulls last, student_id asc",
    });
    setLoading(false);
    if (error) {
      console.error("Error fetching progress:", error);
      alert(error.message);
      return;
    }
    setRows((data as ProgressRow[]) ?? []);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pct = (r: ProgressRow) =>
    r.required_total ? Math.round((r.stamps / r.required_total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">관리자 · 참가자 진행 현황</h1>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            관리자 메뉴로
          </Button>
        </div>

        <Card className="p-4 mb-4">
          <div className="flex gap-2">
            <Input
              className="w-64"
              placeholder="이름/학번 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(0);
                  fetchRows();
                }
              }}
            />
            <Button
              onClick={() => {
                setPage(0);
                fetchRows();
              }}
            >
              검색
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setPage(0);
                fetchRows();
              }}
            >
              초기화
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">이름</th>
                  <th className="px-3 py-3 text-left font-semibold">학번</th>
                  <th className="px-3 py-3 text-right font-semibold">스탬프</th>
                  <th className="px-3 py-3 text-left font-semibold">진행률</th>
                  <th className="px-3 py-3 text-center font-semibold">완료</th>
                  <th className="px-3 py-3 text-left font-semibold">마지막 스탬프</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.user_id} className="border-t border-border/50 hover:bg-muted/30">
                    <td className="px-3 py-3">{r.name}</td>
                    <td className="px-3 py-3">{r.student_id}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {r.stamps} / {r.required_total}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-40 bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              r.completed ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${pct(r)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct(r)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.completed ? <span className="text-xl">✅</span> : ""}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">
                      {r.last_stamp_at
                        ? new Date(r.last_stamp_at).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !loading && (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      로딩 중...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground px-3">페이지 {page + 1}</span>
          <Button
            variant="outline"
            disabled={loading || rows.length < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

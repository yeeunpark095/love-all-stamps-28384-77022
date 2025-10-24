import { useEffect, useRef, useState } from "react";

type Zone = "main" | "seogwan";
type Point = {
  id: number;
  name: string;
  emoji: string;
  x: number; // percent (0~100)
  y: number; // percent
  zone: Zone;
};

const DEFAULT_BG: Record<Zone, string> = {
  main: "/booth-main.png",
  seogwan: "/booth-seogwan.png",
};

export default function MapCalibrator() {
  const [zone, setZone] = useState<Zone>("main");
  const [bg, setBg] = useState<string>(DEFAULT_BG.main);
  const [points, setPoints] = useState<Point[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      setSize({
        w: containerRef.current.clientWidth,
        h: containerRef.current.clientHeight,
      });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setBg(zone === "main" ? DEFAULT_BG.main : DEFAULT_BG.seogwan);
  }, [zone]);

  const addPointAt = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPx = clientX - rect.left;
    const yPx = clientY - rect.top;
    const x = Math.max(0, Math.min(100, (xPx / rect.width) * 100));
    const y = Math.max(0, Math.min(100, (yPx / rect.height) * 100));
    const id = (points.at(-1)?.id ?? 0) + 1;
    const p: Point = {
      id,
      name: `부스 ${id}`,
      emoji: "⛺",
      x,
      y,
      zone,
    };
    setPoints((prev) => [...prev, p]);
    setSelected(id);
  };

  const onBackgroundClick = (e: React.MouseEvent) => {
    // 배경 클릭 시 포인트 추가 (점 위 클릭은 무시)
    if ((e.target as HTMLElement).dataset.point === "true") return;
    addPointAt(e.clientX, e.clientY);
  };

  const startDrag = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const target = points.find((p) => p.id === id);
    if (!target || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sx = target.x;
    const sy = target.y;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nx = Math.max(0, Math.min(100, sx + (dx / rect.width) * 100));
      const ny = Math.max(0, Math.min(100, sy + (dy / rect.height) * 100));
      setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, x: nx, y: ny } : p)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const removePoint = (id: number) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selected === id) setSelected(null);
  };

  const loadJSON = () => {
    const raw = prompt("붙여넣기(JSON):");
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as Point[];
      setPoints(arr);
      alert("불러오기 완료");
    } catch {
      alert("JSON 파싱 실패");
    }
  };

  const downloadJSON = () => {
    const data = JSON.stringify(points, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booths-calibrated.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    const text = JSON.stringify(points, null, 2);
    navigator.clipboard.writeText(text);
    alert("클립보드에 복사됨");
  };

  const sel = points.find((p) => p.id === selected) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4">
      {/* 좌: 미리보기/클릭 영역 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <select
            className="border rounded px-2 py-1"
            value={zone}
            onChange={(e) => setZone(e.target.value as Zone)}
            title="작업할 존 선택"
          >
            <option value="main">본관/운동장</option>
            <option value="seogwan">서관존</option>
          </select>

          <label className="text-sm text-muted-foreground">
            (이미지 경로를 바꾸려면 입력){" "}
          </label>
          <input
            className="border rounded px-2 py-1 w-72"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            placeholder="/booth-main.png"
          />
        </div>

        <div
          ref={containerRef}
          onClick={onBackgroundClick}
          className="relative w-full rounded-xl border overflow-hidden bg-center bg-contain bg-no-repeat"
          style={{
            height: zone === "main" ? 640 : 700,
            backgroundImage: `url(${bg})`,
          }}
        >
          {points
            .filter((p) => p.zone === zone)
            .map((p) => {
              const isSel = selected === p.id;
              return (
                <div
                  key={p.id}
                  data-point="true"
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move select-none`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onMouseDown={(e) => startDrag(p.id, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(p.id);
                  }}
                  title={`${p.name} (${p.x.toFixed(1)}%, ${p.y.toFixed(1)}%)`}
                >
                  <div
                    className={`text-3xl ${isSel ? "ring-2 ring-pink-500 rounded-lg" : ""}`}
                  >
                    {p.emoji}
                  </div>
                  <div className="text-[11px] bg-white/85 px-1 rounded mt-0.5">
                    {p.id}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          · 배경을 클릭하면 새 점이 추가됩니다. 점을 드래그해서 미세 조정하세요.  
          · 점을 클릭하면 우측 패널에서 이름/이모지/아이디/좌표를 수정할 수 있어요.
        </div>
      </div>

      {/* 우: 속성/목록/내보내기 */}
      <div className="rounded-xl border p-3">
        <h2 className="font-bold mb-2">포인트 목록({points.length})</h2>

        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => {
              setPoints([]);
              setSelected(null);
            }}
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80"
          >
            전체 초기화
          </button>
          <button onClick={loadJSON} className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80">
            불러오기(JSON)
          </button>
          <button onClick={copyJSON} className="px-3 py-1 rounded bg-primary text-primary-foreground">
            복사(JSON)
          </button>
          <button onClick={downloadJSON} className="px-3 py-1 rounded bg-foreground text-background">
            다운로드(JSON)
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto space-y-2">
          {points.map((p) => (
            <div
              key={p.id}
              className={`border rounded p-2 cursor-pointer ${selected === p.id ? "border-primary" : ""}`}
              onClick={() => setSelected(p.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">
                  #{p.id} {p.name} <span className="ml-1">{p.emoji}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePoint(p.id);
                  }}
                  className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  삭제
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <label className="flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">ID</span>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={p.id}
                    onChange={(e) =>
                      setPoints((prev) =>
                        prev.map((q) => (q === p ? { ...q, id: parseInt(e.target.value || "0", 10) } : q))
                      )
                    }
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">존</span>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={p.zone}
                    onChange={(e) =>
                      setPoints((prev) => prev.map((q) => (q === p ? { ...q, zone: e.target.value as Zone } : q)))
                    }
                  >
                    <option value="main">main</option>
                    <option value="seogwan">seogwan</option>
                  </select>
                </label>
                <label className="col-span-2 flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">이름</span>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={p.name}
                    onChange={(e) =>
                      setPoints((prev) => prev.map((q) => (q === p ? { ...q, name: e.target.value } : q)))
                    }
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">이모지</span>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={p.emoji}
                    onChange={(e) =>
                      setPoints((prev) => prev.map((q) => (q === p ? { ...q, emoji: e.target.value } : q)))
                    }
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">X%</span>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={p.x.toFixed(2)}
                    onChange={(e) =>
                      setPoints((prev) =>
                        prev.map((q) =>
                          q === p ? { ...q, x: Math.max(0, Math.min(100, parseFloat(e.target.value || "0"))) } : q
                        )
                      )
                    }
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="w-16 text-muted-foreground">Y%</span>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={p.y.toFixed(2)}
                    onChange={(e) =>
                      setPoints((prev) =>
                        prev.map((q) =>
                          q === p ? { ...q, y: Math.max(0, Math.min(100, parseFloat(e.target.value || "0"))) } : q
                        )
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {sel && (
          <div className="mt-3 text-xs text-muted-foreground">
            선택: #{sel.id} — {sel.name} / {sel.emoji} / {sel.zone} /{" "}
            {sel.x.toFixed(2)}%, {sel.y.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}

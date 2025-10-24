import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  studentId: z
    .string()
    .length(6, "학번은 6자리여야 합니다")
    .regex(/^\d{6}$/, "학번은 숫자만 입력 가능합니다"),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다").max(50, "이름은 50자 이하여야 합니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .regex(/[A-Z]/, "대문자를 포함해야 합니다")
    .regex(/[a-z]/, "소문자를 포함해야 합니다")
    .regex(/[0-9]/, "숫자를 포함해야 합니다"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const email = `${formData.studentId}@seongdeok.kr`;
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("학번 또는 비밀번호가 올바르지 않습니다");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("로그인 성공!");
        navigate("/");
      } else {
        // Signup validation
        const validation = signupSchema.safeParse(formData);
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          return;
        }

        const email = `${formData.studentId}@seongdeok.kr`;
        const { error } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              student_id: formData.studentId,
              name: formData.name,
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("이미 가입된 학번입니다");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("회원가입 성공! 로그인해주세요");
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 animate-heart-pulse shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
            <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            2025 성덕제
          </h1>
          <p className="text-xl text-muted-foreground mt-2 font-medium">Love wins all</p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-card/80 shadow-xl border-2 border-primary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-semibold">
                학번 (6자리)
              </Label>
              <Input
                id="studentId"
                type="text"
                placeholder="예: 010101 (1학년 1반 1번)"
                maxLength={6}
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="h-12 text-lg border-2 focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                학년(2자리) + 반(2자리) + 번호(2자리)
              </p>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="name" className="text-sm font-semibold">
                  이름
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 text-lg border-2 focus:border-primary transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 text-lg border-2 focus:border-primary transition-colors"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  8자 이상, 대소문자 및 숫자 포함
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              {loading ? "처리중..." : isLogin ? "로그인" : "회원가입"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
            </button>
          </div>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          사랑으로 연결되는 오늘, 우리의 축제 ♥
        </p>
      </div>
    </div>
  );
}

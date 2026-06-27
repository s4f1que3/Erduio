"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, BookOpen, Calendar, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { saveSession, getSession, getRoleRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Footer } from "@/components/layout/footer";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const redirect = getRoleRedirect(session.user.role);
      if (redirect) router.replace(redirect);
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await api.post("/auth/Signin", { email: data.email, password: data.password });
      const session = saveSession(res.data);
      const redirect = getRoleRedirect(session.user.role);
      if (!redirect) {
        toast.error("Your account isn't set up with a valid role yet. Contact your school administrator.");
        return;
      }
      toast.success(`Welcome back!`);
      router.replace(redirect);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-90" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-400/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative z-10 text-center text-primary-foreground max-w-sm">
          <h1 className="text-3xl font-bold mb-3">Welcome to Erduio</h1>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            A complete school management platform for admins, teachers, students, and parents.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Student Portals", desc: "Track courses, attendance, and more", icon: BookOpen },
              { label: "Teacher Tools", desc: "Manage notes, grades, exams, and more", icon: Calendar },
              { label: "Admin Control", desc: "Full school management", icon: ShieldCheck },
              { label: "Parent View", desc: "Child progress at a glance", icon: Users },
            ].map((item) => (
              <div key={item.label} className="bg-primary-foreground/10 rounded-lg p-3">
                <div className="w-7 h-7 rounded-md bg-primary-foreground/15 flex items-center justify-center mb-2">
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-background to-muted/40 p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Image
            src="/erduio-wordmark.png"
            alt="Erduio"
            width={299}
            height={137}
            className="h-14 w-auto mb-8"
            priority
          />
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
              <p className="text-muted-foreground text-sm mt-1">Enter your credentials to access your portal</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  autoComplete="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              For any account issues, please contact your school admin.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

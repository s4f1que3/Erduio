"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const requestSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
type RequestForm = z.infer<typeof requestSchema>;

const resetSchema = z
  .object({
    token: z.string().min(6, "Enter the code sent to your email"),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState<{ email: string } | null>(null);

  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });
  const newPassword = resetForm.watch("new_password");

  async function onRequestSubmit(data: RequestForm) {
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password/send-otp", data);
      toast.success("Code sent! Check your email.");
      setIdentity(data);
      setStep("reset");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResetSubmit(data: ResetForm) {
    if (!identity) return;
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password/reset", {
        email: identity.email,
        token: data.token,
        new_password: data.new_password,
      });
      toast.success("Password updated! You can now sign in.");
      router.replace("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:flex-1 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-90" />
        <div className="relative z-10 text-center text-primary-foreground max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Erduio</h1>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            Reset your password to get back into your school&apos;s portal.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">EduControl</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {step === "request" ? "Forgot password" : "Enter your code"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {step === "request"
                ? "Enter your email to receive a reset code."
                : `We sent a code to ${identity?.email}.`}
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  autoComplete="email"
                  {...requestForm.register("email")}
                  className={requestForm.formState.errors.email ? "border-destructive" : ""}
                />
                {requestForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send reset code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="token">Reset code</Label>
                <Input
                  id="token"
                  placeholder="123456"
                  autoComplete="one-time-code"
                  {...resetForm.register("token")}
                  className={resetForm.formState.errors.token ? "border-destructive" : ""}
                />
                {resetForm.formState.errors.token && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.token.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_password">New password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...resetForm.register("new_password")}
                    className={resetForm.formState.errors.new_password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.new_password && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.new_password.message}</p>
                )}
                <PasswordRequirements password={newPassword} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...resetForm.register("confirm_password")}
                  className={resetForm.formState.errors.confirm_password ? "border-destructive" : ""}
                />
                {resetForm.formState.errors.confirm_password && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("request")}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />Back
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            Remembered your password?{" "}
            <button type="button" onClick={() => router.push("/login")} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

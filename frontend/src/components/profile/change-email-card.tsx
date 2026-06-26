"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

const verifySchema = z.object({
  token: z.string().min(1, "Enter the code from your email"),
  new_email: z.string().email(),
});
type VerifyForm = z.infer<typeof verifySchema>;

export function ChangeEmailCard({ endpoint }: { endpoint: string }) {
  const [step, setStep] = useState<"idle" | "verify">("idle");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<VerifyForm>({ resolver: zodResolver(verifySchema) });

  async function sendOtp() {
    setSending(true);
    try {
      await api.post("/auth/send-otp");
      toast.success("Verification code sent to your email");
      setStep("verify");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  async function submit(data: VerifyForm) {
    setSubmitting(true);
    try {
      await api.patch(endpoint, data);
      toast.success("Email updated");
      form.reset();
      setStep("idle");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><span className="rounded-md bg-pink-100 dark:bg-pink-500/15 p-1.5"><Mail className="h-4 w-4 text-pink-600 dark:text-pink-400" /></span>Change Email</CardTitle></CardHeader>
      <CardContent>
        {step === "idle" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">We&apos;ll send a verification code to your current email before you can set a new one.</p>
            <Button type="button" size="sm" onClick={sendOtp} disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Send Verification Code
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Verification Code</Label>
              <Input placeholder="Code from your email" {...form.register("token")} />
              {form.formState.errors.token && <p className="text-xs text-destructive">{form.formState.errors.token.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New Email</Label>
              <Input type="email" {...form.register("new_email")} />
              {form.formState.errors.new_email && <p className="text-xs text-destructive">{form.formState.errors.new_email.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Email
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setStep("idle"); form.reset(); }}>Cancel</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

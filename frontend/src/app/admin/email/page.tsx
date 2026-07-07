"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Info } from "lucide-react";

const schema = z.object({
  subject: z.string().min(1, "Subject is required").max(60, "Subject must be 60 characters or fewer"),
  message: z.string().min(1, "Message is required").max(250, "Message must be 250 characters or fewer"),
});
type Form = z.infer<typeof schema>;

export default function AdminEmailPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const sendEmail = useMutation({
    mutationFn: (d: Form) => api.post("/email/send", d),
    onSuccess: () => { toast.success("Email sent to platform owner"); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header title="Email" description="Contact the platform owner directly" />
      <PageShell>
        <Section>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40 mb-6">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Request specific data for students and more from management.
            </p>
          </div>

          <form onSubmit={handleSubmit((d) => sendEmail.mutate(d))} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="Subject..." {...register("subject")} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={6} placeholder="Write your message..." {...register("message")} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={sendEmail.isPending}>
              {sendEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {!sendEmail.isPending && <Send className="h-4 w-4 mr-1.5" />}
              Send Email
            </Button>
          </form>
        </Section>
      </PageShell>
    </>
  );
}

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
import { Loader2, Lock } from "lucide-react";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const schema = z.object({
  current_password: z.string().min(1, "Enter your current password"),
  new_password: passwordSchema,
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });
type Form = z.infer<typeof schema>;

export function ChangePasswordCard({ endpoint }: { endpoint: string }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema) });
  const newPassword = form.watch("new_password");

  async function submit(data: Form) {
    setLoading(true);
    try {
      await api.patch(endpoint, { current_password: data.current_password, new_password: data.new_password });
      toast.success("Password updated");
      form.reset();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><span className="rounded-md bg-amber-100 dark:bg-amber-500/15 p-1.5"><Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /></span>Change Password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input type="password" {...form.register("current_password")} />
            {form.formState.errors.current_password && <p className="text-xs text-destructive">{form.formState.errors.current_password.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" {...form.register("new_password")} />
              {form.formState.errors.new_password && <p className="text-xs text-destructive">{form.formState.errors.new_password.message}</p>}
              <PasswordRequirements password={newPassword} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" {...form.register("confirm")} />
              {form.formState.errors.confirm && <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>}
            </div>
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

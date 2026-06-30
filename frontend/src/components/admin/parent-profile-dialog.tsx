"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EntityAvatar } from "@/components/profile/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusBadgeVariant, formatDate } from "@/lib/utils";
import { Loader2, Pencil, ArrowLeft, User, Mail, Lock, Trash2 } from "lucide-react";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

interface ParentProfileDialogProps {
  parentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const infoSchema = z.object({ name: z.string().min(2), phone: z.string().min(7) });
const emailSchema = z.object({ new_email: z.string().email() });
const pwSchema = z.object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function ParentProfileDialog({ parentId, open, onOpenChange }: ParentProfileDialogProps) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: parent, isLoading, error } = useQuery({
    queryKey: ["parent-profile", parentId],
    queryFn: async () => (await api.get(`/parent/profile/${parentId}`)).data ?? null,
    enabled: open && !!parentId,
  });

  const infoForm = useForm({ resolver: zodResolver(infoSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const pwForm = useForm({ resolver: zodResolver(pwSchema) });
  const newPassword = pwForm.watch("password");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["parent-profile", parentId] });
    qc.invalidateQueries({ queryKey: ["parents"] });
  };

  const updateInfo = useMutation({
    mutationFn: (d: { name: string; phone: string }) => api.patch(`/parent/admin/update-info/${parentId}`, d),
    onSuccess: () => { toast.success("Info updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updateEmail = useMutation({
    mutationFn: (d: { new_email: string }) => api.patch(`/parent/admin/update-email/${parentId}`, d),
    onSuccess: () => { toast.success("Email updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updatePassword = useMutation({
    mutationFn: (d: { new_password: string }) => api.patch(`/parent/admin/update-password/${parentId}`, d),
    onSuccess: () => { toast.success("Password updated"); pwForm.reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deletePic = useMutation({
    mutationFn: () => api.post(`/parent/admin/${parentId}/profile-pic/delete`),
    onSuccess: () => { toast.success("Profile picture removed"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const startEditing = () => {
    infoForm.reset({ name: String(parent?.name ?? ""), phone: String(parent?.phone_number ?? "") });
    emailForm.reset({ new_email: String(parent?.email ?? "") });
    pwForm.reset({ password: "", confirm: "" });
    setEditing(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(false); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-7">
            <DialogTitle>{editing ? "Edit Parent" : "Parent Profile"}</DialogTitle>
            {parent && (
              <Button variant="ghost" size="sm" onClick={() => (editing ? setEditing(false) : startEditing())}>
                {editing ? <><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</> : <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</>}
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-destructive py-4">{getErrorMessage(error)}</p>}

        {parent && !editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <EntityAvatar
                id={String(parent.id ?? "")}
                pfpPath={parent.pfp_path as string | null}
                name={String(parent.name ?? "")}
                endpoint="/parent/profile-pic"
                className="h-12 w-12"
              />
              <div className="flex-1">
                <p className="font-medium">{String(parent.name ?? "—")}</p>
                <Badge variant={statusBadgeVariant(String(parent.status ?? ""))}>{String(parent.status ?? "—")}</Badge>
              </div>
              {!!parent.pfp_path && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  disabled={deletePic.isPending}
                  onClick={() => deletePic.mutate()}
                  title="Remove profile picture"
                >
                  {deletePic.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p>{String(parent.email ?? "—")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p>{String(parent.phone_number ?? "—")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined</p>
                <p>{parent.created_at ? formatDate(parent.created_at as string) : "—"}</p>
              </div>
            </div>
          </div>
        )}

        {parent && editing && (
          <div className="space-y-4">
            <Card size="sm">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Personal Info</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={infoForm.handleSubmit((d) => updateInfo.mutate(d))} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input {...infoForm.register("name")} /></div>
                    <div className="space-y-1"><Label className="text-xs">Phone</Label><Input {...infoForm.register("phone")} /></div>
                  </div>
                  <Button type="submit" size="sm" disabled={updateInfo.isPending}>
                    {updateInfo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Change Email</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={emailForm.handleSubmit((d) => updateEmail.mutate(d))} className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" {...emailForm.register("new_email")} /></div>
                  <Button type="submit" size="sm" disabled={updateEmail.isPending}>
                    {updateEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={pwForm.handleSubmit((d) => updatePassword.mutate({ new_password: d.password }))} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">New Password</Label><Input type="password" {...pwForm.register("password")} /></div>
                    <div className="space-y-1"><Label className="text-xs">Confirm</Label><Input type="password" {...pwForm.register("confirm")} /></div>
                  </div>
                  <PasswordRequirements password={newPassword} />
                  {pwForm.formState.errors.password && <p className="text-xs text-destructive">{pwForm.formState.errors.password.message}</p>}
                  {pwForm.formState.errors.confirm && <p className="text-xs text-destructive">{pwForm.formState.errors.confirm.message}</p>}
                  <Button type="submit" size="sm" disabled={updatePassword.isPending}>
                    {updatePassword.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityAvatar } from "@/components/profile/entity-avatar";
import { statusBadgeVariant, formatDate } from "@/lib/utils";
import { Loader2, Pencil, ArrowLeft, User, Mail, Lock, Trash2 } from "lucide-react";

interface AdminProfileDialogProps {
  admin: Record<string, unknown> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const infoSchema = z.object({ name: z.string().min(2), phone: z.string().min(7) });
const emailSchema = z.object({ new_email: z.string().email() });
const pwSchema = z.object({ password: z.string().min(8), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function AdminProfileDialog({ admin, open, onOpenChange }: AdminProfileDialogProps) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const infoForm = useForm({ resolver: zodResolver(infoSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const pwForm = useForm({ resolver: zodResolver(pwSchema) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admins"] });
    qc.invalidateQueries({ queryKey: ["admins-inactive"] });
  };

  const updateInfo = useMutation({
    mutationFn: (d: { name: string; phone: string }) =>
      api.patch(`/admin/updateadmin-info/${admin?.id}`, { new_name: d.name, new_phone: d.phone }),
    onSuccess: () => { toast.success("Info updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updateEmail = useMutation({
    mutationFn: (d: { new_email: string }) => api.patch(`/admin/updateadmin-email/${admin?.id}`, d),
    onSuccess: () => { toast.success("Email updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updatePassword = useMutation({
    mutationFn: (d: { new_password: string }) => api.patch(`/admin/updateadmin-password/${admin?.id}`, d),
    onSuccess: () => { toast.success("Password updated"); pwForm.reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deletePic = useMutation({
    mutationFn: () => api.delete(`/admin/profile-pic/${admin?.id}/delete`),
    onSuccess: () => { toast.success("Profile picture removed"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const startEditing = () => {
    infoForm.reset({ name: String(admin?.name ?? ""), phone: String(admin?.phone_number ?? "") });
    emailForm.reset({ new_email: String(admin?.email ?? "") });
    pwForm.reset({ password: "", confirm: "" });
    setEditing(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(false); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-7">
            <DialogTitle>{editing ? "Edit Admin" : "Admin Profile"}</DialogTitle>
            {admin && (
              <Button variant="ghost" size="sm" onClick={() => (editing ? setEditing(false) : startEditing())}>
                {editing ? <><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</> : <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</>}
              </Button>
            )}
          </div>
        </DialogHeader>

        {admin && !editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <EntityAvatar
                id={String(admin.id ?? "")}
                pfpPath={admin.pfp_path as string | null}
                name={String(admin.name ?? "")}
                endpoint="/admin/profile-pic"
                className="h-12 w-12"
              />
              <div className="flex-1">
                <p className="font-medium">{String(admin.name ?? "—")}</p>
                <Badge variant={statusBadgeVariant(String(admin.status ?? ""))}>{String(admin.status ?? "—")}</Badge>
              </div>
              {!!admin.pfp_path && (
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
                <p>{String(admin.email ?? "—")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p>{String(admin.phone_number ?? "—")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined</p>
                <p>{admin.created_at ? formatDate(admin.created_at as string) : "—"}</p>
              </div>
            </div>
          </div>
        )}

        {admin && editing && (
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

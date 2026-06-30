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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { statusBadgeVariant, formatDate } from "@/lib/utils";
import { Loader2, ChevronRight, Pencil, ArrowLeft, User, Mail, Lock, BookOpen, Trash2 } from "lucide-react";
import { ParentProfileDialog } from "@/components/admin/parent-profile-dialog";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

interface StudentProfileDialogProps {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const infoSchema = z.object({ name: z.string().min(2), phone: z.string().min(7) });
const emailSchema = z.object({ email: z.string().email() });
const pwSchema = z.object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function StudentProfileDialog({ studentId, open, onOpenChange }: StudentProfileDialogProps) {
  const qc = useQueryClient();
  const [parentId, setParentId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student-profile", studentId],
    queryFn: async () => (await api.get(`/student/profile/${studentId}`)).data ?? null,
    enabled: open && !!studentId,
  });

  const infoForm = useForm({ resolver: zodResolver(infoSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const pwForm = useForm({ resolver: zodResolver(pwSchema) });
  const newPassword = pwForm.watch("password");

  const [classId, setClassId] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const classItems = Object.fromEntries((classes as Record<string, unknown>[]).map((c) => [String(c.id), String(c.name ?? "")]));

  const { data: classSubjects = [] } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/subjects`)).data ?? [],
    enabled: !!classId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["student-profile", studentId] });
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["students-inactive"] });
  };

  const updateInfo = useMutation({
    mutationFn: (d: { name: string; phone: string }) => api.patch(`/student/admin/update-info/${studentId}`, d),
    onSuccess: () => { toast.success("Info updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updateEmail = useMutation({
    mutationFn: (d: { email: string }) => api.patch(`/student/admin/update-email/${studentId}`, d),
    onSuccess: () => { toast.success("Email updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const updatePassword = useMutation({
    mutationFn: (d: { password: string }) => api.patch(`/student/admin/update-password/${studentId}`, d),
    onSuccess: () => { toast.success("Password updated"); pwForm.reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deletePic = useMutation({
    mutationFn: () => api.post(`/student/admin/${studentId}/profile-pic/delete`),
    onSuccess: () => { toast.success("Profile picture removed"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const changeClass = useMutation({
    mutationFn: () => api.patch(`/student/admin/change-class/${studentId}`, { class_id: classId, subjects: subjectIds }),
    onSuccess: () => { toast.success("Class updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const toggleSubject = (id: string, checked: boolean) =>
    setSubjectIds((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));

  const startEditing = () => {
    infoForm.reset({ name: String(student?.name ?? ""), phone: String(student?.phone_number ?? "") });
    emailForm.reset({ email: String(student?.email ?? "") });
    pwForm.reset({ password: "", confirm: "" });
    setClassId(studentClass?.id ? String(studentClass.id) : "");
    setSubjectIds(subjects.map((s) => String(s.id)));
    setEditing(true);
  };

  const parent = student?.parent as Record<string, unknown> | null | undefined;
  const subjects = (student?.subjects ?? []) as Record<string, unknown>[];
  const studentClass = student?.class as Record<string, unknown> | null | undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-7">
              <DialogTitle>{editing ? "Edit Student" : "Student Profile"}</DialogTitle>
              {student && (
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

          {student && !editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <EntityAvatar
                  id={String(student.id ?? "")}
                  pfpPath={student.pfp_path as string | null}
                  name={String(student.name ?? "")}
                  endpoint="/student/profile-pic"
                  className="h-12 w-12"
                />
                <div className="flex-1">
                  <p className="font-medium">{String(student.name ?? "—")}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    <Badge variant={statusBadgeVariant(String(student.enrollment_status ?? ""))}>{String(student.enrollment_status ?? "—")}</Badge>
                    <Badge variant={statusBadgeVariant(String(student.status ?? ""))}>{String(student.status ?? "—")}</Badge>
                  </div>
                </div>
                {!!student.pfp_path && (
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
                  <p>{String(student.email ?? "—")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                  <p>{String(student.phone_number ?? "—")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Class</p>
                  <p>{String(studentClass?.name ?? "—")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined</p>
                  <p>{student.created_at ? formatDate(student.created_at as string) : "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Subjects</p>
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subjects assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((s) => (
                      <Badge key={String(s.id)} variant="outline">{String(s.name ?? "—")}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Parent / Guardian</p>
                {parent ? (
                  <button
                    type="button"
                    onClick={() => setParentId(String(parent.id))}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <EntityAvatar
                      id={String(parent.id ?? "")}
                      pfpPath={parent.pfp_path as string | null}
                      name={String(parent.name ?? "")}
                      endpoint="/parent/profile-pic"
                      className="h-8 w-8"
                      fallbackClassName="text-xs"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{String(parent.name ?? "—")}</p>
                      <p className="text-xs text-muted-foreground">{String(parent.email ?? "—")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">No parent linked</p>
                )}
              </div>
            </div>
          )}

          {student && editing && (
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
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" />Class & Subjects</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Class</Label>
                    <Select
                      items={classItems}
                      value={classId}
                      onValueChange={(v: unknown) => {
                        const next = String(v ?? "");
                        if (next !== classId) setSubjectIds([]);
                        setClassId(next);
                      }}
                    >
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {(classes as Record<string, unknown>[]).map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {classId && (
                    <div className="space-y-1">
                      <Label className="text-xs">Subjects</Label>
                      {(classSubjects as Record<string, unknown>[]).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No subjects in this class</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                          {(classSubjects as Record<string, unknown>[]).map((s) => {
                            const id = String(s.id);
                            return (
                              <label key={id} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted/50 cursor-pointer text-sm">
                                <Checkbox checked={subjectIds.includes(id)} onCheckedChange={(v) => toggleSubject(id, !!v)} />
                                {String(s.name ?? "")}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <Button size="sm" disabled={!classId || changeClass.isPending} onClick={() => changeClass.mutate()}>
                    {changeClass.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
                  </Button>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Change Email</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={emailForm.handleSubmit((d) => updateEmail.mutate(d))} className="space-y-3">
                    <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" {...emailForm.register("email")} /></div>
                    <Button type="submit" size="sm" disabled={updateEmail.isPending}>
                      {updateEmail.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Email
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={pwForm.handleSubmit((d) => updatePassword.mutate({ password: d.password }))} className="space-y-3">
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

      <ParentProfileDialog parentId={parentId} open={!!parentId} onOpenChange={(o) => !o && setParentId(null)} />
    </>
  );
}

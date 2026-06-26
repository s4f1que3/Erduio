"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusBadgeVariant, formatDate } from "@/lib/utils";
import { Loader2, Pencil, ArrowLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { SubjectProfileDialog } from "@/components/admin/subject-profile-dialog";

interface ClassProfileDialogProps {
  classId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassProfileDialog({ classId, open, onOpenChange }: ClassProfileDialogProps) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [timetableFile, setTimetableFile] = useState<File | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectTeacher, setNewSubjectTeacher] = useState("");
  const [activeSubject, setActiveSubject] = useState<{ id: string; name?: string; teacher_id?: string } | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const cls = (classes as Record<string, unknown>[]).find((c) => String(c.id) === classId) ?? null;

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (await api.get("/teacher")).data ?? [],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/subjects`)).data ?? [],
    enabled: open && !!classId,
  });

  const teacherName = (id?: string) => (teachers as Record<string, unknown>[]).find((t) => String(t.id) === id)?.name as string | undefined;
  const teacherItems = Object.fromEntries(
    (teachers as Record<string, unknown>[]).filter((t) => t.status === "active").map((t) => [String(t.id), String(t.name ?? "")])
  );

  const startEditing = () => {
    setName(String(cls?.name ?? ""));
    setTeacherId(String(cls?.class_teacher_id ?? ""));
    setTimetableFile(null);
    setEditing(true);
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: ["classes"] });

  const saveName = useMutation({
    mutationFn: () => api.patch(`/classes/change-name/${classId}`, { name, class_id: classId }),
    onSuccess: () => { toast.success("Class name updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const saveTeacher = useMutation({
    mutationFn: () => api.patch(`/classes/change/class-teacher/${classId}`, { class_teacher: teacherId, class_id: classId }),
    onSuccess: () => { toast.success("Class teacher updated"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeTeacher = useMutation({
    mutationFn: () => api.patch(`/classes/remove/class-teacher/${classId}`, { class_id: classId }),
    onSuccess: () => { toast.success("Class teacher removed"); setTeacherId(""); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const saveTimetable = useMutation({
    mutationFn: () => {
      const form = new FormData();
      if (timetableFile) form.append("timetable", timetableFile);
      form.append("class_id", String(classId));
      return api.post(`/classes/change-timetable/${classId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Timetable updated"); setTimetableFile(null); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeTimetable = useMutation({
    mutationFn: () => api.patch(`/classes/remove/timetable/${classId}`, { path: cls?.timetable_path, class_id: classId }),
    onSuccess: () => { toast.success("Timetable removed"); invalidate(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const viewTimetable = useMutation({
    mutationFn: async () => (await api.get(`/classes/${classId}/view/timetable`)).data,
    onSuccess: (url) => { if (typeof url === "string") window.open(url, "_blank", "noopener,noreferrer"); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const addSubject = useMutation({
    mutationFn: () => api.patch(`/classes/add-subjects/${classId}`, {
      subjects: [{ name: newSubjectName, teacher_id: newSubjectTeacher || undefined }],
      class_id: classId,
    }),
    onSuccess: () => {
      toast.success("Subject added");
      setNewSubjectName(""); setNewSubjectTeacher("");
      qc.invalidateQueries({ queryKey: ["class-subjects", classId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeSubject = useMutation({
    mutationFn: (subjectId: string) => api.patch(`/classes/remove/subjects/${classId}`, { subjects: [subjectId], class_id: classId }),
    onSuccess: () => { toast.success("Subject removed"); qc.invalidateQueries({ queryKey: ["class-subjects", classId] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-7">
              <DialogTitle>{editing ? "Edit Class" : "Class Profile"}</DialogTitle>
              {cls && (
                <Button variant="ghost" size="sm" onClick={() => (editing ? setEditing(false) : startEditing())}>
                  {editing ? <><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</> : <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</>}
                </Button>
              )}
            </div>
          </DialogHeader>

          {!cls && (
            <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          )}

          {cls && !editing && (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-lg">{String(cls.name ?? "—")}</p>
                <Badge variant={statusBadgeVariant(String(cls.status ?? ""))}>{String(cls.status ?? "—")}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Class Teacher</p>
                  <p>{teacherName(String(cls.class_teacher_id ?? "")) ?? "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                  <p>{cls.created_at ? formatDate(cls.created_at as string) : "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Timetable</p>
                {cls.timetable_path ? (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary text-sm"
                    disabled={viewTimetable.isPending}
                    onClick={() => viewTimetable.mutate()}
                  >
                    {viewTimetable.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}View Timetable
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">No timetable uploaded</p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Subjects</p>
                {(subjects as Record<string, unknown>[]).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subjects added</p>
                ) : (
                  <div className="space-y-1.5">
                    {(subjects as Record<string, unknown>[]).map((s) => (
                      <button
                        key={String(s.id)}
                        type="button"
                        onClick={() => setActiveSubject({ id: String(s.id), name: String(s.name ?? ""), teacher_id: s.teacher_id ? String(s.teacher_id) : undefined })}
                        className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex-1 text-sm font-medium">{String(s.name ?? "")}</span>
                        <span className="text-xs text-muted-foreground">{teacherName(s.teacher_id ? String(s.teacher_id) : undefined) ?? "Unassigned"}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {cls && editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Class Name</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <Button size="sm" disabled={saveName.isPending} onClick={() => saveName.mutate()}>
                    {saveName.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Save
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Class Teacher</Label>
                <div className="flex gap-2">
                  <Select items={teacherItems} value={teacherId} onValueChange={(v: unknown) => setTeacherId(String(v ?? ""))}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {(teachers as Record<string, unknown>[]).filter((t) => t.status === "active").map((t) => (
                        <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={saveTeacher.isPending} onClick={() => saveTeacher.mutate()}>
                    {saveTeacher.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Save
                  </Button>
                  {cls.class_teacher_id ? (
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={removeTeacher.isPending} onClick={() => removeTeacher.mutate()}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Timetable</Label>
                <div className="flex gap-2">
                  <Input type="file" onChange={(e) => setTimetableFile(e.target.files?.[0] ?? null)} />
                  <Button size="sm" disabled={!timetableFile || saveTimetable.isPending} onClick={() => saveTimetable.mutate()}>
                    {saveTimetable.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Upload
                  </Button>
                </div>
                {cls.timetable_path ? (
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={removeTimetable.isPending} onClick={() => removeTimetable.mutate()}>
                    {removeTimetable.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Remove Timetable
                  </Button>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Subjects</Label>
                <div className="space-y-1.5">
                  {(subjects as Record<string, unknown>[]).map((s) => (
                    <div key={String(s.id)} className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <span className="flex-1 text-sm">{String(s.name ?? "")}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        disabled={removeSubject.isPending} onClick={() => removeSubject.mutate(String(s.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Input placeholder="New subject name" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                  <Select items={teacherItems} value={newSubjectTeacher} onValueChange={(v: unknown) => setNewSubjectTeacher(String(v ?? ""))}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Teacher" /></SelectTrigger>
                    <SelectContent>
                      {(teachers as Record<string, unknown>[]).filter((t) => t.status === "active").map((t) => (
                        <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={!newSubjectName || addSubject.isPending} onClick={() => addSubject.mutate()}>
                    {addSubject.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SubjectProfileDialog
        subject={activeSubject}
        classId={classId}
        teachers={teachers as Record<string, unknown>[]}
        open={!!activeSubject}
        onOpenChange={(o) => !o && setActiveSubject(null)}
      />
    </>
  );
}

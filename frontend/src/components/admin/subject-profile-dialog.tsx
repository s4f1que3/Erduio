"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Loader2, Pencil, ArrowLeft, Trash2 } from "lucide-react";

interface Subject {
  id: string;
  name?: string;
  teacher_id?: string;
}

interface SubjectProfileDialogProps {
  subject: Subject | null;
  classId: string | null;
  teachers: Record<string, unknown>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubjectProfileDialog({ subject, classId, teachers, open, onOpenChange }: SubjectProfileDialogProps) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["subject-students", subject?.id],
    queryFn: async () => (await api.get(`/classes/subjects/${subject?.id}/students`)).data ?? [],
    enabled: open && !!subject?.id,
  });

  const teacherName = (id?: string) => teachers.find((t) => String(t.id) === id)?.name as string | undefined;
  const teacherItems = Object.fromEntries(
    teachers.filter((t) => t.status === "active").map((t) => [String(t.id), String(t.name ?? "")])
  );

  const startEditing = () => {
    setName(subject?.name ?? "");
    setTeacherId(subject?.teacher_id ?? "");
    setEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => api.patch(`/classes/subjects/${subject?.id}`, { name, teacher_id: teacherId || undefined }),
    onSuccess: () => { toast.success("Subject updated"); qc.invalidateQueries({ queryKey: ["class-subjects", classId] }); setEditing(false); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const removeMutation = useMutation({
    mutationFn: () => api.patch(`/classes/remove/subjects/${classId}`, { subjects: [subject?.id], class_id: classId }),
    onSuccess: () => { toast.success("Subject removed from class"); qc.invalidateQueries({ queryKey: ["class-subjects", classId] }); onOpenChange(false); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setEditing(false); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-7">
            <DialogTitle>{editing ? "Edit Subject" : "Subject"}</DialogTitle>
            {subject && (
              <Button variant="ghost" size="sm" onClick={() => (editing ? setEditing(false) : startEditing())}>
                {editing ? <><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</> : <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</>}
              </Button>
            )}
          </div>
        </DialogHeader>

        {subject && !editing && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
              <p className="font-medium">{subject.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Teacher</p>
              <p>{teacherName(subject.teacher_id) ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Enrolled Students ({(students as unknown[]).length})</p>
              {(students as Record<string, unknown>[]).length === 0 ? (
                <p className="text-sm text-muted-foreground">No students enrolled</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(students as Record<string, unknown>[]).map((s) => (
                    <div key={String(s.id)} className="flex items-center gap-2 p-1.5">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(String(s.name ?? ""))}</AvatarFallback></Avatar>
                      <span className="text-sm">{String(s.name ?? "")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate()}>
              {removeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}Remove from Class
            </Button>
          </div>
        )}

        {subject && editing && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Teacher</Label>
              <Select items={teacherItems} value={teacherId} onValueChange={(v: unknown) => setTeacherId(String(v ?? ""))}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.filter((t) => t.status === "active").map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

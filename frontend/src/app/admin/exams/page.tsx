"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Calendar, Loader2, ExternalLink, Download, Pencil, Trash2, GraduationCap } from "lucide-react";

type RosterStudent = { id: string; name: string };

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  classId: z.string().min(1, "Please select a class"),
  subjectId: z.string().min(1, "Please select a subject"),
});
type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({ new_name: z.string().min(1), new_content: z.string().min(1) });

function ExamGradeRow({ examId, student }: { examId: string; student: RosterStudent }) {
  const qc = useQueryClient();
  const [grade, setGrade] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["exam-grade", examId, student.id],
    queryFn: async () => {
      try {
        const d = (await api.get(`/exam/${examId}/${student.id}/grade`)).data;
        return d && typeof d === "object" ? (d as Record<string, unknown>) : null;
      } catch {
        return null;
      }
    },
    enabled: !!examId && !!student.id,
  });

  function startEdit() {
    setGrade(String(existing?.grade ?? ""));
    setMessage(String(existing?.message ?? ""));
    setEditing(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existing?.id) {
        return api.patch(`/exam/${examId}/${student.id}/${existing.id}/update`, { new_grade: grade, new_message: message });
      }
      return api.post(`/exam/${examId}/student/${student.id}/add`, { grade, message });
    },
    onSuccess: () => {
      toast.success("Grade saved");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["exam-grade", examId, student.id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/exam/${examId}/${student.id}/${existing?.id}/update`),
    onSuccess: () => {
      toast.success("Grade removed");
      qc.invalidateQueries({ queryKey: ["exam-grade", examId, student.id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium min-w-0 flex-1 truncate">{student.name}</p>
        {!editing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoading ? (
              <span className="text-xs text-muted-foreground">Loading...</span>
            ) : existing ? (
              <Badge variant="outline">{String(existing.grade)}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">No grade</span>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEdit}><Pencil className="h-3.5 w-3.5" /></Button>
            {existing && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
      {editing && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Grade</Label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Message (optional)</Label>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="button" size="sm" disabled={!grade || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamsAdminPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [gradesTarget, setGradesTarget] = useState<Record<string, unknown> | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null);
  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams-admin"],
    queryFn: async () => (await api.get("/exams/admin/all")).data ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });

  const filtered = (exams as Record<string, unknown>[]).filter((e) =>
    !search || String(e.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });
  const classId = watch("classId");

  const { data: subjects = [] } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/subjects`)).data ?? [],
    enabled: !!classId,
  });

  const { data: gradesRoster = [] } = useQuery({
    queryKey: ["exam-grades-roster", gradesTarget?.subject_id],
    queryFn: async () => {
      const d = (await api.get(`/classes/subjects/${gradesTarget?.subject_id}/students`)).data;
      return Array.isArray(d) ? (d as RosterStudent[]) : [];
    },
    enabled: !!gradesTarget?.subject_id,
  });

  const { register: regEdit, handleSubmit: hsEdit, reset: resetEdit, formState: { errors: errEdit } } = useForm<z.infer<typeof editSchema>>({ resolver: zodResolver(editSchema) });

  async function viewExamAttachment(examId: string) {
    setViewingAttachment(examId);
    try {
      const url = (await api.get(`/exams/${examId}/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingAttachment(null);
    }
  }

  async function downloadExamAttachment(examId: string, name: string) {
    setDownloadingAttachment(examId);
    try {
      const url = (await api.get(`/exams/${examId}/view`)).data;
      await downloadFromUrl(url, name);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingAttachment(null);
    }
  }

  const resetDialog = () => reset();

  const createMutation = useMutation({
    mutationFn: async (d: CreateForm) => {
      const form = new FormData();
      form.append("name", d.name);
      form.append("content", d.content);
      return api.post(`/exams/${d.subjectId}/create`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => { toast.success("Exam created"); qc.invalidateQueries({ queryKey: ["exams-admin"] }); setShowCreate(false); resetDialog(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const editMutation = useMutation({
    mutationFn: (d: z.infer<typeof editSchema>) => api.patch(`/exams/${editTarget?.id}/update`, d),
    onSuccess: () => { toast.success("Exam updated"); qc.invalidateQueries({ queryKey: ["exams-admin"] }); setEditTarget(null); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (examId: string) => api.delete(`/exams/${examId}/delete`),
    onSuccess: () => { toast.success("Exam deleted"); qc.invalidateQueries({ queryKey: ["exams-admin"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header
        title="Exams"
        description="Create and manage exams and student grades"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Exam</Button>}
      />
      <PageShell>
        <Section>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            { key: "name", label: "Exam", render: (r) => <span className="font-medium">{String(r.name ?? "")}</span> },
            { key: "content", label: "Content", render: (r) => <span className="text-muted-foreground truncate block max-w-xs">{String(r.content ?? "")}</span> },
            { key: "created_at", label: "Created", render: (r) => <div className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(r.created_at as string)}</div> },
            {
              key: "actions", label: "", className: "w-52 text-right",
              render: (r) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {!!r.file_path && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={viewingAttachment === String(r.id)} onClick={() => viewExamAttachment(String(r.id))}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={downloadingAttachment === String(r.id)} onClick={() => downloadExamAttachment(String(r.id), String(r.name ?? "exam"))}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage grades" onClick={() => setGradesTarget(r)}><GraduationCap className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => { setEditTarget(r); resetEdit({ new_name: String(r.name ?? ""), new_content: String(r.content ?? "") }); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete" onClick={() => deleteMutation.mutate(String(r.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </PageShell>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetDialog(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select onValueChange={(v: unknown) => { setValue("classId", String(v ?? "")); setValue("subjectId", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {(classes as Record<string, unknown>[]).map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-xs text-destructive">{errors.classId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={watch("subjectId") ?? ""} onValueChange={(v: unknown) => setValue("subjectId", String(v ?? ""))} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {(subjects as Record<string, unknown>[]).map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>Name</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} {...register("content")} />{errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetDialog(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <form onSubmit={hsEdit((d) => editMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Name</Label><Input {...regEdit("new_name")} />{errEdit.new_name && <p className="text-xs text-destructive">{errEdit.new_name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} {...regEdit("new_content")} />{errEdit.new_content && <p className="text-xs text-destructive">{errEdit.new_content.message}</p>}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={editMutation.isPending}>{editMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!gradesTarget} onOpenChange={(open) => !open && setGradesTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage Grades — {String(gradesTarget?.name ?? "")}</DialogTitle></DialogHeader>
          <div className="space-y-2 pt-2 max-h-[60vh] overflow-y-auto">
            {gradesRoster.map((s) => gradesTarget && <ExamGradeRow key={s.id} examId={String(gradesTarget.id)} student={s} />)}
            {gradesRoster.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No students found for this exam&apos;s subject</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

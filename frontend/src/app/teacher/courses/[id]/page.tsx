"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft, BookOpen, ExternalLink, Calendar, Loader2, Bell, Plus, Trash2, Eye, Award, Users, Download, CalendarClock, Clock, FileCheck, Pencil, GraduationCap, MoreVertical,
} from "lucide-react";

type TeacherProfile = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string | null; class_id: string; class_name: string | null }[];
};
type RosterStudent = { id: string; name: string };
type AttendanceRecord = { student_id: string; present: boolean };
type AttendanceRow = { date: string; student_id: string; present: boolean };

function groupAttendanceByDate(rows: AttendanceRow[]) {
  const byDate = new Map<string, { present: number; total: number }>();
  for (const r of rows) {
    const entry = byDate.get(r.date) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (r.present) entry.present += 1;
    byDate.set(r.date, entry);
  }
  return [...byDate.entries()]
    .map(([date, { present, total }]) => ({ date, present, absent: total - present, total }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

const noteSchema = z.object({ title: z.string().min(1), message: z.string().optional() });
const assignmentSchema = z.object({ name: z.string().min(1), description: z.string().optional(), due_date: z.string().min(1) });
const announcementSchema = z.object({ title: z.string().min(1), content: z.string().min(1) });
const assignmentGradeSchema = z.object({ student_id: z.string().min(1), grade: z.string().min(1), message: z.string().optional() });
const extendStudentSchema = z.object({ student_id: z.string().min(1), due_date: z.string().min(1) });
const examSchema = z.object({ name: z.string().min(1), content: z.string().min(1) });
const examEditSchema = z.object({ new_name: z.string().min(1), new_content: z.string().min(1) });

export default function TeacherCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const subjectId = params.id;

  const [currentWeek, setCurrentWeek] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["teacher-me-profile"],
    queryFn: async () => (await api.get("/teacher/me/profile")).data as TeacherProfile,
  });
  const subject = (profile?.subjects ?? []).find((s) => s.id === subjectId);

  const { data: roster = [] } = useQuery({
    queryKey: ["course-roster", subjectId],
    queryFn: async () => {
      const data = (await api.get(`/classes/subjects/${subjectId}/students`)).data;
      return Array.isArray(data) ? (data as RosterStudent[]) : [];
    },
    enabled: !!subjectId,
  });

  return (
    <>
      <Header
        title={subject?.name ?? "Course"}
        description={subject?.class_name ? `${subject.class_name} — assignments, notes, attendance and exams` : "Assignments, notes, attendance and exams"}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/teacher/courses")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Courses
          </Button>
        }
      />
      <PageShell>
        <Tabs defaultValue="notes">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="roster">Roster</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Switch checked={currentWeek} onCheckedChange={setCurrentWeek} />
              <span className="text-sm text-muted-foreground">This week</span>
            </div>
          </div>

          <TabsContent value="notes" className="mt-4">
            <NotesTab subjectId={subjectId} currentWeek={currentWeek} />
          </TabsContent>
          <TabsContent value="roster" className="mt-4">
            <RosterTab roster={roster} />
          </TabsContent>
          <TabsContent value="assignments" className="mt-4">
            <AssignmentsTab subjectId={subjectId} currentWeek={currentWeek} roster={roster} />
          </TabsContent>
          <TabsContent value="attendance" className="mt-4">
            <AttendanceTab subjectId={subjectId} roster={roster} />
          </TabsContent>
          <TabsContent value="exams" className="mt-4">
            <ExamsTab subjectId={subjectId} roster={roster} />
          </TabsContent>
          <TabsContent value="announcements" className="mt-4">
            <AnnouncementsTab subjectId={subjectId} currentWeek={currentWeek} />
          </TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
}

function NotesTab({ subjectId, currentWeek }: { subjectId: string; currentWeek: boolean }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingNote, setViewingNote] = useState<string | null>(null);
  const [downloadingNote, setDownloadingNote] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof noteSchema>>({ resolver: zodResolver(noteSchema) });

  async function viewNoteAttachment(noteId: string) {
    setViewingNote(noteId);
    try {
      const url = (await api.get(`/notes/${noteId}/${subjectId}/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingNote(null);
    }
  }

  async function downloadNoteAttachment(noteId: string, title: string) {
    setDownloadingNote(noteId);
    try {
      const url = (await api.get(`/notes/${noteId}/${subjectId}/view`)).data;
      await downloadFromUrl(url, title);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingNote(null);
    }
  }

  const endpoint = currentWeek ? `/notes/all/subject/${subjectId}/current-week` : `/notes/all/subject/${subjectId}`;
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["course-notes", subjectId, currentWeek],
    queryFn: async () => { const d = (await api.get(endpoint)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });

  async function onSubmit(data: z.infer<typeof noteSchema>) {
    if (!file && !data.message) { toast.error("Add a message or attach a file for the note"); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      if (data.message) form.append("message", data.message);
      if (file) form.append("notes", file);
      await api.post(`/notes/${subjectId}/create`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Note uploaded");
      qc.invalidateQueries({ queryKey: ["course-notes", subjectId] });
      setShowCreate(false);
      reset();
      setFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => api.delete(`/notes/subject/${subjectId}/${noteId}`),
    onSuccess: () => { toast.success("Note deleted"); qc.invalidateQueries({ queryKey: ["course-notes", subjectId] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Upload Note</Button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(notes as Record<string, unknown>[]).map((note) => (
            <div key={String(note.id)} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0"><BookOpen className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{String(note.title ?? "")}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{formatDate(note.created_at as string)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!!note.file_path && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={viewingNote === String(note.id)}
                        onClick={() => viewNoteAttachment(String(note.id))}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={downloadingNote === String(note.id)}
                        onClick={() => downloadNoteAttachment(String(note.id), String(note.title ?? "note"))}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(note.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{String(note.message ?? "")}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No notes uploaded yet{currentWeek ? " this week" : ""}</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Note</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content (optional)</Label><Textarea rows={3} {...register("message")} /></div>
            <div className="space-y-1.5"><Label>File Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); setFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={uploading}>{uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RosterTab({ roster }: { roster: RosterStudent[] }) {
  if (roster.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <Users className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No students enrolled in this subject yet</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {roster.map((s) => (
        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          <div className="rounded-full bg-primary/10 p-2"><Users className="h-4 w-4 text-primary" /></div>
          <p className="text-sm font-medium truncate">{s.name}</p>
        </div>
      ))}
    </div>
  );
}

function AssignmentsTab({ subjectId, currentWeek, roster }: { subjectId: string; currentWeek: boolean; roster: RosterStudent[] }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [gradeTarget, setGradeTarget] = useState<string | null>(null);
  const [extendTarget, setExtendTarget] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extendStudentTarget, setExtendStudentTarget] = useState<string | null>(null);
  const [viewSubs, setViewSubs] = useState<string | null>(null);
  const [viewViews, setViewViews] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Record<string, unknown> | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  async function viewAssignmentAttachment(assignmentId: string) {
    setViewingAttachment(true);
    try {
      const url = (await api.get(`/assignments/admin/${assignmentId}/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingAttachment(false);
    }
  }

  async function downloadAssignmentAttachment(assignmentId: string, name: string) {
    setDownloadingAttachment(true);
    try {
      const url = (await api.get(`/assignments/admin/${assignmentId}/view`)).data;
      await downloadFromUrl(url, name);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingAttachment(false);
    }
  }

  async function viewSubmissionFile(studentId: string) {
    if (!viewSubs) return;
    setViewingFile(studentId);
    try {
      const url = (await api.get(`/assignments/${viewSubs}/${studentId}/submission/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingFile(null);
    }
  }

  async function downloadSubmissionFile(studentId: string, name: string) {
    if (!viewSubs) return;
    setDownloadingFile(studentId);
    try {
      const url = (await api.get(`/assignments/${viewSubs}/${studentId}/submission/view`)).data;
      await downloadFromUrl(url, name);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingFile(null);
    }
  }

  const endpoint = `/assignments/teacher/all${currentWeek ? "/current-week" : ""}?subject_id=${subjectId}`;
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["course-assignments", subjectId, currentWeek],
    queryFn: async () => { const d = (await api.get(endpoint)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions", viewSubs],
    queryFn: async () => { const d = (await api.get(`/assignments/submissions/${viewSubs}`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!viewSubs,
  });

  const { data: views = [] } = useQuery({
    queryKey: ["assignment-views", viewViews],
    queryFn: async () => { const d = (await api.get(`/assignments/${viewViews}/views`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!viewViews,
  });

  const { data: gradeSubmissions = [] } = useQuery({
    queryKey: ["submissions", gradeTarget],
    queryFn: async () => { const d = (await api.get(`/assignments/submissions/${gradeTarget}`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!gradeTarget,
  });
  const submittedStudents = roster.filter((s) => gradeSubmissions.some((sub) => String(sub.students_id) === s.id));

  const studentGradeQueries = useQueries({
    queries: submittedStudents.map((s) => ({
      queryKey: ["assignment-grade", gradeTarget, s.id],
      queryFn: async () => (await api.get(`/assignments/${gradeTarget}/my-grade/${s.id}`)).data,
      enabled: !!gradeTarget,
    })),
  });
  const gradeByStudentId = Object.fromEntries(
    submittedStudents.map((s, i) => [s.id, studentGradeQueries[i]?.data as string | null | undefined])
  );
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);

  const { register: regCreate, handleSubmit: hsCreate, reset: resetCreate, formState: { errors: errCreate } } = useForm<z.infer<typeof assignmentSchema>>({ resolver: zodResolver(assignmentSchema) });
  const { register: regGrade, handleSubmit: hsGrade, reset: resetGrade, formState: { errors: errGrade } } = useForm<z.infer<typeof assignmentGradeSchema>>({ resolver: zodResolver(assignmentGradeSchema), defaultValues: { student_id: "", grade: "", message: "" } });
  const { register: regExtendStudent, handleSubmit: hsExtendStudent, control: extendStudentControl, reset: resetExtendStudent, formState: { errors: errExtendStudent } } = useForm<z.infer<typeof extendStudentSchema>>({ resolver: zodResolver(extendStudentSchema), defaultValues: { student_id: "", due_date: "" } });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/delete/${subjectId}/${id}`),
    onSuccess: () => { toast.success("Assignment deleted"); qc.invalidateQueries({ queryKey: ["course-assignments", subjectId] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ assignmentId, studentId, grade, message }: { assignmentId: string; studentId: string; grade: string; message?: string }) =>
      api.post(`/assignments/${assignmentId}/add-grade/${studentId}`, { grade, message, subject_id: subjectId }),
    onSuccess: (_data, vars) => {
      toast.success("Grade submitted");
      qc.invalidateQueries({ queryKey: ["assignment-grade", vars.assignmentId, vars.studentId] });
      setGradingStudentId(null);
      resetGrade();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const changeGradeMutation = useMutation({
    mutationFn: ({ assignmentId, studentId, grade, message }: { assignmentId: string; studentId: string; grade: string; message?: string }) =>
      api.patch(`/assignments/${assignmentId}/change-grade/${studentId}`, { grade, message, subject_id: subjectId }),
    onSuccess: (_data, vars) => {
      toast.success("Grade updated");
      qc.invalidateQueries({ queryKey: ["assignment-grade", vars.assignmentId, vars.studentId] });
      setGradingStudentId(null);
      resetGrade();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => api.patch(`/assignments/extend/${id}`, { due_date: date }),
    onSuccess: () => { toast.success("Deadline extended for all students"); qc.invalidateQueries({ queryKey: ["course-assignments", subjectId] }); setExtendTarget(null); setExtendDate(""); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const extendStudentMutation = useMutation({
    mutationFn: ({ assignmentId, studentId, date }: { assignmentId: string; studentId: string; date: string }) =>
      api.patch(`/assignments/extend/${assignmentId}/student/${studentId}`, { due_date: date }),
    onSuccess: () => { toast.success("Extension granted"); setExtendStudentTarget(null); resetExtendStudent(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  async function onCreate(data: z.infer<typeof assignmentSchema>) {
    setCreating(true);
    try {
      const form = new FormData();
      form.append("name", data.name);
      if (data.description) form.append("description", data.description);
      form.append("due_date", data.due_date);
      form.append("subject_id", subjectId);
      if (file) form.append("file", file);
      await api.post(`/assignments/create/subject/${subjectId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Assignment created");
      qc.invalidateQueries({ queryKey: ["course-assignments", subjectId] });
      setShowCreate(false);
      resetCreate();
      setFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Assignment</Button>
      </div>
      <DataTable
        loading={isLoading}
        columns={[
          { key: "name", label: "Assignment", render: (r) => <span className="font-medium">{String(r.name ?? "")}</span> },
          { key: "description", label: "Description", render: (r) => <span className="text-muted-foreground text-sm truncate block max-w-xs">{String(r.description ?? "")}</span> },
          { key: "due_date", label: "Due", render: (r) => <span className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(r.due_date as string)}</span> },
          {
            key: "actions", label: "", className: "w-16 text-right",
            render: (r) => (
              <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Assignment actions" />}>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setViewSubs(String(r.id))}><Eye />View submissions</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewViews(String(r.id))}><Users />See who viewed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGradeTarget(String(r.id))}><Award />Grade submissions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setExtendTarget(String(r.id)); setExtendDate(""); }}><CalendarClock />Extend deadline for all</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setExtendStudentTarget(String(r.id)); resetExtendStudent(); }}><Clock />Extend deadline for one student</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => deleteMutation.mutate(String(r.id))}><Trash2 />Delete assignment</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
          },
        ]}
        data={assignments}
        onRowClick={(r) => setDetailsTarget(r)}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={hsCreate(onCreate)} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Title</Label><Input {...regCreate("name")} />{errCreate.name && <p className="text-xs text-destructive">{errCreate.name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea rows={2} {...regCreate("description")} /></div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" {...regCreate("due_date")} /></div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetCreate(); setFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsTarget} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{String(detailsTarget?.name ?? "Assignment")}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm">{String(detailsTarget?.description ?? "No description provided")}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Due Date</Label>
              <p className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(detailsTarget?.due_date as string)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailsTarget(null)}>Close</Button>
            {detailsTarget?.file_path ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={downloadingAttachment}
                  onClick={() => downloadAssignmentAttachment(String(detailsTarget?.id), String(detailsTarget?.name ?? "assignment"))}
                >
                  {downloadingAttachment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Download className="h-4 w-4 mr-1.5" />Download
                </Button>
                <Button
                  type="button"
                  disabled={viewingAttachment}
                  onClick={() => viewAssignmentAttachment(String(detailsTarget?.id))}
                >
                  {viewingAttachment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<ExternalLink className="h-4 w-4 mr-1.5" />View Attachment
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewSubs} onOpenChange={() => setViewSubs(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Submissions</DialogTitle></DialogHeader>
          <DataTable
            columns={[
              { key: "students_id", label: "Student", render: (r) => <span className="font-medium">{roster.find((s) => s.id === r.students_id)?.name ?? String(r.students_id ?? "")}</span> },
              { key: "date_submitted", label: "Submitted", render: (r) => formatDate(r.date_submitted as string) },
              {
                key: "file_path", label: "File",
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={viewingFile === String(r.students_id ?? "")}
                      onClick={() => viewSubmissionFile(String(r.students_id ?? ""))}
                      className="text-primary text-sm hover:underline disabled:opacity-50"
                    >
                      {viewingFile === String(r.students_id ?? "") ? "Loading..." : "View"}
                    </button>
                    <button
                      type="button"
                      disabled={downloadingFile === String(r.students_id ?? "")}
                      onClick={() => downloadSubmissionFile(String(r.students_id ?? ""), `${roster.find((s) => s.id === r.students_id)?.name ?? r.students_id}-submission`)}
                      className="text-primary text-sm hover:underline disabled:opacity-50"
                    >
                      {downloadingFile === String(r.students_id ?? "") ? "Loading..." : "Download"}
                    </button>
                  </div>
                ),
              },
            ]}
            data={submissions}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewViews} onOpenChange={() => setViewViews(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Who Viewed</DialogTitle></DialogHeader>
          <DataTable
            columns={[
              { key: "student_id", label: "Student", render: (r) => <span className="font-medium">{roster.find((s) => s.id === r.student_id)?.name ?? String(r.student_id ?? "")}</span> },
              { key: "date_viewed", label: "Viewed", render: (r) => formatDate(r.date_viewed as string) },
            ]}
            data={views}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!gradeTarget} onOpenChange={() => { setGradeTarget(null); setGradingStudentId(null); resetGrade(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grade Submissions</DialogTitle></DialogHeader>

          {!gradingStudentId && (
            <div className="space-y-2 pt-2">
              {submittedStudents.length === 0 && (
                <p className="text-sm text-muted-foreground">No students have submitted this assignment yet.</p>
              )}
              {submittedStudents.map((s) => {
                const existingGrade = gradeByStudentId[s.id];
                const isGraded = existingGrade !== undefined && existingGrade !== null;
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.name}</span>
                      {isGraded
                        ? <Badge variant="default">{String(existingGrade)}</Badge>
                        : <Badge variant="secondary">Not graded</Badge>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetGrade({ student_id: s.id, grade: isGraded ? String(existingGrade) : "", message: "" });
                        setGradingStudentId(s.id);
                      }}
                    >
                      {isGraded ? <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</> : <><Award className="h-3.5 w-3.5 mr-1.5" />Grade</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {gradingStudentId && (() => {
            const student = submittedStudents.find((s) => s.id === gradingStudentId);
            const isGraded = gradeByStudentId[gradingStudentId] !== undefined && gradeByStudentId[gradingStudentId] !== null;
            const activeMutation = isGraded ? changeGradeMutation : gradeMutation;
            return (
              <form
                onSubmit={hsGrade((d) => gradeTarget && activeMutation.mutate({ assignmentId: gradeTarget, studentId: d.student_id, grade: d.grade, message: d.message }))}
                className="space-y-4 pt-2"
              >
                <p className="text-sm text-muted-foreground">Grading <span className="font-medium text-foreground">{student?.name}</span></p>
                <div className="space-y-1.5"><Label>Grade (0–100)</Label><Input type="number" {...regGrade("grade")} />{errGrade.grade && <p className="text-xs text-destructive">{errGrade.grade.message}</p>}</div>
                <div className="space-y-1.5"><Label>Feedback (optional)</Label><Textarea rows={2} {...regGrade("message")} /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setGradingStudentId(null); resetGrade(); }}>Back</Button>
                  <Button type="submit" disabled={activeMutation.isPending}>
                    {activeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isGraded ? "Update Grade" : "Submit Grade"}
                  </Button>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={!!extendTarget} onOpenChange={() => { setExtendTarget(null); setExtendDate(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Extend Deadline</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>New Due Date</Label>
              <Input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExtendTarget(null)}>Cancel</Button>
              <Button
                disabled={!extendDate || extendMutation.isPending}
                onClick={() => extendTarget && extendMutation.mutate({ id: extendTarget, date: extendDate })}
              >
                {extendMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Extend for All
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!extendStudentTarget} onOpenChange={() => { setExtendStudentTarget(null); resetExtendStudent(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Extend Deadline for Student</DialogTitle></DialogHeader>
          <form
            onSubmit={hsExtendStudent((d) => extendStudentTarget && extendStudentMutation.mutate({ assignmentId: extendStudentTarget, studentId: d.student_id, date: d.due_date }))}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Controller
                control={extendStudentControl}
                name="student_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v: unknown) => field.onChange(String(v ?? ""))}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {roster.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errExtendStudent.student_id && <p className="text-xs text-destructive">{errExtendStudent.student_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>New Due Date</Label>
              <Input type="date" {...regExtendStudent("due_date")} />
              {errExtendStudent.due_date && <p className="text-xs text-destructive">{errExtendStudent.due_date.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExtendStudentTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={extendStudentMutation.isPending}>
                {extendStudentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Extend
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttendanceTab({ subjectId, roster }: { subjectId: string; roster: RosterStudent[] }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: history = [] } = useQuery({
    queryKey: ["attendance-history-subject", subjectId],
    queryFn: async () => { const d = (await api.get(`/attendance/all/subject/${subjectId}`)).data; return Array.isArray(d) ? (d as AttendanceRow[]) : []; },
    enabled: !!subjectId,
  });
  const historyByDate = groupAttendanceByDate(history);

  async function loadStudents() {
    setLoading(true);
    try {
      const existing = (await api.get(`/attendance/all/subject/${subjectId}/${date}`)).data;
      const existingByStudent = new Map((Array.isArray(existing) ? existing : []).map((r: AttendanceRow) => [r.student_id, r.present]));
      setRecords(roster.map((s) => ({ student_id: s.id, present: existingByStudent.get(s.id) ?? true })));
      setLoaded(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function togglePresent(studentId: string) {
    setRecords((prev) => prev.map((r) => (r.student_id === studentId ? { ...r, present: !r.present } : r)));
  }

  async function submit() {
    if (records.length === 0) { toast.error("Load students first"); return; }
    setSubmitting(true);
    try {
      await api.post(`/attendance/take/subject/${subjectId}`, { date, records, subject_id: subjectId });
      toast.success("Attendance submitted");
      qc.invalidateQueries({ queryKey: ["attendance-history-subject", subjectId] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Section>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setLoaded(false); }} className="w-44" />
          </div>
          <Button onClick={loadStudents} variant="secondary" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Load Students
          </Button>
        </div>
      </Section>

      {loaded && (
        <Section title={`Students (${records.filter((r) => r.present).length}/${records.length} present)`}>
          <div className="space-y-2">
            {records.map((rec) => {
              const student = roster.find((s) => s.id === rec.student_id);
              return (
                <div key={rec.student_id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <p className="text-sm font-medium">{student?.name ?? rec.student_id}</p>
                  <button onClick={() => togglePresent(rec.student_id)} className="transition-all">
                    <Badge variant={rec.present ? "default" : "destructive"} className="cursor-pointer select-none w-20 justify-center">
                      {rec.present ? "Present" : "Absent"}
                    </Badge>
                  </button>
                </div>
              );
            })}
            {records.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No students in this course yet</p>}
          </div>
          {records.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit Attendance
              </Button>
            </div>
          )}
        </Section>
      )}

      <Section title="Attendance History">
        <DataTable
          columns={[
            { key: "date", label: "Date", render: (r) => formatDate(r.date) },
            { key: "present", label: "Present", render: (r) => r.present },
            { key: "absent", label: "Absent", render: (r) => r.absent },
            { key: "total", label: "Total", render: (r) => r.total },
          ]}
          data={historyByDate}
          onRowClick={(r) => setSelectedDate(r.date)}
        />
      </Section>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedDate ? formatDate(selectedDate) : ""}</DialogTitle></DialogHeader>
          <div className="space-y-2 pt-2">
            {history.filter((h) => h.date === selectedDate).map((h) => {
              const student = roster.find((s) => s.id === h.student_id);
              return (
                <div key={h.student_id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <p className="text-sm font-medium">{student?.name ?? h.student_id}</p>
                  <Badge variant={h.present ? "default" : "destructive"} className="w-20 justify-center">
                    {h.present ? "Present" : "Absent"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AnnouncementsTab({ subjectId, currentWeek }: { subjectId: string; currentWeek: boolean }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof announcementSchema>>({ resolver: zodResolver(announcementSchema) });

  const endpoint = currentWeek ? `/announcements/all/subject/${subjectId}/current-week` : `/announcements/all/subject/${subjectId}`;
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["course-announcements", subjectId, currentWeek],
    queryFn: async () => { const d = (await api.get(endpoint)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });

  async function onCreate(data: z.infer<typeof announcementSchema>) {
    setCreating(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("content", data.content);
      form.append("subject_id", subjectId);
      if (file) form.append("file", file);
      await api.post(`/announcements/create/subject/${subjectId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Announcement posted");
      qc.invalidateQueries({ queryKey: ["course-announcements", subjectId] });
      setShowCreate(false);
      reset();
      setFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Announcement</Button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
      ) : (announcements as Record<string, unknown>[]).length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No announcements for this course{currentWeek ? " this week" : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(announcements as Record<string, unknown>[]).map((a) => (
            <div key={String(a.id)} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0"><Bell className="h-4 w-4 text-primary" /></div>
              <div className="flex-1">
                <p className="font-medium text-sm">{String(a.title ?? "")}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{String(a.content ?? "")}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatDate(a.created_at as string)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Subject Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} {...register("content")} /></div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); setFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Post</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
        <p className="text-sm font-medium">{student.name}</p>
        {!editing && (
          <div className="flex items-center gap-2">
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

function ExamsTab({ subjectId, roster }: { subjectId: string; roster: RosterStudent[] }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [gradesTarget, setGradesTarget] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null);
  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["course-exams", subjectId],
    queryFn: async () => { const d = (await api.get(`/exams/${subjectId}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });

  const { register: regCreate, handleSubmit: hsCreate, reset: resetCreate, formState: { errors: errCreate } } = useForm<z.infer<typeof examSchema>>({ resolver: zodResolver(examSchema) });
  const { register: regEdit, handleSubmit: hsEdit, reset: resetEdit, formState: { errors: errEdit } } = useForm<z.infer<typeof examEditSchema>>({ resolver: zodResolver(examEditSchema) });

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

  async function onCreate(data: z.infer<typeof examSchema>) {
    setCreating(true);
    try {
      const form = new FormData();
      form.append("name", data.name);
      form.append("content", data.content);
      if (file) form.append("file", file);
      await api.post(`/exams/${subjectId}/create`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Exam created");
      qc.invalidateQueries({ queryKey: ["course-exams", subjectId] });
      setShowCreate(false);
      resetCreate();
      setFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  const editMutation = useMutation({
    mutationFn: (d: z.infer<typeof examEditSchema>) => api.patch(`/exams/${editTarget?.id}/update`, d),
    onSuccess: () => {
      toast.success("Exam updated");
      qc.invalidateQueries({ queryKey: ["course-exams", subjectId] });
      setEditTarget(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (examId: string) => api.delete(`/exams/${examId}/delete`),
    onSuccess: () => { toast.success("Exam deleted"); qc.invalidateQueries({ queryKey: ["course-exams", subjectId] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Exam</Button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(exams as Record<string, unknown>[]).map((exam) => (
            <div key={String(exam.id)} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0"><FileCheck className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{String(exam.name ?? "")}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{formatDate(exam.created_at as string)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!!exam.file_path && (
                    <>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={viewingAttachment === String(exam.id)} onClick={() => viewExamAttachment(String(exam.id))}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={downloadingAttachment === String(exam.id)} onClick={() => downloadExamAttachment(String(exam.id), String(exam.name ?? "exam"))}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTarget(exam); resetEdit({ new_name: String(exam.name ?? ""), new_content: String(exam.content ?? "") }); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(exam.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{String(exam.content ?? "")}</p>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => setGradesTarget(String(exam.id))}>
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />Manage Grades
                </Button>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <FileCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No exams created yet</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Exam</DialogTitle></DialogHeader>
          <form onSubmit={hsCreate(onCreate)} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Name</Label><Input {...regCreate("name")} />{errCreate.name && <p className="text-xs text-destructive">{errCreate.name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} {...regCreate("content")} />{errCreate.content && <p className="text-xs text-destructive">{errCreate.content.message}</p>}</div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetCreate(); setFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button>
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
          <DialogHeader><DialogTitle>Manage Grades</DialogTitle></DialogHeader>
          <div className="space-y-2 pt-2 max-h-[60vh] overflow-y-auto">
            {roster.map((s) => gradesTarget && <ExamGradeRow key={s.id} examId={gradesTarget} student={s} />)}
            {roster.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No students in this course yet</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

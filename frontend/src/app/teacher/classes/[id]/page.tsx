"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Bell, Calendar, CheckCircle2, FileText, GraduationCap, Loader2, Plus, Users } from "lucide-react";

type TeacherProfile = { classes: { id: string; name: string }[] };
type RosterStudent = { id: string; name: string };
type ClassInfo = { has_timetable: boolean };
type AttendanceRecord = { student_id: string; present: boolean };
type AttendanceRow = { date: string; student_id: string; present: boolean };
type GradeSheetSubject = { class_subject_id: string; subject_name: string | null; grade: number | null; comment: string | null };
type GradeSheet = { is_open: boolean; subjects: GradeSheetSubject[] };
type ClassCompletion = {
  total_students: number;
  total_subjects: number;
  entered: number;
  complete: boolean;
  missing: { student_id: string; student_name: string; class_subject_id: string; subject_name: string }[];
};

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

const announcementSchema = z.object({ title: z.string().min(1), content: z.string().min(1) });

export default function TeacherClassDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params.id;

  const { data: profile } = useQuery({
    queryKey: ["teacher-me-profile"],
    queryFn: async () => (await api.get("/teacher/me/profile")).data as TeacherProfile,
  });
  const cls = (profile?.classes ?? []).find((c) => c.id === classId);

  const { data: roster = [], isLoading: rosterLoading } = useQuery({
    queryKey: ["class-roster", classId],
    queryFn: async () => {
      const data = (await api.get(`/classes/${classId}/students`)).data;
      return Array.isArray(data) ? (data as RosterStudent[]) : [];
    },
    enabled: !!classId,
  });

  return (
    <>
      <Header
        title={cls?.name ?? "Class"}
        description="Homeroom roster, attendance and announcements"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/teacher/courses")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Courses
          </Button>
        }
      />
      <PageShell>
        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Report Card Grades</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4">
            {rosterLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
            ) : roster.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No students in this class yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roster.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="rounded-full bg-primary/10 p-2"><Users className="h-4 w-4 text-primary" /></div>
                    <p className="text-sm font-medium truncate">{s.name}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <ClassAttendanceTab classId={classId} roster={roster} />
          </TabsContent>

          <TabsContent value="grades" className="mt-4">
            <ReportCardGradesTab classId={classId} roster={roster} />
          </TabsContent>

          <TabsContent value="announcements" className="mt-4">
            <ClassAnnouncementsTab classId={classId} />
          </TabsContent>

          <TabsContent value="timetable" className="mt-4">
            <ClassTimetableTab classId={classId} />
          </TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
}

function ClassAttendanceTab({ classId, roster }: { classId: string; roster: RosterStudent[] }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: history = [] } = useQuery({
    queryKey: ["attendance-history-class", classId],
    queryFn: async () => { const d = (await api.get(`/attendance/all/class/${classId}`)).data; return Array.isArray(d) ? (d as AttendanceRow[]) : []; },
    enabled: !!classId,
  });
  const historyByDate = groupAttendanceByDate(history);

  async function loadStudents() {
    setLoading(true);
    try {
      const existing = (await api.get(`/attendance/all/class/${classId}/${date}`)).data;
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
      await api.post(`/attendance/take/class/${classId}`, { date, records, class_id: classId });
      toast.success("Attendance submitted");
      qc.invalidateQueries({ queryKey: ["attendance-history-class", classId] });
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

function StudentGradeForm({
  classId,
  studentId,
  term,
  sheet,
  onSaved,
}: {
  classId: string;
  studentId: string;
  term: string;
  sheet: GradeSheet;
  onSaved: () => void;
}) {
  const [grades, setGrades] = useState<Record<string, { grade: string; comment: string }>>(() => {
    const init: Record<string, { grade: string; comment: string }> = {};
    for (const s of sheet.subjects) {
      init[s.class_subject_id] = { grade: s.grade !== null ? String(s.grade) : "", comment: s.comment ?? "" };
    }
    return init;
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const records = Object.entries(grades)
        .filter(([, v]) => v.grade !== "")
        .map(([class_subject_id, v]) => ({ class_subject_id, grade: Number(v.grade), comment: v.comment || undefined }));
      return api.post(`/report-card/grades/class/${classId}/student/${studentId}`, { term: Number(term), records });
    },
    onSuccess: () => { toast.success("Grades saved"); onSaved(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const isOpen = sheet.is_open;

  return (
    <>
      {!isOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive mb-3">
          Grade submission is closed for this term.
        </div>
      )}
      <div className="space-y-3">
        {sheet.subjects.map((s) => (
          <div key={s.class_subject_id} className="rounded-xl border border-border bg-card p-4">
            <Label className="text-xs">{s.subject_name ?? "Subject"}</Label>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Grade (0–100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={grades[s.class_subject_id]?.grade ?? ""}
                  onChange={(e) =>
                    setGrades((prev) => ({
                      ...prev,
                      [s.class_subject_id]: { grade: e.target.value, comment: prev[s.class_subject_id]?.comment ?? "" },
                    }))
                  }
                  disabled={!isOpen}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Comment (optional)</Label>
                <Textarea
                  rows={1}
                  value={grades[s.class_subject_id]?.comment ?? ""}
                  onChange={(e) =>
                    setGrades((prev) => ({
                      ...prev,
                      [s.class_subject_id]: { grade: prev[s.class_subject_id]?.grade ?? "", comment: e.target.value },
                    }))
                  }
                  disabled={!isOpen}
                />
              </div>
            </div>
          </div>
        ))}
        {sheet.subjects.length === 0 && <p className="text-sm text-muted-foreground py-4">No subjects set up for this class yet.</p>}
      </div>
      {sheet.subjects.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isOpen}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Grades
          </Button>
        </div>
      )}
    </>
  );
}

function ReportCardGradesTab({ classId, roster }: { classId: string; roster: RosterStudent[] }) {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: terms = [] } = useQuery({
    queryKey: ["terms"],
    queryFn: async () => { const d = (await api.get("/terms")).data; return Array.isArray(d) ? d : []; },
  });

  const { data: completion, isLoading: completionLoading } = useQuery({
    queryKey: ["class-grade-completion", classId, term],
    queryFn: async () => (await api.get(`/report-card/class/${classId}/term/${term}/completion`)).data as ClassCompletion,
    enabled: !!term,
  });

  const missingByStudent = new Map<string, number>();
  for (const m of completion?.missing ?? []) {
    missingByStudent.set(m.student_id, (missingByStudent.get(m.student_id) ?? 0) + 1);
  }

  const { data: sheet, isLoading: sheetLoading } = useQuery({
    queryKey: ["student-grade-sheet", classId, selectedStudentId, term],
    queryFn: async () => (await api.get(`/report-card/grades/class/${classId}/student/${selectedStudentId}/term/${term}`)).data as GradeSheet,
    enabled: !!term && !!selectedStudentId,
  });

  async function generate() {
    setGenerating(true);
    try {
      const res = await api.post(`/report-card/generate/class/${classId}/term/${term}`);
      toast.success(`Generated ${res.data?.generated ?? "the"} report card(s)`);
      qc.invalidateQueries({ queryKey: ["class-grade-completion", classId, term] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  const selectedStudentName = roster.find((s) => s.id === selectedStudentId)?.name ?? "Student";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Label>Term</Label>
          <Select value={term} onValueChange={(v: unknown) => { setTerm(String(v ?? "")); setSelectedStudentId(null); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select term" /></SelectTrigger>
            <SelectContent>
              {(terms as Record<string, unknown>[]).map((t) => (
                <SelectItem key={String(t.id)} value={String(t.number)}>{`Term ${t.number}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {term && (
          <div className="flex items-center gap-3">
            {completion && (
              <span className="text-sm text-muted-foreground">
                {completion.entered} / {completion.total_students * completion.total_subjects} grades entered
              </span>
            )}
            <Button onClick={generate} disabled={!completion?.complete || generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <GraduationCap className="h-4 w-4 mr-2" />}
              Generate Report Cards
            </Button>
          </div>
        )}
      </div>

      {!term ? (
        <p className="text-sm text-muted-foreground">Select a term to begin entering grades.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <div className="space-y-2">
            {roster.map((s) => {
              const missing = missingByStudent.get(s.id) ?? 0;
              const done = !completionLoading && missing === 0 && (completion?.total_subjects ?? 0) > 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 p-3 rounded-lg border text-left text-sm transition-colors",
                    selectedStudentId === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  )}
                >
                  <span className="truncate">{s.name}</span>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : missing > 0 ? (
                    <span className="text-xs text-muted-foreground flex-shrink-0">{missing} missing</span>
                  ) : null}
                </button>
              );
            })}
            {roster.length === 0 && <p className="text-sm text-muted-foreground py-4">No students in this class yet</p>}
          </div>

          <div>
            {!selectedStudentId ? (
              <div className="flex flex-col items-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">Select a student to enter grades</p>
              </div>
            ) : sheetLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
            ) : sheet ? (
              <Section title={selectedStudentName}>
                <StudentGradeForm
                  key={`${selectedStudentId}-${term}`}
                  classId={classId}
                  studentId={selectedStudentId}
                  term={term}
                  sheet={sheet}
                  onSaved={() => {
                    qc.invalidateQueries({ queryKey: ["student-grade-sheet", classId, selectedStudentId, term] });
                    qc.invalidateQueries({ queryKey: ["class-grade-completion", classId, term] });
                  }}
                />
              </Section>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassTimetableTab({ classId }: { classId: string }) {
  const [viewing, setViewing] = useState(false);

  const { data: info, isLoading } = useQuery({
    queryKey: ["class-info", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/info`)).data as ClassInfo,
    enabled: !!classId,
  });

  async function viewTimetable() {
    setViewing(true);
    try {
      const url = (await api.get(`/classes/${classId}/view/timetable`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewing(false);
    }
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>;

  if (!info?.has_timetable) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No timetable uploaded for this class yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16">
      <Button onClick={viewTimetable} disabled={viewing}>
        {viewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
        View Timetable
      </Button>
    </div>
  );
}

function ClassAnnouncementsTab({ classId }: { classId: string }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof announcementSchema>>({ resolver: zodResolver(announcementSchema) });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["class-announcements", classId],
    queryFn: async () => { const d = (await api.get(`/announcements/all/class/${classId}`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!classId,
  });

  async function onCreate(data: z.infer<typeof announcementSchema>) {
    setCreating(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("content", data.content);
      form.append("class_id", classId);
      if (file) form.append("file", file);
      await api.post(`/announcements/create/class/${classId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Announcement posted");
      qc.invalidateQueries({ queryKey: ["class-announcements", classId] });
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
          <p className="text-sm">No announcements for this class</p>
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
          <DialogHeader><DialogTitle>New Class Announcement</DialogTitle></DialogHeader>
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

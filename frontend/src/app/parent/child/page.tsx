"use client";

import { useEffect, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { countNewerThan, newestTimestamp, useLastSeen, useMarkSeen } from "@/hooks/use-last-seen";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { formatDate, getInitials, attendancePercentage } from "@/lib/utils";
import { Calendar, Award, AlertTriangle, FileText, Download, Loader2, Users, GraduationCap, FileCheck, UserCheck } from "lucide-react";
import { colorByIndex, colorPalette, gradeBadgeClass } from "@/lib/subject-style";

type Child = { id: string; user_id: string; name: string; [key: string]: unknown };
type AttendanceRecord = { present?: boolean | null };
type SubjectAverage = { subject_id: string; subject_name: string; average: number };
type ClassInfo = { name: string; class_teacher_name: string | null; has_timetable: boolean };
type RosterStudent = { id: string; name: string };

export default function ParentChildPage() {
  const session = getSession();
  const userId = session?.user.id ?? "";
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("reports");

  const { data: kids = [], isLoading: kidsLoading } = useQuery({
    queryKey: ["parent-my-kids"],
    queryFn: async () => (await api.get("/parent/my-kids")).data as Child[],
  });

  // Aggregated across all children, so badges match the sidebar's "My Child" count
  const allKidsReportCards = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-report-cards", k.id],
      queryFn: async () => (await api.get(`/report-cards/${k.id}/all`)).data ?? [],
    })),
  });
  const allKidsDiscipline = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-discipline", k.id],
      queryFn: async () => (await api.get(`/discipline/all/${k.id}`)).data ?? [],
    })),
  });
  const allKidsGrades = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-grades", k.id],
      queryFn: async () => (await api.get(`/assignments/all/grades/${k.id}`)).data ?? [],
    })),
  });
  const allKidsExamGrades = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-exam-grades", k.id],
      queryFn: async () => { const d = (await api.get(`/exam/${k.id}/all`)).data; return Array.isArray(d) ? d : []; },
    })),
  });

  const { data: lastSeenReportCards = 0 } = useLastSeen("report-cards", userId, "children");
  const { data: lastSeenDiscipline = 0 } = useLastSeen("discipline", userId, "children");
  const { data: lastSeenGrades = 0 } = useLastSeen("grades", userId, "children");
  const { data: lastSeenExamGrades = 0 } = useLastSeen("exam-grades", userId, "children");
  const markReportCardsSeen = useMarkSeen("report-cards", userId, "children");
  const markDisciplineSeen = useMarkSeen("discipline", userId, "children");
  const markGradesSeen = useMarkSeen("grades", userId, "children");
  const markExamGradesSeen = useMarkSeen("exam-grades", userId, "children");

  const allReportCards = allKidsReportCards.flatMap((q) => q.data ?? []);
  const allDiscipline = allKidsDiscipline.flatMap((q) => q.data ?? []);
  const allGrades = allKidsGrades.flatMap((q) => q.data ?? []);
  const allExamGrades = allKidsExamGrades.flatMap((q) => q.data ?? []);

  const unreadReportCards = countNewerThan(allReportCards, lastSeenReportCards);
  const unreadDiscipline = countNewerThan(allDiscipline, lastSeenDiscipline, "date");
  const unreadGrades = countNewerThan(allGrades, lastSeenGrades);
  const unreadExamGrades = countNewerThan(allExamGrades, lastSeenExamGrades);

  useEffect(() => {
    if (activeTab === "reports" && allReportCards.length > 0) markReportCardsSeen(newestTimestamp(allReportCards));
    else if (activeTab === "discipline" && allDiscipline.length > 0) markDisciplineSeen(newestTimestamp(allDiscipline, "date"));
    else if (activeTab === "grades" && allGrades.length > 0) markGradesSeen(newestTimestamp(allGrades));
    else if (activeTab === "exam-grades" && allExamGrades.length > 0) markExamGradesSeen(newestTimestamp(allExamGrades));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allReportCards, allDiscipline, allGrades, allExamGrades]);

  useEffect(() => {
    if (!selectedChild && kids.length > 0) setSelectedChild(kids[0]);
  }, [kids, selectedChild]);

  const studentId = selectedChild?.id ?? "";
  const classId = (selectedChild?.class_id as string) ?? "";

  async function viewReportCard(reportId: string) {
    setViewingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${studentId}/${reportId}/`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingId(null);
    }
  }

  async function downloadReportCard(reportId: string, label: string) {
    setDownloadingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${studentId}/${reportId}/`)).data;
      await downloadFromUrl(url, `report-card-${label}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  const { data: classAvg } = useQuery({
    queryKey: ["parent-class-avg", classId, studentId],
    queryFn: async () => (await api.get(`/attendance/average/class/${classId}/${studentId}/`)).data,
    enabled: !!studentId && !!classId,
  });

  const { data: subjectAvg } = useQuery({
    queryKey: ["parent-subject-avg", studentId],
    queryFn: async () => (await api.get(`/attendance/average/subject/${studentId}/`)).data,
    enabled: !!studentId,
  });

  const { data: classInfo, isLoading: classInfoLoading } = useQuery({
    queryKey: ["class-info", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/info`)).data as ClassInfo,
    enabled: !!classId,
  });

  const { data: classmates = [] } = useQuery({
    queryKey: ["class-roster", classId],
    queryFn: async () => {
      const data = (await api.get(`/classes/${classId}/students`)).data;
      return Array.isArray(data) ? (data as RosterStudent[]) : [];
    },
    enabled: !!classId,
  });

  const [viewingTimetable, setViewingTimetable] = useState(false);
  async function viewTimetable() {
    setViewingTimetable(true);
    try {
      const url = (await api.get(`/classes/${classId}/view/timetable`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingTimetable(false);
    }
  }

  const { data: reportCards = [] } = useQuery({
    queryKey: ["parent-report-cards", studentId],
    queryFn: async () => (await api.get(`/report-cards/${studentId}/all`)).data ?? [],
    enabled: !!studentId,
  });

  const { data: discipline = [] } = useQuery({
    queryKey: ["parent-discipline", studentId],
    queryFn: async () => (await api.get(`/discipline/all/${studentId}`)).data ?? [],
    enabled: !!studentId
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["parent-grades", studentId],
    queryFn: async () => (await api.get(`/assignments/all/grades/${studentId}`)).data ?? [],
    enabled: !!studentId,
  });

  const { data: examGrades = [] } = useQuery({
    queryKey: ["parent-exam-grades", studentId],
    queryFn: async () => { const d = (await api.get(`/exam/${studentId}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!studentId,
  });

  const avgNum = attendancePercentage(Array.isArray(classAvg) ? (classAvg as AttendanceRecord[]) : []);
  const subjectData = Array.isArray(subjectAvg) ? (subjectAvg as SubjectAverage[]) : [];

  return (
    <>
      <Header title="My Child" description="View your child&apos;s academic overview" />
      <PageShell>
        <Section title="Children">
          {kidsLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!kidsLoading && kids.length === 0 && (
            <p className="text-sm text-muted-foreground">No children are linked to your account yet.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {kids.map((child, i) => {
              const color = colorByIndex(i);
              const isSelected = selectedChild?.id === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${isSelected ? "bg-white/20" : `${color.bg} ${color.text}`}`}>
                    {getInitials(child.name)}
                  </span>
                  {child.name}
                </button>
              );
            })}
          </div>
        </Section>

        {selectedChild && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                label="Report Cards"
                value={reportCards.length}
                icon={Award}
                iconClassName={colorPalette[5].bg}
                iconColor={colorPalette[5].text}
                active={activeTab === "reports"}
                onClick={() => setActiveTab("reports")}
                badge={<NotificationBadge count={unreadReportCards} />}
              />
              <StatCard
                label="Discipline"
                value={discipline.length}
                icon={AlertTriangle}
                iconClassName={discipline.length > 0 ? "bg-orange-100 dark:bg-orange-500/15" : colorPalette[3].bg}
                iconColor={discipline.length > 0 ? "text-orange-600 dark:text-orange-400" : colorPalette[3].text}
                active={activeTab === "discipline"}
                onClick={() => setActiveTab("discipline")}
                badge={<NotificationBadge count={unreadDiscipline} />}
              />
              <StatCard
                label="Assignment Grades"
                value={grades.length}
                icon={GraduationCap}
                iconClassName={colorPalette[2].bg}
                iconColor={colorPalette[2].text}
                active={activeTab === "grades"}
                onClick={() => setActiveTab("grades")}
                badge={<NotificationBadge count={unreadGrades} />}
              />
              <StatCard
                label="Exam Grades"
                value={examGrades.length}
                icon={FileCheck}
                iconClassName={colorPalette[4].bg}
                iconColor={colorPalette[4].text}
                active={activeTab === "exam-grades"}
                onClick={() => setActiveTab("exam-grades")}
                badge={<NotificationBadge count={unreadExamGrades} />}
              />
              <StatCard
                label="Attendance"
                value={`${avgNum}%`}
                icon={Calendar}
                iconClassName={avgNum >= 75 ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-red-100 dark:bg-red-500/15"}
                iconColor={avgNum >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
                active={activeTab === "attendance"}
                onClick={() => setActiveTab("attendance")}
              />
              <StatCard
                label="Class"
                value={classInfo?.name ?? "—"}
                icon={Users}
                iconClassName={colorPalette[1].bg}
                iconColor={colorPalette[1].text}
                active={activeTab === "class"}
                onClick={() => setActiveTab("class")}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="reports" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(reportCards as Record<string, unknown>[]).map((card, i) => {
                    const color = colorByIndex(i);
                    return (
                    <div key={String(card.id)} className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${color.tintBg} ${color.tintBorder}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`rounded-lg p-2 ${color.solid}`}><Award className="h-4 w-4 text-white" /></div>
                        <div>
                          <p className="font-medium text-sm">{String(card.title ?? "Report Card")}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(card.created_at as string)}</p>
                        </div>
                      </div>
                      {!!card.file_path && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={viewingId === String(card.id)}
                            onClick={() => viewReportCard(String(card.id))}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
                          >
                            {viewingId === String(card.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}View PDF
                          </button>
                          <button
                            type="button"
                            disabled={downloadingId === String(card.id)}
                            onClick={() => downloadReportCard(String(card.id), String(card.title ?? card.id))}
                            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
                          >
                            {downloadingId === String(card.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {reportCards.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm py-8">No report cards</p>}
                </div>
              </TabsContent>

              <TabsContent value="discipline" className="mt-4">
                <DataTable
                  columns={[
                    { key: "action", label: "Incident", render: (r) => <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-orange-500" /><span className="font-medium">{String(r.action ?? "")}</span></div> },
                    { key: "message", label: "Details" },
                    { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
                  ]}
                  data={discipline}
                />
              </TabsContent>

              <TabsContent value="grades" className="mt-4">
                <DataTable
                  columns={[
                    { key: "assignment_id", label: "Assignment", render: (r) => <span className="font-mono text-xs">{String(r.assignment_id ?? "").slice(0, 8)}...</span> },
                    { key: "grade", label: "Grade /100", render: (r) => <span className="font-medium">{String(r.grade ?? "—")}</span> },
                    { key: "message", label: "Feedback", render: (r) => String(r.message ?? "—") },
                    { key: "created_at", label: "Graded", render: (r) => formatDate(r.created_at as string) },
                  ]}
                  data={grades}
                />
                {grades.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No graded assignments yet</p>}
              </TabsContent>

              <TabsContent value="exam-grades" className="mt-4">
                <div className="space-y-3">
                  {(examGrades as Record<string, unknown>[]).map((g) => {
                    const gradeValue = Number(g.grade);
                    return (
                    <div key={String(g.id)} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm ${colorPalette[2].tintBg} ${colorPalette[2].tintBorder}`}>
                      <div className={`rounded-lg p-2 flex-shrink-0 ${colorPalette[2].solid}`}><FileCheck className="h-4 w-4 text-white" /></div>
                      <div className="flex-1 min-w-0">
                        {!!g.message && <p className="text-sm text-muted-foreground">{String(g.message)}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(g.created_at as string)}</p>
                      </div>
                      <Badge className={Number.isFinite(gradeValue) ? gradeBadgeClass(gradeValue) : undefined}>{String(g.grade)}</Badge>
                    </div>
                    );
                  })}
                  {examGrades.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No exam grades recorded yet</p>}
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="mt-4">
                <div className="space-y-3">
                  {subjectData.map((s) => (
                    <div key={s.subject_id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.subject_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(s.average, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-10 text-right">{s.average}%</span>
                      </div>
                    </div>
                  ))}
                  {subjectData.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No subject attendance recorded yet</p>}
                </div>
              </TabsContent>

              <TabsContent value="class" className="mt-4 space-y-4">
                {classInfoLoading ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
                ) : !classId ? (
                  <p className="text-sm text-muted-foreground">Your child isn&apos;t assigned to a class yet.</p>
                ) : (
                  <>
                    <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${colorPalette[2].tintBg} ${colorPalette[2].tintBorder}`}>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${colorPalette[2].solid}`}><UserCheck className="h-4 w-4 text-white" /></div>
                        <div>
                          <p className="font-medium text-sm">{classInfo?.class_teacher_name ?? "Not assigned"}</p>
                          <p className="text-xs text-muted-foreground">Class teacher for {classInfo?.name}</p>
                        </div>
                      </div>
                      {classInfo?.has_timetable && (
                        <Button variant="outline" size="sm" onClick={viewTimetable} disabled={viewingTimetable}>
                          {viewingTimetable ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                          View Timetable
                        </Button>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-3">Classmates</p>
                      {classmates.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No classmates found</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {classmates.map((s, i) => {
                            const color = colorByIndex(i);
                            return (
                              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm ${color.tintBg} ${color.tintBorder}`}>
                                <div className={`rounded-full p-2 ${color.solid}`}><Users className="h-4 w-4 text-white" /></div>
                                <p className="text-sm font-medium truncate">{s.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {!kidsLoading && kids.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No children linked to your account</p>
          </div>
        )}
      </PageShell>
    </>
  );
}

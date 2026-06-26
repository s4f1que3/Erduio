"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, downloadFromUrl } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, BookOpen, ExternalLink, Calendar, Bell, Paperclip, Download, ClipboardList, FileCheck, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { colorPalette } from "@/lib/subject-style";

const NOTES_COLOR = colorPalette[3]; // blue
const ASSIGNMENTS_COLOR = colorPalette[5]; // amber
const EXAMS_COLOR = colorPalette[2]; // violet
const ANNOUNCEMENTS_COLOR = colorPalette[4]; // pink

type StudentProfile = {
  id: string;
  subjects: { id: string; name: string | null }[];
};

function hasAttachment(a: Record<string, unknown>) {
  return !!a.file_path && a.file_path !== "null";
}

export default function StudentCourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const subjectId = params.id;

  const [currentWeek, setCurrentWeek] = useState(false);
  const [viewingNoteId, setViewingNoteId] = useState<string | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState({ announcements: false, assignments: false, exams: false, notes: false });

  function toggleSection(key: keyof typeof collapsed) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function CollapseToggle({ section }: { section: keyof typeof collapsed }) {
    return (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSection(section)}>
        {collapsed[section] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
    );
  }

  async function viewNoteAttachment(noteId: string) {
    setViewingNoteId(noteId);
    try {
      const url = (await api.get(`/notes/${noteId}/${subjectId}/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setViewingNoteId(null);
    }
  }

  async function downloadNoteAttachment(noteId: string, title: string) {
    setDownloadingNoteId(noteId);
    try {
      const url = (await api.get(`/notes/${noteId}/${subjectId}/view`)).data;
      await downloadFromUrl(url, title);
    } finally {
      setDownloadingNoteId(null);
    }
  }

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const subject = (profile?.subjects ?? []).find((s) => s.id === subjectId);

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["course-exams", subjectId],
    queryFn: async () => { const d = (await api.get(`/exams/${subjectId}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["course-notes", subjectId, currentWeek],
    queryFn: async () => (await api.get(currentWeek ? `/notes/all/subject/${subjectId}/current-week` : `/notes/all/subject/${subjectId}`)).data ?? [],
    enabled: !!subjectId,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["course-assignments", subjectId, currentWeek],
    queryFn: async () => (await api.get(currentWeek ? `/assignments/all/${subjectId}/current-week` : `/assignments/all/${subjectId}`)).data ?? [],
    enabled: !!subjectId,
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ["course-announcements", subjectId, currentWeek],
    queryFn: async () => (await api.get(currentWeek ? `/announcements/all/subject/${subjectId}/current-week` : `/announcements/all/subject/${subjectId}`)).data ?? [],
    enabled: !!subjectId,
  });

  return (
    <>
      <Header
        title={subject?.name ?? "Course"}
        description="Notes, assignments, exams and announcements for this course"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/student/courses")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Courses
          </Button>
        }
      />
      <PageShell>
        <div className="flex items-center justify-end gap-2">
          <Switch checked={currentWeek} onCheckedChange={setCurrentWeek} />
          <span className="text-sm text-muted-foreground">This week only</span>
        </div>

        <Section title="Announcements" description="Updates from your teacher for this course" actions={<CollapseToggle section="announcements" />}>
          {collapsed.announcements ? null : announcementsLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (announcements as Record<string, unknown>[]).length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No announcements{currentWeek ? " this week" : ""}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(announcements as Record<string, unknown>[]).map((a) => (
                <Link
                  key={String(a.id)}
                  href={`/student/courses/${subjectId}/announcements/${String(a.id)}`}
                  className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${ANNOUNCEMENTS_COLOR.tintBg} ${ANNOUNCEMENTS_COLOR.tintBorder}`}
                >
                  <div className={`rounded-lg p-2 flex-shrink-0 ${ANNOUNCEMENTS_COLOR.solid}`}><Bell className="h-4 w-4 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{String(a.title ?? "")}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{String(a.message ?? "")}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(a.created_at as string)}</span>
                      </div>
                      {hasAttachment(a) && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Attachment</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Assignments" description="Work assigned for this course" actions={<CollapseToggle section="assignments" />}>
          {collapsed.assignments ? null : assignmentsLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (assignments as Record<string, unknown>[]).length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No assignments{currentWeek ? " this week" : ""}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(assignments as Record<string, unknown>[]).map((a) => (
                <Link
                  key={String(a.id)}
                  href={`/student/courses/${subjectId}/assignments/${String(a.id)}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${ASSIGNMENTS_COLOR.tintBg} ${ASSIGNMENTS_COLOR.tintBorder}`}
                >
                  <div className={`rounded-lg p-2 flex-shrink-0 ${ASSIGNMENTS_COLOR.solid}`}>
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{String(a.name ?? "")}</p>
                    {!!a.due_date && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due {formatDate(a.due_date as string)}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Exams" description="Exams scheduled for this course" actions={<CollapseToggle section="exams" />}>
          {collapsed.exams ? null : examsLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (exams as Record<string, unknown>[]).length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <FileCheck className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No exams yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(exams as Record<string, unknown>[]).map((exam) => (
                <Link
                  key={String(exam.id)}
                  href={`/student/courses/${subjectId}/exams/${String(exam.id)}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${EXAMS_COLOR.tintBg} ${EXAMS_COLOR.tintBorder}`}
                >
                  <div className={`rounded-lg p-2 flex-shrink-0 ${EXAMS_COLOR.solid}`}>
                    <FileCheck className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{String(exam.name ?? "")}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{formatDate(exam.created_at as string)}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Notes" description="Reference material shared by your teacher" actions={<CollapseToggle section="notes" />}>
          {collapsed.notes ? null : notesLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (notes as Record<string, unknown>[]).length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <BookOpen className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No notes{currentWeek ? " this week" : ""}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(notes as Record<string, unknown>[]).map((note) => (
                <div key={String(note.id)} className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${NOTES_COLOR.tintBg} ${NOTES_COLOR.tintBorder}`}>
                  <div className={`rounded-lg p-2 flex-shrink-0 ${NOTES_COLOR.solid}`}>
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{String(note.title ?? "")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{String(note.message ?? "")}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{formatDate(note.created_at as string)}</p>
                    </div>
                  </div>
                  {!!note.file_path && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={viewingNoteId === String(note.id)}
                        onClick={() => viewNoteAttachment(String(note.id))}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={downloadingNoteId === String(note.id)}
                        onClick={() => downloadNoteAttachment(String(note.id), String(note.title ?? "note"))}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </PageShell>
    </>
  );
}

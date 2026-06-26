"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { DetailBanner } from "@/components/course/detail-banner";
import { ExamGradeBadge } from "@/components/course/grade-badges";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download, ExternalLink, FileCheck, Loader2 } from "lucide-react";
import { colorPalette } from "@/lib/subject-style";

const EXAMS_COLOR = colorPalette[2]; // violet

type StudentProfile = { id: string; subjects: { id: string; name: string | null }[] };

export default function StudentExamDetailPage() {
  const params = useParams<{ id: string; examId: string }>();
  const router = useRouter();
  const subjectId = params.id;
  const examId = params.examId;

  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const subject = (profile?.subjects ?? []).find((s) => s.id === subjectId);
  const internalStudentId = profile?.id ?? "";

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["course-exams", subjectId],
    queryFn: async () => { const d = (await api.get(`/exams/${subjectId}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!subjectId,
  });
  const exam = (exams as Record<string, unknown>[]).find((e) => String(e.id) === examId) ?? null;

  async function viewAttachment() {
    setViewing(true);
    try {
      const url = (await api.get(`/exams/${examId}/view`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewing(false);
    }
  }

  async function downloadAttachment(name: string) {
    setDownloading(true);
    try {
      const url = (await api.get(`/exams/${examId}/view`)).data;
      await downloadFromUrl(url, name);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Header
        title="Exam"
        description={subject?.name ?? "Course"}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push(`/student/courses/${subjectId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to course
          </Button>
        }
      />
      <PageShell>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : !exam ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <FileCheck className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Exam not found</p>
          </div>
        ) : (
          <>
            <DetailBanner
              icon={FileCheck}
              label="Exam"
              title={String(exam.name ?? "")}
              meta={formatDate(exam.created_at as string)}
              color={EXAMS_COLOR}
            />

            <Section title="Details">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(exam.content ?? "No additional details.")}</p>
            </Section>

            <Section title="Your Grade">
              <ExamGradeBadge examId={examId} studentId={internalStudentId} />
            </Section>

            {!!exam.file_path && (
              <Section title="Attachment">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" disabled={viewing} onClick={viewAttachment}>
                    {viewing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5 mr-1.5" />}View Attachment
                  </Button>
                  <Button variant="outline" size="sm" disabled={downloading} onClick={() => downloadAttachment(String(exam.name ?? "exam"))}>
                    {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}Download
                  </Button>
                </div>
              </Section>
            )}
          </>
        )}
      </PageShell>
    </>
  );
}

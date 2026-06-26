"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DetailBanner } from "@/components/course/detail-banner";
import { AssignmentGradeCell } from "@/components/course/grade-badges";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, ClipboardList, Download, ExternalLink, Loader2, Upload } from "lucide-react";
import { colorPalette } from "@/lib/subject-style";

const ASSIGNMENTS_COLOR = colorPalette[5]; // amber

type StudentProfile = { id: string; subjects: { id: string; name: string | null }[] };

export default function StudentAssignmentDetailPage() {
  const params = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const subjectId = params.id;
  const assignmentId = params.assignmentId;
  const session = getSession();
  const studentId = session?.user.id ?? "";
  const [file, setFile] = useState<File | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const subject = (profile?.subjects ?? []).find((s) => s.id === subjectId);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["course-assignments", subjectId, false],
    queryFn: async () => (await api.get(`/assignments/all/${subjectId}`)).data ?? [],
    enabled: !!subjectId,
  });
  const assignment = (assignments as Record<string, unknown>[]).find((a) => String(a.id) === assignmentId) ?? null;

  // Opening the page is what counts as "viewing" the assignment (like Moodle) - fires
  // once and logs the view server-side, regardless of whether a file exists.
  const { data: attachmentUrl, isLoading: attachmentLoading } = useQuery({
    queryKey: ["assignment-view", assignmentId],
    queryFn: async () => {
      try {
        return ((await api.get(`/assignments/${assignmentId}/view`)).data as string) ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!assignmentId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a file first");
      const form = new FormData();
      form.append("file", file);
      await api.post(`/assignments/student/upload/${assignmentId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Assignment submitted!");
      setFile(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Header
        title="Assignment"
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
        ) : !assignment ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Assignment not found</p>
          </div>
        ) : (
          <>
            <DetailBanner
              icon={ClipboardList}
              label="Assignment"
              title={String(assignment.name ?? "")}
              meta={`Due ${formatDate(assignment.due_date as string)}`}
              color={ASSIGNMENTS_COLOR}
            />

            <Section title="Description">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(assignment.description ?? "No description provided.")}</p>
            </Section>

            <Section title="Your Grade">
              <AssignmentGradeCell assignmentId={assignmentId} studentId={studentId} />
            </Section>

            {attachmentLoading ? (
              <p className="text-xs text-muted-foreground animate-pulse">Checking for attachment...</p>
            ) : attachmentUrl ? (
              <Section title="Attachment">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => window.open(attachmentUrl, "_blank", "noopener,noreferrer")}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />View Attachment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadFromUrl(attachmentUrl, String(assignment.name ?? "assignment"))}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Download
                  </Button>
                </div>
              </Section>
            ) : null}

            <Section title="Submit Your Work">
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1.5">
                  <Label>Upload your work</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-64" />
                </div>
                <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !file}>
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Submit
                </Button>
              </div>
            </Section>
          </>
        )}
      </PageShell>
    </>
  );
}

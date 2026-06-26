"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { DetailBanner } from "@/components/course/detail-banner";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Bell, Loader2, Paperclip } from "lucide-react";
import { colorPalette } from "@/lib/subject-style";

const ANNOUNCEMENTS_COLOR = colorPalette[4]; // pink

type StudentProfile = { id: string; subjects: { id: string; name: string | null }[] };

function hasAttachment(a: Record<string, unknown>) {
  return !!a.file_path && a.file_path !== "null";
}

export default function StudentCourseAnnouncementDetailPage() {
  const params = useParams<{ id: string; announcementId: string }>();
  const router = useRouter();
  const subjectId = params.id;
  const announcementId = params.announcementId;
  const [viewing, setViewing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const subject = (profile?.subjects ?? []).find((s) => s.id === subjectId);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["course-announcements", subjectId, false],
    queryFn: async () => (await api.get(`/announcements/all/subject/${subjectId}`)).data ?? [],
    enabled: !!subjectId,
  });
  const announcement = (announcements as Record<string, unknown>[]).find((a) => String(a.id) === announcementId) ?? null;

  async function viewAttachment() {
    setViewing(true);
    try {
      const url = (await api.get(`/announcements/view${announcementId}`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewing(false);
    }
  }

  return (
    <>
      <Header
        title="Announcement"
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
        ) : !announcement ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Bell className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Announcement not found</p>
          </div>
        ) : (
          <>
            <DetailBanner
              icon={Bell}
              label="Announcement"
              title={String(announcement.title ?? "")}
              meta={formatDate(announcement.created_at as string)}
              color={ANNOUNCEMENTS_COLOR}
            />

            <Section title="Message">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(announcement.message ?? "")}</p>
            </Section>

            {hasAttachment(announcement) && (
              <Section title="Attachment">
                <Button onClick={viewAttachment} disabled={viewing}>
                  {viewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Paperclip className="h-4 w-4 mr-2" />}
                  View Attachment
                </Button>
              </Section>
            )}
          </>
        )}
      </PageShell>
    </>
  );
}

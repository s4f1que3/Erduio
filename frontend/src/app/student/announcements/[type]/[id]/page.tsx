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
import { ColorStyle, colorPalette } from "@/lib/subject-style";

type AnnouncementType = "general" | "students" | "personal" | "class";

type StudentProfile = { id: string; class: { id: string; name: string } | null };

const LIST_ENDPOINTS: Record<Exclude<AnnouncementType, "class">, string> = {
  general: "/student/announcements/general",
  students: "/student/announcements/students",
  personal: "/student/announcements/to-me",
};

const VIEW_ENDPOINTS: Record<AnnouncementType, (id: string) => string> = {
  general: (id) => `/announcements/general/view${id}`,
  students: (id) => `/announcements/group/view${id}`,
  personal: (id) => `/announcement/view${id}`,
  class: (id) => `/announcements/view${id}`,
};

const TAB_COLOR: Record<AnnouncementType, ColorStyle> = {
  general: colorPalette[3],
  students: colorPalette[2],
  personal: colorPalette[4],
  class: colorPalette[1],
};

const TAB_LABEL: Record<AnnouncementType, string> = {
  general: "General",
  students: "Students",
  personal: "Personal",
  class: "Class",
};

function hasAttachment(a: Record<string, unknown>) {
  return !!a.upload_url && a.upload_url !== "null";
}

export default function StudentAnnouncementDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const type = (["general", "students", "personal", "class"].includes(params.type) ? params.type : "general") as AnnouncementType;
  const announcementId = params.id;
  const [viewing, setViewing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
    enabled: type === "class",
  });
  const classId = profile?.class?.id ?? "";

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["student-ann", type, classId],
    queryFn: async () => (await api.get(type === "class" ? `/student/announcements/class/${classId}` : LIST_ENDPOINTS[type as Exclude<AnnouncementType, "class">])).data ?? [],
    enabled: type !== "class" || !!classId,
  });
  const announcement = (announcements as Record<string, unknown>[]).find((a) => String(a.id) === announcementId) ?? null;

  async function viewAttachment() {
    setViewing(true);
    try {
      const url = (await api.get(VIEW_ENDPOINTS[type](announcementId))).data;
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
        description={TAB_LABEL[type]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/student/announcements")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to announcements
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
              label={`${TAB_LABEL[type]} Announcement`}
              title={String(announcement.title ?? "")}
              meta={formatDate(announcement.created_at as string)}
              color={TAB_COLOR[type]}
            />

            <Section title="Message">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(announcement.content ?? "")}</p>
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

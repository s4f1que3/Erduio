"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useAnnouncementsLastSeen, useMarkAnnouncementsSeen } from "@/hooks/use-announcements-seen";
import { countNewerThan } from "@/hooks/use-last-seen";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Bell, Calendar, ChevronRight, Paperclip } from "lucide-react";
import { ColorStyle, colorPalette } from "@/lib/subject-style";

type AnnouncementType = "general" | "students" | "personal" | "class";

const TAB_COLOR: Record<AnnouncementType, ColorStyle> = {
  general: colorPalette[3], // blue
  students: colorPalette[2], // violet
  personal: colorPalette[4], // pink
  class: colorPalette[1], // teal
};

function hasAttachment(a: Record<string, unknown>) {
  return !!a.upload_url && a.upload_url !== "null";
}

function AnnouncementList({ data, loading, type }: { data: Record<string, unknown>[]; loading?: boolean; type: AnnouncementType }) {
  const color = TAB_COLOR[type];
  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>;
  if (!data.length) return <div className="text-center py-12 text-muted-foreground text-sm">No announcements</div>;
  return (
    <div className="space-y-3">
      {data.map((a) => (
        <Link
          key={String(a.id)}
          href={`/student/announcements/${type}/${String(a.id)}`}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${color.tintBg} ${color.tintBorder}`}
        >
          <div className={`rounded-lg p-2 flex-shrink-0 ${color.solid}`}><Bell className="h-4 w-4 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{String(a.title ?? "")}</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{String(a.content ?? "")}</p>
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
  );
}

type StudentProfile = { id: string; class: { id: string; name: string } | null };

export default function StudentAnnouncementsPage() {
  const session = getSession();
  const userId = session?.user.id ?? "";
  const [activeTab, setActiveTab] = useState("general");

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const classId = profile?.class?.id ?? "";

  const { data: general = [], isLoading: lg } = useQuery({ queryKey: ["student-ann-general"], queryFn: async () => (await api.get("/student/announcements/general")).data ?? [] });
  const { data: group = [], isLoading: lgroup } = useQuery({ queryKey: ["student-ann-group"], queryFn: async () => (await api.get("/student/announcements/students")).data ?? [] });
  const { data: personal = [], isLoading: lme } = useQuery({ queryKey: ["student-ann-me"], queryFn: async () => (await api.get("/student/announcements/to-me")).data ?? [] });
  const { data: classAnn = [], isLoading: lclass } = useQuery({
    queryKey: ["student-ann-class", classId],
    queryFn: async () => (await api.get(`/student/announcements/class/${classId}`)).data ?? [],
    enabled: !!classId,
  });

  const { data: lastSeenGeneral = 0 } = useAnnouncementsLastSeen(userId, "general");
  const { data: lastSeenGroup = 0 } = useAnnouncementsLastSeen(userId, "group");
  const { data: lastSeenPersonal = 0 } = useAnnouncementsLastSeen(userId, "personal");
  const { data: lastSeenClass = 0 } = useAnnouncementsLastSeen(userId, "class");
  const markGeneralSeen = useMarkAnnouncementsSeen(userId, "general");
  const markGroupSeen = useMarkAnnouncementsSeen(userId, "group");
  const markPersonalSeen = useMarkAnnouncementsSeen(userId, "personal");
  const markClassSeen = useMarkAnnouncementsSeen(userId, "class");

  const unreadGeneral = countNewerThan(general, lastSeenGeneral);
  const unreadGroup = countNewerThan(group, lastSeenGroup);
  const unreadPersonal = countNewerThan(personal, lastSeenPersonal);
  const unreadClass = countNewerThan(classAnn, lastSeenClass);

  useEffect(() => {
    if (activeTab === "general") markGeneralSeen(Date.now());
    else if (activeTab === "students") markGroupSeen(Date.now());
    else if (activeTab === "personal") markPersonalSeen(Date.now());
    else if (activeTab === "class") markClassSeen(Date.now());
  }, [activeTab, markGeneralSeen, markGroupSeen, markPersonalSeen, markClassSeen]);

  return (
    <>
      <Header title="Announcements" description="Your school and personal announcements" />
      <PageShell>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general" className="gap-1.5">General <NotificationBadge count={unreadGeneral} /></TabsTrigger>
            <TabsTrigger value="class" className="gap-1.5">Class <NotificationBadge count={unreadClass} /></TabsTrigger>
            <TabsTrigger value="students" className="gap-1.5">Students <NotificationBadge count={unreadGroup} /></TabsTrigger>
            <TabsTrigger value="personal" className="gap-1.5">Personal <NotificationBadge count={unreadPersonal} /></TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4"><AnnouncementList data={general} loading={lg} type="general" /></TabsContent>
          <TabsContent value="class" className="mt-4"><AnnouncementList data={classAnn} loading={lclass} type="class" /></TabsContent>
          <TabsContent value="students" className="mt-4"><AnnouncementList data={group} loading={lgroup} type="students" /></TabsContent>
          <TabsContent value="personal" className="mt-4"><AnnouncementList data={personal} loading={lme} type="personal" /></TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
}

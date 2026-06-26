"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useAnnouncementsLastSeen, useMarkAnnouncementsSeen } from "@/hooks/use-announcements-seen";
import { countNewerThan } from "@/hooks/use-last-seen";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Bell, Calendar } from "lucide-react";

function AnnouncementList({ data, loading }: { data: Record<string, unknown>[]; loading?: boolean }) {
  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>;
  if (!data.length) return <div className="text-center py-12 text-muted-foreground text-sm">No announcements</div>;
  return (
    <div className="space-y-3">
      {data.map((a) => (
        <div key={String(a.id)} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
          <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0"><Bell className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <p className="font-medium text-sm">{String(a.title ?? "")}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{String(a.content ?? "")}</p>
            <div className="flex items-center gap-1 mt-2"><Calendar className="h-3 w-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{formatDate(a.created_at as string)}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ParentAnnouncementsPage() {
  const session = getSession();
  const userId = session?.user.id ?? "";
  const [activeTab, setActiveTab] = useState("general");

  const { data: general = [], isLoading: lg } = useQuery({ queryKey: ["parent-ann-general"], queryFn: async () => (await api.get("/parent/announcements/general")).data ?? [] });
  const { data: group = [], isLoading: lgroup } = useQuery({ queryKey: ["parent-ann-group"], queryFn: async () => (await api.get("/parent/announcements/parents")).data ?? [] });
  const { data: personal = [], isLoading: lpersonal } = useQuery({ queryKey: ["parent-ann-personal"], queryFn: async () => (await api.get("/parent/announcements/personal")).data ?? [] });

  const { data: lastSeenGeneral = 0 } = useAnnouncementsLastSeen(userId, "general");
  const { data: lastSeenGroup = 0 } = useAnnouncementsLastSeen(userId, "parents_group");
  const { data: lastSeenPersonal = 0 } = useAnnouncementsLastSeen(userId, "personal");
  const markGeneralSeen = useMarkAnnouncementsSeen(userId, "general");
  const markGroupSeen = useMarkAnnouncementsSeen(userId, "parents_group");
  const markPersonalSeen = useMarkAnnouncementsSeen(userId, "personal");

  const unreadGeneral = countNewerThan(general, lastSeenGeneral);
  const unreadGroup = countNewerThan(group, lastSeenGroup);
  const unreadPersonal = countNewerThan(personal, lastSeenPersonal);

  useEffect(() => {
    if (activeTab === "general") markGeneralSeen(Date.now());
    else if (activeTab === "parents") markGroupSeen(Date.now());
    else if (activeTab === "personal") markPersonalSeen(Date.now());
  }, [activeTab, markGeneralSeen, markGroupSeen, markPersonalSeen]);

  return (
    <>
      <Header title="Announcements" description="School and parent group announcements" />
      <PageShell>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general" className="gap-1.5">General <NotificationBadge count={unreadGeneral} /></TabsTrigger>
            <TabsTrigger value="parents" className="gap-1.5">Parents Group <NotificationBadge count={unreadGroup} /></TabsTrigger>
            <TabsTrigger value="personal" className="gap-1.5">Personal <NotificationBadge count={unreadPersonal} /></TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4"><AnnouncementList data={general} loading={lg} /></TabsContent>
          <TabsContent value="parents" className="mt-4"><AnnouncementList data={group} loading={lgroup} /></TabsContent>
          <TabsContent value="personal" className="mt-4"><AnnouncementList data={personal} loading={lpersonal} /></TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
}

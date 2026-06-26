"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";
import { Bell, Award, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { colorPalette } from "@/lib/subject-style";

export default function ParentDashboard() {
  const { data: announcements = [] } = useQuery({ queryKey: ["parent-ann-general"], queryFn: async () => (await api.get("/parent/announcements/general")).data ?? [] });
  const { data: logs = [] } = useQuery({ queryKey: ["parent-logs"], queryFn: async () => (await api.get("/parent/logs/my-logs")).data ?? [] });

  return (
    <>
      <Header title="Parent Dashboard" description="Monitor your child&apos;s academic progress" />
      <PageShell>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Announcements" value={announcements.length} icon={Bell} iconClassName={colorPalette[4].bg} iconColor={colorPalette[4].text} />
          <StatCard label="Activity Logs" value={logs.length} icon={Calendar} iconClassName={colorPalette[1].bg} iconColor={colorPalette[1].text} />
          <StatCard label="My Child" value="View" icon={GraduationCap} description="Attendance & grades" iconClassName={colorPalette[2].bg} iconColor={colorPalette[2].text} />
          <StatCard label="Report Cards" value="View" icon={Award} iconClassName={colorPalette[5].bg} iconColor={colorPalette[5].text} />
        </div>

        <Section title="Quick Navigation">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/parent/child", icon: GraduationCap, label: "My Child", solid: "bg-violet-500" },
              { href: "/parent/announcements", icon: Bell, label: "Announcements", solid: "bg-pink-500" },
              { href: "/parent/logs", icon: Calendar, label: "Activity Logs", solid: "bg-teal-500" },
              { href: "/parent/profile", icon: Award, label: "My Profile", solid: "bg-amber-500" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`rounded-xl p-4 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${item.solid}`}>
                  <item.icon className="h-5 w-5 mb-3" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="Recent Announcements"
          actions={<Link href="/parent/announcements"><Button variant="outline" size="sm">View All</Button></Link>}
        >
          <div className="space-y-2">
            {(announcements as Record<string, unknown>[]).slice(0, 5).map((a) => (
              <div key={String(a.id)} className={`flex items-start gap-3 p-3 rounded-lg border ${colorPalette[4].tintBg} ${colorPalette[4].tintBorder}`}>
                <div className={`rounded-md p-1.5 flex-shrink-0 ${colorPalette[4].solid}`}><Bell className="h-3.5 w-3.5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{String(a.title ?? "")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{String(a.content ?? "")}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(a.created_at as string)}</span>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No announcements</p>}
          </div>
        </Section>
      </PageShell>
    </>
  );
}

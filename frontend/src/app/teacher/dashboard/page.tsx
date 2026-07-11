"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";
import { ClipboardList, BookOpen, Send, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const { data: assignments = [] } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: async () => (await api.get("/assignments/teacher/all")).data ?? [],
  });
  const { data: weekAssignments = [] } = useQuery({
    queryKey: ["teacher-assignments-week"],
    queryFn: async () => (await api.get("/assignments/teacher/all/current-week")).data ?? [],
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["teacher-notes"],
    queryFn: async () => (await api.get("/notes/all")).data ?? [],
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["teacher-logs"],
    queryFn: async () => (await api.get("/teacher/logs/all")).data ?? [],
  });

  return (
    <>
      <Header title="Teacher Dashboard" description="Your classes, assignments, and activity" />
      <PageShell>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Assignments" value={assignments.length} icon={ClipboardList} description={`${weekAssignments.length} this week`} />
          <StatCard label="Notes Uploaded" value={notes.length} icon={BookOpen} />
          <StatCard label="Activity Logs" value={logs.length} icon={FileText} />
        </div>

        <Section title="Quick Links">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/teacher/courses", icon: BookOpen, label: "My Courses" },
              { href: "/teacher/discipline", icon: AlertTriangle, label: "Discipline" },
              { href: "/teacher/emails", icon: Send, label: "Emails" },
              { href: "/teacher/file-vault", icon: FileText, label: "File Vault" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group">
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <p className="text-sm font-medium text-foreground group-hover:text-primary">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="This Week's Assignments"
          actions={<Link href="/teacher/courses"><Button variant="outline" size="sm">View All</Button></Link>}
        >
          <div className="space-y-2">
            {(weekAssignments as Record<string, unknown>[]).map((a) => (
              <div key={String(a.id)} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <ClipboardList className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{String(a.name ?? "")}</p>
                  <p className="text-xs text-muted-foreground">{String(a.description ?? "").slice(0, 60)}{String(a.description ?? "").length > 60 ? "..." : ""}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">Due {formatDate(a.due_date as string)}</span>
              </div>
            ))}
            {weekAssignments.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">No assignments this week</p>}
          </div>
        </Section>
      </PageShell>
    </>
  );
}

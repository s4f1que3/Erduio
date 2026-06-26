"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, BookOpen, UserCheck, Bell, FileText, ClipboardList, Calendar } from "lucide-react";
import { formatDate, statusBadgeVariant } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers"], queryFn: async () => (await api.get("/teacher")).data ?? [] });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: async () => (await api.get("/student")).data ?? [] });
  const { data: parents = [] } = useQuery({ queryKey: ["parents"], queryFn: async () => (await api.get("/parent/all-parents")).data ?? [] });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: async () => (await api.get("/classes")).data ?? [] });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements-general"], queryFn: async () => (await api.get("/announcements/general/all")).data ?? [] });
  const { data: logs = [] } = useQuery({ queryKey: ["admin-logs"], queryFn: async () => (await api.get("/admin/logs/all")).data ?? [] });
  const { data: assignments = [] } = useQuery({ queryKey: ["assignments-admin"], queryFn: async () => (await api.get("/assignments/admin/all")).data ?? [] });

  const activeTeachers = teachers.filter((t: Record<string, unknown>) => t.status === "active").length;
  const enrolledStudents = students.filter((s: Record<string, unknown>) => s.enrollment_status === "enrolled").length;

  return (
    <>
      <Header
        title="Admin Dashboard"
        description="School overview and quick actions"
        actions={
          <Link href="/admin/students">
            <Button size="sm">
              <GraduationCap className="h-4 w-4 mr-1.5" />
              Add Student
            </Button>
          </Link>
        }
      />
      <PageShell>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Teachers" value={teachers.length} icon={Users} description={`${activeTeachers} active`} />
          <StatCard label="Students" value={students.length} icon={GraduationCap} description={`${enrolledStudents} enrolled`} />
          <StatCard label="Parents" value={parents.length} icon={UserCheck} />
          <StatCard label="Classes" value={classes.length} icon={BookOpen} />
        </div>

        {/* Quick links */}
        <Section title="Quick Access">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/announcements", icon: Bell, label: "Announcements", count: announcements.length },
              { href: "/admin/assignments", icon: ClipboardList, label: "Assignments", count: assignments.length },
              { href: "/admin/attendance", icon: Calendar, label: "Attendance" },
              { href: "/admin/logs", icon: FileText, label: "Activity Logs", count: logs.length },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group">
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <p className="text-sm font-medium text-foreground group-hover:text-primary">{item.label}</p>
                  {item.count !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.count} total</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Recent logs */}
        <Section
          title="Recent Activity"
          actions={<Link href="/admin/logs"><Button variant="outline" size="sm">View All</Button></Link>}
        >
          <DataTable
            columns={[
              { key: "message", label: "Action" },
              { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
            ]}
            data={logs.slice(0, 8)}
          />
        </Section>

        {/* Recent announcements */}
        <Section
          title="Recent Announcements"
          actions={<Link href="/admin/announcements"><Button variant="outline" size="sm">View All</Button></Link>}
        >
          <div className="space-y-2">
            {announcements.slice(0, 5).map((a: Record<string, unknown>) => (
              <div key={String(a.id)} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                <Bell className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{String(a.title ?? "")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{String(a.content ?? "")}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(a.created_at as string)}</span>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No announcements yet</p>
            )}
          </div>
        </Section>
      </PageShell>
    </>
  );
}

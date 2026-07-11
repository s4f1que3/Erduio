"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { attendancePercentage } from "@/lib/utils";
import { ClipboardList, BookOpen, Award, Calendar } from "lucide-react";
import Link from "next/link";
import { colorPalette } from "@/lib/subject-style";

type StudentProfile = { id: string; class: { id: string; name: string } | null };
type AttendanceRecord = { present?: boolean | null };

export default function StudentDashboard() {
  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const classId = profile?.class?.id ?? "";
  const internalStudentId = profile?.id ?? "";

  const { data: reportCards = [] } = useQuery({
    queryKey: ["student-report-cards", internalStudentId],
    queryFn: async () => {
      if (!internalStudentId) return [];
      return (await api.get(`/report-cards/${internalStudentId}/all`)).data ?? [];
    },
    enabled: !!internalStudentId,
  });

  const { data: classAvg } = useQuery({
    queryKey: ["attendance-class-avg", classId, internalStudentId],
    queryFn: async () => {
      if (!internalStudentId || !classId) return null;
      return (await api.get(`/attendance/average/class/${classId}/${internalStudentId}/`)).data;
    },
    enabled: !!internalStudentId && !!classId,
  });
  const classAvgNum = attendancePercentage(Array.isArray(classAvg) ? (classAvg as AttendanceRecord[]) : []);

  return (
    <>
      <Header title="My Dashboard" description="Your academic overview" />
      <PageShell>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Report Cards" value={reportCards.length} icon={Award} iconClassName={colorPalette[5].bg} iconColor={colorPalette[5].text} />
          <StatCard
            label="Class Attendance"
            value={classAvg ? `${classAvgNum}%` : "—"}
            icon={Calendar}
            iconClassName={colorPalette[1].bg}
            iconColor={colorPalette[1].text}
          />
          <StatCard label="Quick Access" value="→" icon={ClipboardList} description="View assignments" iconClassName={colorPalette[2].bg} iconColor={colorPalette[2].text} />
        </div>

        <Section title="Quick Navigation">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/student/courses", icon: BookOpen, label: "My Courses", solid: "bg-orange-500" },
              { href: "/student/grades", icon: Award, label: "My Grades", solid: "bg-indigo-500" },
              { href: "/student/attendance", icon: Calendar, label: "Attendance", solid: "bg-emerald-500" },
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
      </PageShell>
    </>
  );
}

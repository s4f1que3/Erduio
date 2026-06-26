"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { attendancePercentage } from "@/lib/utils";
import { Calendar, BookOpen } from "lucide-react";
import { colorByIndex, colorPalette } from "@/lib/subject-style";

type StudentProfile = {
  id: string;
  class: { id: string; name: string } | null;
};
type AttendanceRecord = { present?: boolean | null };
type SubjectAverage = { subject_id: string; subject_name: string; average: number };

export default function StudentAttendancePage() {
  const session = getSession();
  const authStudentId = session?.user.id ?? "";

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
    enabled: !!authStudentId,
  });
  const classId = profile?.class?.id ?? "";
  const studentId = profile?.id ?? "";

  const { data: classAvg } = useQuery({
    queryKey: ["attendance-class-avg", classId, studentId],
    queryFn: async () => (await api.get(`/attendance/average/class/${classId}/${studentId}/`)).data,
    enabled: !!studentId && !!classId,
  });

  const { data: subjectAvg } = useQuery({
    queryKey: ["attendance-subject-avg", studentId],
    queryFn: async () => (await api.get(`/attendance/average/subject/${studentId}`)).data,
    enabled: !!studentId,
  });

  const classAvgNum = attendancePercentage(Array.isArray(classAvg) ? (classAvg as AttendanceRecord[]) : []);
  const subjectData = Array.isArray(subjectAvg) ? (subjectAvg as SubjectAverage[]) : [];

  return (
    <>
      <Header title="My Attendance" description="Track your class and subject attendance" />
      <PageShell>
        <Section title="Overall Averages">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Class Attendance"
              value={`${classAvgNum}%`}
              icon={Calendar}
              description="Average across all class sessions"
              iconClassName={classAvgNum >= 75 ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-red-100 dark:bg-red-500/15"}
              iconColor={classAvgNum >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
            />
            <StatCard
              label="Subject Sessions"
              value={`${subjectData.length} subjects`}
              icon={BookOpen}
              iconClassName={colorPalette[2].bg}
              iconColor={colorPalette[2].text}
            />
          </div>
        </Section>

        {subjectData.length > 0 && (
          <Section title="Subject Attendance Breakdown">
            <div className="space-y-3">
              {subjectData.map((s, i) => {
                const avg = s.average;
                const color = colorByIndex(i);
                return (
                  <div key={s.subject_id} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm ${color.tintBg} ${color.tintBorder}`}>
                    <div className={`rounded-full p-2 flex-shrink-0 ${color.solid}`}><BookOpen className="h-4 w-4 text-white" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.subject_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${color.solid}`}
                          style={{ width: `${Math.min(avg, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-10 text-right">{Math.round(avg)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </PageShell>
    </>
  );
}

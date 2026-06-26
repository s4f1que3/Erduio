"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { newestTimestamp, useMarkSeen } from "@/hooks/use-last-seen";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { colorByIndex, gradeBadgeClass } from "@/lib/subject-style";

type StudentProfile = { id: string; subjects: { id: string; name: string | null }[] };
type ExamInfo = { name: string; subject: string };

export default function StudentGradesPage() {
  const session = getSession();
  const studentId = session?.user.id ?? "";
  const [examSearch, setExamSearch] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const internalStudentId = profile?.id ?? "";
  const subjects = profile?.subjects ?? [];

  const { data: examGrades = [], isLoading: examGradesLoading } = useQuery({
    queryKey: ["student-exam-grades", internalStudentId],
    queryFn: async () => { const d = (await api.get(`/exam/${internalStudentId}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: !!internalStudentId,
  });

  const markGradesSeen = useMarkSeen("grades", studentId, "self");
  useEffect(() => {
    if (examGrades.length > 0) markGradesSeen(newestTimestamp(examGrades));
  }, [examGrades, markGradesSeen]);

  const { data: examInfoMap } = useQuery({
    queryKey: ["student-exam-info-map", subjects.map((s) => s.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        subjects.map(async (s) => {
          try {
            const d = (await api.get(`/exams/${s.id}/all`)).data;
            return Array.isArray(d)
              ? d.map((e: Record<string, unknown>) => [String(e.id), { name: String(e.name ?? "Exam"), subject: s.name ?? "" }] as const)
              : [];
          } catch {
            return [];
          }
        })
      );
      return new Map<string, ExamInfo>(results.flat());
    },
    enabled: subjects.length > 0,
  });

  const filteredExamGrades = (examGrades as Record<string, unknown>[]).filter((g) => {
    if (!examSearch.trim()) return true;
    const name = examInfoMap?.get(String(g.exam_id))?.name ?? "";
    return name.toLowerCase().includes(examSearch.trim().toLowerCase());
  });

  return (
    <>
      <Header title="My Grades" description="View your assignment grades and feedback" />
      <PageShell>
        <Section title="Exam Grades">
          <InputGroup className="max-w-sm mb-4">
            <InputGroupAddon><Search className="h-4 w-4" /></InputGroupAddon>
            <InputGroupInput placeholder="Search exams by name..." value={examSearch} onChange={(e) => setExamSearch(e.target.value)} />
          </InputGroup>

          {examGradesLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : filteredExamGrades.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <FileCheck className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">{examSearch ? "No exams match your search" : "No exam grades yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExamGrades.map((g, i) => {
                const info = examInfoMap?.get(String(g.exam_id));
                const color = colorByIndex(i);
                const gradeValue = Number(g.grade);
                return (
                  <div key={String(g.id)} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm ${color.tintBg} ${color.tintBorder}`}>
                    <div className={`rounded-lg p-2 flex-shrink-0 ${color.solid}`}><FileCheck className="h-4 w-4 text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{info?.name ?? "Exam"}</p>
                      {info?.subject && <p className="text-xs text-muted-foreground">{info.subject}</p>}
                      {!!g.message && <p className="text-xs text-muted-foreground mt-0.5">{String(g.message)}</p>}
                    </div>
                    <Badge className={Number.isFinite(gradeValue) ? gradeBadgeClass(gradeValue) : undefined}>{String(g.grade)}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </PageShell>
    </>
  );
}

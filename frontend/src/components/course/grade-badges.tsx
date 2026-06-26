"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { gradeBadgeClass } from "@/lib/subject-style";

export function ExamGradeBadge({ examId, studentId }: { examId: string; studentId: string }) {
  const { data: grade } = useQuery({
    queryKey: ["exam-grade", examId, studentId],
    queryFn: async () => {
      try {
        const d = (await api.get(`/exam/${examId}/${studentId}/grade`)).data;
        return d && typeof d === "object" ? (d as Record<string, unknown>) : null;
      } catch {
        return null;
      }
    },
    enabled: !!examId && !!studentId,
  });

  if (!grade) return <span className="text-muted-foreground text-sm">No grade yet</span>;
  const value = Number(grade.grade);
  return <Badge className={Number.isFinite(value) ? gradeBadgeClass(value) : undefined}>{String(grade.grade)}</Badge>;
}

export function AssignmentGradeCell({ assignmentId, studentId }: { assignmentId: string; studentId: string }) {
  const { data: grade } = useQuery({
    queryKey: ["assignment-grade", assignmentId, studentId],
    queryFn: async () => {
      try {
        const res = await api.get(`/assignments/${assignmentId}/my-grade/${studentId}`);
        const raw = res.data;
        const value = typeof raw === "object" && raw !== null ? Number((raw as Record<string, unknown>).grade) : Number(raw);
        return Number.isFinite(value) ? value : null;
      } catch {
        return null;
      }
    },
    enabled: !!assignmentId && !!studentId,
    retry: false,
  });

  if (grade === null || grade === undefined) return <span className="text-muted-foreground text-sm">No grade yet</span>;
  return <Badge className={gradeBadgeClass(grade)}>{grade}/100</Badge>;
}

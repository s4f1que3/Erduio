"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserCheck, FileText } from "lucide-react";
import { colorByIndex, colorPalette } from "@/lib/subject-style";

type StudentProfile = { class: { id: string; name: string } | null };
type ClassInfo = { id: string; name: string; class_teacher_name: string | null; has_timetable: boolean };
type RosterStudent = { id: string; name: string };

export default function StudentClassPage() {
  const [viewingTimetable, setViewingTimetable] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });
  const classId = profile?.class?.id ?? "";

  const { data: info, isLoading: infoLoading } = useQuery({
    queryKey: ["class-info", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/info`)).data as ClassInfo,
    enabled: !!classId,
  });

  const { data: classmates = [], isLoading: classmatesLoading } = useQuery({
    queryKey: ["class-roster", classId],
    queryFn: async () => {
      const data = (await api.get(`/classes/${classId}/students`)).data;
      return Array.isArray(data) ? (data as RosterStudent[]) : [];
    },
    enabled: !!classId,
  });

  async function viewTimetable() {
    setViewingTimetable(true);
    try {
      const url = (await api.get(`/classes/${classId}/view/timetable`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingTimetable(false);
    }
  }

  return (
    <>
      <Header title="My Class" description={info?.name ?? "Your class details"} />
      <PageShell>
        <Section title="Class Teacher">
          {infoLoading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          ) : !classId ? (
            <p className="text-sm text-muted-foreground">You aren&apos;t assigned to a class yet.</p>
          ) : (
            <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${colorPalette[2].tintBg} ${colorPalette[2].tintBorder}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2.5 ${colorPalette[2].solid}`}><UserCheck className="h-5 w-5 text-white" /></div>
                <div>
                  <p className="font-medium text-sm">{info?.class_teacher_name ?? "Not assigned"}</p>
                  <p className="text-xs text-muted-foreground">Class teacher for {info?.name}</p>
                </div>
              </div>
              {info?.has_timetable && (
                <Button variant="outline" size="sm" onClick={viewTimetable} disabled={viewingTimetable}>
                  {viewingTimetable ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
                  View Timetable
                </Button>
              )}
            </div>
          )}
        </Section>

        {classId && (
          <Section title="Classmates">
            {classmatesLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            ) : classmates.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No classmates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classmates.map((s, i) => {
                  const color = colorByIndex(i);
                  return (
                    <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm ${color.tintBg} ${color.tintBorder}`}>
                      <div className={`rounded-full p-2 ${color.solid}`}><Users className="h-4 w-4 text-white" /></div>
                      <p className="text-sm font-medium truncate">{s.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        )}
      </PageShell>
    </>
  );
}

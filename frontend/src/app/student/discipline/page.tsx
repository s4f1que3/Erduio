"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { newestTimestamp, useMarkSeen } from "@/hooks/use-last-seen";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Calendar } from "lucide-react";

export default function StudentDisciplinePage() {
  const [authId, setAuthId] = useState("");
  useEffect(() => { setAuthId(getSession()?.user.id ?? ""); }, []);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as { id: string },
    enabled: !!authId,
  });
  const studentId = profile?.id ?? "";

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["student-discipline", studentId],
    queryFn: async () => (await api.get(`/discipline/all/${studentId}`)).data ?? [],
    enabled: !!studentId,
  });

  const markSeen = useMarkSeen("discipline", authId, "self");
  useEffect(() => {
    if (records.length > 0) markSeen(newestTimestamp(records, "date"));
  }, [records, markSeen]);

  return (
    <>
      <Header title="Discipline Log" description="Your discipline record history" />
      <PageShell>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : (records as Record<string, unknown>[]).length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No discipline records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(records as Record<string, unknown>[]).map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border shadow-sm bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20">
                <div className="rounded-lg p-2 flex-shrink-0 bg-orange-500">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{String(r.action ?? "")}</p>
                  {!!r.message && <p className="text-sm text-muted-foreground mt-0.5">{String(r.message)}</p>}
                  {!!r.date && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(r.date as string)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}

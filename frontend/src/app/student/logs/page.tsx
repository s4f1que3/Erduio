"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { formatDate } from "@/lib/utils";
import { Activity, Calendar } from "lucide-react";
import { colorByIndex } from "@/lib/subject-style";

export default function StudentLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["student-logs"],
    queryFn: async () => (await api.get("/student/logs/my-logs")).data ?? [],
  });

  return (
    <>
      <Header title="Activity Logs" description="Your personal activity history" />
      <PageShell>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : (logs as Record<string, unknown>[]).length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Activity className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(logs as Record<string, unknown>[]).map((r, i) => {
              const color = colorByIndex(i);
              return (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${color.tintBg} ${color.tintBorder}`}>
                  <div className={`rounded-lg p-2 flex-shrink-0 ${color.solid}`}>
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{String(r.message ?? "")}</p>
                    {!!r.date && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(r.date as string)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
}

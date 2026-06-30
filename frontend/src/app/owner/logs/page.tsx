"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function OwnerLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["owner-logs"],
    queryFn: async () => (await api.get("/owner/logs")).data ?? [],
  });

  return (
    <>
      <Header title="Activity Logs" description="Track all owner actions" />
      <PageShell>
        <DataTable
          loading={isLoading}
          columns={[
            {
              key: "message",
              label: "Activity",
              render: (r: Record<string, unknown>) => (
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span>{String(r.message ?? "")}</span>
                </div>
              ),
            },
            { key: "created_at", label: "Date", render: (r: Record<string, unknown>) => formatDate(r.created_at as string) },
          ]}
          data={logs}
        />
      </PageShell>
    </>
  );
}

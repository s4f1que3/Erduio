"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

export default function TeacherLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["teacher-logs"],
    queryFn: async () => (await api.get("/teacher/logs/all")).data ?? [],
  });

  return (
    <>
      <Header title="Activity Logs" description="Your personal activity history" />
      <PageShell>
        <DataTable
          loading={isLoading}
          columns={[
            { key: "message", label: "Activity" },
            { key: "created_at", label: "Date", render: (r) => formatDate(r.created_at as string) },
          ]}
          data={logs}
        />
      </PageShell>
    </>
  );
}

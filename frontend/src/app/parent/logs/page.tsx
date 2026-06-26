"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

export default function ParentLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["parent-logs"],
    queryFn: async () => (await api.get("/parent/logs/my-logs")).data ?? [],
  });

  return (
    <>
      <Header title="Activity Logs" description="Your account activity history" />
      <PageShell>
        <DataTable
          loading={isLoading}
          columns={[
            { key: "message", label: "Activity" },
            { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          ]}
          data={logs}
        />
      </PageShell>
    </>
  );
}

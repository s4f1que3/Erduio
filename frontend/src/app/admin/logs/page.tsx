"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function LogsPage() {
  const { data: allLogs = [], isLoading: loadingAll } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => (await api.get("/admin/logs/all")).data ?? [],
  });

  const { data: myLogs = [], isLoading: loadingMy } = useQuery({
    queryKey: ["admin-my-logs"],
    queryFn: async () => (await api.get("/admin/logs/my-logs")).data ?? [],
  });

  const cols = [
    { key: "message", label: "Activity", render: (r: Record<string, unknown>) => (
      <div className="flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span>{String(r.message ?? "")}</span>
      </div>
    )},
    { key: "created_at", label: "Date", render: (r: Record<string, unknown>) => formatDate(r.created_at as string) },
  ];

  return (
    <>
      <Header title="Activity Logs" description="Track all admin actions and system events" />
      <PageShell>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="mine">My Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <DataTable loading={loadingAll} columns={cols} data={allLogs} />
          </TabsContent>
          <TabsContent value="mine" className="mt-4">
            <DataTable loading={loadingMy} columns={cols} data={myLogs} />
          </TabsContent>
        </Tabs>
      </PageShell>
    </>
  );
}

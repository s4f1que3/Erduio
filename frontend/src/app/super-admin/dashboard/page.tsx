"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, UserCheck } from "lucide-react";
import { formatDate as fmtDate, statusBadgeVariant } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuperAdminDashboard() {
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await api.get("/admin/all-admins");
      return res.data ?? [];
    },
  });

  const active = admins.filter((a: Record<string, unknown>) => a.status === "active").length;
  const inactive = admins.filter((a: Record<string, unknown>) => a.status !== "active").length;

  return (
    <>
      <Header
        title="Super Admin Dashboard"
        description="School-wide overview and admin management"
        actions={
          <Link href="/super-admin/admins">
            <Button size="sm">Manage Admins</Button>
          </Link>
        }
      />
      <PageShell>
        <Section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Admins" value={admins.length} icon={ShieldCheck} description={`${active} active`} />
            <StatCard label="Active" value={active} icon={UserCheck} iconClassName="bg-green-100 dark:bg-green-900/30" />
            <StatCard label="Inactive" value={inactive} icon={Users} iconClassName="bg-orange-100 dark:bg-orange-900/30" />
          </div>
        </Section>

        <Section
          title="All Admins"
          actions={
            <Link href="/super-admin/admins">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          }
        >
          <DataTable
            loading={isLoading}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone_number", label: "Phone" },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <Badge variant={statusBadgeVariant(row.status as string)}>
                    {String(row.status ?? "—")}
                  </Badge>
                ),
              },
              {
                key: "created_at",
                label: "Joined",
                render: (row) => fmtDate(row.created_at as string),
              },
            ]}
            data={admins.slice(0, 10)}
          />
        </Section>
      </PageShell>
    </>
  );
}

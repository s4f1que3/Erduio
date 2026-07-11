"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Award, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { colorPalette } from "@/lib/subject-style";

export default function ParentDashboard() {
  const { data: logs = [] } = useQuery({ queryKey: ["parent-logs"], queryFn: async () => (await api.get("/parent/logs/my-logs")).data ?? [] });

  return (
    <>
      <Header title="Parent Dashboard" description="Monitor your child&apos;s academic progress" />
      <PageShell>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Activity Logs" value={logs.length} icon={Calendar} iconClassName={colorPalette[1].bg} iconColor={colorPalette[1].text} />
          <StatCard label="My Child" value="View" icon={GraduationCap} description="Attendance & grades" iconClassName={colorPalette[2].bg} iconColor={colorPalette[2].text} />
          <StatCard label="Report Cards" value="View" icon={Award} iconClassName={colorPalette[5].bg} iconColor={colorPalette[5].text} />
        </div>

        <Section title="Quick Navigation">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/parent/child", icon: GraduationCap, label: "My Child", solid: "bg-violet-500" },
              { href: "/parent/logs", icon: Calendar, label: "Activity Logs", solid: "bg-teal-500" },
              { href: "/parent/profile", icon: Award, label: "My Profile", solid: "bg-amber-500" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`rounded-xl p-4 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${item.solid}`}>
                  <item.icon className="h-5 w-5 mb-3" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </PageShell>
    </>
  );
}

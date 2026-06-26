"use client";

import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { SchoolInfoCard } from "@/components/profile/school-info-card";

export function SchoolPageContent() {
  return (
    <>
      <Header title="School" description="Information about your school" />
      <PageShell>
        <div className="max-w-2xl">
          <SchoolInfoCard />
        </div>
      </PageShell>
    </>
  );
}

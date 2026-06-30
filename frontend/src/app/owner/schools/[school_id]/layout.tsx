"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setSchoolIdOverride } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type SchoolRow = Record<string, unknown>;

const tabs = [
  { label: "Info", href: "" },
  { label: "Super Admins", href: "/super-admins" },
  { label: "Students", href: "/students" },
  { label: "Teachers", href: "/teachers" },
  { label: "Parents", href: "/parents" },
  { label: "Classes", href: "/classes" },
  { label: "Announcements", href: "/announcements" },
  { label: "Assignments", href: "/assignments" },
  { label: "Exams", href: "/exams" },
  { label: "Attendance", href: "/attendance" },
  { label: "Report Cards", href: "/report-cards" },
  { label: "Discipline", href: "/discipline" },
  { label: "Terms", href: "/terms" },
  { label: "File Vault", href: "/file-vault" },
];

export default function OwnerSchoolLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ school_id: string }>();
  const schoolId = params.school_id;
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();

  // Set synchronously during render so it's in place before any child query fires.
  setSchoolIdOverride(schoolId);

  // The admin pages we reuse here use fixed query keys (e.g. ["teachers"]) since a real
  // admin only ever sees one school. Switching schools must wipe that cache, or a tab can
  // briefly serve rows from the previously viewed school under the new school's context.
  const [renderedSchoolId, setRenderedSchoolId] = useState(schoolId);
  if (schoolId !== renderedSchoolId) {
    qc.clear();
    setRenderedSchoolId(schoolId);
  }

  useEffect(() => {
    return () => setSchoolIdOverride(null);
  }, []);

  const { data: schools = [] } = useQuery({
    queryKey: ["owner-schools"],
    queryFn: async () => (await api.get("/owner/schools")).data as SchoolRow[],
  });
  const school = schools.find((s) => String(s.id) === schoolId);

  const base = `/owner/schools/${schoolId}`;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-4 sm:px-6">
        <div className="flex items-center gap-3 py-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/owner/schools")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Schools
          </Button>
          <span className="font-semibold text-sm truncate">{String(school?.name ?? "")}</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px">
          {tabs.map((tab) => {
            const href = `${base}${tab.href}`;
            const active = pathname === href;
            return (
              <Link
                key={tab.href}
                href={href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}

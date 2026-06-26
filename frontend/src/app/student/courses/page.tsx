"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { BookOpen, ChevronRight } from "lucide-react";
import { colorByIndex, subjectIcon } from "@/lib/subject-style";

type StudentProfile = {
  class: { id: string; name: string } | null;
  subjects: { id: string; name: string | null }[];
};

export default function StudentCoursesPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as StudentProfile,
  });

  const subjects = profile?.subjects ?? [];

  return (
    <>
      <Header title="My Courses" description={profile?.class ? `${profile.class.name} — select a course to view its notes, assignments and grades` : "Select a course to view its notes, assignments and grades"} />
      <PageShell>
        <Section>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No courses enrolled yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject, i) => {
                const color = colorByIndex(i);
                const Icon = subjectIcon(subject.name);
                return (
                  <Link key={subject.id} href={`/student/courses/${subject.id}`}>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${color.bg}`}>
                        <Icon className={`h-6 w-6 ${color.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{subject.name ?? "Untitled course"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Notes, assignments & grades</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </PageShell>
    </>
  );
}

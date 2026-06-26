"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { BookOpen, ChevronRight, Users } from "lucide-react";

type TeacherProfile = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string | null; class_id: string; class_name: string | null }[];
};

export default function TeacherCoursesPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["teacher-me-profile"],
    queryFn: async () => (await api.get("/teacher/me/profile")).data as TeacherProfile,
  });

  const classes = profile?.classes ?? [];
  const subjects = profile?.subjects ?? [];

  return (
    <>
      <Header title="My Courses" description="Select a course to manage its assignments, notes, attendance and grades" />
      <PageShell>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : (
          <>
            {classes.length > 0 && (
              <Section title="My Homeroom Classes" description="Class-wide attendance, roster and announcements">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((c) => (
                    <Link key={c.id} href={`/teacher/classes/${c.id}`}>
                      <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground group-hover:text-primary truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Roster, attendance & announcements</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            <Section title="My Subjects" description="Assignments, notes, attendance and grades per subject">
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No subjects assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/teacher/courses/${subject.id}`}>
                      <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-accent/50 transition-all cursor-pointer group flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground group-hover:text-primary truncate">{subject.name ?? "Untitled course"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{subject.class_name ?? "—"}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </PageShell>
    </>
  );
}

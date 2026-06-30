"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { clearSession, getSession } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { useAnnouncementsLastSeen } from "@/hooks/use-announcements-seen";
import { countNewerThan, useLastSeen } from "@/hooks/use-last-seen";
import { NotificationBadge } from "@/components/ui/notification-badge";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  FolderOpen,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  School,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useSidebarMobile } from "./sidebar-context";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navByRole: Record<string, NavItem[]> = {
  owner: [
    { label: "Schools", href: "/owner/schools", icon: School },
    { label: "Logs", href: "/owner/logs", icon: FileText },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "Admin Management", href: "/super-admin/admins", icon: ShieldCheck },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Parents", href: "/admin/parents", icon: UserCheck },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Announcements", href: "/admin/announcements", icon: Bell },
    { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
    { label: "Exams", href: "/admin/exams", icon: FileCheck },
    { label: "Attendance", href: "/admin/attendance", icon: Calendar },
    { label: "Report Cards", href: "/admin/report-cards", icon: Award },
    { label: "Discipline", href: "/admin/discipline", icon: AlertTriangle },
    { label: "Terms", href: "/admin/terms", icon: Calendar },
    { label: "File Vault", href: "/admin/file-vault", icon: FolderOpen },
    { label: "Logs", href: "/admin/logs", icon: FileText },
    { label: "School", href: "/admin/school", icon: School },
    { label: "My Profile", href: "/super-admin/profile", icon: UserCheck },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Parents", href: "/admin/parents", icon: UserCheck },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Announcements", href: "/admin/announcements", icon: Bell },
    { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
    { label: "Exams", href: "/admin/exams", icon: FileCheck },
    { label: "Attendance", href: "/admin/attendance", icon: Calendar },
    { label: "Report Cards", href: "/admin/report-cards", icon: Award },
    { label: "Discipline", href: "/admin/discipline", icon: AlertTriangle },
    { label: "Terms", href: "/admin/terms", icon: Calendar },
    { label: "File Vault", href: "/admin/file-vault", icon: FolderOpen },
    { label: "Logs", href: "/admin/logs", icon: FileText },
    { label: "School", href: "/admin/school", icon: School },
    { label: "My Profile", href: "/admin/profile", icon: UserCheck },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/teacher/courses", icon: BookOpen },
    { label: "Discipline", href: "/teacher/discipline", icon: AlertTriangle },
    { label: "Announcements", href: "/teacher/announcements", icon: Bell },
    { label: "File Vault", href: "/teacher/file-vault", icon: FolderOpen },
    { label: "Logs", href: "/teacher/logs", icon: FileText },
    { label: "School", href: "/teacher/school", icon: School },
    { label: "My Profile", href: "/teacher/profile", icon: UserCheck },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Class", href: "/student/class", icon: Users },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
    { label: "Attendance", href: "/student/attendance", icon: Calendar },
    { label: "Grades", href: "/student/grades", icon: BarChart3 },
    { label: "Announcements", href: "/student/announcements", icon: Bell },
    { label: "Report Cards", href: "/student/report-cards", icon: Award },
    { label: "Discipline Log", href: "/student/discipline", icon: AlertTriangle },
    { label: "Logs", href: "/student/logs", icon: FileText },
    { label: "School", href: "/student/school", icon: School },
    { label: "My Profile", href: "/student/profile", icon: UserCheck },
  ],
  parent: [
    { label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
    { label: "My Child", href: "/parent/child", icon: GraduationCap },
    { label: "Announcements", href: "/parent/announcements", icon: Bell },
    { label: "Logs", href: "/parent/logs", icon: FileText },
    { label: "School", href: "/parent/school", icon: School },
    { label: "My Profile", href: "/parent/profile", icon: UserCheck },
  ],
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  super_admin: "Super Admin",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { open: mobileOpen, setOpen: setMobileOpen } = useSidebarMobile();

  useEffect(() => { setMounted(true) }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  const session = mounted ? getSession() : null;
  const role = session?.user.role ?? "admin";
  const navItems = navByRole[role] ?? [];
  const userId = session?.user.id ?? "";
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isParent = role === "parent";

  // ---- Announcements (student) ----
  const { data: general = [] } = useQuery({
    queryKey: ["student-ann-general"],
    queryFn: async () => (await api.get("/student/announcements/general")).data ?? [],
    enabled: isStudent,
  });
  const { data: group = [] } = useQuery({
    queryKey: ["student-ann-group"],
    queryFn: async () => (await api.get("/student/announcements/students")).data ?? [],
    enabled: isStudent,
  });
  const { data: personal = [] } = useQuery({
    queryKey: ["student-ann-me"],
    queryFn: async () => (await api.get("/student/announcements/to-me")).data ?? [],
    enabled: isStudent,
  });
  const { data: lastSeenGeneral = 0 } = useAnnouncementsLastSeen(userId, "general");
  const { data: lastSeenGroup = 0 } = useAnnouncementsLastSeen(userId, "group");
  const { data: lastSeenPersonal = 0 } = useAnnouncementsLastSeen(userId, "personal");

  const unreadAnnouncementsStudent =
    countNewerThan(general, lastSeenGeneral) +
    countNewerThan(group, lastSeenGroup) +
    countNewerThan(personal, lastSeenPersonal);

  // ---- Announcements (teacher) ----
  const { data: teacherGeneral = [] } = useQuery({
    queryKey: ["teacher-ann-general"],
    queryFn: async () => { const d = (await api.get("/teacher/announcements/general")).data; return Array.isArray(d) ? d : []; },
    enabled: isTeacher,
  });
  const { data: teacherGroup = [] } = useQuery({
    queryKey: ["teacher-ann-group"],
    queryFn: async () => { const d = (await api.get("/teacher/announcements/teachers")).data; return Array.isArray(d) ? d : []; },
    enabled: isTeacher,
  });
  const { data: lastSeenTeacherGroup = 0 } = useAnnouncementsLastSeen(userId, "teachers_group");

  const unreadAnnouncementsTeacher =
    countNewerThan(teacherGeneral, lastSeenGeneral) +
    countNewerThan(teacherGroup, lastSeenTeacherGroup);

  // ---- Announcements (parent) ----
  const { data: parentGeneral = [] } = useQuery({
    queryKey: ["parent-ann-general"],
    queryFn: async () => (await api.get("/parent/announcements/general")).data ?? [],
    enabled: isParent,
  });
  const { data: parentGroup = [] } = useQuery({
    queryKey: ["parent-ann-group"],
    queryFn: async () => (await api.get("/parent/announcements/parents")).data ?? [],
    enabled: isParent,
  });
  const { data: lastSeenParentGroup = 0 } = useAnnouncementsLastSeen(userId, "parents_group");

  const unreadAnnouncementsParent =
    countNewerThan(parentGeneral, lastSeenGeneral) +
    countNewerThan(parentGroup, lastSeenParentGroup);

  const unreadAnnouncements = isStudent
    ? unreadAnnouncementsStudent
    : isTeacher
    ? unreadAnnouncementsTeacher
    : isParent
    ? unreadAnnouncementsParent
    : 0;

  // ---- Report Cards / Discipline / Grades (student) ----
  const { data: studentProfile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as { id: string },
    enabled: isStudent,
  });
  const { data: studentReportCards = [] } = useQuery({
    queryKey: ["student-report-cards", studentProfile?.id ?? ""],
    queryFn: async () => (await api.get(`/report-cards/${studentProfile?.id}/all`)).data ?? [],
    enabled: isStudent && !!studentProfile?.id,
  });
  const { data: studentDiscipline = [] } = useQuery({
    queryKey: ["student-discipline", studentProfile?.id ?? ""],
    queryFn: async () => (await api.get(`/discipline/all/${studentProfile?.id}`)).data ?? [],
    enabled: isStudent && !!studentProfile?.id,
  });
  const { data: studentExamGrades = [] } = useQuery({
    queryKey: ["student-exam-grades", studentProfile?.id ?? ""],
    queryFn: async () => { const d = (await api.get(`/exam/${studentProfile?.id}/all`)).data; return Array.isArray(d) ? d : []; },
    enabled: isStudent && !!studentProfile?.id,
  });

  const { data: lastSeenReportCards = 0 } = useLastSeen("report-cards", userId, "self");
  const { data: lastSeenDiscipline = 0 } = useLastSeen("discipline", userId, "self");
  const { data: lastSeenGrades = 0 } = useLastSeen("grades", userId, "self");

  const unreadReportCards = isStudent ? countNewerThan(studentReportCards, lastSeenReportCards) : 0;
  const unreadDiscipline = isStudent ? countNewerThan(studentDiscipline, lastSeenDiscipline, "date") : 0;
  const unreadGrades = isStudent ? countNewerThan(studentExamGrades, lastSeenGrades) : 0;

  // ---- My Child aggregate (parent) ----
  type Child = { id: string };
  const { data: kids = [] } = useQuery({
    queryKey: ["parent-my-kids"],
    queryFn: async () => (await api.get("/parent/my-kids")).data as Child[],
    enabled: isParent,
  });

  const kidReportCards = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-report-cards", k.id],
      queryFn: async () => (await api.get(`/report-cards/${k.id}/all`)).data ?? [],
      enabled: isParent,
    })),
  });
  const kidDiscipline = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-discipline", k.id],
      queryFn: async () => (await api.get(`/discipline/all/${k.id}`)).data ?? [],
      enabled: isParent,
    })),
  });
  const kidGrades = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-grades", k.id],
      queryFn: async () => (await api.get(`/assignments/all/grades/${k.id}`)).data ?? [],
      enabled: isParent,
    })),
  });
  const kidExamGrades = useQueries({
    queries: kids.map((k) => ({
      queryKey: ["parent-exam-grades", k.id],
      queryFn: async () => { const d = (await api.get(`/exam/${k.id}/all`)).data; return Array.isArray(d) ? d : []; },
      enabled: isParent,
    })),
  });

  const { data: lastSeenChildReportCards = 0 } = useLastSeen("report-cards", userId, "children");
  const { data: lastSeenChildDiscipline = 0 } = useLastSeen("discipline", userId, "children");
  const { data: lastSeenChildGrades = 0 } = useLastSeen("grades", userId, "children");
  const { data: lastSeenChildExamGrades = 0 } = useLastSeen("exam-grades", userId, "children");

  const unreadMyChild = isParent
    ? kidReportCards.reduce((sum, q) => sum + countNewerThan(q.data ?? [], lastSeenChildReportCards), 0) +
      kidDiscipline.reduce((sum, q) => sum + countNewerThan(q.data ?? [], lastSeenChildDiscipline, "date"), 0) +
      kidGrades.reduce((sum, q) => sum + countNewerThan(q.data ?? [], lastSeenChildGrades), 0) +
      kidExamGrades.reduce((sum, q) => sum + countNewerThan(q.data ?? [], lastSeenChildExamGrades), 0)
    : 0;

  const navBadgeCounts: Record<string, number> = {
    Announcements: unreadAnnouncements,
    "Report Cards": unreadReportCards,
    "Discipline Log": unreadDiscipline,
    Grades: unreadGrades,
    "My Child": unreadMyChild,
  };

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar transition-all duration-200 h-screen",
          "fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-60 md:w-16" : "w-60 md:w-60"
        )}
      >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          collapsed ? "px-2 py-4 md:flex-col md:gap-2" : "gap-3 px-4 py-5"
        )}
      >
        {collapsed ? (
          <Image
            src="/erduio-mark.png"
            alt="Erduio"
            width={86}
            height={118}
            className="flex-shrink-0 h-8 w-auto"
          />
        ) : (
          <div className="overflow-hidden flex flex-col gap-1">
            <Image
              src="/erduio-wordmark.png"
              alt="Erduio"
              width={299}
              height={137}
              className="h-7 w-auto"
              priority
            />
            <p className="text-xs text-muted-foreground truncate">{roleLabels[role]} Portal</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 flex-shrink-0 ml-auto hidden md:flex", !collapsed && "ml-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0 ml-auto md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const badgeCount = navBadgeCounts[item.label] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="relative flex-shrink-0">
                  <item.icon className="h-4 w-4" />
                  {badgeCount > 0 && collapsed && (
                    <NotificationBadge count={badgeCount} className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 px-0.5 text-[8px]" />
                  )}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && badgeCount > 0 && <NotificationBadge count={badgeCount} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User + Logout */}
      <div className="px-2 pb-3">
        <Separator className="mb-3" />
        <div className={cn("flex items-center gap-2 px-2 mb-2", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(session?.user.name ?? session?.user.email)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {session?.user.name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{session?.user.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm",
            collapsed ? "px-0 justify-center" : "justify-start gap-3 px-3"
          )}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </div>
      </aside>
    </>
  );
}

import { PortalLayout } from "@/components/layout/portal-layout";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole="teacher">{children}</PortalLayout>;
}

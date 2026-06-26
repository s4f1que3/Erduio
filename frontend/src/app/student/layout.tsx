import { PortalLayout } from "@/components/layout/portal-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole="student">{children}</PortalLayout>;
}

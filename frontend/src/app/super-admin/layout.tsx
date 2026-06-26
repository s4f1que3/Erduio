import { PortalLayout } from "@/components/layout/portal-layout";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole="super_admin">{children}</PortalLayout>;
}

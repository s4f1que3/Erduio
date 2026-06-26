import { PortalLayout } from "@/components/layout/portal-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole={["admin", "super_admin"]}>{children}</PortalLayout>;
}

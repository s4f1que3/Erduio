import { PortalLayout } from "@/components/layout/portal-layout";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole="parent">{children}</PortalLayout>;
}

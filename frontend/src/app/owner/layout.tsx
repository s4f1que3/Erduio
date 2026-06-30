import { PortalLayout } from "@/components/layout/portal-layout";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout requiredRole="owner">{children}</PortalLayout>;
}

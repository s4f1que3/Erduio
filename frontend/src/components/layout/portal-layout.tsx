"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { SidebarMobileProvider } from "./sidebar-context";
import { Footer } from "./footer";

interface PortalLayoutProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
}

export function PortalLayout({ children, requiredRole }: PortalLayoutProps) {
  const router = useRouter();
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(session.user.role)) {
      router.replace("/login");
    }
  }, [router, allowedRoles.join(",")]);

  return (
    <SidebarMobileProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1">{children}</div>
          <div className="border-t border-border bg-muted/40">
            <Footer />
          </div>
        </main>
      </div>
    </SidebarMobileProvider>
  );
}

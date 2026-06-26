"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarMobileContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarMobileContext = createContext<SidebarMobileContextValue | null>(null);

export function SidebarMobileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarMobileContext.Provider value={{ open, setOpen }}>{children}</SidebarMobileContext.Provider>;
}

export function useSidebarMobile() {
  const ctx = useContext(SidebarMobileContext);
  if (!ctx) throw new Error("useSidebarMobile must be used within SidebarMobileProvider");
  return ctx;
}

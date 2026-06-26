"use client";

import { ThemeToggle } from "./theme-toggle";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarMobile } from "./sidebar-context";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { setOpen } = useSidebarMobile();
  return (
    <header className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0 md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

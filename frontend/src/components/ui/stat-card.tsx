import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  className?: string;
  iconClassName?: string;
  iconColor?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: ReactNode;
}

export function StatCard({ label, value, icon: Icon, description, trend, className, iconClassName, iconColor, onClick, active, badge }: StatCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5 text-left w-full",
        onClick && "transition-colors hover:bg-muted/60 cursor-pointer",
        active && "border-primary ring-1 ring-primary bg-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground font-medium truncate">{label}</p>
            {badge}
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>}
          {trend && <p className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">{trend}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5 bg-primary/10 flex-shrink-0", iconClassName)}>
          <Icon className={cn("h-5 w-5 text-primary", iconColor)} />
        </div>
      </div>
    </Comp>
  );
}

import { cn } from "@/lib/utils";

export function NotificationBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

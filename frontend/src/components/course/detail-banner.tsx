import { LucideIcon } from "lucide-react";
import { ColorStyle } from "@/lib/subject-style";

interface DetailBannerProps {
  icon: LucideIcon;
  label: string;
  title: string;
  meta?: string;
  color: ColorStyle;
}

export function DetailBanner({ icon: Icon, label, title, meta, color }: DetailBannerProps) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-sm ${color.solid}`}>
      <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      {meta && <p className="text-sm text-white/80 mt-1">{meta}</p>}
    </div>
  );
}

"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@/lib/password";
import { cn } from "@/lib/utils";

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="space-y-1 text-xs pt-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password ?? "");
        return (
          <li
            key={req.label}
            className={cn("flex items-center gap-1.5", met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}
          >
            {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}

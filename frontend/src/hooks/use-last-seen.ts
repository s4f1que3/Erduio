"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function storageKey(domain: string, userId: string, key: string) {
  return `${domain}_last_seen_${userId}_${key}`;
}

function readStored(domain: string, userId: string, key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(storageKey(domain, userId, key));
  return raw ? Number(raw) : 0;
}

export function useLastSeen(domain: string, userId: string, key: string) {
  return useQuery({
    queryKey: ["last-seen", domain, userId, key],
    queryFn: () => readStored(domain, userId, key),
    enabled: !!userId,
    staleTime: Infinity,
  });
}

export function useMarkSeen(domain: string, userId: string, key: string) {
  const queryClient = useQueryClient();
  return useCallback(
    (timestamp: number) => {
      if (!userId) return;
      localStorage.setItem(storageKey(domain, userId, key), String(timestamp));
      queryClient.setQueryData(["last-seen", domain, userId, key], timestamp);
    },
    [userId, domain, key, queryClient]
  );
}

export function newestTimestamp(items: Record<string, unknown>[], field: string = "created_at"): number {
  return items.reduce((max, item) => {
    const raw = item[field];
    const t = raw ? new Date(raw as string).getTime() : 0;
    return t > max ? t : max;
  }, 0);
}

export function countNewerThan(items: Record<string, unknown>[], since: number, field: string = "created_at"): number {
  return items.reduce((count, item) => {
    const raw = item[field];
    const t = raw ? new Date(raw as string).getTime() : 0;
    return t > since ? count + 1 : count;
  }, 0);
}

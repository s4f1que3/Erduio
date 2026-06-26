"use client";

import { useLastSeen, useMarkSeen, newestTimestamp, countNewerThan } from "@/hooks/use-last-seen";

export type AnnouncementScope = string;

export function useAnnouncementsLastSeen(userId: string, scope: AnnouncementScope) {
  return useLastSeen("announcements", userId, scope);
}

export function useMarkAnnouncementsSeen(userId: string, scope: AnnouncementScope) {
  return useMarkSeen("announcements", userId, scope);
}

export { newestTimestamp, countNewerThan };

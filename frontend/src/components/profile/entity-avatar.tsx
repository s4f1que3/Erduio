"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";

interface EntityAvatarProps {
  id?: string | null;
  pfpPath?: string | null;
  name?: string | null;
  email?: string | null;
  endpoint: string;
  className?: string;
  fallbackClassName?: string;
}

export function EntityAvatar({ id, pfpPath, name, email, endpoint, className, fallbackClassName }: EntityAvatarProps) {
  const { data: avatarUrl } = useQuery({
    queryKey: ["entity-avatar", endpoint, id],
    queryFn: async () => (await api.get(`${endpoint}/${id}`)).data as string,
    enabled: !!id && !!pfpPath,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? ""} />}
      <AvatarFallback className={cn("bg-primary/10 text-primary", fallbackClassName)}>
        {getInitials(name ?? email ?? undefined)}
      </AvatarFallback>
    </Avatar>
  );
}

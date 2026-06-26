"use client";

import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Camera, Trash2, Loader2 } from "lucide-react";

interface ProfilePictureFieldProps {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  uploading?: boolean;
  deleting?: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export function ProfilePictureField({ name, email, avatarUrl, uploading, deleting, onUpload, onDelete }: ProfilePictureFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative shrink-0">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? ""} />}
        <AvatarFallback className="text-xl bg-primary/10 text-primary">{getInitials(name ?? email)}</AvatarFallback>
      </Avatar>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      <div className="absolute -bottom-1 -right-1 flex gap-0.5">
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload photo"
        >
          {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          className="text-destructive"
          disabled={deleting}
          onClick={onDelete}
          title="Remove photo"
        >
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  );
}

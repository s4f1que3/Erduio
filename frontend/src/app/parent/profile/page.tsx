"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { getSession, updateSessionName } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeEmailCard } from "@/components/profile/change-email-card";
import { ChangePasswordCard } from "@/components/profile/change-password-card";
import { SchoolInfoCard } from "@/components/profile/school-info-card";
import { ProfilePictureField } from "@/components/profile/profile-picture-field";
import { Loader2, User } from "lucide-react";

export default function ParentProfile() {
  const session = getSession();
  const qc = useQueryClient();
  const [li, setLi] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: myProfile } = useQuery({
    queryKey: ["parent-me-profile"],
    queryFn: async () => (await api.get("/parent/me/profile")).data as { id: string; pfp_path?: string | null },
  });
  const { data: avatarUrl } = useQuery({
    queryKey: ["parent-me-pfp", myProfile?.id],
    queryFn: async () => (await api.get(`/parent/profile-pic/${myProfile?.id}`)).data as string,
    enabled: !!myProfile?.id && !!myProfile?.pfp_path,
    retry: false,
  });

  const uploadPic = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("pfp", file);
      return api.post("/parent/profile-pic/add", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Profile picture updated"); qc.invalidateQueries({ queryKey: ["parent-me-profile"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deletePic = useMutation({
    mutationFn: () => api.post("/parent/profile-pic/delete"),
    onSuccess: () => { toast.success("Profile picture removed"); qc.invalidateQueries({ queryKey: ["parent-me-profile"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const iForm = useForm({ resolver: zodResolver(z.object({ name: z.string().min(2), phone: z.string().min(7) })), defaultValues: { name: session?.user.name ?? "", phone: "" } });

  const displaySession = mounted ? session : null;

  async function saveInfo(d: { name: string; phone: string }) { setLi(true); try { await api.patch("/parent/updated-info", { new_name: d.name, new_phone: d.phone }); updateSessionName(d.name); toast.success("Updated"); } catch (e) { toast.error(getErrorMessage(e)); } finally { setLi(false); } }

  return (
    <>
      <Header title="My Profile" description="Manage your parent account" />
      <PageShell>
        <div className="max-w-2xl space-y-6">
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <ProfilePictureField
                name={displaySession?.user.name}
                email={displaySession?.user.email}
                avatarUrl={avatarUrl}
                uploading={uploadPic.isPending}
                deleting={deletePic.isPending}
                onUpload={(file) => uploadPic.mutate(file)}
                onDelete={() => deletePic.mutate()}
              />
              <div><p className="font-semibold">{displaySession?.user.name ?? "Parent"}</p><p className="text-sm text-muted-foreground">{displaySession?.user.email}</p><p className="text-xs text-primary mt-0.5 font-medium">Parent / Guardian</p></div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Personal Info</CardTitle></CardHeader><CardContent>
            <form onSubmit={iForm.handleSubmit(saveInfo)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Name</Label><Input {...iForm.register("name")} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input {...iForm.register("phone")} /></div>
              </div>
              <Button type="submit" size="sm" disabled={li}>{li && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
            </form>
          </CardContent></Card>

          <ChangeEmailCard endpoint="/parent/change-email" />
          <ChangePasswordCard endpoint="/parent/updated-password" />
          <SchoolInfoCard />
        </div>
      </PageShell>
    </>
  );
}

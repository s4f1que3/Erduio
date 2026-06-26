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

const infoSchema = z.object({ name: z.string().min(2), phone: z.string().min(7) });

export default function AdminProfile() {
  const session = getSession();
  const qc = useQueryClient();
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: myProfile } = useQuery({
    queryKey: ["admin-me-profile"],
    queryFn: async () => (await api.get("/admin/me/profile")).data as { id: string; pfp_path?: string | null },
  });
  const { data: avatarUrl } = useQuery({
    queryKey: ["admin-me-pfp", myProfile?.id],
    queryFn: async () => (await api.get(`/admin/profile-pic/${myProfile?.id}`)).data as string,
    enabled: !!myProfile?.id && !!myProfile?.pfp_path,
    retry: false,
  });

  const uploadPic = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("pfp", file);
      return api.post("/admin/profile-pic/add", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("Profile picture updated"); qc.invalidateQueries({ queryKey: ["admin-me-profile"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deletePic = useMutation({
    mutationFn: () => api.delete("/admin/profile-pic/delete"),
    onSuccess: () => { toast.success("Profile picture removed"); qc.invalidateQueries({ queryKey: ["admin-me-profile"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const infoForm = useForm({ resolver: zodResolver(infoSchema), defaultValues: { name: session?.user.name ?? "", phone: "" } });

  const displaySession = mounted ? session : null;

  async function saveInfo(data: { name: string; phone: string }) {
    setLoadingInfo(true);
    try { await api.patch("/admin/update-info", { new_name: data.name, new_phone: data.phone }); updateSessionName(data.name); toast.success("Updated"); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setLoadingInfo(false); }
  }

  return (
    <>
      <Header title="My Profile" description="Manage your admin account" />
      <PageShell>
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="pt-6">
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
                <div>
                  <p className="font-semibold">{displaySession?.user.name ?? "Admin"}</p>
                  <p className="text-sm text-muted-foreground">{displaySession?.user.email}</p>
                  <p className="text-xs text-primary mt-0.5 font-medium">School Administrator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Personal Info</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={infoForm.handleSubmit(saveInfo)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Full Name</Label><Input {...infoForm.register("name")} /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input {...infoForm.register("phone")} /></div>
                </div>
                <Button type="submit" size="sm" disabled={loadingInfo}>
                  {loadingInfo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
                </Button>
              </form>
            </CardContent>
          </Card>

          <ChangeEmailCard endpoint="/admin/change-email" />
          <ChangePasswordCard endpoint="/admin/change-password" />
          <SchoolInfoCard />
        </div>
      </PageShell>
    </>
  );
}

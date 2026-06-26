"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfilePictureField } from "@/components/profile/profile-picture-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Pencil, Loader2 } from "lucide-react";

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const HIDDEN_KEYS = new Set(["id", "name", "created_at", "updated_at", "school_id", "logo_path"]);

const editSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

export function SchoolInfoCard() {
  const qc = useQueryClient();
  const canEditLogo = getSession()?.user.role === "admin" || getSession()?.user.role === "super_admin";
  const [editing, setEditing] = useState(false);
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema), defaultValues: { name: "", email: "", phone: "", address: "" } });

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const raw = (await api.get("/schools/info")).data;
      const school = Array.isArray(raw) ? raw[0] : raw;
      return (school ?? null) as Record<string, unknown> | null;
    },
  });

  const schoolId = data?.id ? String(data.id) : undefined;
  const logoPath = data?.logo_path && data.logo_path !== "null" ? String(data.logo_path) : null;

  const { data: logoUrl } = useQuery({
    queryKey: ["school-logo-url", schoolId],
    queryFn: async () => (await api.get(`/schools/${schoolId}/logo`)).data as string,
    enabled: !!schoolId && !!logoPath,
    retry: false,
  });

  const uploadLogo = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("logo", file);
      return api.post("/schools/add-logo", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => { toast.success("School logo updated"); qc.invalidateQueries({ queryKey: ["school-info"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deleteLogo = useMutation({
    mutationFn: () => api.delete("/schools/logo"),
    onSuccess: () => { toast.success("School logo removed"); qc.invalidateQueries({ queryKey: ["school-info"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateInfo = useMutation({
    mutationFn: (values: EditForm) => api.patch("/schools/update-info", values),
    onSuccess: () => {
      toast.success("School info updated");
      qc.invalidateQueries({ queryKey: ["school-info"] });
      setEditing(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function startEditing() {
    editForm.reset({
      name: String(data?.name ?? ""),
      email: String(data?.email ?? ""),
      phone: String(data?.phone_number ?? ""),
      address: String(data?.address ?? ""),
    });
    setEditing(true);
  }

  const fields = data
    ? Object.entries(data).filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== "")
    : [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2"><span className="rounded-md bg-emerald-100 dark:bg-emerald-500/15 p-1.5"><School className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></span>School</CardTitle>
        {canEditLogo && data && !editing && (
          <Button type="button" size="sm" variant="ghost" onClick={startEditing}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">School information unavailable</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {canEditLogo ? (
                <ProfilePictureField
                  name={String(data.name ?? "")}
                  avatarUrl={logoUrl}
                  uploading={uploadLogo.isPending}
                  deleting={deleteLogo.isPending}
                  onUpload={(file) => uploadLogo.mutate(file)}
                  onDelete={() => deleteLogo.mutate()}
                />
              ) : (
                <Avatar className="h-16 w-16">
                  {logoUrl && <AvatarImage src={logoUrl} alt={String(data.name ?? "")} />}
                  <AvatarFallback className="text-xl bg-primary/10 text-primary"><School className="h-6 w-6" /></AvatarFallback>
                </Avatar>
              )}
              {!editing && <p className="font-medium text-base">{String(data.name ?? "")}</p>}
            </div>
            {editing ? (
              <form onSubmit={editForm.handleSubmit((values) => updateInfo.mutate(values))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input {...editForm.register("name")} />
                    {editForm.formState.errors.name && <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input {...editForm.register("email")} />
                    {editForm.formState.errors.email && <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input {...editForm.register("phone")} /></div>
                  <div className="space-y-1.5"><Label>Address</Label><Input {...editForm.register("address")} /></div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={updateInfo.isPending}>
                    {updateInfo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)} disabled={updateInfo.isPending}>Cancel</Button>
                </div>
              </form>
            ) : (
              fields.length > 0 && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {fields.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{humanizeKey(k)}</dt>
                      <dd className="text-foreground">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { School, Pencil, Loader2, Ban, Unlock } from "lucide-react";

type SchoolRow = Record<string, unknown>;

const editSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().email().max(75),
  phone: z.string().min(1).max(20),
  address: z.string().min(1).max(130),
});
type EditForm = z.infer<typeof editSchema>;

export default function OwnerSchoolDetailPage() {
  const params = useParams<{ school_id: string }>();
  const schoolId = params.school_id;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["owner-schools"],
    queryFn: async () => (await api.get("/owner/schools")).data as SchoolRow[],
  });
  const data = schools.find((s) => String(s.id) === schoolId);

  const logoPath = data?.logo_path && data.logo_path !== "null" ? String(data.logo_path) : null;
  const { data: logoUrl } = useQuery({
    queryKey: ["owner-school-logo-url", schoolId],
    queryFn: async () => (await api.get(`/owner/school/${schoolId}/logo`)).data as string,
    enabled: !!logoPath,
    retry: false,
  });

  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const updateInfo = useMutation({
    mutationFn: (values: EditForm) => api.patch(`/owner/school/${schoolId}/edit`, values),
    onSuccess: () => {
      toast.success("School info updated");
      qc.invalidateQueries({ queryKey: ["owner-schools"] });
      setEditing(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const disableSchool = useMutation({
    mutationFn: () => api.patch(`/owner/school/${schoolId}/disable`),
    onSuccess: () => {
      toast.success("School disabled");
      setShowDisableConfirm(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const enableSchool = useMutation({
    mutationFn: () => api.patch(`/owner/school/${schoolId}/enable`),
    onSuccess: () => toast.success("School enabled"),
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

  return (
    <>
      <Header
        title={isLoading ? "School" : String(data?.name ?? "School")}
        description="School information"
      />
      <PageShell>
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 dark:bg-emerald-500/15 p-1.5">
                  <School className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                School Info
              </CardTitle>
              {data && !editing && (
                <Button type="button" size="sm" variant="ghost" onClick={startEditing}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
              ) : !data ? (
                <p className="text-sm text-muted-foreground">School not found</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {logoUrl && <AvatarImage src={logoUrl} alt={String(data.name ?? "")} />}
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        <School className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
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
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="text-foreground">{String(data.email ?? "—")}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="text-foreground">{String(data.phone_number ?? "—")}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Address</dt><dd className="text-foreground">{String(data.address ?? "—")}</dd></div>
                    </dl>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {data && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                  <span className="rounded-md bg-destructive/10 p-1.5">
                    <Ban className="h-4 w-4" />
                  </span>
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Disabling this school bans every user belonging to it. Enabling it lifts the ban.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={() => setShowDisableConfirm(true)}>
                    Disable School
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => enableSchool.mutate()} disabled={enableSchool.isPending}>
                    {enableSchool.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5 mr-1.5" />}
                    Enable School
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageShell>

      <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable {String(data?.name ?? "this school")}?</DialogTitle>
            <DialogDescription>
              This will ban every user belonging to this school. You can reverse this with the Enable School button.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDisableConfirm(false)} disabled={disableSchool.isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => disableSchool.mutate()} disabled={disableSchool.isPending}>
              {disableSchool.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Disable School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

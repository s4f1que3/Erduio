"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, statusBadgeVariant } from "@/lib/utils";
import { Plus, RotateCcw, Trash2, Loader2, Search } from "lucide-react";
import { ParentProfileDialog } from "@/components/admin/parent-profile-dialog";
import { EntityAvatar } from "@/components/profile/entity-avatar";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: passwordSchema,
});
type CreateForm = z.infer<typeof createSchema>;

export default function ParentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [profileParentId, setProfileParentId] = useState<string | null>(null);
  const session = getSession();

  const { data: activeParents = [], isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: async () => (await api.get("/parent/all-parents")).data ?? [],
  });

  const { data: inactiveParents = [] } = useQuery({
    queryKey: ["parents-inactive"],
    queryFn: async () => (await api.get("/parent/all/deleted")).data ?? [],
    enabled: showInactive,
  });

  const parents = showInactive ? [...activeParents, ...inactiveParents] : activeParents;

  const filtered = (parents as Record<string, unknown>[]).filter((p) => {
    const m = search
      ? String(p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(p.email ?? "").toLowerCase().includes(search.toLowerCase())
      : true;
    return m;
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });
  const password = watch("password");

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) => api.post("/parent/admin/create/login", { ...d, token: session?.access_token }),
    onSuccess: () => { toast.success("Parent created"); qc.invalidateQueries({ queryKey: ["parents"] }); setShowCreate(false); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/parent/admin/delete/${id}`),
    onSuccess: () => { toast.success("Parent deactivated"); qc.invalidateQueries({ queryKey: ["parents"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/parent/admin/undo-delete/${id}`),
    onSuccess: () => { toast.success("Parent restored"); qc.invalidateQueries({ queryKey: ["parents"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header
        title="Parent Management"
        description="Manage parent and guardian accounts"
      />
      <PageShell>
        <Section>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search parents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant={showInactive ? "secondary" : "outline"} size="sm" onClick={() => setShowInactive(!showInactive)}>
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">To create a parent, create a student first — students and parents must be linked.</p>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            {
              key: "name", label: "Parent",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <EntityAvatar
                    id={String(r.id ?? "")}
                    pfpPath={r.pfp_path as string | null}
                    name={String(r.name ?? "")}
                    endpoint="/parent/profile-pic"
                    className="h-7 w-7"
                    fallbackClassName="text-xs"
                  />
                  <span className="font-medium">{String(r.name ?? "")}</span>
                </div>
              ),
            },
            { key: "email", label: "Email" },
            { key: "phone_number", label: "Phone" },
            { key: "status", label: "Status", render: (r) => <Badge variant={statusBadgeVariant(r.status as string)}>{String(r.status ?? "")}</Badge> },
            { key: "created_at", label: "Joined", render: (r) => formatDate(r.created_at as string) },
            {
              key: "actions", label: "", className: "w-20 text-right",
              render: (r) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  {r.status === "active"
                    ? <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(r.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    : <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => restoreMutation.mutate(String(r.id))}><RotateCcw className="h-3.5 w-3.5" /></Button>
                  }
                </div>
              ),
            },
          ]}
          data={filtered}
          onRowClick={(r) => setProfileParentId(String(r.id))}
        />
      </PageShell>

      <ParentProfileDialog
        parentId={profileParentId}
        open={!!profileParentId}
        onOpenChange={(o) => !o && setProfileParentId(null)}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Parent</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
              <div className="space-y-1.5"><Label>Phone</Label><Input {...register("phone")} />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            </div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-1.5"><Label>Temporary Password</Label><Input type="password" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}<PasswordRequirements password={password} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Parent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

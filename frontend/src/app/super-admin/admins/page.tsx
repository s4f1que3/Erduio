"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
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
import { getSession } from "@/lib/auth";
import { AdminProfileDialog } from "@/components/super-admin/admin-profile-dialog";
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

export default function AdminsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Record<string, unknown> | null>(null);
  const session = getSession();

  const { data: activeAdmins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await api.get("/admin/all-admins");
      return res.data ?? [];
    },
  });
  const { data: inactiveAdmins = [] } = useQuery({
    queryKey: ["admins-inactive"],
    queryFn: async () => {
      const res = await api.get("/admin/inactive-admins");
      return res.data ?? [];
    },
    enabled: showInactive,
  });
  const admins = showInactive
    ? [...(activeAdmins as Record<string, unknown>[]), ...(inactiveAdmins as Record<string, unknown>[])]
    : activeAdmins;

  const filtered = (admins as Record<string, unknown>[]).filter((a) =>
    search
      ? String(a.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(a.email ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });
  const password = watch("password");

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) =>
      api.post("/admin/create-admin", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        token: session?.access_token,
        school_id: session?.user.school_id,
      }),
    onSuccess: () => {
      toast.success("Admin created");
      qc.invalidateQueries({ queryKey: ["admins"] });
      setShowCreate(false);
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/deleteadmin/${id}`),
    onSuccess: () => {
      toast.success("Admin deactivated");
      qc.invalidateQueries({ queryKey: ["admins"] });
      qc.invalidateQueries({ queryKey: ["admins-inactive"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/restore-admin/${id}`),
    onSuccess: () => {
      toast.success("Admin restored");
      qc.invalidateQueries({ queryKey: ["admins"] });
      qc.invalidateQueries({ queryKey: ["admins-inactive"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Header
        title="Admin Management"
        description="Create and manage school administrators"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Admin
          </Button>
        }
      />
      <PageShell>
        <Section>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showInactive ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <EntityAvatar
                    id={String(row.id ?? "")}
                    pfpPath={row.pfp_path as string | null}
                    name={String(row.name ?? "")}
                    endpoint="/admin/profile-pic"
                    className="h-7 w-7"
                    fallbackClassName="text-xs"
                  />
                  <span className="font-medium">{String(row.name ?? "")}</span>
                </div>
              ),
            },
            { key: "email", label: "Email" },
            { key: "phone_number", label: "Phone" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <Badge variant={statusBadgeVariant(row.status as string)}>
                  {String(row.status ?? "—")}
                </Badge>
              ),
            },
            {
              key: "created_at",
              label: "Joined",
              render: (row) => formatDate(row.created_at as string),
            },
            {
              key: "actions",
              label: "",
              className: "w-24 text-right",
              render: (row) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {row.status === "active" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(String(row.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => restoreMutation.mutate(String(row.id))}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filtered}
          onRowClick={(row) => setSelectedAdmin(row)}
        />
      </PageShell>

      <AdminProfileDialog
        admin={selectedAdmin}
        open={!!selectedAdmin}
        onOpenChange={(o) => !o && setSelectedAdmin(null)}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Jane Smith" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="admin@school.edu" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0100" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Temporary Password</Label>
              <Input type="password" placeholder="Min. 8 characters" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              <PasswordRequirements password={password} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

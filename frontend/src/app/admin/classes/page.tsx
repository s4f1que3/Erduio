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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassProfileDialog } from "@/components/admin/class-profile-dialog";

const createSchema = z.object({
  name: z.string().min(1),
  class_teacher: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function ClassesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [profileClassId, setProfileClassId] = useState<string | null>(null);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => (await api.get("/teacher")).data ?? [],
  });

  const filtered = (classes as Record<string, unknown>[]).filter((c) => {
    const m = search ? String(c.name ?? "").toLowerCase().includes(search.toLowerCase()) : true;
    return m && (showInactive || c.status === "active");
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) => api.post("/classes/create", d),
    onSuccess: () => { toast.success("Class created"); qc.invalidateQueries({ queryKey: ["classes"] }); setShowCreate(false); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/classes/delete/${id}`),
    onSuccess: () => { toast.success("Class deactivated"); qc.invalidateQueries({ queryKey: ["classes"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/classes/restore/${id}`),
    onSuccess: () => { toast.success("Class restored"); qc.invalidateQueries({ queryKey: ["classes"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header
        title="Class Management"
        description="Manage school classes and sections"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Add Class</Button>}
      />
      <PageShell>
        <Section>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant={showInactive ? "secondary" : "outline"} size="sm" onClick={() => setShowInactive(!showInactive)}>
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            { key: "name", label: "Class Name", render: (r) => <span className="font-medium">{String(r.name ?? "")}</span> },
            { key: "status", label: "Status", render: (r) => <Badge variant={statusBadgeVariant(r.status as string)}>{String(r.status ?? "")}</Badge> },
            { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at as string) },
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
          onRowClick={(r) => setProfileClassId(String(r.id))}
        />
      </PageShell>

      <ClassProfileDialog
        classId={profileClassId}
        open={!!profileClassId}
        onOpenChange={(o) => !o && setProfileClassId(null)}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Class Name</Label>
              <Input placeholder="e.g. Grade 10A" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Class Teacher (optional)</Label>
              <Select onValueChange={(v: unknown) => setValue("class_teacher", String(v ?? ""))}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {(teachers as Record<string, unknown>[]).filter(t => t.status === "active").map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

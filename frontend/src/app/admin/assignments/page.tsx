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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Calendar, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const createSchema = z.object({
  name: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  classId: z.string().min(1, "Please select a class"),
  subjectId: z.string().min(1, "Please select a subject"),
});
type CreateForm = z.infer<typeof createSchema>;

export default function AssignmentsAdminPage() {
  const [search, setSearch] = useState("");
  const [currentWeek, setCurrentWeek] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();

  const endpoint = currentWeek ? "/assignments/admin/all/current-week" : "/assignments/admin/all";
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments-admin", currentWeek],
    queryFn: async () => (await api.get(endpoint)).data ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });

  const filtered = (assignments as Record<string, unknown>[]).filter((a) =>
    !search || String(a.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });
  const classId = watch("classId");

  const { data: subjects = [] } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/subjects`)).data ?? [],
    enabled: !!classId,
  });

  const resetDialog = () => { reset(); setFile(null); };

  const createMutation = useMutation({
    mutationFn: async (d: CreateForm) => {
      const form = new FormData();
      form.append("name", d.name);
      if (d.description) form.append("description", d.description);
      form.append("due_date", d.due_date);
      form.append("subject_id", d.subjectId);
      if (file) form.append("file", file);
      return api.post(`/assignments/create/subject/${d.subjectId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => { toast.success("Assignment created"); qc.invalidateQueries({ queryKey: ["assignments-admin"] }); setShowCreate(false); resetDialog(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header
        title="Assignments"
        description="View and manage all school assignments"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Assignment</Button>}
      />
      <PageShell>
        <Section>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={currentWeek} onCheckedChange={setCurrentWeek} />
            </div>
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            { key: "name", label: "Assignment", render: (r) => <span className="font-medium">{String(r.name ?? "")}</span> },
            { key: "description", label: "Description", render: (r) => <span className="text-muted-foreground truncate block max-w-xs">{String(r.description ?? "")}</span> },
            { key: "due_date", label: "Due Date", render: (r) => (
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(r.due_date as string)}
              </div>
            )},
            { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at as string) },
          ]}
          data={filtered}
        />
      </PageShell>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetDialog(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select onValueChange={(v: unknown) => { setValue("classId", String(v ?? "")); setValue("subjectId", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {(classes as Record<string, unknown>[]).map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-xs text-destructive">{errors.classId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={watch("subjectId") ?? ""} onValueChange={(v: unknown) => setValue("subjectId", String(v ?? ""))} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {(subjects as Record<string, unknown>[]).map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId.message}</p>}
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea rows={2} {...register("description")} /></div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" {...register("due_date")} />{errors.due_date && <p className="text-xs text-destructive">{errors.due_date.message}</p>}</div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetDialog(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

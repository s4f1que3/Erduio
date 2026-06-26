"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Loader2 } from "lucide-react";

function GradeEntryToggle({ termNumber }: { termNumber: number }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["grades-status", termNumber],
    queryFn: async () => (await api.get(`/report-card/grades-status/${termNumber}`)).data as { is_open: boolean },
  });

  const toggleMutation = useMutation({
    mutationFn: (is_open: boolean) => api.patch(`/report-card/grades-status/${termNumber}`, { is_open }),
    onSuccess: (_res, is_open) => {
      toast.success(is_open ? "Grade entry opened for teachers" : "Grade entry closed");
      qc.invalidateQueries({ queryKey: ["grades-status", termNumber] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={data?.is_open ?? false}
        onCheckedChange={(v: boolean) => toggleMutation.mutate(v)}
        disabled={isLoading || toggleMutation.isPending}
      />
      <span className="text-xs text-muted-foreground">{data?.is_open ? "Open" : "Closed"}</span>
    </div>
  );
}

const schema = z.object({
  number: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function TermsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ["terms"],
    queryFn: async () => {
      try { return (await api.get("/terms")).data ?? []; } catch { return []; }
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (d: Form) => api.post("/terms/create", { ...d, number: Number(d.number) }),
    onSuccess: () => { toast.success("Term created"); qc.invalidateQueries({ queryKey: ["terms"] }); setShowCreate(false); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/terms/delete/${id}`),
    onSuccess: () => { toast.success("Term deleted"); qc.invalidateQueries({ queryKey: ["terms"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header
        title="Terms"
        description="Manage academic terms and periods"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Add Term</Button>}
      />
      <PageShell>
        <DataTable
          loading={isLoading}
          columns={[
            { key: "number", label: "Term #", render: (r) => <span className="font-semibold">Term {String(r.number ?? "")}</span> },
            { key: "start_date", label: "Start Date", render: (r) => formatDate(r.start_date as string) },
            { key: "end_date", label: "End Date", render: (r) => formatDate(r.end_date as string) },
            { key: "grade_entry", label: "Grade Entry", render: (r) => <GradeEntryToggle termNumber={Number(r.number)} /> },
            {
              key: "actions", label: "", className: "w-16 text-right",
              render: (r) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(r.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ),
            },
          ]}
          data={terms}
        />
      </PageShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Term</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Term Number</Label>
              <Input type="number" min="1" placeholder="1" {...register("number")} />
              {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" {...register("start_date")} />{errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}</div>
              <div className="space-y-1.5"><Label>End Date</Label><Input type="date" {...register("end_date")} />{errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}</div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Term
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

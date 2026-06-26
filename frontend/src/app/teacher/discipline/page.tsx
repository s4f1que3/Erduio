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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { StudentPicker } from "@/components/student-picker";

const schema = z.object({ action: z.string().min(2), message: z.string().min(5), date: z.string().min(1) });
type Form = z.infer<typeof schema>;
type Student = { user_id: string; name: string };

export default function TeacherDisciplinePage() {
  const qc = useQueryClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema) });

  const searchedId = student?.user_id ?? "";

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["discipline", searchedId],
    queryFn: async () => { if (!searchedId) return []; return (await api.get(`/discipline/all/${searchedId}`)).data ?? []; },
    enabled: !!searchedId,
  });

  const createMutation = useMutation({
    mutationFn: (d: Form) => api.post(`/discipline/student/${searchedId}`, d),
    onSuccess: () => { toast.success("Recorded"); qc.invalidateQueries({ queryKey: ["discipline", searchedId] }); setShowCreate(false); reset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/discipline/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["discipline", searchedId] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <Header title="Student Discipline" description="Record student discipline incidents" actions={<Button size="sm" disabled={!searchedId} onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Record</Button>} />
      <PageShell>
        <Section>
          <div className="space-y-1.5 max-w-sm">
            <Label>Student</Label>
            <StudentPicker value={student} onSelect={setStudent} />
          </div>
        </Section>
        {searchedId ? (
          <DataTable loading={isLoading} columns={[
            { key: "action", label: "Action", render: (r) => <span className="font-medium">{String(r.action ?? "")}</span> },
            { key: "message", label: "Details" },
            { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
            { key: "actions", label: "", className: "w-16 text-right", render: (r) => <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(r.id))}><Trash2 className="h-3.5 w-3.5" /></Button> },
          ]} data={records} />
        ) : (
          <p className="text-center text-muted-foreground text-sm py-8">Search for a student to see their discipline records</p>
        )}
      </PageShell>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Incident</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Action</Label><Input {...register("action")} /></div>
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" {...register("date")} /></div>
            </div>
            <div className="space-y-1.5"><Label>Details</Label><Textarea rows={3} {...register("message")} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

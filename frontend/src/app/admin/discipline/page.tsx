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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";

const schema = z.object({
  action: z.string().min(2),
  message: z.string().min(5),
  date: z.string().min(1),
});
type Form = z.infer<typeof schema>;

type Student = { id: string; user_id: string; name: string };
type DisciplineRecord = { id: string; student_id: string; action: string; message: string; date: string; disciplined_by?: string };

function DeleteButton({ studentId, recordId, queryKey }: { studentId: string; recordId: string; queryKey: unknown[] }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => api.delete(`/discipline/student/${studentId}/${recordId}`),
    onSuccess: () => { toast.success("Record deleted"); qc.invalidateQueries({ queryKey }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}

const disciplineColumns = (queryKey: unknown[]) => [
  { key: "action", label: "Action", render: (r: DisciplineRecord) => <span className="font-medium">{String(r.action ?? "")}</span> },
  { key: "message", label: "Details" },
  { key: "date", label: "Date", render: (r: DisciplineRecord) => formatDate(r.date as string) },
  {
    key: "actions", label: "", className: "w-16 text-right",
    render: (r: DisciplineRecord) => <DeleteButton studentId={r.student_id} recordId={r.id} queryKey={queryKey} />,
  },
];

export default function DisciplinePage() {
  const [nameInput, setNameInput] = useState("");
  const [searchedName, setSearchedName] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const { data: allRecords = [], isLoading: allLoading } = useQuery({
    queryKey: ["discipline-all"],
    queryFn: async () => (await api.get("/discipline")).data ?? [],
  });

  const { data: myRecords = [], isLoading: myLoading } = useQuery({
    queryKey: ["discipline-mine"],
    queryFn: async () => (await api.get("/discipline/mine")).data ?? [],
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data ?? [],
  });

  const filteredStudents = searchedName
    ? (allStudents as Student[]).filter((s) => s.name?.toLowerCase().includes(searchedName.toLowerCase()))
    : [];

  const { data: studentRecords = [], isLoading: studentRecordsLoading } = useQuery({
    queryKey: ["discipline-student", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      return (await api.get(`/discipline/all/${selectedStudent.id}`)).data ?? [];
    },
    enabled: !!selectedStudent,
  });

  const createMutation = useMutation({
    mutationFn: (d: Form) => api.post(`/discipline/student/${selectedStudent!.id}`, d),
    onSuccess: () => {
      toast.success("Incident recorded");
      qc.invalidateQueries({ queryKey: ["discipline-student", selectedStudent?.id] });
      qc.invalidateQueries({ queryKey: ["discipline-all"] });
      qc.invalidateQueries({ queryKey: ["discipline-mine"] });
      setShowCreate(false);
      reset();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleSearch = () => {
    setSearchedName(nameInput);
    setSelectedStudent(null);
  };

  return (
    <>
      <Header
        title="Student Discipline"
        description="Record and manage student discipline incidents"
        actions={
          <Button size="sm" disabled={!selectedStudent} onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Record Incident
          </Button>
        }
      />
      <PageShell>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Disciplines</TabsTrigger>
            <TabsTrigger value="student">By Student</TabsTrigger>
            <TabsTrigger value="mine">My Records</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DataTable
              loading={allLoading}
              columns={disciplineColumns(["discipline-all"])}
              data={allRecords}
            />
          </TabsContent>

          <TabsContent value="student" className="mt-4 space-y-4">
            <Section>
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5">
                    <Label>Student Name</Label>
                    <Input
                      placeholder="Enter student name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && nameInput && handleSearch()}
                      className="w-64"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={!nameInput}>
                    <Search className="h-4 w-4 mr-1.5" />
                    Search
                  </Button>
                </div>

                {filteredStudents.length > 0 && (
                  <div className="space-y-1.5">
                    <Label>Select Student</Label>
                    <div className="flex flex-wrap gap-2">
                      {filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStudent(s)}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            selectedStudent?.id === s.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchedName && filteredStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No students found matching "{searchedName}"</p>
                )}
              </div>
            </Section>

            <DataTable
              loading={studentRecordsLoading && !!selectedStudent}
              columns={disciplineColumns(["discipline-student", selectedStudent?.id])}
              data={studentRecords}
            />
            {!selectedStudent && (
              <p className="text-center text-muted-foreground text-sm py-8">
                {searchedName ? "Select a student above to view their discipline records" : "Search for a student to view discipline records"}
              </p>
            )}
          </TabsContent>

          <TabsContent value="mine" className="mt-4">
            <DataTable
              loading={myLoading}
              columns={disciplineColumns(["discipline-mine"])}
              data={myRecords}
            />
          </TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Discipline Incident{selectedStudent ? ` — ${selectedStudent.name}` : ""}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Action / Type</Label>
                <Input placeholder="e.g. Suspension" {...register("action")} />
                {errors.action && <p className="text-xs text-destructive">{errors.action.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea rows={3} placeholder="Describe the incident..." {...register("message")} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

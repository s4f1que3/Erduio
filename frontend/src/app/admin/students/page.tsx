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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, statusBadgeVariant } from "@/lib/utils";
import { Plus, RotateCcw, Trash2, Loader2, Search, CheckSquare, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentProfileDialog } from "@/components/admin/student-profile-dialog";
import { EntityAvatar } from "@/components/profile/entity-avatar";
import { passwordSchema } from "@/lib/password";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const newParentSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  student_email: z.string().email("Enter a valid email address"),
  student_password: passwordSchema,
  student_phone: z.string().min(7, "Enter a valid phone number"),
  classID: z.string().min(1, "Please select a class"),
  subjects: z.array(z.string()).default([]),
  parent_name: z.string().min(2, "Name must be at least 2 characters"),
  parent_email: z.string().email("Enter a valid email address"),
  parent_password: passwordSchema,
  parent_phone: z.string().min(7, "Enter a valid phone number"),
});
const existingParentSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  student_email: z.string().email("Enter a valid email address"),
  student_password: passwordSchema,
  student_phone: z.string().min(7, "Enter a valid phone number"),
  classID: z.string().min(1, "Please select a class"),
  subjects: z.array(z.string()).default([]),
  parent_id: z.string().min(1, "Please select a parent"),
});

type NewParentForm = z.infer<typeof newParentSchema>;
type ExistingParentForm = z.infer<typeof existingParentSchema>;

function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-0.5">{message}</p>;
}

export default function StudentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [createTab, setCreateTab] = useState("new");
  const [newParentClassID, setNewParentClassID] = useState("");
  const [existingParentClassID, setExistingParentClassID] = useState("");
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);

  const { data: activeStudents = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data ?? [],
  });
  const { data: inactiveStudents = [] } = useQuery({
    queryKey: ["students-inactive"],
    queryFn: async () => (await api.get("/student/inactive")).data ?? [],
    enabled: showInactive,
  });
  const students = showInactive ? [...(activeStudents as Record<string, unknown>[]), ...(inactiveStudents as Record<string, unknown>[])] : activeStudents;
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const { data: parents = [] } = useQuery({
    queryKey: ["parents"],
    queryFn: async () => (await api.get("/parent/all-parents")).data ?? [],
  });
  const { data: newParentSubjects = [] } = useQuery({
    queryKey: ["class-subjects", newParentClassID],
    queryFn: async () => (await api.get(`/classes/${newParentClassID}/subjects`)).data ?? [],
    enabled: !!newParentClassID,
  });
  const { data: existingParentSubjects = [] } = useQuery({
    queryKey: ["class-subjects", existingParentClassID],
    queryFn: async () => (await api.get(`/classes/${existingParentClassID}/subjects`)).data ?? [],
    enabled: !!existingParentClassID,
  });

  const filtered = (students as Record<string, unknown>[]).filter((s) =>
    search
      ? String(s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.email ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const newParentForm = useForm<NewParentForm>({ resolver: zodResolver(newParentSchema) });
  const existingParentForm = useForm<ExistingParentForm>({ resolver: zodResolver(existingParentSchema) });
  const { errors: npErrors } = newParentForm.formState;
  const { errors: epErrors } = existingParentForm.formState;

  const resetDialog = () => {
    newParentForm.reset();
    existingParentForm.reset();
    setNewParentClassID("");
    setExistingParentClassID("");
  };

  const createWithNewParent = useMutation({
    mutationFn: (d: NewParentForm) => api.post("/student/admin/create", { ...d, is_creating: true }),
    onSuccess: () => { toast.success("Student + parent created"); qc.invalidateQueries({ queryKey: ["students"] }); setShowCreate(false); resetDialog(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createWithExistingParent = useMutation({
    mutationFn: (d: ExistingParentForm) => api.post("/student/admin/create/add", { ...d, is_creating: false }),
    onSuccess: () => { toast.success("Student created"); qc.invalidateQueries({ queryKey: ["students"] }); setShowCreate(false); resetDialog(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/student/admin/delete/${id}`),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["students-inactive"] }); },
    onSuccess: () => toast.success("Student deactivated"),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/student/admin/restore/${id}`),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["students-inactive"] }); },
    onSuccess: () => toast.success("Student restored"),
  });

  return (
    <>
      <Header
        title="Student Management"
        description="Manage student enrollments and profile"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />Add Student</Button>}
      />
      <PageShell>
        <Section>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant={showInactive ? "secondary" : "outline"} size="sm" onClick={() => setShowInactive(!showInactive)}>
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            {
              key: "name", label: "Student",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <EntityAvatar
                    id={String(r.id ?? "")}
                    pfpPath={r.pfp_path as string | null}
                    name={String(r.name ?? "")}
                    endpoint="/student/profile-pic"
                    className="h-7 w-7"
                    fallbackClassName="text-xs"
                  />
                  <span className="font-medium">{String(r.name ?? "")}</span>
                </div>
              ),
            },
            { key: "email", label: "Email" },
            { key: "phone_number", label: "Phone" },
            { key: "enrollment_status", label: "Enrollment", render: (r) => <Badge variant={statusBadgeVariant(r.enrollment_status as string)}>{String(r.enrollment_status ?? "—")}</Badge> },
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
          onRowClick={(r) => setProfileStudentId(String(r.id))}
        />
      </PageShell>

      <StudentProfileDialog
        studentId={profileStudentId}
        open={!!profileStudentId}
        onOpenChange={(o) => !o && setProfileStudentId(null)}
      />

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-destructive">*</span> Required fields</p>
          </DialogHeader>
          <Tabs value={createTab} onValueChange={(v: unknown) => setCreateTab(String(v ?? ""))}>
            <TabsList className="w-full">
              <TabsTrigger value="new" className="flex-1">New Parent</TabsTrigger>
              <TabsTrigger value="existing" className="flex-1">Existing Parent</TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <form onSubmit={newParentForm.handleSubmit((d) => createWithNewParent.mutate(d))} className="space-y-4 pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name<Req /></Label>
                    <Input {...newParentForm.register("student_name")} />
                    <FieldError message={npErrors.student_name?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone<Req /></Label>
                    <Input {...newParentForm.register("student_phone")} />
                    <FieldError message={npErrors.student_phone?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Email<Req /></Label>
                    <Input type="email" {...newParentForm.register("student_email")} />
                    <FieldError message={npErrors.student_email?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Password<Req /></Label>
                    <Input type="password" {...newParentForm.register("student_password")} />
                    <FieldError message={npErrors.student_password?.message} />
                    <PasswordRequirements password={newParentForm.watch("student_password")} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Class<Req /></Label>
                    <Select onValueChange={(v: unknown) => { const val = String(v ?? ""); newParentForm.setValue("classID", val); newParentForm.setValue("subjects", []); setNewParentClassID(val); }}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {(classes as Record<string, unknown>[]).map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={npErrors.classID?.message} />
                  </div>
                  {newParentClassID && (newParentSubjects as Record<string, unknown>[]).length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs">Subjects</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                        {(newParentSubjects as Record<string, unknown>[]).map((s) => {
                          const id = String(s.id ?? "");
                          const selected = (newParentForm.watch("subjects") ?? []).includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 cursor-pointer text-sm">
                              {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                              <input type="checkbox" className="sr-only" checked={selected} onChange={(e) => {
                                const current = newParentForm.getValues("subjects") ?? [];
                                newParentForm.setValue("subjects", e.target.checked ? [...current, id] : current.filter((x) => x !== id));
                              }} />
                              {String(s.name ?? "")}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Parent / Guardian Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name<Req /></Label>
                    <Input {...newParentForm.register("parent_name")} />
                    <FieldError message={npErrors.parent_name?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone<Req /></Label>
                    <Input {...newParentForm.register("parent_phone")} />
                    <FieldError message={npErrors.parent_phone?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Email<Req /></Label>
                    <Input type="email" {...newParentForm.register("parent_email")} />
                    <FieldError message={npErrors.parent_email?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Password<Req /></Label>
                    <Input type="password" {...newParentForm.register("parent_password")} />
                    <FieldError message={npErrors.parent_password?.message} />
                    <PasswordRequirements password={newParentForm.watch("parent_password")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetDialog(); }}>Cancel</Button>
                  <Button type="submit" disabled={createWithNewParent.isPending}>
                    {createWithNewParent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="existing">
              <form onSubmit={existingParentForm.handleSubmit((d) => createWithExistingParent.mutate(d))} className="space-y-4 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name<Req /></Label>
                    <Input {...existingParentForm.register("student_name")} />
                    <FieldError message={epErrors.student_name?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone<Req /></Label>
                    <Input {...existingParentForm.register("student_phone")} />
                    <FieldError message={epErrors.student_phone?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Email<Req /></Label>
                    <Input type="email" {...existingParentForm.register("student_email")} />
                    <FieldError message={epErrors.student_email?.message} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Password<Req /></Label>
                    <Input type="password" {...existingParentForm.register("student_password")} />
                    <FieldError message={epErrors.student_password?.message} />
                    <PasswordRequirements password={existingParentForm.watch("student_password")} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Class<Req /></Label>
                    <Select onValueChange={(v: unknown) => { const val = String(v ?? ""); existingParentForm.setValue("classID", val); existingParentForm.setValue("subjects", []); setExistingParentClassID(val); }}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {(classes as Record<string, unknown>[]).map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={epErrors.classID?.message} />
                  </div>
                  {existingParentClassID && (existingParentSubjects as Record<string, unknown>[]).length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs">Subjects</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                        {(existingParentSubjects as Record<string, unknown>[]).map((s) => {
                          const id = String(s.id ?? "");
                          const selected = (existingParentForm.watch("subjects") ?? []).includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 cursor-pointer text-sm">
                              {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                              <input type="checkbox" className="sr-only" checked={selected} onChange={(e) => {
                                const current = existingParentForm.getValues("subjects") ?? [];
                                existingParentForm.setValue("subjects", e.target.checked ? [...current, id] : current.filter((x) => x !== id));
                              }} />
                              {String(s.name ?? "")}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Existing Parent<Req /></Label>
                    <Select onValueChange={(v: unknown) => existingParentForm.setValue("parent_id", String(v ?? ""))}>
                      <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                      <SelectContent>
                        {(parents as Record<string, unknown>[]).map((p) => (
                          <SelectItem key={String(p.id)} value={String(p.id)}>{String(p.name ?? p.email ?? "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={epErrors.parent_id?.message} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetDialog(); }}>Cancel</Button>
                  <Button type="submit" disabled={createWithExistingParent.isPending}>
                    {createWithExistingParent.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

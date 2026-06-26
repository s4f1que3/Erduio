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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Loader2, Bell, Calendar, Search, Paperclip, X } from "lucide-react";

const schema = z.object({ title: z.string().min(1), content: z.string().min(1) });
type Form = z.infer<typeof schema>;
type Announcement = Record<string, unknown>;

function buildFormData(data: Record<string, string>, file?: File | null) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  if (file) fd.append("file", file);
  return fd;
}

function AnnouncementCard({ item, badge, onDelete, onView }: { item: Announcement; badge?: string; onDelete: () => void; onView: () => void }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors cursor-pointer"
      onClick={onView}
    >
      <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm text-foreground">{String(item.title ?? "")}</p>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{String(item.content ?? "")}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formatDate(item.created_at as string)}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function AnnouncementList({ data, loading, error, empty, badge, onDelete, onView }: {
  data: Announcement[];
  loading: boolean;
  error?: unknown;
  empty: string;
  badge?: (item: Announcement) => string | undefined;
  onDelete: (item: Announcement) => void;
  onView: (item: Announcement) => void;
}) {
  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>;
  if (error) return <div className="text-center py-12 text-destructive text-sm">Failed to load: {getErrorMessage(error)}</div>;
  if (data.length === 0) return <div className="text-center py-12 text-muted-foreground text-sm">{empty}</div>;
  return (
    <div className="space-y-3">
      {data.map((a) => (
        <AnnouncementCard key={String(a.id)} item={a} badge={badge?.(a)} onDelete={() => onDelete(a)} onView={() => onView(a)} />
      ))}
    </div>
  );
}

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<{ item: Announcement; badge?: string } | null>(null);

  // Create form selectors
  const [createClassId, setCreateClassId] = useState("");
  const [createGroupTarget, setCreateGroupTarget] = useState("");
  const [createSubjectClassId, setCreateSubjectClassId] = useState("");
  const [createSubjectId, setCreateSubjectId] = useState("");
  const [createStudentId, setCreateStudentId] = useState("");
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [studentSearchName, setStudentSearchName] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  // Announcement data
  const { data: general = [], isLoading: loadingGeneral, error: errorGeneral } = useQuery({
    queryKey: ["announcements-general"],
    queryFn: async () => (await api.get("/announcements/general/all")).data ?? [],
  });
  const { data: classAnnouncements = [], isLoading: loadingClass, error: errorClass } = useQuery({
    queryKey: ["announcements-class"],
    queryFn: async () => (await api.get("/announcements/all/classes/")).data ?? [],
  });
  const { data: groupAnnouncements = [], isLoading: loadingGroup, error: errorGroup } = useQuery({
    queryKey: ["announcements-group"],
    queryFn: async () => (await api.get("/announcements/group/all")).data ?? [],
  });
  const { data: subjectAnnouncements = [], isLoading: loadingSubject, error: errorSubject } = useQuery({
    queryKey: ["announcements-subject"],
    queryFn: async () => (await api.get("/announcements/all/subjects")).data ?? [],
  });
  const { data: studentAnnouncements = [], isLoading: loadingStudent, error: errorStudent } = useQuery({
    queryKey: ["announcements-student"],
    queryFn: async () => (await api.get("/announcement/all")).data ?? [],
  });

  // Selector data
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const { data: classSubjects = [] } = useQuery({
    queryKey: ["class-subjects", createSubjectClassId],
    queryFn: async () => (await api.get(`/classes/${createSubjectClassId}/subjects`)).data ?? [],
    enabled: !!createSubjectClassId,
  });
  const { data: allStudents = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data ?? [],
  });

  const filteredStudents = studentSearchName
    ? (allStudents as { id: string; name: string }[]).filter(s => s.name?.toLowerCase().includes(studentSearchName.toLowerCase()))
    : [];

  // Create mutations
  const createGeneral = useMutation({
    mutationFn: (d: Form) => api.post("/announcements/general/admin/create", buildFormData({ title: d.title, content: d.content }, attachedFile), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Announcement published"); qc.invalidateQueries({ queryKey: ["announcements-general"] }); handleClose(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const createClass = useMutation({
    mutationFn: (d: Form) => api.post(`/announcements/create/class/${createClassId}`, buildFormData({ title: d.title, content: d.content }, attachedFile), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Announcement published"); qc.invalidateQueries({ queryKey: ["announcements-class"] }); handleClose(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const createGroupMutation = useMutation({
    mutationFn: (d: Form) => api.post(`/announcements/group/create/group/${createGroupTarget}`, buildFormData({ title: d.title, content: d.content }, attachedFile), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Announcement published"); qc.invalidateQueries({ queryKey: ["announcements-group"] }); handleClose(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const createSubject = useMutation({
    mutationFn: (d: Form) => api.post(`/announcements/create/subject/${createSubjectId}`, buildFormData({ title: d.title, content: d.content }, attachedFile), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Announcement published"); qc.invalidateQueries({ queryKey: ["announcements-subject"] }); handleClose(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const createStudent = useMutation({
    mutationFn: (d: Form) => api.post(`/announcement/create/student/${createStudentId}`, buildFormData({ title: d.title, content: d.content }, attachedFile), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Announcement published"); qc.invalidateQueries({ queryKey: ["announcements-student"] }); handleClose(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  // Delete mutations
  const deleteGeneral = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/general/admin/delete/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements-general"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deleteClass = useMutation({
    mutationFn: ({ classId, id }: { classId: string; id: string }) => api.delete(`/announcements/delete/class/${classId}/announcement/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements-class"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deleteGroup = useMutation({
    mutationFn: ({ group, id }: { group: string; id: string }) => api.delete(`/announcements/group/delete/group/${group}/announcement/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements-group"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deleteSubject = useMutation({
    mutationFn: ({ subjectId, id }: { subjectId: string; id: string }) => api.delete(`/announcements/delete/subject/${subjectId}/announcement/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements-subject"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const deleteStudent = useMutation({
    mutationFn: ({ studentId, id }: { studentId: string; id: string }) => api.delete(`/announcement/admin/delete/announcement/${id}/student/${studentId}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements-student"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const activeMutation = { general: createGeneral, class: createClass, group: createGroupMutation, subject: createSubject, student: createStudent }[activeTab] ?? createGeneral;

  const canSubmit = () => {
    if (activeTab === "class") return !!createClassId;
    if (activeTab === "group") return !!createGroupTarget;
    if (activeTab === "subject") return !!createSubjectId;
    if (activeTab === "student") return !!createStudentId;
    return true;
  };

  const handleClose = () => {
    setShowCreate(false);
    reset();
    setCreateClassId("");
    setCreateGroupTarget("");
    setCreateSubjectClassId("");
    setCreateSubjectId("");
    setCreateStudentId("");
    setStudentSearchInput("");
    setStudentSearchName("");
    setAttachedFile(null);
  };

  const tabLabel: Record<string, string> = { general: "General", class: "Class", group: "Group", subject: "Subject", student: "Student" };

  return (
    <>
      <Header
        title="Announcements"
        description="Broadcast messages to the school community"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Announcement</Button>}
      />
      <PageShell>
        <Tabs value={activeTab} onValueChange={(v: unknown) => setActiveTab(String(v ?? "general"))}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="class">Class</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
            <TabsTrigger value="subject">Subject</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Section>
              <AnnouncementList
                data={general as Announcement[]}
                loading={loadingGeneral}
                error={errorGeneral}
                empty="No general announcements yet"
                onDelete={(a) => deleteGeneral.mutate(String(a.id))}
                onView={(a) => setViewing({ item: a })}
              />
            </Section>
          </TabsContent>

          <TabsContent value="class" className="mt-4">
            <Section>
              <AnnouncementList
                data={classAnnouncements as Announcement[]}
                loading={loadingClass}
                error={errorClass}
                empty="No class announcements yet"
                badge={(a) => String(a.class_name ?? a.class_id ?? "")}
                onDelete={(a) => deleteClass.mutate({ classId: String(a.class_id), id: String(a.id) })}
                onView={(a) => setViewing({ item: a, badge: String(a.class_name ?? a.class_id ?? "") })}
              />
            </Section>
          </TabsContent>

          <TabsContent value="group" className="mt-4">
            <Section>
              <AnnouncementList
                data={groupAnnouncements as Announcement[]}
                loading={loadingGroup}
                error={errorGroup}
                empty="No group announcements yet"
                badge={(a) => String(a.group ?? "")}
                onDelete={(a) => deleteGroup.mutate({ group: String(a.group), id: String(a.id) })}
                onView={(a) => setViewing({ item: a, badge: String(a.group ?? "") })}
              />
            </Section>
          </TabsContent>

          <TabsContent value="subject" className="mt-4">
            <Section>
              <AnnouncementList
                data={subjectAnnouncements as Announcement[]}
                loading={loadingSubject}
                error={errorSubject}
                empty="No subject announcements yet"
                badge={(a) => String(a.subject_name ?? a.subject_id ?? "")}
                onDelete={(a) => deleteSubject.mutate({ subjectId: String(a.subject_id), id: String(a.id) })}
                onView={(a) => setViewing({ item: a, badge: String(a.subject_name ?? a.subject_id ?? "") })}
              />
            </Section>
          </TabsContent>

          <TabsContent value="student" className="mt-4">
            <Section>
              <AnnouncementList
                data={studentAnnouncements as Announcement[]}
                loading={loadingStudent}
                error={errorStudent}
                empty="No student announcements yet"
                onDelete={(a) => deleteStudent.mutate({ studentId: String(a.student_id), id: String(a.id) })}
                onView={(a) => setViewing({ item: a })}
              />
            </Section>
          </TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={showCreate} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {tabLabel[activeTab]} Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => activeMutation.mutate(d))} className="space-y-4 pt-2">

            {activeTab === "class" && (
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select onValueChange={(v: unknown) => setCreateClassId(String(v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  <SelectContent>
                    {(classes as { id: string; name: string }[]).map((c) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "group" && (
              <div className="space-y-1.5">
                <Label>Group</Label>
                <Select onValueChange={(v: unknown) => setCreateGroupTarget(String(v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select a group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="admins">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "subject" && (
              <>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select onValueChange={(v: unknown) => { setCreateSubjectClassId(String(v ?? "")); setCreateSubjectId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                    <SelectContent>
                      {(classes as { id: string; name: string }[]).map((c) => (
                        <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Select onValueChange={(v: unknown) => setCreateSubjectId(String(v ?? ""))} disabled={!createSubjectClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder={createSubjectClassId ? "Select a subject" : "Select a class first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(classSubjects as { id: string; name: string }[]).map((s) => (
                        <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "student" && (
              <div className="space-y-1.5">
                <Label>Student</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={studentSearchInput}
                    onChange={(e) => setStudentSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setStudentSearchName(studentSearchInput); } }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setStudentSearchName(studentSearchInput)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {filteredStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCreateStudentId(s.id)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${createStudentId === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                {studentSearchName && filteredStudents.length === 0 && (
                  <p className="text-xs text-muted-foreground">No students found matching "{studentSearchName}"</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Announcement title..." {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea rows={4} placeholder="Write your announcement..." {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Attachment <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted cursor-pointer transition-colors text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{attachedFile ? attachedFile.name : "Choose file..."}</span>
                {attachedFile && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setAttachedFile(null); }}
                    className="ml-auto flex-shrink-0 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <input type="file" className="hidden" onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={activeMutation.isPending || !canSubmit()}>
                {activeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {String(viewing?.item.title ?? "")}
              {viewing?.badge && <Badge variant="secondary" className="text-xs">{viewing.badge}</Badge>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-foreground whitespace-pre-wrap">{String(viewing?.item.content ?? "")}</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{viewing ? formatDate(viewing.item.created_at as string) : ""}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { useAnnouncementsLastSeen, useMarkAnnouncementsSeen } from "@/hooks/use-announcements-seen";
import { countNewerThan } from "@/hooks/use-last-seen";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Header } from "@/components/layout/header";
import { PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StudentPicker } from "@/components/student-picker";
import { formatDate } from "@/lib/utils";
import { Bell, Calendar, Loader2, Plus } from "lucide-react";

type TeacherProfile = {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string | null; class_id: string; class_name: string | null }[];
};
type Target = "class" | "subject" | "student";

const schema = z.object({
  target: z.enum(["class", "subject", "student"]),
  targetId: z.string().min(1, "Select a target"),
  title: z.string().min(1),
  content: z.string().min(1),
});
type Form = z.infer<typeof schema>;

function AnnouncementList({ data, loading }: { data: Record<string, unknown>[]; loading?: boolean }) {
  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>;
  if (!data.length) return <div className="text-center py-12 text-muted-foreground text-sm">No announcements</div>;
  return (
    <div className="space-y-3">
      {data.map((a) => (
        <div key={String(a.id)} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
          <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0"><Bell className="h-4 w-4 text-primary" /></div>
          <div className="flex-1">
            <p className="font-medium text-sm">{String(a.title ?? "")}</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{String(a.content ?? "")}</p>
            <div className="flex items-center gap-1 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatDate(a.created_at as string)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeacherAnnouncementsPage() {
  const qc = useQueryClient();
  const session = getSession();
  const userId = session?.user.id ?? "";
  const [activeTab, setActiveTab] = useState("general");
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [student, setStudent] = useState<{ user_id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: general = [], isLoading: lg } = useQuery({ queryKey: ["teacher-ann-general"], queryFn: async () => { const d = (await api.get("/teacher/announcements/general")).data; return Array.isArray(d) ? d : []; } });
  const { data: group = [], isLoading: lgroup } = useQuery({ queryKey: ["teacher-ann-group"], queryFn: async () => { const d = (await api.get("/teacher/announcements/teachers")).data; return Array.isArray(d) ? d : []; } });
  const { data: personal = [], isLoading: lpersonal } = useQuery({ queryKey: ["teacher-ann-personal"], queryFn: async () => { const d = (await api.get("/teacher/announcements/personal")).data; return Array.isArray(d) ? d : []; } });

  const { data: lastSeenGeneral = 0 } = useAnnouncementsLastSeen(userId, "general");
  const { data: lastSeenGroup = 0 } = useAnnouncementsLastSeen(userId, "teachers_group");
  const { data: lastSeenPersonal = 0 } = useAnnouncementsLastSeen(userId, "personal");
  const markGeneralSeen = useMarkAnnouncementsSeen(userId, "general");
  const markGroupSeen = useMarkAnnouncementsSeen(userId, "teachers_group");
  const markPersonalSeen = useMarkAnnouncementsSeen(userId, "personal");

  const unreadGeneral = countNewerThan(general, lastSeenGeneral);
  const unreadGroup = countNewerThan(group, lastSeenGroup);
  const unreadPersonal = countNewerThan(personal, lastSeenPersonal);

  useEffect(() => {
    if (activeTab === "general") markGeneralSeen(Date.now());
    else if (activeTab === "teachers") markGroupSeen(Date.now());
    else if (activeTab === "personal") markPersonalSeen(Date.now());
  }, [activeTab, markGeneralSeen, markGroupSeen, markPersonalSeen]);

  const { data: profile } = useQuery({
    queryKey: ["teacher-me-profile"],
    queryFn: async () => (await api.get("/teacher/me/profile")).data as TeacherProfile,
  });

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { target: "class", targetId: "", title: "", content: "" },
  });
  const target = watch("target");

  function changeTarget(t: Target) {
    setValue("target", t);
    setValue("targetId", "");
    setStudent(null);
  }

  async function onSubmit(data: Form) {
    setCreating(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("content", data.content);
      if (file) form.append("file", file);

      if (data.target === "class") {
        form.append("class_id", data.targetId);
        await api.post(`/announcements/create/class/${data.targetId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      } else if (data.target === "subject") {
        form.append("subject_id", data.targetId);
        await api.post(`/announcements/create/subject/${data.targetId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post(`/announcement/create/student/${data.targetId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      }

      toast.success("Announcement posted");
      qc.invalidateQueries({ queryKey: ["teacher-ann-general"] });
      qc.invalidateQueries({ queryKey: ["teacher-ann-group"] });
      setShowCreate(false);
      reset({ target: "class", targetId: "", title: "", content: "" });
      setFile(null);
      setStudent(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Header
        title="Announcements"
        description="School-wide, teacher group, and your own class/subject/student announcements"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1.5" />New Announcement</Button>}
      />
      <PageShell>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general" className="gap-1.5">General <NotificationBadge count={unreadGeneral} /></TabsTrigger>
            <TabsTrigger value="teachers" className="gap-1.5">Teachers Group <NotificationBadge count={unreadGroup} /></TabsTrigger>
            <TabsTrigger value="personal" className="gap-1.5">Personal <NotificationBadge count={unreadPersonal} /></TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-4"><AnnouncementList data={general} loading={lg} /></TabsContent>
          <TabsContent value="teachers" className="mt-4"><AnnouncementList data={group} loading={lgroup} /></TabsContent>
          <TabsContent value="personal" className="mt-4"><AnnouncementList data={personal} loading={lpersonal} /></TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Send to</Label>
              <Select value={target} onValueChange={(v: unknown) => changeTarget((v as Target) ?? "class")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">My homeroom class</SelectItem>
                  <SelectItem value="subject">My subject</SelectItem>
                  <SelectItem value="student">A specific student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === "class" && (
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Controller
                  control={control}
                  name="targetId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v: unknown) => field.onChange(String(v ?? ""))}>
                      <SelectTrigger><SelectValue placeholder="Select your class" /></SelectTrigger>
                      <SelectContent>
                        {(profile?.classes ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {(profile?.classes ?? []).length === 0 && <p className="text-xs text-muted-foreground">You aren&apos;t a homeroom teacher for any class.</p>}
              </div>
            )}

            {target === "subject" && (
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Controller
                  control={control}
                  name="targetId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v: unknown) => field.onChange(String(v ?? ""))}>
                      <SelectTrigger><SelectValue placeholder="Select your subject" /></SelectTrigger>
                      <SelectContent>
                        {(profile?.subjects ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name} {s.class_name ? `(${s.class_name})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {target === "student" && (
              <div className="space-y-1.5">
                <Label>Student</Label>
                <StudentPicker
                  value={student}
                  onSelect={(s) => { setStudent(s); setValue("targetId", s.user_id); }}
                />
              </div>
            )}
            {errors.targetId && <p className="text-xs text-destructive">{errors.targetId.message}</p>}

            <div className="space-y-1.5"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={3} {...register("content")} />{errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}</div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset({ target: "class", targetId: "", title: "", content: "" }); setFile(null); setStudent(null); }}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Post</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

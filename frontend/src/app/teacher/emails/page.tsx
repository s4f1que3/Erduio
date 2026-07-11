"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentPicker, type StudentOption } from "@/components/student-picker";
import { Loader2, Send } from "lucide-react";

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

const endpointFor: Record<Target, (id: string) => string> = {
  class: (id) => `/emails/create/class/${id}`,
  subject: (id) => `/emails/create/subject/${id}`,
  student: (id) => `/emails/create/user/${id}`,
};

export default function TeacherEmailsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [student, setStudent] = useState<StudentOption | null>(null);
  const [sending, setSending] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["teacher-me-profile"],
    queryFn: async () => (await api.get("/teacher/me/profile")).data as TeacherProfile,
  });

  const classRosters = useQueries({
    queries: (profile?.classes ?? []).map((c) => ({
      queryKey: ["class-roster", c.id],
      queryFn: async () => (await api.get(`/classes/${c.id}/students`)).data as StudentOption[],
    })),
  });
  const subjectRosters = useQueries({
    queries: (profile?.subjects ?? []).map((s) => ({
      queryKey: ["course-roster", s.id],
      queryFn: async () => (await api.get(`/classes/subjects/${s.id}/students`)).data as StudentOption[],
    })),
  });
  const myStudents = useMemo(() => {
    const map = new Map<string, StudentOption>();
    for (const q of [...classRosters, ...subjectRosters]) {
      for (const s of q.data ?? []) map.set(s.id, s);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classRosters, subjectRosters]);

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
    setSending(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      form.append("content", data.content);
      if (file) form.append("file", file);

      await api.post(endpointFor[data.target](data.targetId), form, { headers: { "Content-Type": "multipart/form-data" } });

      toast.success("Email sent");
      reset({ target: "class", targetId: "", title: "", content: "" });
      setFile(null);
      setStudent(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Header title="Emails" description="Send an email to your class, your subject, or a specific student" />
      <PageShell>
        <Section>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
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
                  students={myStudents}
                  value={student}
                  onSelect={(s) => { setStudent(s); setValue("targetId", s.id); }}
                />
              </div>
            )}
            {errors.targetId && <p className="text-xs text-destructive">{errors.targetId.message}</p>}

            <div className="space-y-1.5"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={5} {...register("content")} />{errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}</div>
            <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>

            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Send Email
            </Button>
          </form>
        </Section>
      </PageShell>
    </>
  );
}

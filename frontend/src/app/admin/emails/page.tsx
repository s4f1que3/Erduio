"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentPicker, type StudentOption } from "@/components/student-picker";
import { Loader2, Send, Paperclip, X } from "lucide-react";

type Target = "general" | "class" | "group" | "subject" | "student";

const schema = z.object({ title: z.string().min(1), content: z.string().min(1) });
type Form = z.infer<typeof schema>;

function buildFormData(data: Record<string, string>, file?: File | null) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  if (file) fd.append("file", file);
  return fd;
}

export default function AdminEmailsPage() {
  const [target, setTarget] = useState<Target>("general");
  const [classId, setClassId] = useState("");
  const [groupTarget, setGroupTarget] = useState("");
  const [subjectClassId, setSubjectClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [student, setStudent] = useState<StudentOption | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const { data: classSubjects = [] } = useQuery({
    queryKey: ["class-subjects", subjectClassId],
    queryFn: async () => (await api.get(`/classes/${subjectClassId}/subjects`)).data ?? [],
    enabled: !!subjectClassId,
  });
  const { data: allStudents = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data as StudentOption[],
  });

  const endpointFor: Record<Target, string> = {
    general: "/emails/general/create",
    class: `/emails/create/class/${classId}`,
    group: `/emails/create/group/${groupTarget}`,
    subject: `/emails/create/subject/${subjectId}`,
    student: `/emails/create/user/${student?.id ?? ""}`,
  };

  const sendEmail = useMutation({
    mutationFn: (d: Form) => api.post(endpointFor[target], buildFormData({ title: d.title, content: d.content }, file), { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => { toast.success("Email sent"); handleReset(); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function changeTarget(t: Target) {
    setTarget(t);
    setClassId("");
    setGroupTarget("");
    setSubjectClassId("");
    setSubjectId("");
    setStudent(null);
  }

  function handleReset() {
    reset();
    setFile(null);
    changeTarget("general");
  }

  const canSubmit = () => {
    if (target === "class") return !!classId;
    if (target === "group") return !!groupTarget;
    if (target === "subject") return !!subjectId;
    if (target === "student") return !!student;
    return true;
  };

  return (
    <>
      <Header title="Emails" description="Send an email to the whole school, a class, a group, a subject, or a specific student" />
      <PageShell>
        <Section>
          <form onSubmit={handleSubmit((d) => sendEmail.mutate(d))} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <Label>Send to</Label>
              <Select value={target} onValueChange={(v: unknown) => changeTarget((v as Target) ?? "general")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Whole school</SelectItem>
                  <SelectItem value="class">A class</SelectItem>
                  <SelectItem value="group">A group</SelectItem>
                  <SelectItem value="subject">A subject</SelectItem>
                  <SelectItem value="student">A specific student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === "class" && (
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={classId} onValueChange={(v: unknown) => setClassId(String(v ?? ""))}>
                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  <SelectContent>
                    {(classes as { id: string; name: string }[]).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {target === "group" && (
              <div className="space-y-1.5">
                <Label>Group</Label>
                <Select value={groupTarget} onValueChange={(v: unknown) => setGroupTarget(String(v ?? ""))}>
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

            {target === "subject" && (
              <>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select value={subjectClassId} onValueChange={(v: unknown) => { setSubjectClassId(String(v ?? "")); setSubjectId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                    <SelectContent>
                      {(classes as { id: string; name: string }[]).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Select value={subjectId} onValueChange={(v: unknown) => setSubjectId(String(v ?? ""))} disabled={!subjectClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder={subjectClassId ? "Select a subject" : "Select a class first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(classSubjects as { id: string; name: string }[]).map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {target === "student" && (
              <div className="space-y-1.5">
                <Label>Student</Label>
                <StudentPicker
                  students={allStudents as StudentOption[]}
                  value={student}
                  onSelect={setStudent}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Email title..." {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea rows={6} placeholder="Write your email..." {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Attachment <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted cursor-pointer transition-colors text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{file ? file.name : "Choose file..."}</span>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                    className="ml-auto flex-shrink-0 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <Button type="submit" disabled={sendEmail.isPending || !canSubmit()}>
              {sendEmail.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Send Email
            </Button>
          </form>
        </Section>
      </PageShell>
    </>
  );
}

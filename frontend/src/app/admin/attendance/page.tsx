"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityAvatar } from "@/components/profile/entity-avatar";
import { ClipboardCheck, Loader2 } from "lucide-react";

type Roster = { id: string; name: string; pfp_path?: string | null }[];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [takeClassOpen, setTakeClassOpen] = useState(false);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/classes")).data ?? [],
  });
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data ?? [],
  });

  const attendanceKey = ["attendance-class", selectedClass, selectedDate];
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: attendanceKey,
    queryFn: async () => {
      if (!selectedClass) return [];
      const url = selectedDate
        ? `/attendance/all/class/${selectedClass}/${selectedDate}`
        : `/attendance/all/class/${selectedClass}`;
      return (await api.get(url)).data ?? [];
    },
    enabled: !!selectedClass,
  });

  const classRoster: Roster = (students as Record<string, unknown>[])
    .filter((s) => s.class_id === selectedClass && s.status === "active")
    .map((s) => ({ id: String(s.id), name: String(s.name ?? ""), pfp_path: s.pfp_path as string | null }));

  return (
    <>
      <Header title="Attendance" description="View class and subject attendance records" />
      <PageShell>
        <Tabs defaultValue="class">
          <TabsList>
            <TabsTrigger value="class">Class Attendance</TabsTrigger>
            <TabsTrigger value="subject">Subject Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="class" className="mt-4">
            <Section>
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select onValueChange={(v: unknown) => setSelectedClass(String(v ?? ""))}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {(classes as Record<string, unknown>[]).map((c) => (
                        <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date (optional)</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-44" />
                </div>
                {selectedDate && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate("")}>Clear Date</Button>
                )}
                <Button size="sm" disabled={!selectedClass} onClick={() => setTakeClassOpen(true)}>
                  <ClipboardCheck className="h-4 w-4 mr-1.5" />Take Attendance
                </Button>
              </div>
            </Section>

            <DataTable
              loading={isLoading && !!selectedClass}
              columns={[
                { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
                { key: "present", label: "Present", render: (r) => (
                  <Badge variant={r.present ? "default" : "destructive"}>
                    {r.present ? "Present" : "Absent"}
                  </Badge>
                )},
              ]}
              data={attendance}
            />
            {!selectedClass && (
              <p className="text-center text-muted-foreground text-sm py-8">Select a class to view attendance</p>
            )}
          </TabsContent>

          <TabsContent value="subject" className="mt-4">
            <SubjectAttendanceView classes={classes as Record<string, unknown>[]} />
          </TabsContent>
        </Tabs>
      </PageShell>

      <TakeAttendanceDialog
        open={takeClassOpen}
        onOpenChange={setTakeClassOpen}
        roster={classRoster}
        submitUrl={`/attendance/take/class/${selectedClass}`}
        invalidateKey={["attendance-class"]}
      />
    </>
  );
}

function SubjectAttendanceView({ classes }: { classes: Record<string, unknown>[] }) {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [takeOpen, setTakeOpen] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => (await api.get(`/classes/${classId}/subjects`)).data ?? [],
    enabled: !!classId,
  });

  const { data: roster = [] } = useQuery({
    queryKey: ["subject-students", subjectId],
    queryFn: async () => (await api.get(`/classes/subjects/${subjectId}/students`)).data ?? [],
    enabled: !!subjectId,
  });

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance-subject", subjectId, date],
    queryFn: async () => {
      if (!subjectId) return [];
      const url = date
        ? `/attendance/all/subject/${subjectId}/${date}`
        : `/attendance/all/subject/${subjectId}`;
      return (await api.get(url)).data ?? [];
    },
    enabled: !!subjectId,
  });

  return (
    <Section>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1.5">
          <Label>Class</Label>
          <Select onValueChange={(v: unknown) => { setClassId(String(v ?? "")); setSubjectId(""); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>{String(c.name ?? "")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={(v: unknown) => setSubjectId(String(v ?? ""))} disabled={!classId}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {(subjects as Record<string, unknown>[]).map((s) => (
                <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Date (optional)</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
        <Button size="sm" disabled={!subjectId} onClick={() => setTakeOpen(true)}>
          <ClipboardCheck className="h-4 w-4 mr-1.5" />Take Attendance
        </Button>
      </div>
      <DataTable
        loading={isLoading && !!subjectId}
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          { key: "present", label: "Present", render: (r) => <Badge variant={r.present ? "default" : "destructive"}>{r.present ? "Present" : "Absent"}</Badge> },
        ]}
        data={attendance}
      />
      {!subjectId && <p className="text-center text-muted-foreground text-sm py-8">Select a class and subject to view attendance</p>}

      <TakeAttendanceDialog
        open={takeOpen}
        onOpenChange={setTakeOpen}
        roster={(roster as Record<string, unknown>[]).map((s) => ({ id: String(s.id), name: String(s.name ?? ""), pfp_path: s.pfp_path as string | null }))}
        submitUrl={`/attendance/take/subject/${subjectId}`}
        invalidateKey={["attendance-subject"]}
      />
    </Section>
  );
}

function TakeAttendanceDialog({
  open, onOpenChange, roster, submitUrl, invalidateKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roster: Roster;
  submitUrl: string;
  invalidateKey: string[];
}) {
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [present, setPresent] = useState<Record<string, boolean>>({});

  const togglePresent = (id: string, value: boolean) => setPresent((p) => ({ ...p, [id]: value }));
  const isPresent = (id: string) => present[id] ?? true;

  const submit = useMutation({
    mutationFn: () => api.post(submitUrl, {
      date,
      records: roster.map((s) => ({ student_id: s.id, present: isPresent(s.id) })),
    }),
    onSuccess: () => {
      toast.success("Attendance recorded");
      qc.invalidateQueries({ queryKey: invalidateKey });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Take Attendance</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No students found</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto border border-border rounded-lg p-2">
              {roster.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <EntityAvatar
                    id={s.id}
                    pfpPath={s.pfp_path}
                    name={s.name}
                    endpoint="/student/profile-pic"
                    className="h-7 w-7"
                    fallbackClassName="text-xs"
                  />
                  <span className="flex-1 text-sm">{s.name}</span>
                  <Checkbox checked={isPresent(s.id)} onCheckedChange={(v) => togglePresent(s.id, !!v)} />
                  <span className="text-xs text-muted-foreground w-14">{isPresent(s.id) ? "Present" : "Absent"}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={roster.length === 0 || submit.isPending} onClick={() => submit.mutate()}>
            {submit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

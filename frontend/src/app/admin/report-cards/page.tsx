"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Upload, Send, Search, Loader2, FileText, Download } from "lucide-react";

type Student = { id: string; user_id: string; name: string; class_id: string | null };

export default function ReportCardsPage() {
  const qc = useQueryClient();
  const [nameInput, setNameInput] = useState("");
  const [searchedName, setSearchedName] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const searchedId = selectedStudent?.user_id ?? "";
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function viewReportCard(reportId: string) {
    setViewingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${searchedId}/${reportId}/`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingId(null);
    }
  }

  async function downloadReportCard(reportId: string) {
    setDownloadingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${searchedId}/${reportId}/`)).data;
      await downloadFromUrl(url, `report-card-${reportId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  const { data: allStudents = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/student")).data ?? [],
  });

  const filteredStudents = searchedName
    ? (allStudents as Student[]).filter((s) => s.name?.toLowerCase().includes(searchedName.toLowerCase()))
    : [];

  const handleSearch = () => {
    setSearchedName(nameInput);
    setSelectedStudent(null);
  };

  const { data: reportCards = [], isLoading } = useQuery({
    queryKey: ["report-cards", searchedId],
    queryFn: async () => {
      if (!searchedId) return [];
      return (await api.get(`/report-cards/${searchedId}/all`)).data ?? [];
    },
    enabled: !!searchedId,
  });

  const sendMutation = useMutation({
    mutationFn: ({ sid, term }: { sid: string; term: string }) =>
      api.post(`/report-card/send/student/${sid}/term/${term}`),
    onSuccess: () => toast.success("Report card sent to student"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  async function handleUpload() {
    const classId = selectedStudent?.class_id;
    if (!uploadFile || !uploadTitle || !searchedId || !classId) {
      toast.error(classId ? "Please fill in all fields" : "This student isn't assigned to a class");
      return;
    }
    setUploadLoading(true);
    try {
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("title", uploadTitle);
      await api.post(`/report-cards/upload/class/${classId}/student/${searchedId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report card uploaded");
      qc.invalidateQueries({ queryKey: ["report-cards", searchedId] });
      setShowUpload(false);
      setUploadFile(null);
      setUploadTitle("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <>
      <Header
        title="Report Cards"
        description="Upload and manage student report cards"
        actions={
          <Button size="sm" onClick={() => setShowUpload(true)} disabled={!searchedId}>
            <Upload className="h-4 w-4 mr-1.5" />
            Upload PDF
          </Button>
        }
      />
      <PageShell>
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
                      key={s.user_id}
                      onClick={() => setSelectedStudent(s)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        selectedStudent?.user_id === s.user_id
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
          loading={isLoading && !!searchedId}
          columns={[
            { key: "title", label: "Title", render: (r) => <span className="font-medium">{String(r.title ?? "—")}</span> },
            { key: "created_at", label: "Uploaded", render: (r) => formatDate(r.created_at as string) },
            { key: "file_path", label: "File", render: (r) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={viewingId === String(r.id)}
                  onClick={() => viewReportCard(String(r.id))}
                  className="flex items-center gap-1.5 text-primary hover:underline text-sm disabled:opacity-50"
                >
                  <FileText className="h-3.5 w-3.5" />{viewingId === String(r.id) ? "Loading..." : "View"}
                </button>
                <button
                  type="button"
                  disabled={downloadingId === String(r.id)}
                  onClick={() => downloadReportCard(String(r.id))}
                  className="flex items-center gap-1.5 text-primary hover:underline text-sm disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />{downloadingId === String(r.id) ? "Loading..." : "Download"}
                </button>
              </div>
            )},
            {
              key: "actions", label: "", className: "w-24",
              render: (r) => (
                <Button variant="outline" size="sm" onClick={() => sendMutation.mutate({ sid: searchedId, term: String(r.term_id ?? "") })}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />Send
                </Button>
              ),
            },
          ]}
          data={reportCards}
        />
        {!searchedId && (
          <p className="text-center text-muted-foreground text-sm py-8">Search for a student to view their report cards</p>
        )}
      </PageShell>

      <Dialog open={showUpload} onOpenChange={(open) => { setShowUpload(open); if (!open) { setUploadFile(null); setUploadTitle(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Report Card PDF for {selectedStudent?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Form 1 Term 2"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tip: include the class and term so students and parents can tell report cards apart.</p>
            </div>
            <div className="space-y-1.5">
              <Label>PDF File</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploadLoading || !uploadFile || !uploadTitle}>
                {uploadLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Upload
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

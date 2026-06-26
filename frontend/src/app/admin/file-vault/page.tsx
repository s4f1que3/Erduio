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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Upload, Trash2, Loader2, FolderOpen, FileText, ExternalLink } from "lucide-react";

const schema = z.object({ title: z.string().min(1), description: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function FileVaultPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["file-vault"],
    queryFn: async () => (await api.get("/file-vault/all")).data ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/file-vault/delete/${id}`),
    onSuccess: () => { toast.success("File deleted"); qc.invalidateQueries({ queryKey: ["file-vault"] }); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  async function onSubmit(data: Form) {
    if (!file) { toast.error("Please select a file"); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("title", data.title);
      if (data.description) form.append("description", data.description);
      form.append("file", file);
      await api.post("/file-vault/create", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("File uploaded");
      qc.invalidateQueries({ queryKey: ["file-vault"] });
      setShowCreate(false);
      reset();
      setFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Header
        title="File Vault"
        description="Store and share important school documents"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Upload className="h-4 w-4 mr-1.5" />Upload File</Button>}
      />
      <PageShell>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(files as Record<string, unknown>[]).map((f) => (
              <div key={String(f.id)} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{String(f.title ?? "")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(f.created_at as string)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => {
                      const url = (await api.get(`/file-vault/view/${f.id}`)).data
                      window.open(url, '_blank')
                    }}><ExternalLink className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(String(f.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {!!f.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{String(f.description)}</p>}
              </div>
            ))}
            {files.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FolderOpen className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No files in vault</p>
              </div>
            )}
          </div>
        )}
      </PageShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload to File Vault</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea rows={2} {...register("description")} /></div>
            <div className="space-y-1.5"><Label>File</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); setFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

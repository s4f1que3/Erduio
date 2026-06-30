"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, Search, School as SchoolIcon } from "lucide-react";

type School = Record<string, unknown>;

const createSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().email().max(75),
  phone: z.string().min(1).max(20),
  address: z.string().min(1).max(130),
});
type CreateForm = z.infer<typeof createSchema>;

export default function OwnerSchoolsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["owner-schools"],
    queryFn: async () => (await api.get("/owner/schools")).data as School[],
  });

  const filtered = schools.filter((s) =>
    search
      ? String(s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        String(s.email ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => {
      const form = new FormData();
      form.append("name", data.name);
      form.append("email", data.email);
      form.append("phone", data.phone);
      form.append("address", data.address);
      if (logoFile) form.append("logo", logoFile);
      return api.post("/owner/create/school", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("School created");
      qc.invalidateQueries({ queryKey: ["owner-schools"] });
      setShowCreate(false);
      reset();
      setLogoFile(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Header
        title="Schools"
        description="All schools on the platform"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add School
          </Button>
        }
      />
      <PageShell>
        <Section>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </Section>

        <DataTable
          loading={isLoading}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      <SchoolIcon className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{String(row.name ?? "")}</span>
                </div>
              ),
            },
            { key: "email", label: "Email" },
            { key: "phone_number", label: "Phone" },
            { key: "address", label: "Address" },
            {
              key: "created_at",
              label: "Created",
              render: (row) => formatDate(row.created_at as string),
            },
          ]}
          data={filtered}
          onRowClick={(row) => router.push(`/owner/schools/${row.id}`)}
        />
      </PageShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add School</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Riverside High School" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="contact@school.edu" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0100" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="123 Main St" {...register("address")} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Logo (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); reset(); setLogoFile(null); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create School
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

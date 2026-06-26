"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getErrorMessage, downloadFromUrl } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { newestTimestamp, useMarkSeen } from "@/hooks/use-last-seen";
import { Header } from "@/components/layout/header";
import { PageShell, Section } from "@/components/ui/page-shell";
import { formatDate } from "@/lib/utils";
import { Award, FileText, ExternalLink, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colorByIndex } from "@/lib/subject-style";

export default function StudentReportCardsPage() {
  const session = getSession();
  const authId = session?.user.id ?? "";
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: profile } = useQuery({
    queryKey: ["student-me-profile"],
    queryFn: async () => (await api.get("/student/me/profile")).data as { id: string },
    enabled: !!authId,
  });
  const studentId = profile?.id ?? "";

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["student-report-cards", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      return (await api.get(`/report-cards/${studentId}/all`)).data ?? [];
    },
    enabled: !!studentId,
  });

  const markSeen = useMarkSeen("report-cards", authId, "self");
  useEffect(() => {
    if (cards.length > 0) markSeen(newestTimestamp(cards));
  }, [cards, markSeen]);

  async function viewReportCard(reportId: string) {
    setViewingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${studentId}/${reportId}/`)).data;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setViewingId(null);
    }
  }

  async function downloadReportCard(reportId: string, label: string) {
    setDownloadingId(reportId);
    try {
      const url = (await api.get(`/report-cards/${studentId}/${reportId}/`)).data;
      await downloadFromUrl(url, `report-card-${label}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      <Header title="Report Cards" description="Your academic report cards" />
      <PageShell>
        {!mounted || isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cards as Record<string, unknown>[]).map((card, i) => {
              const color = colorByIndex(i);
              return (
              <div key={String(card.id)} className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${color.tintBg} ${color.tintBorder}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`rounded-lg p-2.5 ${color.solid}`}>
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{String(card.title ?? "Report Card")}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Issued: {formatDate(card.created_at as string)}
                </p>
                {!!card.file_path && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      disabled={viewingId === String(card.id)}
                      onClick={() => viewReportCard(String(card.id))}
                    >
                      {viewingId === String(card.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                      View
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === String(card.id)}
                      onClick={() => downloadReportCard(String(card.id), String(card.title ?? card.id))}
                    >
                      {downloadingId === String(card.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                )}
              </div>
              );
            })}
            {cards.length === 0 && (
              <div className="col-span-3 flex flex-col items-center py-16 text-muted-foreground">
                <Award className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No report cards yet</p>
              </div>
            )}
          </div>
        )}
      </PageShell>
    </>
  );
}

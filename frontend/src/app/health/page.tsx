"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type ServiceResult = {
  status: string;
  checks?: Record<string, boolean>;
  timestamp?: string;
  details?: Record<string, { status: string }>;
};

const SERVICE_LABELS = ["Supabase", "NestJS", "Vercel"];

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
      <CheckCircle2 className="h-4 w-4" />
      Operational
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-sm font-medium text-destructive">
      <XCircle className="h-4 w-4" />
      Degraded
    </span>
  );
}

function CheckRow({ label, passing }: { label: string; passing: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground capitalize">
        {label.replace(/_/g, " ")}
      </span>
      {passing ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
    </div>
  );
}

function ServiceCard({ label, data }: { label: string; data: ServiceResult }) {
  const isOk = data.status === "ok" || data.status === "Running";

  const checks: Record<string, boolean> = {};
  if (data.checks) {
    Object.assign(checks, data.checks);
  } else if (data.details) {
    for (const [key, val] of Object.entries(data.details)) {
      checks[key] = val.status === "up";
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        <StatusBadge ok={isOk} />
      </div>
      {Object.keys(checks).length > 0 && (
        <div>
          {Object.entries(checks).map(([key, passing]) => (
            <CheckRow key={key} label={key} passing={passing} />
          ))}
        </div>
      )}
      {data.timestamp && (
        <p className="text-xs text-muted-foreground mt-3">
          Checked at {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

export default function HealthPage() {
  const [results, setResults] = useState<ServiceResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ServiceResult[]>("/health");
      setResults(res.data);
      setLastRefreshed(new Date());
    } catch {
      setError("Could not reach the health endpoint.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const allOk = results?.every((r) => r.status === "ok" || r.status === "Running");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">System Health</h1>
              {lastRefreshed && (
                <p className="text-xs text-muted-foreground">
                  Last refreshed {lastRefreshed.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {results && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            {allOk ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground">
              {allOk
                ? "All systems operational"
                : "One or more systems are degraded"}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !results && (
          <div className="grid gap-4">
            {SERVICE_LABELS.map((label) => (
              <div
                key={label}
                className="bg-card border border-border rounded-2xl p-6 h-28 animate-pulse"
              />
            ))}
          </div>
        )}

        {results && (
          <div className="grid gap-4">
            {results.map((data, i) => (
              <ServiceCard
                key={SERVICE_LABELS[i]}
                label={SERVICE_LABELS[i]}
                data={data}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface StatusResult {
  title: string;
  district: string;
  state: string;
  stage: string;
  stageOrder: number;
  totalAreaAcres: string;
}

export function PublicStatusCheck() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/public-status?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Not found");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-hairline bg-paper-raised rounded-[var(--radius-md)] p-5">
      <h3 className="font-medium text-sm mb-1">Check project status</h3>
      <p className="text-xs text-ink-muted mb-3">
        No login required — enter a project ID or a parcel survey number.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input flex-1 font-mono-data text-sm"
          placeholder="Project ID or survey number"
          required
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? "…" : "Check"}
        </Button>
      </form>
      {error && <p className="text-xs text-[var(--color-danger)] mt-3">{error}</p>}
      {result && (
        <div className="mt-4 text-sm border-t border-hairline pt-3 flex flex-col gap-1">
          <div className="font-medium">{result.title}</div>
          <div className="text-ink-muted text-xs">{result.district}, {result.state}</div>
          <div className="text-xs mt-1">
            Stage {result.stageOrder}: <span className="font-medium">{result.stage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

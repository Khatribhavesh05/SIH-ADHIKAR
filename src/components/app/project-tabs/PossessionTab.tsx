"use client";

import { useState } from "react";
import { formatDate } from "@/lib/domain/format";
import { updatePossessionDate } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { Home, Calendar, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function PossessionTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const canEdit = userRole === "COLLECTOR";
  const possession = project.possession;

  const [dateStr, setDateStr] = useState<string>(
    possession?.possessionDate ? new Date(possession.possessionDate).toISOString().split("T")[0] : ""
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dateStr || !canEdit) return;
    setLoading(true);
    try {
      await updatePossessionDate(project.id, dateStr);
      showToast("success", "Possession date recorded.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to record possession date.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate 5-year lapse countdown
  const awardDate = project.award?.awardDate ? new Date(project.award.awardDate) : null;
  const lapseDeadline = possession?.lapseRiskDeadline || (awardDate ? new Date(awardDate.getFullYear() + 5, awardDate.getMonth(), awardDate.getDate()) : null);

  const daysLeftLapse = lapseDeadline
    ? Math.ceil((new Date(lapseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 8 — Possession &amp; Section 24(2) Lapse Tracking</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Record of physical possession date and mandatory 5-year lapse risk monitoring.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Possession Date Recorder */}
        <form onSubmit={handleSave} className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-4">
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <Home className="w-4 h-4 text-brand" /> Physical Possession Record
          </h3>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Possession Taken Date</span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={!canEdit}
              className="input text-xs disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-paper"
              required
            />
          </label>

          {canEdit && (
            <div className="flex flex-col items-start gap-2">
              <Button type="submit" disabled={loading || !dateStr} className="text-xs px-4 py-2 self-start">
                {loading ? "Recording..." : "Record Possession Date"}
              </Button>
              <ToastBanner toast={toast} />
            </div>
          )}
        </form>

        {/* 5-Year Lapse Risk Countdown Card */}
        <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-3">
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <Clock className="w-4 h-4 text-saffron" /> Section 24(2) 5-Year Lapse Deadline
          </h3>

          <p className="text-xs text-ink-muted leading-relaxed">
            Statutory Rule: If physical possession is not taken and majority compensation is not paid within 5 years of the Award, land acquisition proceedings lapse automatically.
          </p>

          <div className="mt-2 p-3 rounded border bg-paper-raised flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">5-Year Statutory Lapse Deadline:</span>
              <span className="font-mono-data font-bold">{lapseDeadline ? formatDate(lapseDeadline) : "N/A (Award Pending)"}</span>
            </div>

            {daysLeftLapse !== null && (
              <div className="flex justify-between mt-1">
                <span className="text-ink-muted">Countdown:</span>
                <span className={`font-mono-data font-bold ${daysLeftLapse < 180 ? "text-danger" : "text-success"}`}>
                  {daysLeftLapse > 0 ? `${daysLeftLapse} days remaining` : "EXPIRED / LAPSED"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

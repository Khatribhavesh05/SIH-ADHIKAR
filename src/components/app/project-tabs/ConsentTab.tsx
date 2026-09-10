"use client";

import { useState } from "react";
import { incrementConsent } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function ConsentTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);

  const consentRecord = project.consentRecord;
  if (!consentRecord) {
    return (
      <div className="text-center py-8 text-ink-muted text-sm border border-dashed border-hairline rounded-md">
        Consent tracking is not required for Government projects. (Applies only to Private and PPP projects under Section 2(2)).
      </div>
    );
  }

  const total = consentRecord.affectedFamiliesTotal || 1;
  const collected = consentRecord.consentsCollected || 0;
  const threshold = Number(consentRecord.thresholdPercent);
  const currentPercent = Math.min(100, Math.round((collected / total) * 100));
  const isSatisfied = currentPercent >= threshold;

  async function handleAddConsent(count: number = 1) {
    setLoading(true);
    await incrementConsent(project.id, count);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 4 — Landowner Consent Tracking ({project.projectType})</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Section 2(2) mandatory consent requirement ({threshold}% threshold required for {project.projectType} projects).
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Total Landowner Families</div>
          <div className="font-bold text-xl text-brand-dark mt-1 font-mono-data">{total}</div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Consents Recorded</div>
          <div className="font-bold text-xl text-brand mt-1 font-mono-data">{collected}</div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Statutory Threshold</div>
          <div className="font-bold text-xl text-saffron mt-1 font-mono-data">{threshold}% Required</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-ink">Consent Progress ({currentPercent}%)</span>
          <span className={isSatisfied ? "text-success font-mono-data" : "text-warning font-mono-data"}>
            {collected} / {total} families (Target: {Math.ceil((threshold / 100) * total)})
          </span>
        </div>

        <div className="w-full bg-paper-raised border border-hairline h-4 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSatisfied ? "bg-success" : "bg-saffron"
            }`}
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        <div className={`mt-2 p-3 rounded-md border text-xs flex items-center gap-2 ${
          isSatisfied ? "bg-success-tint border-success/30 text-success" : "bg-warning-tint border-warning/30 text-warning"
        }`}>
          {isSatisfied ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>
            {isSatisfied
              ? `Statutory threshold of ${threshold}% fulfilled. Consent stage complete.`
              : `Additional ${Math.ceil((threshold / 100) * total) - collected} consents required to meet statutory threshold.`}
          </span>
        </div>
      </div>

      {userRole === "REQUIRING_BODY" && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleAddConsent(1)}
            disabled={loading || collected >= total}
            variant="secondary"
            className="text-xs px-3 py-1.5 min-h-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add 1 Consent
          </Button>

          <Button
            onClick={() => handleAddConsent(5)}
            disabled={loading || collected >= total}
            variant="secondary"
            className="text-xs px-3 py-1.5 min-h-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add 5 Consents
          </Button>

          <Button
            onClick={() => handleAddConsent(Math.ceil((threshold / 100) * total) - collected)}
            disabled={loading || isSatisfied}
            variant="primary"
            className="text-xs px-3 py-1.5 min-h-0"
          >
            Auto-Complete to {threshold}% Threshold
          </Button>
        </div>
      )}
    </div>
  );
}

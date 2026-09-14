"use client";

import { useState } from "react";
import { updateExpertReview } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { CheckSquare, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function ExpertReviewTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const canEdit = userRole === "COLLECTOR";

  const siaRecord = project.siaRecords?.[0] || null;

  const [outcome, setOutcome] = useState<string>(siaRecord?.expertGroupOutcome || "PENDING");
  const [justification, setJustification] = useState<string>(siaRecord?.expertGroupJustification || "");
  const [expertGroup, setExpertGroup] = useState<string>(siaRecord?.expertGroupName || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("expertGroupOutcome", outcome);
      formData.append("expertGroupJustification", justification);
      formData.append("expertGroup", expertGroup);

      await updateExpertReview(project.id, formData);
      showToast("success", "Expert Group decision recorded.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to record decision.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 3 — Independent Expert Group Appraisal</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Section 7 evaluation by independent multi-disciplinary Expert Group.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Expert Group Name / Authority</span>
            <input
              type="text"
              value={expertGroup}
              onChange={(e) => setExpertGroup(e.target.value)}
              disabled={!canEdit}
              className="input text-xs disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-paper"
              placeholder="e.g. State Independent Expert Group"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Appraisal Outcome</span>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              disabled={!canEdit}
              className="input text-xs font-semibold disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-paper"
            >
              <option value="PENDING" disabled>Select outcome…</option>
              <option value="APPROVED">APPROVED — Proceed with Acquisition</option>
              <option value="MODIFIED">MODIFIED — Requires Project Extent Reduction</option>
              <option value="REJECTED">REJECTED — Acquisition Does Not Meet Criteria</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink">Expert Group Justification &amp; Recommendations</span>
          <textarea
            rows={4}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={!canEdit}
            className="input text-xs disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-paper"
            placeholder="Document the formal reasoning, public purpose verification, and social impact mitigation measures required..."
            required
          />
        </label>

        <div className={`p-4 rounded-md border text-xs flex items-center gap-3 ${
          outcome === "APPROVED"
            ? "bg-success-tint border-success/30 text-success"
            : outcome === "MODIFIED"
            ? "bg-warning-tint border-warning/30 text-warning"
            : outcome === "REJECTED"
            ? "bg-danger-tint border-danger/30 text-danger"
            : "bg-paper border-hairline-strong text-ink-muted"
        }`}>
          {outcome === "APPROVED" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {outcome === "MODIFIED" && <AlertCircle className="w-5 h-5 shrink-0" />}
          {outcome === "REJECTED" && <XCircle className="w-5 h-5 shrink-0" />}
          {outcome === "PENDING" && <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <div className="font-semibold text-xs">Status: {outcome}</div>
            <div className="opacity-90 mt-0.5">
              {outcome === "APPROVED" && "Appraisal complete. Project is cleared to move to Consent / Declaration."}
              {outcome === "MODIFIED" && "Appraisal approved conditionally with required boundary adjustments."}
              {outcome === "REJECTED" && "Acquisition proposal rejected by Expert Group. Process terminated under Section 7."}
              {outcome === "PENDING" && "No Expert Group decision recorded yet for this project."}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center justify-end gap-3">
            <ToastBanner toast={toast} />
            <Button type="submit" disabled={loading} className="text-xs px-5 py-2">
              {loading ? "Recording..." : "Record Expert Group Decision"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

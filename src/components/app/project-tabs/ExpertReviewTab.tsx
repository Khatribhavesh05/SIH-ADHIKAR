"use client";

import { useState } from "react";
import { updateExpertReview } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { CheckSquare, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function ExpertReviewTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);

  const siaRecord = project.siaRecords?.[0] || null;

  const [outcome, setOutcome] = useState<string>(siaRecord?.expertGroupOutcome || "APPROVED");
  const [justification, setJustification] = useState<string>(
    siaRecord?.expertGroupJustification || "The independent Expert Group evaluated the SIA report and concluded that the project serves a legitimate public purpose with minimal displacement."
  );
  const [expertGroup, setExpertGroup] = useState<string>("State Independent Expert Group (Chaired by Prof. R. K. Varma)");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("expertGroupOutcome", outcome);
    formData.append("expertGroupJustification", justification);
    formData.append("expertGroup", expertGroup);

    await updateExpertReview(project.id, formData);
    setLoading(false);
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
              className="input text-xs"
              placeholder="e.g. State Independent Expert Group"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink">Appraisal Outcome</span>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="input text-xs font-semibold"
            >
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
            className="input text-xs"
            placeholder="Document the formal reasoning, public purpose verification, and social impact mitigation measures required..."
            required
          />
        </label>

        <div className={`p-4 rounded-md border text-xs flex items-center gap-3 ${
          outcome === "APPROVED"
            ? "bg-success-tint border-success/30 text-success"
            : outcome === "MODIFIED"
            ? "bg-warning-tint border-warning/30 text-warning"
            : "bg-danger-tint border-danger/30 text-danger"
        }`}>
          {outcome === "APPROVED" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {outcome === "MODIFIED" && <AlertCircle className="w-5 h-5 shrink-0" />}
          {outcome === "REJECTED" && <XCircle className="w-5 h-5 shrink-0" />}
          <div>
            <div className="font-semibold text-xs">Status: {outcome}</div>
            <div className="opacity-90 mt-0.5">
              {outcome === "APPROVED" && "Appraisal complete. Project is cleared to move to Consent / Declaration."}
              {outcome === "MODIFIED" && "Appraisal approved conditionally with required boundary adjustments."}
              {outcome === "REJECTED" && "Acquisition proposal rejected by Expert Group. Process terminated under Section 7."}
            </div>
          </div>
        </div>

        {userRole === "COLLECTOR" && (
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="text-xs px-5 py-2">
              {loading ? "Recording..." : "Record Expert Group Decision"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

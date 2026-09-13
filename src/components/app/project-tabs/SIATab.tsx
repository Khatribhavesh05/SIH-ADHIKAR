"use client";

import { useState } from "react";
import { updateSIAData } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { Users, FileCheck, AlertTriangle, Check } from "lucide-react";
import type { Role } from "@/lib/domain/roles";
import { fileDisplayName } from "@/lib/files";

export function SIATab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();
  const canEdit = userRole === "COLLECTOR";

  const siaRecord = project.siaRecords?.[0] || null;

  const [summary, setSummary] = useState(siaRecord?.publicHearingSummary || "");
  const [isMultiCrop, setIsMultiCrop] = useState(siaRecord?.isMultiCropFlagged || false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("publicHearingSummary", summary);
      formData.set("isMultiCropFlagged", String(isMultiCrop));

      await updateSIAData(project.id, formData);
      showToast("success", "SIA record saved.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save SIA record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 2 — Social Impact Assessment (SIA)</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Sections 4–9 mandatory Social Impact Study, public hearings, and multi-crop land safeguards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-md border border-hairline bg-paper flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand" /> SIA Report Document
            </h3>
            <p className="text-xs text-ink-muted">
              Upload signed Social Impact Assessment Report prepared by the designated Agency.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="file"
                name="reportDocument"
                disabled={!canEdit}
                className="text-xs text-ink-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand file:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {siaRecord?.reportDocumentUrl && (
              <a
                href={`/api/files/${project.id}?path=${encodeURIComponent(siaRecord.reportDocumentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-success font-medium flex items-center gap-1 mt-1 hover:underline"
              >
                <Check className="w-3.5 h-3.5" /> Current Report: {fileDisplayName(siaRecord.reportDocumentUrl)}
              </a>
            )}
          </div>

          <div className="p-4 rounded-md border border-hairline bg-paper flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-saffron" /> Multi-Crop Irrigated Land Safeguard
            </h3>
            <p className="text-xs text-ink-muted">
              Section 10 restriction: Multi-crop irrigated land acquisition must be capped and justified.
            </p>
            <label className="flex items-center gap-3 cursor-pointer mt-2 p-2 rounded border border-hairline bg-paper-raised">
              <input
                type="checkbox"
                checked={isMultiCrop}
                onChange={(e) => setIsMultiCrop(e.target.checked)}
                disabled={!canEdit}
                className="w-4 h-4 rounded border-hairline-strong text-brand focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-xs font-medium text-ink">
                Project involves Multi-Crop Irrigated Agricultural Land
              </span>
            </label>
          </div>
        </div>

        {/* Public Hearing Log Table */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-saffron" /> Public Hearing Logs (Section 5)
            </h3>
          </div>

          <div className="text-center py-8 border border-dashed border-hairline-strong rounded-md text-ink-muted text-sm">
            No public hearings recorded yet.
          </div>

          <label className="flex flex-col gap-1 mt-2">
            <span className="text-xs font-medium text-ink">Consolidated Public Hearing Summary</span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={!canEdit}
              className="input w-full text-xs disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-paper"
              placeholder="Enter overall summary of public hearings and Gram Sabha consultations..."
            />
          </label>
        </div>

        {canEdit && (
          <div className="flex items-center justify-end gap-3">
            <ToastBanner toast={toast} />
            <Button type="submit" disabled={loading} className="text-xs px-5 py-2">
              {loading ? "Saving..." : "Save SIA Record & Advance"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

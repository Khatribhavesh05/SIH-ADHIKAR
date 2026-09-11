"use client";

import { useState } from "react";
import { formatDate } from "@/lib/domain/format";
import { submitNotification } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { FileText, Calendar, Upload, CheckCircle2, Clock } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function NotificationTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast, showToast } = useToast();

  const notifications = project.notifications || [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitNotification(project.id, formData);
      showToast("success", "Notification record saved.");
      setShowForm(false);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save notification.");
    } finally {
      setLoading(false);
    }
  }

  const daysLeftObjection = (deadline: Date) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 1 — Gazette &amp; Public Notifications</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Section 11 Preliminary Notification and Section 19 Declaration publishing records.
          </p>
        </div>
        {userRole === "COLLECTOR" && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="secondary"
            className="text-xs px-3 py-1.5 min-h-0"
          >
            {showForm ? "Cancel" : "+ File New Notification"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-md border border-brand/30 bg-brand-tint/30 flex flex-col gap-4 text-sm">
          <h3 className="font-semibold text-brand-dark text-sm">Submit Statutory Notification Record</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Notification Type</span>
              <select name="type" className="input">
                <option value="PRELIMINARY_S11">Preliminary Notification (Section 11)</option>
                <option value="DECLARATION_S19">Declaration Notification (Section 19)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Publication Date</span>
              <input type="date" name="publicationDate" required defaultValue={new Date().toISOString().split("T")[0]} className="input" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Gazette Reference No.</span>
              <input type="text" name="gazetteReference" placeholder="e.g. G.S.R. 412(E)" required className="input" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Newspaper Reference</span>
              <input type="text" name="newspaperReference" placeholder="e.g. Times of India / Dainik Jagran" required className="input" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Objection Window Deadline</span>
              <input
                type="date"
                name="objectionWindowDeadline"
                required
                defaultValue={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className="input"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Notice-Board Proof Upload (Photo / Doc)</span>
              <div className="flex items-center gap-2">
                <input type="file" className="text-xs text-ink-muted file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand file:text-white" />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <ToastBanner toast={toast} />
            <Button type="submit" disabled={loading} className="text-xs px-4 py-2">
              {loading ? "Saving..." : "Save Notification Record"}
            </Button>
          </div>
        </form>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-hairline-strong rounded-md text-ink-muted text-sm">
          No statutory notifications recorded for this project yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((n: any) => {
            const daysLeft = daysLeftObjection(n.objectionWindowDeadline);
            return (
              <div key={n.id} className="p-4 rounded-md border border-hairline bg-paper flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-brand-dark">
                      {n.type === "PRELIMINARY_S11" ? "Preliminary Notification (Section 11)" : "Declaration Notification (Section 19)"}
                    </div>
                    <div className="text-xs text-ink-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono-data">
                      <span>Gazette: <strong>{n.gazetteReference}</strong></span>
                      <span>Newspaper: <strong>{n.newspaperReference}</strong></span>
                      <span>Published: <strong>{formatDate(n.publicationDate)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-center text-xs">
                  <div className="flex items-center gap-1 font-medium text-ink">
                    <Clock className="w-3.5 h-3.5 text-saffron" />
                    Objection Deadline: <span className="font-mono-data">{formatDate(n.objectionWindowDeadline)}</span>
                  </div>
                  <div className={`mt-1 font-mono-data font-semibold ${daysLeft > 0 ? "text-success" : "text-danger"}`}>
                    {daysLeft > 0 ? `${daysLeft} days remaining in objection window` : "Objection window closed"}
                  </div>
                  {n.noticeBoardProofUrl && (
                    <div className="mt-1 text-[11px] text-brand flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-success" /> Notice-Board Proof Attached ({n.noticeBoardProofUrl})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

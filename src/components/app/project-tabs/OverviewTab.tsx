"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatNumber } from "@/lib/domain/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { CheckCircle2, Lock, AlertCircle, Building2, MapPin, Layers, Trash2 } from "lucide-react";
import { toggleRRCostDeposit, deleteProject } from "@/app/(app)/projects/actions";
import type { Role } from "@/lib/domain/roles";

export function OverviewTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast } = useToast();
  const router = useRouter();
  const canToggleDeposit = userRole === "REQUIRING_BODY";

  // Deletable only pre-notification (Requiring Body's own project, per role
  // scoping already enforced server-side) — once a Section 11/19
  // notification is filed, deletion is blocked to preserve the audit trail.
  const canDelete = userRole === "REQUIRING_BODY";
  const notificationCount = (project.notifications || []).length;
  const isDeletable = notificationCount === 0;

  async function handleDelete() {
    if (!canDelete) return;
    if (!isDeletable) {
      showToast(
        "error",
        "This project has a filed statutory notification and can no longer be deleted — removing it would erase an audit trail affected parties may rely on under the Act."
      );
      return;
    }
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      router.push("/projects");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete project.");
      setDeleting(false);
    }
  }

  const affectedPersonCount = project.parcels.reduce(
    (sum: number, parcel: any) => sum + parcel.affectedPersons.length,
    0
  );

  async function handleDepositToggle() {
    if (!canToggleDeposit) return;
    setLoading(true);
    try {
      await toggleRRCostDeposit(project.id, !project.rrCostDeposited);
      showToast("success", project.rrCostDeposited ? "Deposit confirmation revoked." : "R&R cost deposit confirmed.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update deposit status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Project Overview &amp; Specifications</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Key metadata, statutory parameters, and preliminary deposit gates.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone="brand">{project.acquisitionRoute}</Badge>
          <Badge tone="neutral">{project.projectType}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Requiring Body</div>
          <div className="font-semibold text-brand-dark mt-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-saffron" />
            {project.requiringBody}
          </div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Jurisdiction &amp; Location</div>
          <div className="font-semibold text-brand-dark mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand" />
            {project.district}, {project.state}
          </div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Total Land Area</div>
          <div className="font-semibold text-brand-dark mt-1 flex items-center gap-1.5 font-mono-data">
            <Layers className="w-4 h-4 text-saffron" />
            {formatNumber(Number(project.totalAreaAcres))} Acres
          </div>
        </div>
      </div>

      {/* R&R Cost Deposit Banner */}
      <div className={`p-4 rounded-md border text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        project.rrCostDeposited
          ? "bg-success-tint border-success/30 text-success"
          : "bg-warning-tint border-warning/30 text-warning"
      }`}>
        <div className="flex items-start gap-3">
          {project.rrCostDeposited ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-success mt-0.5" />
          ) : (
            <Lock className="w-5 h-5 shrink-0 text-warning mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-sm">
              R&amp;R Cost Deposit: {project.rrCostDeposited ? "Confirmed & Deposited" : "Pending Confirmation"}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {project.rrCostDeposited
                ? "The Requiring Body has deposited the estimated Rehabilitation & Resettlement cost. Declaration stage is unlocked."
                : "Declaration stage (Stage 5) cannot proceed until the Requiring Body confirms the R&R cost deposit."}
            </div>
          </div>
        </div>

        {canToggleDeposit && (
          <div className="flex items-center gap-3 shrink-0">
            <ToastBanner toast={toast} />
            <Button
              onClick={handleDepositToggle}
              disabled={loading}
              variant={project.rrCostDeposited ? "secondary" : "primary"}
              className="shrink-0 text-xs px-3 py-1.5 min-h-0"
            >
              {loading
                ? "Updating..."
                : project.rrCostDeposited
                ? "Revoke Deposit Confirmation"
                : "Confirm R&R Cost Deposit"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-md border border-hairline bg-paper">
          <h3 className="font-medium text-xs text-ink-muted uppercase tracking-wider mb-3">Parcels &amp; Claimants</h3>
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold font-mono-data text-brand-dark">{project.parcels.length}</div>
              <div className="text-xs text-ink-muted">Land Parcels</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-data text-brand-dark">{affectedPersonCount}</div>
              <div className="text-xs text-ink-muted">Affected Persons</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper">
          <h3 className="font-medium text-xs text-ink-muted uppercase tracking-wider mb-3">Current Statutory Stage</h3>
          <div className="text-sm font-semibold text-brand">
            {project.currentStage.replace(/_/g, " ")}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Created on {formatDate(project.createdAt)}
          </div>
        </div>
      </div>

      {canDelete && (
        <div className="p-4 rounded-md border border-danger/30 bg-danger-tint/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-danger">Delete Project</div>
              <div className="text-xs text-ink-muted mt-0.5">
                {isDeletable
                  ? "Permanently removes this project. Only possible before any statutory notification is filed."
                  : "This project has a filed statutory notification and can no longer be deleted — removing it would erase an audit trail affected parties may rely on under the Act."}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ToastBanner toast={toast} />
            <Button
              onClick={handleDelete}
              disabled={!isDeletable || deleting}
              variant="secondary"
              className="text-xs px-3 py-1.5 min-h-0 text-danger border-danger/30 hover:bg-danger-tint/40"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {deleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

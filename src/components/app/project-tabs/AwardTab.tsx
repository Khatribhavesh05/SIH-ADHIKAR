"use client";

import { useState } from "react";
import { formatDate, formatNumber } from "@/lib/domain/format";
import { updateDisputeStatus } from "@/app/(app)/projects/actions";
import { Button, LinkButton } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { Award as AwardIcon, AlertTriangle, Calculator, CheckCircle2 } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function AwardTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const award = project.award;
  const [dispute, setDispute] = useState<string>(award?.disputeStatus || "NONE");

  async function handleDisputeChange(newStatus: string) {
    const previous = dispute;
    setDispute(newStatus);
    setLoading(true);
    try {
      await updateDisputeStatus(project.id, newStatus as any);
      showToast("success", "Dispute status updated.");
    } catch (err) {
      setDispute(previous);
      showToast("error", err instanceof Error ? err.message : "Failed to update dispute status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 6 — Award Determination (Sections 25–30)</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Transparent compensation calculation ledger and statutory 12-month award deadline tracking.
          </p>
        </div>
        {userRole === "COLLECTOR" && (
          <LinkButton href={`/projects/${project.id}/compensation`} variant="primary" className="text-xs px-3 py-1.5 min-h-0">
            <Calculator className="w-3.5 h-3.5 mr-1" /> Open Compensation Calculator
          </LinkButton>
        )}
      </div>

      {!award ? (
        <div className="text-center py-10 border border-dashed border-hairline rounded-md text-ink-muted text-sm">
          <AwardIcon className="w-8 h-8 text-hairline-strong mx-auto mb-2" />
          Award determination begins after Section 19 Declaration is published.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Dispute Status Selector */}
          <div className="p-4 rounded-md border border-hairline bg-paper flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xs font-semibold text-brand-dark flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-saffron" /> Statutory Dispute / Tribunal Status
              </div>
              <div className="text-xs text-ink-muted mt-0.5">
                Track Section 64 land acquisition tribunal or judicial dispute filings.
              </div>
            </div>

            {userRole === "COLLECTOR" || userRole === "REQUIRING_BODY" ? (
              <div className="flex items-center gap-3">
                <ToastBanner toast={toast} />
                <select
                  value={dispute}
                  onChange={(e) => handleDisputeChange(e.target.value)}
                  disabled={loading}
                  className="input text-xs font-semibold"
                >
                  <option value="NONE">NONE — No Dispute Filed</option>
                  <option value="FILED">FILED — Tribunal Case Pending (Sec 64)</option>
                  <option value="RESOLVED">RESOLVED — Dispute Settled / Dismissed</option>
                </select>
              </div>
            ) : (
              <div className="font-semibold text-xs text-ink font-mono-data">
                Status: {dispute}
              </div>
            )}
          </div>

          {/* Key Award Numbers */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-md border border-hairline bg-paper">
              <div className="text-xs font-medium text-ink-muted">Statutory 12-Mo Award Deadline</div>
              <div className="font-bold text-lg text-brand-dark mt-1 font-mono-data">
                {formatDate(award.awardDeadline)}
              </div>
            </div>

            <div className="p-4 rounded-md border border-hairline bg-paper">
              <div className="text-xs font-medium text-ink-muted">Award Announcement Date</div>
              <div className="font-bold text-lg text-brand mt-1 font-mono-data">
                {formatDate(award.awardDate)}
              </div>
            </div>

            <div className="p-4 rounded-md border border-hairline bg-paper">
              <div className="text-xs font-medium text-ink-muted">Final Compensation Assessed</div>
              <div className="font-bold text-lg text-success mt-1 font-mono-data">
                {Number(award.finalCompensationAmount) > 0
                  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(award.finalCompensationAmount))
                  : "Calculation Pending"}
              </div>
            </div>
          </div>

          {/* Ledger Summary Card */}
          <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-brand-dark">Section 26–30 Calculation Breakdown</h3>
            <div className="space-y-2 text-xs divide-y divide-hairline">
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Base Market Value (Max of Circle Rate / Sale Deed)</span>
                <span className="font-mono-data font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(award.marketValue))}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Asset Value (Crops, Trees, Structures)</span>
                <span className="font-mono-data font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(award.assetValue))}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Solatium Premium (100% of Market Value)</span>
                <span className="font-mono-data font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(award.solatiumAmount))}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Rural/Urban Multiplier</span>
                <span className="font-mono-data font-semibold">{Number(award.multiplier)}x ({award.areaType})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">Section 30(3) Delay Interest (12% p.a.)</span>
                <span className="font-mono-data font-semibold text-saffron">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(award.interestAccrued))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

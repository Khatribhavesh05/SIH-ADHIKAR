"use client";

import { formatDate, formatNumber } from "@/lib/domain/format";
import { LinkButton } from "@/components/ui/Button";
import { Coins, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function DisbursementTab({ project, userRole }: { project: any; userRole: Role }) {
  const award = project.award;
  const disbursements = award?.disbursements || [];

  const totalCompensation = Number(award?.finalCompensationAmount || 0);
  const totalDisbursed = disbursements.reduce(
    (sum: number, d: any) => (d.disbursementDate ? sum + Number(d.disbursedAmount) : sum),
    0
  );
  const totalLateInterest = disbursements.reduce(
    (sum: number, d: any) => sum + Number(d.additionalInterestAccrued || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 7 — Compensation Disbursement Ledger</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Per-claimant compensation payments and automatic post-award 9% delay interest tracking (Section 30(3)).
          </p>
        </div>
        {userRole === "COLLECTOR" && (
          <LinkButton href={`/projects/${project.id}/disbursement`} variant="primary" className="text-xs px-3 py-1.5 min-h-0">
            Manage Payments
          </LinkButton>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Total Compensation Assessed</div>
          <div className="font-bold text-lg text-brand-dark mt-1 font-mono-data">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalCompensation)}
          </div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Total Disbursed</div>
          <div className="font-bold text-lg text-success mt-1 font-mono-data">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalDisbursed)}
          </div>
        </div>

        <div className="p-4 rounded-md border border-hairline bg-paper text-sm">
          <div className="text-xs font-medium text-ink-muted">Accrued Post-Award Delay Interest (9% p.a.)</div>
          <div className="font-bold text-lg text-danger mt-1 font-mono-data">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalLateInterest)}
          </div>
        </div>
      </div>

      {disbursements.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-hairline rounded-md text-ink-muted text-xs">
          No claimant disbursement records found for this project.
        </div>
      ) : (
        <div className="overflow-x-auto border border-hairline rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper border-b border-hairline font-semibold text-ink-muted">
              <tr>
                <th className="p-3">Claimant Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Disbursed Amount</th>
                <th className="p-3">Disbursement Date</th>
                <th className="p-3">Delay Past Award</th>
                <th className="p-3">9% Delay Interest Accrued</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {disbursements.map((d: any) => {
                const isPaid = Boolean(d.disbursementDate);
                return (
                  <tr key={d.id} className="bg-paper-raised hover:bg-paper font-mono-data">
                    <td className="p-3 font-sans font-semibold text-brand-dark">{d.claimant?.name || "Claimant"}</td>
                    <td className="p-3 font-sans text-ink-muted">{d.claimant?.role || "OWNER"}</td>
                    <td className="p-3 font-semibold">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(d.disbursedAmount))}
                    </td>
                    <td className="p-3">{isPaid ? formatDate(d.disbursementDate) : "—"}</td>
                    <td className="p-3">{d.daysDelayedPastAward > 0 ? `${d.daysDelayedPastAward} days` : "0 days"}</td>
                    <td className="p-3 text-danger font-semibold">
                      {Number(d.additionalInterestAccrued) > 0
                        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(d.additionalInterestAccrued))
                        : "₹0"}
                    </td>
                    <td className="p-3 font-sans">
                      {isPaid ? (
                        <span className="text-success font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      ) : (
                        <span className="text-saffron font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

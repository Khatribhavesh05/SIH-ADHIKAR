"use client";

import { useState } from "react";
import { formatDate } from "@/lib/domain/format";
import { toggleRRCostDeposit } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/Button";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import { Lock, CheckCircle2, ShieldAlert, Plus, Layers, UserCheck } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function DeclarationTab({ project, userRole }: { project: any; userRole: Role }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const isDepositConfirmed = project.rrCostDeposited;

  async function handleToggleDeposit() {
    if (userRole !== "REQUIRING_BODY") return;
    setLoading(true);
    try {
      await toggleRRCostDeposit(project.id, !isDepositConfirmed);
      showToast("success", isDepositConfirmed ? "Deposit confirmation revoked." : "R&R cost deposit confirmed.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update deposit status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 5 — Declaration &amp; Survey Record (Section 19)</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Final acquisition declaration, detailed survey measurement, and ownership claims ledger.
          </p>
        </div>
      </div>

      {userRole === "REQUIRING_BODY" && <ToastBanner toast={toast} />}

      {/* R&R Cost Deposit Statutory Gate Banner */}
      {!isDepositConfirmed ? (
        <div className="p-6 rounded-md border-2 border-danger/40 bg-danger-tint/50 flex flex-col gap-4 text-sm shadow-xs">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-danger shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-danger text-base">
                LOCKED GATE: Declaration cannot proceed until R&amp;R cost deposit is confirmed
              </h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Section 19(2) statutory rule: No declaration under Section 19 shall be published unless the Requiring Body has deposited the estimated cost of Rehabilitation and Resettlement scheme with the Collector.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-danger/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-ink font-medium">
              {userRole === "REQUIRING_BODY"
                ? "As the Requiring Body representative, you can confirm this deposit to unlock Declaration."
                : "Awaiting Requiring Body confirmation of R&R cost deposit."}
            </div>

            {userRole === "REQUIRING_BODY" && (
              <Button
                onClick={handleToggleDeposit}
                disabled={loading}
                variant="primary"
                className="text-xs px-4 py-2 min-h-0 shrink-0 bg-danger hover:bg-danger/90"
              >
                {loading ? "Confirming..." : "Confirm R&R Cost Deposit Now"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-md border border-success/40 bg-success-tint/40 flex items-center justify-between gap-3 text-xs text-success">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>R&amp;R Cost Deposit Confirmed. Declaration Stage is Unlocked.</span>
          </div>

          {userRole === "REQUIRING_BODY" && (
            <button
              onClick={handleToggleDeposit}
              disabled={loading}
              className="text-[11px] underline text-ink-muted hover:text-ink cursor-pointer"
            >
              (Revoke)
            </button>
          )}
        </div>
      )}

      {/* Survey / Measurement & Parcels Content */}
      <div className={`flex flex-col gap-6 ${!isDepositConfirmed ? "opacity-50 pointer-events-none select-none" : ""}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <Layers className="w-4 h-4 text-saffron" /> Survey &amp; Land Parcel Records ({project.parcels.length})
          </h3>
          {userRole === "COLLECTOR" && (
            <LinkButton href={`/projects/${project.id}/parcels`} variant="secondary" className="text-xs px-3 py-1 min-h-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add / Manage Parcels
            </LinkButton>
          )}
        </div>

        {project.parcels.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-hairline rounded-md text-ink-muted text-xs">
            No parcels recorded yet. Use the Parcel Manager to record survey numbers, khasra numbers, and affected person ownership claims.
          </div>
        ) : (
          <div className="overflow-x-auto border border-hairline rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-paper border-b border-hairline font-semibold text-ink-muted">
                <tr>
                  <th className="p-3">Survey / Khasra No.</th>
                  <th className="p-3">Village &amp; Tehsil</th>
                  <th className="p-3">Area (Acres)</th>
                  <th className="p-3">Land Classification</th>
                  <th className="p-3">Affected Claimants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {project.parcels.map((parcel: any) => (
                  <tr key={parcel.id} className="bg-paper-raised hover:bg-paper">
                    <td className="p-3 font-mono-data font-semibold text-brand-dark">
                      S.No {parcel.surveyNumber} / K.No {parcel.khasraNumber}
                    </td>
                    <td className="p-3">{parcel.village}, {parcel.tehsil}</td>
                    <td className="p-3 font-mono-data">{Number(parcel.areaAcres)}</td>
                    <td className="p-3">{parcel.landClassification.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {parcel.affectedPersons.map((person: any) => (
                          <div key={person.id} className="flex items-center gap-1 font-mono-data text-[11px]">
                            <UserCheck className="w-3 h-3 text-saffron" />
                            <span>{person.name} ({person.role})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

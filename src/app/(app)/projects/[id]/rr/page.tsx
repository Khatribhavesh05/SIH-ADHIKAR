import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PublicationTracker } from "@/components/app/PublicationTracker";
import { updateRRStatus, addRREntitlement, updateEntitlementStatus } from "./actions";
import { Building2, Award as AwardIcon, Plus, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/domain/format";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  NOT_STARTED: "neutral",
  DRAFTED: "warning",
  PENDING_REVIEW: "warning",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  PUBLISHED: "success",
};

const STATUS_OPTIONS: Record<string, string[]> = {
  draftStatus: ["NOT_STARTED", "DRAFTED", "PENDING_REVIEW"],
  collectorReviewStatus: ["NOT_STARTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
  commissionerApprovalStatus: ["NOT_STARTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
  publicationStatus: ["NOT_STARTED", "PUBLISHED"],
};

export default async function RRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perm = PERMISSIONS[user.role];

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rrScheme: {
        include: {
          entitlements: {
            include: { person: true },
          },
        },
      },
      parcels: {
        include: { affectedPersons: true },
      },
    },
  });
  if (!project || !project.rrScheme) notFound();
  const scheme = project.rrScheme;

  const affectedPersons = project.parcels.flatMap((p) => p.affectedPersons);

  const stages = [
    { key: "draftStatus" as const, label: "Draft (R&R Administrator, S.43)", value: scheme.draftStatus, canEdit: perm.draftRRScheme },
    { key: "collectorReviewStatus" as const, label: "Collector Review", value: scheme.collectorReviewStatus, canEdit: perm.reviewRRScheme },
    { key: "commissionerApprovalStatus" as const, label: "Commissioner Approval (S.44)", value: scheme.commissionerApprovalStatus, canEdit: perm.approveRRScheme },
    { key: "publicationStatus" as const, label: "Publication", value: scheme.publicationStatus, canEdit: perm.approveRRScheme },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-3 border-b border-hairline flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-brand-dark">Rehabilitation &amp; Resettlement Portal</h1>
          <p className="text-xs text-ink-muted mt-0.5">{project.title} — Stage 9 Statutory Scheme Management</p>
        </div>
        {scheme.rrCommitteeRequired && (
          <Badge tone="warning">★ 100+ Acre R&amp;R Committee Constituted</Badge>
        )}
      </div>

      {/* Scheme Stage Pipeline */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <Panel raised className="p-4 min-w-[240px]">
              <div className="text-xs font-medium text-ink-muted mb-2">{s.label}</div>
              <Badge tone={STATUS_TONE[s.value]}>{s.value.replaceAll("_", " ")}</Badge>
              {s.canEdit && (
                <form className="mt-3 flex flex-col gap-1.5">
                  {STATUS_OPTIONS[s.key].map((opt) => (
                    <button
                      key={opt}
                      formAction={updateRRStatus.bind(null, id, s.key, opt as never)}
                      className="text-xs text-left px-2.5 py-1.5 border border-hairline-strong rounded hover:border-brand hover:text-brand bg-paper-raised cursor-pointer transition-colors"
                    >
                      Set: {opt.replaceAll("_", " ")}
                    </button>
                  ))}
                </form>
              )}
            </Panel>
            {i < stages.length - 1 && <div className="h-px w-6 bg-hairline-strong shrink-0" />}
          </div>
        ))}
      </div>

      {/* Section 44 5-Channel Publication Tracker (R&R Commissioner) */}
      <PublicationTracker
        projectId={project.id}
        initialPublished={scheme.publicationStatus === "PUBLISHED"}
        userRole={user.role}
      />

      {/* R&R Entitlements Table (R&R Administrator CRUD) */}
      <Panel raised className="p-5">
        <div className="flex justify-between items-center pb-3 border-b border-hairline mb-4">
          <div>
            <h2 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <AwardIcon className="w-4 h-4 text-saffron" /> Affected Person R&amp;R Entitlements Ledger
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Second Schedule mandatory benefits: Housing, Transport Allowance, Employment, and Annuity.
            </p>
          </div>
        </div>

        {/* Add Entitlement Form for Administrator */}
        {(user.role === "RR_ADMINISTRATOR" || user.role === "COLLECTOR") && affectedPersons.length > 0 && (
          <form
            action={async (formData) => {
              "use server";
              const personId = String(formData.get("personId"));
              const entitlementType = String(formData.get("entitlementType")) as any;
              await addRREntitlement(scheme.id, personId, entitlementType);
            }}
            className="p-3.5 rounded border border-hairline bg-paper flex flex-wrap items-end gap-3 mb-4 text-xs"
          >
            <label className="flex flex-col gap-1">
              <span className="font-medium text-ink">Select Affected Person</span>
              <select name="personId" required className="input text-xs">
                {affectedPersons.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-medium text-ink">Entitlement Type</span>
              <select name="entitlementType" required className="input text-xs">
                <option value="HOUSING">Constructive Housing (Sec 31)</option>
                <option value="TRANSPORT_ALLOWANCE">Lump-Sum Transport Allowance</option>
                <option value="EMPLOYMENT">Mandatory Employment / Annuity</option>
                <option value="ANNUITY">Monthly Annuity Allowance</option>
              </select>
            </label>

            <Button type="submit" className="text-xs px-3 py-1.5 min-h-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Entitlement
            </Button>
          </form>
        )}

        {scheme.entitlements.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">
            No specific entitlements recorded yet. Use the form above to record housing, annuity, or transport benefits per affected person.
          </p>
        ) : (
          <div className="overflow-x-auto border border-hairline rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-paper border-b border-hairline font-semibold text-ink-muted">
                <tr>
                  <th className="p-3">Beneficiary Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Entitlement Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Disbursement Date</th>
                  {(user.role === "RR_ADMINISTRATOR" || user.role === "COLLECTOR") && <th className="p-3">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline font-mono-data">
                {scheme.entitlements.map((e) => (
                  <tr key={e.id} className="bg-paper-raised hover:bg-paper">
                    <td className="p-3 font-sans font-semibold text-brand-dark">{e.person.name}</td>
                    <td className="p-3 font-sans text-ink-muted">{e.person.role}</td>
                    <td className="p-3 font-sans font-medium">{e.entitlementType.replace(/_/g, " ")}</td>
                    <td className="p-3 font-sans">
                      <Badge tone={e.status === "DISBURSED" ? "success" : "warning"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="p-3">{formatDate(e.disbursementDate)}</td>
                    {(user.role === "RR_ADMINISTRATOR" || user.role === "COLLECTOR") && (
                      <td className="p-3 font-sans">
                        {e.status !== "DISBURSED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateEntitlementStatus(e.id, "DISBURSED");
                            }}
                          >
                            <button
                              type="submit"
                              className="text-[11px] px-2 py-0.5 rounded bg-success text-white font-medium hover:bg-success/90 cursor-pointer"
                            >
                              Mark Disbursed
                            </button>
                          </form>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

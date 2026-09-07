import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { updateRRStatus } from "./actions";

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
    include: { rrScheme: true },
  });
  if (!project || !project.rrScheme) notFound();
  const scheme = project.rrScheme;

  const stages = [
    { key: "draftStatus" as const, label: "Draft (R&R Administrator, S.43)", value: scheme.draftStatus, canEdit: perm.draftRRScheme },
    { key: "collectorReviewStatus" as const, label: "Collector Review", value: scheme.collectorReviewStatus, canEdit: perm.reviewRRScheme },
    { key: "commissionerApprovalStatus" as const, label: "Commissioner Approval (S.44)", value: scheme.commissionerApprovalStatus, canEdit: perm.approveRRScheme },
    { key: "publicationStatus" as const, label: "Publication", value: scheme.publicationStatus, canEdit: perm.approveRRScheme },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Rehabilitation &amp; Resettlement</h1>
        <p className="text-sm text-ink-muted mt-1">{project.title} — Stage 9 (runs in parallel with Stages 5–8)</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-2">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <Panel raised className="p-4 min-w-[220px]">
              <div className="text-xs text-ink-muted mb-2">{s.label}</div>
              <Badge tone={STATUS_TONE[s.value]}>{s.value.replaceAll("_", " ")}</Badge>
              {s.canEdit && (
                <form className="mt-3 flex flex-col gap-2">
                  {STATUS_OPTIONS[s.key].map((opt) => (
                    <button
                      key={opt}
                      formAction={updateRRStatus.bind(null, id, s.key, opt as never)}
                      className="text-xs text-left px-2 py-1 border border-hairline-strong rounded-[var(--radius-sm)] hover:border-brand hover:text-brand"
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

      {scheme.rrCommitteeRequired && (
        <Panel className="p-5 border-[var(--color-info)]/40 bg-[var(--color-info-tint)]">
          <h2 className="font-medium text-sm mb-1">R&amp;R Committee constituted</h2>
          <p className="text-sm text-ink-muted">
            Project area is {Number(project.totalAreaAcres)} acres (≥100), so a project-level R&amp;R
            Committee, chaired by the District Collector, is required to monitor implementation and
            conduct post-implementation social audits with the Gram Sabha / Municipality.
          </p>
        </Panel>
      )}

      <Panel raised>
        <PanelHeader>
          <h2 className="font-medium text-sm">Entitlements</h2>
        </PanelHeader>
        <PanelBody>
          <p className="text-sm text-ink-muted">
            Housing, transport allowance, employment, and annuity entitlements are recorded per
            affected person once the scheme is approved. (Static preview — entitlement disbursement
            tracking is out of scope for this prototype pass.)
          </p>
        </PanelBody>
      </Panel>
    </div>
  );
}

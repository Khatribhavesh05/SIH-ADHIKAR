import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { StageTracker } from "@/components/app/StageTracker";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatDate, formatNumber } from "@/lib/domain/format";
import type { ProjectStage } from "@/lib/domain/stages";

export default async function ProjectDetailPage({
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
      notifications: { orderBy: { publicationDate: "desc" } },
      parcels: { include: { affectedPersons: true } },
      award: true,
      possession: true,
      rrScheme: true,
      consentRecord: true,
      siaRecords: true,
    },
  });

  if (!project) notFound();

  const affectedPersonCount = project.parcels.reduce(
    (sum, parcel) => sum + parcel.affectedPersons.length,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif-heading text-xl sm:text-2xl font-semibold break-words">{project.title}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {project.requiringBody} · {project.district}, {project.state} ·{" "}
            {formatNumber(Number(project.totalAreaAcres))} acres
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge tone="brand">{project.acquisitionRoute}</Badge>
          <Badge tone="neutral">{project.projectType}</Badge>
        </div>
      </div>

      <Panel raised className="p-6 overflow-x-auto">
        <StageTracker currentStage={project.currentStage as ProjectStage} />
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel raised>
          <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium text-sm">Notification (Stage 1 / 5)</h2>
            {perm.submitNotification && (
              <LinkButton href={`/projects/${project.id}/notification`} variant="secondary" className="text-xs px-2.5 py-1 min-h-0">
                Submit
              </LinkButton>
            )}
          </PanelHeader>
          <PanelBody>
            {project.notifications.length === 0 ? (
              <EmptyState text="No notification filed yet." />
            ) : (
              <ul className="flex flex-col gap-2">
                {project.notifications.map((n) => (
                  <li key={n.id} className="text-sm flex justify-between border-b border-hairline pb-2 last:border-0 last:pb-0">
                    <span>{n.type === "PRELIMINARY_S11" ? "Preliminary (S.11)" : "Declaration (S.19)"}</span>
                    <span className="text-ink-muted font-mono-data">{formatDate(n.publicationDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </PanelBody>
        </Panel>

        <Panel raised>
          <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium text-sm">Parcels &amp; Affected Persons (Stage 5)</h2>
            {perm.manageParcels && (
              <LinkButton href={`/projects/${project.id}/parcels`} variant="secondary" className="text-xs px-2.5 py-1 min-h-0">
                Manage
              </LinkButton>
            )}
          </PanelHeader>
          <PanelBody>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="font-mono-data text-xl font-semibold">{project.parcels.length}</div>
                <div className="text-ink-muted text-xs">Parcels</div>
              </div>
              <div>
                <div className="font-mono-data text-xl font-semibold">{affectedPersonCount}</div>
                <div className="text-ink-muted text-xs">Affected Persons</div>
              </div>
            </div>
          </PanelBody>
        </Panel>

        <Panel raised>
          <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium text-sm">Award &amp; Compensation (Stage 6)</h2>
            {perm.compensationCalculator !== "none" && (
              <LinkButton href={`/projects/${project.id}/compensation`} variant="secondary" className="text-xs px-2.5 py-1 min-h-0">
                {perm.compensationCalculator === "edit" ? "Open Calculator" : "View"}
              </LinkButton>
            )}
          </PanelHeader>
          <PanelBody>
            {project.award ? (
              <div className="text-sm flex flex-col gap-1.5">
                <Row label="Award deadline" value={formatDate(project.award.awardDeadline)} />
                <Row label="Award date" value={formatDate(project.award.awardDate)} />
                <Row
                  label="Final compensation"
                  value={
                    Number(project.award.finalCompensationAmount) > 0
                      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(project.award.finalCompensationAmount))
                      : "Not calculated"
                  }
                />
              </div>
            ) : (
              <EmptyState text="Declaration not yet filed — award tracking begins at Stage 5." />
            )}
          </PanelBody>
        </Panel>

        <Panel raised>
          <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium text-sm">Disbursement &amp; Possession</h2>
            <LinkButton href={`/projects/${project.id}/disbursement`} variant="secondary" className="text-xs px-2.5 py-1 min-h-0">
              View
            </LinkButton>
          </PanelHeader>
          <PanelBody>
            <Row label="Possession date" value={formatDate(project.possession?.possessionDate ?? null)} />
            <Row label="Lapse risk deadline" value={formatDate(project.possession?.lapseRiskDeadline ?? null)} />
          </PanelBody>
        </Panel>

        <Panel raised>
          <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium text-sm">R&amp;R Scheme (Stage 9)</h2>
            <LinkButton href={`/projects/${project.id}/rr`} variant="secondary" className="text-xs px-2.5 py-1 min-h-0">
              View
            </LinkButton>
          </PanelHeader>
          <PanelBody>
            <Row label="R&R Committee required" value={project.rrScheme?.rrCommitteeRequired ? "Yes (≥100 acres)" : "No"} />
            <Row label="Draft status" value={project.rrScheme?.draftStatus ?? "—"} />
          </PanelBody>
        </Panel>

        {project.consentRecord && (
          <Panel raised>
            <PanelHeader>
              <h2 className="font-medium text-sm">Consent (Stage 4 — {project.projectType})</h2>
            </PanelHeader>
            <PanelBody>
              <Row
                label="Consent progress"
                value={`${project.consentRecord.consentsCollected} / ${project.consentRecord.affectedFamiliesTotal} (threshold ${Number(project.consentRecord.thresholdPercent)}%)`}
              />
            </PanelBody>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono-data">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-ink-muted">{text}</p>;
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { formatDate, formatNumber } from "@/lib/domain/format";
import { computeProjectRisk, type ProjectRiskDeadline } from "@/lib/domain/risk";
import type { RiskStatus } from "@/lib/domain/compensation";
import type { Project, Award, Possession } from "@prisma/client";
import Link from "next/link";

type ProjectRow = Project & { award: Award | null; possession: Possession | null };
type RowWithRisk = { project: ProjectRow; risk: ReturnType<typeof computeProjectRisk> };

function riskBadge(d: ProjectRiskDeadline | null) {
  if (!d) return <span className="text-ink-muted text-xs">—</span>;
  const tone = d.status === "DANGER" ? "danger" : d.status === "WARNING" ? "warning" : "success";
  const label = d.days >= 0 ? `${d.days}d remaining` : `${Math.abs(d.days)}d overdue`;
  return <Badge tone={tone}>{label}</Badge>;
}

const STATUS_ORDER: Record<RiskStatus, number> = { DANGER: 0, WARNING: 1, SAFE: 2 };

export default async function DeadlinesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: projectScopeWhere(user.role, user),
    include: { award: true, possession: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: RowWithRisk[] = projects
    .map((p) => ({ project: p, risk: computeProjectRisk(p) }))
    .sort((a, b) => STATUS_ORDER[a.risk.overall] - STATUS_ORDER[b.risk.overall]);

  const rowTint = (r: RowWithRisk) =>
    r.risk.overall === "DANGER"
      ? "bg-[var(--color-danger-tint)]/40"
      : r.risk.overall === "WARNING"
      ? "bg-[var(--color-warning-tint)]/40"
      : "";

  const columns: DataColumn<RowWithRisk>[] = [
    {
      key: "project",
      header: "Project",
      primary: true,
      render: ({ project: p }) => (
        <Link href={`/projects/${p.id}`} className="text-brand hover:underline font-medium">
          {p.title}
        </Link>
      ),
    },
    { key: "location", header: "District / State", render: ({ project: p }) => <span className="text-ink-muted">{p.district}, {p.state}</span> },
    {
      key: "awardDeadline",
      header: "Award deadline",
      className: "font-mono-data",
      render: ({ project: p }) => (p.award ? formatDate(p.award.awardDeadline) : "—"),
    },
    { key: "awardRisk", header: "Award risk", render: ({ risk }) => riskBadge(risk.award) },
    {
      key: "lapseDeadline",
      header: "Lapse deadline",
      className: "font-mono-data",
      render: ({ project: p }) => (p.possession?.lapseRiskDeadline ? formatDate(p.possession.lapseRiskDeadline) : "—"),
    },
    { key: "lapseRisk", header: "Lapse risk", render: ({ risk }) => riskBadge(risk.lapse) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Deadline &amp; Lapse Risk</h1>
        <p className="text-sm text-ink-muted mt-1">
          12-month award deadline (Section 25) and 5-year possession/payment lapse deadline (Section 24(2)),
          tracked against every project in scope.
        </p>
      </div>

      <Panel className="p-4 sm:p-5 bg-[var(--color-warning-tint)] border-[var(--color-warning)]/40">
        <p className="text-sm text-ink">
          <strong>Missed deadlines carry real, audited cost.</strong> A 2026 CAG performance audit
          (Report No. 7 of 2026) found delays in issuing the Bangalore Metro&rsquo;s Final Notification
          beyond its prescribed 270-day window resulted in ₹186.86 crore paid purely as 12% statutory
          interest — money spent solely because of delay, not land value.
        </p>
      </Panel>

      <Panel raised>
        <ResponsiveDataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.project.id}
          rowClassName={rowTint}
          emptyMessage="No projects in scope yet."
        />
      </Panel>
      <p className="text-xs text-ink-muted">
        Showing {formatNumber(rows.length)} project(s) in scope, sorted by risk.
      </p>
    </div>
  );
}

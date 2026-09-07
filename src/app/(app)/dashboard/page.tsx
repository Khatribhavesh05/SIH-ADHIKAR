import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/domain/roles";
import { riskStatusForDeadline, AT_RISK_WINDOW_MONTHS } from "@/lib/domain/compensation";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TH, TR, TD, TEmpty } from "@/components/ui/Table";
import { STAGES, stageOrder } from "@/lib/domain/stages";
import { formatNumber } from "@/lib/domain/format";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perm = PERMISSIONS[user.role];

  const where = projectScopeWhere(user.role, user);
  const projects = await prisma.project.findMany({
    where,
    include: { award: true, possession: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalArea = projects.reduce((sum, p) => sum + Number(p.totalAreaAcres), 0);

  const awardsAtRisk = projects.filter((p) => {
    if (!p.award || p.award.awardDate) return false;
    const status = riskStatusForDeadline(p.award.awardDeadline, AT_RISK_WINDOW_MONTHS);
    return status !== "SAFE";
  }).length;

  const lapseAtRisk = projects.filter((p) => {
    if (!p.possession?.lapseRiskDeadline || p.possession.possessionDate) return false;
    const status = riskStatusForDeadline(p.possession.lapseRiskDeadline, AT_RISK_WINDOW_MONTHS);
    return status !== "SAFE";
  }).length;

  const scopeLabel: Record<string, string> = {
    own_projects: "your projects",
    own_district: `${user.jurisdictionDistrict ?? "your district"}`,
    own_state: `${user.jurisdictionState ?? "your state"}`,
    national: "nationwide",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-1">
            {ROLE_LABELS[user.role]} view · scoped to {scopeLabel[perm.deadlineScope]}
          </p>
        </div>
        {perm.createProject && (
          <LinkButton href="/projects/new">New Project</LinkButton>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Projects in scope" value={formatNumber(projects.length)} />
        <StatCard label="Total area (acres)" value={formatNumber(totalArea)} />
        <StatCard
          label="Approaching / overdue award deadline"
          value={formatNumber(awardsAtRisk)}
          tone={awardsAtRisk > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Approaching / overdue lapse deadline"
          value={formatNumber(lapseAtRisk)}
          tone={lapseAtRisk > 0 ? "danger" : "success"}
        />
      </div>

      <Panel raised>
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h2 className="font-medium text-sm">Projects</h2>
          <Link href="/projects" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <Table>
          <THead>
            <TH>Title</TH>
            <TH>District / State</TH>
            <TH>Stage</TH>
            <TH>Area (acres)</TH>
          </THead>
          <tbody>
            {projects.length === 0 && <TEmpty colSpan={4}>No projects in scope yet.</TEmpty>}
            {projects.slice(0, 10).map((p) => (
              <TR key={p.id}>
                <TD>
                  <Link href={`/projects/${p.id}`} className="text-brand hover:underline font-medium">
                    {p.title}
                  </Link>
                </TD>
                <TD className="text-ink-muted">
                  {p.district}, {p.state}
                </TD>
                <TD>
                  <Badge tone="brand">
                    {stageOrder(p.currentStage as never)}. {STAGES.find((s) => s.key === p.currentStage)?.shortLabel}
                  </Badge>
                </TD>
                <TD className="font-mono-data">{formatNumber(Number(p.totalAreaAcres))}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "warning"
      ? "text-[var(--color-warning)]"
      : tone === "success"
      ? "text-[var(--color-success)]"
      : "text-ink";

  return (
    <Panel className="p-4">
      <div className="text-xs text-ink-muted mb-1.5">{label}</div>
      <div className={`font-mono-data text-2xl font-semibold ${toneClass}`}>{value}</div>
    </Panel>
  );
}

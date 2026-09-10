import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { serializeDecimals } from "@/lib/serialize";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/domain/roles";
import { NationalCommandCenter } from "@/components/app/NationalCommandCenter";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { STAGES, stageOrder } from "@/lib/domain/stages";
import { formatNumber } from "@/lib/domain/format";
import Link from "next/link";
import type { Project, Award, Possession } from "@prisma/client";

type ProjectRow = Project & { award: Award | null; possession: Possession | null };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perm = PERMISSIONS[user.role];

  const where = projectScopeWhere(user.role, user);
  const projects = serializeDecimals(
    await prisma.project.findMany({
      where,
      include: {
        award: {
          include: {
            disbursements: { include: { claimant: true } },
          },
        },
        possession: true,
        parcels: { include: { affectedPersons: true } },
        consentRecord: true,
      },
      orderBy: { createdAt: "desc" },
    })
  );

  const totalArea = projects.reduce((sum, p) => sum + Number(p.totalAreaAcres), 0);

  // If user is Central Ministry Viewer (or when viewing national level command center), show full National Command Center
  if (user.role === "CENTRAL_MINISTRY_VIEWER" || perm.analyticsScope === "national") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-hairline">
          <div>
            <h1 className="font-serif-heading text-2xl font-bold text-brand-dark">
              National Land Acquisition Command Center
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Ministry of Rural Development · Dept of Land Resources Real-Time Statutory Oversight
            </p>
          </div>
          <Badge tone="brand">Central Ministry Oversight</Badge>
        </div>

        <NationalCommandCenter projects={projects as any} />
      </div>
    );
  }

  // Scoped District / Collector / Requiring Body Dashboard view
  const scopeLabel: Record<string, string> = {
    own_projects: "your projects",
    own_district: `${user.jurisdictionDistrict ?? "your district"}`,
    own_state: `${user.jurisdictionState ?? "your state"}`,
    national: "nationwide",
  };

  const columns: DataColumn<ProjectRow>[] = [
    {
      key: "title",
      header: "Title",
      primary: true,
      render: (p) => (
        <Link href={`/projects/${p.id}`} className="text-brand hover:underline font-semibold">
          {p.title}
        </Link>
      ),
    },
    { key: "location", header: "District / State", render: (p) => <span className="text-ink-muted">{p.district}, {p.state}</span> },
    {
      key: "stage",
      header: "Stage",
      render: (p) => (
        <Badge tone="brand">
          {stageOrder(p.currentStage as never)}. {STAGES.find((s) => s.key === p.currentStage)?.shortLabel}
        </Badge>
      ),
    },
    { key: "area", header: "Area (acres)", className: "font-mono-data", render: (p) => formatNumber(Number(p.totalAreaAcres)) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-hairline">
        <div>
          <h1 className="font-serif-heading text-2xl font-bold text-brand-dark">
            {user.role === "COLLECTOR" ? "My District Command Dashboard" : "Project Dashboard"}
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {ROLE_LABELS[user.role]} view · scoped to {scopeLabel[perm.deadlineScope]}
          </p>
        </div>
        {perm.createProject && (
          <LinkButton href="/projects/new" className="w-full sm:w-auto justify-center">
            + New Project
          </LinkButton>
        )}
      </div>

      <NationalCommandCenter projects={projects as any} />

      <Panel raised>
        <div className="px-4 sm:px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h2 className="font-medium text-sm">Projects List ({projects.length})</h2>
          <Link href="/projects" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <ResponsiveDataTable
          columns={columns}
          rows={projects.slice(0, 10)}
          rowKey={(p) => p.id}
          emptyMessage="No projects in scope yet."
        />
      </Panel>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { PERMISSIONS } from "@/lib/domain/roles";
import { STAGES } from "@/lib/domain/stages";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { formatNumber } from "@/lib/domain/format";
import Link from "next/link";
import type { Project } from "@prisma/client";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perm = PERMISSIONS[user.role];

  const projects = await prisma.project.findMany({
    where: projectScopeWhere(user.role, user),
    orderBy: { createdAt: "desc" },
  });

  const columns: DataColumn<Project>[] = [
    {
      key: "title",
      header: "Title",
      primary: true,
      render: (p) => (
        <Link href={`/projects/${p.id}`} className="text-brand hover:underline font-medium">
          {p.title}
        </Link>
      ),
    },
    { key: "requiringBody", header: "Requiring Body", render: (p) => <span className="text-ink-muted">{p.requiringBody}</span> },
    { key: "route", header: "Route", render: (p) => <span className="text-ink-muted">{p.acquisitionRoute}</span> },
    { key: "type", header: "Type", render: (p) => <span className="text-ink-muted">{p.projectType}</span> },
    { key: "location", header: "District / State", render: (p) => <span className="text-ink-muted">{p.district}, {p.state}</span> },
    {
      key: "stage",
      header: "Stage",
      render: (p) => <Badge tone="brand">{STAGES.find((s) => s.key === p.currentStage)?.shortLabel}</Badge>,
    },
    { key: "area", header: "Area (acres)", className: "font-mono-data", render: (p) => formatNumber(Number(p.totalAreaAcres)) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif-heading text-2xl font-semibold">Projects</h1>
        {perm.createProject && (
          <LinkButton href="/projects/new" className="w-full sm:w-auto justify-center">
            New Project
          </LinkButton>
        )}
      </div>

      <Panel raised>
        <ResponsiveDataTable
          columns={columns}
          rows={projects}
          rowKey={(p) => p.id}
          emptyMessage="No projects in scope yet."
        />
      </Panel>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { PERMISSIONS } from "@/lib/domain/roles";
import { STAGES } from "@/lib/domain/stages";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Table, THead, TH, TR, TD, TEmpty } from "@/components/ui/Table";
import { formatNumber } from "@/lib/domain/format";
import Link from "next/link";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perm = PERMISSIONS[user.role];

  const projects = await prisma.project.findMany({
    where: projectScopeWhere(user.role, user),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-heading text-2xl font-semibold">Projects</h1>
        {perm.createProject && <LinkButton href="/projects/new">New Project</LinkButton>}
      </div>

      <Panel raised>
        <Table>
          <THead>
            <TH>Title</TH>
            <TH>Requiring Body</TH>
            <TH>Route</TH>
            <TH>Type</TH>
            <TH>District / State</TH>
            <TH>Stage</TH>
            <TH>Area (acres)</TH>
          </THead>
          <tbody>
            {projects.length === 0 && <TEmpty colSpan={7}>No projects in scope yet.</TEmpty>}
            {projects.map((p) => (
              <TR key={p.id}>
                <TD>
                  <Link href={`/projects/${p.id}`} className="text-brand hover:underline font-medium">
                    {p.title}
                  </Link>
                </TD>
                <TD className="text-ink-muted">{p.requiringBody}</TD>
                <TD className="text-ink-muted">{p.acquisitionRoute}</TD>
                <TD className="text-ink-muted">{p.projectType}</TD>
                <TD className="text-ink-muted">
                  {p.district}, {p.state}
                </TD>
                <TD>
                  <Badge tone="brand">
                    {STAGES.find((s) => s.key === p.currentStage)?.shortLabel}
                  </Badge>
                </TD>
                <TD className="font-mono-data">
                  {formatNumber(Number(p.totalAreaAcres))}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

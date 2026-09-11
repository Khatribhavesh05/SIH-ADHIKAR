import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeDecimals } from "@/lib/serialize";
import { projectScopeWhere } from "@/lib/queries/scope";
import { ProjectTabsContainer } from "@/components/app/project-tabs/ProjectTabsContainer";
import { Badge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/domain/format";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = serializeDecimals(
    await prisma.project.findFirst({
      where: { id, ...projectScopeWhere(user.role, user) },
      include: {
        notifications: { orderBy: { publicationDate: "desc" } },
        parcels: { include: { affectedPersons: true } },
        award: {
          include: {
            disbursements: {
              include: { claimant: true },
            },
          },
        },
        possession: true,
        rrScheme: {
          include: {
            entitlements: { include: { person: true } },
          },
        },
        consentRecord: true,
        siaRecords: true,
      },
    })
  );

  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-2 border-b border-hairline">
        <div className="min-w-0">
          <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-brand-dark break-words">
            {project.title}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            {project.requiringBody} · {project.district}, {project.state} ·{" "}
            <span className="font-mono-data font-semibold">{formatNumber(Number(project.totalAreaAcres))} acres</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge tone="brand">{project.acquisitionRoute}</Badge>
          <Badge tone="neutral">{project.projectType}</Badge>
        </div>
      </div>

      {/* Render 10-Tab Stepper View */}
      <ProjectTabsContainer project={project as any} userRole={user.role} />
    </div>
  );
}

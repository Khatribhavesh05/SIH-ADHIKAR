import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { projectScopeWhere } from "@/lib/queries/scope";
import { CompensationCalculatorForm } from "@/components/app/CompensationCalculatorForm";
import { saveAward } from "./actions";

export default async function CompensationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const access = PERMISSIONS[user.role].compensationCalculator;
  if (access === "none") redirect(`/projects/${id}`);

  const project = await prisma.project.findFirst({
    where: { id, ...projectScopeWhere(user.role, user) },
    include: { award: true, notifications: { orderBy: { publicationDate: "asc" }, take: 1 } },
  });
  if (!project) notFound();

  const parcelAreaSum = await prisma.landParcel.aggregate({
    where: { projectId: id },
    _sum: { areaAcres: true },
  });
  const surveyedAreaAcres = Number(parcelAreaSum._sum.areaAcres ?? 0);

  const action = saveAward.bind(null, id);

  const toDateInput = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Compensation Calculator</h1>
        <p className="text-sm text-ink-muted mt-1">
          {project.title} · Stage 6 — Award Determination (Sections 25–30)
          {access === "view" && " · Read-only view"}
        </p>
      </div>

      <CompensationCalculatorForm
        projectId={id}
        areaAcres={surveyedAreaAcres}
        declaredAreaAcres={Number(project.totalAreaAcres)}
        readOnly={access !== "edit"}
        saveAction={action}
        initial={{
          circleRatePerAcre: project.award ? Number(project.award.circleRate) : 0,
          saleDeedAveragePerAcre: project.award ? Number(project.award.saleDeedAverage) : 0,
          assetValue: project.award ? Number(project.award.assetValue) : 0,
          areaType: project.award?.areaType ?? "RURAL",
          declarationDate: toDateInput(project.award?.declarationDate),
          awardDate: toDateInput(project.award?.awardDate),
          notificationDate: project.notifications[0]
            ? toDateInput(project.notifications[0].publicationDate)
            : null,
        }}
      />
    </div>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import { calculateCompensation, awardDeadline, lapseRiskDeadline } from "@/lib/domain/compensation";
import type { AreaType } from "@prisma/client";

export async function saveAward(projectId: string, formData: FormData) {
  await requirePermission((p) => p.compensationCalculator === "edit");

  const circleRatePerAcre = parseFloat(String(formData.get("circleRatePerAcre") ?? "0"));
  const saleDeedAveragePerAcre = parseFloat(String(formData.get("saleDeedAveragePerAcre") ?? "0"));
  const assetValue = parseFloat(String(formData.get("assetValue") ?? "0"));
  const areaType = String(formData.get("areaType") ?? "RURAL") as AreaType;
  const declarationDateStr = String(formData.get("declarationDate") ?? "");
  const awardDateStr = String(formData.get("awardDate") ?? "");
  const areaAcres = parseFloat(String(formData.get("areaAcres") ?? "0"));
  const notificationDateStr = String(formData.get("notificationDate") ?? "");

  const declarationDate = new Date(declarationDateStr);
  const awardDate = awardDateStr ? new Date(awardDateStr) : null;
  const notificationDate = notificationDateStr ? new Date(notificationDateStr) : null;

  const breakdown = calculateCompensation({
    circleRatePerAcre,
    saleDeedAveragePerAcre,
    areaAcres,
    assetValue,
    areaType,
    notificationDate,
    declarationDate,
    awardDate,
    possessionDate: null,
  });

  await prisma.award.upsert({
    where: { projectId },
    update: {
      declarationDate,
      awardDeadline: awardDeadline(declarationDate),
      awardDate,
      circleRate: circleRatePerAcre,
      saleDeedAverage: saleDeedAveragePerAcre,
      assetValue,
      areaType,
      marketValue: breakdown.marketValue,
      solatiumAmount: breakdown.solatiumAmount,
      multiplier: breakdown.multiplier,
      interestAccrued: breakdown.interestAccrued,
      finalCompensationAmount: breakdown.finalCompensationAmount,
    },
    create: {
      projectId,
      declarationDate,
      awardDeadline: awardDeadline(declarationDate),
      awardDate,
      circleRate: circleRatePerAcre,
      saleDeedAverage: saleDeedAveragePerAcre,
      assetValue,
      areaType,
      marketValue: breakdown.marketValue,
      solatiumAmount: breakdown.solatiumAmount,
      multiplier: breakdown.multiplier,
      interestAccrued: breakdown.interestAccrued,
      finalCompensationAmount: breakdown.finalCompensationAmount,
    },
  });

  if (awardDate) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStage: "STAGE_7_DISBURSEMENT" },
    });
    await prisma.possession.upsert({
      where: { projectId },
      update: { lapseRiskDeadline: lapseRiskDeadline(awardDate) },
      create: { projectId, lapseRiskDeadline: lapseRiskDeadline(awardDate), lapseStatus: "SAFE" },
    });
  }

  revalidatePath(`/projects/${projectId}/compensation`);
  revalidatePath(`/projects/${projectId}`);
}

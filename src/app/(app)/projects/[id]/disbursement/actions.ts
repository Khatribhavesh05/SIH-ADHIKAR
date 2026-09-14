"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { assertProjectInScope } from "@/lib/queries/scope";
import { revalidatePath } from "next/cache";
import { calculateDisbursementDelay } from "@/lib/domain/compensation";

export async function upsertDisbursement(
  projectId: string,
  awardId: string,
  claimantId: string,
  formData: FormData
) {
  const user = await requirePermission((p) => p.markDisbursement);
  await assertProjectInScope(user, projectId);

  const disbursedAmount = parseFloat(String(formData.get("disbursedAmount") ?? "0"));
  const disbursementDateStr = String(formData.get("disbursementDate") ?? "");
  const disbursementDate = disbursementDateStr ? new Date(disbursementDateStr) : null;

  const award = await prisma.award.findUniqueOrThrow({ where: { id: awardId } });

  const { daysDelayed, additionalInterestAccrued } = calculateDisbursementDelay(
    award.awardDate ?? award.declarationDate,
    disbursedAmount,
    disbursementDate
  );

  const existing = await prisma.disbursement.findFirst({ where: { awardId, claimantId } });

  if (existing) {
    await prisma.disbursement.update({
      where: { id: existing.id },
      data: { disbursedAmount, disbursementDate, daysDelayedPastAward: daysDelayed, additionalInterestAccrued },
    });
  } else {
    await prisma.disbursement.create({
      data: { awardId, claimantId, disbursedAmount, disbursementDate, daysDelayedPastAward: daysDelayed, additionalInterestAccrued },
    });
  }

  // Stage 7 is complete once every recorded claimant across the project's
  // parcels has been marked disbursed (has a disbursement with a date) —
  // not once total disbursed reaches the Award's assessed total, since
  // claimants are paid their own individually recorded amounts.
  const claimants = await prisma.affectedPerson.findMany({
    where: { parcel: { projectId } },
    include: { disbursements: { where: { awardId } } },
  });
  const allDisbursed =
    claimants.length > 0 &&
    claimants.every((c) => c.disbursements.some((d) => d.disbursementDate));

  if (allDisbursed) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStage: "STAGE_8_POSSESSION" },
    });
  }

  revalidatePath(`/projects/${projectId}/disbursement`);
  revalidatePath(`/projects/${projectId}`);
}

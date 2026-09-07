"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { ApprovalStatus } from "@prisma/client";

export async function updateRRStatus(
  projectId: string,
  field: "draftStatus" | "collectorReviewStatus" | "commissionerApprovalStatus" | "publicationStatus",
  value: ApprovalStatus
) {
  if (field === "draftStatus") {
    await requirePermission((p) => p.draftRRScheme);
  } else if (field === "collectorReviewStatus") {
    await requirePermission((p) => p.reviewRRScheme);
  } else {
    await requirePermission((p) => p.approveRRScheme);
  }

  await prisma.rRScheme.update({
    where: { projectId },
    data: { [field]: value },
  });

  revalidatePath(`/projects/${projectId}/rr`);
}

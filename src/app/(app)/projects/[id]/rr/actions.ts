"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { ApprovalStatus, EntitlementType, EntitlementStatus } from "@prisma/client";

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
  revalidatePath(`/projects/${projectId}`);
}

export async function addRREntitlement(
  schemeId: string,
  personId: string,
  entitlementType: EntitlementType
) {
  await requirePermission((p) => p.draftRRScheme || p.approveRRScheme);

  await prisma.rREntitlement.create({
    data: {
      schemeId,
      personId,
      entitlementType,
      status: "APPROVED",
      disbursementDate: new Date(),
    },
  });

  const scheme = await prisma.rRScheme.findUnique({ where: { id: schemeId } });
  if (scheme) {
    revalidatePath(`/projects/${scheme.projectId}/rr`);
    revalidatePath(`/projects/${scheme.projectId}`);
  }
}

export async function updateEntitlementStatus(
  entitlementId: string,
  status: EntitlementStatus
) {
  await requirePermission((p) => p.draftRRScheme || p.approveRRScheme);

  const updated = await prisma.rREntitlement.update({
    where: { id: entitlementId },
    data: {
      status,
      disbursementDate: status === "DISBURSED" ? new Date() : null,
    },
    include: { scheme: true },
  });

  revalidatePath(`/projects/${updated.scheme.projectId}/rr`);
  revalidatePath(`/projects/${updated.scheme.projectId}`);
}

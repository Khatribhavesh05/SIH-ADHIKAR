"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { assertProjectInScope } from "@/lib/queries/scope";
import { revalidatePath } from "next/cache";
import type { CurrentUser } from "@/lib/auth";
import type { ApprovalStatus, EntitlementType, EntitlementStatus } from "@prisma/client";

export async function updateRRStatus(
  projectId: string,
  field: "draftStatus" | "collectorReviewStatus" | "commissionerApprovalStatus" | "publicationStatus",
  value: ApprovalStatus
) {
  let user: CurrentUser;
  if (field === "draftStatus") {
    user = await requirePermission((p) => p.draftRRScheme);
  } else if (field === "collectorReviewStatus") {
    user = await requirePermission((p) => p.reviewRRScheme);
  } else {
    user = await requirePermission((p) => p.approveRRScheme);
  }
  await assertProjectInScope(user, projectId);

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
  const user = await requirePermission((p) => p.draftRRScheme || p.approveRRScheme);

  const scheme = await prisma.rRScheme.findUniqueOrThrow({ where: { id: schemeId } });
  await assertProjectInScope(user, scheme.projectId);

  await prisma.rREntitlement.create({
    data: {
      schemeId,
      personId,
      entitlementType,
      status: "APPROVED",
      disbursementDate: new Date(),
    },
  });

  revalidatePath(`/projects/${scheme.projectId}/rr`);
  revalidatePath(`/projects/${scheme.projectId}`);
}

export async function updateEntitlementStatus(
  entitlementId: string,
  status: EntitlementStatus
) {
  const user = await requirePermission((p) => p.draftRRScheme || p.approveRRScheme);

  const entitlement = await prisma.rREntitlement.findUniqueOrThrow({
    where: { id: entitlementId },
    include: { scheme: true },
  });
  await assertProjectInScope(user, entitlement.scheme.projectId);

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

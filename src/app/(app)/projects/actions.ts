"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { assertProjectInScope } from "@/lib/queries/scope";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { awardDeadline, lapseRiskDeadline, isRRCommitteeRequired, consentThresholdPercent } from "@/lib/domain/compensation";
import { uploadProjectFile } from "@/lib/supabase/storage";
import type { AcquisitionRoute, ProjectType, ExpertGroupOutcome, DisputeStatus } from "@prisma/client";

export async function createProject(formData: FormData) {
  const user = await requirePermission((p) => p.createProject);

  const title = String(formData.get("title") ?? "").trim();
  const requiringBody = String(formData.get("requiringBody") ?? "").trim();
  const acquisitionRoute = String(formData.get("acquisitionRoute") ?? "RFCTLARR") as AcquisitionRoute;
  const projectType = String(formData.get("projectType") ?? "GOVERNMENT") as ProjectType;
  const state = String(formData.get("state") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const totalAreaAcres = parseFloat(String(formData.get("totalAreaAcres") ?? "0"));

  if (!title || !requiringBody || !state || !district || !totalAreaAcres) {
    throw new Error("Missing required project fields");
  }

  const project = await prisma.project.create({
    data: {
      title,
      requiringBody,
      acquisitionRoute,
      projectType,
      state,
      district,
      totalAreaAcres,
      createdByUserId: user.id,
      rrScheme: {
        create: {
          rrCommitteeRequired: isRRCommitteeRequired(totalAreaAcres),
        },
      },
    },
  });

  const threshold = consentThresholdPercent(projectType);
  if (threshold !== null) {
    await prisma.consentRecord.create({
      data: {
        projectId: project.id,
        affectedFamiliesTotal: Math.round(totalAreaAcres * 1.5),
        consentsCollected: 0,
        thresholdPercent: threshold,
      },
    });
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

/**
 * A project may only be deleted before any statutory notification has been
 * filed — once a Section 11/19 notification exists, affected parties may
 * already be relying on it, so deletion is blocked permanently rather than
 * just hidden in the UI.
 */
export async function deleteProject(projectId: string) {
  const user = await requirePermission((p) => p.deleteProject);
  await assertProjectInScope(user, projectId);

  const notificationCount = await prisma.notification.count({ where: { projectId } });
  if (notificationCount > 0) {
    throw new Error(
      "This project has a filed statutory notification and can no longer be deleted — removing it would erase an audit trail affected parties may rely on under the Act."
    );
  }

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/projects");
}

export async function toggleRRCostDeposit(projectId: string, deposited: boolean) {
  const user = await requirePermission((p) => p.setDepositFlag);
  await assertProjectInScope(user, projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: { rrCostDeposited: deposited },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/dashboard`);
}

export async function updateSIAData(projectId: string, formData: FormData) {
  const user = await requirePermission((p) => p.manageParcels);
  await assertProjectInScope(user, projectId);

  const publicHearingSummary = String(formData.get("publicHearingSummary") ?? "").trim();
  const isMultiCropFlagged = formData.get("isMultiCropFlagged") === "true";

  const existing = await prisma.sIARecord.findFirst({ where: { projectId } });
  const reportDocumentUrl =
    (await uploadProjectFile(projectId, "sia", formData.get("reportDocument") as File | null)) ??
    existing?.reportDocumentUrl ??
    null;

  if (existing) {
    await prisma.sIARecord.update({
      where: { id: existing.id },
      data: {
        publicHearingSummary,
        isMultiCropFlagged,
        reportDocumentUrl,
      },
    });
  } else {
    await prisma.sIARecord.create({
      data: {
        projectId,
        publicHearingSummary,
        isMultiCropFlagged,
        reportDocumentUrl,
      },
    });
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { currentStage: "STAGE_3_EXPERT_APPRAISAL" },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateExpertReview(projectId: string, formData: FormData) {
  const user = await requirePermission((p) => p.manageParcels);
  await assertProjectInScope(user, projectId);

  const expertGroupOutcome = String(formData.get("expertGroupOutcome") ?? "APPROVED") as ExpertGroupOutcome;
  const expertGroupJustification = String(formData.get("expertGroupJustification") ?? "").trim();
  const expertGroupName = String(formData.get("expertGroup") ?? "").trim();

  const existing = await prisma.sIARecord.findFirst({ where: { projectId } });

  if (existing) {
    await prisma.sIARecord.update({
      where: { id: existing.id },
      data: { expertGroupOutcome, expertGroupJustification, expertGroupName },
    });
  } else {
    await prisma.sIARecord.create({
      data: {
        projectId,
        expertGroupOutcome,
        expertGroupJustification,
        expertGroupName,
      },
    });
  }

  if (expertGroupOutcome === "APPROVED") {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStage: "STAGE_3_EXPERT_APPRAISAL" },
    });
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function incrementConsent(projectId: string, incrementBy: number = 1) {
  await requirePermission((p) => p.setConsentCount);

  const record = await prisma.consentRecord.findUnique({ where: { projectId } });
  if (!record) return;

  const newCollected = Math.min(record.affectedFamiliesTotal, record.consentsCollected + incrementBy);
  await prisma.consentRecord.update({
    where: { projectId },
    data: { consentsCollected: newCollected },
  });

  const percent = (newCollected / Math.max(1, record.affectedFamiliesTotal)) * 100;
  if (percent >= Number(record.thresholdPercent)) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStage: "STAGE_4_CONSENT" },
    });
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function updateDisputeStatus(projectId: string, disputeStatus: DisputeStatus) {
  const user = await requirePermission((p) => p.editDisputeStatus);
  await assertProjectInScope(user, projectId);

  const award = await prisma.award.findUnique({ where: { projectId } });
  if (award) {
    await prisma.award.update({
      where: { projectId },
      data: { disputeStatus },
    });
  }
  revalidatePath(`/projects/${projectId}`);
}

export async function updatePossessionDate(projectId: string, dateStr: string) {
  const user = await requirePermission((p) => p.recordPossession);
  await assertProjectInScope(user, projectId);

  const possessionDate = new Date(dateStr);
  const award = await prisma.award.findUnique({ where: { projectId } });
  const awardDate = award?.awardDate ?? new Date();
  const lapseDeadline = lapseRiskDeadline(awardDate);

  await prisma.possession.upsert({
    where: { projectId },
    update: {
      possessionDate,
      lapseRiskDeadline: lapseDeadline,
      lapseStatus: "SAFE",
    },
    create: {
      projectId,
      possessionDate,
      lapseRiskDeadline: lapseDeadline,
      lapseStatus: "SAFE",
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { currentStage: "STAGE_8_POSSESSION" },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function submitNotification(projectId: string, formData: FormData) {
  const user = await requirePermission((p) => p.submitNotification);
  await assertProjectInScope(user, projectId);

  const type = String(formData.get("type") ?? "PRELIMINARY_S11") as
    | "PRELIMINARY_S11"
    | "DECLARATION_S19";
  const publicationDate = new Date(String(formData.get("publicationDate")));
  const gazetteReference = String(formData.get("gazetteReference") ?? "").trim();
  const newspaperReference = String(formData.get("newspaperReference") ?? "").trim();
  const objectionWindowDeadline = new Date(String(formData.get("objectionWindowDeadline")));
  const noticeBoardProofUrl = await uploadProjectFile(
    projectId,
    "notification",
    formData.get("noticeBoardProof") as File | null
  );

  if (type === "DECLARATION_S19") {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project?.rrCostDeposited) {
      throw new Error(
        "Section 19(2) statutory gate: Declaration cannot be published until the Requiring Body has confirmed the R&R cost deposit."
      );
    }
    const parcelCount = await prisma.landParcel.count({ where: { projectId } });
    if (parcelCount === 0) {
      throw new Error(
        "Section 19 declaration requires at least one surveyed Land Parcel record before it can be published."
      );
    }
  }

  await prisma.notification.create({
    data: {
      projectId,
      type,
      publicationDate,
      gazetteReference,
      newspaperReference,
      noticeBoardProofUrl,
      objectionWindowDeadline,
    },
  });

  const nextStage = type === "PRELIMINARY_S11" ? "STAGE_2_SIA" : "STAGE_6_AWARD";

  if (type === "DECLARATION_S19") {
    await prisma.award.upsert({
      where: { projectId },
      update: {
        declarationDate: publicationDate,
        awardDeadline: awardDeadline(publicationDate),
      },
      create: {
        projectId,
        declarationDate: publicationDate,
        awardDeadline: awardDeadline(publicationDate),
        circleRate: 0,
        saleDeedAverage: 0,
        assetValue: 0,
        marketValue: 0,
        solatiumAmount: 0,
        multiplier: 4,
        finalCompensationAmount: 0,
      },
    });
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { currentStage: nextStage },
  });

  revalidatePath(`/projects/${projectId}`);
}

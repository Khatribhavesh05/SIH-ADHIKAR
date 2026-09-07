"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { awardDeadline, isRRCommitteeRequired, consentThresholdPercent } from "@/lib/domain/compensation";
import type { AcquisitionRoute, ProjectType } from "@prisma/client";

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
        affectedFamiliesTotal: 0,
        consentsCollected: 0,
        thresholdPercent: threshold,
      },
    });
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function submitNotification(projectId: string, formData: FormData) {
  await requirePermission((p) => p.submitNotification);

  const type = String(formData.get("type") ?? "PRELIMINARY_S11") as
    | "PRELIMINARY_S11"
    | "DECLARATION_S19";
  const publicationDate = new Date(String(formData.get("publicationDate")));
  const gazetteReference = String(formData.get("gazetteReference") ?? "").trim();
  const newspaperReference = String(formData.get("newspaperReference") ?? "").trim();
  const objectionWindowDeadline = new Date(String(formData.get("objectionWindowDeadline")));

  await prisma.notification.create({
    data: {
      projectId,
      type,
      publicationDate,
      gazetteReference,
      newspaperReference,
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
  redirect(`/projects/${projectId}`);
}

export async function advanceStage(projectId: string, stage: string) {
  await requirePermission((p) => p.submitNotification || p.manageParcels);
  await prisma.project.update({
    where: { id: projectId },
    data: { currentStage: stage as never },
  });
  revalidatePath(`/projects/${projectId}`);
}

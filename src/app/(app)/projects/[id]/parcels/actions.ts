"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { LandClassification, AffectedPersonRole } from "@prisma/client";

export async function addParcel(projectId: string, formData: FormData) {
  await requirePermission((p) => p.manageParcels);

  const landClassification = String(formData.get("landClassification")) as LandClassification;

  await prisma.landParcel.create({
    data: {
      projectId,
      surveyNumber: String(formData.get("surveyNumber") ?? "").trim(),
      khasraNumber: String(formData.get("khasraNumber") ?? "").trim(),
      khataNumber: String(formData.get("khataNumber") ?? "").trim(),
      village: String(formData.get("village") ?? "").trim(),
      tehsil: String(formData.get("tehsil") ?? "").trim(),
      district: String(formData.get("district") ?? "").trim(),
      areaAcres: parseFloat(String(formData.get("areaAcres") ?? "0")),
      landClassification,
      isMultiCropIrrigated: landClassification === "AGRICULTURAL_MULTI_CROP_IRRIGATED",
      latitude: formData.get("latitude") ? parseFloat(String(formData.get("latitude"))) : null,
      longitude: formData.get("longitude") ? parseFloat(String(formData.get("longitude"))) : null,
      ulpinId: String(formData.get("ulpinId") ?? "").trim() || null,
    },
  });

  revalidatePath(`/projects/${projectId}/parcels`);
}

export async function addAffectedPerson(
  projectId: string,
  parcelId: string,
  formData: FormData
) {
  await requirePermission((p) => p.manageParcels);

  const role = String(formData.get("role")) as AffectedPersonRole;

  await prisma.affectedPerson.create({
    data: {
      parcelId,
      name: String(formData.get("name") ?? "").trim(),
      role,
      scStStatus: formData.get("scStStatus") === "on",
      ownershipClaimDetails: String(formData.get("ownershipClaimDetails") ?? "").trim() || null,
      compensationClaimAmount: formData.get("compensationClaimAmount")
        ? parseFloat(String(formData.get("compensationClaimAmount")))
        : null,
    },
  });

  revalidatePath(`/projects/${projectId}/parcels`);
}

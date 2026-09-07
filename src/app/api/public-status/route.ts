import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/domain/stages";

/** No-login public transparency lookup — project ID or a parcel's survey number. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Provide a project ID or survey number as ?q=" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { id: query },
        { parcels: { some: { surveyNumber: query } } },
      ],
    },
    select: {
      title: true,
      district: true,
      state: true,
      currentStage: true,
      totalAreaAcres: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "No matching project found" }, { status: 404 });
  }

  const stageDef = STAGES.find((s) => s.key === project.currentStage);

  return NextResponse.json({
    title: project.title,
    district: project.district,
    state: project.state,
    stage: stageDef?.label,
    stageOrder: stageDef?.order,
    totalAreaAcres: project.totalAreaAcres,
  });
}

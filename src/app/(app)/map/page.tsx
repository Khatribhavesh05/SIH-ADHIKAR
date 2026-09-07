import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { computeProjectRisk } from "@/lib/domain/risk";
import { Panel } from "@/components/ui/Panel";
import dynamic from "next/dynamic";

const ProjectMapClient = dynamic(
  () => import("@/components/app/ProjectMapClient").then((m) => m.ProjectMapClient),
  { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center text-sm text-ink-muted">Loading map…</div> }
);

// Fallback illustrative coordinates for projects that don't yet have a
// geo-tagged parcel — Tier 2 screen, static markers are acceptable.
const STATE_CENTROIDS: Record<string, [number, number]> = {
  Maharashtra: [19.7515, 75.7139],
  Karnataka: [15.3173, 75.7139],
  "Tamil Nadu": [11.1271, 78.6569],
  Gujarat: [22.2587, 71.1924],
  "Uttar Pradesh": [26.8467, 80.9462],
  Rajasthan: [27.0238, 74.2179],
  "West Bengal": [22.9868, 87.855],
  Odisha: [20.9517, 85.0985],
  Kerala: [10.8505, 76.2711],
  Punjab: [31.1471, 75.3412],
  Bihar: [25.0961, 85.3131],
  Telangana: [18.1124, 79.0193],
  Assam: [26.2006, 92.9376],
  Haryana: [29.0588, 76.0856],
  "Madhya Pradesh": [22.9734, 78.6569],
  Chhattisgarh: [21.2787, 81.8661],
  "Andhra Pradesh": [15.9129, 79.74],
};

export default async function MapPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: projectScopeWhere(user.role, user),
    include: { parcels: true, award: true, possession: true },
    take: 30,
  });

  const markers = projects.map((p, i) => {
    const geoParcel = p.parcels.find((parcel) => parcel.latitude && parcel.longitude);
    const centroid = STATE_CENTROIDS[p.state] ?? [22.9734, 78.6569];
    // small deterministic jitter so multiple projects in one state don't overlap exactly
    const jitter = (i % 5) * 0.35;
    const firstParcel = p.parcels[0];
    const risk = computeProjectRisk(p);

    return {
      id: p.id,
      title: p.title,
      district: p.district,
      state: p.state,
      currentStage: p.currentStage,
      areaAcres: Number(p.totalAreaAcres),
      khasraReference: firstParcel ? `${firstParcel.khasraNumber} / ${firstParcel.khataNumber}` : null,
      lat: geoParcel ? Number(geoParcel.latitude) : centroid[0] + jitter,
      lng: geoParcel ? Number(geoParcel.longitude) : centroid[1] + jitter,
      riskTone:
        risk.overall === "DANGER" ? ("danger" as const) : risk.overall === "WARNING" ? ("warning" as const) : ("success" as const),
      nearestDeadlineLabel: risk.nearest?.label ?? null,
      nearestDeadlineDays: risk.nearest?.days ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">GIS Map</h1>
        <p className="text-sm text-ink-muted mt-1">
          Project-level geo-tagging on satellite imagery. Markers are color-coded by deadline risk —
          green (on track), orange (approaching a deadline), red (overdue / at risk) — matching the
          Deadline &amp; Risk dashboard.
        </p>
      </div>
      <Panel raised className="overflow-hidden">
        <ProjectMapClient projects={markers} />
      </Panel>
    </div>
  );
}

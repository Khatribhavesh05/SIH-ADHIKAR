import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/domain/format";
import { addParcel, addAffectedPerson } from "./actions";

const LAND_CLASSIFICATIONS = [
  ["AGRICULTURAL_MULTI_CROP_IRRIGATED", "Agricultural — Multi-crop irrigated"],
  ["AGRICULTURAL_SINGLE_CROP", "Agricultural — Single crop"],
  ["AGRICULTURAL_UNIRRIGATED", "Agricultural — Unirrigated"],
  ["NON_AGRICULTURAL", "Non-agricultural"],
  ["BARREN", "Barren"],
  ["FOREST", "Forest"],
  ["OTHER", "Other"],
] as const;

const AFFECTED_PERSON_ROLES = [
  ["OWNER", "Owner"],
  ["CO_OWNER", "Co-owner"],
  ["AGRICULTURAL_LABORER", "Agricultural Laborer"],
  ["OTHER_LIVELIHOOD_DEPENDENT", "Other Livelihood-Dependent"],
] as const;

export default async function ParcelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!PERMISSIONS[user.role].manageParcels) redirect(`/projects/${id}`);

  const project = await prisma.project.findUnique({
    where: { id },
    include: { parcels: { include: { affectedPersons: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();

  const addParcelAction = addParcel.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Parcels &amp; Affected Persons</h1>
        <p className="text-sm text-ink-muted mt-1">{project.title} — Stage 5 (Section 19 survey &amp; claims)</p>
      </div>

      <Panel raised>
        <PanelHeader>
          <h2 className="font-medium text-sm">Add parcel</h2>
        </PanelHeader>
        <PanelBody>
          <form action={addParcelAction} className="grid md:grid-cols-3 gap-4">
            <Field label="Survey number"><input name="surveyNumber" required className="input" /></Field>
            <Field label="Khasra number"><input name="khasraNumber" required className="input" /></Field>
            <Field label="Khata number"><input name="khataNumber" required className="input" /></Field>
            <Field label="Village"><input name="village" required className="input" /></Field>
            <Field label="Tehsil"><input name="tehsil" required className="input" /></Field>
            <Field label="District"><input name="district" required defaultValue={project.district} className="input" /></Field>
            <Field label="Area (acres)"><input name="areaAcres" type="number" step="0.01" min="0" required className="input font-mono-data" /></Field>
            <Field label="Land classification">
              <select name="landClassification" required className="input" defaultValue="">
                <option value="" disabled>Select</option>
                {LAND_CLASSIFICATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <div />
            <Field label="Latitude (optional)"><input name="latitude" type="number" step="0.000001" className="input font-mono-data" /></Field>
            <Field label="Longitude (optional)"><input name="longitude" type="number" step="0.000001" className="input font-mono-data" /></Field>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Add Parcel</Button>
            </div>
          </form>
        </PanelBody>
      </Panel>

      <div className="flex flex-col gap-4">
        {project.parcels.map((parcel) => {
          const addPersonAction = addAffectedPerson.bind(null, id, parcel.id);
          return (
            <Panel raised key={parcel.id}>
              <PanelHeader className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-medium text-sm">
                    {parcel.village}, {parcel.tehsil} — Khasra {parcel.khasraNumber} / Khata {parcel.khataNumber}
                  </span>
                  <span className="text-xs text-ink-muted ml-2">
                    Survey {parcel.surveyNumber} · {formatNumber(Number(parcel.areaAcres))} acres
                  </span>
                </div>
                {parcel.isMultiCropIrrigated && (
                  <Badge tone="warning">Multi-crop irrigated — RFCTLARR restricts acquisition of this land</Badge>
                )}
              </PanelHeader>
              <PanelBody>
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="text-left text-xs text-ink-muted border-b border-hairline">
                      <th className="py-2 font-medium">Name</th>
                      <th className="py-2 font-medium">Role</th>
                      <th className="py-2 font-medium">SC/ST</th>
                      <th className="py-2 font-medium">Claim (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcel.affectedPersons.length === 0 && (
                      <tr><td colSpan={4} className="py-3 text-ink-muted text-sm">No affected persons recorded.</td></tr>
                    )}
                    {parcel.affectedPersons.map((ap) => (
                      <tr key={ap.id} className="border-b border-hairline last:border-0">
                        <td className="py-2">{ap.name}</td>
                        <td className="py-2">
                          <Badge tone="brand">{AFFECTED_PERSON_ROLES.find(([v]) => v === ap.role)?.[1]}</Badge>
                        </td>
                        <td className="py-2">{ap.scStStatus ? "Yes" : "—"}</td>
                        <td className="py-2 font-mono-data">
                          {ap.compensationClaimAmount ? formatNumber(Number(ap.compensationClaimAmount)) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <form action={addPersonAction} className="grid md:grid-cols-5 gap-3 items-end border-t border-hairline pt-4">
                  <Field label="Name"><input name="name" required className="input" /></Field>
                  <Field label="Role">
                    <select name="role" required className="input font-medium">
                      {AFFECTED_PERSON_ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Claim amount (₹)"><input name="compensationClaimAmount" type="number" step="0.01" className="input font-mono-data" /></Field>
                  <label className="flex items-center gap-2 text-sm pb-2">
                    <input type="checkbox" name="scStStatus" /> SC/ST status
                  </label>
                  <Button type="submit" variant="secondary">Add Person</Button>
                </form>
              </PanelBody>
            </Panel>
          );
        })}
        {project.parcels.length === 0 && (
          <Panel className="p-6 text-center text-sm text-ink-muted">No parcels added yet.</Panel>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

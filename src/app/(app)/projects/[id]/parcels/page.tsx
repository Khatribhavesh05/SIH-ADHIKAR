import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { projectScopeWhere } from "@/lib/queries/scope";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { formatNumber } from "@/lib/domain/format";
import { addParcel, addAffectedPerson } from "./actions";
import { ULPINFetchForm } from "@/components/app/ULPINFetchForm";
import type { AffectedPerson } from "@prisma/client";

const AFFECTED_PERSON_ROLES = [
  ["OWNER", "Owner"],
  ["CO_OWNER", "Co-owner"],
  ["AGRICULTURAL_LABORER", "Agricultural Laborer"],
  ["OTHER_LIVELIHOOD_DEPENDENT", "Other Livelihood-Dependent"],
] as const;

const personColumns: DataColumn<AffectedPerson>[] = [
  { key: "name", header: "Name", primary: true, render: (ap) => ap.name },
  {
    key: "role",
    header: "Role",
    render: (ap) => <Badge tone="brand">{AFFECTED_PERSON_ROLES.find(([v]) => v === ap.role)?.[1]}</Badge>,
  },
  { key: "scSt", header: "SC/ST", render: (ap) => (ap.scStStatus ? "Yes" : "—") },
  {
    key: "claim",
    header: "Claim (₹)",
    className: "font-mono-data",
    render: (ap) => (ap.compensationClaimAmount ? formatNumber(Number(ap.compensationClaimAmount)) : "—"),
  },
];

export default async function ParcelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!PERMISSIONS[user.role].manageParcels) redirect(`/projects/${id}`);

  const project = await prisma.project.findFirst({
    where: { id, ...projectScopeWhere(user.role, user) },
    include: { parcels: { include: { affectedPersons: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();

  const addParcelAction = addParcel.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <LinkButton
          href={`/projects/${id}?tab=declaration`}
          variant="ghost"
          className="text-xs px-0 py-0 min-h-0 -ml-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Project
        </LinkButton>
        <h1 className="font-serif-heading text-2xl font-semibold">Parcels &amp; Affected Persons</h1>
        <p className="text-sm text-ink-muted mt-1">{project.title} — Stage 5 (Section 19 survey &amp; claims)</p>
      </div>

      <Panel raised>
        <PanelHeader>
          <h2 className="font-medium text-sm">Add Parcel &amp; Fetch Land Record</h2>
        </PanelHeader>
        <PanelBody>
          <ULPINFetchForm
            projectId={project.id}
            districtDefault={project.district}
            onAddAction={addParcelAction}
          />
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
                <div className="mb-4">
                  <ResponsiveDataTable
                    dense
                    columns={personColumns}
                    rows={parcel.affectedPersons}
                    rowKey={(ap) => ap.id}
                    emptyMessage="No affected persons recorded."
                  />
                </div>

                <form action={addPersonAction} className="grid md:grid-cols-5 gap-3 items-end border-t border-hairline pt-4 text-xs">
                  <Field label="Name"><input name="name" required className="input text-xs" /></Field>
                  <Field label="Role">
                    <select name="role" required className="input text-xs font-medium">
                      {AFFECTED_PERSON_ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Claim amount (₹)"><input name="compensationClaimAmount" type="number" step="0.01" className="input text-xs font-mono-data" /></Field>
                  <label className="flex items-center gap-2 text-xs pb-2">
                    <input type="checkbox" name="scStStatus" /> SC/ST status
                  </label>
                  <Button type="submit" variant="secondary" className="text-xs py-2">Add Person</Button>
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
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

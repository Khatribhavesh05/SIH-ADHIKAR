import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { projectScopeWhere } from "@/lib/queries/scope";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { formatINR, formatDate } from "@/lib/domain/format";
import { upsertDisbursement } from "./actions";
import type { AffectedPerson, Disbursement } from "@prisma/client";

type ClaimantRow = { claimant: AffectedPerson; disbursement: Disbursement | undefined };

export default async function DisbursementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const canMark = PERMISSIONS[user.role].markDisbursement;

  const project = await prisma.project.findFirst({
    where: { id, ...projectScopeWhere(user.role, user) },
    include: {
      award: { include: { disbursements: true } },
      parcels: { include: { affectedPersons: true } },
    },
  });
  if (!project) notFound();

  if (!project.award) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-serif-heading text-2xl font-semibold">Compensation Disbursement</h1>
        <Panel className="p-6 text-sm text-ink-muted">
          No award on file yet — disbursement tracking begins once Stage 6 is complete.
        </Panel>
      </div>
    );
  }

  const award = project.award;
  const claimants = project.parcels.flatMap((p) => p.affectedPersons);
  const rows: ClaimantRow[] = claimants.map((claimant) => ({
    claimant,
    disbursement: award.disbursements.find((d) => d.claimantId === claimant.id),
  }));

  const columns: DataColumn<ClaimantRow>[] = [
    { key: "name", header: "Claimant", primary: true, render: ({ claimant }) => claimant.name },
    { key: "role", header: "Role", render: ({ claimant }) => <span className="text-ink-muted">{claimant.role}</span> },
    {
      key: "amount",
      header: "Disbursed amount",
      className: "font-mono-data",
      render: ({ disbursement: d }) => (d ? formatINR(Number(d.disbursedAmount)) : "—"),
    },
    {
      key: "date",
      header: "Date",
      className: "font-mono-data",
      render: ({ disbursement: d }) => (d ? formatDate(d.disbursementDate) : "—"),
    },
    {
      key: "delay",
      header: "Days delayed",
      render: ({ disbursement: d }) =>
        d && d.daysDelayedPastAward > 0 ? (
          <Badge tone="danger">{d.daysDelayedPastAward} days</Badge>
        ) : d ? (
          <Badge tone="success">On time</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "interest",
      header: "Additional interest (9% p.a.)",
      className: "font-mono-data",
      render: ({ disbursement: d }) =>
        d && Number(d.additionalInterestAccrued) > 0 ? formatINR(Number(d.additionalInterestAccrued)) : "—",
    },
    ...(canMark
      ? [
          {
            key: "update",
            header: "Update",
            render: ({ claimant, disbursement: d }: ClaimantRow) => {
              const action = upsertDisbursement.bind(null, project.id, award.id, claimant.id);
              return (
                <details>
                  <summary className="text-brand text-xs cursor-pointer hover:underline py-1">
                    {d ? "Edit" : "Mark disbursed"}
                  </summary>
                  <form action={action} className="flex flex-col gap-2 mt-2 w-full sm:w-48">
                    <input
                      name="disbursedAmount"
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      defaultValue={d ? Number(d.disbursedAmount) : ""}
                      className="input font-mono-data text-xs"
                      required
                    />
                    <input
                      name="disbursementDate"
                      type="date"
                      defaultValue={d?.disbursementDate?.toISOString().slice(0, 10) ?? ""}
                      className="input font-mono-data text-xs"
                    />
                    <Button type="submit" className="text-xs py-2">Save</Button>
                  </form>
                </details>
              );
            },
          } satisfies DataColumn<ClaimantRow>,
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Compensation Disbursement</h1>
        <p className="text-sm text-ink-muted mt-1">
          {project.title} · Award date: {formatDate(award.awardDate)} · Final compensation:{" "}
          {formatINR(Number(award.finalCompensationAmount))}
        </p>
      </div>

      <Panel raised>
        <ResponsiveDataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.claimant.id}
          emptyMessage="No affected persons recorded for this project."
        />
      </Panel>
    </div>
  );
}

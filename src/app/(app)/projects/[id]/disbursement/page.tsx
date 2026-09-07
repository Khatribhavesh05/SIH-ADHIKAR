import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatINR, formatDate } from "@/lib/domain/format";
import { upsertDisbursement } from "./actions";

export default async function DisbursementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const canMark = PERMISSIONS[user.role].markDisbursement;

  const project = await prisma.project.findUnique({
    where: { id },
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

  const claimants = project.parcels.flatMap((p) => p.affectedPersons);
  const award = project.award;

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted border-b border-hairline">
                <th className="px-5 py-2.5 font-medium">Claimant</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Disbursed amount</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Days delayed</th>
                <th className="px-5 py-2.5 font-medium">Additional interest (9% p.a.)</th>
                {canMark && <th className="px-5 py-2.5 font-medium">Update</th>}
              </tr>
            </thead>
            <tbody>
              {claimants.map((claimant) => {
                const disb = award.disbursements.find((d) => d.claimantId === claimant.id);
                const action = upsertDisbursement.bind(null, project.id, award.id, claimant.id);
                return (
                  <tr key={claimant.id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-2.5">{claimant.name}</td>
                    <td className="px-5 py-2.5 text-ink-muted">{claimant.role}</td>
                    <td className="px-5 py-2.5 font-mono-data">
                      {disb ? formatINR(Number(disb.disbursedAmount)) : "—"}
                    </td>
                    <td className="px-5 py-2.5 font-mono-data">{disb ? formatDate(disb.disbursementDate) : "—"}</td>
                    <td className="px-5 py-2.5">
                      {disb && disb.daysDelayedPastAward > 0 ? (
                        <Badge tone="danger">{disb.daysDelayedPastAward} days</Badge>
                      ) : disb ? (
                        <Badge tone="success">On time</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-2.5 font-mono-data">
                      {disb && Number(disb.additionalInterestAccrued) > 0
                        ? formatINR(Number(disb.additionalInterestAccrued))
                        : "—"}
                    </td>
                    {canMark && (
                      <td className="px-5 py-2.5">
                        <details>
                          <summary className="text-brand text-xs cursor-pointer hover:underline">
                            {disb ? "Edit" : "Mark disbursed"}
                          </summary>
                          <form action={action} className="flex flex-col gap-2 mt-2 w-48">
                            <input
                              name="disbursedAmount"
                              type="number"
                              step="0.01"
                              placeholder="Amount"
                              defaultValue={disb ? Number(disb.disbursedAmount) : ""}
                              className="input font-mono-data text-xs"
                              required
                            />
                            <input
                              name="disbursementDate"
                              type="date"
                              defaultValue={disb?.disbursementDate?.toISOString().slice(0, 10) ?? ""}
                              className="input font-mono-data text-xs"
                            />
                            <Button type="submit" className="text-xs py-1">Save</Button>
                          </form>
                        </details>
                      </td>
                    )}
                  </tr>
                );
              })}
              {claimants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-ink-muted text-sm">
                    No affected persons recorded for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

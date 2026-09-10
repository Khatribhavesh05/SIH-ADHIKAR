import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectScopeWhere } from "@/lib/queries/scope";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ResponsiveDataTable, type DataColumn } from "@/components/ui/ResponsiveDataTable";
import { formatDate } from "@/lib/domain/format";

const FILE_KINDS: Record<string, string> = {
  notification: "Notification Proof",
  sia: "SIA Report",
  award: "Award Document",
};

interface DocRow {
  key: string;
  project: string;
  kind: string;
  name: string;
  date: Date | null;
}

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: projectScopeWhere(user.role, user),
    include: { notifications: true, siaRecords: true, award: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  const rows: DocRow[] = [];

  for (const p of projects) {
    for (const n of p.notifications) {
      rows.push({
        key: n.id,
        project: p.title,
        kind: FILE_KINDS.notification,
        name: `${n.type === "PRELIMINARY_S11" ? "Preliminary" : "Declaration"} — ${n.gazetteReference}`,
        date: n.publicationDate,
      });
    }
    for (const s of p.siaRecords) {
      rows.push({ key: s.id, project: p.title, kind: FILE_KINDS.sia, name: "Social Impact Assessment Report", date: null });
    }
    if (p.award) {
      rows.push({ key: p.award.id, project: p.title, kind: FILE_KINDS.award, name: "Award Determination", date: p.award.awardDate });
    }
  }

  const columns: DataColumn<DocRow>[] = [
    { key: "name", header: "Document", primary: true, render: (r) => r.name },
    { key: "project", header: "Project", render: (r) => <span className="text-ink-muted">{r.project}</span> },
    { key: "kind", header: "Type", render: (r) => <Badge tone="brand">{r.kind}</Badge> },
    { key: "date", header: "Date", className: "font-mono-data", render: (r) => formatDate(r.date) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif-heading text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-ink-muted mt-1">
            Notification proofs, SIA reports, and award documents across projects in scope.
          </p>
        </div>
        <Button variant="secondary" disabled title="File upload coming soon" className="w-full sm:w-auto justify-center">
          Upload
        </Button>
      </div>

      <Panel raised>
        <ResponsiveDataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.key}
          emptyMessage="No documents on file yet."
        />
      </Panel>
    </div>
  );
}

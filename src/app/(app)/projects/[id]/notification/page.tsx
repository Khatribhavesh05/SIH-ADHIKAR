import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { submitNotification } from "@/app/(app)/projects/actions";

export default async function NotificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!PERMISSIONS[user.role].submitNotification) redirect(`/projects/${id}`);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const action = submitNotification.bind(null, id);

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="font-serif-heading text-2xl font-semibold">Submit Notification</h1>
        <p className="text-sm text-ink-muted mt-1">{project.title}</p>
      </div>

      <Panel raised className="p-6">
        <form action={action} className="flex flex-col gap-5">
          <Field label="Notification type">
            <select name="type" className="input" defaultValue="PRELIMINARY_S11">
              <option value="PRELIMINARY_S11">Preliminary Notification (Section 11)</option>
              <option value="DECLARATION_S19">Declaration (Section 19)</option>
            </select>
          </Field>

          <Field label="Publication date">
            <input name="publicationDate" type="date" required className="input font-mono-data" />
          </Field>

          <Field label="Gazette reference">
            <input name="gazetteReference" required className="input" placeholder="e.g. G.S.R. 412(E), dated..." />
          </Field>

          <Field label="Newspaper reference">
            <input name="newspaperReference" required className="input" placeholder="e.g. Times of India, 12 Mar 2026, p.7" />
          </Field>

          <Field label="Objection window deadline">
            <input name="objectionWindowDeadline" type="date" required className="input font-mono-data" />
          </Field>

          <p className="text-xs text-ink-muted">
            Notice-board proof upload is a placeholder in this prototype.
          </p>

          <div className="flex justify-end pt-2">
            <Button type="submit">Submit Notification</Button>
          </div>
        </form>
      </Panel>
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

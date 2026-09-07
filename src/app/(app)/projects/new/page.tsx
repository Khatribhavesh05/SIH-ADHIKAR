import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/domain/roles";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { createProject } from "@/app/(app)/projects/actions";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!PERMISSIONS[user.role].createProject) redirect("/projects");

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="font-serif-heading text-2xl font-semibold">New Project</h1>

      <Panel raised className="p-6">
        <form action={createProject} className="flex flex-col gap-5">
          <Field label="Project title">
            <input name="title" required className="input" placeholder="NH-44 Widening — Package 3" />
          </Field>

          <Field label="Requiring body">
            <input name="requiringBody" required className="input" placeholder="National Highways Authority of India" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Acquisition route">
              <select name="acquisitionRoute" className="input" defaultValue="RFCTLARR">
                <option value="RFCTLARR">RFCTLARR</option>
                <option value="RAILWAY_ACT">Railway Act</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Project type">
              <select name="projectType" className="input" defaultValue="GOVERNMENT">
                <option value="GOVERNMENT">Government</option>
                <option value="PRIVATE">Private</option>
                <option value="PPP">Public-Private Partnership</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="State">
              <select name="state" required className="input" defaultValue="">
                <option value="" disabled>Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="District">
              <input name="district" required className="input" placeholder="e.g. Nashik" />
            </Field>
          </div>

          <Field label="Total area (acres)">
            <input
              name="totalAreaAcres"
              type="number"
              step="0.01"
              min="0"
              required
              className="input font-mono-data"
              placeholder="0.00"
            />
          </Field>
          <p className="text-xs text-ink-muted -mt-3">
            Projects at or above 100 acres will require an R&amp;R Committee (Section 44).
          </p>

          <div className="flex justify-end pt-2">
            <Button type="submit">Create Project</Button>
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

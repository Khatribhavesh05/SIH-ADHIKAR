import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MobileFieldForm } from "@/components/app/MobileFieldForm";
import { GovSeal } from "@/components/ui/GovSeal";

export default async function MobileFieldCapturePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      <header className="border-b border-hairline px-4 py-3 flex items-center gap-2.5 sticky top-0 bg-paper z-10">
        <GovSeal size={28} />
        <div>
          <div className="font-serif-heading font-semibold text-sm">Field Data Capture</div>
          <div className="text-[11px] text-ink-muted">Stage 5 — survey &amp; measurement</div>
        </div>
      </header>
      <MobileFieldForm officerName={user.name} />
    </div>
  );
}

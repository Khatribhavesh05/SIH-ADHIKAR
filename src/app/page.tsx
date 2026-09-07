import { LinkButton } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { GovSeal } from "@/components/ui/GovSeal";
import { LedgerHero } from "@/components/app/LedgerHero";
import { StageTracker } from "@/components/app/StageTracker";
import { PublicStatusCheck } from "@/components/app/PublicStatusCheck";

const FEATURES = [
  {
    title: "Compensation Calculator",
    desc: "Section 25–30 award computation — market value, solatium, multiplier, and delay interest, computed live as a transparent ledger.",
  },
  {
    title: "Deadline & Lapse Risk Tracking",
    desc: "The 12-month award deadline and 5-year lapse deadline (Section 24(2)), tracked against every project with color-coded risk.",
  },
  {
    title: "GIS Geo-tagging",
    desc: "Parcel boundaries and coordinates captured at the Stage 5 survey/measurement step, not bolted on afterward.",
  },
  {
    title: "Mobile Field Capture (PWA)",
    desc: "Installable, offline-tolerant field data entry for surveys conducted away from reliable connectivity.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GovSeal size={36} />
            <div>
              <div className="font-serif-heading font-semibold text-sm leading-tight">Adhikar</div>
              <div className="text-[11px] text-ink-muted leading-tight">
                National Land Acquisition &amp; Management System
              </div>
            </div>
          </div>
          <LinkButton href="/login" variant="primary">
            Login to Dashboard
          </LinkButton>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-serif-heading text-4xl md:text-5xl font-semibold leading-[1.1] text-ink">
              A single national record of every land acquisition, from notification to possession.
            </h1>
            <p className="mt-5 text-ink-muted max-w-[60ch] text-[15px] leading-relaxed">
              Adhikar digitizes the nine-stage RFCTLARR Act 2013 process — notification, social
              impact assessment, declaration, award, disbursement, possession, and rehabilitation —
              into one workflow, replacing the gazette, newspaper, and notice-board paper trail with
              a single, auditable system of record.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <LedgerHero />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-serif-heading text-2xl font-semibold mb-6">
            Land acquisition is the single largest cause of infrastructure delay in India
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Panel className="p-5">
              <div className="font-mono-data text-3xl text-brand mb-2">35%</div>
              <p className="text-sm text-ink-muted">
                of stalled highway projects were delayed due to land acquisition disputes —
                driven by inaccurate land records, stakeholder resistance, and prolonged
                compensation negotiations (2025 Parliamentary Standing Committee report,
                Ministry of Road Transport and Highways).
              </p>
            </Panel>
            <Panel className="p-5">
              <div className="font-mono-data text-3xl text-brand mb-2">₹186.86 cr</div>
              <p className="text-sm text-ink-muted">
                paid solely as 12% statutory interest on a single metro project, after the
                Final Notification was issued beyond its prescribed 270-day window — a CAG
                performance audit (Report No. 7 of 2026) into the Bangalore Metro (BMRCL).
                Money spent purely because of delay, not land value.
              </p>
            </Panel>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-serif-heading text-2xl font-semibold mb-2">
            The nine-stage statutory process
          </h2>
          <p className="text-sm text-ink-muted mb-8 max-w-[72ch]">
            Every project on the platform moves through this lifecycle — the same tracker
            shown here appears on every project&rsquo;s detail page inside the app.
          </p>
          <StageTracker currentStage="STAGE_6_AWARD" compact />
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-serif-heading text-2xl font-semibold mb-8">What the platform does</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <Panel key={f.title} className="p-5">
                <h3 className="font-medium text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col items-center text-center gap-5">
          <h2 className="font-serif-heading text-2xl font-semibold">
            Sign in with your official account
          </h2>
          <p className="text-sm text-ink-muted max-w-[52ch]">
            Access is role-based — Requiring Body, Collector, R&amp;R Administrator, R&amp;R
            Commissioner, and Central Ministry Viewer accounts each see a different workflow.
          </p>
          <LinkButton href="/login" variant="primary" className="px-6 py-3 text-base">
            Login to Dashboard
          </LinkButton>

          <div className="w-full max-w-sm mt-6">
            <PublicStatusCheck />
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-muted flex items-center justify-between">
          <span>Adhikar — SIH26016 Prototype</span>
          <span>Ministry of Rural Development · Department of Land Resources (prototype)</span>
        </div>
      </footer>
    </div>
  );
}

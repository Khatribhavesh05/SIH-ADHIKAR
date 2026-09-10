import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { GovSeal } from "@/components/ui/GovSeal";
import { LinkButton } from "@/components/ui/Button";
import { PWASplitDetector } from "@/components/app/PWASplitDetector";
import { ProcessStepper } from "@/components/app/ProcessStepper";
import { NationalCommandCenter } from "@/components/app/NationalCommandCenter";
import { ShieldCheck, Building2, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function LandingPage() {
  const projects = await prisma.project.findMany({
    include: {
      award: {
        include: {
          disbursements: { include: { claimant: true } },
        },
      },
      possession: true,
      parcels: { include: { affectedPersons: true } },
      consentRecord: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink overflow-x-hidden">
      <PWASplitDetector />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-paper-raised/95 backdrop-blur-md border-b border-hairline shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <GovSeal size={34} />
            <div>
              <div className="font-serif-heading font-bold text-base text-brand-dark leading-tight">Adhikar</div>
              <div className="text-[10px] text-ink-muted leading-tight font-medium hidden sm:block">
                National Land Acquisition Command Center
              </div>
            </div>
          </Link>

          {/* Right: Nav, Login */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-ink-muted">
              <a href="#about" className="hover:text-brand transition-colors">About</a>
              <a href="#how-it-works" className="hover:text-brand transition-colors">How it Works</a>
              <a href="#preview" className="hover:text-brand transition-colors">Live Dashboard Preview</a>
              <a href="#who-uses-this" className="hover:text-brand transition-colors">Who Uses This</a>
            </nav>

            <LinkButton href="/login" variant="primary" className="text-xs px-4 py-2 min-h-0 font-semibold shadow-xs">
              Login to Portal
            </LinkButton>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-brand-dark text-white border-b border-hairline py-20 lg:py-28 overflow-hidden">
        {/* Full-bleed background image with dark overlay */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity">
          <Image
            src="/images/hero_bg.jpg"
            alt="Indian Infrastructure Corridor"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/70 z-0" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-saffron/40 bg-saffron/10 text-saffron text-xs font-semibold uppercase tracking-wider">
              <span>National Prototype · SIH26016</span>
            </div>

            <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white tracking-tight">
              India&rsquo;s Real-Time Land Acquisition Command Center
            </h1>

            <p className="text-paper/90 text-base sm:text-lg max-w-[65ch] leading-relaxed">
              Tracking every land acquisition project in the country against its legal deadlines — so nothing gets lost in paperwork.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#preview"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-saffron text-white font-semibold text-sm hover:bg-saffron/90 transition-all shadow-md cursor-pointer"
              >
                View Live Dashboard <ArrowRight className="w-4 h-4" />
              </a>
              <LinkButton href="/login" variant="secondary" className="px-5 py-3 text-sm !bg-white !text-brand-dark !border-white hover:!bg-paper font-semibold">
                Sign in to Official Portal
              </LinkButton>
            </div>
          </div>

          {/* Stat Box Strip */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-4 rounded-md border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="font-mono-data text-3xl font-extrabold text-saffron">35%</div>
              <div className="text-xs text-paper/80 mt-1">of stalled highway projects delayed by land disputes</div>
            </div>

            <div className="p-4 rounded-md border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="font-mono-data text-3xl font-extrabold text-saffron">₹186.86 Cr</div>
              <div className="text-xs text-paper/80 mt-1">lost by one project — to a missed deadline, not land cost</div>
            </div>

            <div className="p-4 rounded-md border border-white/15 bg-white/5 backdrop-blur-sm">
              <div className="font-mono-data text-3xl font-extrabold text-white">9 Stages</div>
              <div className="text-xs text-paper/80 mt-1">legal statutory workflow into 1 unified command system</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="about" className="py-16 border-b border-hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
            The Paperwork Fragmentation Bottleneck
          </h2>
          <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-8">
            Why infrastructure projects stall in physical paper trails
          </p>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-4 text-sm text-ink-muted leading-relaxed">
              <p>
                Land acquisition across India has historically been fragmented across physical gazette notices, regional newspapers, and Gram Panchayat notice-board postings. Without a central digital command record, statutory deadlines lapse silently — resulting in severe interest penalties and costly litigation.
              </p>
              <p>
                <strong>Adhikar</strong> unifies all statutory steps under the RFCTLARR Act 2013 into a single transparent ledger, auto-computing Section 26–30 compensation formulas, Section 25 award deadlines, and Section 24(2) 5-year lapse risks in real time.
              </p>
            </div>

            <div className="rounded-md border border-hairline overflow-hidden shadow-xs bg-paper p-2">
              <Image
                src="/images/problem_graphic.jpg"
                alt="Paperwork to Digital Dashboard"
                width={600}
                height={450}
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DASHBOARD PREVIEW */}
      <section id="preview" className="py-16 border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
            <div>
              <span className="text-xs font-bold text-saffron uppercase tracking-wider">Live System Preview</span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-brand-dark mt-1">
                National Land Acquisition Command Center
              </h2>
            </div>
          </div>

          <div className="border border-hairline rounded-md p-4 bg-paper-raised shadow-md">
            <NationalCommandCenter projects={projects as any} interactive={false} />
          </div>
        </div>
      </section>

      {/* 9-STAGE PROCESS BANNER */}
      <section id="how-it-works" className="py-16 border-b border-hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8">
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-brand-dark">
              The 9-Stage Statutory Process
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Click or hover over any stage in the workflow to inspect its legal parameters and system rules.
            </p>
          </div>

          <ProcessStepper />

          <div className="mt-8 rounded-md border border-hairline overflow-hidden shadow-xs bg-paper p-2">
            <Image
              src="/images/process_banner.jpg"
              alt="9-Stage Process Journey Illustration"
              width={1200}
              height={675}
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      </section>

      {/* WHO USES THIS (3 CARDS ONLY) */}
      <section id="who-uses-this" className="py-16 border-b border-hairline bg-paper">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-brand-dark">
              Who Uses This Platform
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Role-based access designed specifically for government land acquisition authorities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col gap-4">
              <div className="p-3 rounded-full bg-brand-tint w-fit text-brand">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Acquisition Team</h3>
                <div className="text-xs font-semibold text-saffron mt-0.5">Requiring Body &amp; Collector</div>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Submits project proposals, confirms R&amp;R cost deposits, conducts SIA and public hearings, measures land parcels, and determines compensation awards.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col gap-4">
              <div className="p-3 rounded-full bg-saffron-tint w-fit text-saffron">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Rehabilitation Team</h3>
                <div className="text-xs font-semibold text-saffron mt-0.5">R&amp;R Administrator &amp; Commissioner</div>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Drafts Second Schedule R&amp;R schemes, manages claimant entitlement records, obtains Commissioner approval, and tracks mandatory 5-channel publication.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col gap-4">
              <div className="p-3 rounded-full bg-brand-tint w-fit text-brand">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Ministry Oversight</h3>
                <div className="text-xs font-semibold text-saffron mt-0.5">Central Ministry Viewer</div>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Nationwide oversight dashboard tracking overall project health, state risk heatmaps, statutory deadline compliance, and national Cost of Delay metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER WITH WATERMARK */}
      <footer className="relative bg-brand-dark text-white border-t border-hairline py-10 overflow-hidden">
        {/* Low opacity India watermark background */}
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-screen pointer-events-none">
          <Image
            src="/images/india_watermark.jpg"
            alt="India Outline Watermark"
            fill
            className="object-contain object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-paper/80">
          <div className="flex items-center gap-2">
            <GovSeal size={28} />
            <div>
              <div className="font-semibold text-white">Adhikar — National Land Acquisition Command Center</div>
              <div>Built for SIH26016 · Ministry of Rural Development · Dept of Land Resources</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

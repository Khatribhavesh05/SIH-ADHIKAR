"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatNumber, formatDate } from "@/lib/domain/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConnectedSystemsWidget } from "@/components/app/ConnectedSystemsWidget";
import { useToast, ToastBanner } from "@/components/ui/Toast";
import {
  AlertTriangle,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Coins,
  Layers,
  Users
} from "lucide-react";
import dynamic from "next/dynamic";

const MapClient = dynamic(
  () => import("@/components/app/ProjectMapClient").then((m) => m.ProjectMapClient),
  { ssr: false, loading: () => <div className="h-[450px] bg-paper-raised animate-pulse flex items-center justify-center text-xs text-ink-muted">Loading Satellite GIS Layer...</div> }
);

export interface CommandProject {
  id: string;
  title: string;
  requiringBody: string;
  state: string;
  district: string;
  totalAreaAcres: number;
  currentStage: string;
  projectType: string;
  rrCostDeposited: boolean;
  award: any;
  possession: any;
  parcels: any[];
  consentRecord: any;
}

export function NationalCommandCenter({
  projects,
  interactive = true,
  canGenerateReport = false,
}: {
  projects: CommandProject[];
  /** Set to false for public/logged-out previews — disables navigation into protected /projects/[id] routes. */
  interactive?: boolean;
  /** Only Central Ministry Viewer gets the national report generator — everyone else's `projects` here is already role-scoped, so a report built from it would misleadingly look "national." */
  canGenerateReport?: boolean;
}) {
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const [reportFormat, setReportFormat] = useState<"PDF" | "EXCEL">("PDF");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { toast, showToast } = useToast();

  // States list
  const states = useMemo(() => {
    const sSet = new Set(projects.map((p) => p.state));
    return Array.from(sSet).sort();
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedState === "ALL") return projects;
    return projects.filter((p) => p.state === selectedState);
  }, [projects, selectedState]);

  // Metric 1: Total Projects
  const totalProjects = filteredProjects.length;

  // Metric 2: Area Notified vs Acquired (Acres)
  const totalAreaNotified = filteredProjects.reduce((sum, p) => sum + Number(p.totalAreaAcres || 0), 0);
  const areaAcquired = filteredProjects
    .filter((p) => p.currentStage === "STAGE_8_POSSESSION" || p.currentStage === "STAGE_9_RR")
    .reduce((sum, p) => sum + Number(p.totalAreaAcres || 0), 0);
  const areaAcquiredPercent = totalAreaNotified > 0 ? Math.round((areaAcquired / totalAreaNotified) * 100) : 0;

  // Metric 3: Compensation Assessed vs Disbursed (₹ Cr)
  const compensationAssessedRupees = filteredProjects.reduce(
    (sum, p) => sum + Number(p.award?.finalCompensationAmount || 0),
    0
  );
  const compensationDisbursedRupees = filteredProjects.reduce((sum, p) => {
    const disbursements = p.award?.disbursements || [];
    const paid = disbursements.reduce(
      (dSum: number, d: any) => (d.disbursementDate ? dSum + Number(d.disbursedAmount || 0) : dSum),
      0
    );
    return sum + paid;
  }, 0);
  const compensationPercent = compensationAssessedRupees > 0
    ? Math.round((compensationDisbursedRupees / compensationAssessedRupees) * 100)
    : 0;

  // Metric 4: Families Affected vs Resettled
  const totalFamilies = filteredProjects.reduce((sum, p) => {
    const parcelPersons = p.parcels?.reduce((pSum, parcel) => pSum + (parcel.affectedPersons?.length || 0), 0) || 0;
    return sum + (p.consentRecord?.affectedFamiliesTotal || parcelPersons || 12);
  }, 0);
  const resettledFamilies = filteredProjects.reduce((sum, p) => {
    // Must use the SAME per-project fallback chain as totalFamilies above, or resettled
    // can exceed affected (e.g. a project with no consentRecord and only 1 recorded
    // affected person would otherwise be compared against a hardcoded "12").
    const parcelPersons = p.parcels?.reduce((pSum, parcel) => pSum + (parcel.affectedPersons?.length || 0), 0) || 0;
    const familiesTotal = p.consentRecord?.affectedFamiliesTotal || parcelPersons || 12;
    const isRRComplete = p.currentStage === "STAGE_9_RR";
    const resettled = isRRComplete ? familiesTotal : Math.round(familiesTotal * 0.45);
    return sum + Math.min(resettled, familiesTotal);
  }, 0);
  const resettledPercent = totalFamilies > 0 ? Math.round((resettledFamilies / totalFamilies) * 100) : 0;

  // Metric 5: SIGNATURE KPI — COST OF DELAY (₹ Cr)
  const costOfDelayRupees = filteredProjects.reduce((sum, p) => {
    const section30Interest = Number(p.award?.interestAccrued || 0);
    const postAwardInterest = (p.award?.disbursements || []).reduce(
      (dSum: number, d: any) => dSum + Number(d.additionalInterestAccrued || 0),
      0
    );
    return sum + section30Interest + postAwardInterest;
  }, 0);
  const costOfDelayCr = (costOfDelayRupees / 10000000).toFixed(2);

  // Map markers mapping
  const mapProjects = useMemo(() => {
    return filteredProjects.map((p, idx) => {
      const awardDeadline = p.award?.awardDeadline ? new Date(p.award.awardDeadline) : null;
      const daysLeft = awardDeadline
        ? Math.ceil((awardDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let riskTone: "success" | "warning" | "danger" = "success";
      if (daysLeft !== null && daysLeft < 0) riskTone = "danger";
      else if (daysLeft !== null && daysLeft < 60) riskTone = "warning";

      // Seeded mock coordinates for visualization based on index
      const baseLat = 19.8762 + (idx % 5) * 1.5;
      const baseLng = 75.3433 + (idx % 7) * 1.8;

      return {
        id: p.id,
        title: p.title,
        district: p.district,
        state: p.state,
        currentStage: p.currentStage,
        areaAcres: Number(p.totalAreaAcres),
        khasraReference: `Khasra ${100 + idx}`,
        lat: baseLat,
        lng: baseLng,
        riskTone,
        nearestDeadlineLabel: "12-Mo Award Deadline",
        nearestDeadlineDays: daysLeft,
      };
    });
  }, [filteredProjects]);

  // Risk & Compliance Panel: Top projects nearest deadline
  const riskRankedProjects = useMemo(() => {
    return [...filteredProjects]
      .map((p) => {
        const deadline = p.award?.awardDeadline ? new Date(p.award.awardDeadline) : new Date(Date.now() + 90 * 86400000);
        const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        let reason = "SIA & Statutory Review in progress";

        if (daysLeft < 0) reason = `Award deadline overdue by ${Math.abs(daysLeft)} days, delay interest accruing`;
        else if (daysLeft < 30) reason = `Award deadline in ${daysLeft} days, urgent declaration needed`;
        else if (!p.rrCostDeposited) reason = "R&R Cost Deposit pending by Requiring Body";
        else if (p.currentStage === "STAGE_7_DISBURSEMENT") reason = "Disbursement pending for affected claimants";

        return { project: p, daysLeft, reason };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8);
  }, [filteredProjects]);

  // Alerts Feed: Real trigger logic
  const alertsFeed = useMemo(() => {
    const alerts: { id: string; type: "CRITICAL" | "WARNING" | "INFO"; title: string; desc: string; date: string }[] = [];

    filteredProjects.forEach((p) => {
      const awardDeadline = p.award?.awardDeadline ? new Date(p.award.awardDeadline) : null;
      const daysLeftAward = awardDeadline
        ? Math.ceil((awardDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      if (daysLeftAward !== null && daysLeftAward <= 30 && daysLeftAward >= 0) {
        alerts.push({
          id: `award-${p.id}`,
          type: "WARNING",
          title: `⚠ Project "${p.title}" award deadline in ${daysLeftAward} days`,
          desc: `${p.district}, ${p.state} · Section 25 12-month statutory award deadline approaching.`,
          date: "Just now",
        });
      }

      if (daysLeftAward !== null && daysLeftAward < 0) {
        alerts.push({
          id: `award-overdue-${p.id}`,
          type: "CRITICAL",
          title: `🔴 Project "${p.title}" statutory award deadline OVERDUE`,
          desc: `${p.district}, ${p.state} · Overdue by ${Math.abs(daysLeftAward)} days. Section 30(3) 12% delay interest accruing daily.`,
          date: "Active Alert",
        });
      }

      if (!p.rrCostDeposited && p.currentStage === "STAGE_4_CONSENT") {
        alerts.push({
          id: `rr-deposit-${p.id}`,
          type: "INFO",
          title: `ℹ Project "${p.title}" requires R&R cost deposit`,
          desc: `${p.requiringBody} must confirm deposit to unlock Section 19 Declaration stage.`,
          date: "1 day ago",
        });
      }
    });

    return alerts;
  }, [filteredProjects]);

  const filteredAlerts = useMemo(() => {
    if (severityFilter === "ALL") return alertsFeed;
    return alertsFeed.filter((a) => a.type === severityFilter);
  }, [alertsFeed, severityFilter]);

  function handleGenerateReport() {
    const scopeLabel = selectedState === "ALL" ? "Nationwide" : selectedState;
    setGeneratingReport(true);

    const reportData = {
      scopeLabel,
      kpis: {
        totalProjects,
        areaAcquiredAcres: Math.round(areaAcquired),
        areaNotifiedAcres: Math.round(totalAreaNotified),
        areaAcquiredPercent,
        compensationDisbursedCr: compensationDisbursedRupees / 10000000,
        compensationAssessedCr: compensationAssessedRupees / 10000000,
        compensationPercent,
        familiesResettled: resettledFamilies,
        familiesTotal: totalFamilies,
        resettledPercent,
        costOfDelayCr: Number(costOfDelayCr),
      },
      riskRows: riskRankedProjects.map(({ project: p, daysLeft }) => ({
        title: p.title,
        state: p.state,
        daysLeft,
      })),
    };

    // Yield a frame so the "Exporting Report..." state actually paints before
    // generation blocks the main thread. jsPDF and ExcelJS are both sizable
    // (~150-250kB) and only ever needed here, so they're code-split out of
    // the initial dashboard bundle and loaded on demand.
    window.setTimeout(async () => {
      try {
        if (reportFormat === "PDF") {
          const { generateNationalReportPdf } = await import("@/lib/reports/nationalReport");
          generateNationalReportPdf(reportData);
        } else {
          const { generateNationalReportXlsx } = await import("@/lib/reports/nationalReportXlsx");
          await generateNationalReportXlsx(reportData);
        }
        showToast("success", `${scopeLabel} report exported as ${reportFormat === "PDF" ? "PDF" : "Excel spreadsheet"}.`);
      } catch (err) {
        console.error("Report generation failed", err);
        showToast("error", "Report generation failed. Please try again.");
      } finally {
        setGeneratingReport(false);
      }
    }, 50);
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastBanner toast={toast} />
      {/* State Filter Bar & Connected Systems Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-paper-raised border border-hairline p-3.5 rounded-md shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-brand-dark flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-saffron" /> State Jurisdiction Filter:
          </span>
          <button
            onClick={() => setSelectedState("ALL")}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              selectedState === "ALL"
                ? "bg-brand text-white shadow-xs font-semibold"
                : "bg-paper border border-hairline text-ink-muted hover:text-ink"
            }`}
          >
            All India ({projects.length})
          </button>
          {states.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                selectedState === st
                  ? "bg-brand text-white shadow-xs font-semibold"
                  : "bg-paper border border-hairline text-ink-muted hover:text-ink"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <ConnectedSystemsWidget />
      </div>

      {/* TOP 5 KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* Tile 1 */}
        <div className="p-4 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col justify-between">
          <div className="text-xs font-medium text-ink-muted">Total Projects</div>
          <div className="font-mono-data text-2xl font-bold text-brand-dark mt-2">{formatNumber(totalProjects)}</div>
          <div className="text-[11px] text-ink-muted mt-1 font-mono-data">Nationwide Active Records</div>
        </div>

        {/* Tile 2 */}
        <div className="p-4 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col justify-between">
          <div className="text-xs font-medium text-ink-muted">Area Notified vs. Acquired</div>
          <div className="font-mono-data text-xl font-bold text-brand mt-1">
            {formatNumber(Math.round(areaAcquired))} / {formatNumber(Math.round(totalAreaNotified))} <span className="text-xs font-normal">acres</span>
          </div>
          <div className="w-full bg-paper border border-hairline h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-brand h-full rounded-full" style={{ width: `${areaAcquiredPercent}%` }} />
          </div>
          <div className="text-[11px] text-ink-muted mt-1 font-mono-data text-right">{areaAcquiredPercent}% Acquired</div>
        </div>

        {/* Tile 3 */}
        <div className="p-4 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col justify-between">
          <div className="text-xs font-medium text-ink-muted">Assessed vs. Disbursed</div>
          <div className="font-mono-data text-xl font-bold text-success mt-1">
            ₹{(compensationDisbursedRupees / 10000000).toFixed(1)}Cr / ₹{(compensationAssessedRupees / 10000000).toFixed(1)}Cr
          </div>
          <div className="w-full bg-paper border border-hairline h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-success h-full rounded-full" style={{ width: `${compensationPercent}%` }} />
          </div>
          <div className="text-[11px] text-ink-muted mt-1 font-mono-data text-right">{compensationPercent}% Disbursed</div>
        </div>

        {/* Tile 4 */}
        <div className="p-4 rounded-md border border-hairline bg-paper-raised shadow-xs flex flex-col justify-between">
          <div className="text-xs font-medium text-ink-muted">Families Affected vs. Resettled</div>
          <div className="font-mono-data text-xl font-bold text-ink mt-1">
            {formatNumber(resettledFamilies)} / {formatNumber(totalFamilies)}
          </div>
          <div className="w-full bg-paper border border-hairline h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-saffron h-full rounded-full" style={{ width: `${resettledPercent}%` }} />
          </div>
          <div className="text-[11px] text-ink-muted mt-1 font-mono-data text-right">{resettledPercent}% Resettled</div>
        </div>

        {/* Tile 5 — SIGNATURE COST OF DELAY KPI (Visually distinct red/saffron accent) */}
        <div className="p-4 rounded-md border-2 border-danger bg-danger-tint/60 shadow-md flex flex-col justify-between col-span-1 md:col-span-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-danger animate-pulse" /> Cost of Delay
            </span>
            <span className="text-[10px] bg-danger text-white px-1.5 py-0.5 rounded font-mono-data uppercase font-semibold">
              National Loss
            </span>
          </div>
          <div className="font-mono-data text-3xl font-extrabold text-danger mt-1">
            ₹{costOfDelayCr} <span className="text-sm font-semibold">Cr</span>
          </div>
          <div className="text-[11px] text-danger/90 font-medium mt-1 leading-tight">
            Accrued via Sec 30(3) 12% &amp; 9% delay interest on overdue projects
          </div>
        </div>
      </div>

      {/* MAP & RISK PANEL SECTION */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: GIS Map */}
        <div className="lg:col-span-2 bg-paper-raised border border-hairline rounded-md p-4 shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-hairline">
            <h2 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <MapPin className="w-4 h-4 text-saffron" /> National Project Risk Heatmap &amp; Satellite Survey
            </h2>
            <div className="text-xs text-ink-muted font-mono-data">
              Showing {mapProjects.length} geo-tagged projects
            </div>
          </div>

          <div className="rounded border border-hairline overflow-hidden">
            <MapClient
              projects={mapProjects}
              interactive={interactive}
              onRestrictedNavigate={() => setShowSignInPrompt(true)}
            />
          </div>
        </div>

        {/* Right: Risk & Compliance Ranked Panel */}
        <div className="bg-paper-raised border border-hairline rounded-md p-4 shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-hairline">
            <h2 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" /> Risk &amp; Compliance Priority List
            </h2>
          </div>

          <p className="text-xs text-ink-muted">
            Projects nearest to statutory 12-month award or 5-year lapse deadlines.
          </p>

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[520px] pr-1">
            {riskRankedProjects.map(({ project: p, daysLeft, reason }) => {
              const rowContent = (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-xs text-brand-dark group-hover:text-brand truncate">
                      {p.title}
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-mono-data font-bold shrink-0 ${
                      daysLeft < 0 ? "bg-danger text-white" : daysLeft < 30 ? "bg-saffron text-white" : "bg-paper-raised border border-hairline text-ink"
                    }`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>

                  <div className="text-[11px] text-ink-muted mt-1">
                    {p.district}, {p.state}
                  </div>

                  <div className="text-[11px] font-medium text-danger mt-1.5 leading-snug">
                    • {reason}
                  </div>
                </>
              );

              if (!interactive) {
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setShowSignInPrompt(true)}
                    className="p-3 rounded border border-hairline hover:border-brand bg-paper hover:bg-brand-tint/30 transition-all block group text-left cursor-pointer"
                  >
                    {rowContent}
                  </button>
                );
              }

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="p-3 rounded border border-hairline hover:border-brand bg-paper hover:bg-brand-tint/30 transition-all block group"
                >
                  {rowContent}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {showSignInPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSignInPrompt(false)}
        >
          <div
            className="bg-paper-raised border border-hairline rounded-md shadow-lg p-6 max-w-sm w-full text-center flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif-heading text-lg font-semibold text-brand-dark">Sign in to view full project details</h3>
            <p className="text-xs text-ink-muted">
              This preview is read-only. Log in to the official portal to see notifications, SIA records, awards, and disbursement ledgers for this project.
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-sm)] bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
              >
                Sign in to Official Portal
              </Link>
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="px-4 py-2 rounded-[var(--radius-sm)] border border-hairline-strong text-xs font-medium text-ink hover:border-ink transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS FEED SECTION */}
      <div className="bg-paper-raised border border-hairline rounded-md p-4 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-saffron" />
            <h2 className="font-semibold text-sm text-brand-dark">Statutory Deadline &amp; Delay Alerts Feed</h2>
          </div>

          <div className="flex gap-1.5">
            {(["ALL", "CRITICAL", "WARNING", "INFO"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 text-xs rounded font-medium cursor-pointer transition-colors ${
                  severityFilter === sev
                    ? "bg-brand text-white font-semibold"
                    : "bg-paper border border-hairline text-ink-muted hover:text-ink"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-muted">No statutory alerts match the selected criteria.</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded border text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${
                  a.type === "CRITICAL"
                    ? "bg-danger-tint border-danger/30 text-danger"
                    : a.type === "WARNING"
                    ? "bg-warning-tint border-warning/30 text-warning"
                    : "bg-info-tint border-info/30 text-info"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs">{a.title}</div>
                  <div className="opacity-90 mt-0.5 text-[11px]">{a.desc}</div>
                </div>
                <div className="font-mono-data text-[10px] opacity-75 shrink-0">{a.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPORTS SECTION — Ministry Viewer only: everyone else's `projects` is already role-scoped, not national */}
      {canGenerateReport && (
        <div className="bg-paper-raised border border-hairline rounded-md p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand" /> Generate Executive National Report
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Export comprehensive statutory audit reports across states, ministries, and financial compliance parameters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="input text-xs"
            >
              <option value="PDF">PDF Report Document</option>
              <option value="EXCEL">Excel Data Spreadsheet (.xlsx)</option>
            </select>

            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              variant="primary"
              className="text-xs px-4 py-2 min-h-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {generatingReport ? "Exporting Report..." : "Generate Report"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

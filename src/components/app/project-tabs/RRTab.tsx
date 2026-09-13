"use client";

import { formatDate } from "@/lib/domain/format";
import { LinkButton } from "@/components/ui/Button";
import { Building2, Award as AwardIcon, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

export function RRTab({ project, userRole }: { project: any; userRole: Role }) {
  const rrScheme = project.rrScheme;
  const isLargeProject = Number(project.totalAreaAcres || 0) >= 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-hairline">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Stage 9 — Rehabilitation &amp; Resettlement (R&amp;R) Scheme</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Sections 31–45 R&amp;R scheme preparation, commissioner approval, and statutory channel publication.
          </p>
        </div>
        {(userRole === "RR_ADMINISTRATOR" || userRole === "RR_COMMISSIONER" || userRole === "COLLECTOR") && (
          <LinkButton href={`/projects/${project.id}/rr`} variant="primary" className="text-xs px-3 py-1.5 min-h-0">
            Open R&amp;R Management Portal
          </LinkButton>
        )}
      </div>

      {/* 100+ Acre R&R Committee Badge */}
      {isLargeProject && (
        <div className="p-4 rounded-md border border-saffron/40 bg-saffron-tint/50 flex items-center gap-3 text-xs text-saffron">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">
              ★ Statutory Badge: 100+ Acre Project — R&amp;R Committee Required
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              Section 45 Mandate: Projects acquiring 100 or more acres require a dedicated Rehabilitation &amp; Resettlement Committee chaired by the Collector.
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* R&R Scheme Approval Status */}
        <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-4">
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" /> Scheme Approval Pipeline
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-hairline">
              <span className="text-ink-muted">R&amp;R Administrator Draft Status</span>
              <span className="font-mono-data font-semibold text-brand">{rrScheme?.draftStatus || "NOT_STARTED"}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-hairline">
              <span className="text-ink-muted">Collector Review Status</span>
              <span className="font-mono-data font-semibold text-brand">{rrScheme?.collectorReviewStatus || "NOT_STARTED"}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-hairline">
              <span className="text-ink-muted">R&amp;R Commissioner Approval</span>
              <span className="font-mono-data font-semibold text-brand">{rrScheme?.commissionerApprovalStatus || "NOT_STARTED"}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-ink-muted">Section 44 Public Channel Publication</span>
              <span className="font-mono-data font-semibold text-success">{rrScheme?.publicationStatus || "NOT_STARTED"}</span>
            </div>
          </div>
        </div>

        {/* Administrator info & Entitlements summary */}
        <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-3">
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <AwardIcon className="w-4 h-4 text-saffron" /> R&amp;R Entitlements Overview
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Second Schedule mandatory benefits: Constructive housing for displaced families, choice of annuity / employment, and lump-sum transport allowances.
          </p>

          <div className="mt-2 text-xs font-mono-data text-ink flex flex-col gap-1.5 p-3 rounded bg-paper-raised border border-hairline">
            <div>Administrator: <strong>{rrScheme?.administratorName || "Suresh Patel (Assigned)"}</strong></div>
            <div>R&amp;R Committee Required: <strong>{isLargeProject ? "YES (≥100 Acres)" : "NO (<100 Acres)"}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

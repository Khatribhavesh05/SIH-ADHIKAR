import { riskStatusForDeadline, daysUntil, AT_RISK_WINDOW_MONTHS, type RiskStatus } from "@/lib/domain/compensation";

export interface ProjectRiskInput {
  award: { awardDeadline: Date; awardDate: Date | null } | null;
  possession: { lapseRiskDeadline: Date | null; possessionDate: Date | null } | null;
}

export interface ProjectRiskDeadline {
  type: "award" | "lapse";
  label: string;
  deadline: Date;
  status: RiskStatus;
  days: number;
}

export interface ProjectRisk {
  /** Worst-case status across both tracked deadlines — drives marker/row color. */
  overall: RiskStatus;
  award: ProjectRiskDeadline | null;
  lapse: ProjectRiskDeadline | null;
  /** The single nearest still-relevant deadline, for compact display (e.g. map popups). */
  nearest: ProjectRiskDeadline | null;
}

const STATUS_ORDER: Record<RiskStatus, number> = { DANGER: 0, WARNING: 1, SAFE: 2 };

/**
 * Single source of truth for project risk — used by both the Deadline &
 * Risk dashboard and the GIS map's marker color-coding, so the two never
 * drift out of sync on what counts as "at risk".
 */
export function computeProjectRisk(project: ProjectRiskInput): ProjectRisk {
  let award: ProjectRiskDeadline | null = null;
  if (project.award && !project.award.awardDate) {
    const deadline = project.award.awardDeadline;
    award = {
      type: "award",
      label: "Award deadline (S.25)",
      deadline,
      status: riskStatusForDeadline(deadline, AT_RISK_WINDOW_MONTHS),
      days: daysUntil(deadline),
    };
  }

  let lapse: ProjectRiskDeadline | null = null;
  if (project.possession?.lapseRiskDeadline && !project.possession.possessionDate) {
    const deadline = project.possession.lapseRiskDeadline;
    lapse = {
      type: "lapse",
      label: "Lapse deadline (S.24(2))",
      deadline,
      status: riskStatusForDeadline(deadline, AT_RISK_WINDOW_MONTHS),
      days: daysUntil(deadline),
    };
  }

  const candidates = [award, lapse].filter((d): d is ProjectRiskDeadline => d !== null);
  const overall: RiskStatus =
    candidates.length === 0
      ? "SAFE"
      : candidates.reduce((worst, d) => (STATUS_ORDER[d.status] < STATUS_ORDER[worst] ? d.status : worst), "SAFE" as RiskStatus);

  const nearest = candidates.length === 0
    ? null
    : candidates.reduce((closest, d) => (d.days < closest.days ? d : closest));

  return { overall, award, lapse, nearest };
}

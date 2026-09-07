/**
 * Stage 6 — Award / Compensation Determination (RFCTLARR Act 2013, Sections 25-30).
 * Ledger sequence and rates are taken verbatim from
 * DOCS/Land-Acquisition-Process-Research.pdf and the build prompt — do not
 * simplify or re-derive from the Act text directly.
 *
 * Sequence:
 *   Market Value      = MAX(circle rate x area, sale deed average x area)
 *   + Asset Value
 *   + Solatium         (100% of Market Value — compulsory-acquisition premium)
 *   x Multiplier       (4x rural / 2x urban)
 *   + Interest         (12% p.a. on market value, notification date -> award/possession date, whichever first)
 *   = Final Compensation Amount
 */

export type AreaType = "RURAL" | "URBAN";

export const RURAL_MULTIPLIER = 4;
export const URBAN_MULTIPLIER = 2;
export const DELAY_INTEREST_RATE_PA = 0.12; // Section 30(3)
export const DISBURSEMENT_DELAY_INTEREST_RATE_PA = 0.09; // post-award payment delay
export const AWARD_WINDOW_MONTHS = 12; // Section 25
export const LAPSE_WINDOW_YEARS = 5; // Section 24(2)
export const AT_RISK_WINDOW_MONTHS = 6;
export const RR_COMMITTEE_AREA_THRESHOLD_ACRES = 100;

export function multiplierFor(areaType: AreaType) {
  return areaType === "RURAL" ? RURAL_MULTIPLIER : URBAN_MULTIPLIER;
}

function yearsBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 365.25));
}

export interface CompensationInputs {
  circleRatePerAcre: number;
  saleDeedAveragePerAcre: number;
  areaAcres: number;
  assetValue: number;
  areaType: AreaType;
  /** Stage 1/2 notification publication date — interest accrual start (Section 30(3)). */
  notificationDate: Date | null;
  /** Stage 5 declaration date — used as fallback interest start when no notification is on file. */
  declarationDate: Date;
  /** Stage 6 award date, if already announced. */
  awardDate: Date | null;
  /** Stage 8 possession date, if it precedes the award date. */
  possessionDate: Date | null;
}

export interface CompensationBreakdown {
  marketValue: number;
  afterAssetValue: number;
  solatiumAmount: number;
  afterSolatium: number;
  multiplier: number;
  afterMultiplier: number;
  interestAccrued: number;
  finalCompensationAmount: number;
  interestAccrualYears: number;
}

export function calculateCompensation(
  inputs: CompensationInputs
): CompensationBreakdown {
  const marketValue =
    Math.max(inputs.circleRatePerAcre, inputs.saleDeedAveragePerAcre) *
    inputs.areaAcres;

  const afterAssetValue = marketValue + inputs.assetValue;
  const solatiumAmount = marketValue * 1.0;
  const afterSolatium = afterAssetValue + solatiumAmount;

  const multiplier = multiplierFor(inputs.areaType);
  const afterMultiplier = afterSolatium * multiplier;

  const interestStart = inputs.notificationDate ?? inputs.declarationDate;
  const candidateEnds = [inputs.awardDate, inputs.possessionDate].filter(
    (d): d is Date => d !== null
  );
  const interestEnd =
    candidateEnds.length > 0
      ? new Date(Math.min(...candidateEnds.map((d) => d.getTime())))
      : null;

  const interestAccrualYears = interestEnd
    ? yearsBetween(interestStart, interestEnd)
    : 0;
  const interestAccrued =
    marketValue * DELAY_INTEREST_RATE_PA * interestAccrualYears;

  const finalCompensationAmount = afterMultiplier + interestAccrued;

  return {
    marketValue,
    afterAssetValue,
    solatiumAmount,
    afterSolatium,
    multiplier,
    afterMultiplier,
    interestAccrued,
    finalCompensationAmount,
    interestAccrualYears,
  };
}

export function awardDeadline(declarationDate: Date): Date {
  const d = new Date(declarationDate);
  d.setMonth(d.getMonth() + AWARD_WINDOW_MONTHS);
  return d;
}

export function lapseRiskDeadline(awardDate: Date): Date {
  const d = new Date(awardDate);
  d.setFullYear(d.getFullYear() + LAPSE_WINDOW_YEARS);
  return d;
}

export type RiskStatus = "SAFE" | "WARNING" | "DANGER";

export function riskStatusForDeadline(
  deadline: Date,
  warningWindowMonths: number,
  now: Date = new Date()
): RiskStatus {
  const warningStart = new Date(deadline);
  warningStart.setMonth(warningStart.getMonth() - warningWindowMonths);

  if (now > deadline) return "DANGER";
  if (now >= warningStart) return "WARNING";
  return "SAFE";
}

export function daysUntil(deadline: Date, now: Date = new Date()): number {
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Post-award disbursement delay — Section 30(3), 9% p.a. from award date until paid. */
export function calculateDisbursementDelay(
  awardDate: Date,
  disbursedAmount: number,
  disbursementDate: Date | null,
  now: Date = new Date()
) {
  const paidOrNow = disbursementDate ?? now;
  const daysDelayed = Math.max(
    0,
    Math.ceil((paidOrNow.getTime() - awardDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const years = daysDelayed / 365.25;
  const additionalInterestAccrued =
    daysDelayed > 0
      ? disbursedAmount * DISBURSEMENT_DELAY_INTEREST_RATE_PA * years
      : 0;

  return { daysDelayed, additionalInterestAccrued };
}

export function isRRCommitteeRequired(totalAreaAcres: number): boolean {
  return totalAreaAcres >= RR_COMMITTEE_AREA_THRESHOLD_ACRES;
}

export function consentThresholdPercent(
  projectType: "GOVERNMENT" | "PRIVATE" | "PPP"
): number | null {
  if (projectType === "PRIVATE") return 80;
  if (projectType === "PPP") return 70;
  return null;
}

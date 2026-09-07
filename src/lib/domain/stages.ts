export type ProjectStage =
  | "STAGE_1_NOTIFICATION"
  | "STAGE_2_SIA"
  | "STAGE_3_EXPERT_APPRAISAL"
  | "STAGE_4_CONSENT"
  | "STAGE_5_DECLARATION"
  | "STAGE_6_AWARD"
  | "STAGE_7_DISBURSEMENT"
  | "STAGE_8_POSSESSION"
  | "STAGE_9_RR";

export interface StageDef {
  key: ProjectStage;
  order: number;
  shortLabel: string;
  label: string;
  section: string;
  /** One-line description for the tracker's hover tooltip — from the process research doc. */
  description: string;
}

export const STAGES: StageDef[] = [
  { key: "STAGE_1_NOTIFICATION", order: 1, shortLabel: "Notification", label: "Preliminary Notification (S.11)", section: "S.11", description: "Intent to acquire is published in the Gazette, local newspapers, and village notice boards; landowners may file objections." },
  { key: "STAGE_2_SIA", order: 2, shortLabel: "Impact Assessment", label: "Social Impact Assessment", section: "SIA", description: "A mandatory study of the acquisition's effect on displaced communities, livelihoods, and the environment, with a public hearing." },
  { key: "STAGE_3_EXPERT_APPRAISAL", order: 3, shortLabel: "Expert Review", label: "Independent Expert Appraisal", section: "Expert Group", description: "An independent expert group reviews the SIA and can approve, modify, or reject the project outright." },
  { key: "STAGE_4_CONSENT", order: 4, shortLabel: "Consent", label: "Consent Requirement", section: "Private/PPP", description: "Private (80%) or PPP (70%) projects need consent from that share of affected families before proceeding." },
  { key: "STAGE_5_DECLARATION", order: 5, shortLabel: "Declaration", label: "Declaration (S.19)", section: "S.19", description: "Formal declaration of acquisition; the Collector surveys the land and invites ownership and compensation claims." },
  { key: "STAGE_6_AWARD", order: 6, shortLabel: "Award", label: "Award — Compensation (S.25-30)", section: "S.25-30", description: "Compensation determined per Sections 25–30, within 12 months of declaration." },
  { key: "STAGE_7_DISBURSEMENT", order: 7, shortLabel: "Disbursement", label: "Compensation Disbursement", section: "Payment", description: "Payment is made to landowners and other claimants, apportioned per their ownership claims." },
  { key: "STAGE_8_POSSESSION", order: 8, shortLabel: "Possession", label: "Possession (S.38)", section: "S.38", description: "Physical possession is handed over; if compensation is unpaid within 5 years, the acquisition can lapse (S.24(2))." },
  { key: "STAGE_9_RR", order: 9, shortLabel: "R&R", label: "Rehabilitation & Resettlement", section: "S.43-44", description: "Resettlement, allowances, and livelihood support — running partly in parallel with Stages 5-8." },
];

export function stageOrder(stage: ProjectStage): number {
  return STAGES.find((s) => s.key === stage)?.order ?? 1;
}

export type Role =
  | "REQUIRING_BODY"
  | "COLLECTOR"
  | "RR_ADMINISTRATOR"
  | "RR_COMMISSIONER"
  | "CENTRAL_MINISTRY_VIEWER";

export const ROLE_LABELS: Record<Role, string> = {
  REQUIRING_BODY: "Requiring Body",
  COLLECTOR: "Collector",
  RR_ADMINISTRATOR: "R&R Administrator",
  RR_COMMISSIONER: "R&R Commissioner",
  CENTRAL_MINISTRY_VIEWER: "Central Ministry Viewer",
};

export const ALL_ROLES: Role[] = [
  "REQUIRING_BODY",
  "COLLECTOR",
  "RR_ADMINISTRATOR",
  "RR_COMMISSIONER",
  "CENTRAL_MINISTRY_VIEWER",
];

export type Access = "none" | "view" | "edit";

/**
 * Permission matrix — see DOCS/Land-Acquisition-Stakeholders-Bottlenecks-Modules-DataModel.pdf
 * and the build prompt's permission table. Enforced both here (UI) and in API routes (server).
 */
export const PERMISSIONS: Record<
  Role,
  {
    createProject: boolean;
    deleteProject: boolean;
    submitNotification: boolean;
    editDisputeStatus: boolean;
    manageParcels: boolean;
    compensationCalculator: Access;
    markDisbursement: boolean;
    draftRRScheme: boolean;
    reviewRRScheme: boolean;
    approveRRScheme: boolean;
    setDepositFlag: boolean;
    setConsentCount: boolean;
    recordPossession: boolean;
    deadlineScope: "own_projects" | "own_district" | "own_state" | "national";
    analyticsScope: "none" | "district" | "state" | "national";
  }
> = {
  REQUIRING_BODY: {
    createProject: true,
    deleteProject: true,
    submitNotification: false,
    editDisputeStatus: true,
    manageParcels: false,
    compensationCalculator: "view",
    markDisbursement: false,
    draftRRScheme: false,
    reviewRRScheme: false,
    approveRRScheme: false,
    setDepositFlag: true,
    setConsentCount: true,
    recordPossession: false,
    deadlineScope: "own_projects",
    analyticsScope: "none",
  },
  COLLECTOR: {
    createProject: false,
    deleteProject: false,
    submitNotification: true,
    editDisputeStatus: true,
    manageParcels: true,
    compensationCalculator: "edit",
    markDisbursement: true,
    draftRRScheme: false,
    reviewRRScheme: true,
    approveRRScheme: false,
    setDepositFlag: false,
    setConsentCount: false,
    recordPossession: true,
    deadlineScope: "own_district",
    analyticsScope: "district",
  },
  RR_ADMINISTRATOR: {
    createProject: false,
    deleteProject: false,
    submitNotification: false,
    editDisputeStatus: false,
    manageParcels: false,
    compensationCalculator: "none",
    markDisbursement: false,
    draftRRScheme: true,
    reviewRRScheme: false,
    approveRRScheme: false,
    setDepositFlag: false,
    setConsentCount: false,
    recordPossession: false,
    deadlineScope: "own_district",
    analyticsScope: "none",
  },
  RR_COMMISSIONER: {
    createProject: false,
    deleteProject: false,
    submitNotification: false,
    editDisputeStatus: false,
    manageParcels: false,
    compensationCalculator: "none",
    markDisbursement: false,
    draftRRScheme: false,
    reviewRRScheme: false,
    approveRRScheme: true,
    setDepositFlag: false,
    setConsentCount: false,
    recordPossession: false,
    deadlineScope: "own_state",
    analyticsScope: "state",
  },
  CENTRAL_MINISTRY_VIEWER: {
    createProject: false,
    deleteProject: false,
    submitNotification: false,
    editDisputeStatus: false,
    manageParcels: false,
    compensationCalculator: "view",
    markDisbursement: false,
    draftRRScheme: false,
    reviewRRScheme: false,
    approveRRScheme: false,
    setDepositFlag: false,
    setConsentCount: false,
    recordPossession: false,
    deadlineScope: "national",
    analyticsScope: "national",
  },
};

export function can(role: Role, action: keyof typeof PERMISSIONS.COLLECTOR) {
  return PERMISSIONS[role][action];
}

import type { Role } from "@/lib/domain/roles";

/**
 * Seeded demo accounts (see prisma/seed.ts) and their shared password.
 * "View As" (src/components/app/AccountSwitcher.tsx) uses these to do a
 * REAL sign-in swap to the target role's actual account — not a cosmetic
 * label change. This is safe to expose client-side: it's a hackathon demo
 * password already published on the login page, not a production secret.
 */
export const DEMO_PASSWORD = "Demo@12345";

export const DEMO_ACCOUNTS: Record<Role, string> = {
  REQUIRING_BODY: "requiringbody@demo.gov.in",
  COLLECTOR: "collector@demo.gov.in",
  RR_ADMINISTRATOR: "rradmin@demo.gov.in",
  RR_COMMISSIONER: "rrcommissioner@demo.gov.in",
  CENTRAL_MINISTRY_VIEWER: "ministry@demo.gov.in",
};

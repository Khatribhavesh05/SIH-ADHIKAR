-- Defense-in-depth: enable RLS on every public table with no policies (default-deny
-- for anon/authenticated). The app never queries Postgres as anon/authenticated —
-- all access goes through Prisma using the table-owner role (which bypasses RLS
-- regardless), with authorization enforced in Next.js server actions/routes. This
-- guards against a future accidental GRANT to anon/authenticated exposing data via
-- Supabase's auto-generated PostgREST API.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LandParcel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AffectedPerson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SIARecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Award" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Disbursement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Possession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RRScheme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RREntitlement" ENABLE ROW LEVEL SECURITY;

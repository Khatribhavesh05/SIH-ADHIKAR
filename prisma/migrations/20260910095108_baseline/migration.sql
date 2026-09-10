-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions" VERSION "1.11";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions" VERSION "1.3";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog" VERSION "1.0";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions" VERSION "3.3.7";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault" VERSION "0.3.1";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions" VERSION "1.1";

-- CreateEnum
CREATE TYPE "public"."AcquisitionRoute" AS ENUM ('RFCTLARR', 'RAILWAY_ACT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AffectedPersonRole" AS ENUM ('OWNER', 'CO_OWNER', 'AGRICULTURAL_LABORER', 'OTHER_LIVELIHOOD_DEPENDENT');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('NOT_STARTED', 'DRAFTED', 'PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."AreaType" AS ENUM ('RURAL', 'URBAN');

-- CreateEnum
CREATE TYPE "public"."DisputeStatus" AS ENUM ('NONE', 'FILED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."EntitlementStatus" AS ENUM ('PENDING', 'APPROVED', 'DISBURSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."EntitlementType" AS ENUM ('HOUSING', 'TRANSPORT_ALLOWANCE', 'EMPLOYMENT', 'ANNUITY');

-- CreateEnum
CREATE TYPE "public"."ExpertGroupOutcome" AS ENUM ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."LandClassification" AS ENUM ('AGRICULTURAL_MULTI_CROP_IRRIGATED', 'AGRICULTURAL_SINGLE_CROP', 'AGRICULTURAL_UNIRRIGATED', 'NON_AGRICULTURAL', 'BARREN', 'FOREST', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LapseStatus" AS ENUM ('SAFE', 'AT_RISK', 'LAPSED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PRELIMINARY_S11', 'DECLARATION_S19');

-- CreateEnum
CREATE TYPE "public"."ProjectStage" AS ENUM ('STAGE_1_NOTIFICATION', 'STAGE_2_SIA', 'STAGE_3_EXPERT_APPRAISAL', 'STAGE_4_CONSENT', 'STAGE_5_DECLARATION', 'STAGE_6_AWARD', 'STAGE_7_DISBURSEMENT', 'STAGE_8_POSSESSION', 'STAGE_9_RR');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('GOVERNMENT', 'PRIVATE', 'PPP');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('REQUIRING_BODY', 'COLLECTOR', 'RR_ADMINISTRATOR', 'RR_COMMISSIONER', 'CENTRAL_MINISTRY_VIEWER');

-- CreateTable
CREATE TABLE "public"."AffectedPerson" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."AffectedPersonRole" NOT NULL,
    "scStStatus" BOOLEAN NOT NULL DEFAULT false,
    "ownershipClaimDetails" TEXT,
    "compensationClaimAmount" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffectedPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Award" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "declarationDate" TIMESTAMP(3) NOT NULL,
    "awardDeadline" TIMESTAMP(3) NOT NULL,
    "awardDate" TIMESTAMP(3),
    "circleRate" DECIMAL(14,2) NOT NULL,
    "saleDeedAverage" DECIMAL(14,2) NOT NULL,
    "assetValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "areaType" "public"."AreaType" NOT NULL DEFAULT 'RURAL',
    "marketValue" DECIMAL(16,2) NOT NULL,
    "solatiumAmount" DECIMAL(16,2) NOT NULL,
    "multiplier" DECIMAL(3,1) NOT NULL,
    "interestAccrued" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "finalCompensationAmount" DECIMAL(16,2) NOT NULL,
    "disputeStatus" "public"."DisputeStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsentRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "affectedFamiliesTotal" INTEGER NOT NULL,
    "consentsCollected" INTEGER NOT NULL DEFAULT 0,
    "thresholdPercent" DECIMAL(5,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disbursement" (
    "id" TEXT NOT NULL,
    "awardId" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "disbursedAmount" DECIMAL(16,2) NOT NULL,
    "disbursementDate" TIMESTAMP(3),
    "daysDelayedPastAward" INTEGER NOT NULL DEFAULT 0,
    "additionalInterestAccrued" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LandParcel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "surveyNumber" TEXT NOT NULL,
    "khasraNumber" TEXT NOT NULL,
    "khataNumber" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "tehsil" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "areaAcres" DECIMAL(10,2) NOT NULL,
    "landClassification" "public"."LandClassification" NOT NULL,
    "isMultiCropIrrigated" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandParcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "gazetteReference" TEXT NOT NULL,
    "newspaperReference" TEXT NOT NULL,
    "noticeBoardProofUrl" TEXT,
    "objectionWindowDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Possession" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "possessionDate" TIMESTAMP(3),
    "lapseRiskDeadline" TIMESTAMP(3),
    "lapseStatus" "public"."LapseStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',

    CONSTRAINT "Possession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requiringBody" TEXT NOT NULL,
    "acquisitionRoute" "public"."AcquisitionRoute" NOT NULL DEFAULT 'RFCTLARR',
    "projectType" "public"."ProjectType" NOT NULL DEFAULT 'GOVERNMENT',
    "currentStage" "public"."ProjectStage" NOT NULL DEFAULT 'STAGE_1_NOTIFICATION',
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "totalAreaAcres" DECIMAL(12,2) NOT NULL,
    "rrCostDeposited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RREntitlement" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "entitlementType" "public"."EntitlementType" NOT NULL,
    "status" "public"."EntitlementStatus" NOT NULL DEFAULT 'PENDING',
    "disbursementDate" TIMESTAMP(3),

    CONSTRAINT "RREntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RRScheme" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "administratorName" TEXT,
    "draftStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "collectorReviewStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "commissionerApprovalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "publicationStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "rrCommitteeRequired" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RRScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SIARecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportDocumentUrl" TEXT,
    "publicHearingSummary" TEXT,
    "expertGroupOutcome" "public"."ExpertGroupOutcome" NOT NULL DEFAULT 'PENDING',
    "expertGroupJustification" TEXT,
    "isMultiCropFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SIARecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "jurisdictionState" TEXT,
    "jurisdictionDistrict" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Award_projectId_key" ON "public"."Award"("projectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_projectId_key" ON "public"."ConsentRecord"("projectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Possession_projectId_key" ON "public"."Possession"("projectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RRScheme_projectId_key" ON "public"."RRScheme"("projectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "public"."User"("authUserId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."AffectedPerson" ADD CONSTRAINT "AffectedPerson_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "public"."LandParcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Award" ADD CONSTRAINT "Award_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsentRecord" ADD CONSTRAINT "ConsentRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disbursement" ADD CONSTRAINT "Disbursement_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "public"."Award"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disbursement" ADD CONSTRAINT "Disbursement_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "public"."AffectedPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LandParcel" ADD CONSTRAINT "LandParcel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Possession" ADD CONSTRAINT "Possession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RREntitlement" ADD CONSTRAINT "RREntitlement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."AffectedPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RREntitlement" ADD CONSTRAINT "RREntitlement_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "public"."RRScheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RRScheme" ADD CONSTRAINT "RRScheme_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SIARecord" ADD CONSTRAINT "SIARecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;


// Node 20 has no native WebSocket global; @supabase/supabase-js's
// RealtimeClient requires one to exist even though this script never
// uses realtime features.
import WS from "ws";
(globalThis as { WebSocket?: unknown }).WebSocket ??= WS;

import { createClient } from "@supabase/supabase-js";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  calculateCompensation,
  awardDeadline,
  lapseRiskDeadline,
  isRRCommitteeRequired,
  consentThresholdPercent,
  calculateDisbursementDelay,
} from "../src/lib/domain/compensation";

const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_PASSWORD = "Demo@12345";

// Requiring Body's "your projects" scope (see own_projects case in
// src/lib/queries/scope.ts) is keyed on literal project ownership
// (createdByUserId), matching one project per real-world Requiring Body
// account. This seed script has only one demo REQUIRING_BODY login for
// all 18 seeded projects, so only the project it's meant to represent in
// the demo narrative gets tied to it — otherwise the demo account would
// (incorrectly) show up as creator of every project in the dataset.
const RB_DEMO_OWNED_PROJECT_TITLE = "Patna Riverfront Flood Barrier";

const DEMO_USERS = [
  { email: "requiringbody@demo.gov.in", name: "Anil Kulkarni", role: "REQUIRING_BODY" as const, state: "Maharashtra", district: null },
  { email: "collector@demo.gov.in", name: "Priya Nair", role: "COLLECTOR" as const, state: "Maharashtra", district: "Nashik" },
  { email: "rradmin@demo.gov.in", name: "Suresh Patel", role: "RR_ADMINISTRATOR" as const, state: "Gujarat", district: "Vadodara" },
  { email: "rrcommissioner@demo.gov.in", name: "Meenakshi Iyer", role: "RR_COMMISSIONER" as const, state: "Tamil Nadu", district: null },
  { email: "ministry@demo.gov.in", name: "Rajesh Sharma", role: "CENTRAL_MINISTRY_VIEWER" as const, state: null, district: null },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}
function yearsAgo(n: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

const STAGES = [
  "STAGE_1_NOTIFICATION", "STAGE_2_SIA", "STAGE_3_EXPERT_APPRAISAL", "STAGE_4_CONSENT",
  "STAGE_5_DECLARATION", "STAGE_6_AWARD", "STAGE_7_DISBURSEMENT", "STAGE_8_POSSESSION", "STAGE_9_RR",
] as const;

interface ProjectSeed {
  title: string;
  requiringBody: string;
  acquisitionRoute: "RFCTLARR" | "RAILWAY_ACT" | "OTHER";
  projectType: "GOVERNMENT" | "PRIVATE" | "PPP";
  state: string;
  district: string;
  totalAreaAcres: number;
  currentStage: typeof STAGES[number];
  declarationMonthsAgo?: number;
  awardMonthsAgo?: number | null;
  possessionYearsAgo?: number | null;
  areaType: "RURAL" | "URBAN";
}

const PROJECT_SEEDS: ProjectSeed[] = [
  { title: "NH-160 Widening — Nashik Bypass", requiringBody: "National Highways Authority of India", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Maharashtra", district: "Nashik", totalAreaAcres: 42.5, currentStage: "STAGE_1_NOTIFICATION", areaType: "RURAL" },
  { title: "Aurangabad Industrial Corridor Phase 2", requiringBody: "Maharashtra Industrial Development Corporation", acquisitionRoute: "RFCTLARR", projectType: "PPP", state: "Maharashtra", district: "Aurangabad", totalAreaAcres: 210, currentStage: "STAGE_4_CONSENT", areaType: "RURAL" },
  { title: "Pune Metro Line 4 Extension", requiringBody: "Maharashtra Metro Rail Corporation", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Maharashtra", district: "Pune", totalAreaAcres: 18.2, currentStage: "STAGE_5_DECLARATION", declarationMonthsAgo: 2, areaType: "URBAN" },
  { title: "Vadodara Elevated Corridor", requiringBody: "Gujarat State Road Development Corporation", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Gujarat", district: "Vadodara", totalAreaAcres: 65, currentStage: "STAGE_6_AWARD", declarationMonthsAgo: 11, areaType: "URBAN" },
  { title: "Kutch Solar Park Transmission Line", requiringBody: "Gujarat Energy Transmission Corporation", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Gujarat", district: "Kutch", totalAreaAcres: 130, currentStage: "STAGE_6_AWARD", declarationMonthsAgo: 13, areaType: "RURAL" },
  { title: "Surat Textile Park Access Road", requiringBody: "Surat Municipal Corporation", acquisitionRoute: "RFCTLARR", projectType: "PRIVATE", state: "Gujarat", district: "Surat", totalAreaAcres: 8.4, currentStage: "STAGE_3_EXPERT_APPRAISAL", areaType: "URBAN" },
  { title: "Chennai Peripheral Ring Road", requiringBody: "Tamil Nadu Highways Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Tamil Nadu", district: "Chennai", totalAreaAcres: 340, currentStage: "STAGE_7_DISBURSEMENT", declarationMonthsAgo: 20, awardMonthsAgo: 6, areaType: "URBAN" },
  { title: "Coimbatore Irrigation Canal Realignment", requiringBody: "Tamil Nadu Water Resources Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Tamil Nadu", district: "Coimbatore", totalAreaAcres: 55, currentStage: "STAGE_8_POSSESSION", declarationMonthsAgo: 58, awardMonthsAgo: 54, possessionYearsAgo: null, areaType: "RURAL" },
  { title: "Madurai-Rameswaram Rail Doubling", requiringBody: "Southern Railway", acquisitionRoute: "RAILWAY_ACT", projectType: "GOVERNMENT", state: "Tamil Nadu", district: "Madurai", totalAreaAcres: 27, currentStage: "STAGE_2_SIA", areaType: "RURAL" },
  { title: "Lucknow-Kanpur Expressway Link", requiringBody: "Uttar Pradesh Expressways Industrial Development Authority", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Uttar Pradesh", district: "Kanpur Nagar", totalAreaAcres: 175, currentStage: "STAGE_6_AWARD", declarationMonthsAgo: 12.5, areaType: "RURAL" },
  { title: "Varanasi Riverfront Redevelopment", requiringBody: "Varanasi Development Authority", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Uttar Pradesh", district: "Varanasi", totalAreaAcres: 12.8, currentStage: "STAGE_9_RR", declarationMonthsAgo: 30, awardMonthsAgo: 26, areaType: "URBAN" },
  { title: "Jaipur Ring Road Extension", requiringBody: "Rajasthan Public Works Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Rajasthan", district: "Jaipur", totalAreaAcres: 88, currentStage: "STAGE_5_DECLARATION", declarationMonthsAgo: 1, areaType: "RURAL" },
  { title: "Jodhpur Renewable Energy Corridor", requiringBody: "Rajasthan Renewable Energy Corporation", acquisitionRoute: "RFCTLARR", projectType: "PPP", state: "Rajasthan", district: "Jodhpur", totalAreaAcres: 460, currentStage: "STAGE_4_CONSENT", areaType: "RURAL" },
  { title: "Kolkata East-West Metro Extension", requiringBody: "Kolkata Metro Rail Corporation", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "West Bengal", district: "Kolkata", totalAreaAcres: 22, currentStage: "STAGE_7_DISBURSEMENT", declarationMonthsAgo: 15, awardMonthsAgo: 3, areaType: "URBAN" },
  { title: "Bhubaneswar Outer Ring Road", requiringBody: "Odisha Works Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Odisha", district: "Khordha", totalAreaAcres: 145, currentStage: "STAGE_6_AWARD", declarationMonthsAgo: 11.8, areaType: "RURAL" },
  { title: "Kochi Waterway Terminal Expansion", requiringBody: "Kerala Maritime Board", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Kerala", district: "Ernakulam", totalAreaAcres: 9.6, currentStage: "STAGE_1_NOTIFICATION", areaType: "URBAN" },
  { title: "Amritsar-Jalandhar Expressway", requiringBody: "Punjab Public Works Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Punjab", district: "Jalandhar", totalAreaAcres: 195, currentStage: "STAGE_8_POSSESSION", declarationMonthsAgo: 62, awardMonthsAgo: 57, possessionYearsAgo: 4.8, areaType: "RURAL" },
  { title: "Patna Riverfront Flood Barrier", requiringBody: "Bihar Water Resources Department", acquisitionRoute: "RFCTLARR", projectType: "GOVERNMENT", state: "Bihar", district: "Patna", totalAreaAcres: 31, currentStage: "STAGE_3_EXPERT_APPRAISAL", areaType: "URBAN" },
];

const VILLAGES = ["Rampur", "Shivpur", "Ganeshpur", "Lakshmipuram", "Krishnanagar", "Bhagwanpur"];
const FIRST_NAMES = ["Ramesh", "Sunita", "Vijay", "Kavita", "Manoj", "Geeta", "Ashok", "Rekha"];
const LAST_NAMES = ["Yadav", "Sharma", "Verma", "Reddy", "Singh", "Gupta", "Naidu", "Chauhan"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log("Seeding demo users...");
  const userRecords: { id: string; role: string }[] = [];

  for (const u of DEMO_USERS) {
    let authUserId: string;
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already been registered")) {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        const existing = list.users.find((x) => x.email === u.email);
        if (!existing) throw error;
        authUserId = existing.id;
      } else {
        throw error;
      }
    } else {
      authUserId = created.user.id;
    }

    const profile = await prisma.user.upsert({
      where: { authUserId },
      update: { email: u.email, name: u.name, role: u.role, jurisdictionState: u.state, jurisdictionDistrict: u.district },
      create: {
        authUserId,
        email: u.email,
        name: u.name,
        role: u.role,
        jurisdictionState: u.state,
        jurisdictionDistrict: u.district,
      },
    });
    userRecords.push({ id: profile.id, role: profile.role });
    console.log(`  ${u.role}: ${u.email}`);
  }

  const requiringBodyUser = userRecords.find((u) => u.role === "REQUIRING_BODY")!;

  console.log("Seeding projects...");
  for (let i = 0; i < PROJECT_SEEDS.length; i++) {
    const seed = PROJECT_SEEDS[i];

    const existing = await prisma.project.findFirst({ where: { title: seed.title } });
    if (existing) {
      console.log(`  skip (exists): ${seed.title}`);
      continue;
    }

    const project = await prisma.project.create({
      data: {
        title: seed.title,
        requiringBody: seed.requiringBody,
        acquisitionRoute: seed.acquisitionRoute,
        projectType: seed.projectType,
        state: seed.state,
        district: seed.district,
        totalAreaAcres: seed.totalAreaAcres,
        currentStage: seed.currentStage,
        createdByUserId: seed.title === RB_DEMO_OWNED_PROJECT_TITLE ? requiringBodyUser.id : null,
        rrScheme: {
          create: {
            rrCommitteeRequired: isRRCommitteeRequired(seed.totalAreaAcres),
            draftStatus: seed.currentStage === "STAGE_9_RR" ? "APPROVED" : "NOT_STARTED",
            collectorReviewStatus: seed.currentStage === "STAGE_9_RR" ? "APPROVED" : "NOT_STARTED",
            commissionerApprovalStatus: seed.currentStage === "STAGE_9_RR" ? "APPROVED" : "NOT_STARTED",
            publicationStatus: seed.currentStage === "STAGE_9_RR" ? "PUBLISHED" : "NOT_STARTED",
          },
        },
      },
    });

    const threshold = consentThresholdPercent(seed.projectType);
    if (threshold !== null) {
      const familiesTotal = Math.round(seed.totalAreaAcres * 1.5);
      await prisma.consentRecord.create({
        data: {
          projectId: project.id,
          affectedFamiliesTotal: familiesTotal,
          consentsCollected: Math.round(familiesTotal * 0.55),
          thresholdPercent: threshold,
        },
      });
    }

    // Notification
    if (seed.currentStage !== "STAGE_1_NOTIFICATION" || Math.random() > 0.3) {
      await prisma.notification.create({
        data: {
          projectId: project.id,
          type: "PRELIMINARY_S11",
          publicationDate: seed.declarationMonthsAgo ? monthsAgo(seed.declarationMonthsAgo + 4) : daysAgo(20),
          gazetteReference: `G.S.R. ${400 + i}(E)`,
          newspaperReference: `Local Daily, ${seed.district} edition`,
          objectionWindowDeadline: daysAgo(-30),
        },
      });
    }

    // SIA record for stage >= 2
    const stageIdx = STAGES.indexOf(seed.currentStage);
    if (stageIdx >= 1) {
      await prisma.sIARecord.create({
        data: {
          projectId: project.id,
          publicHearingSummary: "Public hearing conducted with Gram Sabha; objections recorded and addressed.",
          expertGroupOutcome: stageIdx >= 2 ? "APPROVED" : "PENDING",
          isMultiCropFlagged: i % 5 === 0,
        },
      });
    }

    // Parcels + affected persons for stage >= 4 (declaration onward, roughly)
    if (stageIdx >= 3) {
      const parcelCount = 2 + (i % 3);
      for (let pIdx = 0; pIdx < parcelCount; pIdx++) {
        const parcel = await prisma.landParcel.create({
          data: {
            projectId: project.id,
            surveyNumber: `${100 + i}/${pIdx + 1}`,
            khasraNumber: `${200 + i * 10 + pIdx}`,
            khataNumber: `${50 + i}`,
            village: pick(VILLAGES, i + pIdx),
            tehsil: seed.district,
            district: seed.district,
            areaAcres: new Prisma.Decimal((seed.totalAreaAcres / parcelCount).toFixed(2)),
            landClassification: pIdx === 0 && i % 5 === 0 ? "AGRICULTURAL_MULTI_CROP_IRRIGATED" : "AGRICULTURAL_SINGLE_CROP",
            isMultiCropIrrigated: pIdx === 0 && i % 5 === 0,
            latitude: null,
            longitude: null,
          },
        });

        const personCount = 1 + (pIdx % 2);
        for (let personIdx = 0; personIdx < personCount; personIdx++) {
          await prisma.affectedPerson.create({
            data: {
              parcelId: parcel.id,
              name: `${pick(FIRST_NAMES, i + personIdx)} ${pick(LAST_NAMES, i + pIdx + personIdx)}`,
              role: personIdx === 0 ? "OWNER" : "AGRICULTURAL_LABORER",
              scStStatus: (i + personIdx) % 4 === 0,
              compensationClaimAmount: new Prisma.Decimal((500000 + i * 25000).toFixed(2)),
            },
          });
        }
      }
    }

    // Award for stage >= 5
    if (stageIdx >= 4) {
      const declarationDate = monthsAgo(seed.declarationMonthsAgo ?? 6);
      const awardDate = seed.awardMonthsAgo != null ? monthsAgo(seed.awardMonthsAgo) : null;
      const circleRate = 800000 + i * 40000;
      const saleDeedAverage = circleRate * 1.1;
      const assetValue = seed.totalAreaAcres * 15000;

      const breakdown = calculateCompensation({
        circleRatePerAcre: circleRate,
        saleDeedAveragePerAcre: saleDeedAverage,
        areaAcres: seed.totalAreaAcres,
        assetValue,
        areaType: seed.areaType,
        notificationDate: monthsAgo((seed.declarationMonthsAgo ?? 6) + 4),
        declarationDate,
        awardDate,
        possessionDate: null,
      });

      const award = await prisma.award.create({
        data: {
          projectId: project.id,
          declarationDate,
          awardDeadline: awardDeadline(declarationDate),
          awardDate,
          circleRate,
          saleDeedAverage,
          assetValue,
          areaType: seed.areaType,
          marketValue: breakdown.marketValue,
          solatiumAmount: breakdown.solatiumAmount,
          multiplier: breakdown.multiplier,
          interestAccrued: breakdown.interestAccrued,
          finalCompensationAmount: breakdown.finalCompensationAmount,
        },
      });

      // Possession record for stage >= 6 with an award date
      if (awardDate) {
        const lapseDeadline = lapseRiskDeadline(awardDate);
        const possessionDate = seed.possessionYearsAgo != null ? yearsAgo(seed.possessionYearsAgo) : null;
        await prisma.possession.create({
          data: {
            projectId: project.id,
            possessionDate,
            lapseRiskDeadline: lapseDeadline,
            lapseStatus: possessionDate ? "SAFE" : lapseDeadline < daysFromNow(0) ? "LAPSED" : lapseDeadline < daysFromNow(180) ? "AT_RISK" : "SAFE",
          },
        });

        // Disbursements for stage >= 7
        if (stageIdx >= 6) {
          const persons = await prisma.affectedPerson.findMany({
            where: { parcel: { projectId: project.id } },
          });
          for (const [idx, person] of persons.entries()) {
            const disbursed = idx % 3 !== 2; // leave some undisbursed
            const disbursementDate = disbursed ? daysAgo(20 + idx * 5) : null;
            const disbursedAmount = Number(award.finalCompensationAmount) / Math.max(persons.length, 1);
            const { daysDelayed, additionalInterestAccrued } = calculateDisbursementDelay(
              awardDate,
              disbursedAmount,
              disbursementDate
            );
            await prisma.disbursement.create({
              data: {
                awardId: award.id,
                claimantId: person.id,
                disbursedAmount,
                disbursementDate,
                daysDelayedPastAward: daysDelayed,
                additionalInterestAccrued,
              },
            });
          }
        }
      }
    }

    console.log(`  created: ${seed.title}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

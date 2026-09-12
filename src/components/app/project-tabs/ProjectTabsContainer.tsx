"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Lock, AlertTriangle, ShieldCheck, FileText, Users, Award as AwardIcon, CheckSquare, Coins, Home, Building2, MapPin } from "lucide-react";
import type { Role } from "@/lib/domain/roles";
import { OverviewTab } from "./OverviewTab";
import { NotificationTab } from "./NotificationTab";
import { SIATab } from "./SIATab";
import { ExpertReviewTab } from "./ExpertReviewTab";
import { ConsentTab } from "./ConsentTab";
import { DeclarationTab } from "./DeclarationTab";
import { AwardTab } from "./AwardTab";
import { DisbursementTab } from "./DisbursementTab";
import { PossessionTab } from "./PossessionTab";
import { RRTab } from "./RRTab";

export interface ProjectData {
  id: string;
  title: string;
  requiringBody: string;
  acquisitionRoute: string;
  projectType: string;
  currentStage: string;
  state: string;
  district: string;
  totalAreaAcres: any;
  rrCostDeposited: boolean;
  createdAt: Date;
  notifications: any[];
  siaRecords: any[];
  consentRecord: any;
  parcels: any[];
  award: any;
  possession: any;
  rrScheme: any;
}

const STAGE_ORDER = [
  "STAGE_1_NOTIFICATION",
  "STAGE_2_SIA",
  "STAGE_3_EXPERT_APPRAISAL",
  "STAGE_4_CONSENT",
  "STAGE_5_DECLARATION",
  "STAGE_6_AWARD",
  "STAGE_7_DISBURSEMENT",
  "STAGE_8_POSSESSION",
  "STAGE_9_RR",
];

const VALID_TAB_KEYS = [
  "overview",
  "notification",
  "sia",
  "expert",
  "consent",
  "declaration",
  "award",
  "disbursement",
  "possession",
  "rr",
];

export function ProjectTabsContainer({
  project,
  userRole,
  initialTab,
}: {
  project: ProjectData;
  userRole: Role;
  /** Deep-link support, e.g. from /documents rows: /projects/[id]?tab=award */
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<string>(
    initialTab && VALID_TAB_KEYS.includes(initialTab) ? initialTab : "overview"
  );

  const currentIdx = STAGE_ORDER.indexOf(project.currentStage);

  const tabs = [
    { key: "overview", label: "Overview", stageIdx: -1, icon: MapPin },
    { key: "notification", label: "Notification", stageIdx: 0, icon: FileText },
    { key: "sia", label: "SIA", stageIdx: 1, icon: Users },
    { key: "expert", label: "Expert Review", stageIdx: 2, icon: CheckSquare },
    ...(project.projectType === "PRIVATE" || project.projectType === "PPP"
      ? [{ key: "consent", label: "Consent", stageIdx: 3, icon: ShieldCheck }]
      : []),
    { key: "declaration", label: "Declaration", stageIdx: 4, icon: Lock },
    { key: "award", label: "Award", stageIdx: 5, icon: AwardIcon },
    { key: "disbursement", label: "Disbursement", stageIdx: 6, icon: Coins },
    { key: "possession", label: "Possession", stageIdx: 7, icon: Home },
    { key: "rr", label: "R&R", stageIdx: 8, icon: Building2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Horizontal Tabs Header */}
      <div className="bg-paper-raised border border-hairline rounded-md p-1.5 overflow-x-auto scrollbar-thin flex gap-1 shadow-xs">
        {tabs.map((t) => {
          const isComplete = t.stageIdx >= 0 && currentIdx > t.stageIdx;
          const isActive = activeTab === t.key;
          const Icon = t.icon;

          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-xs font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-brand-tint/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-saffron" : isComplete ? "text-success" : "text-ink-muted"}`} />
              <span>{t.label}</span>
              {t.stageIdx >= 0 && (
                isComplete ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-saffron" : "text-success"}`} />
                ) : (
                  <Circle className={`w-3 h-3 shrink-0 ${isActive ? "text-white/60" : "text-hairline-strong"}`} />
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="bg-paper-raised border border-hairline rounded-md p-6 shadow-xs">
        {activeTab === "overview" && <OverviewTab project={project} userRole={userRole} />}
        {activeTab === "notification" && <NotificationTab project={project} userRole={userRole} />}
        {activeTab === "sia" && <SIATab project={project} userRole={userRole} />}
        {activeTab === "expert" && <ExpertReviewTab project={project} userRole={userRole} />}
        {activeTab === "consent" && <ConsentTab project={project} userRole={userRole} />}
        {activeTab === "declaration" && <DeclarationTab project={project} userRole={userRole} />}
        {activeTab === "award" && <AwardTab project={project} userRole={userRole} />}
        {activeTab === "disbursement" && <DisbursementTab project={project} userRole={userRole} />}
        {activeTab === "possession" && <PossessionTab project={project} userRole={userRole} />}
        {activeTab === "rr" && <RRTab project={project} userRole={userRole} />}
      </div>
    </div>
  );
}

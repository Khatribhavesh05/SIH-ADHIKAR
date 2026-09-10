"use client";

import { useState } from "react";
import { FileText, Users, CheckSquare, ShieldCheck, Lock, Award, Coins, Home, Building2 } from "lucide-react";

const STAGES = [
  { id: 1, title: "Notification", icon: FileText, label: "Gazette & Public Notice", detail: "Publishing preliminary Section 11 notice in official gazette, 2 local newspapers, and village notice boards with 60-day objection window." },
  { id: 2, title: "SIA", icon: Users, label: "Social Impact Assessment", detail: "Conducting multi-disciplinary social impact study, Gram Sabha public hearings, and multi-crop land restriction checks." },
  { id: 3, title: "Expert Review", icon: CheckSquare, label: "Independent Appraisal", detail: "Evaluation by independent Expert Group to verify legitimate public purpose and minimal displacement." },
  { id: 4, title: "Consent", icon: ShieldCheck, label: "Landowner Consent", detail: "Obtaining mandatory 80% (Private) or 70% (PPP) written consent from affected landowner families." },
  { id: 5, title: "Declaration", icon: Lock, label: "Section 19 Declaration", detail: "Final acquisition declaration, boundary survey measurement, and ownership claims ledger, gated by R&R cost deposit." },
  { id: 6, title: "Award", icon: Award, label: "Compensation Award", detail: "Determining 100% solatium, 2x/4x rural multiplier, and 12% p.a. interest under statutory 12-month deadline." },
  { id: 7, title: "Disbursement", icon: Coins, label: "Payment & Interest", detail: "Direct compensation disbursement to claimants with automatic 9% p.a. interest for post-award payment delays." },
  { id: 8, title: "Possession", icon: Home, label: "Physical Possession", detail: "Taking physical possession of land while monitoring Section 24(2) 5-year statutory lapse risk countdown." },
  { id: 9, title: "R&R", icon: Building2, label: "Rehabilitation & Resettlement", detail: "Implementation of housing, annuity, and employment entitlements, approved by R&R Commissioner and published across 5 channels." },
];

export function ProcessStepper() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isSelected = activeStage === s.id;

          return (
            <button
              key={s.id}
              onClick={() => setActiveStage(isSelected ? null : s.id)}
              onMouseEnter={() => setActiveStage(s.id)}
              className={`flex flex-col items-center text-center p-3 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand text-white border-brand shadow-md"
                  : "bg-paper-raised border-hairline text-ink hover:border-brand/50 hover:bg-brand-tint/30"
              }`}
            >
              <div className={`p-2 rounded-full mb-1.5 ${isSelected ? "bg-saffron text-white" : "bg-brand-tint text-brand"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold font-mono-data">Stage {s.id}</span>
              <span className="text-[11px] font-semibold truncate w-full mt-0.5">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Explanation Box */}
      <div className="p-4 rounded-md border border-brand/30 bg-brand-tint/20 min-h-[72px] flex items-center justify-between text-xs">
        {activeStage !== null ? (
          <div>
            <span className="font-bold text-brand-dark">
              Stage {STAGES[activeStage - 1].id}: {STAGES[activeStage - 1].title} — {STAGES[activeStage - 1].label}
            </span>
            <p className="text-ink-muted mt-1 leading-relaxed">
              {STAGES[activeStage - 1].detail}
            </p>
          </div>
        ) : (
          <div className="text-ink-muted text-center w-full italic">
            Hover over or tap any of the 9 statutory stages above to inspect its legal requirements and workflow contract.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateRRStatus } from "@/app/(app)/projects/[id]/rr/actions";
import { CheckSquare, Square, CheckCircle2, Globe, Building2, MapPin, Landmark } from "lucide-react";
import type { Role } from "@/lib/domain/roles";

const CHANNELS = [
  { id: "website", label: "Official Department Website", icon: Globe },
  { id: "panchayat", label: "Gram Panchayat Notice Board", icon: Building2 },
  { id: "municipality", label: "Municipality Office Notice Board", icon: Landmark },
  { id: "collector", label: "District Collectorate Notice Board", icon: MapPin },
  { id: "tehsil", label: "Tehsil / Taluka Office Notice Board", icon: Building2 },
];

export function PublicationTracker({
  projectId,
  initialPublished,
  userRole,
}: {
  projectId: string;
  initialPublished: boolean;
  userRole: Role;
}) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    website: initialPublished,
    panchayat: initialPublished,
    municipality: initialPublished,
    collector: initialPublished,
    tehsil: initialPublished,
  });

  const isAllChecked = CHANNELS.every((c) => checkedItems[c.id]);

  const canCheck = userRole === "RR_COMMISSIONER";

  async function handleToggle(id: string) {
    if (!canCheck) return;

    const nextState = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(nextState);

    const allChecked = CHANNELS.every((c) => nextState[c.id]);
    await updateRRStatus(projectId, "publicationStatus", allChecked ? "PUBLISHED" : "NOT_STARTED");
  }

  return (
    <div className="p-5 rounded-md border border-hairline bg-paper flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-hairline">
        <div>
          <h3 className="font-semibold text-sm text-brand-dark flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand" /> Section 44 Publication Tracker (5 Mandatory Channels)
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Statutory Mandate: Section 44 requires approved R&amp;R schemes to be published across all 5 public channels.
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-bold font-mono-data uppercase ${
          isAllChecked ? "bg-success text-white" : "bg-saffron text-white"
        }`}>
          {isAllChecked ? "✓ PUBLISHED (5/5 Channels)" : `${Object.values(checkedItems).filter(Boolean).length}/5 Channels Complete`}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {CHANNELS.map((c) => {
          const isChecked = checkedItems[c.id];
          const Icon = c.icon;

          return (
            <button
              key={c.id}
              onClick={() => handleToggle(c.id)}
              disabled={!canCheck}
              className={`p-3 rounded border text-xs flex items-center justify-between transition-all ${
                canCheck ? "cursor-pointer hover:border-brand" : "cursor-default opacity-85"
              } ${isChecked ? "bg-success-tint border-success/30 text-success font-semibold" : "bg-paper-raised border-hairline text-ink"}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isChecked ? "text-success" : "text-ink-muted"}`} />
                <span>{c.label}</span>
              </div>
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-hairline-strong shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

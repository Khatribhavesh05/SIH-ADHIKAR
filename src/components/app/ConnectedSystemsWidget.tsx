"use client";

import { Database, CheckCircle2 } from "lucide-react";

export function ConnectedSystemsWidget() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-brand/20 bg-brand-tint/30 text-xs font-medium text-brand-dark">
      <Database className="w-3.5 h-3.5 text-saffron" />
      <span>State Land Record System (ULPIN/DILRMP)</span>
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-saffron/15 text-saffron font-bold uppercase tracking-wider font-mono-data">
        Simulated
      </span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// Illustrative figures only — a 2-acre rural parcel.
const MARKET_VALUE = 8_400_000;
const ASSET_VALUE = 620_000;
const SOLATIUM = MARKET_VALUE * 1.0;
const MULTIPLIER = 4;
const AFTER_MULTIPLIER = (MARKET_VALUE + ASSET_VALUE + SOLATIUM) * MULTIPLIER;
const INTEREST = 1_310_000;
const FINAL = AFTER_MULTIPLIER + INTEREST;

const LINES = [
  { label: "Market Value", value: MARKET_VALUE, op: "" },
  { label: "Asset Value (crops, trees, structures)", value: ASSET_VALUE, op: "+" },
  { label: "Solatium (100% of Market Value)", value: SOLATIUM, op: "+" },
  { label: `Statutory Multiplier (${MULTIPLIER}× rural)`, value: AFTER_MULTIPLIER, op: "×", isMultiplier: true },
  { label: "Interest for Delay (12% p.a.)", value: INTEREST, op: "+" },
];

export function LedgerHero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= LINES.length + 1) return;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), visibleLines === 0 ? 400 : 550);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div className="border border-hairline bg-paper-raised rounded-[var(--radius-md)] w-full max-w-md">
      <div className="px-5 py-3 border-b border-hairline flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted tracking-wide">
          STAGE 6 — AWARD LEDGER
        </span>
        <span className="text-xs font-mono-data text-ink-muted">Illustrative</span>
      </div>
      <div className="px-5 py-4 space-y-0">
        {LINES.map((line, i) => (
          <div
            key={line.label}
            className={`flex items-baseline justify-between py-2.5 border-b border-hairline transition-opacity duration-500 ${
              i < visibleLines ? "opacity-100" : "opacity-0"
            } ${line.isMultiplier ? "text-brand" : ""}`}
          >
            <span className="text-sm text-ink-muted flex items-center gap-2">
              {line.op && <span className="font-mono-data text-xs w-3">{line.op}</span>}
              {line.label}
            </span>
            <span className="font-mono-data text-sm tabular-nums">
              {formatINR(line.value)}
            </span>
          </div>
        ))}
        <div
          className={`flex items-baseline justify-between pt-4 transition-opacity duration-700 ${
            visibleLines >= LINES.length + 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-sm font-medium text-ink">Final Compensation Amount</span>
          <span className="font-mono-data text-xl font-semibold text-brand tabular-nums">
            {formatINR(FINAL)}
          </span>
        </div>
      </div>
    </div>
  );
}

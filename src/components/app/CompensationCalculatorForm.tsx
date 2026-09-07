"use client";

import { useMemo, useState } from "react";
import { calculateCompensation, awardDeadline, daysUntil, riskStatusForDeadline, AT_RISK_WINDOW_MONTHS } from "@/lib/domain/compensation";
import { formatINR, formatDate } from "@/lib/domain/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Props {
  projectId: string;
  areaAcres: number;
  readOnly: boolean;
  saveAction: (formData: FormData) => void;
  initial: {
    circleRatePerAcre: number;
    saleDeedAveragePerAcre: number;
    assetValue: number;
    areaType: "RURAL" | "URBAN";
    declarationDate: string;
    awardDate: string;
    notificationDate: string | null;
  };
}

export function CompensationCalculatorForm({ projectId, areaAcres, readOnly, saveAction, initial }: Props) {
  const [circleRate, setCircleRate] = useState(initial.circleRatePerAcre);
  const [saleDeed, setSaleDeed] = useState(initial.saleDeedAveragePerAcre);
  const [assetValue, setAssetValue] = useState(initial.assetValue);
  const [areaType, setAreaType] = useState<"RURAL" | "URBAN">(initial.areaType);
  const [declarationDate, setDeclarationDate] = useState(initial.declarationDate);
  const [awardDate, setAwardDate] = useState(initial.awardDate);

  const breakdown = useMemo(() => {
    if (!declarationDate) return null;
    return calculateCompensation({
      circleRatePerAcre: circleRate || 0,
      saleDeedAveragePerAcre: saleDeed || 0,
      areaAcres,
      assetValue: assetValue || 0,
      areaType,
      notificationDate: initial.notificationDate ? new Date(initial.notificationDate) : null,
      declarationDate: new Date(declarationDate),
      awardDate: awardDate ? new Date(awardDate) : null,
      possessionDate: null,
    });
  }, [circleRate, saleDeed, assetValue, areaType, declarationDate, awardDate, areaAcres, initial.notificationDate]);

  const deadline = declarationDate ? awardDeadline(new Date(declarationDate)) : null;
  const risk = deadline ? riskStatusForDeadline(deadline, AT_RISK_WINDOW_MONTHS) : null;
  const days = deadline ? daysUntil(deadline) : null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form action={saveAction} className="flex flex-col gap-4">
        <input type="hidden" name="areaAcres" value={areaAcres} />
        {initial.notificationDate && (
          <input type="hidden" name="notificationDate" value={initial.notificationDate} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Circle rate (₹/acre)">
            <input
              className="input font-mono-data"
              name="circleRatePerAcre"
              type="number"
              step="0.01"
              disabled={readOnly}
              value={circleRate}
              onChange={(e) => setCircleRate(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Sale deed average (₹/acre)">
            <input
              className="input font-mono-data"
              name="saleDeedAveragePerAcre"
              type="number"
              step="0.01"
              disabled={readOnly}
              value={saleDeed}
              onChange={(e) => setSaleDeed(parseFloat(e.target.value) || 0)}
            />
          </Field>
        </div>

        <Field label="Asset value — crops, trees, structures (₹)">
          <input
            className="input font-mono-data"
            name="assetValue"
            type="number"
            step="0.01"
            disabled={readOnly}
            value={assetValue}
            onChange={(e) => setAssetValue(parseFloat(e.target.value) || 0)}
          />
        </Field>

        <Field label="Area type">
          <select
            className="input"
            name="areaType"
            disabled={readOnly}
            value={areaType}
            onChange={(e) => setAreaType(e.target.value as "RURAL" | "URBAN")}
          >
            <option value="RURAL">Rural (4× multiplier)</option>
            <option value="URBAN">Urban (2× multiplier)</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Declaration date (S.19)">
            <input
              className="input font-mono-data"
              name="declarationDate"
              type="date"
              disabled={readOnly}
              value={declarationDate}
              onChange={(e) => setDeclarationDate(e.target.value)}
              required
            />
          </Field>
          <Field label="Award date (leave blank if not yet awarded)">
            <input
              className="input font-mono-data"
              name="awardDate"
              type="date"
              disabled={readOnly}
              value={awardDate}
              onChange={(e) => setAwardDate(e.target.value)}
            />
          </Field>
        </div>

        {deadline && (
          <div
            className={`border rounded-[var(--radius-sm)] p-4 flex items-center justify-between ${
              risk === "DANGER"
                ? "border-[var(--color-danger)] bg-[var(--color-danger-tint)]"
                : risk === "WARNING"
                ? "border-[var(--color-warning)] bg-[var(--color-warning-tint)]"
                : "border-[var(--color-success)] bg-[var(--color-success-tint)]"
            }`}
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-muted">12-month award deadline (S.25)</div>
              <div className="font-mono-data text-sm mt-0.5">{formatDate(deadline)}</div>
            </div>
            {!awardDate && days !== null && (
              <Badge tone={risk === "DANGER" ? "danger" : risk === "WARNING" ? "warning" : "success"}>
                {days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`}
              </Badge>
            )}
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-end pt-2">
            <Button type="submit">Save Award</Button>
          </div>
        )}
      </form>

      {/* The ledger */}
      <div className="border border-hairline rounded-[var(--radius-md)] bg-paper-raised h-fit">
        <div className="px-5 py-3 border-b border-hairline">
          <span className="text-xs font-medium text-ink-muted tracking-wide">AWARD LEDGER — SECTIONS 25–30</span>
        </div>
        <div className="px-5 py-2">
          {breakdown ? (
            <>
              <LedgerRow label={`Market Value = MAX(₹${circleRate || 0}, ₹${saleDeed || 0}) × ${areaAcres} acres`} value={breakdown.marketValue} />
              <LedgerRow label="+ Asset Value" value={breakdown.afterAssetValue} sub />
              <LedgerRow label="+ Solatium (100% of Market Value)" value={breakdown.afterSolatium} sub />
              <LedgerRow
                label={`× Statutory Multiplier (${breakdown.multiplier}×)`}
                value={breakdown.afterMultiplier}
                highlight
              />
              <LedgerRow
                label={`+ Interest for Delay (12% p.a. × ${breakdown.interestAccrualYears.toFixed(2)} yrs)`}
                value={breakdown.interestAccrued}
                sub
                isDelta
              />
              <div className="flex items-baseline justify-between pt-4 pb-3">
                <span className="text-sm font-medium">Final Compensation Amount</span>
                <span className="font-mono-data text-2xl font-semibold text-brand">
                  {formatINR(breakdown.finalCompensationAmount)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-muted py-6">Enter a declaration date to compute the ledger.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LedgerRow({
  label,
  value,
  sub = false,
  highlight = false,
  isDelta = false,
}: {
  label: string;
  value: number;
  sub?: boolean;
  highlight?: boolean;
  isDelta?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between py-2.5 border-b border-hairline ${highlight ? "text-brand" : ""}`}>
      <span className={`text-sm ${sub ? "text-ink-muted" : ""}`}>{label}</span>
      <span className="font-mono-data text-sm tabular-nums">
        {isDelta && value > 0 ? "+" : ""}
        {formatINR(value)}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

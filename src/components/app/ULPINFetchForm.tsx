"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Database, Sparkles, CheckCircle2 } from "lucide-react";

const LAND_CLASSIFICATIONS = [
  ["AGRICULTURAL_MULTI_CROP_IRRIGATED", "Agricultural — Multi-crop irrigated"],
  ["AGRICULTURAL_SINGLE_CROP", "Agricultural — Single crop"],
  ["AGRICULTURAL_UNIRRIGATED", "Agricultural — Unirrigated"],
  ["NON_AGRICULTURAL", "Non-agricultural"],
  ["BARREN", "Barren"],
  ["FOREST", "Forest"],
  ["OTHER", "Other"],
] as const;

export function ULPINFetchForm({
  projectId,
  districtDefault,
  onAddAction,
}: {
  projectId: string;
  districtDefault: string;
  onAddAction: (formData: FormData) => Promise<void>;
}) {
  const [fetching, setFetching] = useState(false);
  const [ulpinFetched, setUlpinFetched] = useState(false);

  const [formData, setFormData] = useState({
    surveyNumber: "",
    khasraNumber: "",
    khataNumber: "",
    village: "",
    tehsil: "",
    district: districtDefault,
    areaAcres: "",
    landClassification: "AGRICULTURAL_SINGLE_CROP",
    latitude: "",
    longitude: "",
    ulpinId: "",
  });

  async function handleFetchULPIN() {
    setFetching(true);
    try {
      const res = await fetch("/api/ulpin/fetch");
      const data = await res.json();
      setFormData({
        surveyNumber: data.surveyNumber,
        khasraNumber: data.khasraNumber,
        khataNumber: data.khataNumber,
        village: data.village,
        tehsil: data.tehsil,
        district: data.district,
        areaAcres: String(data.areaAcres),
        landClassification: data.landClassification,
        latitude: "19.9975",
        longitude: "73.7898",
        ulpinId: data.ulpinId,
      });
      setUlpinFetched(true);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Auto-Fetch Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-md border border-brand/20 bg-brand-tint/30">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-saffron" />
          <span className="text-xs font-semibold text-brand-dark">State Land Record Integration (DILRMP / ULPIN)</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-saffron/15 text-saffron font-bold uppercase tracking-wider font-mono-data">
            Simulated for Demo
          </span>
        </div>

        <Button
          type="button"
          onClick={handleFetchULPIN}
          disabled={fetching}
          variant="secondary"
          className="text-xs px-3 py-1.5 min-h-0 shrink-0 font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-saffron" />
          {fetching ? "Connecting to DILRMP..." : "Fetch from State Land Record System"}
        </Button>
      </div>

      {ulpinFetched && (
        <div className="text-xs text-success font-medium flex items-center gap-1.5 px-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Successfully fetched survey parameters from State Land Portal. Form auto-filled.
        </div>
      )}

      {/* Form Fields */}
      <form action={onAddAction} className="grid md:grid-cols-3 gap-4 text-xs">
        <input type="hidden" name="ulpinId" value={formData.ulpinId} />

        {formData.ulpinId && (
          <div className="md:col-span-3 text-[11px] font-mono-data text-brand-dark bg-brand-tint/20 border border-brand/20 rounded px-2 py-1">
            ULPIN: <strong>{formData.ulpinId}</strong>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Survey Number</span>
          <input
            name="surveyNumber"
            value={formData.surveyNumber}
            onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Khasra Number</span>
          <input
            name="khasraNumber"
            value={formData.khasraNumber}
            onChange={(e) => setFormData({ ...formData, khasraNumber: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Khata Number</span>
          <input
            name="khataNumber"
            value={formData.khataNumber}
            onChange={(e) => setFormData({ ...formData, khataNumber: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Village</span>
          <input
            name="village"
            value={formData.village}
            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Tehsil</span>
          <input
            name="tehsil"
            value={formData.tehsil}
            onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">District</span>
          <input
            name="district"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            required
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Area (Acres)</span>
          <input
            name="areaAcres"
            type="number"
            step="0.01"
            min="0"
            value={formData.areaAcres}
            onChange={(e) => setFormData({ ...formData, areaAcres: e.target.value })}
            required
            className="input font-mono-data"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-ink">Land Classification</span>
          <select
            name="landClassification"
            value={formData.landClassification}
            onChange={(e) => setFormData({ ...formData, landClassification: e.target.value })}
            required
            className="input"
          >
            {LAND_CLASSIFICATIONS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <Button type="submit" className="w-full text-xs py-2">Add Parcel to Project</Button>
        </div>
      </form>
    </div>
  );
}

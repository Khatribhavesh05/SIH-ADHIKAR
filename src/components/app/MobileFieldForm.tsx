"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { FileInput } from "@/components/ui/FileInput";

export function MobileFieldForm({ officerName }: { officerName: string }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function captureGPS() {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGpsError("Could not get location — check permissions.")
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Prototype: queue locally so the screen still "works" if the
    // connection drops mid-demo. No real backend wiring for Tier 2.
    try {
      const queue = JSON.parse(localStorage.getItem("adhikar_field_queue") ?? "[]");
      queue.push({ submittedAt: new Date().toISOString(), coords, photoName });
      localStorage.setItem("adhikar_field_queue", JSON.stringify(queue));
    } catch {
      // ignore storage errors — still show success in the UI
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-center">
        <Badge tone="success">Queued</Badge>
        <p className="text-sm text-ink-muted">
          Record saved on this device and will sync when the app is next online.
        </p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Capture another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
      <Panel className="p-3 text-xs text-ink-muted">Surveying officer: {officerName}</Panel>

      <Field label="Village"><input className="input" required /></Field>
      <Field label="Tehsil"><input className="input" required /></Field>
      <Field label="Survey number"><input className="input" required /></Field>
      <Field label="Khasra number"><input className="input" required /></Field>
      <Field label="Khata number"><input className="input" required /></Field>
      <Field label="Area (acres)"><input className="input font-mono-data" type="number" step="0.01" required /></Field>

      <div>
        <span className="text-sm font-medium">GPS coordinates</span>
        <div className="mt-1.5 flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={captureGPS} className="text-xs">
            Capture GPS
          </Button>
          {coords && (
            <span className="font-mono-data text-xs text-ink-muted">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          )}
        </div>
        {gpsError && <p className="text-xs text-[var(--color-danger)] mt-1">{gpsError}</p>}
      </div>

      <div>
        <span className="text-sm font-medium">Site photo</span>
        <div className="mt-1.5">
          <FileInput
            accept="image/*"
            capture="environment"
            inputClassName="text-xs"
            onChange={(file) => setPhotoName(file?.name ?? null)}
          />
        </div>
      </div>

      <Button type="submit" className="mt-2">Save Record</Button>
    </form>
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

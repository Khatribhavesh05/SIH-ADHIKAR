"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow, useMap } from "@vis.gl/react-google-maps";

export interface MapProject {
  id: string;
  title: string;
  district: string;
  state: string;
  currentStage: string;
  areaAcres: number;
  khasraReference: string | null;
  lat: number;
  lng: number;
  riskTone: "success" | "warning" | "danger";
  nearestDeadlineLabel: string | null;
  nearestDeadlineDays: number | null;
}

const RISK_COLORS: Record<MapProject["riskTone"], string> = {
  success: "#1a7431",
  warning: "#b5560a",
  danger: "#b3261e",
};

// India's approximate center and a nationwide default zoom — same extent the
// Dashboard's embedded map has always used. Keep the standalone /map page in
// sync with this so both default to the same view.
const INDIA_CENTER = { lat: 22.5, lng: 80.0 };
const INDIA_DEFAULT_ZOOM = 5;
const SINGLE_MARKER_ZOOM = 12;

function FitToMarkers({ projects }: { projects: MapProject[] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (!map || hasFit.current) return;
    hasFit.current = true;

    if (projects.length === 1) {
      map.setCenter({ lat: projects[0].lat, lng: projects[0].lng });
      map.setZoom(SINGLE_MARKER_ZOOM);
    } else if (projects.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      projects.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 48);
    } else {
      map.setCenter(INDIA_CENTER);
      map.setZoom(INDIA_DEFAULT_ZOOM);
    }
  }, [map, projects]);

  return null;
}

// Classic google.maps.Marker rather than AdvancedMarker — AdvancedMarker
// requires a vector-rendering Map ID (configured in Cloud Console) and
// throws at runtime against a raster Map ID, which isn't guaranteed here.
// A Symbol-based circle icon gives the same risk-colored dot without that
// dependency.
function RiskMarker({ project, onSelect }: { project: MapProject; onSelect: (id: string) => void }) {
  return (
    <Marker
      position={{ lat: project.lat, lng: project.lng }}
      onClick={() => onSelect(project.id)}
      icon={{
        path: "M 0, 0 m -9, 0 a 9,9 0 1,0 18,0 a 9,9 0 1,0 -18,0",
        fillColor: RISK_COLORS[project.riskTone],
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 1,
      }}
    />
  );
}

function MapInner({ projects, mapId }: { projects: MapProject[]; mapId: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <Map
      mapId={mapId}
      defaultCenter={INDIA_CENTER}
      defaultZoom={INDIA_DEFAULT_ZOOM}
      // Pure satellite imagery (no place/road/transit label overlay) rather than
      // "hybrid" — with a mapId set, the local `styles` array below is ignored
      // (Google requires cloud-based styling for that case instead), so plain
      // satellite is what actually keeps this muted/chrome-free without needing
      // extra Cloud Console configuration.
      mapTypeId="satellite"
      tilt={45}
      heading={0}
      disableDefaultUI={false}
      streetViewControl={false}
      mapTypeControl={false}
      fullscreenControl={true}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
    >
      <FitToMarkers projects={projects} />
      {projects.map((p) => (
        <RiskMarker key={p.id} project={p} onSelect={setSelectedId} />
      ))}
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelectedId(null)}
        >
          <div className="text-sm min-w-[200px]">
            <div className="font-medium">{selected.title}</div>
            <div className="text-xs text-ink-muted mt-0.5">{selected.district}, {selected.state}</div>
            <div className="text-xs mt-1.5 flex justify-between">
              <span>Stage</span>
              <span className="font-medium">{selected.currentStage.replaceAll("_", " ")}</span>
            </div>
            <div className="text-xs flex justify-between">
              <span>Area</span>
              <span className="font-medium">{selected.areaAcres.toLocaleString("en-IN")} acres</span>
            </div>
            {selected.khasraReference && (
              <div className="text-xs flex justify-between">
                <span>Khasra / Khata</span>
                <span className="font-medium">{selected.khasraReference}</span>
              </div>
            )}
            {selected.nearestDeadlineLabel && selected.nearestDeadlineDays !== null && (
              <div className="text-xs flex justify-between mt-1.5 pt-1.5 border-t border-gray-200">
                <span>{selected.nearestDeadlineLabel}</span>
                <span className="font-medium">
                  {selected.nearestDeadlineDays >= 0
                    ? `${selected.nearestDeadlineDays}d remaining`
                    : `${Math.abs(selected.nearestDeadlineDays)}d overdue`}
                </span>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}

export function ProjectMapClient({ projects }: { projects: MapProject[] }) {
  const markers = useMemo(() => projects, [projects]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        style={{ height: "600px", width: "100%" }}
        className="flex flex-col items-center justify-center gap-2 bg-paper-raised text-center px-6"
      >
        <div className="text-sm font-semibold text-ink">Satellite GIS map unavailable</div>
        <p className="text-xs text-ink-muted max-w-sm">
          Set the <code className="font-mono-data">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment
          variable to enable the 3D satellite command-center map.
        </p>
      </div>
    );
  }

  // Falls back to Google's default vector Map ID (DEMO_MAP_ID) if a project-specific
  // one isn't configured — 3D tilt and AdvancedMarker require a vector-rendering map ID.
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <APIProvider apiKey={apiKey} libraries={["marker"]}>
        <MapInner projects={markers} mapId={mapId} />
      </APIProvider>
    </div>
  );
}

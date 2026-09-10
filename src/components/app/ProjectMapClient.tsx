"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  Circle,
  MapControl,
  ControlPosition,
  useMap,
} from "@vis.gl/react-google-maps";
import { Home } from "lucide-react";

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

// Zoom level a single click-to-preview animates to, and the threshold above
// which the approximate parcel-area highlight becomes visible (so it doesn't
// clutter the nationwide/state-level view).
const CLICK_PREVIEW_ZOOM = 16;
const PARCEL_HIGHLIGHT_ZOOM_THRESHOLD = 14;

// Approximate parcel highlight radius from a project's notified area — clamped
// to a plausible on-the-ground range since we only have an acreage total, not
// a surveyed polygon.
function parcelHighlightRadiusMeters(areaAcres: number): number {
  const areaSqMeters = Math.max(areaAcres, 0) * 4046.86;
  const radius = Math.sqrt(areaSqMeters / Math.PI);
  return Math.min(300, Math.max(150, radius));
}

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

// Drives the click-to-zoom-and-preview animation and the "Reset view" control.
// Must live inside <Map> (not MapInner) since useMap()/MapControl both need
// the GoogleMapsContext that <Map> provides to its descendants.
function MapCamera({
  selected,
  onReset,
}: {
  selected: MapProject | null;
  onReset: () => void;
}) {
  const map = useMap();
  const lastZoomedId = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !selected || lastZoomedId.current === selected.id) return;
    lastZoomedId.current = selected.id;
    // panTo animates smoothly for short hops; setZoom then brings the marker
    // to parcel-level detail. Native double-click-to-zoom still layers on
    // top of this normally since we only touch zoom/center once per click.
    map.panTo({ lat: selected.lat, lng: selected.lng });
    map.setZoom(CLICK_PREVIEW_ZOOM);
  }, [map, selected]);

  function handleReset() {
    lastZoomedId.current = null;
    onReset();
    if (!map) return;
    map.panTo(INDIA_CENTER);
    map.setZoom(INDIA_DEFAULT_ZOOM);
  }

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <button
        type="button"
        onClick={handleReset}
        title="Reset view"
        aria-label="Reset view to nationwide default"
        className="m-2 w-9 h-9 rounded bg-white border border-hairline-strong shadow-md flex items-center justify-center text-ink hover:bg-paper transition-colors cursor-pointer"
      >
        <Home className="w-4 h-4" />
      </button>
    </MapControl>
  );
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

function MapInner({
  projects,
  mapId,
  interactive,
  onRestrictedNavigate,
}: {
  projects: MapProject[];
  mapId: string;
  interactive: boolean;
  onRestrictedNavigate?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(INDIA_DEFAULT_ZOOM);
  const selected = projects.find((p) => p.id === selectedId) ?? null;
  const showParcelHighlight = selected !== null && currentZoom >= PARCEL_HIGHLIGHT_ZOOM_THRESHOLD;

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
      onCameraChanged={(ev) => setCurrentZoom(ev.detail.zoom)}
      style={{ width: "100%", height: "100%" }}
    >
      <FitToMarkers projects={projects} />
      <MapCamera selected={selected} onReset={() => setSelectedId(null)} />
      {projects.map((p) => (
        <RiskMarker key={p.id} project={p} onSelect={setSelectedId} />
      ))}
      {showParcelHighlight && selected && (
        <Circle
          center={{ lat: selected.lat, lng: selected.lng }}
          radius={parcelHighlightRadiusMeters(selected.areaAcres)}
          fillColor={RISK_COLORS[selected.riskTone]}
          fillOpacity={0.18}
          strokeColor={RISK_COLORS[selected.riskTone]}
          strokeOpacity={0.5}
          strokeWeight={1.5}
          clickable={false}
        />
      )}
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
            {interactive ? (
              <Link
                href={`/projects/${selected.id}`}
                className="mt-2.5 block text-center text-xs font-semibold text-white bg-brand hover:bg-brand-dark transition-colors rounded px-3 py-1.5"
              >
                View Full Details
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onRestrictedNavigate?.()}
                className="mt-2.5 w-full text-center text-xs font-semibold text-white bg-brand hover:bg-brand-dark transition-colors rounded px-3 py-1.5 cursor-pointer"
              >
                View Full Details
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}

export function ProjectMapClient({
  projects,
  interactive = true,
  onRestrictedNavigate,
}: {
  projects: MapProject[];
  /** Set to false for public/logged-out previews — routes the info popup's "View Full Details" through onRestrictedNavigate instead of linking into protected /projects/[id] routes. */
  interactive?: boolean;
  onRestrictedNavigate?: () => void;
}) {
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
        <MapInner
          projects={markers}
          mapId={mapId}
          interactive={interactive}
          onRestrictedNavigate={onRestrictedNavigate}
        />
      </APIProvider>
    </div>
  );
}

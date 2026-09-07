"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// India's approximate bounding box — used as the default view and as the
// fallback when there are no projects to fit bounds around.
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.0],
  [35.7, 97.4],
];
const INDIA_CENTER: [number, number] = [22.5, 80.0];

// A single marker's own bounds have zero area, so fitBounds() falls back
// to its `maxZoom` option directly — the same value tuned for a
// nationwide spread (~7, regional) also applied to a lone marker, which
// left it looking like an empty, mostly-blank frame. District/city level
// (~12) is what actually shows the marker's surroundings usefully.
const SINGLE_MARKER_ZOOM = 12;
const MULTI_MARKER_MAX_ZOOM = 8;

function FitToMarkers({ projects }: { projects: MapProject[] }) {
  const map = useMap();

  useEffect(() => {
    // Ensure Leaflet recalculates its container size once mounted inside a
    // panel — otherwise the initial view can render off-center.
    map.invalidateSize();

    if (projects.length === 1) {
      map.setView([projects[0].lat, projects[0].lng], SINGLE_MARKER_ZOOM);
    } else if (projects.length > 1) {
      const bounds = L.latLngBounds(projects.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds.pad(0.25), { maxZoom: MULTI_MARKER_MAX_ZOOM });
    } else {
      map.fitBounds(INDIA_BOUNDS);
    }
  }, [map, projects]);

  return null;
}

export function ProjectMapClient({ projects }: { projects: MapProject[] }) {
  const markers = useMemo(() => projects, [projects]);

  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      maxZoom={19}
      style={{ height: "600px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        // World_Imagery's real captured resolution varies a lot by
        // location (well past z19 in some cities, much less in remote
        // areas). Past its native resolution for a given tile, Esri
        // doesn't upsample — it serves a flat gray "Map data not yet
        // available" placeholder, which tiled repeatedly is what read as
        // a coordinate grid/graticule. Capping maxNativeZoom makes
        // Leaflet stop requesting past a resolution that's reliably real
        // imagery everywhere, and stretch that tile for deeper zoom
        // instead (blurrier, but still a photo — never the gray grid).
        maxNativeZoom={17}
        maxZoom={19}
      />
      {/* Esri's reference overlay — roads, place names, boundaries — is
          meant specifically to sit on top of World_Imagery; without it
          satellite tiles have no labels to orient by. */}
      <TileLayer
        attribution="Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={17}
        maxZoom={19}
      />
      <FitToMarkers projects={markers} />
      {markers.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: RISK_COLORS[p.riskTone],
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div className="text-sm min-w-[200px]">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-ink-muted mt-0.5">{p.district}, {p.state}</div>
              <div className="text-xs mt-1.5 flex justify-between">
                <span>Stage</span>
                <span className="font-medium">{p.currentStage.replaceAll("_", " ")}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span>Area</span>
                <span className="font-medium">{p.areaAcres.toLocaleString("en-IN")} acres</span>
              </div>
              {p.khasraReference && (
                <div className="text-xs flex justify-between">
                  <span>Khasra / Khata</span>
                  <span className="font-medium">{p.khasraReference}</span>
                </div>
              )}
              {p.nearestDeadlineLabel && p.nearestDeadlineDays !== null && (
                <div className="text-xs flex justify-between mt-1.5 pt-1.5 border-t border-gray-200">
                  <span>{p.nearestDeadlineLabel}</span>
                  <span className="font-medium">
                    {p.nearestDeadlineDays >= 0
                      ? `${p.nearestDeadlineDays}d remaining`
                      : `${Math.abs(p.nearestDeadlineDays)}d overdue`}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

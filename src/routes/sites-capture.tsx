import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { hydrateTargetsForSite, insertTarget, updateTarget, deleteTarget } from "../lib/api-targets";
import { hydratePhotosForSite } from "../lib/api-photos";
import { PropertyMap } from "../components/Map/PropertyMap";
import { TargetDetailModal } from "../components/Targets/TargetDetailModal";
import type { Site, Target, TargetType } from "../types";

const TARGET_COLORS: Record<TargetType, string> = {
  specimen_tree: "#F4884A",
  tree_run: "#F4884A",
  walkway: "#4AF490",
  garden_bed: "#4AC8F4",
  facade: "#F44A4A",
  architectural_feature: "#F4F44A",
  receptacle: "#FFFFFF",
  custom_fixture: "#888888",
};

const POINT_TYPES: TargetType[] = ["specimen_tree", "architectural_feature", "receptacle", "custom_fixture"];
const LINE_TYPES: TargetType[] = ["tree_run", "walkway", "facade"];
const POLYGON_TYPES: TargetType[] = ["garden_bed"];

export function SiteCaptureRoute() {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [activeType, setActiveType] = useState<TargetType>("specimen_tree");
  const [drawing, setDrawing] = useState<{ type: TargetType; points: [number, number][] } | null>(null);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  // Live targets from Dexie (auto-updates on inserts/updates/deletes)
  const targets = useLiveQuery<Target[]>(
    () => siteId ? db.targets.where("site_id").equals(siteId).sortBy("order_index") : Promise.resolve<Target[]>([]),
    [siteId],
  ) ?? [];

  useEffect(() => {
    if (!siteId) return;
    supabase.from("sites").select("*").eq("id", siteId).single().then(({ data }) => setSite(data as Site));
    // Hydrate local DB from server, ignore failures (e.g., offline) — Dexie still works
    hydrateTargetsForSite(siteId).catch(err => console.warn("[hydrate targets]", err));
    hydratePhotosForSite(siteId).catch(err => console.warn("[hydrate photos]", err));
  }, [siteId]);

  async function handleMapClick(lng: number, lat: number) {
    if (!siteId) return;
    if (POINT_TYPES.includes(activeType)) {
      const t: Omit<Target, "id"> = {
        site_id: siteId, type: activeType,
        geometry: { type: "Point", coordinates: [lng, lat] },
        options: {}, order_index: targets.length,
      };
      await insertTarget(t);
      return;
    }
    if (!drawing || drawing.type !== activeType) {
      setDrawing({ type: activeType, points: [[lng, lat]] });
    } else {
      setDrawing({ ...drawing, points: [...drawing.points, [lng, lat]] });
    }
  }

  async function finishDrawing() {
    if (!drawing || !siteId) return;
    let geometry: any;
    if (LINE_TYPES.includes(drawing.type)) {
      if (drawing.points.length < 2) { setDrawing(null); return; }
      geometry = { type: "LineString", coordinates: drawing.points };
    } else if (POLYGON_TYPES.includes(drawing.type)) {
      if (drawing.points.length < 3) { setDrawing(null); return; }
      const ring = [...drawing.points, drawing.points[0]];
      geometry = { type: "Polygon", coordinates: [ring] };
    }
    const t: Omit<Target, "id"> = {
      site_id: siteId, type: drawing.type,
      geometry, options: {}, order_index: targets.length,
    };
    await insertTarget(t);
    setDrawing(null);
  }

  if (!site) return <p className="p-6">Loading…</p>;

  const pins = targets
    .filter(t => t.geometry.type === "Point")
    .map(t => ({
      id: t.id,
      lng: (t.geometry as any).coordinates[0],
      lat: (t.geometry as any).coordinates[1],
      color: TARGET_COLORS[t.type],
    }));

  const lines = targets
    .filter((t) => t.geometry.type === "LineString")
    .map((t) => ({
      id: t.id,
      coords: (t.geometry as any).coordinates as [number, number][],
      color: TARGET_COLORS[t.type],
    }));

  const polygons = targets
    .filter((t) => t.geometry.type === "Polygon")
    .map((t) => ({
      id: t.id,
      coords: (t.geometry as any).coordinates[0] as [number, number][],
      color: TARGET_COLORS[t.type],
    }));

  return (
    <div className="h-screen flex flex-col">
      <header className="p-3 bg-upscape-panel border-b border-upscape-rule">
        <h1 className="text-lg font-bold">{site.customer_name}</h1>
        <p className="text-sm text-gray-400">{site.property_address}</p>
      </header>
      <main className="flex-1 relative">
        <PropertyMap
          center={[site.map_center_lat ?? 41.14, site.map_center_lng ?? -73.36]}
          zoom={site.map_zoom ?? 20}
          pins={pins}
          lines={lines}
          polygons={polygons}
          draftLine={drawing?.points}
          onMapClick={handleMapClick}
          onPinClick={(id) => setEditingTarget(targets.find(t => t.id === id) ?? null)}
        />
        {drawing && (
          <button onClick={finishDrawing}
                  className="absolute top-4 right-4 bg-upscape-orange text-black px-4 py-2 rounded font-bold shadow-lg z-[1000]">
            Finish ({drawing.points.length} pts)
          </button>
        )}
      </main>
      {editingTarget && (
        <TargetDetailModal
          target={editingTarget}
          siteId={siteId!}
          onSave={async (patch) => {
            await updateTarget(editingTarget.id, patch);
            setEditingTarget(null);
          }}
          onDelete={async () => {
            await deleteTarget(editingTarget.id);
            setEditingTarget(null);
          }}
          onClose={() => setEditingTarget(null)}
        />
      )}
      <ToolPalette activeType={activeType} onChange={setActiveType} />
    </div>
  );
}

function ToolPalette({
  activeType, onChange,
}: { activeType: TargetType; onChange: (t: TargetType) => void; }) {
  const TYPES: { type: TargetType; label: string }[] = [
    { type: "specimen_tree", label: "Tree" },
    { type: "tree_run", label: "Run" },
    { type: "walkway", label: "Path" },
    { type: "garden_bed", label: "Bed" },
    { type: "facade", label: "Facade" },
    { type: "architectural_feature", label: "Feature" },
    { type: "receptacle", label: "Power" },
    { type: "custom_fixture", label: "Custom" },
  ];
  return (
    <nav className="relative z-[400] bg-black/90 backdrop-blur-sm p-2 grid grid-cols-4 gap-1 border-t border-upscape-rule pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TYPES.map((t) => (
        <button
          key={t.type}
          onClick={() => onChange(t.type)}
          className={`p-3 rounded text-sm transition-colors ${activeType === t.type ? "bg-upscape-orange text-black font-bold" : "bg-upscape-panel text-white border border-upscape-rule active:bg-upscape-rule"}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

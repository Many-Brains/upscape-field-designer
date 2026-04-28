import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { listTargets, insertTarget } from "../lib/api-targets";
import { PropertyMap } from "../components/Map/PropertyMap";
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

export function SiteCaptureRoute() {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [activeType, setActiveType] = useState<TargetType>("specimen_tree");

  useEffect(() => {
    if (!siteId) return;
    supabase.from("sites").select("*").eq("id", siteId).single().then(({ data }) => setSite(data as Site));
    listTargets(siteId).then(setTargets);
  }, [siteId]);

  async function handleMapClick(lng: number, lat: number) {
    if (!siteId) return;
    const orderIndex = targets.length;
    const t: Omit<Target, "id"> = {
      site_id: siteId,
      type: activeType,
      geometry: { type: "Point", coordinates: [lng, lat] },
      label: undefined, notes: undefined,
      options: {}, order_index: orderIndex,
    };
    const inserted = await insertTarget(t);
    setTargets([...targets, inserted]);
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

  return (
    <div className="h-screen flex flex-col">
      <header className="p-3 bg-upscape-panel border-b border-upscape-rule">
        <h1 className="text-lg font-bold">{site.customer_name}</h1>
        <p className="text-sm text-gray-400">{site.property_address}</p>
      </header>
      <main className="flex-1 relative">
        <PropertyMap
          center={[site.map_center_lat ?? 41.14, site.map_center_lng ?? -73.36]}
          zoom={site.map_zoom ?? 19}
          pins={pins}
          onMapClick={handleMapClick}
        />
      </main>
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
    <nav className="bg-upscape-panel p-2 grid grid-cols-4 gap-1 border-t border-upscape-rule">
      {TYPES.map((t) => (
        <button
          key={t.type}
          onClick={() => onChange(t.type)}
          className={`p-2 rounded text-sm ${activeType === t.type ? "bg-upscape-orange text-black font-bold" : "bg-upscape-bg text-white"}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

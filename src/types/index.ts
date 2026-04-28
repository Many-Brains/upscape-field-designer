export type TargetType =
  | "specimen_tree" | "tree_run" | "walkway" | "garden_bed"
  | "facade" | "architectural_feature" | "receptacle" | "custom_fixture";

export type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] };

export interface Site {
  id: string;
  customer_name: string;
  property_address: string;
  map_center_lat?: number;
  map_center_lng?: number;
  map_zoom?: number;
  notes?: string;
  status: "capturing" | "proposal_drafted" | "sent" | "accepted";
  created_at: string;
  updated_at: string;
}

export interface Target {
  id: string;
  site_id: string;
  project_id: string;
  type: TargetType;
  geometry: GeoJsonGeometry;
  label?: string;
  notes?: string;
  options: Record<string, unknown>;
  order_index: number;
}

export interface Project {
  id: string;
  site_id: string;
  name: string;
  status: "capturing" | "proposal_drafted" | "sent" | "accepted";
  goals?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  site_id: string;
  target_id: string | null;
  storage_path: string;
  thumbnail_path: string | null;
  captured_at: string;
  captured_lat?: number;
  captured_lng?: number;
  caption?: string;
  order_index: number;
}

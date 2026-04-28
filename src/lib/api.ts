import { supabase } from "./supabase";
import type { Site } from "../types";

export async function listSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites").select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Site[];
}

export async function createSite(input: {
  customer_name: string; property_address: string;
  map_center_lat: number; map_center_lng: number; map_zoom: number;
}): Promise<Site> {
  const { data, error } = await supabase
    .from("sites").insert({ ...input, status: "capturing" })
    .select().single();
  if (error) throw error;
  return data as Site;
}

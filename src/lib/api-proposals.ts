import { supabase } from "./supabase";

export async function requestDraft(siteId: string) {
  const { error } = await supabase.from("proposals").insert({
    site_id: siteId,
    draft_requested: true,
    status: "pending",
  });
  if (error) throw error;
}

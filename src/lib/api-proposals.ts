import { supabase } from "./supabase";

export async function requestDraft(siteId: string, projectId: string) {
  const { error } = await supabase.from("proposals").insert({
    site_id: siteId,
    project_id: projectId,
    draft_requested: true,
    status: "pending",
  });
  if (error) throw error;
}

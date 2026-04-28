import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error("Missing Supabase env vars");

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Implicit flow lets verifyOtp() accept email codes directly — required for PWAs
    // where the user types the OTP into the installed app instead of clicking a magic link.
    flowType: "implicit",
  },
});

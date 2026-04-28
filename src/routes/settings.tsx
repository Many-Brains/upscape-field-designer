import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";

export function SettingsRoute() {
  const nav = useNavigate();
  const version = import.meta.env.VITE_APP_VERSION ?? "dev";

  async function signOut() {
    if (!confirm("Sign out and clear local data on this device?")) return;
    await supabase.auth.signOut();
    await db.delete();
    await db.open();
    nav("/login");
  }

  async function resetLocalData() {
    if (!confirm("Wipe local cache only (you stay signed in)?")) return;
    await db.delete();
    await db.open();
    nav("/");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <Link to="/" className="text-upscape-orange text-sm mb-4 inline-block">← Sites</Link>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-400 text-sm mb-6">Version {version}</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={resetLocalData}
          className="bg-upscape-panel border border-upscape-rule px-4 py-3 rounded text-left"
        >
          <div className="font-bold">Reset local cache</div>
          <div className="text-gray-400 text-xs">
            Clears the IndexedDB copy. Server data is untouched.
          </div>
        </button>

        <button
          onClick={signOut}
          className="bg-red-700 px-4 py-3 rounded text-left"
        >
          <div className="font-bold">Sign Out</div>
          <div className="text-red-200 text-xs">
            Clears session and local data on this device.
          </div>
        </button>
      </div>
    </div>
  );
}

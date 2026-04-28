import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSite } from "../lib/api";
import { geocodeAddress } from "../lib/geocode";

export function NewSiteRoute() {
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const geo = await geocodeAddress(address);
    if (!geo) { setErr("Couldn't find that address."); setBusy(false); return; }
    try {
      const site = await createSite({
        customer_name: customer,
        property_address: geo.place_name,
        map_center_lat: geo.lat, map_center_lng: geo.lng, map_zoom: 20,
      });
      nav(`/sites/${site.id}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4 max-w-md mx-auto flex flex-col gap-3">
      <h1 className="text-2xl font-bold mb-2">New Site</h1>
      <input
        required placeholder="Customer name (Last, First)" value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule"
      />
      <input
        required placeholder="Property address" value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="rounded p-3 bg-upscape-panel border border-upscape-rule"
      />
      <button disabled={busy} className="rounded p-3 bg-upscape-orange text-black font-bold disabled:opacity-50">
        {busy ? "Looking up…" : "Start Capture"}
      </button>
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}

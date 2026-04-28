const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface GeocodeResult {
  lat: number; lng: number; place_name: string;
}

export async function geocodeAddress(q: string): Promise<GeocodeResult | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${TOKEN}&country=US&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const j = await res.json();
  const f = j.features?.[0];
  if (!f) return null;
  const [lng, lat] = f.center;
  return { lat, lng, place_name: f.place_name };
}

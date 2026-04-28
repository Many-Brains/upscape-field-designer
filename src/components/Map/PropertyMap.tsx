import { MapContainer, TileLayer, Marker, Polyline, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface PropertyMapProps {
  center: [number, number];
  zoom: number;
  pins: { id: string; lng: number; lat: number; color: string }[];
  lines?: { id: string; coords: [number, number][]; color: string }[];   // [lng, lat]
  polygons?: { id: string; coords: [number, number][]; color: string }[]; // [lng, lat]
  draftLine?: [number, number][];  // in-progress polyline being drawn (lng, lat)
  onMapClick: (lng: number, lat: number) => void;
  onPinClick?: (id: string) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: (lng: number, lat: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lng, e.latlng.lat); } });
  return null;
}

const pinIcon = (color: string) => L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.6)"></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const toLatLng = (c: [number, number]): [number, number] => [c[1], c[0]];

export function PropertyMap(props: PropertyMapProps) {
  const { center, zoom, pins, lines = [], polygons = [], draftLine, onMapClick, onPinClick } = props;
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}@2x?access_token=${TOKEN}`}
        attribution='© Mapbox © OpenStreetMap'
        tileSize={512}
        zoomOffset={-1}
      />
      <ClickHandler onMapClick={onMapClick} />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.color)}
                eventHandlers={{ click: () => onPinClick?.(p.id) }} />
      ))}
      {lines.map((ln) => (
        <Polyline key={ln.id} positions={ln.coords.map(toLatLng)}
                  pathOptions={{ color: ln.color, weight: 4 }} />
      ))}
      {polygons.map((pg) => (
        <Polygon key={pg.id} positions={pg.coords.map(toLatLng)}
                 pathOptions={{ color: pg.color, weight: 2, fillOpacity: 0.2 }} />
      ))}
      {draftLine && draftLine.length > 1 && (
        <Polyline positions={draftLine.map(toLatLng)}
                  pathOptions={{ color: "#F4884A", weight: 4, dashArray: "8 6" }} />
      )}
    </MapContainer>
  );
}

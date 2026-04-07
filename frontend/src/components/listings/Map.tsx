import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack/vite bundling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Barcelona center
const BARCELONA_CENTER: [number, number] = [41.3851, 2.1734];

// Approximate neighborhood coordinates for Barcelona
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  "Eixample": [41.3947, 2.1635],
  "Gràcia": [41.4029, 2.1568],
  "Sant Martí": [41.4127, 2.2019],
  "Sarrià-Sant Gervasi": [41.4026, 2.1274],
  "Les Corts": [41.3849, 2.1271],
  "Horta-Guinardó": [41.4240, 2.1681],
  "Nou Barris": [41.4408, 2.1777],
  "Sant Andreu": [41.4335, 2.1892],
  "Sants-Montjuïc": [41.3692, 2.1485],
  "Ciutat Vella": [41.3823, 2.1770],
  "Poblenou": [41.4032, 2.2006],
  "El Born": [41.3852, 2.1814],
  "El Raval": [41.3799, 2.1686],
  "Barceloneta": [41.3782, 2.1893],
  "Pedralbes": [41.3882, 2.1087],
};

function getCoords(neighborhood: string): [number, number] {
  const exact = NEIGHBORHOOD_COORDS[neighborhood];
  if (exact) return exact;
  const key = Object.keys(NEIGHBORHOOD_COORDS).find(
    (k) =>
      neighborhood.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(neighborhood.toLowerCase())
  );
  return key ? NEIGHBORHOOD_COORDS[key] : BARCELONA_CENTER;
}

interface BarcelonaMapProps {
  neighborhood: string;
}

export default function BarcelonaMap({ neighborhood }: BarcelonaMapProps) {
  const coords = getCoords(neighborhood);

  return (
    <div className="overflow-hidden rounded-lg border" style={{ height: 320 }}>
      <MapContainer
        center={coords}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{neighborhood}, Barcelona</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

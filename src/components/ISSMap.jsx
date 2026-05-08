import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ISS Icon — using a glowing satellite emoji as data URL fallback to avoid CORS issues
const createISSIcon = (darkMode) => new L.DivIcon({
  html: `
    <div style="
      width: 46px; height: 46px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      filter: drop-shadow(0 0 8px ${darkMode ? '#00d4ff' : '#2563eb'}) drop-shadow(0 0 16px ${darkMode ? 'rgba(0,212,255,0.5)' : 'rgba(37,99,235,0.4)'});
      animation: iss-pulse 2s ease-in-out infinite;
    ">🛰️</div>
    <style>
      @keyframes iss-pulse {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `,
  className: '',
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -28],
});

// Tile URLs
const TILES = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

function MapUpdater({ center, darkMode }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export function ISSMap({ position, path, speed, altitude, loading, darkMode }) {
  if (loading || !position) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[hsl(var(--muted)/0.5)] rounded-xl border border-[hsl(var(--border))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mb-3" />
        <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
          Acquiring satellite signal...
        </span>
        <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-60">
          Connecting to ISS telemetry
        </span>
      </div>
    );
  }

  const center = [position.lat, position.lng];
  const tile = darkMode ? TILES.dark : TILES.light;
  const issIcon = createISSIcon(darkMode);

  // Trajectory color
  const pathColor = darkMode ? '#00d4ff' : '#2563eb';

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-[hsl(var(--border))] relative">
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          key={darkMode ? 'dark' : 'light'}
          attribution={tile.attribution}
          url={tile.url}
        />

        {/* ISS Marker */}
        <Marker position={center} icon={issIcon}>
          <Popup>
            <div className="text-center text-sm font-sans" style={{ minWidth: 160 }}>
              <p className="font-bold text-base mb-2">🛰️ ISS Live Position</p>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 4px', color: '#6b7280' }}>Latitude</td>
                    <td style={{ padding: '2px 4px', fontWeight: 600 }}>{position.lat.toFixed(4)}°</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px', color: '#6b7280' }}>Longitude</td>
                    <td style={{ padding: '2px 4px', fontWeight: 600 }}>{position.lng.toFixed(4)}°</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px', color: '#6b7280' }}>Altitude</td>
                    <td style={{ padding: '2px 4px', fontWeight: 600 }}>{Math.round(altitude || 408)} km</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px', color: '#6b7280' }}>Speed</td>
                    <td style={{ padding: '2px 4px', fontWeight: 600 }}>{Math.round(speed || 27600).toLocaleString()} km/h</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Popup>
        </Marker>

        {/* Trajectory Path */}
        {path && path.length > 1 && (
          <Polyline
            positions={path}
            color={pathColor}
            weight={3}
            opacity={0.8}
            dashArray="6, 10"
          />
        )}

        {/* Trajectory start dot */}
        {path && path.length > 0 && (
          <Marker
            position={path[0]}
            icon={new L.DivIcon({
              html: `<div style="width:8px;height:8px;border-radius:50%;background:${pathColor};opacity:0.5;border:1px solid white"></div>`,
              className: '',
              iconSize: [8, 8],
              iconAnchor: [4, 4],
            })}
          />
        )}

        <MapUpdater center={center} darkMode={darkMode} />
      </MapContainer>
    </div>
  );
}

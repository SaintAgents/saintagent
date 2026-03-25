import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Users, Clock, Coins, MapPin, Zap, AlertTriangle } from "lucide-react";
import { createPageUrl } from '@/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TYPE_COLORS = {
  platform: '#7c3aed', circle: '#3b82f6', region: '#10b981',
  leader: '#f59e0b', personal: '#6366f1'
};

const STATUS_URGENCY = {
  active: { label: 'Active', color: 'bg-emerald-500' },
  draft: { label: 'Draft', color: 'bg-slate-400' },
  pending_approval: { label: 'Pending', color: 'bg-amber-500' }
};

function createMissionIcon(missionType, isUrgent) {
  const color = TYPE_COLORS[missionType] || '#7c3aed';
  const border = isUrgent ? '#ef4444' : color;
  const size = isUrgent ? 36 : 30;

  return L.divIcon({
    className: 'custom-mission-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${color}; border: 3px solid ${border};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3)${isUrgent ? ', 0 0 12px rgba(239,68,68,0.5)' : ''};
      color: white; font-weight: bold; font-size: 12px;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Generate deterministic pseudo-random coordinates based on mission data
function getMissionCoords(mission, index) {
  // Use mission properties to seed a basic distribution across the globe
  const hashStr = (mission.id || '') + (mission.title || '') + index;
  let hash = 0;
  for (let i = 0; i < hashStr.length; i++) {
    hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
    hash |= 0;
  }
  // Spread across major population centers
  const centers = [
    [40.71, -74.01],  // NYC
    [51.51, -0.13],   // London
    [35.68, 139.69],  // Tokyo
    [48.86, 2.35],    // Paris
    [-33.87, 151.21], // Sydney
    [37.77, -122.42], // SF
    [55.75, 37.62],   // Moscow
    [1.35, 103.82],   // Singapore
    [-23.55, -46.63], // São Paulo
    [28.61, 77.21],   // Delhi
    [34.05, -118.24], // LA
    [52.52, 13.41],   // Berlin
    [25.20, 55.27],   // Dubai
    [19.43, -99.13],  // Mexico City
    [41.39, 2.17],    // Barcelona
  ];
  const center = centers[Math.abs(hash) % centers.length];
  const latJitter = ((hash % 500) - 250) / 100;
  const lngJitter = (((hash >> 8) % 500) - 250) / 100;
  return [center[0] + latJitter, center[1] + lngJitter];
}

export default function MissionMapView({ missions = [], onAction }) {
  const missionMarkers = useMemo(() => {
    return missions.map((m, i) => {
      const coords = getMissionCoords(m, i);
      const endingSoon = m.end_time && (new Date(m.end_time) - new Date()) < 3 * 24 * 60 * 60 * 1000;
      return { ...m, lat: coords[0], lng: coords[1], isUrgent: endingSoon };
    });
  }, [missions]);

  const urgentCount = missionMarkers.filter(m => m.isUrgent).length;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        <span className="text-xs font-medium text-slate-500">Mission Types:</span>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-600 capitalize">{type}</span>
          </div>
        ))}
        {urgentCount > 0 && (
          <Badge className="bg-rose-100 text-rose-700 text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            {urgentCount} ending soon
          </Badge>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '500px' }}>
        <MapContainer center={[30, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {missionMarkers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={createMissionIcon(m.mission_type, m.isUrgent)}>
              <Popup className="mission-popup" maxWidth={280}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs capitalize" style={{ backgroundColor: TYPE_COLORS[m.mission_type] + '20', color: TYPE_COLORS[m.mission_type], border: `1px solid ${TYPE_COLORS[m.mission_type]}40` }}>
                      {m.mission_type}
                    </Badge>
                    {m.isUrgent && <Badge className="bg-rose-100 text-rose-700 text-xs">Urgent</Badge>}
                    <div className={`w-2 h-2 rounded-full ${STATUS_URGENCY[m.status]?.color || 'bg-slate-400'}`} />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{m.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{m.objective || m.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.participant_count || 0}</span>
                    {m.reward_ggg > 0 && <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-amber-500" />{m.reward_ggg} GGG</span>}
                    {m.end_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.end_time).toLocaleDateString()}</span>}
                  </div>
                  <Button size="sm" className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 h-7 text-xs"
                    onClick={() => window.location.href = createPageUrl('MissionDetail') + `?id=${m.id}`}>
                    View Mission
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
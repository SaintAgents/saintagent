import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, MapPin, Trash2, Save, Edit2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, size = 30) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background: ${color}; 
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}80;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Map event handler for drawing geo-fences
function DrawingHandler({ isDrawing, onAddPoint, onFinishDrawing }) {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    dblclick: (e) => {
      if (isDrawing) {
        e.originalEvent.preventDefault();
        onFinishDrawing();
      }
    }
  });
  return null;
}

// Fit bounds to markers
function FitBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [positions, map]);
  
  return null;
}

export default function GeoMapView({
  users = [],
  circles = [],
  geoFences = [],
  onUserClick,
  onCircleClick,
  onGeoFenceCreate,
  onGeoFenceDelete,
  editable = false,
  className,
  height = "500px"
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [selectedFence, setSelectedFence] = useState(null);

  // Combine all positions for bounds
  const allPositions = [
    ...users.filter(u => u.latitude && u.longitude).map(u => ({ lat: u.latitude, lng: u.longitude })),
    ...circles.filter(c => c.latitude && c.longitude).map(c => ({ lat: c.latitude, lng: c.longitude })),
    ...geoFences.flatMap(f => f.coordinates || [])
  ];

  const handleAddPoint = (point) => {
    setDrawingPoints(prev => [...prev, point]);
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length >= 3 && onGeoFenceCreate) {
      onGeoFenceCreate(drawingPoints);
    }
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const handleCancelDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden border", className)} style={{ height }}>
      {/* Drawing Controls */}
      {editable && (
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          {isDrawing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelDrawing}
                className="bg-white/90 backdrop-blur"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleFinishDrawing}
                disabled={drawingPoints.length < 3}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Fence ({drawingPoints.length} points)
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsDrawing(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Draw Geo-Fence
            </Button>
          )}
        </div>
      )}

      {/* Drawing Instructions */}
      {isDrawing && (
        <div className="absolute top-4 left-4 z-[1000] px-3 py-2 rounded-lg bg-violet-600 text-white text-sm">
          Click to add points • Double-click to finish
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={!isDrawing}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DrawingHandler
          isDrawing={isDrawing}
          onAddPoint={handleAddPoint}
          onFinishDrawing={handleFinishDrawing}
        />

        {allPositions.length > 0 && <FitBounds positions={allPositions} />}

        {/* Geo-Fences */}
        {geoFences.map((fence, idx) => (
          fence.coordinates?.length >= 3 && (
            <Polygon
              key={fence.id || idx}
              positions={fence.coordinates.map(c => [c.lat, c.lng])}
              pathOptions={{
                color: fence.color || '#6366f1',
                fillColor: fence.color || '#6366f1',
                fillOpacity: 0.2,
                weight: 2
              }}
              eventHandlers={{
                click: () => setSelectedFence(fence)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold">{fence.name}</h4>
                  {fence.description && (
                    <p className="text-sm text-slate-600 mt-1">{fence.description}</p>
                  )}
                  <Badge className="mt-2" variant="outline">{fence.zone_type}</Badge>
                  {editable && onGeoFenceDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-2 w-full"
                      onClick={() => onGeoFenceDelete(fence.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </Popup>
            </Polygon>
          )
        ))}

        {/* Drawing Preview */}
        {drawingPoints.length >= 2 && (
          <Polygon
            positions={drawingPoints.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 10'
            }}
          />
        )}

        {/* Drawing Points */}
        {drawingPoints.map((point, idx) => (
          <Circle
            key={idx}
            center={[point.lat, point.lng]}
            radius={5000}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.8
            }}
          />
        ))}

        {/* User Markers */}
        {users.filter(u => u.latitude && u.longitude).map((user) => (
          <Marker
            key={user.user_id || user.id}
            position={[user.latitude, user.longitude]}
            icon={createCustomIcon(user.status === 'online' ? '#22c55e' : '#6366f1', 24)}
            eventHandlers={{
              click: () => onUserClick?.(user)
            }}
          >
            <Popup>
              <div className="flex items-center gap-3 p-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user.display_name || 'User'}</div>
                  <div className={cn(
                    "text-xs",
                    user.status === 'online' ? 'text-green-600' : 'text-slate-500'
                  )}>
                    {user.status || 'offline'}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Circle Markers */}
        {circles.filter(c => c.latitude && c.longitude).map((circle) => (
          <Marker
            key={circle.id}
            position={[circle.latitude, circle.longitude]}
            icon={createCustomIcon('#f59e0b', 30 + Math.min(circle.member_count || 0, 20))}
            eventHandlers={{
              click: () => onCircleClick?.(circle)
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="font-semibold">{circle.name}</div>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <Users className="w-3 h-3" />
                  {circle.member_count || 0} members
                </div>
                {circle.category && (
                  <Badge variant="outline" className="mt-2">{circle.category}</Badge>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
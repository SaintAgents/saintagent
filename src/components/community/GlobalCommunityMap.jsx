import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Users, MapPin, Globe, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

// City coordinates mapping for common locations
const CITY_COORDINATES = {
  'new york': [40.7128, -74.0060],
  'los angeles': [34.0522, -118.2437],
  'london': [51.5074, -0.1278],
  'paris': [48.8566, 2.3522],
  'tokyo': [35.6762, 139.6503],
  'sydney': [-33.8688, 151.2093],
  'berlin': [52.5200, 13.4050],
  'toronto': [43.6532, -79.3832],
  'dubai': [25.2048, 55.2708],
  'singapore': [1.3521, 103.8198],
  'mumbai': [19.0760, 72.8777],
  'são paulo': [-23.5505, -46.6333],
  'mexico city': [19.4326, -99.1332],
  'cairo': [30.0444, 31.2357],
  'johannesburg': [-26.2041, 28.0473],
  'moscow': [55.7558, 37.6173],
  'beijing': [39.9042, 116.4074],
  'seoul': [37.5665, 126.9780],
  'bangkok': [13.7563, 100.5018],
  'amsterdam': [52.3676, 4.9041],
  'san francisco': [37.7749, -122.4194],
  'chicago': [41.8781, -87.6298],
  'miami': [25.7617, -80.1918],
  'austin': [30.2672, -97.7431],
  'seattle': [47.6062, -122.3321],
  'denver': [39.7392, -104.9903],
  'phoenix': [33.4484, -112.0740],
  'boston': [42.3601, -71.0589],
  'atlanta': [33.7490, -84.3880],
  'dallas': [32.7767, -96.7970],
  'default': [20, 0]
};

// Get coordinates from location string
const getCoordinates = (location) => {
  if (!location) return null;
  const loc = location.toLowerCase();
  
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (loc.includes(city)) {
      // Add small random offset to prevent exact overlaps
      return [
        coords[0] + (Math.random() - 0.5) * 0.5,
        coords[1] + (Math.random() - 0.5) * 0.5
      ];
    }
  }
  
  // Return random position if no match (distributed globally)
  return [
    (Math.random() - 0.5) * 120,
    (Math.random() - 0.5) * 300
  ];
};

// Create custom avatar marker icon
const createAvatarIcon = (avatarUrl, displayName, isOnline) => {
  const initials = displayName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  const onlineRing = isOnline ? 'ring-2 ring-green-400 ring-offset-1' : '';
  
  return L.divIcon({
    html: `
      <div class="avatar-marker-container" style="position: relative; width: 44px; height: 44px;">
        <div class="avatar-marker ${onlineRing}" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #7c3aed;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ${avatarUrl 
            ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextSibling.style.display='flex';" /><span style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center;">${initials}</span>`
            : `<span>${initials}</span>`
          }
        </div>
        ${isOnline ? `<div style="position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid white;"></div>` : ''}
      </div>
    `,
    className: 'custom-avatar-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
};

// Map recenter component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function GlobalCommunityMap({ open, onClose }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Fetch all user profiles with locations
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['communityMapProfiles'],
    queryFn: async () => {
      const allProfiles = await base44.entities.UserProfile.list('-created_date', 500);
      return allProfiles.filter(p => p.location || p.region);
    },
    enabled: open
  });

  // Process profiles into map markers
  const markers = profiles.map(profile => {
    const coords = getCoordinates(profile.location || profile.region);
    const isOnline = profile.last_seen_at && 
      (new Date() - new Date(profile.last_seen_at)) < 5 * 60 * 1000; // 5 min
    
    return {
      ...profile,
      coords,
      isOnline
    };
  }).filter(p => p.coords);

  const onlineCount = markers.filter(m => m.isOnline).length;

  const handleUserClick = (profile) => {
    setSelectedUser(profile);
  };

  const handleViewProfile = (userId) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Globe className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Global Community Map</DialogTitle>
                <p className="text-sm text-slate-500">
                  {markers.length} members worldwide • {onlineCount} online now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                {onlineCount} Online
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 h-full">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
                <p className="text-slate-600">Loading community...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapController center={mapCenter} zoom={mapZoom} />
              
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.coords}
                  icon={createAvatarIcon(marker.avatar_url, marker.display_name, marker.isOnline)}
                  eventHandlers={{
                    click: () => handleUserClick(marker)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-12 h-12 border-2 border-violet-200">
                          <AvatarImage src={marker.avatar_url} />
                          <AvatarFallback className="bg-violet-100 text-violet-700">
                            {marker.display_name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">{marker.display_name}</p>
                          <p className="text-xs text-slate-500">@{marker.handle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        {marker.location || marker.region || 'Unknown'}
                      </div>
                      
                      {marker.tagline && (
                        <p className="text-xs text-slate-600 mb-2 italic">"{marker.tagline}"</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        {marker.isOnline && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
                        )}
                        {marker.rp_rank_code && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {marker.rp_rank_code}
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-violet-600 hover:bg-violet-700"
                        onClick={() => handleViewProfile(marker.user_id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
            <p className="text-xs font-medium text-slate-700 mb-2">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-200" />
                Online now
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                Community member
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-violet-600">{markers.length}</p>
                <p className="text-xs text-slate-500">Members</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{onlineCount}</p>
                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .custom-avatar-icon {
            background: transparent !important;
            border: none !important;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
          .leaflet-popup-content {
            margin: 0;
          }
          .leaflet-container {
            font-family: inherit;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
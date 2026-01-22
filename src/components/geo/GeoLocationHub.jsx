import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Map, MapPin, Users, Sparkles, Locate, RefreshCw } from "lucide-react";
import SpinningGlobe from './SpinningGlobe';
import GeoMapView from './GeoMapView';
import GeoFenceManager from './GeoFenceManager';

export default function GeoLocationHub({ 
  circles = [], 
  onCircleClick,
  className 
}) {
  const [viewMode, setViewMode] = useState('globe');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [pendingCoordinates, setPendingCoordinates] = useState([]);
  const [selectedFenceId, setSelectedFenceId] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-last_seen_at', 200)
  });

  const { data: geoFences = [] } = useQuery({
    queryKey: ['geoFences'],
    queryFn: () => base44.entities.GeoFenceZone.filter({ active: true })
  });

  const updateLocationMutation = useMutation({
    mutationFn: (coords) => base44.entities.UserProfile.update(userProfile.id, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      last_seen_at: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allProfiles'] })
  });

  // Filter users
  const filteredUsers = profiles.filter(p => {
    if (showOnlineOnly) {
      const lastSeen = p.last_seen_at ? new Date(p.last_seen_at) : null;
      const isOnline = lastSeen && (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000;
      if (!isOnline) return false;
    }
    return true;
  }).map(p => ({
    ...p,
    status: (() => {
      const lastSeen = p.last_seen_at ? new Date(p.last_seen_at) : null;
      return lastSeen && (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000 ? 'online' : 'offline';
    })()
  }));

  // Add demo coordinates to circles/users that don't have them
  const circlesWithCoords = circles.map((c, i) => ({
    ...c,
    latitude: c.latitude || (40 + Math.sin(i * 0.7) * 40),
    longitude: c.longitude || (-100 + Math.cos(i * 0.7) * 150)
  }));

  const usersWithCoords = filteredUsers.map((u, i) => ({
    ...u,
    latitude: u.latitude || (30 + Math.sin(i * 0.5) * 50),
    longitude: u.longitude || (-50 + Math.cos(i * 0.5) * 120)
  }));

  // Get current location
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocationMutation.mutate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleUserClick = (user) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: user.user_id } }));
  };

  const handleGeoFenceCreate = (coordinates) => {
    setPendingCoordinates(coordinates);
  };

  const selectedFence = geoFences.find(f => f.id === selectedFenceId);
  const onlineCount = usersWithCoords.filter(u => u.status === 'online').length;

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-xl border overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-violet-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Network</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={showOnlineOnly}
                onCheckedChange={setShowOnlineOnly}
                className="scale-75"
              />
              <span className="text-slate-600 dark:text-slate-400">Online only</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLocateMe}
              disabled={isLocating || !userProfile}
              className="gap-1"
            >
              {isLocating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Locate className="w-4 h-4" />
              )}
              Share Location
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400">{onlineCount} online</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">{usersWithCoords.length} users</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">{circlesWithCoords.length} groups</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-violet-500" />
            <span className="text-slate-600 dark:text-slate-400">{geoFences.length} zones</span>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="p-3 border-b">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="w-full">
            <TabsTrigger value="globe" className="flex-1 gap-1">
              <Globe className="w-4 h-4" />
              3D Globe
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 gap-1">
              <Map className="w-4 h-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex-1 gap-1">
              <MapPin className="w-4 h-4" />
              Geo-Fences
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'globe' && (
          <div className="flex justify-center">
            <SpinningGlobe
              users={usersWithCoords}
              circles={circlesWithCoords}
              geoFences={geoFences}
              onUserClick={handleUserClick}
              onCircleClick={onCircleClick}
              size={400}
            />
          </div>
        )}

        {viewMode === 'map' && (
          <GeoMapView
            users={usersWithCoords}
            circles={circlesWithCoords}
            geoFences={geoFences}
            onUserClick={handleUserClick}
            onCircleClick={onCircleClick}
            onGeoFenceCreate={handleGeoFenceCreate}
            editable={true}
            height="450px"
          />
        )}

        {viewMode === 'manage' && (
          <GeoFenceManager
            selectedFenceId={selectedFenceId}
            onSelectFence={(fence) => setSelectedFenceId(fence?.id)}
            pendingCoordinates={pendingCoordinates}
            onClearPending={() => setPendingCoordinates([])}
          />
        )}
      </div>

      {/* Selected Fence Info */}
      {selectedFence && viewMode !== 'manage' && (
        <div className="p-3 border-t bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedFence.color || '#6366f1' }}
            />
            <span className="font-medium">{selectedFence.name}</span>
            <Badge variant="outline" className="text-xs">{selectedFence.zone_type}</Badge>
          </div>
          {selectedFence.description && (
            <p className="text-sm text-slate-500 mt-1">{selectedFence.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
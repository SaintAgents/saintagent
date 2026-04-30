import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import MissionNetworkSVG from '@/components/missions/MissionNetworkSVG';
import MissionNodeDetail from '@/components/missions/MissionNodeDetail';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Filter, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const STATUS_COLORS = {
  active: '#10b981',
  completed: '#6366f1',
  draft: '#94a3b8',
  cancelled: '#ef4444',
  pending_approval: '#f59e0b',
};

export default function MissionGrid() {
  const [selectedMission, setSelectedMission] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [zoom, setZoom] = React.useState(1);

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['allMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
    staleTime: 120000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
    staleTime: 300000,
  });

  const profileMap = React.useMemo(() => {
    const m = {};
    profiles.forEach(p => { m[p.user_id] = p; });
    return m;
  }, [profiles]);

  const filtered = statusFilter === 'all'
    ? missions
    : missions.filter(m => m.status === statusFilter);

  const counts = React.useMemo(() => {
    const c = { total: missions.length, active: 0, completed: 0, draft: 0 };
    missions.forEach(m => { if (c[m.status] !== undefined) c[m.status]++; });
    return c;
  }, [missions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-7 h-7 text-violet-600" />
              Mission Grid Visualization
            </h1>
            <p className="text-slate-500 text-sm mt-1">Interactive network of interconnected missions</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-slate-100 text-slate-700">{counts.total} missions</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">{counts.active} active</Badge>
            <Badge className="bg-violet-100 text-violet-700">{counts.completed} completed</Badge>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-4">
          <CardContent className="py-3 flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setZoom(1); setSelectedMission(null); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        <div className="flex gap-4">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 relative" style={{ height: 'calc(100vh - 280px)', minHeight: 500 }}>
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <MissionNetworkSVG
                  missions={filtered}
                  profileMap={profileMap}
                  selectedId={selectedMission?.id}
                  onSelect={setSelectedMission}
                  zoom={zoom}
                  statusColors={STATUS_COLORS}
                />
              )}
            </CardContent>
          </Card>

          {/* Detail Sidebar */}
          {selectedMission && (
            <MissionNodeDetail
              mission={selectedMission}
              profileMap={profileMap}
              onClose={() => setSelectedMission(null)}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 flex-wrap">
          <span className="font-medium">Legend:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1 capitalize">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {status.replace('_', ' ')}
            </span>
          ))}
          <span className="flex items-center gap-1"><span className="w-6 border-t border-slate-300 border-dashed" /> shared participants</span>
        </div>
      </div>
    </div>
  );
}
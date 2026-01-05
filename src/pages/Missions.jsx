import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Plus,
  Sparkles,
  Users,
  MapPin,
  Crown,
  Filter } from
"lucide-react";

import MissionCard from '@/components/hud/MissionCard';
import CreateMissionModal from '@/components/CreateMissionModal';
import EarningsMatrixModal from '@/components/earnings/EarningsMatrixModal';
import HelpHint from '@/components/hud/HelpHint';

export default function Missions() {
  const [tab, setTab] = useState('active');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 50)
  });

  // Separate active vs past missions
  const now = new Date();
  const activeMissions = missions.filter((m) => {
    if (m.status === 'completed' || m.status === 'cancelled') return false;
    if (m.end_time && new Date(m.end_time) < now) return false;
    return true;
  });
  const pastMissions = missions.filter((m) => {
    if (m.status === 'completed' || m.status === 'cancelled') return true;
    if (m.end_time && new Date(m.end_time) < now) return true;
    return false;
  });

  const filteredMissions = tab === 'active' ? activeMissions :
    tab === 'past' ? pastMissions :
    tab === 'all' ? missions :
    activeMissions.filter((m) => m.mission_type === tab);

  const handleAction = (action, mission) => {
    console.log('Mission action:', action, mission);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-500" />
              Missions & Quests
              <HelpHint content="Missions are collaborative tasks you can join to earn GGG, rank points, and boosts. Platform missions are system-created, while Circle, Region, and Leader missions come from the community. Complete tasks, fulfill roles, and collaborate with others. Mission rewards are capped at $55 equivalent." />
            </h1>
            <p className="text-slate-500 mt-1">Join collaborative missions to earn GGG, rank points, and boosts (mission rewards capped at $55).</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2">

              <Plus className="w-4 h-4" />
              Create Mission
            </Button>
            <Button
              variant="outline" className="bg-violet-100 text-stone-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9"

              onClick={() => setMatrixOpen(true)}>

              Earnings Matrix
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-7 h-11 bg-white rounded-xl border">
            <TabsTrigger value="active" className="rounded-lg gap-2">
              <Target className="w-4 h-4" />
              Active
              {activeMissions.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-emerald-100 text-emerald-700">{activeMissions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg gap-2">
              Past
              {pastMissions.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-600">{pastMissions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-lg gap-2">
              <Sparkles className="w-4 h-4" />
              Platform
            </TabsTrigger>
            <TabsTrigger value="circle" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              Circle
            </TabsTrigger>
            <TabsTrigger value="region" className="rounded-lg gap-2">
              <MapPin className="w-4 h-4" />
              Region
            </TabsTrigger>
            <TabsTrigger value="leader" className="rounded-lg gap-2">
              <Crown className="w-4 h-4" />
              Leader
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg gap-2">
              <Filter className="w-4 h-4" />
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Missions Grid */}
        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) =>
          <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
          )}
          </div> :
        filteredMissions.length === 0 ?
        <div className="text-center py-16">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No missions available</h3>
            <p className="text-slate-500 mb-6">Create your own mission or check back later</p>
            <Button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl bg-violet-600 hover:bg-violet-700">

              Create Mission
            </Button>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) =>
          <MissionCard
            key={mission.id}
            mission={mission}
            onAction={handleAction} />

          )}
          </div>
        }
      </div>

      <CreateMissionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)} />


      <EarningsMatrixModal open={matrixOpen} onOpenChange={setMatrixOpen} />
    </div>);

}
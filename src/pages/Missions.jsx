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
  Filter
} from "lucide-react";

import MissionCard from '@/components/hud/MissionCard';

export default function Missions() {
  const [tab, setTab] = useState('all');

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 50)
  });

  const filteredMissions = tab === 'all' 
    ? missions 
    : missions.filter(m => m.mission_type === tab);

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
            </h1>
            <p className="text-slate-500 mt-1">Join collaborative missions to earn GGG, rank points, and boosts</p>
          </div>
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            Create Mission
          </Button>
        </div>

        {/* Filters */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-5 h-11 bg-white rounded-xl border">
            <TabsTrigger value="all" className="rounded-lg gap-2">
              <Filter className="w-4 h-4" />
              All
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
          </TabsList>
        </Tabs>

        {/* Missions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No missions available</h3>
            <p className="text-slate-500 mb-6">Create your own mission or check back later</p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Create Mission
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map(mission => (
              <MissionCard 
                key={mission.id} 
                mission={mission} 
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
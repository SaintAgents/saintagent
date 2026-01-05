import React from 'react';
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import MissionCard from '@/components/hud/MissionCard';
import HelpHint from '@/components/hud/HelpHint';

export default function MissionsQuests({ missions = [], profile, onAction }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Missions & Quests are collaborative tasks you can join to earn GGG, rank points, and boosts. Platform missions are created by the system, while Circle, Region, and Leader missions come from community members. Mission rewards are capped at $55." />
      </div>
      {missions.length === 0 ? (
        <div className="text-center py-6">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No active missions</p>
          <Button variant="outline" className="mt-3 rounded-xl">
            Browse missions
          </Button>
        </div>
      ) : (
        missions.slice(0, 2).map((mission) => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            onAction={onAction}
            variant="compact"
          />
        ))
      )}
    </div>
  );
}
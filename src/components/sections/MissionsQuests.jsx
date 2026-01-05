import React from 'react';
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import MissionCard from '@/components/hud/MissionCard';
import HelpHint from '@/components/hud/HelpHint';

export default function MissionsQuests({ missions = [], profile, onAction }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Missions: Structured units of work driving real-world impact. Browse & Join: Find by Lane (Food Security, Regenerative Ag, etc.) or Region. Execute Tasks: Complete assigned tasks, submit Evidence (files, links, photos). Verification & Payout: Once Leader verifies evidence, GGG releases from escrow to your wallet. Mission Types: Platform, Circle, Region, Leader. Rewards: GGG, Rank Points, Boost multipliers." />
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
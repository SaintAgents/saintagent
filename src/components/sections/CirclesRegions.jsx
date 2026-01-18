import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Target } from "lucide-react";
import HelpHint from '@/components/hud/HelpHint';

export default function CirclesRegions() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Circles: Interest-based communities for connecting with like-minded agents around shared values, practices, or goals. Regions: Geographic nodes (city, bioregion, country) helping you find local events, needs, and collaborators. Leaders can create Circle or Region-specific missions. Join circles to find your tribe, explore regions to connect locally and access geographically relevant opportunities." />
      </div>
      <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => window.location.href = '/Circles'}>
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">Join a Circle</p>
          <p className="text-xs text-slate-500">Find your community</p>
        </div>
      </Button>
      <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => window.location.href = '/Circles'}>
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Target className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">Explore Your Region</p>
          <p className="text-xs text-slate-500">Local events & needs</p>
        </div>
      </Button>
    </div>
  );
}
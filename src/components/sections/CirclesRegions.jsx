import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Target } from "lucide-react";
import HelpHint from '@/components/hud/HelpHint';

export default function CirclesRegions() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Circles are interest-based communities you can join to connect with like-minded members. Regions help you find local events, needs, and collaborators in your geographic area. Join circles and explore your region to expand your network." />
      </div>
      <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">Join a Circle</p>
          <p className="text-xs text-slate-500">Find your community</p>
        </div>
      </Button>
      <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
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
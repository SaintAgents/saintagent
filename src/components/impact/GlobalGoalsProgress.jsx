import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Target, Users, Coins, Compass, Globe, Lightbulb } from 'lucide-react';

const GLOBAL_GOALS = [
  { id: 'missions', label: 'Active Missions Worldwide', icon: Target, target: 500, color: 'bg-violet-500' },
  { id: 'agents', label: 'Registered Agents', icon: Users, target: 1000, color: 'bg-blue-500' },
  { id: 'ggg', label: 'GGG Distributed', icon: Coins, target: 100000, color: 'bg-amber-500' },
  { id: 'quests', label: 'Quests Completed', icon: Compass, target: 5000, color: 'bg-emerald-500' },
  { id: 'regions', label: 'Regions Activated', icon: Globe, target: 50, color: 'bg-cyan-500' },
  { id: 'projects', label: 'Projects Launched', icon: Lightbulb, target: 200, color: 'bg-rose-500' },
];

export default function GlobalGoalsProgress({ platformStats, userContribution }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Global Platform Goals</h3>
      <p className="text-xs text-slate-400 mb-4">Your contribution toward the collective mission</p>
      <div className="space-y-4">
        {GLOBAL_GOALS.map(goal => {
          const current = platformStats[goal.id] || 0;
          const userPart = userContribution[goal.id] || 0;
          const pct = Math.min(100, Math.round((current / goal.target) * 100));
          const userPct = current > 0 ? Math.round((userPart / current) * 100) : 0;

          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <goal.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{goal.label}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {current.toLocaleString()} / {goal.target.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <Progress value={pct} className="h-2" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">{pct}% complete</span>
                {userPart > 0 && (
                  <span className="text-[10px] text-violet-500 font-medium">
                    Your share: {userPart.toLocaleString()} ({userPct}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
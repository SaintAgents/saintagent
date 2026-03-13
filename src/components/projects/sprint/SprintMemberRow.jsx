import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, TrendingUp, Activity } from 'lucide-react';

const burnoutColors = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function SprintMemberRow({ member }) {
  const maxH = 40;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
      <Avatar className="w-9 h-9">
        <AvatarImage src={member.avatarUrl} />
        <AvatarFallback className="text-xs bg-slate-100">{member.displayName?.[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{member.displayName}</span>
          <Badge className={`text-[9px] px-1.5 ${burnoutColors[member.burnoutRisk]}`}>
            {member.burnoutRisk === 'high' && <Flame className="w-2.5 h-2.5 mr-0.5" />}
            {member.burnoutRisk}
          </Badge>
        </div>

        {/* Weekly load bars */}
        <div className="flex items-center gap-1 mt-1.5">
          {member.weeklyHours.map((h, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all ${
                          h >= maxH ? 'bg-red-400' : h >= 35 ? 'bg-amber-400' : h >= 20 ? 'bg-violet-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min((h / maxH) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-[8px] text-slate-400 text-center mt-0.5">W{i + 1}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Week {i + 1}: {h.toFixed(1)}h / {maxH}h
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0 space-y-0.5">
        <div className="text-sm font-bold">{member.totalHours}h</div>
        <div className="text-[9px] text-slate-400">{member.taskCount} tasks</div>
        {member.velocity?.avgHoursPerWeek > 0 && (
          <div className="flex items-center gap-0.5 text-[9px] text-slate-400 justify-end">
            <Activity className="w-2.5 h-2.5" />
            {member.velocity.avgHoursPerWeek}h/wk
          </div>
        )}
      </div>
    </div>
  );
}
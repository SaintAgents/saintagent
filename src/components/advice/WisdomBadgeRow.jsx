import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { WISDOM_BADGES, computeEarnedBadges } from './wisdomBadges';

// Compact inline badge display for answer cards and leaderboard rows
export default function WisdomBadgeRow({ wisdomScore, maxShow = 4, size = 'sm' }) {
  const earnedIds = computeEarnedBadges(wisdomScore);
  if (earnedIds.length === 0) return null;

  const badges = earnedIds
    .map(id => WISDOM_BADGES[id])
    .filter(Boolean)
    .slice(0, maxShow);

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const containerSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div className={cn(
                  'rounded-full flex items-center justify-center shrink-0',
                  containerSize, badge.bg
                )}>
                  <Icon className={cn(iconSize, badge.color)} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{badge.label}</p>
                <p className="text-slate-500">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {earnedIds.length > maxShow && (
          <span className="text-[10px] text-slate-400 ml-0.5">+{earnedIds.length - maxShow}</span>
        )}
      </div>
    </TooltipProvider>
  );
}
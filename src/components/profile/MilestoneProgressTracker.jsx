import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { BADGE_SECTIONS, QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';

// Milestone tiers based on mission completions
const MILESTONE_TIERS = [
  { name: 'Newcomer', min: 0, max: 1, color: 'text-slate-500', ring: 'stroke-slate-300', fill: 'stroke-slate-400' },
  { name: 'Initiate', min: 1, max: 3, color: 'text-blue-500', ring: 'stroke-blue-200', fill: 'stroke-blue-500' },
  { name: 'Pathfinder', min: 3, max: 7, color: 'text-emerald-500', ring: 'stroke-emerald-200', fill: 'stroke-emerald-500' },
  { name: 'Wayfarer', min: 7, max: 15, color: 'text-violet-500', ring: 'stroke-violet-200', fill: 'stroke-violet-500' },
  { name: 'Veteran', min: 15, max: 25, color: 'text-amber-500', ring: 'stroke-amber-200', fill: 'stroke-amber-500' },
  { name: 'Legend', min: 25, max: 50, color: 'text-amber-600', ring: 'stroke-amber-300', fill: 'stroke-amber-600' },
];

function CircularProgress({ value, size = 100, strokeWidth = 8, tier }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className={tier.ring} strokeLinecap="round"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className={tier.fill} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-xl font-bold", tier.color)}>{Math.round(value)}%</span>
      </div>
    </div>
  );
}

// Get the next un-earned badge suggestion based on mission activity
function getNextBadgeSuggestion(earnedBadgeCodes, completedMissions) {
  const missionBadges = BADGE_SECTIONS.find(s => s.id === 'mission')?.items || [];
  const sigilBadges = BADGE_SECTIONS.find(s => s.id === 'sigils')?.items || [];
  const candidates = [...missionBadges, ...sigilBadges];

  for (const badge of candidates) {
    if (!earnedBadgeCodes.has(badge.code)) {
      return badge;
    }
  }
  return null;
}

export default function MilestoneProgressTracker({ profile }) {
  const userId = profile?.user_id;

  const { data: missions = [] } = useQuery({
    queryKey: ['milestoneMissions', userId],
    queryFn: () => base44.entities.Mission.filter({ participant_ids: { $contains: userId } }),
    enabled: !!userId,
    staleTime: 300000,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['milestoneBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile?.sa_number || userId, status: 'active' }),
    enabled: !!userId,
    staleTime: 300000,
  });

  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const activeMissions = missions.filter(m => m.status === 'active').length;

  const currentTier = useMemo(() => {
    for (let i = MILESTONE_TIERS.length - 1; i >= 0; i--) {
      if (completedMissions >= MILESTONE_TIERS[i].min) return { ...MILESTONE_TIERS[i], index: i };
    }
    return { ...MILESTONE_TIERS[0], index: 0 };
  }, [completedMissions]);

  const nextTier = MILESTONE_TIERS[currentTier.index + 1] || null;

  const progressToNext = nextTier
    ? ((completedMissions - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const earnedBadgeCodes = useMemo(() => {
    return new Set(badges.map(b => (b.badge_type || b.badge_code || '').toLowerCase()));
  }, [badges]);

  const nextBadge = useMemo(() => {
    return getNextBadgeSuggestion(earnedBadgeCodes, completedMissions);
  }, [earnedBadgeCodes, completedMissions]);

  const nextBadgeImage = nextBadge ? QUEST_BADGE_IMAGES[nextBadge.code] : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Mission Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Progress + Tier Info */}
        <div className="flex items-center gap-5">
          <CircularProgress value={progressToNext} size={96} strokeWidth={7} tier={currentTier} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", currentTier.color, "bg-opacity-10 border", currentTier.ring.replace('stroke-', 'border-'))}>
                {currentTier.name}
              </Badge>
              {nextTier && (
                <>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{nextTier.name}</span>
                </>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {completedMissions} mission{completedMissions !== 1 ? 's' : ''} completed
            </p>
            {nextTier ? (
              <p className="text-xs text-slate-500">
                {nextTier.min - completedMissions} more to reach {nextTier.name}
              </p>
            ) : (
              <p className="text-xs text-amber-600 font-medium">Max tier reached!</p>
            )}
            {activeMissions > 0 && (
              <p className="text-[10px] text-emerald-600 mt-0.5">{activeMissions} active now</p>
            )}
          </div>
        </div>

        {/* Next Badge Suggestion */}
        {nextBadge && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-100">
            {nextBadgeImage ? (
              <img src={nextBadgeImage} alt={nextBadge.label} className="w-10 h-10 object-contain shrink-0" data-no-filter="true" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800">Next: {nextBadge.label}</p>
              <p className="text-[10px] text-slate-500 line-clamp-2">{nextBadge.definition}</p>
            </div>
          </div>
        )}

        {/* Browse Missions CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={() => { window.location.href = createPageUrl('Missions'); }}
        >
          <Target className="w-3.5 h-3.5" />
          Browse Missions
        </Button>
      </CardContent>
    </Card>
  );
}
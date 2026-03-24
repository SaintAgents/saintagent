import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Award, Star, Heart, CheckCircle2, Sparkles, Brain, Shield, MessageSquare, ChevronUp, Target, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import WisdomBadgeRow from './WisdomBadgeRow';
import { POINTS_CONFIG } from './wisdomBadges';

const VERIFICATION_STYLES = {
  basic: null,
  verified: { label: 'Verified', icon: CheckCircle2, color: 'text-blue-500' },
  expert: { label: 'Expert', icon: Award, color: 'text-purple-500' },
  saint_contributor: { label: 'Saint', icon: Shield, color: 'text-amber-500' }
};

export default function WisdomLeaderboard({ limit = 10 }) {
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  const { data: wisdomScores = [] } = useQuery({
    queryKey: ['wisdomLeaderboard'],
    queryFn: () => base44.entities.WisdomScore.list('-wisdom_points', limit)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['leaderboardProfiles', wisdomScores.map(s => s.user_id)],
    queryFn: async () => {
      if (wisdomScores.length === 0) return [];
      const userIds = wisdomScores.map(s => s.user_id);
      const results = await Promise.all(
        userIds.map(id => base44.entities.UserProfile.filter({ user_id: id }))
      );
      return results.flat();
    },
    enabled: wisdomScores.length > 0
  });

  const getProfile = (userId) => profiles.find(p => p.user_id === userId);

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Trophy className="w-5 h-5 text-amber-500" />
            Wisdom Leaderboard
          </CardTitle>
          <button
            onClick={() => setShowPointsInfo(!showPointsInfo)}
            className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium"
          >
            {showPointsInfo ? 'Hide' : 'How points work'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Points Breakdown */}
        {showPointsInfo && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-2">
            <p className="text-xs font-semibold text-indigo-800 mb-2">Points System</p>
            <div className="space-y-1">
              {Object.values(POINTS_CONFIG).map(p => (
                <div key={p.label} className="flex items-center justify-between text-xs">
                  <span className="text-indigo-700">{p.label}</span>
                  <span className="font-semibold text-indigo-900">+{p.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {wisdomScores.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No contributors yet</p>
        ) : (
          wisdomScores.map((score, index) => {
            const profile = getProfile(score.user_id);
            const verification = VERIFICATION_STYLES[score.verification_level];
            
            return (
              <div 
                key={score.id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                data-user-id={score.user_id}
              >
                {/* Rank */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  index === 0 && "bg-amber-100 text-amber-700",
                  index === 1 && "bg-slate-200 text-slate-700",
                  index === 2 && "bg-orange-100 text-orange-700",
                  index > 2 && "bg-slate-100 text-slate-500"
                )}>
                  {index + 1}
                </div>
                
                {/* Avatar */}
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {profile?.display_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    {verification && (
                      <verification.icon className={cn("w-3.5 h-3.5 shrink-0", verification.color)} />
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-amber-600 font-bold text-xs">{score.wisdom_points || 0} pts</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Wisdom Points</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-slate-300">·</span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {score.answers_given || 0}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Answers given</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {score.accepted_answers || 0}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Accepted answers</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5" />
                            {score.helpful_count || 0}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Helpful votes</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Badges */}
                <WisdomBadgeRow wisdomScore={score} maxShow={3} size="sm" />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
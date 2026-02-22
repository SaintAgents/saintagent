import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Star, Heart, CheckCircle2, Sparkles, Brain, Shield, Search } from 'lucide-react';
import { cn } from "@/lib/utils";

const BADGE_ICONS = {
  insightful: { icon: Brain, color: 'text-indigo-500' },
  strategist: { icon: Target, color: 'text-blue-500' },
  healer: { icon: Heart, color: 'text-pink-500' },
  truth_seeker: { icon: Search, color: 'text-purple-500' },
  saint_contributor: { icon: Sparkles, color: 'text-amber-500' }
};

import { Target } from 'lucide-react';

const VERIFICATION_STYLES = {
  basic: null,
  verified: { label: 'Verified', icon: CheckCircle2, color: 'text-blue-500' },
  expert: { label: 'Expert', icon: Award, color: 'text-purple-500' },
  saint_contributor: { label: 'Saint', icon: Shield, color: 'text-amber-500' }
};

export default function WisdomLeaderboard({ limit = 10 }) {
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Wisdom Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {wisdomScores.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No contributors yet</p>
        ) : (
          wisdomScores.map((score, index) => {
            const profile = getProfile(score.user_id);
            const verification = VERIFICATION_STYLES[score.verification_level];
            
            return (
              <div 
                key={score.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                data-user-id={score.user_id}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  index === 0 && "bg-amber-100 text-amber-700",
                  index === 1 && "bg-slate-200 text-slate-700",
                  index === 2 && "bg-orange-100 text-orange-700",
                  index > 2 && "bg-slate-100 text-slate-500"
                )}>
                  {index + 1}
                </div>
                
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {profile?.display_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    {verification && (
                      <verification.icon className={cn("w-4 h-4", verification.color)} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-600 font-semibold">
                      {score.wisdom_points || 0} pts
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {score.accepted_answers || 0} accepted
                    </span>
                  </div>
                </div>

                {/* Badges */}
                {score.badges?.length > 0 && (
                  <div className="flex gap-1">
                    {score.badges.slice(0, 3).map(badge => {
                      const badgeConfig = BADGE_ICONS[badge];
                      if (!badgeConfig) return null;
                      return (
                        <badgeConfig.icon 
                          key={badge} 
                          className={cn("w-4 h-4", badgeConfig.color)} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
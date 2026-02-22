import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronRight, Star, Target, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';

export default function RecommendedMissions({ missions = [], onAction, className }) {
  // Fetch current user profile for recommendation matching
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });
  const profile = profiles?.[0];

  // Fetch user's past mission participation
  const { data: pastParticipation = [] } = useQuery({
    queryKey: ['userMissionParticipation', currentUser?.email],
    queryFn: async () => {
      // Get missions where user is a participant
      const allMissions = await base44.entities.Mission.list('-created_date', 200);
      return allMissions.filter(m => 
        m.participant_ids?.includes(currentUser.email) || 
        m.participant_ids?.includes(profile?.sa_number)
      );
    },
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate recommended missions based on user profile and history
  const recommendedMissions = useMemo(() => {
    if (!profile || missions.length === 0) return [];

    const userSkills = profile.skills || [];
    const userIntentions = profile.intentions || [];
    const userValues = profile.values_tags || [];
    const userPractices = profile.spiritual_practices || [];
    
    // Get mission types user has participated in before
    const participatedTypes = new Set(pastParticipation.map(m => m.mission_type));
    const participatedCreators = new Set(pastParticipation.map(m => m.creator_id));

    // Score each active mission
    const scoredMissions = missions
      .filter(m => m.status === 'active')
      .filter(m => !m.participant_ids?.includes(currentUser?.email) && 
                   !m.participant_ids?.includes(profile?.sa_number))
      .map(mission => {
        let score = 0;
        const reasons = [];

        // 1. Skills match (roles_needed)
        const rolesNeeded = mission.roles_needed || [];
        const skillMatches = rolesNeeded.filter(role => 
          userSkills.some(skill => 
            skill.toLowerCase().includes(role.toLowerCase()) ||
            role.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (skillMatches.length > 0) {
          score += skillMatches.length * 25;
          reasons.push(`Skills match: ${skillMatches.join(', ')}`);
        }

        // 2. Mission type preference (based on past participation)
        if (participatedTypes.has(mission.mission_type)) {
          score += 20;
          reasons.push(`You've enjoyed ${mission.mission_type} missions`);
        }

        // 3. Creator familiarity
        if (participatedCreators.has(mission.creator_id)) {
          score += 15;
          reasons.push(`From a creator you've worked with`);
        }

        // 4. High rewards
        if ((mission.reward_ggg || 0) >= 10) {
          score += 15;
          reasons.push('High GGG reward');
        }
        if ((mission.reward_rank_points || 0) >= 10) {
          score += 10;
          reasons.push('Good RP reward');
        }

        // 5. Ending soon (urgency)
        if (mission.end_time) {
          const daysLeft = (new Date(mission.end_time) - new Date()) / (1000 * 60 * 60 * 24);
          if (daysLeft > 0 && daysLeft <= 7) {
            score += 20;
            reasons.push('Ending soon!');
          }
        }

        // 6. Low participant count (easier to stand out)
        if ((mission.participant_count || 0) < 5) {
          score += 10;
          reasons.push('Early participant bonus');
        }

        // 7. Intentions/values alignment (from description/objective)
        const missionText = `${mission.title} ${mission.objective} ${mission.description}`.toLowerCase();
        const intentionMatches = userIntentions.filter(intent => 
          missionText.includes(intent.toLowerCase().replace(/_/g, ' '))
        );
        if (intentionMatches.length > 0) {
          score += intentionMatches.length * 15;
          reasons.push('Aligns with your intentions');
        }

        // 8. Platform missions get a small boost (usually well-organized)
        if (mission.mission_type === 'platform') {
          score += 5;
        }

        return { ...mission, recommendationScore: score, recommendationReasons: reasons };
      })
      .filter(m => m.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);

    return scoredMissions;
  }, [missions, profile, currentUser, pastParticipation]);

  if (recommendedMissions.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Recommended For You
              <Badge className="bg-amber-100 text-amber-700 text-xs">AI Matched</Badge>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Based on your skills, interests & activity
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 pt-4">
          {recommendedMissions.map((mission) => (
            <div key={mission.id} className="w-[260px] flex-shrink-0">
              <div 
                className="relative p-4 pt-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer h-[180px] flex flex-col"
                onClick={() => window.location.href = createPageUrl('MissionDetail') + '?id=' + mission.id}
              >
                {/* Recommendation badge - positioned inside card */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium shadow-lg">
                    <Star className="w-3 h-3" />
                    {Math.round(mission.recommendationScore)}% match
                  </div>
                </div>
                
                {/* Mission content */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 shrink-0">
                    <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 line-clamp-1 mb-1">
                      {mission.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                      {mission.objective || mission.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{mission.participant_count || 0}/{mission.max_participants || '∞'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                
                {/* Recommendation reasons */}
                {mission.recommendationReasons?.length > 0 && (
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1">
                    {mission.recommendationReasons.slice(0, 2).map((reason, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-[10px] bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
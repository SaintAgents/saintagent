import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, Star, Target, Calendar, Users, Flame, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RANK_STYLES = {
  1: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', text: 'text-amber-700', icon: Crown },
  2: { bg: 'bg-gradient-to-r from-slate-100 to-gray-100', text: 'text-slate-600', icon: Medal },
  3: { bg: 'bg-gradient-to-r from-orange-100 to-amber-100', text: 'text-orange-700', icon: Medal }
};

function MiniRow({ idx, profile, valueLabel, metric }) {
  const rank = idx + 1;
  const rankStyle = RANK_STYLES[rank];
  const isTopThree = rank <= 3;
  
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-lg transition-all",
      isTopThree ? rankStyle?.bg : "hover:bg-slate-50"
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          isTopThree ? `${rankStyle?.text}` : "bg-slate-100 text-slate-500"
        )}>
          {isTopThree ? <rankStyle.icon className="w-3 h-3" /> : rank}
        </div>
        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
              {(profile?.display_name || 'U').slice(0,1)}
            </div>
          )}
        </div>
        <span className={cn("text-xs font-medium truncate max-w-[100px]", isTopThree ? rankStyle?.text : "text-slate-900")}>
          {profile?.display_name || 'User'}
        </span>
      </div>
      <span className={cn(
        "text-xs font-bold",
        metric === 'ggg' ? "text-amber-600" :
        metric === 'trust' ? "text-emerald-600" :
        metric === 'points' ? "text-violet-600" :
        "text-blue-600"
      )}>
        {valueLabel}
      </span>
    </div>
  );
}

export default function LeaderboardMiniCard() {
  // Fetch leaderboard data
  const { data: profiles = [] } = useQuery({
    queryKey: ['leaderboardProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-rank_points', 50),
    staleTime: 60000
  });
  
  const { data: missions = [] } = useQuery({
    queryKey: ['leaderboardMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
    staleTime: 60000
  });
  
  const { data: meetings = [] } = useQuery({
    queryKey: ['leaderboardMeetings'],
    queryFn: () => base44.entities.Meeting.filter({ status: 'completed' }, '-created_date', 100),
    staleTime: 60000
  });

  const missionCounts = React.useMemo(() => {
    const counts = {};
    (missions || []).forEach(m => {
      (m.participant_ids || []).forEach(uid => {
        counts[uid] = (counts[uid] || 0) + 1;
      });
    });
    return counts;
  }, [missions]);

  const meetingCounts = React.useMemo(() => {
    const counts = {};
    (meetings || []).forEach(m => {
      if (m.host_id) counts[m.host_id] = (counts[m.host_id] || 0) + 1;
      if (m.guest_id) counts[m.guest_id] = (counts[m.guest_id] || 0) + 1;
    });
    return counts;
  }, [meetings]);

  const topGGG = [...profiles].sort((a,b) => (b?.ggg_balance || 0) - (a?.ggg_balance || 0)).slice(0, 5);
  const topPoints = [...profiles].sort((a,b) => (b?.engagement_points || 0) - (a?.engagement_points || 0)).slice(0, 5);
  const topTrust = [...profiles].sort((a,b) => (b?.trust_score || 0) - (a?.trust_score || 0)).slice(0, 5);
  const topMissions = [...profiles].map(p => ({ ...p, count: missionCounts[p.user_id] || 0 })).sort((a,b) => b.count - a.count).slice(0, 5);
  const topMeetings = [...profiles].map(p => ({ ...p, count: meetingCounts[p.user_id] || 0 })).sort((a,b) => b.count - a.count).slice(0, 5);
  const topConnections = [...profiles].sort((a,b) => ((b?.follower_count || 0) + (b?.following_count || 0)) - ((a?.follower_count || 0) + (a?.following_count || 0))).slice(0, 5);

  return (
    <div className="space-y-3">
      <TooltipProvider delayDuration={200}>
      <Tabs defaultValue="ggg" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="ggg" className="text-xs p-1">
                <Coins className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>GGG Balance</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="points" className="text-xs p-1">
                <Flame className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Engagement Points</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="trust" className="text-xs p-1">
                <Star className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Trust Score</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="missions" className="text-xs p-1">
                <Target className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Missions Completed</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="meetings" className="text-xs p-1">
                <Calendar className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Meetings Attended</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="connections" className="text-xs p-1">
                <Users className="w-3 h-3" />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Connections</p></TooltipContent>
          </Tooltip>
        </TabsList>

        <TabsContent value="ggg" className="space-y-1">
          {topGGG.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${(p.ggg_balance || 0).toLocaleString()}`} metric="ggg" />)}
        </TabsContent>

        <TabsContent value="points" className="space-y-1">
          {topPoints.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${(p.engagement_points || 0).toLocaleString()}`} metric="points" />)}
        </TabsContent>

        <TabsContent value="trust" className="space-y-1">
          {topTrust.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${p.trust_score || 0}`} metric="trust" />)}
        </TabsContent>

        <TabsContent value="missions" className="space-y-1">
          {topMissions.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${p.count}`} metric="missions" />)}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-1">
          {topMeetings.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${p.count}`} metric="meetings" />)}
        </TabsContent>

        <TabsContent value="connections" className="space-y-1">
          {topConnections.map((p, i) => <MiniRow key={p.id} idx={i} profile={p} valueLabel={`${(p.follower_count || 0) + (p.following_count || 0)}`} metric="connections" />)}
        </TabsContent>
      </Tabs>
      </TooltipProvider>

      <Button variant="outline" className="w-full rounded-xl text-xs" onClick={() => window.location.href = createPageUrl('Leaderboards')}>
        <Trophy className="w-3 h-3 mr-1" />
        View Full Leaderboards
      </Button>
    </div>
  );
}
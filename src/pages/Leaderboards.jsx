import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, BadgePercent, Users, Medal, Crown, Coins, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import BackButton from '@/components/hud/BackButton';
import RankedAvatar from '@/components/reputation/RankedAvatar';

const RANK_STYLES = {
  1: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', border: 'border-amber-300', text: 'text-amber-700', icon: Crown },
  2: { bg: 'bg-gradient-to-r from-slate-100 to-gray-100', border: 'border-slate-300', text: 'text-slate-600', icon: Medal },
  3: { bg: 'bg-gradient-to-r from-orange-100 to-amber-100', border: 'border-orange-300', text: 'text-orange-700', icon: Medal }
};

function Row({ idx, profile, valueLabel, metric }) {
  const rank = idx + 1;
  const rankStyle = RANK_STYLES[rank];
  const isTopThree = rank <= 3;
  
  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 rounded-xl transition-all",
      isTopThree ? rankStyle?.bg : "hover:bg-slate-50",
      isTopThree && `border ${rankStyle?.border}`
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
          isTopThree ? `${rankStyle?.bg} ${rankStyle?.text}` : "bg-slate-100 text-slate-500"
        )}>
          {isTopThree ? <rankStyle.icon className="w-4 h-4" /> : rank}
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
              {(profile?.display_name || 'U').slice(0,1)}
            </div>
          )}
        </div>
        <div>
          <div className={cn("text-sm font-semibold", isTopThree ? rankStyle?.text : "text-slate-900")}>
            {profile?.display_name || profile?.handle || 'User'}
          </div>
          <div className="text-xs text-slate-500">@{profile?.handle}</div>
        </div>
      </div>
      <div className={cn(
        "text-sm font-bold",
        metric === 'ggg' ? "text-amber-600" :
        metric === 'trust' ? "text-emerald-600" :
        metric === 'points' ? "text-violet-600" :
        "text-blue-600"
      )}>
        {valueLabel}
      </div>
    </div>
  );
}

export default function Leaderboards() {
  const { data: profiles = [] } = useQuery({
    queryKey: ['leaderboard_profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['leaderboard_missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 200),
  });

  const topBy = (key, labelFormatter = (v)=>String(v)) => {
    const sorted = [...(profiles || [])]
      .sort((a,b) => (b?.[key] || 0) - (a?.[key] || 0))
      .slice(0, 20);
    return (
      <div className="space-y-1">
        {sorted.map((p, i) => (
          <Row key={p.id} idx={i} profile={p} valueLabel={labelFormatter(p?.[key] || 0)} />
        ))}
      </div>
    );
  };

  const missionCounts = React.useMemo(() => {
    const counts = {};
    (missions || []).forEach(m => {
      if (m.status !== 'completed') return;
      (m.participant_ids || []).forEach(uid => {
        counts[uid] = (counts[uid] || 0) + 1;
      });
    });
    return counts;
  }, [missions]);

  const topMissions = () => {
    const enriched = (profiles || []).map(p => ({
      profile: p,
      count: missionCounts[p.user_id] || 0,
    })).sort((a,b) => b.count - a.count).slice(0, 20);

    return (
      <div className="space-y-1">
        {enriched.map((it, i) => (
          <Row key={it.profile.id} idx={i} profile={it.profile} valueLabel={`${it.count} missions`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Leaderboards
          </h1>
          <p className="text-slate-600 mt-1">See who’s leading across the network.</p>
        </div>
        <Tabs defaultValue="ggg" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="ggg">GGG</TabsTrigger>
            <TabsTrigger value="trust">Trust</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
          </TabsList>
          <TabsContent value="ggg">
            <Card className="p-3 mt-3">
              {topBy('ggg_balance', (v)=>`${v.toLocaleString?.() || v} GGG`)}
            </Card>
          </TabsContent>
          <TabsContent value="trust">
            <Card className="p-3 mt-3">
              {topBy('trust_score', (v)=>`${v}`)}
            </Card>
          </TabsContent>
          <TabsContent value="points">
            <Card className="p-3 mt-3">
              {topBy('engagement_points', (v)=>`${v} pts`)}
            </Card>
          </TabsContent>
          <TabsContent value="missions">
            <Card className="p-3 mt-3">
              {topMissions()}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
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
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

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

  const { data: meetings = [] } = useQuery({
    queryKey: ['leaderboard_meetings'],
    queryFn: () => base44.entities.Meeting.filter({ status: 'completed' }, '-created_date', 500),
  });

  const topBy = (key, labelFormatter = (v)=>String(v), metric = 'default') => {
    const sorted = [...(profiles || [])]
      .sort((a,b) => (b?.[key] || 0) - (a?.[key] || 0))
      .slice(0, 20);
    return (
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <Row key={p.id} idx={i} profile={p} valueLabel={labelFormatter(p?.[key] || 0)} metric={metric} />
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

  const meetingCounts = React.useMemo(() => {
    const counts = {};
    (meetings || []).forEach(m => {
      if (m.host_id) counts[m.host_id] = (counts[m.host_id] || 0) + 1;
      if (m.guest_id) counts[m.guest_id] = (counts[m.guest_id] || 0) + 1;
    });
    return counts;
  }, [meetings]);

  const topMissions = () => {
    const enriched = (profiles || []).map(p => ({
      profile: p,
      count: missionCounts[p.user_id] || 0,
    })).sort((a,b) => b.count - a.count).slice(0, 20);

    return (
      <div className="space-y-2">
        {enriched.map((it, i) => (
          <Row key={it.profile.id} idx={i} profile={it.profile} valueLabel={`${it.count} missions`} metric="missions" />
        ))}
      </div>
    );
  };

  const topMeetings = () => {
    const enriched = (profiles || []).map(p => ({
      profile: p,
      count: meetingCounts[p.user_id] || 0,
    })).sort((a,b) => b.count - a.count).slice(0, 20);

    return (
      <div className="space-y-2">
        {enriched.map((it, i) => (
          <Row key={it.profile.id} idx={i} profile={it.profile} valueLabel={`${it.count} meetings`} metric="meetings" />
        ))}
      </div>
    );
  };

  const topConnections = () => {
    const sorted = [...(profiles || [])]
      .sort((a,b) => ((b?.follower_count || 0) + (b?.following_count || 0)) - ((a?.follower_count || 0) + (a?.following_count || 0)))
      .slice(0, 20);

    return (
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <Row key={p.id} idx={i} profile={p} valueLabel={`${(p?.follower_count || 0) + (p?.following_count || 0)} connections`} metric="connections" />
        ))}
      </div>
    );
  };

  // Calculate stats
  const totalGGG = profiles.reduce((sum, p) => sum + (p.ggg_balance || 0), 0);
  const totalMeetings = Object.values(meetingCounts).reduce((a, b) => a + b, 0) / 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-[#050505] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BackButton />
            <Trophy className="w-8 h-8 text-amber-500" />
            Leaderboards
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">See who's leading across the network.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600">Total GGG</p>
                <p className="text-lg font-bold text-amber-900">{totalGGG.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600">Members</p>
                <p className="text-lg font-bold text-emerald-900">{profiles.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-600">Missions</p>
                <p className="text-lg font-bold text-violet-900">{missions.filter(m => m.status === 'completed').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600">Meetings</p>
                <p className="text-lg font-bold text-blue-900">{Math.round(totalMeetings)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="ggg" className="w-full">
          <TabsList className="grid grid-cols-6 w-full mb-4">
            <TabsTrigger value="ggg" className="gap-1">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">GGG</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Points</span>
            </TabsTrigger>
            <TabsTrigger value="trust" className="gap-1">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Trust</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Missions</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Meetings</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ggg">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Top GGG Earners</h3>
              </div>
              {topBy('ggg_balance', (v)=>`${v.toLocaleString?.() || v} GGG`, 'ggg')}
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-slate-900">Most Engaged</h3>
              </div>
              {topBy('engagement_points', (v)=>`${v.toLocaleString()} pts`, 'points')}
            </Card>
          </TabsContent>

          <TabsContent value="trust">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-900">Most Trusted</h3>
              </div>
              {topBy('trust_score', (v)=>`${v} trust`, 'trust')}
            </Card>
          </TabsContent>

          <TabsContent value="missions">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-900">Mission Leaders</h3>
              </div>
              {topMissions()}
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-slate-900">Most Meetings</h3>
              </div>
              {topMeetings()}
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold text-slate-900">Best Connected</h3>
              </div>
              {topConnections()}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
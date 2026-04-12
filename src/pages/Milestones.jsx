import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Shield, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRPRank } from '@/components/reputation/rpUtils';
import RankProgressBar from '@/components/milestones/RankProgressBar';
import RankUnlockPopup from '@/components/milestones/RankUnlockPopup';
import BadgeShowcase from '@/components/milestones/BadgeShowcase';
import GGGEarningsTimeline from '@/components/milestones/GGGEarningsTimeline';
import AchievementsList from '@/components/milestones/AchievementsList';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

export default function Milestones() {
  const [selectedRank, setSelectedRank] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1),
    enabled: !!currentUser?.email,
  });
  const profile = profiles?.[0];

  const { data: badges = [] } = useQuery({
    queryKey: ['myBadges', currentUser?.email],
    queryFn: () => base44.entities.Badge.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['myGGGTransactions', currentUser?.email],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: currentUser.email }, '-created_date', 200),
    enabled: !!currentUser?.email,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['myPostCount', currentUser?.email],
    queryFn: () => base44.entities.Post.filter({ author_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['myMeetingCount', currentUser?.email],
    queryFn: () => base44.entities.Meeting.filter({ requester_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: missionParticipation = [] } = useQuery({
    queryKey: ['myMissionCount', currentUser?.email],
    queryFn: async () => {
      const all = await base44.entities.Mission.list('-created_date', 200);
      return all.filter(m => m.participant_ids?.includes(currentUser.email) || m.creator_id === currentUser.email);
    },
    enabled: !!currentUser?.email,
  });

  const currentRP = profile?.rank_points || 0;
  const rankInfo = getRPRank(currentRP);
  const gggEarned = transactions.filter(t => t.delta > 0).reduce((s, t) => s + t.delta, 0);
  const gggBalance = gggEarned - transactions.filter(t => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 px-6 py-10 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-5 right-32 w-40 h-40 rounded-full bg-amber-300/20 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg" />
            <Trophy className="w-8 h-8 text-amber-300" />
            <h1 className="text-2xl md:text-3xl font-bold">Milestones</h1>
            <ForwardButton currentPage="Milestones" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg" />
          </div>
          <p className="text-white/70 text-sm ml-11">Track your journey from Seeker to Guardian</p>
          <div className="flex items-center gap-4 mt-4 ml-11">
            <Badge className="bg-white/20 text-white border-white/30 gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {rankInfo.title}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {currentRP.toLocaleString()} RP
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {badges.length} Badges
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-4 pb-20 relative z-10 space-y-6">
        {/* Rank Progression */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-violet-500" />
              Rank Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RankProgressBar currentRP={currentRP} onRankClick={setSelectedRank} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* GGG Earnings */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-amber-500" />
                GGG Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GGGEarningsTimeline transactions={transactions} />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-5 h-5 text-emerald-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementsList
                profile={profile}
                postCount={posts.length}
                missionCount={missionParticipation.length}
                meetingCount={meetings.length}
                gggBalance={gggBalance}
              />
            </CardContent>
          </Card>
        </div>

        {/* Badge Showcase */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-amber-500" />
              Badge Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeShowcase earnedBadges={badges} />
          </CardContent>
        </Card>
      </div>

      {/* Rank Unlock Popup */}
      <RankUnlockPopup
        rank={selectedRank}
        currentRP={currentRP}
        open={!!selectedRank}
        onClose={() => setSelectedRank(null)}
      />
    </div>
  );
}
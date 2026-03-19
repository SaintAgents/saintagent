import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ExternalLink, Coins, Target, Compass, Award, MessageSquare, Users } from 'lucide-react';

import ImpactStatCard from '@/components/impact/ImpactStatCard';
import ContributionTimeline from '@/components/impact/ContributionTimeline';
import GlobalGoalsProgress from '@/components/impact/GlobalGoalsProgress';
import ImpactBreakdownChart from '@/components/impact/ImpactBreakdownChart';
import GGGEarningsChart from '@/components/impact/GGGEarningsChart';

export default function ImpactDashboardTab({ currentUser, profile }) {
  const email = currentUser?.email;

  const { data: gggTransactions = [] } = useQuery({
    queryKey: ['impactGGG', email],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: email }, '-created_date', 500),
    enabled: !!email,
  });

  const { data: allMissions = [] } = useQuery({
    queryKey: ['impactMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 500),
    enabled: !!email,
  });
  const userMissions = allMissions.filter(m => (m.participant_ids || []).includes(email) || m.creator_id === email);
  const completedMissions = userMissions.filter(m => m.status === 'completed');

  const { data: allQuests = [] } = useQuery({
    queryKey: ['impactQuests', email],
    queryFn: () => base44.entities.Quest.filter({ user_id: email }),
    enabled: !!email,
  });
  const completedQuests = allQuests.filter(q => q.status === 'completed');

  const { data: userPosts = [] } = useQuery({
    queryKey: ['impactPosts', email],
    queryFn: () => base44.entities.Post.filter({ author_id: email }),
    enabled: !!email,
  });

  const { data: userMeetings = [] } = useQuery({
    queryKey: ['impactMeetings', email],
    queryFn: () => base44.entities.Meeting.filter({ host_id: email }),
    enabled: !!email,
  });

  const { data: userReferrals = [] } = useQuery({
    queryKey: ['impactReferrals', email],
    queryFn: () => base44.entities.Referral.filter({ affiliate_user_id: email }),
    enabled: !!email,
  });

  const { data: userReviews = [] } = useQuery({
    queryKey: ['impactReviews', email],
    queryFn: () => base44.entities.Review.filter({ reviewer_id: email }),
    enabled: !!email,
  });

  const totalGGGEarned = gggTransactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const rankPoints = profile?.rank_points || profile?.rp_points || 0;

  const breakdownCounts = {
    missions: userMissions.length,
    quests: completedQuests.length,
    meetings: userMeetings.length,
    posts: userPosts.length,
    referrals: userReferrals.length,
    reviews: userReviews.length,
  };

  const { data: allRegions = [] } = useQuery({
    queryKey: ['impactRegions'],
    queryFn: () => base44.entities.Region.list(),
    enabled: !!email,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['impactProjects'],
    queryFn: () => base44.entities.Project.list('-created_date', 1),
    enabled: !!email,
  });

  const platformStats = {
    missions: allMissions.filter(m => m.status === 'active').length,
    agents: 0,
    ggg: totalGGGEarned,
    quests: allQuests.length,
    regions: allRegions.length,
    projects: allProjects.length || 0,
  };

  const userContribution = {
    missions: userMissions.length,
    agents: 1,
    ggg: Math.round(totalGGGEarned * 100) / 100,
    quests: completedQuests.length,
    regions: profile?.region ? 1 : 0,
    projects: allProjects.filter(p => p.owner_id === email).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with link to full page */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Impact Dashboard</h2>
          <p className="text-sm text-slate-500">Your contributions and progress over time</p>
        </div>
        <Link to="/ImpactDashboard">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <ExternalLink className="w-4 h-4" />
            Full View
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ImpactStatCard icon={Coins} label="GGG Earned" value={totalGGGEarned.toFixed(2)} color="amber" />
        <ImpactStatCard icon={Target} label="Missions" value={userMissions.length} subtitle={`${completedMissions.length} completed`} color="violet" />
        <ImpactStatCard icon={Compass} label="Quests" value={allQuests.length} subtitle={`${completedQuests.length} completed`} color="emerald" />
        <ImpactStatCard icon={Award} label="Rank Points" value={rankPoints.toLocaleString()} color="blue" />
        <ImpactStatCard icon={MessageSquare} label="Posts" value={userPosts.length} color="cyan" />
        <ImpactStatCard icon={Users} label="Referrals" value={userReferrals.length} color="rose" />
      </div>

      {/* Timeline Chart */}
      <ContributionTimeline gggData={gggTransactions} missionData={userMissions} questData={completedQuests} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ImpactBreakdownChart counts={breakdownCounts} />
        <GGGEarningsChart transactions={gggTransactions} />
      </div>

      {/* Global Goals */}
      <GlobalGoalsProgress platformStats={platformStats} userContribution={userContribution} />
    </div>
  );
}
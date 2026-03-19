import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import {
  Target, Compass, Coins, Users, MessageSquare, Star, Award, TrendingUp, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

import ImpactStatCard from '@/components/impact/ImpactStatCard';
import ContributionTimeline from '@/components/impact/ContributionTimeline';
import GlobalGoalsProgress from '@/components/impact/GlobalGoalsProgress';
import ImpactBreakdownChart from '@/components/impact/ImpactBreakdownChart';
import GGGEarningsChart from '@/components/impact/GGGEarningsChart';

export default function ImpactDashboard() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const email = currentUser?.email;

  // Fetch user profile
  const { data: profiles = [] } = useQuery({
    queryKey: ['impactProfile', email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: email }),
    enabled: !!email,
  });
  const profile = profiles[0];

  // Fetch user's GGG transactions
  const { data: gggTransactions = [] } = useQuery({
    queryKey: ['impactGGG', email],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: email }, '-created_date', 500),
    enabled: !!email,
  });

  // Fetch missions where user is participant
  const { data: allMissions = [] } = useQuery({
    queryKey: ['impactMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 500),
    enabled: !!email,
  });
  const userMissions = allMissions.filter(m => (m.participant_ids || []).includes(email) || m.creator_id === email);
  const completedMissions = userMissions.filter(m => m.status === 'completed');

  // Fetch user's quests
  const { data: allQuests = [] } = useQuery({
    queryKey: ['impactQuests', email],
    queryFn: () => base44.entities.Quest.filter({ user_id: email }),
    enabled: !!email,
  });
  const completedQuests = allQuests.filter(q => q.status === 'completed');

  // Fetch user's posts, meetings, referrals, reviews for breakdown
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

  // Platform-wide stats for global goals
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['impactAllProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
    enabled: !!email,
  });

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

  // Calculate totals
  const totalGGGEarned = gggTransactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const totalGGGSpent = gggTransactions.filter(t => t.delta < 0).reduce((sum, t) => sum + Math.abs(t.delta), 0);
  const rankPoints = profile?.rank_points || profile?.rp_points || 0;

  // Month-over-month trend for GGG
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const gggThisMonth = gggTransactions.filter(t => t.delta > 0 && t.created_date?.startsWith(thisMonthKey)).reduce((s, t) => s + t.delta, 0);
  const gggLastMonth = gggTransactions.filter(t => t.delta > 0 && t.created_date?.startsWith(lastMonthKey)).reduce((s, t) => s + t.delta, 0);
  const gggTrend = gggLastMonth > 0 ? Math.round(((gggThisMonth - gggLastMonth) / gggLastMonth) * 100) : gggThisMonth > 0 ? 100 : 0;

  // Platform stats for global goals
  const platformStats = {
    missions: allMissions.filter(m => m.status === 'active').length,
    agents: allProfiles.length || 0,
    ggg: totalGGGEarned, // simplified — ideally sum all users
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

  const breakdownCounts = {
    missions: userMissions.length,
    quests: completedQuests.length,
    meetings: userMeetings.length,
    posts: userPosts.length,
    referrals: userReferrals.length,
    reviews: userReviews.length,
  };

  const isLoading = !currentUser;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Header */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-8 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/CommandDeck">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <TrendingUp className="w-8 h-8 text-white drop-shadow-lg" />
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Impact Dashboard
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl drop-shadow">
            Your contributions, progress, and impact on the global mission
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-sm px-3 py-1 bg-white/20 border-white/40 text-white backdrop-blur-sm">
              {profile?.display_name || currentUser?.full_name || 'Agent'}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-amber-400/20 border-amber-300/40 text-amber-100 backdrop-blur-sm capitalize">
              {profile?.rp_rank_code || profile?.rank_code || 'seeker'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 -mt-6 relative z-10">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <ImpactStatCard icon={Coins} label="GGG Earned" value={totalGGGEarned.toFixed(2)} color="amber" trend={gggTrend} />
          <ImpactStatCard icon={Target} label="Missions" value={userMissions.length} subtitle={`${completedMissions.length} completed`} color="violet" />
          <ImpactStatCard icon={Compass} label="Quests" value={allQuests.length} subtitle={`${completedQuests.length} completed`} color="emerald" />
          <ImpactStatCard icon={Award} label="Rank Points" value={rankPoints.toLocaleString()} color="blue" />
          <ImpactStatCard icon={MessageSquare} label="Posts" value={userPosts.length} color="cyan" />
          <ImpactStatCard icon={Users} label="Referrals" value={userReferrals.length} subtitle={`${userReferrals.filter(r => r.status === 'activated').length} activated`} color="rose" />
        </div>

        {/* Charts Row 1: Timeline + GGG Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <ContributionTimeline gggData={gggTransactions} missionData={userMissions} questData={completedQuests} />
          </div>
          <GGGEarningsChart transactions={gggTransactions} />
        </div>

        {/* Charts Row 2: Breakdown Bar + Global Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ImpactBreakdownChart counts={breakdownCounts} />
          <GlobalGoalsProgress platformStats={platformStats} userContribution={userContribution} />
        </div>
      </div>
    </div>
  );
}
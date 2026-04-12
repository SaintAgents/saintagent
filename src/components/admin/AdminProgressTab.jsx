import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, Target, TrendingUp, ArrowUpDown, ExternalLink, Users, Trophy, Shield, Zap } from 'lucide-react';
import { computeLikelihoodOfPerformance, getLopTier } from '@/components/merit/MeritScoreUtils';

function TierSummaryCard({ label, count, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{count}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <span className="text-xs text-slate-400">{pct}%</span>
    </div>
  );
}

export default function AdminProgressTab() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score_desc');

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-progress-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allMissions = [] } = useQuery({
    queryKey: ['admin-progress-missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allMeetings = [] } = useQuery({
    queryKey: ['admin-progress-meetings'],
    queryFn: () => base44.entities.Meeting.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['admin-progress-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allTestimonials = [] } = useQuery({
    queryKey: ['admin-progress-testimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allQuests = [] } = useQuery({
    queryKey: ['admin-progress-quests'],
    queryFn: () => base44.entities.Quest.filter({ status: 'completed' }, '-created_date', 500),
    staleTime: 120000,
  });

  // Compute LoP for each user
  const userScores = useMemo(() => {
    if (!profiles.length) return [];

    return profiles.map(profile => {
      const userId = profile.user_id;

      const userMissions = allMissions.filter(m => m.participant_ids?.includes(userId));
      const completedMissions = userMissions.filter(m => m.status === 'completed').length;

      const userQuests = allQuests.filter(q => q.user_id === userId);

      const userMeetings = allMeetings.filter(m => m.host_id === userId || m.guest_id === userId);
      const completedMeetings = userMeetings.filter(m => m.status === 'completed').length;
      const noShowMeetings = userMeetings.filter(m => m.status === 'no_show').length;
      const cancelledMeetings = userMeetings.filter(m => m.status === 'cancelled').length;

      const userBookings = allBookings.filter(b => b.buyer_id === userId || b.seller_id === userId);
      const completedBookings = userBookings.filter(b => b.status === 'completed').length;

      const userTestimonials = allTestimonials.filter(t => t.to_user_id === userId);
      const avgRating = userTestimonials.length > 0
        ? userTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / userTestimonials.length
        : 0;

      const createdDate = profile.created_date ? new Date(profile.created_date) : new Date();
      const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      const lopResult = computeLikelihoodOfPerformance({
        missionsCompleted: completedMissions,
        questsCompleted: userQuests.length,
        meetingsCompleted: completedMeetings,
        bookingsCompleted: completedBookings,
        testimonialsReceived: userTestimonials.length,
        testimonialsAvgRating: avgRating,
        noShowCount: noShowMeetings,
        cancelledCount: cancelledMeetings,
        rpPoints: profile.rp_points || profile.rank_points || 0,
        gggEarned: profile.ggg_balance || 0,
        accountAgeDays,
        dailyLoginStreak: profile.daily_login_streak || 0,
      });

      return {
        profile,
        ...lopResult,
        missionsCompleted: completedMissions,
        meetingsCompleted: completedMeetings,
        questsCompleted: userQuests.length,
        testimonialsCount: userTestimonials.length,
      };
    });
  }, [profiles, allMissions, allMeetings, allBookings, allTestimonials, allQuests]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts = { Legendary: 0, Elite: 0, Proven: 0, Emerging: 0, Novice: 0, New: 0 };
    userScores.forEach(u => { counts[u.tier.name] = (counts[u.tier.name] || 0) + 1; });
    return counts;
  }, [userScores]);

  // Averages
  const avgScore = userScores.length > 0
    ? Math.round(userScores.reduce((sum, u) => sum + u.score, 0) / userScores.length)
    : 0;

  // Filter + sort
  const filtered = useMemo(() => {
    let list = userScores;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.profile.display_name || '').toLowerCase().includes(q) ||
        (u.profile.handle || '').toLowerCase().includes(q) ||
        (u.profile.user_id || '').toLowerCase().includes(q)
      );
    }
    if (tierFilter !== 'all') {
      list = list.filter(u => u.tier.name === tierFilter);
    }
    if (sortBy === 'score_desc') list = [...list].sort((a, b) => b.score - a.score);
    else if (sortBy === 'score_asc') list = [...list].sort((a, b) => a.score - b.score);
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => (a.profile.display_name || '').localeCompare(b.profile.display_name || ''));
    else if (sortBy === 'missions') list = [...list].sort((a, b) => b.missionsCompleted - a.missionsCompleted);
    return list;
  }, [userScores, search, tierFilter, sortBy]);

  const isLoading = profilesLoading;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <TierSummaryCard icon={Users} label="Total Users" count={userScores.length} total={userScores.length} color="bg-slate-600" />
        <TierSummaryCard icon={TrendingUp} label="Avg Score" count={avgScore} total={100} color="bg-violet-500" />
        <TierSummaryCard icon={Trophy} label="Legendary" count={tierCounts.Legendary} total={userScores.length} color="bg-amber-500" />
        <TierSummaryCard icon={Zap} label="Elite" count={tierCounts.Elite} total={userScores.length} color="bg-violet-500" />
        <TierSummaryCard icon={Shield} label="Proven" count={tierCounts.Proven} total={userScores.length} color="bg-emerald-500" />
        <TierSummaryCard icon={Target} label="Emerging" count={tierCounts.Emerging} total={userScores.length} color="bg-blue-500" />
        <TierSummaryCard icon={Users} label="Novice/New" count={tierCounts.Novice + tierCounts.New} total={userScores.length} color="bg-slate-400" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, handle, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
                <SelectItem value="Proven">Proven</SelectItem>
                <SelectItem value="Emerging">Emerging</SelectItem>
                <SelectItem value="Novice">Novice</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score_desc">Score: High → Low</SelectItem>
                <SelectItem value="score_asc">Score: Low → High</SelectItem>
                <SelectItem value="name_asc">Name: A → Z</SelectItem>
                <SelectItem value="missions">Most Missions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Performance Scores ({filtered.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No users match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="text-left py-2 px-4 font-medium">User</th>
                    <th className="text-center py-2 px-2 font-medium">Score</th>
                    <th className="text-center py-2 px-2 font-medium">Tier</th>
                    <th className="text-center py-2 px-2 font-medium hidden md:table-cell">Missions</th>
                    <th className="text-center py-2 px-2 font-medium hidden md:table-cell">Meetings</th>
                    <th className="text-center py-2 px-2 font-medium hidden lg:table-cell">Quests</th>
                    <th className="text-center py-2 px-2 font-medium hidden lg:table-cell">Testimonials</th>
                    <th className="text-center py-2 px-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <UserRow key={u.profile.id} user={u} rank={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ user, rank }) {
  const { profile, score, tier, missionsCompleted, meetingsCompleted, questsCompleted, testimonialsCount } = user;

  const openProfile = () => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: profile.user_id } }));
  };

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 w-5 text-right shrink-0">#{rank}</span>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
              {(profile.display_name || '?')[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">{profile.display_name || profile.handle}</p>
            <p className="text-[10px] text-slate-400 truncate">@{profile.handle}</p>
          </div>
        </div>
      </td>
      <td className="text-center py-2.5 px-2">
        <div className="flex items-center justify-center gap-1.5">
          <span className={`text-sm font-bold ${tier.color}`}>{score}%</span>
          <div className="w-12 hidden sm:block">
            <Progress value={score} className="h-1.5" />
          </div>
        </div>
      </td>
      <td className="text-center py-2.5 px-2">
        <Badge className={`text-[10px] ${tier.bg} ${tier.color} border ${tier.border}`}>
          {tier.name}
        </Badge>
      </td>
      <td className="text-center py-2.5 px-2 hidden md:table-cell">
        <span className="text-xs text-slate-600">{missionsCompleted}</span>
      </td>
      <td className="text-center py-2.5 px-2 hidden md:table-cell">
        <span className="text-xs text-slate-600">{meetingsCompleted}</span>
      </td>
      <td className="text-center py-2.5 px-2 hidden lg:table-cell">
        <span className="text-xs text-slate-600">{questsCompleted}</span>
      </td>
      <td className="text-center py-2.5 px-2 hidden lg:table-cell">
        <span className="text-xs text-slate-600">{testimonialsCount}</span>
      </td>
      <td className="text-center py-2.5 px-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={openProfile}>
          <ExternalLink className="w-3 h-3" />
          View
        </Button>
      </td>
    </tr>
  );
}
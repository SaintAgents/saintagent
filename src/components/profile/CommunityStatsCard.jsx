import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Users, Star, Target, Award, TrendingUp, 
  Share2, MessageSquare, Calendar, Sparkles, Crown
} from 'lucide-react';
import { AFFILIATE_BADGE_IMAGES, getAffiliateTier } from '@/components/reputation/affiliateBadges';

export default function CommunityStatsCard({ userId, compact = false }) {
  // Fetch user data
  const { data: profiles = [] } = useQuery({
    queryKey: ['profileStats', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId
  });
  const profile = profiles?.[0];

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId
  });

  // Fetch testimonials received
  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonialsReceived', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId }),
    enabled: !!userId
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', userId],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: userId }),
    enabled: !!userId
  });

  // Fetch missions participated
  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', userId],
    queryFn: async () => {
      const allMissions = await base44.entities.Mission.list('-created_date', 200);
      return allMissions.filter(m => m.participant_ids?.includes(userId) || m.creator_id === userId);
    },
    enabled: !!userId
  });

  // Fetch forum posts
  const { data: forumPosts = [] } = useQuery({
    queryKey: ['forumPosts', userId],
    queryFn: () => base44.entities.ForumPost.filter({ author_id: userId }),
    enabled: !!userId
  });

  const paidReferrals = referrals.filter(r => r.status === 'paid').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const affiliateTier = getAffiliateTier(paidReferrals);
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : null;

  // Achievement calculations
  const achievements = [
    { 
      id: 'meetings', 
      label: 'Meetings Master', 
      count: profile?.meetings_completed || 0, 
      target: 10, 
      icon: Calendar,
      color: 'text-blue-600',
      earned: (profile?.meetings_completed || 0) >= 10
    },
    { 
      id: 'referrals', 
      label: 'Community Builder', 
      count: paidReferrals, 
      target: 5, 
      icon: Users,
      color: 'text-emerald-600',
      earned: paidReferrals >= 5
    },
    { 
      id: 'missions', 
      label: 'Mission Ace', 
      count: completedMissions, 
      target: 5, 
      icon: Target,
      color: 'text-violet-600',
      earned: completedMissions >= 5
    },
    { 
      id: 'testimonials', 
      label: 'Highly Rated', 
      count: testimonials.length, 
      target: 3, 
      icon: Star,
      color: 'text-amber-600',
      earned: testimonials.length >= 3
    },
    { 
      id: 'forum', 
      label: 'Active Voice', 
      count: forumPosts.length, 
      target: 5, 
      icon: MessageSquare,
      color: 'text-rose-600',
      earned: forumPosts.length >= 5
    },
  ];

  const earnedCount = achievements.filter(a => a.earned).length;

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Trophy className="w-4 h-4 mx-auto text-amber-500 mb-1" />
          <div className="text-lg font-bold">{badges.length}</div>
          <div className="text-xs text-slate-500">Badges</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Users className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
          <div className="text-lg font-bold">{paidReferrals}</div>
          <div className="text-xs text-slate-500">Referrals</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Target className="w-4 h-4 mx-auto text-violet-500 mb-1" />
          <div className="text-lg font-bold">{completedMissions}</div>
          <div className="text-xs text-slate-500">Missions</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Star className="w-4 h-4 mx-auto text-amber-500 mb-1" />
          <div className="text-lg font-bold">{avgRating || '-'}</div>
          <div className="text-xs text-slate-500">Rating</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#0a0a0a] border dark:border-[#00ff88]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Community Stats & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl">
            <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-400">{badges.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Badges Earned</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
            <Users className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{paidReferrals}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Referrals</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
            <Target className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completedMissions}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Missions Done</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl">
            <Star className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{avgRating || '-'}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Avg Rating</div>
          </div>
        </div>

        {/* Affiliate Status */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={AFFILIATE_BADGE_IMAGES[affiliateTier]} 
                alt={affiliateTier} 
                className="w-12 h-12"
              />
              <div>
                <p className="font-semibold capitalize">{affiliateTier} Affiliate</p>
                <p className="text-sm text-slate-500">
                  {paidReferrals} paid • {pendingReferrals} pending
                </p>
              </div>
            </div>
            <Share2 className="w-5 h-5 text-violet-500" />
          </div>
        </div>

        {/* Achievement Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Achievements
            </h4>
            <Badge className="bg-amber-100 text-amber-700">
              {earnedCount}/{achievements.length} Earned
            </Badge>
          </div>
          <div className="space-y-3">
            {achievements.map(achievement => {
              const Icon = achievement.icon;
              const progress = Math.min(100, (achievement.count / achievement.target) * 100);
              return (
                <div key={achievement.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    achievement.earned 
                      ? 'bg-amber-100 dark:bg-amber-900/30' 
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {achievement.earned ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Icon className={`w-4 h-4 ${achievement.color}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${achievement.earned ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                        {achievement.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {achievement.count}/{achievement.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Contribution */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Community Contribution
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{forumPosts.length}</div>
              <div className="text-xs text-slate-500">Forum Posts</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{testimonials.length}</div>
              <div className="text-xs text-slate-500">Reviews Received</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{profile?.follower_count || 0}</div>
              <div className="text-xs text-slate-500">Followers</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
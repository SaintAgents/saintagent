import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Target, 
  Star, 
  Sparkles, 
  Gift, 
  Flame,
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Users,
  MessageCircle,
  Coins,
  Medal,
  Award,
  RefreshCw,
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeCard from '@/components/gamification/ChallengeCard';
import Leaderboard from '@/components/gamification/Leaderboard';
import BadgesBar from '@/components/badges/BadgesBar';
import BadgesGlossaryModal from '@/components/badges/BadgesGlossaryModal';
import StreakTracker from '@/components/gamification/StreakTracker';
import BackButton from '@/components/hud/BackButton';
import AvailableQuestsPanel from '@/components/quests/AvailableQuestsPanel';

const ACHIEVEMENT_BADGES = [
  { code: 'first_meeting', title: 'First Meeting', description: 'Complete your first meeting', icon: Calendar, points: 50 },
  { code: 'profile_complete', title: 'Profile Complete', description: 'Complete your profile setup', icon: CheckCircle, points: 100 },
  { code: 'first_mission', title: 'Mission Starter', description: 'Join your first mission', icon: Target, points: 75 },
  { code: 'social_butterfly', title: 'Social Butterfly', description: 'Connect with 10 people', icon: Users, points: 150 },
  { code: 'top_mentor', title: 'Top Mentor', description: 'Complete 5 mentorship sessions', icon: Star, points: 250 },
  { code: 'ggg_earner', title: 'GGG Earner', description: 'Earn your first GGG', icon: Coins, points: 50 },
  { code: 'streak_7', title: 'Week Warrior', description: '7-day activity streak', icon: Flame, points: 100 },
  { code: 'streak_30', title: 'Monthly Champion', description: '30-day activity streak', icon: Crown, points: 500 },
  { code: 'market_maker', title: 'Market Maker', description: 'Create 5 marketplace listings', icon: Zap, points: 200 },
  { code: 'influencer', title: 'Influencer', description: 'Reach 100 followers', icon: TrendingUp, points: 300 },
];

export default function Gamification() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [badgeGlossaryOpen, setBadgeGlossaryOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', profile?.user_id],
    queryFn: () => base44.entities.Challenge.filter({ user_id: profile.user_id }, '-created_date', 50),
    enabled: !!profile?.user_id
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetings', profile?.user_id],
    queryFn: () => base44.entities.Meeting.filter({ guest_id: profile.user_id, status: 'completed' }),
    enabled: !!profile?.user_id
  });

  const { data: quests = [] } = useQuery({
    queryKey: ['userQuests', profile?.user_id],
    queryFn: () => base44.entities.Quest.filter({ user_id: profile.user_id }, '-created_date', 50),
    enabled: !!profile?.user_id
  });

  const activeQuests = quests.filter(q => q.status === 'active');

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const dailyChallenges = activeChallenges.filter(c => c.challenge_type === 'daily');
  const weeklyChallenges = activeChallenges.filter(c => c.challenge_type === 'weekly');
  const completedChallenges = challenges.filter(c => c.status === 'claimed');
  const pendingRewards = challenges.filter(c => c.current_count >= c.target_count && c.status === 'active');

  const engagementPoints = profile?.engagement_points || 0;
  const level = Math.floor(engagementPoints / 1000) + 1;
  const levelProgress = (engagementPoints % 1000) / 10;
  const pointsToNextLevel = 1000 - (engagementPoints % 1000);

  // Generate daily challenges
  const generateChallengesMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const { data } = await base44.functions.invoke('generateDailyChallenges', {
        user_id: profile.user_id,
        level,
        badges_count: badges.length,
        meetings_completed: meetings.length
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setIsGenerating(false);
    },
    onError: () => setIsGenerating(false)
  });

  // Achievement progress calculation
  const achievementProgress = ACHIEVEMENT_BADGES.map(ach => {
    const earned = badges.some(b => b.badge_code === ach.code || b.code === ach.code);
    let progress = 0;
    if (ach.code === 'first_meeting') progress = meetings.length > 0 ? 100 : 0;
    if (ach.code === 'profile_complete') progress = profile?.bio ? 100 : 50;
    if (ach.code === 'social_butterfly') progress = Math.min(100, (profile?.follower_count || 0) * 10);
    if (ach.code === 'ggg_earner') progress = (profile?.ggg_balance || 0) > 0 ? 100 : 0;
    if (ach.code === 'influencer') progress = Math.min(100, (profile?.follower_count || 0));
    return { ...ach, earned, progress };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-[#050505] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BackButton />
              <Trophy className="w-8 h-8 text-amber-500" />
              Gamification Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Complete challenges, earn badges, and climb the leaderboard!
            </p>
          </div>
          <Button
            onClick={() => generateChallengesMutation.mutate()}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Challenges
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold text-white">{level}</span>
                    </div>
                    <Flame className="absolute -bottom-1 -right-1 w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Level</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{engagementPoints.toLocaleString()}</p>
                    <p className="text-xs text-amber-600">points</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-amber-600">
                  <span>To Level {level + 1}</span>
                  <span>{pointsToNextLevel} pts</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-600 dark:text-violet-400">Active Challenges</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{activeChallenges.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-800">
                  <Target className="w-6 h-6 text-violet-600 dark:text-violet-300" />
                </div>
              </div>
              {pendingRewards.length > 0 && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mt-3"
                >
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1 animate-pulse">
                    <Gift className="w-3 h-3" />
                    {pendingRewards.length} rewards ready!
                  </Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Badges Earned</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{badges.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-800">
                  <Crown className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-emerald-600 p-0 h-auto"
                onClick={() => setBadgeGlossaryOpen(true)}
              >
                View all badges <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700">
            <CardContent className="pt-4">
              <StreakTracker userId={profile?.user_id} compact />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Zap className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Quests
              {activeQuests.length > 0 && (
                <Badge className="ml-1 bg-violet-600 text-white h-5 px-1.5 text-xs">{activeQuests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Challenges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Daily Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyChallenges.length === 0 ? (
                    <div className="text-center py-6">
                      <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No daily challenges yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-1"
                        onClick={() => generateChallengesMutation.mutate()}
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dailyChallenges.slice(0, 3).map(c => (
                        <ChallengeCard key={c.id} challenge={c} compact />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Challenges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-500" />
                    Weekly Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyChallenges.length === 0 ? (
                    <div className="text-center py-6">
                      <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No weekly challenges yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weeklyChallenges.slice(0, 3).map(c => (
                        <ChallengeCard key={c.id} challenge={c} compact />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-amber-500" />
                    Your Badges
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setBadgeGlossaryOpen(true)}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-6">
                    <Medal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Complete challenges to earn badges!</p>
                  </div>
                ) : (
                  <BadgesBar badges={badges} defaultIfEmpty={false} max={10} />
                )}
              </CardContent>
            </Card>

            {/* Mini Leaderboard */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Top Players This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Leaderboard compact />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <AvailableQuestsPanel profile={profile} activeQuests={activeQuests} />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {/* Pending Rewards */}
            {pendingRewards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-200">
                    <Gift className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">
                      🎉 {pendingRewards.length} reward{pendingRewards.length > 1 ? 's' : ''} ready to claim!
                    </p>
                    <p className="text-sm text-emerald-700">Click the claim button on completed challenges</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">All Challenges</h3>
              <Button
                variant="outline"
                onClick={() => generateChallengesMutation.mutate()}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>

            {activeChallenges.length === 0 ? (
              <Card className="p-8 text-center">
                <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Challenges</h3>
                <p className="text-slate-500 mb-4">Generate new challenges to start earning rewards!</p>
                <Button onClick={() => generateChallengesMutation.mutate()} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Challenges
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map(c => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
              </div>
            )}

            {completedChallenges.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-700 mb-4">Completed ({completedChallenges.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {completedChallenges.slice(0, 6).map(c => (
                    <ChallengeCard key={c.id} challenge={c} compact />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementProgress.map(ach => {
                const Icon = ach.icon;
                return (
                  <Card
                    key={ach.code}
                    className={cn(
                      "transition-all",
                      ach.earned
                        ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          ach.earned ? "bg-amber-100" : "bg-slate-100"
                        )}>
                          <Icon className={cn("w-6 h-6", ach.earned ? "text-amber-600" : "text-slate-400")} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={cn("font-semibold", ach.earned ? "text-amber-900" : "text-slate-700")}>
                              {ach.title}
                            </h4>
                            {ach.earned && (
                              <Badge className="bg-amber-100 text-amber-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Earned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{ach.description}</p>
                          {!ach.earned && ach.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={ach.progress} className="h-1.5" />
                              <p className="text-xs text-slate-400 mt-1">{ach.progress}% complete</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-700 font-medium">+{ach.points} pts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>

      <BadgesGlossaryModal open={badgeGlossaryOpen} onOpenChange={setBadgeGlossaryOpen} />
    </div>
  );
}
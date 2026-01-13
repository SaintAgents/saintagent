import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Target, Shield, Zap, Info, Lock, Sparkles } from 'lucide-react';
import { 
  computeLikelihoodOfPerformance, 
  meetsRankRequirement, 
  getPerformanceNudge,
  canAccessAdvancedAnalytics,
  canAccessOptOutControls
} from './MeritScoreUtils';

export default function PerformanceScoreCard({ profile, showDetailed = false }) {
  // Fetch user's mission history
  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', profile?.user_id],
    queryFn: () => base44.entities.Mission.filter({ 
      participant_ids: { $contains: profile.user_id } 
    }),
    enabled: !!profile?.user_id
  });

  // Fetch completed quests
  const { data: quests = [] } = useQuery({
    queryKey: ['userQuests', profile?.user_id],
    queryFn: () => base44.entities.Quest.filter({ 
      user_id: profile.user_id,
      status: 'completed'
    }),
    enabled: !!profile?.user_id
  });

  // Fetch meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetings', profile?.user_id],
    queryFn: () => base44.entities.Meeting.filter({ 
      $or: [{ host_id: profile.user_id }, { guest_id: profile.user_id }]
    }),
    enabled: !!profile?.user_id
  });

  // Fetch bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookings', profile?.user_id],
    queryFn: () => base44.entities.Booking.filter({ 
      $or: [{ buyer_id: profile.user_id }, { seller_id: profile.user_id }]
    }),
    enabled: !!profile?.user_id
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', profile?.user_id],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: profile.user_id }),
    enabled: !!profile?.user_id
  });

  // Calculate statistics
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const completedQuests = quests.length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const noShowMeetings = meetings.filter(m => m.status === 'no_show').length;
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const avgRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length 
    : 0;

  // Account age
  const createdDate = profile?.created_date ? new Date(profile.created_date) : new Date();
  const accountAgeDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  // Compute LoP score
  const lopResult = computeLikelihoodOfPerformance({
    missionsCompleted: completedMissions,
    questsCompleted: completedQuests,
    meetingsCompleted: completedMeetings,
    bookingsCompleted: completedBookings,
    testimonialsReceived: testimonials.length,
    testimonialsAvgRating: avgRating,
    noShowCount: noShowMeetings,
    cancelledCount: cancelledMeetings,
    rpPoints: profile?.rp_points || 0,
    gggEarned: profile?.ggg_balance || 0,
    accountAgeDays,
    dailyLoginStreak: profile?.daily_login_streak || 0
  });

  const rankCode = profile?.rp_rank_code || profile?.rank_code || 'seeker';
  const canSeeAdvanced = canAccessAdvancedAnalytics(rankCode);
  const canOptOut = canAccessOptOutControls(rankCode);
  const nudge = getPerformanceNudge(profile, 'profile_view');

  if (!showDetailed) {
    // Compact view for match cards, etc.
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              lopResult.tier.bg,
              lopResult.tier.border,
              lopResult.tier.color,
              "border"
            )}>
              <Target className="w-3 h-3" />
              <span>{lopResult.score}%</span>
              <span className="text-[10px] opacity-75">{lopResult.tier.name}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Likelihood of Performance</p>
              <p className="text-xs text-slate-400">{lopResult.insight}</p>
              <p className="text-xs italic text-amber-400">"{nudge}"</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed card view for profiles
  return (
    <Card className={cn(
      "relative overflow-hidden",
      lopResult.tier.border,
      "border-2"
    )}>
      {/* Glow effect based on tier */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        lopResult.score >= 75 ? "bg-gradient-to-br from-amber-400 to-violet-500" :
        lopResult.score >= 50 ? "bg-gradient-to-br from-emerald-400 to-blue-500" :
        "bg-gradient-to-br from-slate-400 to-slate-600"
      )} />

      <CardHeader className="pb-2 relative">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Shield className={cn("w-5 h-5", lopResult.tier.color)} />
            <span>Performance Score</span>
          </div>
          <Badge className={cn(lopResult.tier.bg, lopResult.tier.color, "border", lopResult.tier.border)}>
            {lopResult.tier.name}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Main Score */}
        <div className="text-center">
          <div className={cn("text-4xl font-bold", lopResult.tier.color)}>
            {lopResult.score}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Likelihood of Performance</p>
        </div>

        {/* Progress Bar */}
        <Progress value={lopResult.score} className="h-2" />

        {/* Breakdown - visible for Master+ */}
        {canSeeAdvanced ? (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Completion</span>
              <span className="font-semibold">{lopResult.breakdown.completion}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Reliability</span>
              <span className="font-semibold">{lopResult.breakdown.reliability}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Reputation</span>
              <span className="font-semibold">{lopResult.breakdown.reputation}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Consistency</span>
              <span className="font-semibold">{lopResult.breakdown.consistency}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Detailed breakdown available at Master rank</span>
          </div>
        )}

        {/* Insight */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-amber-50 dark:from-violet-900/20 dark:to-amber-900/20 border border-violet-100 dark:border-violet-800">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{lopResult.insight}</p>
              <p className="text-[10px] italic text-amber-600 dark:text-amber-400 mt-1">"{nudge}"</p>
            </div>
          </div>
        </div>

        {/* Opt-out hint for Sage approach */}
        {!canOptOut && meetsRankRequirement(rankCode, 'practitioner') && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-xs">
            <Info className="w-4 h-4 text-cyan-500" />
            <span className="text-cyan-700 dark:text-cyan-300">
              At Sage rank, you'll unlock visibility controls and data sovereignty options.
            </span>
          </div>
        )}

        {/* Stats Summary */}
        <div className="flex items-center justify-around text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-semibold text-emerald-600">{completedMissions}</div>
            <div className="text-slate-400">Missions</div>
          </div>
          <div>
            <div className="font-semibold text-violet-600">{completedQuests}</div>
            <div className="text-slate-400">Quests</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">{completedMeetings}</div>
            <div className="text-slate-400">Meetings</div>
          </div>
          <div>
            <div className="font-semibold text-amber-600">{avgRating.toFixed(1)}</div>
            <div className="text-slate-400">Avg Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}